/**
 * Test Setup & Helpers
 * Bun Test Runner 환경에서 Hono 앱 테스트를 위한 헬퍼 함수들
 */

import { Hono } from 'hono'

// 테스트용 Base URL
export const TEST_BASE_URL = 'http://localhost:8787'

// API 응답 타입
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: Record<string, string>
  }
}

// 테스트 요청 헬퍼
export async function testRequest(
  app: Hono,
  method: string,
  path: string,
  options: {
    body?: unknown
    headers?: Record<string, string>
    authToken?: string
  } = {}
) {
  const { body, headers = {}, authToken } = options

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  }

  if (authToken) {
    requestHeaders['Authorization'] = `Bearer ${authToken}`
  }

  const request = new Request(`${TEST_BASE_URL}${path}`, {
    method,
    headers: requestHeaders,
    body: body ? JSON.stringify(body) : undefined,
  })

  return app.fetch(request)
}

// GET 요청 헬퍼
export async function get(
  app: Hono,
  path: string,
  options?: { headers?: Record<string, string>; authToken?: string }
) {
  return testRequest(app, 'GET', path, options)
}

// POST 요청 헬퍼
export async function post(
  app: Hono,
  path: string,
  body?: unknown,
  options?: { headers?: Record<string, string>; authToken?: string }
) {
  return testRequest(app, 'POST', path, { body, ...options })
}

// PATCH 요청 헬퍼
export async function patch(
  app: Hono,
  path: string,
  body?: unknown,
  options?: { headers?: Record<string, string>; authToken?: string }
) {
  return testRequest(app, 'PATCH', path, { body, ...options })
}

// PUT 요청 헬퍼
export async function put(
  app: Hono,
  path: string,
  body?: unknown,
  options?: { headers?: Record<string, string>; authToken?: string }
) {
  return testRequest(app, 'PUT', path, { body, ...options })
}

// DELETE 요청 헬퍼
export async function del(
  app: Hono,
  path: string,
  options?: { headers?: Record<string, string>; authToken?: string }
) {
  return testRequest(app, 'DELETE', path, options)
}

// Mock 데이터
export const mockUser = {
  id: 'user_test_123',
  clerkId: 'clerk_test_123',
  email: 'test@example.com',
  name: 'Test User',
  imageUrl: null,
}

export const mockGuide = {
  id: 'guide_test_123',
  userId: 'user_test_123',
  slug: 'test-guide',
  title: '테스트 안내서',
  accommodationName: '테스트 숙소',
  isPublished: false,
  themeId: null,
  themeSettings: null,
}

export const mockBlock = {
  id: 'block_test_123',
  guideId: 'guide_test_123',
  type: 'hero',
  order: 0,
  content: {
    title: '환영합니다',
    subtitle: '테스트 숙소에 오신 것을 환영합니다',
  },
  isVisible: true,
}

// 테스트용 인증 토큰 (Mock)
export const mockAuthToken = 'test_auth_token_123'
