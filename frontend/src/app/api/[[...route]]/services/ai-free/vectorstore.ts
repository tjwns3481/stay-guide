/**
 * 벡터 저장소 서비스 - 하이브리드 검색 (키워드 + 벡터)
 * pgvector를 사용한 유사도 검색
 */

import { prisma } from '@/lib/server/prisma'
import { generateEmbedding, generateEmbeddings } from './embeddings'

// 블록 데이터 타입
export interface BlockData {
  id: string
  type: string
  content: Record<string, unknown>
}

// 검색 결과 타입
export interface SearchResult {
  blockId: string | null
  content: string
  similarity: number
  matchType?: 'keyword' | 'vector' | 'hybrid'
}

// 블록 타입별 텍스트 변환 힌트
const BLOCK_TYPE_HINTS: Record<string, string[]> = {
  hero: ['숙소 소개', '숙소 이름', '숙소명'],
  quick_info: ['체크인', '체크아웃', '입실', '퇴실', '최대 인원', '주차', '주소'],
  amenities: ['와이파이', 'wifi', '비밀번호', '인터넷', '편의시설', '에어컨', '냉장고'],
  map: ['위치', '주소', '찾아오는 길', '지도', '교통'],
  host_pick: ['맛집', '추천', '카페', '주변', '식당', '관광'],
  notice: ['공지', '규칙', '주의사항', '흡연', '반려동물', '파티'],
}

// 동의어 맵
const SYNONYMS: Record<string, string[]> = {
  '체크인': ['입실', '들어가는', '도착', '체크인시간'],
  '체크아웃': ['퇴실', '나가는', '출발', '체크아웃시간'],
  '와이파이': ['wifi', '인터넷', '비번', '비밀번호', '와이파이비번'],
  '주차': ['주차장', '차', '자동차', '파킹', '주차비'],
  '맛집': ['식당', '음식', '밥', '추천', '먹을곳'],
  '가격': ['비용', '요금', '깎아', '할인', '추가요금'],
  '인원': ['사람', '명', '최대인원', '추가인원'],
  '위치': ['주소', '어디', '찾아가는', '가는길'],
  '편의시설': ['시설', '뭐있', '제공', '구비'],
}

/**
 * 키워드 추출 및 동의어 확장
 */
function extractKeywords(query: string): string[] {
  const normalizedQuery = query.toLowerCase().replace(/\s+/g, '')
  const keywords: Set<string> = new Set()

  // 원본 쿼리 단어 추가
  const words = query.split(/\s+/).filter(w => w.length > 1)
  words.forEach(w => keywords.add(w.toLowerCase()))

  // 동의어 확장
  for (const [key, synonyms] of Object.entries(SYNONYMS)) {
    const allTerms = [key, ...synonyms]
    for (const term of allTerms) {
      if (normalizedQuery.includes(term.toLowerCase())) {
        // 해당 그룹의 모든 동의어 추가
        allTerms.forEach(t => keywords.add(t.toLowerCase()))
        break
      }
    }
  }

  return Array.from(keywords)
}

/**
 * 키워드 매칭 점수 계산
 */
function calculateKeywordScore(content: string, keywords: string[]): number {
  if (keywords.length === 0) return 0

  const normalizedContent = content.toLowerCase()
  let matchCount = 0

  for (const keyword of keywords) {
    if (normalizedContent.includes(keyword)) {
      matchCount++
    }
  }

  return matchCount / keywords.length
}

/**
 * 블록을 검색 가능한 텍스트로 변환
 */
export function blockToText(
  type: string,
  content: Record<string, unknown>
): string {
  const hints = BLOCK_TYPE_HINTS[type] || []
  const prefix = hints.length > 0 ? `[${hints.join(', ')}] ` : ''

  switch (type) {
    case 'hero': {
      const title = (content.title as string) || ''
      const subtitle = (content.subtitle as string) || ''
      return `${prefix}숙소 소개: ${title} - ${subtitle}`.trim()
    }

    case 'quick_info': {
      const parts: string[] = []
      if (content.checkIn) parts.push(`체크인 시간: ${content.checkIn}`)
      if (content.checkOut) parts.push(`체크아웃 시간: ${content.checkOut}`)
      if (content.maxGuests) parts.push(`최대 인원: ${content.maxGuests}명`)
      if (content.parking) parts.push(`주차: ${content.parking}`)
      if (content.address) parts.push(`주소: ${content.address}`)
      return `${prefix}${parts.join(', ')}`
    }

    case 'amenities': {
      const wifi = content.wifi as { ssid?: string; password?: string } | null
      const items = (content.items as { label: string }[]) || []
      const amenityParts: string[] = []
      if (wifi?.ssid) amenityParts.push(`와이파이 SSID: ${wifi.ssid}`)
      if (wifi?.password) amenityParts.push(`와이파이 비밀번호: ${wifi.password}`)
      if (items.length > 0) amenityParts.push(`편의시설: ${items.map((i) => i.label).join(', ')}`)
      return `${prefix}${amenityParts.join('. ')}`
    }

    case 'map': {
      const address = (content.address as string) || ''
      const description = (content.description as string) || ''
      return `${prefix}위치 및 찾아오는 길: ${address}. ${description}`.trim()
    }

    case 'host_pick': {
      const picks = (content.items as { name: string; description?: string }[]) || []
      const pickTexts = picks
        .map((p) => `${p.name || ''}${p.description ? ` (${p.description})` : ''}`)
        .join('; ')
      return `${prefix}주변 맛집 및 추천 장소: ${pickTexts}`
    }

    case 'notice': {
      const title = (content.title as string) || ''
      const text = (content.content as string) || ''
      return `${prefix}숙소 이용 안내 및 주의사항 - ${title}: ${text}`
    }

    default:
      return ''
  }
}

