/**
 * AI 임베딩 및 챗봇 테스트 스크립트
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Ollama 설정
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen3:8b'
const OLLAMA_EMBEDDING_MODEL = process.env.OLLAMA_EMBEDDING_MODEL || 'nomic-embed-text'

// 블록 콘텐츠를 텍스트로 변환
function blockToText(type: string, content: Record<string, unknown>): string {
  switch (type) {
    case 'hero':
      return `${content.title || ''} ${content.subtitle || ''}`
    case 'quick_info':
      return `체크인: ${content.checkIn || ''}, 체크아웃: ${content.checkOut || ''}, 최대인원: ${content.maxGuests || ''}명, 주차: ${content.parking || ''}, 주소: ${content.address || ''}`
    case 'amenities':
      const wifi = content.wifi as { ssid?: string; password?: string } | null
      const items = (content.items as { label: string }[]) || []
      return `와이파이: ${wifi?.ssid || ''}, 편의시설: ${items.map(i => i.label).join(', ')}`
    case 'map':
      return `위치: ${content.address || ''}`
    case 'host_pick':
      const picks = (content.items as { name: string; description?: string }[]) || []
      return `호스트 추천: ${picks.map(p => `${p.name}${p.description ? ` - ${p.description}` : ''}`).join(', ')}`
    case 'notice':
      return `공지: ${content.title || ''} - ${content.content || ''}`
    default:
      return ''
  }
}

// Ollama 임베딩 생성
async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch(`${OLLAMA_BASE_URL}/api/embeddings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_EMBEDDING_MODEL,
      prompt: text,
    }),
  })

  if (!response.ok) {
    throw new Error(`Ollama Embedding API error: ${response.status}`)
  }

  const data = await response.json()
  return data.embedding
}

// 가이드 블록 임베딩 생성
async function embedGuideBlocks(guideId: string): Promise<number> {
  console.log(`\n📦 임베딩 생성 시작: ${guideId}`)

  // 기존 임베딩 삭제
  await prisma.$executeRaw`DELETE FROM guide_embeddings WHERE guide_id = ${guideId}`

  // 가이드의 모든 블록 조회
  const guide = await prisma.guide.findUnique({
    where: { id: guideId },
    include: { blocks: { where: { isVisible: true }, orderBy: { order: 'asc' } } },
  })

  if (!guide) throw new Error('Guide not found')

  console.log(`   숙소명: ${guide.accommodationName}`)
  console.log(`   블록 수: ${guide.blocks.length}`)

  let count = 0
  for (const block of guide.blocks) {
    const text = blockToText(block.type, block.content as Record<string, unknown>)
    if (!text.trim()) continue

    try {
      console.log(`   - [${block.type}] ${text.slice(0, 50)}...`)
      const embedding = await generateEmbedding(text)

      await prisma.$executeRaw`
        INSERT INTO guide_embeddings (id, guide_id, block_id, content, embedding, created_at)
        VALUES (${`emb_${Date.now()}_${count}`}, ${guideId}, ${block.id}, ${text}, ${embedding}::vector, NOW())
      `
      count++
    } catch (error) {
      console.error(`   ❌ 블록 ${block.id} 임베딩 실패:`, error)
    }
  }

  console.log(`   ✅ 임베딩 완료: ${count}개`)
  return count
}

// 유사 블록 검색
async function searchSimilarBlocks(guideId: string, query: string, limit = 5) {
  console.log(`\n🔍 유사 블록 검색: "${query}"`)

  const queryEmbedding = await generateEmbedding(query)

  const results = await prisma.$queryRaw<{ blockId: string; content: string; similarity: number }[]>`
    SELECT
      block_id as "blockId",
      content,
      1 - (embedding <=> ${queryEmbedding}::vector) as similarity
    FROM guide_embeddings
    WHERE guide_id = ${guideId}
    ORDER BY embedding <=> ${queryEmbedding}::vector
    LIMIT ${limit}
  `

  console.log(`   검색 결과:`)
  results.forEach((r, i) => {
    console.log(`   ${i + 1}. [${(r.similarity * 100).toFixed(1)}%] ${r.content.slice(0, 60)}...`)
  })

  return results
}

// Ollama 챗 테스트
async function testChat(guideId: string, message: string) {
  console.log(`\n💬 챗봇 테스트`)
  console.log(`   질문: ${message}`)

  // 가이드 정보 조회
  const guide = await prisma.guide.findUnique({
    where: { id: guideId },
    select: { accommodationName: true, aiInstructions: true },
  })

  if (!guide) throw new Error('Guide not found')

  // 유사 블록 검색
  const similarBlocks = await searchSimilarBlocks(guideId, message, 3)
  const context = similarBlocks
    .filter(b => b.similarity > 0.3)
    .map(b => b.content)
    .join('\n\n')

  // 시스템 프롬프트 구성
  let systemPrompt = `당신은 숙소 안내서의 AI 컨시어지입니다.

## 기본 원칙
- 게스트의 질문에 친절하고 정확하게 답변해주세요.
- 제공된 숙소 정보를 기반으로만 답변하세요.
- 정보가 없는 경우 "해당 정보는 안내서에 없습니다. 호스트에게 직접 문의해주세요."라고 안내하세요.
- 답변은 간결하고 친근한 톤으로 해주세요.`

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

// 테스트 가이드 생성
async function createTestGuide() {
  // 먼저 사용자가 있는지 확인
  let user = await prisma.user.findFirst()
  if (!user) {
    user = await prisma.user.create({
      data: {
        clerkId: 'test_clerk_id',
        email: 'test@example.com',
        name: '테스트 호스트',
      },
    })
  }

  const guide = await prisma.guide.create({
    data: {
      userId: user.id,
      slug: `test-guide-${Date.now()}`,
      title: '해운대 오션뷰 스테이',
      accommodationName: '해운대 오션뷰 스테이',
      isPublished: true,
      blocks: {
        create: [
          {
            type: 'hero',
            order: 0,
            content: {
              title: '해운대 오션뷰 스테이',
              subtitle: '해운대 바다가 한눈에 보이는 프리미엄 숙소',
            },
          },
          {
            type: 'quick_info',
            order: 1,
            content: {
              checkIn: '15:00',
              checkOut: '11:00',
              maxGuests: 4,
              parking: '무료 주차 가능',
              address: '부산광역시 해운대구 해운대해변로 123',
            },
          },
          {
            type: 'amenities',
            order: 2,
            content: {
              wifi: { ssid: 'OceanView_5G', password: 'ocean1234' },
              items: [
                { label: 'TV' },
                { label: '에어컨' },
                { label: '냉장고' },
                { label: '세탁기' },
                { label: '전자레인지' },
              ],
            },
          },
          {
            type: 'host_pick',
            order: 3,
            content: {
              items: [
                { name: '해운대 시장', description: '도보 5분, 신선한 해산물' },
                { name: '더베이101', description: '차량 10분, 야경 맛집' },
                { name: '해리단길', description: '도보 15분, 카페 거리' },
              ],
            },
          },
          {
            type: 'notice',
            order: 4,
            content: {
              title: '숙소 이용 안내',
              content: '조용한 숙소입니다. 밤 10시 이후에는 소음에 주의해 주세요. 흡연은 베란다에서만 가능합니다.',
            },
          },
        ],
      },
    },
    include: { blocks: true },
  })

  return guide
}

// 메인 실행
async function main() {
  console.log('🚀 AI 테스트 스크립트 시작\n')

  // 1. 블록이 있는 가이드 조회
  const guides = await prisma.guide.findMany({
    select: {
      id: true,
      title: true,
      accommodationName: true,
      isPublished: true,
      _count: { select: { blocks: true } }
    },
    orderBy: { createdAt: 'desc' },
  })

  console.log(`📋 가이드 목록 (${guides.length}개):`)
  guides.forEach((g, i) => {
    console.log(`   ${i + 1}. ${g.accommodationName} - ${g.title} (블록: ${g._count.blocks}개, ${g.isPublished ? '발행됨' : '미발행'})`)
  })

  // 블록이 있는 가이드 찾기
  const guidesWithBlocks = guides.filter(g => g._count.blocks > 0)

  if (guidesWithBlocks.length === 0) {
    console.log('\n❌ 블록이 있는 가이드가 없습니다. 테스트 데이터를 생성합니다.')

    // 테스트 가이드 생성
    const testGuide = await createTestGuide()
    console.log(`\n✅ 테스트 가이드 생성 완료: ${testGuide.id}`)
    guidesWithBlocks.push({ ...testGuide, _count: { blocks: 5 } })
  }

  // 2. 블록이 있는 첫 번째 가이드로 테스트
  const testGuide = guidesWithBlocks[0]
  console.log(`\n🎯 테스트 대상: ${testGuide.accommodationName}`)

  // 3. AI 지침 설정
  await prisma.guide.update({
    where: { id: testGuide.id },
    data: {
      aiInstructions: `1. 가격 협상에 대해서는 답변하지 마세요.
2. 체크인 시간 변경 요청은 호스트에게 직접 문의하도록 안내하세요.
3. 한국어로만 답변하세요.
4. 주변 맛집이나 관광지 추천은 숙소 정보에 있는 내용만 안내하세요.`,
    },
  })
  console.log('\n✅ AI 지침 설정 완료')

  // 4. 임베딩 생성
  await embedGuideBlocks(testGuide.id)

  // 5. 챗봇 테스트
  await testChat(testGuide.id, '체크인 시간이 언제예요?')
  await testChat(testGuide.id, '와이파이 비밀번호 알려주세요')
  await testChat(testGuide.id, '가격 좀 깎아주세요')

  console.log('\n✅ 테스트 완료!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
