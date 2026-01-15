import { Hono } from 'hono'
import { streamSSE } from 'hono/streaming'
import {
  embedGuideBlocks,
  streamChat,
  getLLMProvider,
  BlockData,
} from '../services/ai-free'
import { prisma } from '@/lib/server/prisma'

export const aiRoutes = new Hono()

// GET /api/ai/status - AI Provider 상태 확인
aiRoutes.get('/status', async (c) => {
  const provider = getLLMProvider()

  return c.json({
    success: true,
    data: {
      provider,
      status: 'configured',
      stack: {
        embedding: 'Google text-embedding-004 (768 dims, free tier)',
        vectorDB: 'PostgreSQL + pgvector (Supabase)',
        llm: 'Google Gemini 1.5 Flash (free tier)',
      },
      message: `무료 RAG 스택 사용 중`,
    },
  })
})

// POST /api/guides/:guideId/ai/embed - 임베딩 생성
aiRoutes.post('/:guideId/ai/embed', async (c) => {
  const guideId = c.req.param('guideId')

  try {
    // 가이드의 블록들 조회
    const guide = await prisma.guide.findUnique({
      where: { id: guideId },
      include: { blocks: { where: { isVisible: true }, orderBy: { order: 'asc' } } },
    })

    if (!guide) {
      return c.json(
        { success: false, error: { code: 'NOT_FOUND', message: '안내서를 찾을 수 없습니다' } },
        404
      )
    }

    // 블록 데이터 변환
    const blocks: BlockData[] = guide.blocks.map((block) => ({
      id: block.id,
      type: block.type,
      content: block.content as Record<string, unknown>,
    }))

    // ChromaDB에 임베딩 저장
    const count = await embedGuideBlocks(guideId, blocks)

    return c.json({
      success: true,
      data: { message: '임베딩 생성 완료', embeddingsCount: count },
    })
  } catch (error) {
    console.error('[Embed Error]', error)
    return c.json(
      { success: false, error: { code: 'EMBED_ERROR', message: (error as Error).message } },
      500
    )
  }
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

// GET /api/guides/:guideId/ai/conversations - 대화 기록 조회 (모든 세션)
aiRoutes.get('/:guideId/ai/conversations', async (c) => {
  const guideId = c.req.param('guideId')
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

// GET /api/guides/:guideId/ai/conversations/:sessionId - 특정 세션의 대화 기록 조회
aiRoutes.get('/:guideId/ai/conversations/:sessionId', async (c) => {
  const guideId = c.req.param('guideId')
  const sessionId = c.req.param('sessionId')

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

// DELETE /api/guides/:guideId/ai/conversations/:sessionId - 대화 기록 삭제
aiRoutes.delete('/:guideId/ai/conversations/:sessionId', async (c) => {
  const guideId = c.req.param('guideId')
  const sessionId = c.req.param('sessionId')

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

// GET /api/guides/:guideId/ai/stats - 통계
aiRoutes.get('/:guideId/ai/stats', async (c) => {
  const guideId = c.req.param('guideId')

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

// GET /api/guides/:guideId/ai/settings - AI 설정 조회
aiRoutes.get('/:guideId/ai/settings', async (c) => {
  const guideId = c.req.param('guideId')

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

// PUT /api/guides/:guideId/ai/settings - AI 설정 업데이트
aiRoutes.put('/:guideId/ai/settings', async (c) => {
  const guideId = c.req.param('guideId')
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
