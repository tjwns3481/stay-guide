/**
 * Auth API Mock Handlers
 */

import { http, HttpResponse } from 'msw';
import { mockUser, mockSession } from '../data';

export const authHandlers = [
  // POST /api/auth/signup - 회원가입
  http.post('/api/auth/signup', async ({ request }) => {
    const body = (await request.json()) as {
      email: string;
      password: string;
      name?: string;
    };

    // 유효성 검증 실패 시뮬레이션
    if (!body.email || !body.password) {
      return HttpResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: '필수 필드가 누락되었습니다',
            details: [
              !body.email && { field: 'email', message: '이메일은 필수입니다' },
              !body.password && { field: 'password', message: '비밀번호는 필수입니다' },
            ].filter(Boolean),
          },
        },
        { status: 400 }
      );
    }

    // 이메일 중복 체크
    if (body.email === 'duplicate@example.com') {
      return HttpResponse.json(
        {
          error: {
            code: 'EMAIL_ALREADY_EXISTS',
            message: '이미 사용 중인 이메일입니다',
          },
        },
        { status: 409 }
      );
    }

    const newUser = {
      id: `user-${Date.now()}`,
      email: body.email,
      name: body.name || 'New User',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json({ data: { user: newUser } }, { status: 201 });
  }),

  // POST /api/auth/login
  http.post('/api/auth/login', async ({ request }) => {
    const body = await request.json();
    const { email, password } = body as { email: string; password: string };

    // Mock: 특정 이메일/비밀번호 조합만 성공
    if (email === 'test@example.com' && password === 'password123') {
      return HttpResponse.json({
        data: {
          session: mockSession,
          user: mockUser,
        },
      });
    }

    // 잘못된 자격증명
    return HttpResponse.json(
      {
        error: {
          code: 'INVALID_CREDENTIALS',
          message: '이메일 또는 비밀번호가 올바르지 않습니다',
        },
      },
      { status: 401 }
    );
  }),

  // POST /api/auth/logout
  http.post('/api/auth/logout', () => {
    return HttpResponse.json({ data: { success: true } });
  }),

  // GET /api/auth/session
  http.get('/api/auth/session', () => {
    return HttpResponse.json({ data: { session: mockSession } });
  }),
];
