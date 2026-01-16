import { Hono } from 'hono'
import { streamSSE } from 'hono/streaming'
import { Context } from 'hono'
import { streamChat, getLLMProvider } from '../services/ai-free'
import { prisma } from '@/lib/server/prisma'
import { authMiddleware } from '../middleware/auth'

export const aiRoutes = new Hono()

// ============================================
// Helper: 가이드 소유권 확인
// ============================================
async function verifyGuideOwnership(c: Context, guideId: string): Promise<{ success: true; guide: { id: string; userId: string } } | { success: false; response: Response }> {
  const auth = c.get('auth')

  // 사용자 조회
  const user = await prisma.user.findFirst({
    where: { clerkId: auth.userId },
  })

  if (!user) {
    return {
      success: false,
      response: c.json(
        { success: false, error: { code: 'USER_NOT_FOUND', message: '사용자를 찾을 수 없습니다' } },
        404
      ),
    }
  }

  // 가이드 조회
  const guide = await prisma.guide.findUnique({
    where: { id: guideId },
    select: { id: true, userId: true },
  })

  if (!guide) {
    return {
      success: false,
      response: c.json(
        { success: false, error: { code: 'GUIDE_NOT_FOUND', message: '안내서를 찾을 수 없습니다' } },
        404
      ),
    }
  }

  // 소유권 확인
  if (guide.userId !== user.id) {
    return {
      success: false,
      response: c.json(
        { success: false, error: { code: 'FORBIDDEN', message: '접근 권한이 없습니다' } },
        403
      ),
    }
  }

  return { success: true, guide }
}

// GET /api/ai/status - AI Provider 상태 확인
aiRoutes.get('/status', async (c) => {
  const provider = getLLMProvider()

  return c.json({
    success: true,
    data: {
      provider,
      status: 'configured',
      stack: {
        llm: 'Google Gemini 2.0 Flash (Long Context)',
        method: 'Direct context injection (no RAG)',
      },
      message: `Long Context 방식 사용 중 (RAG 제거됨)`,
    },
  })
})

// POST /api/guides/:guideId/ai/chat - 채팅 (SSE)
aiRoutes.post('/:guideId/ai/chat', async (c) => {
  const guideId = c.req.param('guideId')
  const body = await c.req.json()
  const { message, sessionId } = body

  if (!message) {
    return c.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: '메시지를 입력해주세요' } },
      400
    )
  }

  if (message.length > 1000) {
    return c.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: '메시지는 1000자를 초과할 수 없습니다' } },
      400
    )
  }

  // 가이드 존재 여부 확인
  const guide = await prisma.guide.findUnique({
    where: { id: guideId },
  })

  if (!guide || !guide.isPublished) {
    return c.json(
      { success: false, error: { code: 'NOT_FOUND', message: '발행된 안내서를 찾을 수 없습니다' } },
      404
    )
  }

  return streamSSE(c, async (stream) => {
    for await (const event of streamChat(guideId, message, sessionId)) {
      await stream.writeSSE({
        event: event.type,
        data: JSON.stringify(event.data),
      })
    }
  })
})

// GET /api/guides/:guideId/ai/conversations - 대화 기록 조회 (모든 세션) [호스트 전용]
aiRoutes.get('/:guideId/ai/conversations', authMiddleware, async (c) => {
  const guideId = c.req.param('guideId')

  // 소유권 확인
  const ownership = await verifyGuideOwnership(c, guideId)
  if (!ownership.success) {
    return ownership.response
  }

  const sessionIdQuery = c.req.query('sessionId')
  const page = parseInt(c.req.query('page') || '1')
  const limit = parseInt(c.req.query('limit') || '20')

  const where = sessionIdQuery ? { guideId, sessionId: sessionIdQuery } : { guideId }

  const [conversations, total] = await Promise.all([
    prisma.aiConversation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.aiConversation.count({ where }),
  ])

  return c.json({
    success: true,
    data: {
      items: conversations,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    },
  })
})

// GET /api/guides/:guideId/ai/conversations/:sessionId - 특정 세션의 대화 기록 조회 [호스트 전용]
aiRoutes.get('/:guideId/ai/conversations/:sessionId', authMiddleware, async (c) => {
  const guideId = c.req.param('guideId')
  const sessionId = c.req.param('sessionId')

  // 소유권 확인
  const ownership = await verifyGuideOwnership(c, guideId)
  if (!ownership.success) {
    return ownership.response
  }

  const messages = await prisma.aiConversation.findMany({
    where: { guideId, sessionId },
    orderBy: { createdAt: 'asc' },
  })

  if (messages.length === 0) {
    return c.json(
      { success: false, error: { code: 'NOT_FOUND', message: '대화 기록을 찾을 수 없습니다' } },
      404
    )
  }

  return c.json({
    success: true,
    data: {
      sessionId,
      messages,
    },
  })
})

