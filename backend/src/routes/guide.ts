import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { authMiddleware } from '../middleware/auth'
import { generateGuideSlug, isValidSlug } from '../lib/slug'

export const guideRoutes = new Hono()

// ============================================
// Schemas
// ============================================

const createGuideSchema = z.object({
  title: z.string().min(1).max(100),
  accommodationName: z.string().min(1).max(100),
  slug: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[a-z0-9-]+$/, '영문 소문자, 숫자, 하이픈만 사용 가능합니다')
    .optional(),
})

const updateGuideSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  accommodationName: z.string().min(1).max(100).optional(),
  slug: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[a-z0-9-]+$/, '영문 소문자, 숫자, 하이픈만 사용 가능합니다')
    .optional(),
  themeId: z.string().nullable().optional(),
  themeSettings: z.record(z.unknown()).nullable().optional(),
})

const publishGuideSchema = z.object({
  isPublished: z.boolean(),
})

const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  isPublished: z.coerce.boolean().optional(),
})

// ============================================
// Helper Functions
// ============================================

function formatGuideResponse(guide: {
  id: string
  userId: string
  slug: string
  title: string
  accommodationName: string
  isPublished: boolean
  themeId: string | null
  themeSettings: unknown
  createdAt: Date
  updatedAt: Date
  blocks?: Array<{
    id: string
    type: string
    order: number
    content: unknown
    isVisible: boolean
  }>
}) {
  return {
    id: guide.id,
    userId: guide.userId,
    slug: guide.slug,
    title: guide.title,
    accommodationName: guide.accommodationName,
    isPublished: guide.isPublished,
    themeId: guide.themeId,
    themeSettings: guide.themeSettings,
    createdAt: guide.createdAt.toISOString(),
    updatedAt: guide.updatedAt.toISOString(),
    ...(guide.blocks && {
      blocks: guide.blocks.map((block) => ({
        id: block.id,
        type: block.type,
        order: block.order,
        content: block.content,
        isVisible: block.isVisible,
      })),
    }),
  }
}

// ============================================
// Routes
// ============================================

// GET /api/guides - 내 안내서 목록 조회
guideRoutes.get('/', authMiddleware, zValidator('query', paginationSchema), async (c) => {
  const auth = c.get('auth')
  const { page, limit, search, isPublished } = c.req.valid('query')

  // 사용자 조회
  const user = await prisma.user.findFirst({
    where: { clerkId: auth.userId },
  })

  if (!user) {
    return c.json(
      {
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: '사용자를 찾을 수 없습니다',
        },
      },
      404
    )
  }

  // 필터 조건 구성
  const where: {
    userId: string
    isPublished?: boolean
    OR?: Array<{ title: { contains: string; mode: 'insensitive' } } | { accommodationName: { contains: string; mode: 'insensitive' } }>
  } = {
    userId: user.id,
  }

  if (typeof isPublished === 'boolean') {
    where.isPublished = isPublished
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { accommodationName: { contains: search, mode: 'insensitive' } },
    ]
  }

  // 총 개수 조회
  const total = await prisma.guide.count({ where })

  // 안내서 목록 조회
  const guides = await prisma.guide.findMany({
    where,
    include: {
      _count: {
        select: { blocks: true },
      },
    },
    orderBy: { updatedAt: 'desc' },
    skip: (page - 1) * limit,
    take: limit,
  })

  return c.json({
    success: true,
    data: {
      items: guides.map((guide) => ({
        id: guide.id,
        slug: guide.slug,
        title: guide.title,
        accommodationName: guide.accommodationName,
        isPublished: guide.isPublished,
        blocksCount: guide._count.blocks,
        viewCount: 0, // TODO: 조회수 추적 구현
        createdAt: guide.createdAt.toISOString(),
        updatedAt: guide.updatedAt.toISOString(),
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  })
})

// POST /api/guides - 새 안내서 생성
guideRoutes.post('/', authMiddleware, zValidator('json', createGuideSchema), async (c) => {
  const auth = c.get('auth')
  const data = c.req.valid('json')

  // 사용자 조회
  const user = await prisma.user.findFirst({
    where: { clerkId: auth.userId },
  })

  if (!user) {
    return c.json(
      {
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: '사용자를 찾을 수 없습니다',
        },
      },
      404
    )
  }

  // 슬러그 처리
  let slug = data.slug || generateGuideSlug()

  // 슬러그 유효성 검사
  if (data.slug && !isValidSlug(data.slug)) {
    return c.json(
      {
        success: false,
        error: {
          code: 'INVALID_SLUG',
          message: '슬러그 형식이 올바르지 않습니다',
          details: {
            slug: '영문 소문자, 숫자, 하이픈만 사용 가능합니다 (3-50자)',
          },
        },
      },
      400
    )
  }

  // 슬러그 중복 체크
  const existingGuide = await prisma.guide.findUnique({
    where: { slug },
  })

  if (existingGuide) {
    return c.json(
      {
        success: false,
        error: {
          code: 'DUPLICATE_SLUG',
          message: '이미 사용 중인 슬러그입니다',
          details: {
            slug: '다른 슬러그를 사용해주세요',
          },
        },
      },
      409
    )
  }

  // 안내서 생성
  const guide = await prisma.guide.create({
    data: {
      userId: user.id,
      title: data.title,
      accommodationName: data.accommodationName,
      slug,
      isPublished: false,
    },
    include: {
      blocks: {
        orderBy: { order: 'asc' },
      },
    },
  })

  return c.json(
    {
      success: true,
      data: formatGuideResponse(guide),
    },
    201
  )
})

// GET /api/guides/slug/:slug - 슬러그로 안내서 조회 (게스트용, 공개된 안내서만)
// NOTE: 이 라우트는 :id 라우트보다 먼저 정의해야 함
guideRoutes.get('/slug/:slug', async (c) => {
  const slug = c.req.param('slug')

  const guide = await prisma.guide.findFirst({
    where: {
      slug,
      isPublished: true,
    },
    include: {
      blocks: {
        where: { isVisible: true },
        orderBy: { order: 'asc' },
      },
    },
  })

  if (!guide) {
    return c.json(
      {
        success: false,
        error: {
          code: 'GUIDE_NOT_FOUND',
          message: '안내서를 찾을 수 없습니다',
        },
      },
      404
    )
  }

  return c.json({
    success: true,
    data: formatGuideResponse(guide),
  })
})

// GET /api/guides/:id - 안내서 상세 조회 (호스트용)
guideRoutes.get('/:id', authMiddleware, async (c) => {
  const auth = c.get('auth')
  const id = c.req.param('id')

  // 사용자 조회
  const user = await prisma.user.findFirst({
    where: { clerkId: auth.userId },
  })

  if (!user) {
    return c.json(
      {
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: '사용자를 찾을 수 없습니다',
        },
      },
      404
    )
  }

  const guide = await prisma.guide.findUnique({
    where: { id },
    include: {
      blocks: {
        orderBy: { order: 'asc' },
      },
    },
  })

  if (!guide) {
    return c.json(
      {
        success: false,
        error: {
          code: 'GUIDE_NOT_FOUND',
          message: '안내서를 찾을 수 없습니다',
        },
      },
      404
    )
  }

  // 본인 안내서인지 확인
  if (guide.userId !== user.id) {
    return c.json(
      {
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: '접근 권한이 없습니다',
        },
      },
      403
    )
  }

  return c.json({
    success: true,
    data: formatGuideResponse(guide),
  })
})

