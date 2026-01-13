import { z } from 'zod';

/**
 * 블록 타입별 content 스키마
 */

// Wi-Fi 정보
export const wifiContentSchema = z.object({
  ssid: z.string().min(1, 'SSID는 필수입니다'),
  password: z.string().min(1, '비밀번호는 필수입니다'),
  instructions: z.string().optional(),
});

// 지도/위치 정보
export const mapContentSchema = z.object({
  address: z.string().min(1, '주소는 필수입니다'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  placeId: z.string().optional(),
  instructions: z.string().optional(),
});

// 체크인/아웃 정보
export const checkinContentSchema = z.object({
  checkinTime: z.string().min(1, '체크인 시간은 필수입니다'),
  checkoutTime: z.string().min(1, '체크아웃 시간은 필수입니다'),
  instructions: z.string().optional(),
});

// 추천 정보 (레스토랑, 관광지 등)
export const recommendationContentSchema = z.object({
  category: z.string().min(1, '카테고리는 필수입니다'),
  items: z.array(
    z.object({
      name: z.string().min(1, '이름은 필수입니다'),
      description: z.string().optional(),
      address: z.string().optional(),
      url: z.string().url().optional(),
      imageUrl: z.string().url().optional(),
    })
  ),
});

// 커스텀 정보 (자유 형식)
export const customContentSchema = z.object({
  text: z.string().optional(),
  html: z.string().optional(),
  markdown: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * 블록 content 통합 스키마 (discriminated union)
 */
export const blockContentSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('wifi'), data: wifiContentSchema }),
  z.object({ type: z.literal('map'), data: mapContentSchema }),
  z.object({ type: z.literal('checkin'), data: checkinContentSchema }),
  z.object({ type: z.literal('recommendation'), data: recommendationContentSchema }),
  z.object({ type: z.literal('custom'), data: customContentSchema }),
]);

/**
 * 블록 생성/수정 입력 스키마
 */
export const blockSchema = z.object({
  type: z.enum(['wifi', 'map', 'checkin', 'recommendation', 'custom'], {
    errorMap: () => ({ message: '유효한 블록 타입을 선택해주세요' }),
  }),
  title: z
    .string()
    .min(1, '제목은 필수입니다')
    .max(200, '제목은 최대 200자까지 가능합니다'),
  content: z.union([
    wifiContentSchema,
    mapContentSchema,
    checkinContentSchema,
    recommendationContentSchema,
    customContentSchema,
  ]),
  order: z.number().int().min(0, '순서는 0 이상이어야 합니다').default(0),
  isVisible: z.boolean().default(true),
});

/**
 * 블록 수정 스키마 (부분 업데이트 허용)
 */
export const updateBlockSchema = blockSchema.partial();

/**
 * 타입 추출
 */
export type WifiContent = z.infer<typeof wifiContentSchema>;
export type MapContent = z.infer<typeof mapContentSchema>;
export type CheckinContent = z.infer<typeof checkinContentSchema>;
export type RecommendationContent = z.infer<typeof recommendationContentSchema>;
export type CustomContent = z.infer<typeof customContentSchema>;
export type BlockContent = z.infer<typeof blockContentSchema>;
export type BlockInput = z.infer<typeof blockSchema>;
export type UpdateBlockInput = z.infer<typeof updateBlockSchema>;
