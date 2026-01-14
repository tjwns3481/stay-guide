import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'bun:test'
import { app } from '@/index'
import { prisma } from '@/lib/prisma'

describe('License API', () => {
  const testUserId = 'test-user-id'
  const testClerkId = 'clerk-test-user'

  beforeAll(async () => {
    // 테스트 사용자 생성
    await prisma.user.upsert({
      where: { clerkId: testClerkId },
      update: {},
      create: {
        id: testUserId,
        clerkId: testClerkId,
        email: 'test@example.com',
        name: 'Test User',
      },
    })
  })

  afterAll(async () => {
    // 테스트 데이터 정리
    await prisma.license.deleteMany({ where: { userId: testUserId } })
    await prisma.user.deleteMany({ where: { clerkId: testClerkId } })
  })

  beforeEach(async () => {
    // 각 테스트 전에 라이선스 정리
    await prisma.license.deleteMany({ where: { userId: testUserId } })
  })

  describe('POST /api/licenses/verify', () => {
    it('should validate correct license key format', async () => {
      const response = await app.request('/api/licenses/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licenseKey: 'ROOMY-M123-ABCD-EF01' }),
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.valid).toBe(true)
      expect(data.plan).toBe('monthly')
    })

    it('should reject invalid license key format', async () => {
      const response = await app.request('/api/licenses/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licenseKey: 'INVALID-KEY' }),
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.valid).toBe(false)
    })

    it('should recognize biannual plan', async () => {
      const response = await app.request('/api/licenses/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licenseKey: 'ROOMY-B456-GHIJ-KL23' }),
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.valid).toBe(true)
      expect(data.plan).toBe('biannual')
    })

    it('should recognize annual plan', async () => {
      const response = await app.request('/api/licenses/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licenseKey: 'ROOMY-A789-MNOP-QR45' }),
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.valid).toBe(true)
      expect(data.plan).toBe('annual')
    })

    it('should require licenseKey parameter', async () => {
      const response = await app.request('/api/licenses/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      expect(response.status).toBe(400)
    })
  })

  describe('POST /api/licenses/activate', () => {
    it('should activate valid license key', async () => {
      const response = await app.request('/api/licenses/activate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testClerkId}`,
        },
        body: JSON.stringify({ licenseKey: 'ROOMY-M123-ABCD-EF01' }),
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.license).toBeDefined()
      expect(data.license.plan).toBe('monthly')
      expect(data.license.status).toBe('active')
    })

    it('should reject duplicate license key', async () => {
      const licenseKey = 'ROOMY-M456-GHIJ-KL23'

      // 첫 번째 활성화
      await app.request('/api/licenses/activate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testClerkId}`,
        },
        body: JSON.stringify({ licenseKey }),
      })

      // 두 번째 활성화 시도
      const response = await app.request('/api/licenses/activate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testClerkId}`,
        },
        body: JSON.stringify({ licenseKey }),
      })

      expect(response.status).toBe(409)
      const data = await response.json()
      expect(data.error).toContain('already in use')
    })

    it('should reject invalid license key format', async () => {
      const response = await app.request('/api/licenses/activate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testClerkId}`,
        },
        body: JSON.stringify({ licenseKey: 'INVALID-KEY' }),
      })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toContain('Invalid license key format')
    })

    it('should require authentication', async () => {
      const response = await app.request('/api/licenses/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licenseKey: 'ROOMY-M789-MNOP-QR45' }),
      })

      expect(response.status).toBe(401)
    })
  })

  describe('GET /api/licenses/me', () => {
    it('should return active license', async () => {
      // 라이선스 활성화
      await app.request('/api/licenses/activate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testClerkId}`,
        },
        body: JSON.stringify({ licenseKey: 'ROOMY-A123-BCDE-FG01' }),
      })

      // 라이선스 조회
      const response = await app.request('/api/licenses/me', {
        method: 'GET',
        headers: { Authorization: `Bearer ${testClerkId}` },
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.plan).toBe('annual')
      expect(data.status).toBe('active')
      expect(data.features).toBeDefined()
    })

    it('should return free plan when no license', async () => {
      const response = await app.request('/api/licenses/me', {
        method: 'GET',
        headers: { Authorization: `Bearer ${testClerkId}` },
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.plan).toBe('free')
      expect(data.status).toBe('active')
      expect(data.features).toBeDefined()
      expect(data.features.maxGuides).toBe(1)
    })

    it('should require authentication', async () => {
      const response = await app.request('/api/licenses/me', {
        method: 'GET',
      })

      expect(response.status).toBe(401)
    })
  })
})
