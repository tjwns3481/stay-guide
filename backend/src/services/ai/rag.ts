import { prisma } from '../../lib/prisma'
import { generateEmbedding } from './embeddings'

export interface SearchResult {
  blockId: string | null
  content: string
  similarity: number
}

// 유사 블록 검색 (pgvector cosine distance)
export async function searchSimilarBlocks(
  guideId: string,
  query: string,
  limit: number = 5
): Promise<SearchResult[]> {
  const queryEmbedding = await generateEmbedding(query)

  const results = await prisma.$queryRaw<SearchResult[]>`
    SELECT
      block_id as "blockId",
      content,
      1 - (embedding <=> ${queryEmbedding}::vector) as similarity
    FROM guide_embeddings
    WHERE guide_id = ${guideId}
    ORDER BY embedding <=> ${queryEmbedding}::vector
    LIMIT ${limit}
  `

  return results
}
