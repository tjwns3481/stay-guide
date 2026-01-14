import { http, HttpResponse, delay } from 'msw'
import { getGuideBySlug, getGuideById } from '../data'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787'

// Mock 대화 데이터
const mockConversations: Record<
  string,
  {
    sessionId: string
    guideId: string
    messages: Array<{
      id: string
      role: 'user' | 'assistant'
      content: string
      metadata: { referencedBlockIds?: string[] } | null
      createdAt: string
    }>
    createdAt: string
    updatedAt: string
  }
> = {
  session_1: {
    sessionId: 'session_1',
    guideId: 'guide_1',
    messages: [
      {
        id: 'msg_1',
        role: 'user',
        content: '체크인 시간이 몇 시인가요?',
        metadata: null,
        createdAt: '2024-01-15T10:00:00Z',
      },
      {
        id: 'msg_2',
        role: 'assistant',
        content: '체크인 시간은 오후 3시(15:00)입니다. 체크아웃은 오전 11시까지입니다.',
        metadata: { referencedBlockIds: ['block_2'] },
        createdAt: '2024-01-15T10:00:05Z',
      },
    ],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:05Z',
  },
}

// AI 응답 생성 헬퍼
function generateAiResponse(message: string, guideId: string): string {
  const guide = getGuideById(guideId)
  if (!guide) return '죄송합니다. 안내서 정보를 찾을 수 없습니다.'

  const lowerMessage = message.toLowerCase()

  if (lowerMessage.includes('체크인') || lowerMessage.includes('입실')) {
    return '체크인 시간은 오후 3시(15:00)입니다. 일찍 도착하시면 짐을 맡기실 수 있습니다.'
  }
  if (lowerMessage.includes('체크아웃') || lowerMessage.includes('퇴실')) {
    return '체크아웃은 오전 11시까지입니다. 늦은 체크아웃이 필요하시면 호스트에게 문의해주세요.'
  }
  if (lowerMessage.includes('와이파이') || lowerMessage.includes('wifi')) {
    return 'Wi-Fi 정보입니다:\n- 네트워크명: JejuPension_5G\n- 비밀번호: welcome123'
  }
  if (lowerMessage.includes('주차')) {
    return '무료 주차가 가능합니다. 2대까지 주차 가능하며, 숙소 앞 지정된 구역에 주차해주세요.'
  }
  if (lowerMessage.includes('주변') || lowerMessage.includes('맛집') || lowerMessage.includes('카페')) {
    return '호스트 추천 장소를 안내해드립니다:\n1. 성산일출봉 카페 - 일출봉이 보이는 오션뷰 카페\n2. 해녀밥상 - 싱싱한 해산물 정식'
  }

  return `안녕하세요! ${guide.accommodationName}에 대해 궁금한 점이 있으시면 편하게 질문해주세요. 체크인/아웃 시간, 와이파이, 주차, 주변 맛집 등에 대해 안내해드릴 수 있습니다.`
}

