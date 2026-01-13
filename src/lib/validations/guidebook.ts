import { z } from 'zod';

/**
 * 가이드북 생성/수정 입력 스키마
 */
export const guidebookSchema = z.object({
  slug: z
    .string()
    .min(1, 'Slug는 필수입니다')
    .max(100, 'Slug는 최대 100자까지 가능합니다')
    .regex(/^[a-z0-9-]+$/, 'Slug는 소문자, 숫자, 하이픈(-)만 사용 가능합니다'),
  title: z
    .string()
    .min(1, '제목은 필수입니다')
    .max(200, '제목은 최대 200자까지 가능합니다'),
  description: z.string().optional(),
  coverImage: z.string().url('유효한 URL을 입력해주세요').optional(),
  isPublished: z.boolean().default(false),
});

/**
 * 가이드북 수정 스키마 (부분 업데이트 허용)
 */
export const updateGuidebookSchema = guidebookSchema.partial();

/**
 * 타입 추출
 */
export type GuidebookInput = z.infer<typeof guidebookSchema>;
export type UpdateGuidebookInput = z.infer<typeof updateGuidebookSchema>;
