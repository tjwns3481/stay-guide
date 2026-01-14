import { z } from 'zod'

// ============================================
// Common Types
// ============================================

// API 응답 래퍼
export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z
      .object({
        code: z.string(),
        message: z.string(),
        details: z.record(z.string()).optional(),
      })
      .optional(),
  })

// 페이지네이션 요청
export const PaginationRequestSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
})

// 페이지네이션 메타
export const PaginationMetaSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
  hasNext: z.boolean(),
  hasPrev: z.boolean(),
})

// 페이지네이션 응답
export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(
  itemSchema: T
) =>
  z.object({
    items: z.array(itemSchema),
    meta: PaginationMetaSchema,
  })

// ============================================
// Block Types
// ============================================

export const BlockTypeEnum = z.enum([
  'hero',
  'quick_info',
  'amenities',
  'map',
  'host_pick',
  'notice',
])

// Hero 블록 콘텐츠
export const HeroBlockContentSchema = z.object({
  imageUrl: z.string().url().optional(),
  title: z.string().min(1).max(100),
  subtitle: z.string().max(200).optional(),
  style: z.enum(['full', 'card']).default('full'),
})

// Quick Info 블록 콘텐츠
export const QuickInfoBlockContentSchema = z.object({
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  maxGuests: z.number().int().positive().optional(),
  parking: z.string().optional(),
  address: z.string().optional(),
})

// Amenities 블록 콘텐츠
export const AmenitiesBlockContentSchema = z.object({
  wifi: z
    .object({
      ssid: z.string(),
      password: z.string(),
    })
    .optional(),
  items: z.array(
    z.object({
      icon: z.string(),
      label: z.string(),
      description: z.string().optional(),
    })
  ),
})

// Map 블록 콘텐츠
export const MapBlockContentSchema = z.object({
  address: z.string(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  naverMapUrl: z.string().url().optional(),
  kakaoMapUrl: z.string().url().optional(),
})

// Host Pick 블록 콘텐츠
export const HostPickItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.enum(['restaurant', 'cafe', 'attraction', 'other']),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  mapUrl: z.string().url().optional(),
})

export const HostPickBlockContentSchema = z.object({
  title: z.string().default('호스트 추천'),
  items: z.array(HostPickItemSchema),
})

// Notice 블록 콘텐츠
export const NoticeBlockContentSchema = z.object({
  type: z.enum(['popup', 'banner']).default('banner'),
  title: z.string(),
  content: z.string(),
  isActive: z.boolean().default(true),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
})

// 블록 콘텐츠 유니온
export const BlockContentSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('hero'), data: HeroBlockContentSchema }),
  z.object({ type: z.literal('quick_info'), data: QuickInfoBlockContentSchema }),
  z.object({ type: z.literal('amenities'), data: AmenitiesBlockContentSchema }),
  z.object({ type: z.literal('map'), data: MapBlockContentSchema }),
  z.object({ type: z.literal('host_pick'), data: HostPickBlockContentSchema }),
  z.object({ type: z.literal('notice'), data: NoticeBlockContentSchema }),
])

// ============================================
// Theme Types
// ============================================

export const ThemePresetEnum = z.enum(['emotional', 'modern', 'natural'])

export const ThemeSettingsSchema = z.object({
  preset: ThemePresetEnum.optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  fontFamily: z.string().optional(),
})

// ============================================
// License Types
// ============================================

export const LicensePlanEnum = z.enum(['free', 'monthly', 'biannual', 'annual'])
export const LicenseStatusEnum = z.enum(['active', 'expired', 'cancelled'])

export const LicenseFeaturesSchema = z.object({
  maxGuides: z.number().int().positive(),
  maxBlocksPerGuide: z.number().int().positive(),
  aiConcierge: z.boolean(),
  customTheme: z.boolean(),
  noWatermark: z.boolean(),
  analytics: z.boolean(),
})

// ============================================
// Type Exports
// ============================================

export type PaginationRequest = z.infer<typeof PaginationRequestSchema>
export type PaginationMeta = z.infer<typeof PaginationMetaSchema>
export type BlockType = z.infer<typeof BlockTypeEnum>
export type HeroBlockContent = z.infer<typeof HeroBlockContentSchema>
export type QuickInfoBlockContent = z.infer<typeof QuickInfoBlockContentSchema>
export type AmenitiesBlockContent = z.infer<typeof AmenitiesBlockContentSchema>
export type MapBlockContent = z.infer<typeof MapBlockContentSchema>
export type HostPickItem = z.infer<typeof HostPickItemSchema>
export type HostPickBlockContent = z.infer<typeof HostPickBlockContentSchema>
export type NoticeBlockContent = z.infer<typeof NoticeBlockContentSchema>
export type BlockContent = z.infer<typeof BlockContentSchema>
export type ThemePreset = z.infer<typeof ThemePresetEnum>
export type ThemeSettings = z.infer<typeof ThemeSettingsSchema>
export type LicensePlan = z.infer<typeof LicensePlanEnum>
export type LicenseStatus = z.infer<typeof LicenseStatusEnum>
export type LicenseFeatures = z.infer<typeof LicenseFeaturesSchema>