/**
 * 가이드의 블록들을 임베딩하여 저장
 */
export async function embedGuideBlocks(
  guideId: string,
  blocks: BlockData[]
): Promise<number> {
  console.log(`[VectorStore] Embedding ${blocks.length} blocks for guide ${guideId}`)

  // 1. 기존 임베딩 삭제
  await prisma.$executeRaw`DELETE FROM guide_embeddings WHERE guide_id = ${guideId}`

  // 2. 유효한 블록만 필터링하고 텍스트 변환
  const validBlocks = blocks
    .map((block) => ({
      ...block,
      text: blockToText(block.type, block.content),
    }))
    .filter((block) => block.text.trim().length > 0)

  if (validBlocks.length === 0) {
    console.log('[VectorStore] No valid blocks to embed')
    return 0
  }

  // 3. 배치 임베딩 생성
  const texts = validBlocks.map((b) => b.text)
  console.log(`[VectorStore] Generating embeddings for ${texts.length} texts`)

  let embeddings: number[][]
  try {
    embeddings = await generateEmbeddings(texts)
  } catch (error) {
    console.error('[VectorStore] Failed to generate embeddings:', error)
    throw error
  }

  // 4. 임베딩 저장
  let savedCount = 0
  for (let i = 0; i < validBlocks.length; i++) {
    const block = validBlocks[i]
    const embedding = embeddings[i]
    const vectorStr = `[${embedding.join(',')}]`
    const embeddingId = `emb_${Date.now()}_${i}`

    try {
      await prisma.$executeRaw`
        INSERT INTO guide_embeddings (id, guide_id, block_id, content, embedding, created_at)
        VALUES (${embeddingId}, ${guideId}, ${block.id}, ${block.text}, ${vectorStr}::vector(768), NOW())
      `
      savedCount++
    } catch (error) {
      console.error(`[VectorStore] Failed to save embedding for block ${block.id}:`, error)
    }
  }

  console.log(`[VectorStore] Saved ${savedCount}/${validBlocks.length} embeddings`)
  return savedCount
}

/**
 * 하이브리드 검색 (키워드 + 벡터)
 */
export async function searchSimilarBlocks(
  guideId: string,
  query: string,
  limit: number = 5
): Promise<SearchResult[]> {
  console.log(`[VectorStore] Hybrid search for guide ${guideId}: "${query}"`)

  // 1. 키워드 추출
  const keywords = extractKeywords(query)
  console.log(`[VectorStore] Extracted keywords: ${keywords.join(', ')}`)

  // 2. 쿼리 임베딩 생성
  const queryEmbedding = await generateEmbedding(query)
  const vectorStr = `[${queryEmbedding.join(',')}]`

  // 3. 벡터 유사도 검색
  interface RawResult {
    blockId: string | null
    content: string
    similarity: number
  }

  const results = await prisma.$queryRaw<RawResult[]>`
    SELECT
      block_id as "blockId",
      content,
      1 - (embedding <=> ${vectorStr}::vector(768)) as similarity
    FROM guide_embeddings
    WHERE guide_id = ${guideId}
  `

  if (results.length === 0) {
    console.log('[VectorStore] No embeddings found for guide')
    return []
  }

  // 4. 하이브리드 스코어링
  const scoredResults: SearchResult[] = results.map((result) => {
    const keywordScore = calculateKeywordScore(result.content, keywords)
    const vectorScore = Number(result.similarity)

    let hybridScore: number
    let matchType: 'keyword' | 'vector' | 'hybrid'

    if (keywordScore > 0) {
      // 키워드 매칭이 있으면 벡터 점수에 보너스 추가
      hybridScore = vectorScore + 0.25 + keywordScore * 0.15
      matchType = keywordScore > 0.5 ? 'keyword' : 'hybrid'
    } else {
      // 키워드 매칭이 없으면 벡터 점수 감점
      hybridScore = vectorScore * 0.7
      matchType = 'vector'
    }

    return {
      blockId: result.blockId,
      content: result.content,
      similarity: hybridScore,
      matchType,
    }
  })

  // 5. 정렬, 필터링, 제한
  const filteredResults = scoredResults
    .sort((a, b) => b.similarity - a.similarity)
    .filter((r) => r.similarity > 0.3)
    .slice(0, limit)

  console.log(`[VectorStore] Found ${filteredResults.length} relevant blocks`)
  return filteredResults
}

/**
 * 순수 벡터 검색 (하이브리드 검색의 백업)
 */
export async function searchByVector(
  guideId: string,
  query: string,
  limit: number = 5
): Promise<SearchResult[]> {
  const queryEmbedding = await generateEmbedding(query)
  const vectorStr = `[${queryEmbedding.join(',')}]`

  interface RawResult {
    blockId: string | null
    content: string
    similarity: number
  }

  const results = await prisma.$queryRaw<RawResult[]>`
    SELECT
      block_id as "blockId",
      content,
      1 - (embedding <=> ${vectorStr}::vector(768)) as similarity
    FROM guide_embeddings
    WHERE guide_id = ${guideId}
    ORDER BY embedding <=> ${vectorStr}::vector(768)
    LIMIT ${limit}
  `

  return results.map((r) => ({
    ...r,
    similarity: Number(r.similarity),
    matchType: 'vector' as const,
  }))
}

/**
 * 가이드의 모든 임베딩 삭제
 */
export async function deleteGuideEmbeddings(guideId: string): Promise<void> {
  await prisma.$executeRaw`DELETE FROM guide_embeddings WHERE guide_id = ${guideId}`
  console.log(`[VectorStore] Deleted all embeddings for guide ${guideId}`)
}
