/**
 * AI 채팅 서비스 - 대화 컨텍스트 활용
 */

import { prisma } from '@/lib/server/prisma'
import { searchSimilarBlocks } from './vectorstore'
import {
  streamLLMResponse,
  buildSystemPrompt,
  getLLMProvider,
  type ChatMessage,
} from './llm'

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

/**
 * 세션 ID 생성
 */
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

/**
 * 스트리밍 채팅 (대화 컨텍스트 활용)
 */
export async function* streamChat(
  guideId: string,
  message: string,
  sessionId?: string
): AsyncGenerator<ChatEvent> {
  const actualSessionId = sessionId || generateSessionId()
  const provider = getLLMProvider()

  console.log(`[Chat] Provider: ${provider}, Guide: ${guideId}, Session: ${actualSessionId}`)

  try {
    // 1. 가이드 정보 조회
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
      yield {
        type: 'error',
        data: { code: 'NOT_FOUND', message: '안내서를 찾을 수 없습니다.' },
      }
      return
    }

    if (!guide.aiEnabled) {
      yield {
        type: 'error',
        data: { code: 'AI_DISABLED', message: 'AI 컨시어지가 비활성화되어 있습니다.' },
      }
      return
    }

    // 2. 유사 블록 검색 (하이브리드)
    console.log('[Chat] Searching similar blocks...')
    const similarBlocks = await searchSimilarBlocks(guideId, message, 5)
    const context = similarBlocks.map((b) => b.content).join('\n\n')
    const referencedBlockIds = similarBlocks
      .filter((b) => b.blockId)
      .map((b) => b.blockId as string)

    console.log(`[Chat] Found ${similarBlocks.length} relevant blocks`)

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
    const chatHistory: ChatMessage[] = previousMessages
      .reverse()
      .map((m) => ({
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

    // 5. 시스템 프롬프트 구성
    const systemPrompt = buildSystemPrompt(guide.aiInstructions)

    // 6. LLM 스트리밍 응답 (대화 히스토리 포함)
    let fullResponse = ''

    console.log('[Chat] Generating response with LangChain...')

    try {
      for await (const chunk of streamLLMResponse(
        systemPrompt,
        context,
        message,
        guide.accommodationName,
        chatHistory
      )) {
        fullResponse += chunk
        yield { type: 'message', data: { chunk } }
      }
    } catch (llmError) {
      const errorMessage = llmError instanceof Error ? llmError.message : 'Unknown LLM error'

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
        metadata: { referencedBlockIds },
      },
    })

    // 9. 완료 이벤트
    yield {
      type: 'done',
      data: {
        messageId: savedMessage.id,
        sessionId: actualSessionId,
        referencedBlockIds,
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