// DELETE /api/guides/:guideId/ai/conversations/:sessionId - 대화 기록 삭제 [호스트 전용]
aiRoutes.delete('/:guideId/ai/conversations/:sessionId', authMiddleware, async (c) => {
  const guideId = c.req.param('guideId')
  const sessionId = c.req.param('sessionId')

  // 소유권 확인
  const ownership = await verifyGuideOwnership(c, guideId)
  if (!ownership.success) {
    return ownership.response
  }

  const result = await prisma.aiConversation.deleteMany({
    where: { guideId, sessionId },
  })

  if (result.count === 0) {
    return c.json(
      { success: false, error: { code: 'NOT_FOUND', message: '대화 기록을 찾을 수 없습니다' } },
      404
    )
  }

  return c.json({
    success: true,
    data: { message: '대화 기록이 삭제되었습니다', deletedCount: result.count },
  })
})

// GET /api/guides/:guideId/ai/stats - 통계 [호스트 전용]
aiRoutes.get('/:guideId/ai/stats', authMiddleware, async (c) => {
  const guideId = c.req.param('guideId')

  // 소유권 확인
  const ownership = await verifyGuideOwnership(c, guideId)
  if (!ownership.success) {
    return ownership.response
  }

  const [totalConversations, totalMessages] = await Promise.all([
    prisma.aiConversation.groupBy({
      by: ['sessionId'],
      where: { guideId },
      _count: true,
    }),
    prisma.aiConversation.count({ where: { guideId } }),
  ])

  return c.json({
    success: true,
    data: {
      totalConversations: totalConversations.length,
      totalMessages,
      averageMessagesPerSession: totalConversations.length
        ? totalMessages / totalConversations.length
        : 0,
      topQuestions: [], // 추후 구현
    },
  })
})

// GET /api/guides/:guideId/ai/settings - AI 설정 조회 [호스트 전용]
aiRoutes.get('/:guideId/ai/settings', authMiddleware, async (c) => {
  const guideId = c.req.param('guideId')

  // 소유권 확인
  const ownership = await verifyGuideOwnership(c, guideId)
  if (!ownership.success) {
    return ownership.response
  }

  const guide = await prisma.guide.findUnique({
    where: { id: guideId },
    select: {
      id: true,
      aiEnabled: true,
      aiInstructions: true,
    },
  })

  if (!guide) {
    return c.json(
      { success: false, error: { code: 'NOT_FOUND', message: '안내서를 찾을 수 없습니다' } },
      404
    )
  }

  return c.json({
    success: true,
    data: {
      aiEnabled: guide.aiEnabled,
      aiInstructions: guide.aiInstructions,
    },
  })
})

// PUT /api/guides/:guideId/ai/settings - AI 설정 업데이트 [호스트 전용]
aiRoutes.put('/:guideId/ai/settings', authMiddleware, async (c) => {
  const guideId = c.req.param('guideId')

  // 소유권 확인
  const ownership = await verifyGuideOwnership(c, guideId)
  if (!ownership.success) {
    return ownership.response
  }

  const body = await c.req.json()
  const { aiEnabled, aiInstructions } = body

  // 지침 길이 제한 (5000자)
  if (aiInstructions && aiInstructions.length > 5000) {
    return c.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: 'AI 지침은 5000자를 초과할 수 없습니다' } },
      400
    )
  }

  try {
    const updatedGuide = await prisma.guide.update({
      where: { id: guideId },
      data: {
        ...(typeof aiEnabled === 'boolean' && { aiEnabled }),
        ...(aiInstructions !== undefined && { aiInstructions: aiInstructions || null }),
      },
      select: {
        id: true,
        aiEnabled: true,
        aiInstructions: true,
      },
    })

    return c.json({
      success: true,
      data: {
        message: 'AI 설정이 업데이트되었습니다',
        aiEnabled: updatedGuide.aiEnabled,
        aiInstructions: updatedGuide.aiInstructions,
      },
    })
  } catch (error) {
    return c.json(
      { success: false, error: { code: 'UPDATE_ERROR', message: (error as Error).message } },
      500
    )
  }
})