// PATCH /api/guides/:id - 안내서 수정
guideRoutes.patch('/:id', authMiddleware, zValidator('json', updateGuideSchema), async (c) => {
  const auth = c.get('auth')
  const id = c.req.param('id')
  const data = c.req.valid('json')

  // 사용자 조회
  const user = await prisma.user.findFirst({
    where: { clerkId: auth.userId },
  })

  if (!user) {
    return c.json(
      {
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: '사용자를 찾을 수 없습니다',
        },
      },
      404
    )
  }

  const guide = await prisma.guide.findUnique({
    where: { id },
  })

  if (!guide) {
    return c.json(
      {
        success: false,
        error: {
          code: 'GUIDE_NOT_FOUND',
          message: '안내서를 찾을 수 없습니다',
        },
      },
      404
    )
  }

  // 본인 안내서인지 확인
  if (guide.userId !== user.id) {
    return c.json(
      {
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: '접근 권한이 없습니다',
        },
      },
      403
    )
  }

  // 슬러그 변경 시 중복 체크
  if (data.slug && data.slug !== guide.slug) {
    const existingGuide = await prisma.guide.findUnique({
      where: { slug: data.slug },
    })

    if (existingGuide) {
      return c.json(
        {
          success: false,
          error: {
            code: 'DUPLICATE_SLUG',
            message: '이미 사용 중인 슬러그입니다',
          },
        },
        409
      )
    }
  }

  // 업데이트 데이터 구성
  const updateData: {
    title?: string
    accommodationName?: string
    slug?: string
    themeId?: string | null
    themeSettings?: object | typeof import('@prisma/client').Prisma.JsonNull
  } = {}

  if (data.title) updateData.title = data.title
  if (data.accommodationName) updateData.accommodationName = data.accommodationName
  if (data.slug) updateData.slug = data.slug
  if (data.themeId !== undefined) updateData.themeId = data.themeId
  if (data.themeSettings !== undefined) {
    updateData.themeSettings = data.themeSettings === null
      ? (await import('@prisma/client')).Prisma.JsonNull
      : (data.themeSettings as object)
  }

  // 안내서 업데이트
  const updatedGuide = await prisma.guide.update({
    where: { id },
    data: updateData,
    include: {
      blocks: {
        orderBy: { order: 'asc' },
      },
    },
  })

  return c.json({
    success: true,
    data: formatGuideResponse(updatedGuide),
  })
})

