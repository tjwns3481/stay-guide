import { z } from 'zod';

/**
 * API 성공 응답 스키마 생성 헬퍼
 * @example
 * const userResponseSchema = apiSuccessSchema(z.object({ id: z.string(), name: z.string() }));
 */
export const apiSuccessSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    data: dataSchema,
  });

/**
 * API 에러 응답 스키마
 */
export const apiErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z
      .array(
        z.object({
          field: z.string(),
          message: z.string(),
        })
      )
      .optional(),
  }),
});

/**
 * 페이지네이션 메타데이터 스키마
 */
export const paginationMetaSchema = z.object({
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
});

/**
 * 페이지네이션 응답 스키마 생성 헬퍼
 * @example
 * const paginatedUsersSchema = apiPaginatedSchema(z.array(userSchema));
 */
export const apiPaginatedSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    data: dataSchema,
    meta: paginationMetaSchema,
  });

/**
 * 타입 추출
 */
export type ApiSuccess<T> = {
  data: T;
};

export type ApiError = z.infer<typeof apiErrorSchema>;

export type PaginationMeta = z.infer<typeof paginationMetaSchema>;

export type ApiPaginated<T> = {
  data: T;
  meta: PaginationMeta;
};
