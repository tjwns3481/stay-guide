/**
 * HuggingFace Inference API를 사용한 임베딩 생성
 * 모델: sentence-transformers/all-mpnet-base-v2 (768차원)
 */

import { HfInference } from '@huggingface/inference'

let hfClient: HfInference | null = null

function getHfClient(): HfInference {
  if (!hfClient) {
    const apiKey = process.env.HUGGINGFACEHUB_API_KEY
    if (!apiKey) {
      throw new Error(
        'HUGGINGFACEHUB_API_KEY is not set. Get free API key from https://huggingface.co/settings/tokens'
      )
    }
    hfClient = new HfInference(apiKey)
  }
  return hfClient
}

const EMBEDDING_MODEL = 'sentence-transformers/all-mpnet-base-v2'
const EMBEDDING_DIMENSION = 768

/**
 * 단일 텍스트의 임베딩 생성
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const client = getHfClient()

  try {
    const result = await client.featureExtraction({
      model: EMBEDDING_MODEL,
      inputs: text,
    })

    // featureExtraction은 중첩 배열을 반환할 수 있음
    // sentence-transformers 모델은 보통 [768] 형태로 반환
    if (Array.isArray(result)) {
      // 2차원 배열인 경우 (예: [[...768개]])
      if (Array.isArray(result[0])) {
        return result[0] as number[]
      }
      // 1차원 배열인 경우
      return result as number[]
    }

    throw new Error('Unexpected embedding format')
  } catch (error) {
    console.error('[Embedding] Error generating embedding:', error)
    throw error
  }
}

/**
 * 여러 텍스트의 임베딩 배치 생성
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const client = getHfClient()

  if (texts.length === 0) {
    return []
  }

  try {
    // HuggingFace Inference API는 배열 입력을 지원
    const result = await client.featureExtraction({
      model: EMBEDDING_MODEL,
      inputs: texts,
    })

    // 배치 결과 처리
    if (Array.isArray(result)) {
      // 이미 2차원 배열인 경우 (각 텍스트별 임베딩)
      if (Array.isArray(result[0]) && typeof result[0][0] === 'number') {
        return result as number[][]
      }
      // 3차원 배열인 경우 (일부 모델)
      if (Array.isArray(result[0]) && Array.isArray(result[0][0])) {
        return (result as number[][][]).map(r => r[0])
      }
    }

    throw new Error('Unexpected batch embedding format')
  } catch (error) {
    console.error('[Embedding] Error generating batch embeddings:', error)

    // 배치 실패 시 개별 처리로 폴백
    console.log('[Embedding] Falling back to individual embedding generation')
    const embeddings: number[][] = []
    for (const text of texts) {
      try {
        const embedding = await generateEmbedding(text)
        embeddings.push(embedding)
      } catch (e) {
        console.error(`[Embedding] Failed to embed text: ${text.substring(0, 50)}...`)
        throw e
      }
    }
    return embeddings
  }
}

/**
 * 임베딩 차원 반환
 */
export function getEmbeddingDimension(): number {
  return EMBEDDING_DIMENSION
}

/**
 * 임베딩 모델 정보 반환
 */
export function getEmbeddingModel(): string {
  return EMBEDDING_MODEL
}
