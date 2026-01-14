/**
 * Block API Tests (RED State - TDD)
 *
 * 이 테스트들은 아직 구현되지 않은 API에 대한 스켈레톤입니다.
 * API 구현 후 GREEN 상태가 되어야 합니다.
 */

import { describe, test, expect } from 'bun:test'
import { Hono } from 'hono'
import { get, post, patch, put, del, mockAuthToken, mockGuide, mockBlock } from '../setup'

// TODO: 실제 앱 import로 교체
// import app from '../../src/index'
const app = new Hono()

const guideId = mockGuide.id
const blockId = mockBlock.id

describe('Block API', () => {
  describe('GET /api/guides/:guideId/blocks', () => {
    test('안내서의 블록 목록을 반환해야 함', async () => {
      const res = await get(app, `/api/guides/${guideId}/blocks`, {
        authToken: mockAuthToken,
      })
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.success).toBe(true)
      expect(Array.isArray(data.data)).toBe(true)
    })

    test('블록이 order 순으로 정렬되어야 함', async () => {
      const res = await get(app, `/api/guides/${guideId}/blocks`, {
        authToken: mockAuthToken,
      })
      const data = await res.json()

      expect(res.status).toBe(200)
      const orders = data.data.map((block: { order: number }) => block.order)
      expect(orders).toEqual([...orders].sort((a, b) => a - b))
    })

    test('다른 사용자의 안내서 블록은 조회할 수 없어야 함', async () => {
      const res = await get(app, '/api/guides/other-user-guide/blocks', {
        authToken: mockAuthToken,
      })

      expect(res.status).toBe(403)
    })
  })

  describe('POST /api/guides/:guideId/blocks', () => {
    test('새 블록을 생성할 수 있어야 함', async () => {
      const res = await post(
        app,
        `/api/guides/${guideId}/blocks`,
        {
          type: 'hero',
          content: {
            title: '환영합니다',
            subtitle: '테스트 숙소입니다',
          },
        },
        { authToken: mockAuthToken }
      )
      const data = await res.json()

      expect(res.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.data).toHaveProperty('id')
      expect(data.data.type).toBe('hero')
    })

    test('order를 지정하여 특정 위치에 블록을 생성할 수 있어야 함', async () => {
      const res = await post(
        app,
        `/api/guides/${guideId}/blocks`,
        {
          type: 'quick_info',
          content: { checkIn: '15:00', checkOut: '11:00' },
          order: 1,
        },
        { authToken: mockAuthToken }
      )
      const data = await res.json()

      expect(res.status).toBe(201)
      expect(data.data.order).toBe(1)
    })

    test('잘못된 블록 타입이면 400을 반환해야 함', async () => {
      const res = await post(
        app,
        `/api/guides/${guideId}/blocks`,
        {
          type: 'invalid_type',
          content: {},
        },
        { authToken: mockAuthToken }
      )

      expect(res.status).toBe(400)
    })

    test('content 없이 생성하면 400을 반환해야 함', async () => {
      const res = await post(
        app,
        `/api/guides/${guideId}/blocks`,
        { type: 'hero' },
        { authToken: mockAuthToken }
      )

      expect(res.status).toBe(400)
    })

    test('다른 사용자의 안내서에 블록을 생성할 수 없어야 함', async () => {
      const res = await post(
        app,
        '/api/guides/other-user-guide/blocks',
        {
          type: 'hero',
          content: { title: '테스트' },
        },
        { authToken: mockAuthToken }
      )

      expect(res.status).toBe(403)
    })
  })

  describe('GET /api/guides/:guideId/blocks/:blockId', () => {
    test('블록 상세 정보를 반환해야 함', async () => {
      const res = await get(app, `/api/guides/${guideId}/blocks/${blockId}`, {
        authToken: mockAuthToken,
      })
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.id).toBe(blockId)
    })

    test('존재하지 않는 블록은 404를 반환해야 함', async () => {
      const res = await get(app, `/api/guides/${guideId}/blocks/nonexistent`, {
        authToken: mockAuthToken,
      })

      expect(res.status).toBe(404)
    })
  })

  describe('PATCH /api/guides/:guideId/blocks/:blockId', () => {
    test('블록 콘텐츠를 업데이트할 수 있어야 함', async () => {
      const res = await patch(
        app,
        `/api/guides/${guideId}/blocks/${blockId}`,
        {
          content: {
            title: '수정된 제목',
            subtitle: '수정된 부제목',
          },
        },
        { authToken: mockAuthToken }
      )
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.data.content.title).toBe('수정된 제목')
    })

    test('블록 표시 상태를 변경할 수 있어야 함', async () => {
      const res = await patch(
        app,
        `/api/guides/${guideId}/blocks/${blockId}`,
        { isVisible: false },
        { authToken: mockAuthToken }
      )
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.data.isVisible).toBe(false)
    })

    test('다른 사용자의 블록은 수정할 수 없어야 함', async () => {
      const res = await patch(
        app,
        '/api/guides/other-user-guide/blocks/some-block',
        { content: { title: '수정 시도' } },
        { authToken: mockAuthToken }
      )

      expect(res.status).toBe(403)
    })
  })

  describe('DELETE /api/guides/:guideId/blocks/:blockId', () => {
    test('블록을 삭제할 수 있어야 함', async () => {
      const res = await del(app, `/api/guides/${guideId}/blocks/${blockId}`, {
        authToken: mockAuthToken,
      })
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.success).toBe(true)
    })

    test('블록 삭제 후 다른 블록의 order가 재정렬되어야 함', async () => {
      // 블록 삭제
      await del(app, `/api/guides/${guideId}/blocks/${blockId}`, {
        authToken: mockAuthToken,
      })

      // 남은 블록 목록 조회
      const res = await get(app, `/api/guides/${guideId}/blocks`, {
        authToken: mockAuthToken,
      })
      const data = await res.json()

      // order가 연속적이어야 함 (0, 1, 2, ...)
      const orders = data.data.map((block: { order: number }) => block.order)
      expect(orders).toEqual(orders.map((_: unknown, i: number) => i))
    })

    test('다른 사용자의 블록은 삭제할 수 없어야 함', async () => {
      const res = await del(app, '/api/guides/other-user-guide/blocks/some-block', {
        authToken: mockAuthToken,
      })

      expect(res.status).toBe(403)
    })
  })

  describe('PUT /api/guides/:guideId/blocks/reorder', () => {
    test('블록 순서를 변경할 수 있어야 함', async () => {
      const res = await put(
        app,
        `/api/guides/${guideId}/blocks/reorder`,
        {
          blockIds: ['block_3', 'block_1', 'block_2'],
        },
        { authToken: mockAuthToken }
      )
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.blocks[0].id).toBe('block_3')
      expect(data.data.blocks[0].order).toBe(0)
    })

    test('빈 blockIds로 요청하면 400을 반환해야 함', async () => {
      const res = await put(
        app,
        `/api/guides/${guideId}/blocks/reorder`,
        { blockIds: [] },
        { authToken: mockAuthToken }
      )

      expect(res.status).toBe(400)
    })

    test('존재하지 않는 블록 ID가 포함되면 400을 반환해야 함', async () => {
      const res = await put(
        app,
        `/api/guides/${guideId}/blocks/reorder`,
        {
          blockIds: ['block_1', 'nonexistent', 'block_2'],
        },
        { authToken: mockAuthToken }
      )

      expect(res.status).toBe(400)
    })
  })

  describe('POST /api/guides/:guideId/blocks/:blockId/duplicate', () => {
    test('블록을 복제할 수 있어야 함', async () => {
      const res = await post(
        app,
        `/api/guides/${guideId}/blocks/${blockId}/duplicate`,
        {},
        { authToken: mockAuthToken }
      )
      const data = await res.json()

      expect(res.status).toBe(201)
      expect(data.data.id).not.toBe(blockId)
      expect(data.data.type).toBe(mockBlock.type)
    })

    test('복제된 블록은 원본 다음 순서에 위치해야 함', async () => {
      const res = await post(
        app,
        `/api/guides/${guideId}/blocks/${blockId}/duplicate`,
        {},
        { authToken: mockAuthToken }
      )
      const data = await res.json()

      expect(data.data.order).toBe(mockBlock.order + 1)
    })
  })

  describe('PATCH /api/guides/:guideId/blocks/:blockId/visibility', () => {
    test('블록을 숨길 수 있어야 함', async () => {
      const res = await patch(
        app,
        `/api/guides/${guideId}/blocks/${blockId}/visibility`,
        { isVisible: false },
        { authToken: mockAuthToken }
      )
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.data.isVisible).toBe(false)
    })

    test('숨긴 블록을 다시 표시할 수 있어야 함', async () => {
      const res = await patch(
        app,
        `/api/guides/${guideId}/blocks/${blockId}/visibility`,
        { isVisible: true },
        { authToken: mockAuthToken }
      )
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.data.isVisible).toBe(true)
    })
  })
})
