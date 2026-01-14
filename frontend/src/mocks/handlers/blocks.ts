import { http, HttpResponse, delay } from 'msw'
import { getGuideById } from '../data'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787'

const VALID_BLOCK_TYPES = [
  'hero',
  'quick_info',
  'amenities',
  'map',
  'host_pick',
  'notice',
]

export const blockHandlers = [
  // GET /api/guides/:guideId/blocks - 블록 목록 조회
  http.get(`${API_BASE}/api/guides/:guideId/blocks`, async ({ request, params }) => {
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

    const { guideId } = params
    const guide = getGuideById(guideId as string)

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

    // 블록을 order 순으로 정렬
    const sortedBlocks = [...guide.blocks].sort((a, b) => a.order - b.order)

    return HttpResponse.json({ success: true, data: sortedBlocks })
  }),

  // POST /api/guides/:guideId/blocks - 새 블록 생성
  http.post(`${API_BASE}/api/guides/:guideId/blocks`, async ({ request, params }) => {
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

    const { guideId } = params
    const guide = getGuideById(guideId as string)

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

    const body = (await request.json()) as {
      type?: string
      content?: Record<string, unknown>
      order?: number
      isVisible?: boolean
    }

    if (!body.type || !VALID_BLOCK_TYPES.includes(body.type)) {
      return HttpResponse.json(
        {
          success: false,
          error: { code: 'VALIDATION_ERROR', message: '유효하지 않은 블록 타입입니다' },
        },
        { status: 400 }
      )
    }

    if (!body.content || Object.keys(body.content).length === 0) {
      return HttpResponse.json(
        {
          success: false,
          error: { code: 'VALIDATION_ERROR', message: '블록 콘텐츠를 입력해주세요' },
        },
        { status: 400 }
      )
    }

    const newBlock = {
      id: `block_${Date.now()}`,
      guideId: guideId as string,
      type: body.type,
      order: body.order ?? guide.blocks.length,
      content: body.content,
      isVisible: body.isVisible ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    return HttpResponse.json({ success: true, data: newBlock }, { status: 201 })
  }),

  // GET /api/guides/:guideId/blocks/:blockId - 블록 상세 조회
  http.get(
    `${API_BASE}/api/guides/:guideId/blocks/:blockId`,
    async ({ request, params }) => {
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

      const { guideId, blockId } = params
      const guide = getGuideById(guideId as string)

      if (!guide) {
        return HttpResponse.json(
          {
            success: false,
            error: { code: 'NOT_FOUND', message: '안내서를 찾을 수 없습니다' },
          },
          { status: 404 }
        )
      }

      const block = guide.blocks.find((b) => b.id === blockId)
      if (!block) {
        return HttpResponse.json(
          {
            success: false,
            error: { code: 'NOT_FOUND', message: '블록을 찾을 수 없습니다' },
          },
          { status: 404 }
        )
      }

      return HttpResponse.json({ success: true, data: block })
    }
  ),

  // PATCH /api/guides/:guideId/blocks/:blockId - 블록 업데이트
  http.patch(
    `${API_BASE}/api/guides/:guideId/blocks/:blockId`,
    async ({ request, params }) => {
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

      const { guideId, blockId } = params
      const guide = getGuideById(guideId as string)

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

      const block = guide.blocks.find((b) => b.id === blockId)
      if (!block) {
        return HttpResponse.json(
          {
            success: false,
            error: { code: 'NOT_FOUND', message: '블록을 찾을 수 없습니다' },
          },
          { status: 404 }
        )
      }

      const body = await request.json()
      const updatedBlock = {
        ...block,
        ...(body as object),
        updatedAt: new Date().toISOString(),
      }

      return HttpResponse.json({ success: true, data: updatedBlock })
    }
  ),

  // DELETE /api/guides/:guideId/blocks/:blockId - 블록 삭제
  http.delete(
    `${API_BASE}/api/guides/:guideId/blocks/:blockId`,
    async ({ request, params }) => {
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

      const { guideId, blockId } = params
      const guide = getGuideById(guideId as string)

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

      const block = guide.blocks.find((b) => b.id === blockId)
      if (!block) {
        return HttpResponse.json(
          {
            success: false,
            error: { code: 'NOT_FOUND', message: '블록을 찾을 수 없습니다' },
          },
          { status: 404 }
        )
      }

      return HttpResponse.json({
        success: true,
        data: { message: '블록이 삭제되었습니다' },
      })
    }
  ),

  // PUT /api/guides/:guideId/blocks/reorder - 블록 순서 변경
  http.put(
    `${API_BASE}/api/guides/:guideId/blocks/reorder`,
    async ({ request, params }) => {
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

      const { guideId } = params
      const guide = getGuideById(guideId as string)

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

      const body = (await request.json()) as { blockIds?: string[] }

      if (!body.blockIds || body.blockIds.length === 0) {
        return HttpResponse.json(
          {
            success: false,
            error: { code: 'VALIDATION_ERROR', message: '블록 ID 목록을 입력해주세요' },
          },
          { status: 400 }
        )
      }

      // 모든 블록 ID가 존재하는지 확인
      const guideBlockIds = guide.blocks.map((b) => b.id)
      const invalidIds = body.blockIds.filter((id) => !guideBlockIds.includes(id))
      if (invalidIds.length > 0) {
        return HttpResponse.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: `존재하지 않는 블록 ID: ${invalidIds.join(', ')}`,
            },
          },
          { status: 400 }
        )
      }

      const reorderedBlocks = body.blockIds.map((id, index) => ({
        id,
        order: index,
      }))

      return HttpResponse.json({
        success: true,
        data: {
          message: '블록 순서가 변경되었습니다',
          blocks: reorderedBlocks,
        },
      })
    }
  ),

  // POST /api/guides/:guideId/blocks/:blockId/duplicate - 블록 복제
  http.post(
    `${API_BASE}/api/guides/:guideId/blocks/:blockId/duplicate`,
    async ({ request, params }) => {
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

      const { guideId, blockId } = params
      const guide = getGuideById(guideId as string)

      if (!guide) {
        return HttpResponse.json(
          {
            success: false,
            error: { code: 'NOT_FOUND', message: '안내서를 찾을 수 없습니다' },
          },
          { status: 404 }
        )
      }

      const block = guide.blocks.find((b) => b.id === blockId)
      if (!block) {
        return HttpResponse.json(
          {
            success: false,
            error: { code: 'NOT_FOUND', message: '블록을 찾을 수 없습니다' },
          },
          { status: 404 }
        )
      }

      const duplicatedBlock = {
        ...block,
        id: `block_${Date.now()}`,
        order: block.order + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      return HttpResponse.json(
        { success: true, data: duplicatedBlock },
        { status: 201 }
      )
    }
  ),

  // PATCH /api/guides/:guideId/blocks/:blockId/visibility - 블록 표시/숨김
  http.patch(
    `${API_BASE}/api/guides/:guideId/blocks/:blockId/visibility`,
    async ({ request, params }) => {
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

      const { guideId, blockId } = params
      const guide = getGuideById(guideId as string)

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

      const body = (await request.json()) as { isVisible: boolean }

      return HttpResponse.json({
        success: true,
        data: {
          id: blockId,
          isVisible: body.isVisible,
        },
      })
    }
  ),
]
