/**
 * MSW 핸들러 - Guidebook API
 */

import { http, HttpResponse } from 'msw';
import { mockGuidebooks } from '../data/guidebooks';
import type { MockGuidebook } from '../data/guidebooks';

let guidebooks = [...mockGuidebooks];

export const guidebookHandlers = [
  // GET /api/guidebooks - 가이드북 목록 조회
  http.get('/api/guidebooks', ({ request }) => {
    const url = new URL(request.url);
    const hostId = url.searchParams.get('hostId');

    let filteredGuidebooks = mockGuidebooks;
    if (hostId) {
      filteredGuidebooks = mockGuidebooks.filter((g) => g.hostId === hostId);
    }

    return HttpResponse.json({ data: filteredGuidebooks });
  }),

  // POST /api/guidebooks - 가이드북 생성
  http.post('/api/guidebooks', async ({ request }) => {
    const body = (await request.json()) as {
      slug: string;
      title: string;
      description?: string;
      coverImage?: string;
      isPublished?: boolean;
    };

    const newGuidebook: MockGuidebook = {
      id: `guidebook-${Date.now()}`,
      hostId: 'host-1', // 현재 사용자
      slug: body.slug,
      title: body.title,
      description: body.description || null,
      coverImage: body.coverImage || null,
      isPublished: body.isPublished || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // In-memory storage에 추가 (테스트용)
    mockGuidebooks.push(newGuidebook);

    return HttpResponse.json({ data: newGuidebook }, { status: 201 });
  }),

  // GET /api/guidebooks/:id - 특정 가이드북 조회
  http.get('/api/guidebooks/:id', ({ params }) => {
    const { id } = params;
    const guidebook = mockGuidebooks.find((g) => g.id === id);

    if (!guidebook) {
      return HttpResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: '가이드북을 찾을 수 없습니다',
          },
        },
        { status: 404 }
      );
    }

    return HttpResponse.json({ data: guidebook });
  }),

  // PUT /api/guidebooks/:id - 가이드북 수정
  http.put('/api/guidebooks/:id', async ({ params, request }) => {
    const { id } = params;
    const body = (await request.json()) as Record<string, unknown>;

    const guidebook = mockGuidebooks.find((g) => g.id === id);
    if (!guidebook) {
      return HttpResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: '가이드북을 찾을 수 없습니다',
          },
        },
        { status: 404 }
      );
    }

    const updatedGuidebook = {
      ...guidebook,
      ...body,
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json({ data: updatedGuidebook });
  }),

  // DELETE /api/guidebooks/:id - 가이드북 삭제
  http.delete('/api/guidebooks/:id', ({ params }) => {
    const guidebook = mockGuidebooks.find((g) => g.id === params.id);

    if (!guidebook) {
      return HttpResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: '가이드북을 찾을 수 없습니다',
          },
        },
        { status: 404 }
      );
    }

    return HttpResponse.json({ data: { success: true } });
  }),

  // 공개 가이드북 조회 (slug 기반)
  http.get('/api/public/guidebooks/:slug', ({ params }) => {
    const guidebook = mockGuidebooks.find(
      (g) => g.slug === params.slug && g.isPublished
    );

    if (!guidebook) {
      return HttpResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: '가이드북을 찾을 수 없습니다',
          },
        },
        { status: 404 }
      );
    }

    return HttpResponse.json({ data: guidebook });
  }),
];
