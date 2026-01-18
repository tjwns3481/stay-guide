import { z } from 'zod'
import {
  ApiResponseSchema,
  PaginationRequestSchema,
  PaginatedResponseSchema,
  ThemeSettingsSchema,
  LicenseFeaturesSchema,
} from './types'

// ============================================
// Guide Schemas
// ============================================

// 안내서 기본 정보
export const GuideSchema = z.object({
  id: z.string(),
  userId: z.string(),
  slug: z.string(),
  title: z.string(),
  accommodationName: z.string(),
  isPublished: z.boolean(),
  themeId: z.string().nullable(),
  themeSettings: ThemeSettingsSchema.nullable(),
  // AI 챗봇 설정
  aiEnabled: z.boolean().default(true),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

// 안내서 목록 아이템 (간략 정보)
export const GuideListItemSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  accommodationName: z.string(),
  isPublished: z.boolean(),
  blocksCount: z.number().int().nonnegative(),
  viewCount: z.number().int().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

// 안내서 상세 정보 (블록 포함)
export const GuideDetailSchema = GuideSchema.extend({
  blocks: z.array(
    z.object({
      id: z.string(),
      type: z.string(),
      order: z.number().int(),
      content: z.record(z.unknown()),
      isVisible: z.boolean(),
    })
  ),
  ownerLicense: z
    .object({
      features: LicenseFeaturesSchema,
    })
    .optional(),
})

// ============================================
// API Contracts
// ============================================

/**
 * GET /api/guides
 * 내 안내서 목록 조회
 */
export const GetGuidesRequestSchema = PaginationRequestSchema.extend({
  search: z.string().optional(),
  isPublished: z.coerce.boolean().optional(),
})

export const GetGuidesContract = {
  request: GetGuidesRequestSchema,
  response: ApiResponseSchema(PaginatedResponseSchema(GuideListItemSchema)),
}

/**
 * POST /api/guides
 * 새 안내서 생성
 */
export const CreateGuideRequestSchema = z.object({
  title: z.string().min(1).max(100),
  accommodationName: z.string().min(1).max(100),
  slug: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[a-z0-9-]+$/, '영문 소문자, 숫자, 하이픈만 사용 가능합니다')
    .optional(), // 미입력 시 자동 생성
})

export const CreateGuideContract = {
  request: CreateGuideRequestSchema,
  response: ApiResponseSchema(GuideSchema),
}

/**
 * GET /api/guides/:id
 * 안내서 상세 조회 (호스트용)
 */
export const GetGuideContract = {
  params: z.object({
    id: z.string(),
  }),
  response: ApiResponseSchema(GuideDetailSchema),
}

/**
 * GET /api/guides/slug/:slug
 * 슬러그로 안내서 조회 (게스트용, 공개된 안내서만)
 */
export const GetGuideBySlugContract = {
  params: z.object({
    slug: z.string(),
  }),
  response: ApiResponseSchema(GuideDetailSchema),
}

/**
 * PATCH /api/guides/:id
 * 안내서 업데이트
 */
export const UpdateGuideRequestSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  accommodationName: z.string().min(1).max(100).optional(),
  slug: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[a-z0-9-]+$/, '영문 소문자, 숫자, 하이픈만 사용 가능합니다')
    .optional(),
  themeId: z.string().nullable().optional(),
  themeSettings: ThemeSettingsSchema.nullable().optional(),
})

export const UpdateGuideContract = {
  params: z.object({
    id: z.string(),
  }),
  request: UpdateGuideRequestSchema,
  response: ApiResponseSchema(GuideSchema),
}

/**
 * DELETE /api/guides/:id
 * 안내서 삭제
 */
export const DeleteGuideContract = {
  params: z.object({
    id: z.string(),
  }),
  response: ApiResponseSchema(z.object({ message: z.string() })),
}

/**
 * POST /api/guides/:id/publish
 * 안내서 발행/발행 취소
 */
export const PublishGuideRequestSchema = z.object({
  isPublished: z.boolean(),
})

export const PublishGuideContract = {
  params: z.object({
    id: z.string(),
  }),
  request: PublishGuideRequestSchema,
  response: ApiResponseSchema(
    z.object({
      id: z.string(),
      isPublished: z.boolean(),
      slug: z.string(),
      publicUrl: z.string().url(),
    })
  ),
}

/**
 * POST /api/guides/:id/duplicate
 * 안내서 복제
 */
export const DuplicateGuideContract = {
  params: z.object({
    id: z.string(),
  }),
  response: ApiResponseSchema(GuideSchema),
}

// ============================================
// Type Exports
// ============================================

export type Guide = z.infer<typeof GuideSchema>
export type GuideListItem = z.infer<typeof GuideListItemSchema>
export type GuideDetail = z.infer<typeof GuideDetailSchema>
export type GetGuidesRequest = z.infer<typeof GetGuidesRequestSchema>
export type CreateGuideRequest = z.infer<typeof CreateGuideRequestSchema>
export type UpdateGuideRequest = z.infer<typeof UpdateGuideRequestSchema>
export type PublishGuideRequest = z.infer<typeof PublishGuideRequestSchema>
