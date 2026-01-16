/**
 * AI 채팅 서비스 - Long Context Window 활용
 *
 * 변경 이력:
 * - RAG/벡터 검색 방식 제거
 * - 숙소 전체 데이터를 직접 조회하여 프롬프트에 주입
 * - Gemini 2.0 Flash의 Long Context Window 활용
 */

import { prisma } from '@/lib/server/prisma'
import {
  streamLLMResponse,
  buildSystemPrompt,
  formatBlocksForContext,
  getLLMProvider,
  type ChatMessage,
} from './llm'

export interface ChatEvent {
  type: 'message' | 'done' | 'error'
  data: {
    chunk?: string
    messageId?: string
    sessionId?: string
    code?: string
    message?: string
  }
}

/**
 * 세션 ID 생성
 */
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

/**
 * 스트리밍 채팅 (Long Context 방식)
 *
 * 1. 가이드 정보와 모든 블록을 DB에서 조회
 * 2. 블록 데이터를 텍스트로 변환하여 시스템 프롬프트에 포함
 * 3. Gemini 2.0 Flash로 응답 생성
 */
export async function* streamChat(
  guideId: string,
  message: string,
  sessionId?: string
): AsyncGenerator<ChatEvent> {
  const actualSessionId = sessionId || generateSessionId()
  const provider = getLLMProvider()

  console.log(
    `[Chat] Provider: ${provider}, Guide: ${guideId}, Session: ${actualSessionId}`
  )

  try {
    // 1. 가이드 정보와 블록 조회 (단순 DB 조회, 벡터 검색 아님)
    const guide = await prisma.guide.findUnique({
      where: { id: guideId },
      select: {
        id: true,
        accommodationName: true,
        aiEnabled: true,
        aiInstructions: true,
        blocks: {
          where: { isVisible: true },
          orderBy: { order: 'asc' },
          select: {
            id: true,
            type: true,
            content: true,
            isVisible: true,
          },
        },
      },
    })

    if (!guide) {
      yield {
        type: 'error',
        data: { code: 'NOT_FOUND', message: '안내서를 찾을 수 없습니다.' },
      }
      return
    }

    if (!guide.aiEnabled) {
      yield {
        type: 'error',
        data: {
          code: 'AI_DISABLED',
          message: 'AI 컨시어지가 비활성화되어 있습니다.',
        },
      }
      return
    }

    // 2. 블록 데이터를 텍스트로 변환
    console.log(`[Chat] Formatting ${guide.blocks.length} blocks for context`)
    const blocksContext = formatBlocksForContext(
      guide.blocks.map((block) => ({
        type: block.type,
        content: block.content as Record<string, unknown>,
        isVisible: block.isVisible,
      }))
    )

    // 3. 이전 대화 기록 조회 (최근 10개)
    const previousMessages = await prisma.aiConversation.findMany({
      where: { guideId, sessionId: actualSessionId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        role: true,
        content: true,
      },
    })

    // 시간순으로 정렬 (오래된 것부터)
    const chatHistory: ChatMessage[] = previousMessages.reverse().map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }))

    console.log(`[Chat] Using ${chatHistory.length} previous messages for context`)

    // 4. 사용자 메시지 저장
    await prisma.aiConversation.create({
      data: {
        guideId,
        sessionId: actualSessionId,
        role: 'user',
        content: message,
      },
    })

    // 5. 시스템 프롬프트 구성 (숙소 전체 정보 포함)
    const systemPrompt = buildSystemPrompt(
      guide.accommodationName,
      blocksContext,
      guide.aiInstructions
    )

    // 6. LLM 스트리밍 응답
    let fullResponse = ''

    console.log('[Chat] Generating response with Gemini 2.0 Flash...')

    try {
      for await (const chunk of streamLLMResponse(
        systemPrompt,
        message,
        chatHistory
      )) {
        fullResponse += chunk
        yield { type: 'message', data: { chunk } }
      }
    } catch (llmError) {
      const errorMessage =
        llmError instanceof Error ? llmError.message : 'Unknown LLM error'

      // Rate Limit 에러 감지
      const isRateLimit =
        errorMessage.includes('429') ||
        errorMessage.includes('rate limit') ||
        errorMessage.includes('quota') ||
        errorMessage.includes('Resource has been exhausted')

      console.error('[Chat] LLM error:', errorMessage)

      yield {
        type: 'error',
        data: {
          code: isRateLimit ? 'RATE_LIMIT' : 'LLM_ERROR',
          message: isRateLimit
            ? '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.'
            : '응답 생성 중 오류가 발생했습니다. 다시 시도해주세요.',
        },
      }
      return
    }

    // 7. 응답이 비어있는 경우 처리
    if (!fullResponse.trim()) {
      yield {
        type: 'error',
        data: {
          code: 'EMPTY_RESPONSE',
          message: '응답을 생성하지 못했습니다. 다시 시도해주세요.',
        },
      }
      return
    }

    // 8. 응답 저장
    const savedMessage = await prisma.aiConversation.create({
      data: {
        guideId,
        sessionId: actualSessionId,
        role: 'assistant',
        content: fullResponse,
      },
    })

    // 9. 완료 이벤트
    yield {
      type: 'done',
      data: {
        messageId: savedMessage.id,
        sessionId: actualSessionId,
      },
    }

    console.log(`[Chat] Response completed, saved as ${savedMessage.id}`)
  } catch (error) {
    console.error('[Chat] Unexpected error:', error)

    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    yield {
      type: 'error',
      data: {
        code: 'CHAT_ERROR',
        message: `채팅 처리 중 오류가 발생했습니다: ${errorMessage}`,
      },
    }
  }
}

/**
 * Re-export getLLMProvider for routes
 */
export { getLLMProvider } from './llm'
