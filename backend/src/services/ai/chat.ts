import OpenAI from 'openai'
import { prisma } from '../../lib/prisma'
import { searchSimilarBlocks } from './rag'

const openai = new OpenAI()

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

// 시스템 프롬프트
const SYSTEM_PROMPT = `당신은 숙소 안내서의 AI 컨시어지입니다.
게스트의 질문에 친절하고 정확하게 답변해주세요.
제공된 숙소 정보를 기반으로 답변하고, 정보가 없는 경우 정중히 알려주세요.
답변은 간결하고 친근한 톤으로 해주세요.`

// 스트리밍 채팅
export async function* streamChat(
  guideId: string,
  message: string,
  sessionId?: string
): AsyncGenerator<ChatEvent> {
  const actualSessionId = sessionId || generateSessionId()

  try {
    // 1. 유사 블록 검색
    const similarBlocks = await searchSimilarBlocks(guideId, message, 5)
    const context = similarBlocks
      .filter(b => b.similarity > 0.3)
      .map(b => b.content)
      .join('\n\n')

    const referencedBlockIds = similarBlocks
      .filter(b => b.similarity > 0.3 && b.blockId)
      .map(b => b.blockId as string)

    // 2. 이전 대화 기록 조회 (최근 10개)
    const previousMessages = await prisma.aiConversation.findMany({
      where: { guideId, sessionId: actualSessionId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })

    // 3. 메시지 구성
    const messages: OpenAI.ChatCompletionMessageParam[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'system', content: `숙소 정보:\n${context}` },
      ...previousMessages.reverse().map((m: any) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user', content: message },
    ]

    // 4. 사용자 메시지 저장
    await prisma.aiConversation.create({
      data: {
        guideId,
        sessionId: actualSessionId,
        role: 'user',
        content: message,
      },
    })

    // 5. GPT 스트리밍 응답
    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      stream: true,
      max_tokens: 500,
    })

    let fullResponse = ''

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content
      if (content) {
        fullResponse += content
        yield { type: 'message', data: { chunk: content } }
      }
    }

    // 6. 어시스턴트 응답 저장
    const savedMessage = await prisma.aiConversation.create({
      data: {
        guideId,
        sessionId: actualSessionId,
        role: 'assistant',
        content: fullResponse,
        metadata: { referencedBlockIds },
      },
    })

    // 7. 완료 이벤트
    yield {
      type: 'done',
      data: {
        messageId: savedMessage.id,
        sessionId: actualSessionId,
        referencedBlockIds,
      },
    }
  } catch (error) {
    yield {
      type: 'error',
      data: {
        code: 'CHAT_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
    }
  }
}
