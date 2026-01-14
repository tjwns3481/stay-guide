import { z } from 'zod'
import { ApiResponseSchema, PaginationRequestSchema, PaginatedResponseSchema } from './types'

// ============================================
// AI Chat Schemas
// ============================================

// 채팅 메시지
export const ChatMessageSchema = z.object({
  id: z.string(),
  role: z.enum(['user', 'assistant']),
  content: z.string(),
  metadata: z
    .object({
      referencedBlockIds: z.array(z.string()).optional(),
      processingTime: z.number().optional(),
    })
    .nullable(),
  createdAt: z.string().datetime(),
})

// 대화 세션
export const ConversationSessionSchema = z.object({
  sessionId: z.string(),
  guideId: z.string(),
  messages: z.array(ChatMessageSchema),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

// ============================================
// API Contracts
// ============================================

/**
 * POST /api/guides/:guideId/ai/chat
 * AI 컨시어지 채팅 (스트리밍 응답)
 *
 * 응답: Server-Sent Events (SSE)
 * - event: message, data: { chunk: string }
 * - event: done, data: { messageId: string, referencedBlockIds: string[] }
 * - event: error, data: { code: string, message: string }
 */
export const AiChatRequestSchema = z.object({
  message: z.string().min(1).max(1000),
  sessionId: z.string().optional(), // 미입력 시 새 세션 생성
})

export const AiChatContract = {
  params: z.object({
    guideId: z.string(),
  }),
  request: AiChatRequestSchema,
  // SSE 스트리밍 응답이므로 response 스키마 대신 이벤트 타입 정의
  streamEvents: {
    message: z.object({
      chunk: z.string(),
    }),
    done: z.object({
      messageId: z.string(),
      sessionId: z.string(),
      referencedBlockIds: z.array(z.string()),
    }),
    error: z.object({
      code: z.string(),
      message: z.string(),
    }),
  },
}

/**
 * GET /api/guides/:guideId/ai/conversations
 * 대화 기록 조회 (호스트용)
 */
export const GetConversationsRequestSchema = PaginationRequestSchema.extend({
  sessionId: z.string().optional(),
})

export const GetConversationsContract = {
  params: z.object({
    guideId: z.string(),
  }),
  request: GetConversationsRequestSchema,
  response: ApiResponseSchema(PaginatedResponseSchema(ConversationSessionSchema)),
}

/**
 * GET /api/guides/:guideId/ai/conversations/:sessionId
 * 특정 세션의 대화 기록 조회
 */
export const GetConversationContract = {
  params: z.object({
    guideId: z.string(),
    sessionId: z.string(),
  }),
  response: ApiResponseSchema(ConversationSessionSchema),
}

/**
 * DELETE /api/guides/:guideId/ai/conversations/:sessionId
 * 대화 기록 삭제
 */
export const DeleteConversationContract = {
  params: z.object({
    guideId: z.string(),
    sessionId: z.string(),
  }),
  response: ApiResponseSchema(z.object({ message: z.string() })),
}

/**
 * POST /api/guides/:guideId/ai/embed
 * 안내서 임베딩 생성/업데이트 (발행 시 자동 호출)
 */
export const CreateEmbeddingsContract = {
  params: z.object({
    guideId: z.string(),
  }),
  response: ApiResponseSchema(
    z.object({
      message: z.string(),
      embeddingsCount: z.number().int().nonnegative(),
    })
  ),
}

/**
 * GET /api/guides/:guideId/ai/stats
 * AI 컨시어지 사용 통계 (호스트용)
 */
export const GetAiStatsContract = {
  params: z.object({
    guideId: z.string(),
  }),
  response: ApiResponseSchema(
    z.object({
      totalConversations: z.number().int().nonnegative(),
      totalMessages: z.number().int().nonnegative(),
      averageMessagesPerSession: z.number().nonnegative(),
      topQuestions: z.array(
        z.object({
          question: z.string(),
          count: z.number().int().positive(),
        })
      ),
    })
  ),
}

// ============================================
// Type Exports
// ============================================

export type ChatMessage = z.infer<typeof ChatMessageSchema>
export type ConversationSession = z.infer<typeof ConversationSessionSchema>
export type AiChatRequest = z.infer<typeof AiChatRequestSchema>
export type GetConversationsRequest = z.infer<typeof GetConversationsRequestSchema>
