import { z } from 'zod'
import {
  ApiResponseSchema,
  BlockTypeEnum,
  HeroBlockContentSchema,
  QuickInfoBlockContentSchema,
  AmenitiesBlockContentSchema,
  MapBlockContentSchema,
  HostPickBlockContentSchema,
  NoticeBlockContentSchema,
} from './types'

// ============================================
// Block Schemas
// ============================================

// 블록 기본 정보
export const BlockSchema = z.object({
  id: z.string(),
  guideId: z.string(),
  type: BlockTypeEnum,
  order: z.number().int().nonnegative(),
  content: z.record(z.unknown()),
  isVisible: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

// 블록 타입별 콘텐츠 스키마 맵
export const BlockContentByTypeSchema = {
  hero: HeroBlockContentSchema,
  quick_info: QuickInfoBlockContentSchema,
  amenities: AmenitiesBlockContentSchema,
  map: MapBlockContentSchema,
  host_pick: HostPickBlockContentSchema,
  notice: NoticeBlockContentSchema,
} as const

// ============================================
// API Contracts
// ============================================

/**
 * GET /api/guides/:guideId/blocks
 * 안내서의 블록 목록 조회
 */
export const GetBlocksContract = {
  params: z.object({
    guideId: z.string(),
  }),
  response: ApiResponseSchema(z.array(BlockSchema)),
}

/**
 * POST /api/guides/:guideId/blocks
 * 새 블록 생성
 */
export const CreateBlockRequestSchema = z.object({
  type: BlockTypeEnum,
  content: z.record(z.unknown()),
  order: z.number().int().nonnegative().optional(), // 미입력 시 마지막에 추가
  isVisible: z.boolean().default(true),
})

export const CreateBlockContract = {
  params: z.object({
    guideId: z.string(),
  }),
  request: CreateBlockRequestSchema,
  response: ApiResponseSchema(BlockSchema),
}

/**
 * GET /api/guides/:guideId/blocks/:blockId
 * 블록 상세 조회
 */
export const GetBlockContract = {
  params: z.object({
    guideId: z.string(),
    blockId: z.string(),
  }),
  response: ApiResponseSchema(BlockSchema),
}

/**
 * PATCH /api/guides/:guideId/blocks/:blockId
 * 블록 업데이트
 */
export const UpdateBlockRequestSchema = z.object({
  content: z.record(z.unknown()).optional(),
  isVisible: z.boolean().optional(),
})

export const UpdateBlockContract = {
  params: z.object({
    guideId: z.string(),
    blockId: z.string(),
  }),
  request: UpdateBlockRequestSchema,
  response: ApiResponseSchema(BlockSchema),
}

/**
 * DELETE /api/guides/:guideId/blocks/:blockId
 * 블록 삭제
 */
export const DeleteBlockContract = {
  params: z.object({
    guideId: z.string(),
    blockId: z.string(),
  }),
  response: ApiResponseSchema(z.object({ message: z.string() })),
}

/**
 * PUT /api/guides/:guideId/blocks/reorder
 * 블록 순서 변경
 */
export const ReorderBlocksRequestSchema = z.object({
  blockIds: z.array(z.string()).min(1), // 순서대로 정렬된 블록 ID 배열
})

export const ReorderBlocksContract = {
  params: z.object({
    guideId: z.string(),
  }),
  request: ReorderBlocksRequestSchema,
  response: ApiResponseSchema(
    z.object({
      message: z.string(),
      blocks: z.array(
        z.object({
          id: z.string(),
          order: z.number().int(),
        })
      ),
    })
  ),
}

/**
 * POST /api/guides/:guideId/blocks/:blockId/duplicate
 * 블록 복제
 */
export const DuplicateBlockContract = {
  params: z.object({
    guideId: z.string(),
    blockId: z.string(),
  }),
  response: ApiResponseSchema(BlockSchema),
}

/**
 * PATCH /api/guides/:guideId/blocks/:blockId/visibility
 * 블록 표시/숨김 토글
 */
export const ToggleBlockVisibilityRequestSchema = z.object({
  isVisible: z.boolean(),
})

export const ToggleBlockVisibilityContract = {
  params: z.object({
    guideId: z.string(),
    blockId: z.string(),
  }),
  request: ToggleBlockVisibilityRequestSchema,
  response: ApiResponseSchema(
    z.object({
      id: z.string(),
      isVisible: z.boolean(),
    })
  ),
}

// ============================================
// Type Exports
// ============================================

export type Block = z.infer<typeof BlockSchema>
export type CreateBlockRequest = z.infer<typeof CreateBlockRequestSchema>
export type UpdateBlockRequest = z.infer<typeof UpdateBlockRequestSchema>
export type ReorderBlocksRequest = z.infer<typeof ReorderBlocksRequestSchema>
export type ToggleBlockVisibilityRequest = z.infer<typeof ToggleBlockVisibilityRequestSchema>
