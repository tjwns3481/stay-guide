import { prisma } from '@/lib/server/prisma'
import { generateEmbedding } from './embeddings'

export interface SearchResult {
  blockId: string | null
  content: string
  similarity: number
  matchType?: 'keyword' | 'vector' | 'hybrid'
}

// 쿼리에서 핵심 키워드 추출
function extractKeywords(query: string): string[] {
  const keywords = query
    .toLowerCase()
    .replace(/[?.,!]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 1)

  // 동의어 확장
  const synonyms: Record<string, string[]> = {
    '체크인': ['입실', '들어가는', '도착'],
    '체크아웃': ['퇴실', '나가는', '출발'],
    '와이파이': ['wifi', '인터넷', '비번', '비밀번호'],
    '주차': ['주차장', '차', '자동차', '파킹'],
    '맛집': ['식당', '음식', '밥', '추천'],
    '가격': ['비용', '요금', '깎아', '할인'],
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

// 키워드 매칭 점수 계산
function calculateKeywordScore(content: string, keywords: string[]): number {
  const contentLower = content.toLowerCase()
  let matchCount = 0

  for (const keyword of keywords) {
    if (contentLower.includes(keyword)) {
      matchCount++
    }
  }

  return keywords.length > 0 ? matchCount / keywords.length : 0
}

// 하이브리드 검색 (키워드 우선 + 벡터 검색)
export async function searchSimilarBlocks(
  guideId: string,
  query: string,
  limit: number = 5
): Promise<SearchResult[]> {
  console.log(`[RAG Search] Starting search for guide: ${guideId}, query: "${query}"`)

  // 1. 키워드 추출
  const keywords = extractKeywords(query)
  console.log(`[RAG Search] Extracted keywords: ${keywords.join(', ')}`)

  // 2. 모든 임베딩 조회 (가이드별로 블록 수가 적으므로)
  console.log('[RAG Search] Generating query embedding...')
  const queryEmbedding = await generateEmbedding(query)
  console.log(`[RAG Search] Query embedding dimension: ${queryEmbedding.length}`)

  const allResults = await prisma.$queryRaw<SearchResult[]>`
    SELECT
      block_id as "blockId",
      content,
      1 - (embedding <=> ${queryEmbedding}::vector) as similarity
    FROM guide_embeddings
    WHERE guide_id = ${guideId}
  `

  // 3. 키워드 우선 스코어링 (키워드 매칭 시 보너스 방식)
  const scoredResults = allResults.map(result => {
    const keywordScore = calculateKeywordScore(result.content, keywords)
    const vectorScore = result.similarity

    // 키워드 매칭이 있으면 벡터 점수에 보너스 추가
    // 키워드 매칭이 없으면 벡터 점수 감점
    let hybridScore: number
    let matchType: 'keyword' | 'vector'

    if (keywordScore > 0) {
      // 키워드 매칭 보너스: 기본 0.25 + 매칭률에 따른 추가 보너스
      // 이렇게 하면 키워드가 일부만 매칭되어도 점수가 오르게 됨
      const keywordBonus = 0.25 + keywordScore * 0.15
      hybridScore = vectorScore + keywordBonus
      matchType = 'keyword'
    } else {
      // 키워드 매칭 없으면 벡터 점수 30% 감점
      hybridScore = vectorScore * 0.7
      matchType = 'vector'
    }

    return {
      ...result,
      similarity: hybridScore,
      matchType,
    }
  })

  // 4. 정렬 및 상위 N개 반환
  return scoredResults
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit)
}

// 순수 벡터 검색 (기존 방식)
export async function searchByVector(
  guideId: string,
  query: string,
  limit: number = 5
): Promise<SearchResult[]> {
  const queryEmbedding = await generateEmbedding(query)

  return prisma.$queryRaw<SearchResult[]>`
    SELECT
      block_id as "blockId",
      content,
      1 - (embedding <=> ${queryEmbedding}::vector) as similarity
    FROM guide_embeddings
    WHERE guide_id = ${guideId}
    ORDER BY embedding <=> ${queryEmbedding}::vector
    LIMIT ${limit}
  `
}