export const aiHandlers = [
  // POST /api/guides/:guideId/ai/chat - AI 채팅 (SSE 스트리밍)
  http.post(`${API_BASE}/api/guides/:guideId/ai/chat`, async ({ request, params }) => {
    const { guideId } = params
    const guide = getGuideById(guideId as string) || getGuideBySlug(guideId as string)

    if (!guide || !guide.isPublished) {
      return HttpResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: '안내서를 찾을 수 없습니다' },
        },
        { status: 404 }
      )
    }

    const body = (await request.json()) as { message?: string; sessionId?: string }

    if (!body.message || body.message.length === 0) {
      return HttpResponse.json(
        {
          success: false,
          error: { code: 'VALIDATION_ERROR', message: '메시지를 입력해주세요' },
        },
        { status: 400 }
      )
    }

    if (body.message.length > 1000) {
      return HttpResponse.json(
        {
          success: false,
          error: { code: 'VALIDATION_ERROR', message: '메시지는 1000자 이하로 입력해주세요' },
        },
        { status: 400 }
      )
    }

    const response = generateAiResponse(body.message, guide.id)
    const sessionId = body.sessionId || `session_${Date.now()}`
    const messageId = `msg_${Date.now()}`

    // SSE 스트리밍 응답
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        // 응답을 청크로 나누어 전송
        const chunks = response.match(/.{1,20}/g) || [response]

        for (const chunk of chunks) {
          await delay(50)
          const data = JSON.stringify({ chunk })
          controller.enqueue(encoder.encode(`event: message\ndata: ${data}\n\n`))
        }

        // 완료 이벤트
        await delay(100)
        const doneData = JSON.stringify({
          messageId,
          sessionId,
          referencedBlockIds: ['block_2'],
        })
        controller.enqueue(encoder.encode(`event: done\ndata: ${doneData}\n\n`))
        controller.close()
      },
    })

    return new HttpResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  }),

  // GET /api/guides/:guideId/ai/conversations - 대화 기록 목록
  http.get(
    `${API_BASE}/api/guides/:guideId/ai/conversations`,
    async ({ request, params }) => {
      await delay(100)

      const authHeader = request.headers.get('Authorization')
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return HttpResponse.json(
          {
            success: false,
            error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다' },
          },
          { status: 401 }
        )
      }

      const { guideId } = params
      const guide = getGuideById(guideId as string)

      if (!guide) {
        return HttpResponse.json(
          {
            success: false,
            error: { code: 'NOT_FOUND', message: '안내서를 찾을 수 없습니다' },
          },
          { status: 404 }
        )
      }

      if (guide.userId !== 'user_1') {
        return HttpResponse.json(
          {
            success: false,
            error: { code: 'FORBIDDEN', message: '접근 권한이 없습니다' },
          },
          { status: 403 }
        )
      }

      const url = new URL(request.url)
      const page = parseInt(url.searchParams.get('page') || '1')
      const limit = parseInt(url.searchParams.get('limit') || '20')

      const conversations = Object.values(mockConversations).filter(
        (c) => c.guideId === guideId
      )

      const total = conversations.length
      const totalPages = Math.ceil(total / limit)
      const start = (page - 1) * limit
      const items = conversations.slice(start, start + limit)

      return HttpResponse.json({
        success: true,
        data: {
          items,
          meta: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
          },
        },
      })
    }
  ),

  // GET /api/guides/:guideId/ai/conversations/:sessionId - 특정 세션 조회
  http.get(
    `${API_BASE}/api/guides/:guideId/ai/conversations/:sessionId`,
    async ({ request, params }) => {
      await delay(100)

      const authHeader = request.headers.get('Authorization')
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return HttpResponse.json(
          {
            success: false,
            error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다' },
          },
          { status: 401 }
        )
      }

      const { sessionId } = params
      const conversation = mockConversations[sessionId as string]

      if (!conversation) {
        return HttpResponse.json(
          {
            success: false,
            error: { code: 'NOT_FOUND', message: '대화를 찾을 수 없습니다' },
          },
          { status: 404 }
        )
      }

      return HttpResponse.json({ success: true, data: conversation })
    }
  ),

  // DELETE /api/guides/:guideId/ai/conversations/:sessionId - 대화 삭제
  http.delete(
    `${API_BASE}/api/guides/:guideId/ai/conversations/:sessionId`,
    async ({ request, params }) => {
      await delay(100)

      const authHeader = request.headers.get('Authorization')
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return HttpResponse.json(
          {
            success: false,
            error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다' },
          },
          { status: 401 }
        )
      }

      const { guideId } = params
      const guide = getGuideById(guideId as string)

      if (!guide || guide.userId !== 'user_1') {
        return HttpResponse.json(
          {
            success: false,
            error: { code: 'FORBIDDEN', message: '접근 권한이 없습니다' },
          },
          { status: 403 }
        )
      }

      return HttpResponse.json({
        success: true,
        data: { message: '대화가 삭제되었습니다' },
      })
    }
  ),

  // POST /api/guides/:guideId/ai/embed - 임베딩 생성
  http.post(`${API_BASE}/api/guides/:guideId/ai/embed`, async ({ request, params }) => {
    await delay(500)

    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다' },
        },
        { status: 401 }
      )
    }

    const { guideId } = params
    const guide = getGuideById(guideId as string)

    if (!guide) {
      return HttpResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: '안내서를 찾을 수 없습니다' },
        },
        { status: 404 }
      )
    }

    if (guide.userId !== 'user_1') {
      return HttpResponse.json(
        {
          success: false,
          error: { code: 'FORBIDDEN', message: '접근 권한이 없습니다' },
        },
        { status: 403 }
      )
    }

    return HttpResponse.json({
      success: true,
      data: {
        message: '임베딩이 생성되었습니다',
        embeddingsCount: guide.blocks.length,
      },
    })
  }),

  // GET /api/guides/:guideId/ai/stats - AI 사용 통계
  http.get(`${API_BASE}/api/guides/:guideId/ai/stats`, async ({ request, params }) => {
    await delay(100)

    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다' },
        },
        { status: 401 }
      )
    }

    const { guideId } = params
    const guide = getGuideById(guideId as string)

    if (!guide) {
      return HttpResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: '안내서를 찾을 수 없습니다' },
        },
        { status: 404 }
      )
    }

    return HttpResponse.json({
      success: true,
      data: {
        totalConversations: 15,
        totalMessages: 48,
        averageMessagesPerSession: 3.2,
        topQuestions: [
          { question: '체크인 시간이 몇 시인가요?', count: 12 },
          { question: '와이파이 비밀번호가 뭔가요?', count: 8 },
          { question: '주차 가능한가요?', count: 6 },
          { question: '근처 맛집 추천해주세요', count: 5 },
        ],
      },
    })
  }),
]
