/**
 * AI API Tests (GREEN State)
 *
 * AI 임베딩 생성, RAG 검색, 채팅 API 테스트
 */

import { describe, test, expect } from 'bun:test'
import { get, post, del, mockAuthToken, mockGuide } from '../setup'
import { app } from '../../src/index'

const guideId = mockGuide.id

describe('AI API', () => {
  describe('POST /api/guides/:guideId/ai/chat', () => {
    test('AI 컨시어지에게 질문할 수 있어야 함', async () => {
      const res = await post(app, `/api/guides/${guideId}/ai/chat`, {
        message: '체크인 시간이 몇 시인가요?',
      })

      expect(res.status).toBe(200)
      expect(res.headers.get('content-type')).toContain('text/event-stream')
    })

    test('기존 세션으로 대화를 계속할 수 있어야 함', async () => {
      const res = await post(app, `/api/guides/${guideId}/ai/chat`, {
        message: '그러면 체크아웃은요?',
        sessionId: 'existing-session-id',
      })

      expect(res.status).toBe(200)
    })

    test('빈 메시지로 요청하면 400을 반환해야 함', async () => {
      const res = await post(app, `/api/guides/${guideId}/ai/chat`, {
        message: '',
      })

      expect(res.status).toBe(400)
    })

    test('1000자 초과 메시지로 요청하면 400을 반환해야 함', async () => {
      const res = await post(app, `/api/guides/${guideId}/ai/chat`, {
        message: 'a'.repeat(1001),
      })

      expect(res.status).toBe(400)
    })

    test('발행되지 않은 안내서는 AI 채팅을 사용할 수 없어야 함', async () => {
      const res = await post(app, '/api/guides/unpublished-guide/ai/chat', {
        message: '테스트 질문',
      })

      expect(res.status).toBe(404)
    })

    test('SSE 스트림에서 메시지 이벤트를 받아야 함', async () => {
      const res = await post(app, `/api/guides/${guideId}/ai/chat`, {
        message: '체크인 시간이 몇 시인가요?',
      })

      // SSE 스트림 읽기
      const reader = res.body?.getReader()
      const decoder = new TextDecoder()

      if (reader) {
        const { value } = await reader.read()
        const text = decoder.decode(value)

        expect(text).toContain('event:')
        expect(text).toContain('data:')
      }
    })

    test('응답에 참조된 블록 ID가 포함되어야 함', async () => {
      const res = await post(app, `/api/guides/${guideId}/ai/chat`, {
        message: '체크인 시간이 몇 시인가요?',
      })

      // SSE 스트림에서 done 이벤트 확인
      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let fullText = ''

      if (reader) {
        while (true) {
          const { value, done } = await reader.read()
          if (done) break
          fullText += decoder.decode(value)
        }

        expect(fullText).toContain('event: done')
        expect(fullText).toContain('referencedBlockIds')
      }
    })
  })

  describe('GET /api/guides/:guideId/ai/conversations', () => {
    test('대화 기록 목록을 조회할 수 있어야 함 (호스트 전용)', async () => {
      const res = await get(app, `/api/guides/${guideId}/ai/conversations`, {
        authToken: mockAuthToken,
      })
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toHaveProperty('items')
      expect(data.data).toHaveProperty('meta')
    })

    test('페이지네이션이 작동해야 함', async () => {
      const res = await get(
        app,
        `/api/guides/${guideId}/ai/conversations?page=1&limit=10`,
        { authToken: mockAuthToken }
      )
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.data.meta.page).toBe(1)
      expect(data.data.meta.limit).toBe(10)
    })

    test('인증 없이 조회하면 401을 반환해야 함', async () => {
      const res = await get(app, `/api/guides/${guideId}/ai/conversations`)

      expect(res.status).toBe(401)
    })

    test('다른 사용자의 안내서 대화 기록은 조회할 수 없어야 함', async () => {
      const res = await get(app, '/api/guides/other-user-guide/ai/conversations', {
        authToken: mockAuthToken,
      })

      expect(res.status).toBe(403)
    })
  })

  describe('GET /api/guides/:guideId/ai/conversations/:sessionId', () => {
    test('특정 세션의 대화 기록을 조회할 수 있어야 함', async () => {
      const res = await get(
        app,
        `/api/guides/${guideId}/ai/conversations/session-123`,
        { authToken: mockAuthToken }
      )
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.data).toHaveProperty('sessionId')
      expect(data.data).toHaveProperty('messages')
      expect(Array.isArray(data.data.messages)).toBe(true)
    })

    test('존재하지 않는 세션은 404를 반환해야 함', async () => {
      const res = await get(
        app,
        `/api/guides/${guideId}/ai/conversations/nonexistent`,
        { authToken: mockAuthToken }
      )

      expect(res.status).toBe(404)
    })
  })

  describe('DELETE /api/guides/:guideId/ai/conversations/:sessionId', () => {
    test('대화 기록을 삭제할 수 있어야 함', async () => {
      const res = await del(
        app,
        `/api/guides/${guideId}/ai/conversations/session-123`,
        { authToken: mockAuthToken }
      )
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.success).toBe(true)
    })

    test('다른 사용자의 대화 기록은 삭제할 수 없어야 함', async () => {
      const res = await del(
        app,
        '/api/guides/other-user-guide/ai/conversations/session-123',
        { authToken: mockAuthToken }
      )

      expect(res.status).toBe(403)
    })
  })

  describe('POST /api/guides/:guideId/ai/embed', () => {
    test('안내서 임베딩을 생성할 수 있어야 함', async () => {
      const res = await post(
        app,
        `/api/guides/${guideId}/ai/embed`,
        {},
        { authToken: mockAuthToken }
      )
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toHaveProperty('embeddingsCount')
    })

    test('블록이 없는 안내서는 임베딩 수가 0이어야 함', async () => {
      const res = await post(
        app,
        '/api/guides/empty-guide/ai/embed',
        {},
        { authToken: mockAuthToken }
      )
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.data.embeddingsCount).toBe(0)
    })

    test('인증 없이 임베딩을 생성하면 401을 반환해야 함', async () => {
      const res = await post(app, `/api/guides/${guideId}/ai/embed`, {})

      expect(res.status).toBe(401)
    })

    test('다른 사용자의 안내서는 임베딩을 생성할 수 없어야 함', async () => {
      const res = await post(
        app,
        '/api/guides/other-user-guide/ai/embed',
        {},
        { authToken: mockAuthToken }
      )

      expect(res.status).toBe(403)
    })
  })

  describe('GET /api/guides/:guideId/ai/stats', () => {
    test('AI 사용 통계를 조회할 수 있어야 함', async () => {
      const res = await get(app, `/api/guides/${guideId}/ai/stats`, {
        authToken: mockAuthToken,
      })
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toHaveProperty('totalConversations')
      expect(data.data).toHaveProperty('totalMessages')
      expect(data.data).toHaveProperty('averageMessagesPerSession')
      expect(data.data).toHaveProperty('topQuestions')
    })

    test('인증 없이 통계를 조회하면 401을 반환해야 함', async () => {
      const res = await get(app, `/api/guides/${guideId}/ai/stats`)

      expect(res.status).toBe(401)
    })
  })
})
