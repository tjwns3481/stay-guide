/**
 * User API Tests
 *
 * 인증 API 테스트 - TDD GREEN 상태
 * 실제 앱을 import하여 테스트 실행
 */

import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'bun:test'
import { get, patch, del, mockAuthToken, mockUser } from '../setup'
import { app } from '../../src/index'
import { prisma } from '../../src/lib/prisma'

// 테스트 환경 설정
process.env.NODE_ENV = 'test'

// 테스트 전 사용자 데이터 생성
beforeAll(async () => {
  // 기존 테스트 데이터 정리
  await prisma.user.deleteMany({
    where: { clerkId: mockUser.clerkId },
  })

  // 테스트 사용자 생성
  await prisma.user.create({
    data: {
      clerkId: mockUser.clerkId,
      email: mockUser.email,
      name: mockUser.name,
      imageUrl: mockUser.imageUrl,
    },
  })
})

// 테스트 후 정리
afterAll(async () => {
  await prisma.user.deleteMany({
    where: { clerkId: mockUser.clerkId },
  })
  await prisma.$disconnect()
})

describe('User API', () => {
  describe('GET /api/users/me', () => {
    test('인증된 사용자의 프로필을 반환해야 함', async () => {
      const res = await get(app, '/api/users/me', { authToken: mockAuthToken })
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toHaveProperty('id')
      expect(data.data).toHaveProperty('email')
      expect(data.data).toHaveProperty('name')
      expect(data.data).toHaveProperty('license')
      expect(data.data).toHaveProperty('stats')
    })

    test('인증 토큰이 없으면 401을 반환해야 함', async () => {
      const res = await get(app, '/api/users/me')

      expect(res.status).toBe(401)
    })

    test('유효하지 않은 토큰이면 401을 반환해야 함', async () => {
      const res = await get(app, '/api/users/me', { authToken: 'invalid_token' })

      expect(res.status).toBe(401)
    })
  })

  describe('PATCH /api/users/me', () => {
    test('사용자 이름을 업데이트할 수 있어야 함', async () => {
      const res = await patch(
        app,
        '/api/users/me',
        { name: '새로운 이름' },
        { authToken: mockAuthToken }
      )
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.name).toBe('새로운 이름')
    })

    test('빈 이름으로 업데이트하면 400을 반환해야 함', async () => {
      const res = await patch(
        app,
        '/api/users/me',
        { name: '' },
        { authToken: mockAuthToken }
      )

      expect(res.status).toBe(400)
    })

    test('50자 초과 이름으로 업데이트하면 400을 반환해야 함', async () => {
      const res = await patch(
        app,
        '/api/users/me',
        { name: 'a'.repeat(51) },
        { authToken: mockAuthToken }
      )

      expect(res.status).toBe(400)
    })

    test('인증 없이 업데이트하면 401을 반환해야 함', async () => {
      const res = await patch(app, '/api/users/me', { name: '테스트' })

      expect(res.status).toBe(401)
    })
  })

  describe('DELETE /api/users/me', () => {
    test('계정을 삭제할 수 있어야 함', async () => {
      const res = await del(app, '/api/users/me', { authToken: mockAuthToken })
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toHaveProperty('message')
    })

    test('인증 없이 삭제하면 401을 반환해야 함', async () => {
      const res = await del(app, '/api/users/me')

      expect(res.status).toBe(401)
    })
  })
})
