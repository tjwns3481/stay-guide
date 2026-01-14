import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { authMiddleware } from '../middleware/auth'

const userRoutes = new Hono()

// 모든 user 라우트에 인증 미들웨어 적용
userRoutes.use('/*', authMiddleware)

// 이름 업데이트 스키마
const updateUserSchema = z.object({
  name: z.string().min(1, '이름은 필수입니다').max(50, '이름은 50자 이하여야 합니다'),
})

/**
 * GET /api/users/me
 * 현재 로그인한 사용자 프로필 조회
 */
userRoutes.get('/me', async (c) => {
  const auth = c.get('auth')

  try {
    const user = await prisma.user.findFirst({
      where: { clerkId: auth.userId },
      include: {
        licenses: {
          where: { status: 'active' },
          orderBy: { expiresAt: 'desc' },
          take: 1,
        },
        _count: {
          select: { guides: true },
        },
      },
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

    // 활성 라이선스 정보
    const activeLicense = user.licenses[0]
    const license = activeLicense
      ? {
          plan: activeLicense.plan,
          status: activeLicense.status,
          expiresAt: activeLicense.expiresAt?.toISOString() || null,
          features: activeLicense.features as Record<string, boolean>,
        }
      : {
          plan: 'free',
          status: 'active',
          expiresAt: null,
          features: {
            maxGuides: 1,
            aiChat: false,
            customTheme: false,
            noWatermark: false,
          },
        }

    // 통계 정보
    const stats = {
      totalGuides: user._count.guides,
    }

    return c.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        imageUrl: user.imageUrl,
        createdAt: user.createdAt.toISOString(),
        license,
        stats,
      },
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    return c.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '사용자 정보를 가져오는데 실패했습니다',
        },
      },
      500
    )
  }
})

/**
 * PATCH /api/users/me
 * 현재 로그인한 사용자 프로필 업데이트
 */
userRoutes.patch('/me', zValidator('json', updateUserSchema), async (c) => {
  const auth = c.get('auth')
  const body = c.req.valid('json')

  try {
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

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { name: body.name },
    })

    return c.json({
      success: true,
      data: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        imageUrl: updatedUser.imageUrl,
        updatedAt: updatedUser.updatedAt.toISOString(),
      },
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return c.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '사용자 정보를 업데이트하는데 실패했습니다',
        },
      },
      500
    )
  }
})

/**
 * DELETE /api/users/me
 * 현재 로그인한 사용자 계정 삭제
 */
userRoutes.delete('/me', async (c) => {
  const auth = c.get('auth')

  try {
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

    // Cascade delete로 관련 데이터 모두 삭제
    await prisma.user.delete({
      where: { id: user.id },
    })

    return c.json({
      success: true,
      data: {
        message: '계정이 성공적으로 삭제되었습니다',
      },
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    return c.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '계정을 삭제하는데 실패했습니다',
        },
      },
      500
    )
  }
})

export { userRoutes }
