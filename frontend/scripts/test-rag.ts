import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const OLLAMA_BASE_URL = 'http://localhost:11434'
const OLLAMA_MODEL = 'qwen3:8b'
const OLLAMA_EMBEDDING_MODEL = 'nomic-embed-text'

// 블록 타입별 키워드 힌트
const BLOCK_TYPE_HINTS: Record<string, string[]> = {
  hero: ['숙소 소개', '숙소 이름', '숙소명'],
  quick_info: ['체크인', '체크아웃', '입실', '퇴실', '시간', '인원', '최대인원', '주차', '주차장', '주소', '위치'],
  amenities: ['와이파이', 'wifi', '비밀번호', '패스워드', '인터넷', '편의시설', 'TV', '에어컨'],
  map: ['위치', '주소', '찾아오는 길', '지도'],
  host_pick: ['맛집', '추천', '주변', '관광', '카페', '식당', '명소'],
  notice: ['공지', '안내', '주의사항', '규칙', '흡연', '반려동물', '소음'],
}

function blockToText(type: string, content: Record<string, unknown>): string {
  const hints = BLOCK_TYPE_HINTS[type] || []
  const hintPrefix = hints.length > 0 ? `[${hints.join(', ')}] ` : ''

  switch (type) {
    case 'hero':
      return `${hintPrefix}숙소 소개: ${content.title || ''} - ${content.subtitle || ''}`

    case 'quick_info':
      const parts = []
      if (content.checkIn) parts.push(`체크인 시간: ${content.checkIn}`)
      if (content.checkOut) parts.push(`체크아웃 시간: ${content.checkOut}`)
      if (content.maxGuests) parts.push(`최대 인원: ${content.maxGuests}명`)
      if (content.parking) parts.push(`주차: ${content.parking}`)
      if (content.address) parts.push(`주소: ${content.address}`)
      return `${hintPrefix}${parts.join('. ')}`

    case 'amenities':
      const wifi = content.wifi as { ssid?: string; password?: string } | null
      const items = (content.items as { label: string }[]) || []
      const amenityParts = []
      if (wifi?.ssid) amenityParts.push(`와이파이 SSID: ${wifi.ssid}`)
      if (wifi?.password) amenityParts.push(`와이파이 비밀번호: ${wifi.password}`)
      if (items.length > 0) amenityParts.push(`편의시설: ${items.map(i => i.label).join(', ')}`)
      return `${hintPrefix}${amenityParts.join('. ')}`

    case 'map':
      return `${hintPrefix}위치 및 찾아오는 길: ${content.address || ''}`

    case 'host_pick':
      const picks = (content.items as { name: string; description?: string }[]) || []
      const pickTexts = picks.map(p => `${p.name}${p.description ? ` (${p.description})` : ''}`)
      return `${hintPrefix}주변 맛집 및 추천 장소: ${pickTexts.join(', ')}`

    case 'notice':
      return `${hintPrefix}숙소 이용 안내 및 주의사항 - ${content.title || ''}: ${content.content || ''}`

    default:
      return ''
  }
}

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch(`${OLLAMA_BASE_URL}/api/embeddings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: OLLAMA_EMBEDDING_MODEL, prompt: text }),
  })
  const data = await response.json()
  return data.embedding
}

async function embedGuideBlocks(guideId: string) {
  console.log(`\n📦 임베딩 생성 시작`)

  await prisma.$executeRaw`DELETE FROM guide_embeddings WHERE guide_id = ${guideId}`

  const guide = await prisma.guide.findUnique({
    where: { id: guideId },
    include: { blocks: { where: { isVisible: true }, orderBy: { order: 'asc' } } },
  })

  if (!guide) throw new Error('Guide not found')

  console.log(`   숙소: ${guide.accommodationName}`)
  console.log(`   블록 수: ${guide.blocks.length}`)

  let count = 0
  for (const block of guide.blocks) {
    const text = blockToText(block.type, block.content as Record<string, unknown>)
    if (!text.trim()) continue

    console.log(`   [${block.type}] ${text.slice(0, 60)}...`)
    const embedding = await generateEmbedding(text)

    await prisma.$executeRaw`
      INSERT INTO guide_embeddings (id, guide_id, block_id, content, embedding, created_at)
      VALUES (${`emb_${Date.now()}_${count}`}, ${guideId}, ${block.id}, ${text}, ${embedding}::vector, NOW())
    `
    count++
  }

  console.log(`\n   ✅ 임베딩 완료: ${count}개`)
  return count
}

// 키워드 추출 및 동의어 확장
function extractKeywords(query: string): string[] {
  const keywords = query.toLowerCase().replace(/[?.,!]/g, '').split(/\s+/).filter(w => w.length > 1)

  const synonyms: Record<string, string[]> = {
    '체크인': ['입실', '들어가는', '도착'],
    '체크아웃': ['퇴실', '나가는', '출발'],
    '와이파이': ['wifi', '인터넷', '비번', '비밀번호'],
    '주차': ['주차장', '차', '자동차', '파킹'],
    '맛집': ['식당', '음식', '밥', '추천'],
  }

  const expanded = new Set(keywords)
  for (const keyword of keywords) {
    for (const [key, values] of Object.entries(synonyms)) {
      if (keyword.includes(key) || values.some(v => keyword.includes(v))) {
        expanded.add(key)
        values.forEach(v => expanded.add(v))
      }
    }
  }
  return Array.from(expanded)
}

// 키워드 매칭 점수
function calculateKeywordScore(content: string, keywords: string[]): number {
  const contentLower = content.toLowerCase()
  let matchCount = 0
  for (const keyword of keywords) {
    if (contentLower.includes(keyword)) matchCount++
  }
  return keywords.length > 0 ? matchCount / keywords.length : 0
}

// 하이브리드 검색 (키워드 우선)
async function searchSimilar(guideId: string, query: string) {
  const keywords = extractKeywords(query)
  console.log(`   🔑 키워드: [${keywords.join(', ')}]`)

  const queryEmbedding = await generateEmbedding(query)

  // 모든 임베딩 조회
  const allResults = await prisma.$queryRaw<{ blockId: string; content: string; similarity: number }[]>`
    SELECT block_id as "blockId", content, 1 - (embedding <=> ${queryEmbedding}::vector) as similarity
    FROM guide_embeddings
    WHERE guide_id = ${guideId}
  `

  // 키워드 우선 스코어링 (키워드 매칭 시 보너스 방식)
  const scoredResults = allResults.map(r => {
    const keywordScore = calculateKeywordScore(r.content, keywords)
    const vectorScore = r.similarity

    let hybridScore: number
    if (keywordScore > 0) {
      // 키워드 매칭 보너스: 기본 0.25 + 매칭률에 따른 추가 보너스
      const keywordBonus = 0.25 + keywordScore * 0.15
      hybridScore = vectorScore + keywordBonus
    } else {
      // 키워드 매칭 없으면 벡터 점수 30% 감점
      hybridScore = vectorScore * 0.7
    }

    return { ...r, similarity: hybridScore, keywordScore }
  })

  return scoredResults.sort((a, b) => b.similarity - a.similarity).slice(0, 3)
}

async function chat(guideId: string, message: string) {
  console.log(`\n💬 질문: "${message}"`)

  const guide = await prisma.guide.findUnique({
    where: { id: guideId },
    select: { accommodationName: true, aiInstructions: true },
  })

  if (!guide) throw new Error('Guide not found')

  // RAG 검색
  const similar = await searchSimilar(guideId, message)
  console.log(`   🔍 검색 결과:`)
  similar.forEach((r, i) => {
    console.log(`      ${i + 1}. [${(r.similarity * 100).toFixed(1)}%] ${r.content.slice(0, 50)}...`)
  })

  const context = similar.filter(s => s.similarity > 0.3).map(s => s.content).join('\n\n')

  // 시스템 프롬프트
  let systemPrompt = `당신은 숙소 안내서의 AI 컨시어지입니다.

## 기본 원칙
- 게스트의 질문에 친절하고 정확하게 답변해주세요.
- 제공된 숙소 정보를 기반으로만 답변하세요.
- 정보가 없는 경우 "해당 정보는 안내서에 없습니다. 호스트에게 직접 문의해주세요."라고 안내하세요.`

  if (guide.aiInstructions) {
    systemPrompt += `

## 호스트 지침 (반드시 준수)
${guide.aiInstructions}

위 호스트 지침을 최우선으로 따르세요.`
  }

  // Ollama 챗
  const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'system', content: `[${guide.accommodationName}] 숙소 정보:\n${context}` },
        { role: 'user', content: message },
      ],
      stream: false,
    }),
  })

  const data = await response.json()
  console.log(`\n   🤖 AI 응답:`)
  console.log(`   ${data.message?.content || 'No response'}`)
}

async function main() {
  console.log('🚀 RAG 테스트 시작\n')

  // 해운대 오션뷰 스테이 가이드 찾기
  const guide = await prisma.guide.findFirst({
    where: { accommodationName: '해운대 오션뷰 스테이' },
    include: { blocks: true },
  })

  if (!guide) {
    console.log('❌ 테스트 가이드를 찾을 수 없습니다.')
    console.log('   먼저 create-test-data.ts를 실행해주세요.')
    return
  }

  console.log(`📋 테스트 가이드: ${guide.accommodationName}`)
  console.log(`   ID: ${guide.id}`)
  console.log(`   블록 수: ${guide.blocks.length}`)
  console.log(`   AI 지침: ${guide.aiInstructions ? '설정됨' : '없음'}`)

  // 임베딩 생성
  await embedGuideBlocks(guide.id)

  // 테스트 질문들
  console.log('\n' + '='.repeat(60))
  console.log('📝 테스트 시작')
  console.log('='.repeat(60))

  await chat(guide.id, '체크인 시간이 언제예요?')
  await chat(guide.id, '와이파이 비밀번호 알려주세요')
  await chat(guide.id, '주차 가능한가요?')
  await chat(guide.id, '근처 맛집 추천해주세요')
  await chat(guide.id, '가격 좀 깎아주세요')
  await chat(guide.id, '오늘 날씨 어때요?')

  console.log('\n' + '='.repeat(60))
  console.log('✅ 테스트 완료!')
  console.log('='.repeat(60))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
