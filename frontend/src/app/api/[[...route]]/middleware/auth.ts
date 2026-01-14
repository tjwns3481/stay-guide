import { Context, Next } from 'hono'
import { createClerkClient, verifyToken } from '@clerk/backend'

const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY || 'test_secret_key',
})

export interface AuthContext {
  userId: string
  sessionId: string
}

declare module 'hono' {
  interface ContextVariableMap {
    auth: AuthContext
  }
}

// 테스트용 토큰 및 사용자 ID (테스트 환경에서만 사용)
const TEST_AUTH_TOKEN = 'test_auth_token_123'
const TEST_USER_ID = 'clerk_test_123'
const TEST_SESSION_ID = 'session_test_123'

export const authMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization')

  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized', message: 'Missing or invalid authorization header' }, 401)
  }

  const token = authHeader.slice(7)

  // 테스트 환경에서 테스트 토큰 허용
  if (process.env.NODE_ENV === 'test' && token === TEST_AUTH_TOKEN) {
    c.set('auth', {
      userId: TEST_USER_ID,
      sessionId: TEST_SESSION_ID,
    })
    await next()
    return
  }

  // 테스트 환경에서 clerk- 프리픽스로 시작하는 토큰은 userId로 사용
  if (process.env.NODE_ENV === 'test' && token.startsWith('clerk-')) {
    c.set('auth', {
      userId: 'test-user-id', // 테스트에서 고정된 userId 사용
      sessionId: 'test-session-id',
    })
    await next()
    return
  }

  try {
    // JWT 토큰 검증
    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY || 'test_secret_key',
    })

    if (!payload || !payload.sub) {
      return c.json({ error: 'Unauthorized', message: 'Invalid token' }, 401)
    }

    c.set('auth', {
      userId: payload.sub, // sub는 Clerk의 userId
      sessionId: payload.sid || 'unknown',
    })

    await next()
  } catch (error) {
    console.error('Auth error:', error)
    return c.json({ error: 'Unauthorized', message: 'Authentication failed' }, 401)
  }
}

// Optional auth - doesn't fail if no token
export const optionalAuthMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization')

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7)

    try {
      const payload = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY || 'test_secret_key',
      })

      if (payload && payload.sub) {
        c.set('auth', {
          userId: payload.sub,
          sessionId: payload.sid || 'unknown',
        })
      }
    } catch {
      // Ignore auth errors for optional auth
    }
  }

  await next()
}
