import OpenAI from 'openai'
import { prisma } from '@/lib/server/prisma'
import { searchSimilarBlocks } from './rag'
import {
  getAIProvider,
  streamOllamaChat,
  OllamaChatMessage,
} from './ollama'

let openai: OpenAI | null = null

function getOpenAI() {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }
  return openai
}

export interface ChatEvent {
  type: 'message' | 'done' | 'error'
  data: {
    chunk?: string
    messageId?: string
    sessionId?: string
    referencedBlockIds?: string[]
    code?: string
    message?: string
  }
}

// 세션 ID 생성
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

// 기본 시스템 프롬프트
const BASE_SYSTEM_PROMPT = `당신은 숙소 안내서의 AI 컨시어지입니다.

## 기본 원칙
- 게스트의 질문에 친절하고 정확하게 답변해주세요.
- 제공된 숙소 정보를 기반으로만 답변하세요.
- 정보가 없는 경우 "해당 정보는 안내서에 없습니다. 호스트에게 직접 문의해주세요."라고 안내하세요.
- 답변은 간결하고 친근한 톤으로 해주세요.
- 숙소와 관련 없는 질문에는 정중히 거절하세요.`

// 호스트 지침을 포함한 시스템 프롬프트 생성
function buildSystemPrompt(hostInstructions?: string | null): string {
  if (!hostInstructions?.trim()) {
    return BASE_SYSTEM_PROMPT
  }

  return `${BASE_SYSTEM_PROMPT}

## 호스트 지침 (반드시 준수)
${hostInstructions}

위 호스트 지침을 최우선으로 따르세요. 지침에 어긋나는 요청은 정중히 거절하세요.`
}

// OpenAI 스트리밍 채팅
async function* streamOpenAIChat(
  messages: OpenAI.ChatCompletionMessageParam[]
): AsyncGenerator<string> {
  const client = getOpenAI()
  const stream = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    messages,
    stream: true,
    max_tokens: 500,
  })

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content
    if (content) {
      yield content
    }
  }
}

// 스트리밍 채팅 (Provider 선택)
export async function* streamChat(
  guideId: string,
  message: string,
  sessionId?: string
): AsyncGenerator<ChatEvent> {
  const actualSessionId = sessionId || generateSessionId()
  const provider = getAIProvider()

  try {
    // 1. 가이드 정보 조회 (AI 지침 포함)
    const guide = await prisma.guide.findUnique({
      where: { id: guideId },
      select: {
        id: true,
        accommodationName: true,
        aiEnabled: true,
        aiInstructions: true,
      },
    })

    if (!guide) {
      yield { type: 'error', data: { code: 'NOT_FOUND', message: '안내서를 찾을 수 없습니다' } }
      return
    }

    if (!guide.aiEnabled) {
      yield { type: 'error', data: { code: 'AI_DISABLED', message: '이 안내서에서는 AI 컨시어지가 비활성화되어 있습니다' } }
      return
    }

    // 2. 유사 블록 검색 (RAG)
    const similarBlocks = await searchSimilarBlocks(guideId, message, 5)
    const context = similarBlocks
      .filter(b => b.similarity > 0.3)
      .map(b => b.content)
      .join('\n\n')

    const referencedBlockIds = similarBlocks
      .filter(b => b.similarity > 0.3 && b.blockId)
      .map(b => b.blockId as string)

    // 3. 이전 대화 기록 조회 (최근 10개)
    const previousMessages = await prisma.aiConversation.findMany({
      where: { guideId, sessionId: actualSessionId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })

    // 4. 사용자 메시지 저장
    await prisma.aiConversation.create({
      data: {
        guideId,
        sessionId: actualSessionId,
        role: 'user',
        content: message,
      },
    })

    // 5. 시스템 프롬프트 구성 (호스트 지침 포함)
    const systemPrompt = buildSystemPrompt(guide.aiInstructions)

    let fullResponse = ''

    // 6. Provider별 스트리밍 처리
    if (provider === 'ollama') {
      // Ollama 사용
      const ollamaMessages: OllamaChatMessage[] = [
        { role: 'system', content: systemPrompt },
        { role: 'system', content: `[${guide.accommodationName}] 숙소 정보:\n${context}` },
        ...previousMessages.reverse().map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
        { role: 'user', content: message },
      ]

      for await (const chunk of streamOllamaChat(ollamaMessages)) {
        fullResponse += chunk
        yield { type: 'message', data: { chunk } }
      }
    } else {
      // OpenAI 사용
      const openaiMessages: OpenAI.ChatCompletionMessageParam[] = [
        { role: 'system', content: systemPrompt },
        { role: 'system', content: `[${guide.accommodationName}] 숙소 정보:\n${context}` },
        ...previousMessages.reverse().map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
        { role: 'user', content: message },
      ]

      for await (const chunk of streamOpenAIChat(openaiMessages)) {
        fullResponse += chunk
        yield { type: 'message', data: { chunk } }
      }
    }

    // 5. 어시스턴트 응답 저장
    const savedMessage = await prisma.aiConversation.create({
      data: {
        guideId,
        sessionId: actualSessionId,
        role: 'assistant',
        content: fullResponse,
        metadata: { referencedBlockIds },
      },
    })

    // 6. 완료 이벤트
    yield {
      type: 'done',
      data: {
        messageId: savedMessage.id,
        sessionId: actualSessionId,
        referencedBlockIds,
      },
    }
  } catch (error) {
    console.error('[AI Chat Error]', error)
    yield {
      type: 'error',
      data: {
        code: 'CHAT_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
    }
  }
}
