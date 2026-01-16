import { z } from 'zod'
import {
  ApiResponseSchema,
  LicensePlanEnum,
  LicenseStatusEnum,
  LicenseFeaturesSchema,
} from './types'

// ============================================
// User Schemas
// ============================================

// 사용자 기본 정보
export const UserSchema = z.object({
  id: z.string(),
  clerkId: z.string(),
  email: z.string().email(),
  name: z.string().nullable(),
  imageUrl: z.string().url().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

// 사용자 프로필 (라이선스 정보 포함)
export const UserProfileSchema = UserSchema.extend({
  license: z
    .object({
      plan: LicensePlanEnum,
      status: LicenseStatusEnum,
      features: LicenseFeaturesSchema,
      expiresAt: z.string().datetime().nullable(),
    })
    .nullable(),
  stats: z.object({
    guidesCount: z.number().int().nonnegative(),
    totalViews: z.number().int().nonnegative(),
    aiChatsCount: z.number().int().nonnegative().optional(),
  }),
})

// ============================================
// API Contracts
// ============================================

/**
 * GET /api/users/me
 * 현재 로그인한 사용자 프로필 조회
 */
export const GetCurrentUserContract = {
  response: ApiResponseSchema(UserProfileSchema),
}

/**
 * PATCH /api/users/me
 * 사용자 프로필 업데이트
 */
export const UpdateUserProfileRequestSchema = z.object({
  name: z.string().min(1).max(50).optional(),
})

export const UpdateUserProfileContract = {
  request: UpdateUserProfileRequestSchema,
  response: ApiResponseSchema(UserSchema),
}

/**
 * DELETE /api/users/me
 * 계정 삭제 (Clerk 계정도 함께 삭제)
 */
export const DeleteUserContract = {
  response: ApiResponseSchema(z.object({ message: z.string() })),
}

/**
 * POST /api/webhooks/clerk
 * Clerk Webhook - 사용자 생성/업데이트/삭제 동기화
 * (서버 내부용, 클라이언트에서 호출하지 않음)
 */
export const ClerkWebhookEventSchema = z.object({
  type: z.enum([
    'user.created',
    'user.updated',
    'user.deleted',
  ]),
  data: z.object({
    id: z.string(),
    email_addresses: z.array(
      z.object({
        email_address: z.string().email(),
      })
    ),
    first_name: z.string().nullable(),
    last_name: z.string().nullable(),
    image_url: z.string().url().nullable(),
  }),
})

// ============================================
// Type Exports
// ============================================

export type User = z.infer<typeof UserSchema>
export type UserProfile = z.infer<typeof UserProfileSchema>
export type UpdateUserProfileRequest = z.infer<typeof UpdateUserProfileRequestSchema>
export type ClerkWebhookEvent = z.infer<typeof ClerkWebhookEventSchema>