// DELETE /api/guides/:id - 안내서 삭제
guideRoutes.delete('/:id', authMiddleware, async (c) => {
  const auth = c.get('auth')
  const id = c.req.param('id')

  // 사용자 조회
  const user = await prisma.user.findFirst({
    where: { clerkId: auth.userId },
  })

  if (!user) {
    return c.json(
      {
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: '사용자를 찾을 수 없습니다',
        },
      },
      404
    )
  }

  const guide = await prisma.guide.findUnique({
    where: { id },
  })

  if (!guide) {
    return c.json(
      {
        success: false,
        error: {
          code: 'GUIDE_NOT_FOUND',
          message: '안내서를 찾을 수 없습니다',
        },
      },
      404
    )
  }

  // 본인 안내서인지 확인
  if (guide.userId !== user.id) {
    return c.json(
      {
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: '접근 권한이 없습니다',
        },
      },
      403
    )
  }

  // 안내서 삭제 (cascade로 블록, 임베딩, 대화 기록도 삭제됨)
  await prisma.guide.delete({
    where: { id },
  })

  return c.json({
    success: true,
    data: {
      message: '안내서가 삭제되었습니다',
    },
  })
})

// POST /api/guides/:id/publish - 안내서 발행/발행 취소
guideRoutes.post('/:id/publish', authMiddleware, zValidator('json', publishGuideSchema), async (c) => {
  const auth = c.get('auth')
  const id = c.req.param('id')
  const { isPublished } = c.req.valid('json')

  // 사용자 조회
  const user = await prisma.user.findFirst({
    where: { clerkId: auth.userId },
  })

  if (!user) {
    return c.json(
      {
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: '사용자를 찾을 수 없습니다',
        },
      },
      404
    )
  }

  const guide = await prisma.guide.findUnique({
    where: { id },
  })

  if (!guide) {
    return c.json(
      {
        success: false,
        error: {
          code: 'GUIDE_NOT_FOUND',
          message: '안내서를 찾을 수 없습니다',
        },
      },
      404
    )
  }

  // 본인 안내서인지 확인
  if (guide.userId !== user.id) {
    return c.json(
      {
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: '접근 권한이 없습니다',
        },
      },
      403
    )
  }

  // 발행 상태 업데이트
  const updatedGuide = await prisma.guide.update({
    where: { id },
    data: { isPublished },
  })

  // 공개 URL 생성
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
  const publicUrl = `${baseUrl}/g/${updatedGuide.slug}`

  return c.json({
    success: true,
    data: {
      id: updatedGuide.id,
      isPublished: updatedGuide.isPublished,
      slug: updatedGuide.slug,
      publicUrl,
    },
  })
})

// POST /api/guides/:id/duplicate - 안내서 복제
guideRoutes.post('/:id/duplicate', authMiddleware, async (c) => {
  const auth = c.get('auth')
  const id = c.req.param('id')

  // 사용자 조회
  const user = await prisma.user.findFirst({
    where: { clerkId: auth.userId },
  })

  if (!user) {
    return c.json(
      {
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: '사용자를 찾을 수 없습니다',
        },
      },
      404
    )
  }

  const originalGuide = await prisma.guide.findUnique({
    where: { id },
    include: {
      blocks: {
        orderBy: { order: 'asc' },
      },
    },
  })

  if (!originalGuide) {
    return c.json(
      {
        success: false,
        error: {
          code: 'GUIDE_NOT_FOUND',
          message: '안내서를 찾을 수 없습니다',
        },
      },
      404
    )
  }

  // 본인 안내서인지 확인
  if (originalGuide.userId !== user.id) {
    return c.json(
      {
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: '접근 권한이 없습니다',
        },
      },
      403
    )
  }

  // 새 슬러그 생성
  const newSlug = generateGuideSlug()

  // Prisma import for JsonNull handling
  const { Prisma } = await import('@prisma/client')

  // 안내서 복제
  const duplicatedGuide = await prisma.guide.create({
    data: {
      userId: user.id,
      title: `${originalGuide.title} (복사본)`,
      accommodationName: originalGuide.accommodationName,
      slug: newSlug,
      isPublished: false,
      themeId: originalGuide.themeId,
      themeSettings: originalGuide.themeSettings === null
        ? Prisma.JsonNull
        : (originalGuide.themeSettings as object),
      blocks: {
        create: originalGuide.blocks.map((block) => ({
          type: block.type,
          order: block.order,
          content: block.content === null
            ? Prisma.JsonNull
            : (block.content as object),
          isVisible: block.isVisible,
        })),
      },
    },
    include: {
      blocks: {
        orderBy: { order: 'asc' },
      },
    },
  })

  return c.json(
    {
      success: true,
      data: formatGuideResponse(duplicatedGuide),
    },
    201
  )
})
