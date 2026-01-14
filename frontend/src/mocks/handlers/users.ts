import { http, HttpResponse, delay } from 'msw'
import { currentUser, mockUsers } from '../data'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787'

export const userHandlers = [
  // GET /api/users/me - 현재 사용자 프로필 조회
  http.get(`${API_BASE}/api/users/me`, async ({ request }) => {
    await delay(100)

    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: '인증이 필요합니다',
          },
        },
        { status: 401 }
      )
    }

    return HttpResponse.json({
      success: true,
      data: currentUser,
    })
  }),

  // PATCH /api/users/me - 프로필 업데이트
  http.patch(`${API_BASE}/api/users/me`, async ({ request }) => {
    await delay(100)

    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: '인증이 필요합니다',
          },
        },
        { status: 401 }
      )
    }

    const body = (await request.json()) as { name?: string }

    if (body.name !== undefined) {
      if (body.name.length === 0) {
        return HttpResponse.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: '이름을 입력해주세요',
            },
          },
          { status: 400 }
        )
      }

      if (body.name.length > 50) {
        return HttpResponse.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: '이름은 50자 이하로 입력해주세요',
            },
          },
          { status: 400 }
        )
      }
    }

    const updatedUser = {
      ...currentUser,
      ...body,
      updatedAt: new Date().toISOString(),
    }

    return HttpResponse.json({
      success: true,
      data: updatedUser,
    })
  }),

  // DELETE /api/users/me - 계정 삭제
  http.delete(`${API_BASE}/api/users/me`, async ({ request }) => {
    await delay(100)

    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: '인증이 필요합니다',
          },
        },
        { status: 401 }
      )
    }

    return HttpResponse.json({
      success: true,
      data: {
        message: '계정이 삭제되었습니다',
      },
    })
  }),
]
