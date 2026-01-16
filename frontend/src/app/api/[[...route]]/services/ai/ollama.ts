/**
 * Ollama Client - 로컬 LLM 지원
 *
 * 지원 모델:
 * - Chat: qwen3:8b, llama3.2, mistral 등
 * - Embedding: nomic-embed-text, bge-m3 등
 */

export interface OllamaConfig {
  baseUrl: string
  model: string
  embeddingModel: string
  numCtx: number // context window size
}

export interface OllamaChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface OllamaChatResponse {
  model: string
  message: {
    role: string
    content: string
  }
  done: boolean
}

export interface OllamaEmbeddingResponse {
  embedding: number[]
}

// 기본 설정
export function getOllamaConfig(): OllamaConfig {
  return {
    baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    model: process.env.OLLAMA_MODEL || 'qwen3:8b',
    embeddingModel: process.env.OLLAMA_EMBEDDING_MODEL || 'nomic-embed-text',
    numCtx: parseInt(process.env.OLLAMA_NUM_CTX || '8192'),
  }
}

// AI Provider 타입
export type AIProvider = 'openai' | 'ollama'

export function getAIProvider(): AIProvider {
  const provider = process.env.AI_PROVIDER || 'openai'
  return provider as AIProvider
}

// Ollama 서버 상태 확인
export async function checkOllamaHealth(): Promise<boolean> {
  const config = getOllamaConfig()
  try {
    const response = await fetch(`${config.baseUrl}/api/tags`, {
      method: 'GET',
    })
    return response.ok
  } catch {
    return false
  }
}

// 사용 가능한 모델 목록 조회
export async function listOllamaModels(): Promise<string[]> {
  const config = getOllamaConfig()
  try {
    const response = await fetch(`${config.baseUrl}/api/tags`)
    if (!response.ok) return []
    const data = await response.json()
    return data.models?.map((m: { name: string }) => m.name) || []
  } catch {
    return []
  }
}

// Ollama 스트리밍 채팅
export async function* streamOllamaChat(
  messages: OllamaChatMessage[],
  options?: Partial<OllamaConfig>
): AsyncGenerator<string> {
  const config = { ...getOllamaConfig(), ...options }

  const response = await fetch(`${config.baseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: config.model,
      messages,
      stream: true,
      options: {
        num_ctx: config.numCtx,
      },
    }),
  })

  if (!response.ok) {
    throw new Error(`Ollama API error: ${response.status} ${response.statusText}`)
  }

  const reader = response.body?.getReader()
  if (!reader) throw new Error('No response body')

  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (!line.trim()) continue
      try {
        const data: OllamaChatResponse = JSON.parse(line)
        if (data.message?.content) {
          yield data.message.content
        }
      } catch {
        // JSON 파싱 실패 무시
      }
    }
  }

  // 남은 버퍼 처리
  if (buffer.trim()) {
    try {
      const data: OllamaChatResponse = JSON.parse(buffer)
      if (data.message?.content) {
        yield data.message.content
      }
    } catch {
      // 무시
    }
  }
}

// Ollama 비스트리밍 채팅
export async function ollamaChat(
  messages: OllamaChatMessage[],
  options?: Partial<OllamaConfig>
): Promise<string> {
  const config = { ...getOllamaConfig(), ...options }

  const response = await fetch(`${config.baseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: config.model,
      messages,
      stream: false,
      options: {
        num_ctx: config.numCtx,
      },
    }),
  })

  if (!response.ok) {
    throw new Error(`Ollama API error: ${response.status} ${response.statusText}`)
  }

  const data: OllamaChatResponse = await response.json()
  return data.message?.content || ''
}

// Ollama 임베딩 생성
export async function generateOllamaEmbedding(
  text: string,
  options?: Partial<OllamaConfig>
): Promise<number[]> {
  const config = { ...getOllamaConfig(), ...options }

  const response = await fetch(`${config.baseUrl}/api/embeddings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: config.embeddingModel,
      prompt: text,
    }),
  })

  if (!response.ok) {
    throw new Error(`Ollama Embedding API error: ${response.status} ${response.statusText}`)
  }

  const data: OllamaEmbeddingResponse = await response.json()
  return data.embedding
}

// 배치 임베딩 생성 (여러 텍스트를 한번에)
export async function generateOllamaEmbeddings(
  texts: string[],
  options?: Partial<OllamaConfig>
): Promise<number[][]> {
  // Ollama는 배치 임베딩을 직접 지원하지 않으므로 순차 처리
  const embeddings: number[][] = []
  for (const text of texts) {
    const embedding = await generateOllamaEmbedding(text, options)
    embeddings.push(embedding)
  }
  return embeddings
}
