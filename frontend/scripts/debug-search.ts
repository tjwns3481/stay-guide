import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const OLLAMA_BASE_URL = 'http://localhost:11434'
const OLLAMA_EMBEDDING_MODEL = 'nomic-embed-text'

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch(`${OLLAMA_BASE_URL}/api/embeddings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: OLLAMA_EMBEDDING_MODEL, prompt: text }),
  })
  const data = await response.json()
  return data.embedding
}

function extractKeywords(query: string): string[] {
  const keywords = query
    .toLowerCase()
    .replace(/[?.,!]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 1)

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

function calculateKeywordScore(content: string, keywords: string[]): number {
  const contentLower = content.toLowerCase()
  let matchCount = 0
  const matches: string[] = []

  for (const keyword of keywords) {
    if (contentLower.includes(keyword)) {
      matchCount++
      matches.push(keyword)
    }
  }

  console.log(`     매칭된 키워드: [${matches.join(', ')}] (${matchCount}/${keywords.length})`)
  return keywords.length > 0 ? matchCount / keywords.length : 0
}

async function debugSearch(query: string) {
  console.log(`\n${'='.repeat(60)}`)
  console.log(`🔍 검색어: "${query}"`)
  console.log('='.repeat(60))

  const keywords = extractKeywords(query)
  console.log(`📝 추출된 키워드: [${keywords.join(', ')}]`)

  const queryEmbedding = await generateEmbedding(query)
  console.log(`📊 쿼리 임베딩 생성 완료 (길이: ${queryEmbedding.length})`)

  // 가이드 ID 찾기
  const guide = await prisma.guide.findFirst({
    where: { accommodationName: '해운대 오션뷰 스테이' },
  })

  if (!guide) {
    console.log('❌ 가이드를 찾을 수 없습니다.')
    return
  }

  // 모든 임베딩 조회
  const allResults = await prisma.$queryRaw<{ blockId: string; content: string; similarity: number }[]>`
    SELECT block_id as "blockId", content, 1 - (embedding <=> ${queryEmbedding}::vector) as similarity
    FROM guide_embeddings
    WHERE guide_id = ${guide.id}
  `

  console.log(`\n📋 전체 결과 (${allResults.length}개):`)
  console.log('-'.repeat(60))

  const scoredResults = allResults.map(result => {
    console.log(`\n🔹 콘텐츠: ${result.content.slice(0, 80)}...`)
    console.log(`   벡터 유사도: ${(result.similarity * 100).toFixed(2)}%`)

    const keywordScore = calculateKeywordScore(result.content, keywords)
    console.log(`   키워드 점수: ${(keywordScore * 100).toFixed(2)}%`)

    let hybridScore: number
    if (keywordScore > 0) {
      // 새로운 보너스 방식
      const keywordBonus = 0.25 + keywordScore * 0.15
      hybridScore = result.similarity + keywordBonus
      console.log(`   보너스: +${(keywordBonus * 100).toFixed(2)}%`)
      console.log(`   하이브리드 점수: ${(hybridScore * 100).toFixed(2)}% (키워드 매칭)`)
    } else {
      hybridScore = result.similarity * 0.7
      console.log(`   하이브리드 점수: ${(hybridScore * 100).toFixed(2)}% (벡터만, 30% 감점)`)
    }

    return { ...result, similarity: hybridScore, keywordScore }
  })

  const sorted = scoredResults.sort((a, b) => b.similarity - a.similarity)

  console.log(`\n\n🏆 최종 순위:`)
  console.log('-'.repeat(60))
  sorted.forEach((r, i) => {
    console.log(`${i + 1}. [${(r.similarity * 100).toFixed(1)}%] ${r.content.slice(0, 60)}...`)
  })
}

async function main() {
  console.log('🚀 하이브리드 검색 디버깅\n')

  await debugSearch('체크인 시간이 언제예요?')
  await debugSearch('와이파이 비밀번호 알려주세요')

  console.log('\n\n✅ 디버깅 완료!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
