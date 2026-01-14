/**
 * Guide API Tests (RED State - TDD)
 *
 * 이 테스트들은 아직 구현되지 않은 API에 대한 스켈레톤입니다.
 * API 구현 후 GREEN 상태가 되어야 합니다.
 */

import { describe, test, expect } from 'bun:test'
import { Hono } from 'hono'
import { get, post, patch, del, mockAuthToken, mockGuide } from '../setup'

// TODO: 실제 앱 import로 교체
// import app from '../../src/index'
const app = new Hono()

describe('Guide API', () => {
  describe('GET /api/guides', () => {
    test('내 안내서 목록을 반환해야 함', async () => {
      const res = await get(app, '/api/guides', { authToken: mockAuthToken })
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toHaveProperty('items')
      expect(data.data).toHaveProperty('meta')
      expect(Array.isArray(data.data.items)).toBe(true)
    })

    test('페이지네이션이 작동해야 함', async () => {
      const res = await get(app, '/api/guides?page=1&limit=10', {
        authToken: mockAuthToken,
      })
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.data.meta.page).toBe(1)
      expect(data.data.meta.limit).toBe(10)
    })

    test('발행 상태로 필터링할 수 있어야 함', async () => {
      const res = await get(app, '/api/guides?isPublished=true', {
        authToken: mockAuthToken,
      })
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(
        data.data.items.every((item: { isPublished: boolean }) => item.isPublished === true)
      ).toBe(true)
    })

    test('인증 없이 조회하면 401을 반환해야 함', async () => {
      const res = await get(app, '/api/guides')

      expect(res.status).toBe(401)
    })
  })

  describe('POST /api/guides', () => {
    test('새 안내서를 생성할 수 있어야 함', async () => {
      const res = await post(
        app,
        '/api/guides',
        {
          title: '테스트 안내서',
          accommodationName: '테스트 숙소',
        },
        { authToken: mockAuthToken }
      )
      const data = await res.json()

      expect(res.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.data).toHaveProperty('id')
      expect(data.data).toHaveProperty('slug')
      expect(data.data.title).toBe('테스트 안내서')
    })

    test('커스텀 슬러그로 생성할 수 있어야 함', async () => {
      const res = await post(
        app,
        '/api/guides',
        {
          title: '테스트 안내서',
          accommodationName: '테스트 숙소',
          slug: 'my-custom-slug',
        },
        { authToken: mockAuthToken }
      )
      const data = await res.json()

      expect(res.status).toBe(201)
      expect(data.data.slug).toBe('my-custom-slug')
    })

    test('제목 없이 생성하면 400을 반환해야 함', async () => {
      const res = await post(
        app,
        '/api/guides',
        { accommodationName: '테스트 숙소' },
        { authToken: mockAuthToken }
      )

      expect(res.status).toBe(400)
    })

    test('중복 슬러그로 생성하면 409를 반환해야 함', async () => {
      // 먼저 안내서 생성
      await post(
        app,
        '/api/guides',
        {
          title: '첫 번째 안내서',
          accommodationName: '테스트 숙소',
          slug: 'duplicate-slug',
        },
        { authToken: mockAuthToken }
      )

      // 같은 슬러그로 다시 생성 시도
      const res = await post(
        app,
        '/api/guides',
        {
          title: '두 번째 안내서',
          accommodationName: '테스트 숙소',
          slug: 'duplicate-slug',
        },
        { authToken: mockAuthToken }
      )

      expect(res.status).toBe(409)
    })

    test('잘못된 슬러그 형식이면 400을 반환해야 함', async () => {
      const res = await post(
        app,
        '/api/guides',
        {
          title: '테스트 안내서',
          accommodationName: '테스트 숙소',
          slug: 'Invalid Slug!',
        },
        { authToken: mockAuthToken }
      )

      expect(res.status).toBe(400)
    })
  })

  describe('GET /api/guides/:id', () => {
    test('안내서 상세 정보를 반환해야 함', async () => {
      const res = await get(app, `/api/guides/${mockGuide.id}`, {
        authToken: mockAuthToken,
      })
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toHaveProperty('id')
      expect(data.data).toHaveProperty('blocks')
    })

    test('존재하지 않는 안내서는 404를 반환해야 함', async () => {
      const res = await get(app, '/api/guides/nonexistent-id', {
        authToken: mockAuthToken,
      })

      expect(res.status).toBe(404)
    })

    test('다른 사용자의 안내서는 403을 반환해야 함', async () => {
      const res = await get(app, '/api/guides/other-user-guide-id', {
        authToken: mockAuthToken,
      })

      expect(res.status).toBe(403)
    })
  })

  describe('GET /api/guides/slug/:slug', () => {
    test('발행된 안내서는 인증 없이 조회할 수 있어야 함', async () => {
      const res = await get(app, `/api/guides/slug/${mockGuide.slug}`)
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toHaveProperty('blocks')
    })

    test('발행되지 않은 안내서는 404를 반환해야 함', async () => {
      const res = await get(app, '/api/guides/slug/unpublished-guide')

      expect(res.status).toBe(404)
    })
  })

  describe('PATCH /api/guides/:id', () => {
    test('안내서 정보를 업데이트할 수 있어야 함', async () => {
      const res = await patch(
        app,
        `/api/guides/${mockGuide.id}`,
        { title: '수정된 제목' },
        { authToken: mockAuthToken }
      )
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.data.title).toBe('수정된 제목')
    })

    test('테마 설정을 업데이트할 수 있어야 함', async () => {
      const res = await patch(
        app,
        `/api/guides/${mockGuide.id}`,
        {
          themeSettings: {
            preset: 'modern',
            primaryColor: '#2D3436',
          },
        },
        { authToken: mockAuthToken }
      )
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.data.themeSettings.preset).toBe('modern')
    })

    test('다른 사용자의 안내서는 수정할 수 없어야 함', async () => {
      const res = await patch(
        app,
        '/api/guides/other-user-guide-id',
        { title: '수정 시도' },
        { authToken: mockAuthToken }
      )

      expect(res.status).toBe(403)
    })
  })

  describe('DELETE /api/guides/:id', () => {
    test('안내서를 삭제할 수 있어야 함', async () => {
      const res = await del(app, `/api/guides/${mockGuide.id}`, {
        authToken: mockAuthToken,
      })
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.success).toBe(true)
    })

    test('다른 사용자의 안내서는 삭제할 수 없어야 함', async () => {
      const res = await del(app, '/api/guides/other-user-guide-id', {
        authToken: mockAuthToken,
      })

      expect(res.status).toBe(403)
    })
  })

  describe('POST /api/guides/:id/publish', () => {
    test('안내서를 발행할 수 있어야 함', async () => {
      const res = await post(
        app,
        `/api/guides/${mockGuide.id}/publish`,
        { isPublished: true },
        { authToken: mockAuthToken }
      )
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.data.isPublished).toBe(true)
      expect(data.data).toHaveProperty('publicUrl')
    })

    test('발행을 취소할 수 있어야 함', async () => {
      const res = await post(
        app,
        `/api/guides/${mockGuide.id}/publish`,
        { isPublished: false },
        { authToken: mockAuthToken }
      )
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.data.isPublished).toBe(false)
    })
  })

  describe('POST /api/guides/:id/duplicate', () => {
    test('안내서를 복제할 수 있어야 함', async () => {
      const res = await post(
        app,
        `/api/guides/${mockGuide.id}/duplicate`,
        {},
        { authToken: mockAuthToken }
      )
      const data = await res.json()

      expect(res.status).toBe(201)
      expect(data.data.id).not.toBe(mockGuide.id)
      expect(data.data.title).toContain('(복사본)')
    })
  })
})
