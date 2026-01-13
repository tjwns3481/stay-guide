/**
 * MSW Handlers 통합 테스트
 * T0.5.2: MSW Mock API 핸들러 검증
 */

import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { server } from '@/mocks/server';

describe('MSW Handlers 검증', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  describe('Auth Handlers', () => {
    it('POST /api/auth/signup - 회원가입 성공', async () => {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'newuser@example.com',
          password: 'password123',
          name: 'New User',
        }),
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data).toHaveProperty('data');
      expect(data.data).toHaveProperty('user');
      expect(data.data.user.email).toBe('newuser@example.com');
    });

    it('POST /api/auth/signup - 이메일 중복 에러', async () => {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'duplicate@example.com',
          password: 'password123',
        }),
      });

      expect(response.status).toBe(409);
      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(data.error.code).toBe('EMAIL_ALREADY_EXISTS');
    });

    it('POST /api/auth/login - 로그인 성공', async () => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('data');
      expect(data.data).toHaveProperty('session');
      expect(data.data).toHaveProperty('user');
    });

    it('POST /api/auth/login - 잘못된 자격증명', async () => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'wrong@example.com',
          password: 'wrongpassword',
        }),
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(data.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('POST /api/auth/logout - 로그아웃 성공', async () => {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data.success).toBe(true);
    });
  });

  describe('Guidebook Handlers', () => {
    it('GET /api/guidebooks - 가이드북 목록 조회', async () => {
      const response = await fetch('/api/guidebooks');

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('data');
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data.length).toBeGreaterThan(0);
    });

    it('GET /api/guidebooks/:id - 특정 가이드북 조회', async () => {
      const response = await fetch('/api/guidebooks/guidebook-1');

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('data');
      expect(data.data.id).toBe('guidebook-1');
      expect(data.data).toHaveProperty('title');
    });

    it('GET /api/guidebooks/:id - 존재하지 않는 가이드북', async () => {
      const response = await fetch('/api/guidebooks/non-existent');

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(data.error.code).toBe('NOT_FOUND');
    });

    it('POST /api/guidebooks - 가이드북 생성', async () => {
      const response = await fetch('/api/guidebooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: 'new-guidebook',
          title: '새로운 가이드북',
          description: '테스트 가이드북',
          isPublished: false,
        }),
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data).toHaveProperty('data');
      expect(data.data.slug).toBe('new-guidebook');
      expect(data.data.title).toBe('새로운 가이드북');
    });

    it('GET /api/public/guidebooks/:slug - 공개 가이드북 조회', async () => {
      const response = await fetch('/api/public/guidebooks/minjis-cozy-house');

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('data');
      expect(data.data.slug).toBe('minjis-cozy-house');
      expect(data.data.isPublished).toBe(true);
    });

    it('GET /api/public/guidebooks/:slug - 비공개 가이드북 접근', async () => {
      const response = await fetch('/api/public/guidebooks/gangnam-studio');

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data).toHaveProperty('error');
    });
  });

  describe('Block Handlers', () => {
    it('GET /api/guidebooks/:guidebookId/blocks - 블록 목록 조회', async () => {
      const response = await fetch('/api/guidebooks/guidebook-1/blocks');

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('data');
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data.length).toBeGreaterThan(0);
    });

    it('POST /api/guidebooks/:guidebookId/blocks - 블록 생성', async () => {
      const response = await fetch('/api/guidebooks/guidebook-1/blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'wifi',
          title: '새 와이파이 정보',
          content: {
            ssid: 'TestWiFi',
            password: 'testpass123',
          },
          order: 0,
        }),
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data).toHaveProperty('data');
      expect(data.data.type).toBe('wifi');
      expect(data.data.title).toBe('새 와이파이 정보');
    });

    it('GET /api/guidebooks/:guidebookId/blocks/:blockId - 특정 블록 조회', async () => {
      const response = await fetch('/api/guidebooks/guidebook-1/blocks/block-1');

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('data');
      expect(data.data.id).toBe('block-1');
    });

    it('GET /api/guidebooks/:guidebookId/blocks/:blockId - 존재하지 않는 블록', async () => {
      const response = await fetch('/api/guidebooks/guidebook-1/blocks/non-existent');

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(data.error.code).toBe('NOT_FOUND');
    });
  });
});
