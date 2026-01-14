import { http, HttpResponse, delay } from 'msw'
import {
  mockGuides,
  mockGuideListItems,
  getGuideById,
  getGuideBySlug,
} from '../data'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787'

// 슬러그 생성 헬퍼
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50) || `guide-${Date.now()}`
}

export const guideHandlers = [
  // GET /api/guides - 안내서 목록 조회
  http.get(`${API_BASE}/api/guides`, async ({ request }) => {
    await delay(150)

    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다' },
        },
        { status: 401 }
      )
    }

    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const search = url.searchParams.get('search') || ''
    const isPublished = url.searchParams.get('isPublished')

    let filteredGuides = [...mockGuideListItems]

    if (search) {
      filteredGuides = filteredGuides.filter(
        (g) =>
          g.title.includes(search) || g.accommodationName.includes(search)
      )
    }

    if (isPublished !== null) {
      filteredGuides = filteredGuides.filter(
        (g) => g.isPublished === (isPublished === 'true')
      )
    }

    const total = filteredGuides.length
    const totalPages = Math.ceil(total / limit)
    const start = (page - 1) * limit
    const items = filteredGuides.slice(start, start + limit)

    return HttpResponse.json({
      success: true,
      data: {
        items,
        meta: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    })
  }),

  // POST /api/guides - 새 안내서 생성
  http.post(`${API_BASE}/api/guides`, async ({ request }) => {
    await delay(200)

    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다' },
        },
        { status: 401 }
      )
    }

    const body = (await request.json()) as {
      title?: string
      accommodationName?: string
      slug?: string
    }

    if (!body.title || body.title.length === 0) {
      return HttpResponse.json(
        {
          success: false,
          error: { code: 'VALIDATION_ERROR', message: '제목을 입력해주세요' },
        },
        { status: 400 }
      )
    }

    if (!body.accommodationName || body.accommodationName.length === 0) {
      return HttpResponse.json(
        {
          success: false,
          error: { code: 'VALIDATION_ERROR', message: '숙소명을 입력해주세요' },
        },
        { status: 400 }
      )
    }

    const slug = body.slug || generateSlug(body.title)

    // 슬러그 형식 검증
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '슬러그는 영문 소문자, 숫자, 하이픈만 사용 가능합니다',
          },
        },
        { status: 400 }
      )
    }

    // 슬러그 중복 검사
    if (mockGuides.some((g) => g.slug === slug)) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: 'CONFLICT',
            message: '이미 사용 중인 슬러그입니다',
          },
        },
        { status: 409 }
      )
    }

    const newGuide = {
      id: `guide_${Date.now()}`,
      userId: 'user_1',
      slug,
      title: body.title,
      accommodationName: body.accommodationName,
      isPublished: false,
      themeId: null,
      themeSettings: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    return HttpResponse.json(
      { success: true, data: newGuide },
      { status: 201 }
    )
  }),

  // GET /api/guides/:id - 안내서 상세 조회
  http.get(`${API_BASE}/api/guides/:id`, async ({ request, params }) => {
    await delay(100)

    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다' },
        },
        { status: 401 }
      )
    }

    const { id } = params
    const guide = getGuideById(id as string)

    if (!guide) {
      return HttpResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: '안내서를 찾을 수 없습니다' },
        },
        { status: 404 }
      )
    }

    // 권한 검사 (간단히 user_1 소유로 가정)
    if (guide.userId !== 'user_1') {
      return HttpResponse.json(
        {
          success: false,
          error: { code: 'FORBIDDEN', message: '접근 권한이 없습니다' },
        },
        { status: 403 }
      )
    }

    return HttpResponse.json({ success: true, data: guide })
  }),

  // GET /api/guides/slug/:slug - 슬러그로 안내서 조회 (게스트용)
  http.get(`${API_BASE}/api/guides/slug/:slug`, async ({ params }) => {
    await delay(100)

    const { slug } = params
    const guide = getGuideBySlug(slug as string)

    if (!guide) {
      return HttpResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: '안내서를 찾을 수 없습니다' },
        },
        { status: 404 }
      )
    }

    return HttpResponse.json({ success: true, data: guide })
  }),

  // PATCH /api/guides/:id - 안내서 업데이트
  http.patch(`${API_BASE}/api/guides/:id`, async ({ request, params }) => {
    await delay(150)

    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다' },
        },
        { status: 401 }
      )
    }

    const { id } = params
    const guide = getGuideById(id as string)

    if (!guide) {
      return HttpResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: '안내서를 찾을 수 없습니다' },
        },
        { status: 404 }
      )
    }

    if (guide.userId !== 'user_1') {
      return HttpResponse.json(
        {
          success: false,
          error: { code: 'FORBIDDEN', message: '접근 권한이 없습니다' },
        },
        { status: 403 }
      )
    }

    const body = await request.json()
    const updatedGuide = {
      ...guide,
      ...(body as object),
      updatedAt: new Date().toISOString(),
    }

    return HttpResponse.json({ success: true, data: updatedGuide })
  }),

  // DELETE /api/guides/:id - 안내서 삭제
  http.delete(`${API_BASE}/api/guides/:id`, async ({ request, params }) => {
    await delay(150)

    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다' },
        },
        { status: 401 }
      )
    }

    const { id } = params
    const guide = getGuideById(id as string)

    if (!guide) {
      return HttpResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: '안내서를 찾을 수 없습니다' },
        },
        { status: 404 }
      )
    }

    if (guide.userId !== 'user_1') {
      return HttpResponse.json(
        {
          success: false,
          error: { code: 'FORBIDDEN', message: '접근 권한이 없습니다' },
        },
        { status: 403 }
      )
    }

    return HttpResponse.json({
      success: true,
      data: { message: '안내서가 삭제되었습니다' },
    })
  }),

  // POST /api/guides/:id/publish - 안내서 발행
  http.post(`${API_BASE}/api/guides/:id/publish`, async ({ request, params }) => {
    await delay(200)

    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다' },
        },
        { status: 401 }
      )
    }

    const { id } = params
    const guide = getGuideById(id as string)

    if (!guide) {
      return HttpResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: '안내서를 찾을 수 없습니다' },
        },
        { status: 404 }
      )
    }

    const body = (await request.json()) as { isPublished: boolean }

    return HttpResponse.json({
      success: true,
      data: {
        id: guide.id,
        isPublished: body.isPublished,
        slug: guide.slug,
        publicUrl: `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/g/${guide.slug}`,
      },
    })
  }),

  // POST /api/guides/:id/duplicate - 안내서 복제
  http.post(`${API_BASE}/api/guides/:id/duplicate`, async ({ request, params }) => {
    await delay(300)

    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다' },
        },
        { status: 401 }
      )
    }

    const { id } = params
    const guide = getGuideById(id as string)

    if (!guide) {
      return HttpResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: '안내서를 찾을 수 없습니다' },
        },
        { status: 404 }
      )
    }

    const duplicatedGuide = {
      ...guide,
      id: `guide_${Date.now()}`,
      slug: `${guide.slug}-copy-${Date.now()}`,
      title: `${guide.title} (복사본)`,
      isPublished: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    return HttpResponse.json(
      { success: true, data: duplicatedGuide },
      { status: 201 }
    )
  }),
]
