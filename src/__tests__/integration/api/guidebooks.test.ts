/**
 * Guidebook API Integration Tests (TDD)
 * Phase 3, T3.1
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { db } from '@/db';
import { guidebooks, hosts } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { GET as getGuidebooks, POST as createGuidebook } from '@/app/api/guidebooks/route';
import {
  GET as getGuidebook,
  PUT as updateGuidebook,
  DELETE as deleteGuidebook,
} from '@/app/api/guidebooks/[id]/route';
import { GET as getPublicGuidebook } from '@/app/api/public/guidebooks/[slug]/route';
import { NextRequest } from 'next/server';

describe('Guidebook API Integration Tests', () => {
  let testHostId: string;
  let testGuidebookId: string;

  beforeAll(async () => {
    // 테스트용 호스트 생성
    const [host] = await db
      .insert(hosts)
      .values({
        email: `test-guidebook-${Date.now()}@example.com`,
        name: 'Test Host',
      })
      .returning();
    testHostId = host.id;
  });

  afterAll(async () => {
    // 테스트 데이터 정리 (cascade로 가이드북도 삭제됨)
    if (testHostId) {
      await db.delete(hosts).where(eq(hosts.id, testHostId));
    }
  });

  beforeEach(async () => {
    // 각 테스트 전에 가이드북 데이터 정리
    await db.delete(guidebooks).where(eq(guidebooks.hostId, testHostId));
  });

  describe('GET /api/guidebooks', () => {
    it('호스트의 가이드북 목록을 조회한다', async () => {
      // Arrange: 테스트 가이드북 생성
      await db.insert(guidebooks).values([
        {
          hostId: testHostId,
          slug: `test-guidebook-1-${Date.now()}`,
          title: '첫 번째 가이드북',
          description: '설명 1',
          isPublished: true,
        },
        {
          hostId: testHostId,
          slug: `test-guidebook-2-${Date.now()}`,
          title: '두 번째 가이드북',
          description: '설명 2',
          isPublished: false,
        },
      ]);

      // Act: API 호출 (hostId 쿼리 파라미터 포함)
      const request = new NextRequest(`http://localhost:3000/api/guidebooks?hostId=${testHostId}`);
      const response = await getGuidebooks(request);
      const result = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data).toHaveLength(2);
    });

    it('hostId 없이 요청하면 400 에러 반환', async () => {
      // Act
      const request = new NextRequest('http://localhost:3000/api/guidebooks');
      const response = await getGuidebooks(request);
      const result = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(result.error).toBeDefined();
      expect(result.error.code).toBe('VALIDATION_ERROR');
    });

    it('가이드북을 최신순으로 정렬하여 반환한다', async () => {
      // Arrange
      const now = Date.now();
      await db.insert(guidebooks).values([
        {
          hostId: testHostId,
          slug: `first-${now}`,
          title: 'First',
        },
      ]);

      // 약간의 시간 차를 두고 두 번째 생성
      await new Promise((resolve) => setTimeout(resolve, 10));

      await db.insert(guidebooks).values([
        {
          hostId: testHostId,
          slug: `second-${now}`,
          title: 'Second',
        },
      ]);

      // Act
      const request = new NextRequest(`http://localhost:3000/api/guidebooks?hostId=${testHostId}`);
      const response = await getGuidebooks(request);
      const result = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(result.data).toHaveLength(2);
      expect(result.data[0].title).toBe('Second'); // 최신이 먼저
      expect(result.data[1].title).toBe('First');
    });
  });

  describe('POST /api/guidebooks', () => {
    it('새 가이드북을 생성한다', async () => {
      // Arrange
      const newGuidebook = {
        hostId: testHostId,
        slug: `new-guidebook-${Date.now()}`,
        title: 'New Guidebook',
        description: 'A new guidebook description',
        isPublished: false,
      };

      // Act
      const request = new NextRequest('http://localhost:3000/api/guidebooks', {
        method: 'POST',
        body: JSON.stringify(newGuidebook),
      });
      const response = await createGuidebook(request);
      const result = await response.json();

      // Assert
      expect(response.status).toBe(201);
      expect(result.data).toBeDefined();
      expect(result.data.id).toBeDefined();
      expect(result.data.title).toBe('New Guidebook');
      expect(result.data.slug).toBe(newGuidebook.slug);

      // DB 확인
      const dbGuidebooks = await db.select().from(guidebooks).where(eq(guidebooks.hostId, testHostId));
      expect(dbGuidebooks).toHaveLength(1);
      testGuidebookId = result.data.id;
    });

    it('중복된 slug로 400 에러 반환', async () => {
      // Arrange
      const slug = `duplicate-slug-${Date.now()}`;
      await db.insert(guidebooks).values({
        hostId: testHostId,
        slug,
        title: 'Existing Guidebook',
      });

      const duplicateGuidebook = {
        hostId: testHostId,
        slug, // 중복 slug
        title: 'New Guidebook',
      };

      // Act
      const request = new NextRequest('http://localhost:3000/api/guidebooks', {
        method: 'POST',
        body: JSON.stringify(duplicateGuidebook),
      });
      const response = await createGuidebook(request);
      const result = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(result.error).toBeDefined();
      expect(result.error.code).toBe('DUPLICATE_SLUG');
    });

    it('유효하지 않은 slug 형식으로 400 에러 반환', async () => {
      // Arrange
      const invalidGuidebook = {
        hostId: testHostId,
        slug: 'Invalid Slug With Spaces!', // 소문자, 숫자, 하이픈만 허용
        title: 'Test',
      };

      // Act
      const request = new NextRequest('http://localhost:3000/api/guidebooks', {
        method: 'POST',
        body: JSON.stringify(invalidGuidebook),
      });
      const response = await createGuidebook(request);
      const result = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(result.error).toBeDefined();
      expect(result.error.code).toBe('VALIDATION_ERROR');
    });

    it('필수 필드 누락 시 400 에러 반환', async () => {
      // Arrange
      const incompleteGuidebook = {
        hostId: testHostId,
        // slug 누락
        title: 'Test',
      };

      // Act
      const request = new NextRequest('http://localhost:3000/api/guidebooks', {
        method: 'POST',
        body: JSON.stringify(incompleteGuidebook),
      });
      const response = await createGuidebook(request);
      const result = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(result.error).toBeDefined();
    });
  });

  describe('GET /api/guidebooks/[id]', () => {
    beforeEach(async () => {
      // 테스트 가이드북 생성
      const [guidebook] = await db
        .insert(guidebooks)
        .values({
          hostId: testHostId,
          slug: `test-detail-${Date.now()}`,
          title: 'Detail Test Guidebook',
          description: 'Test description',
          isPublished: true,
        })
        .returning();
      testGuidebookId = guidebook.id;
    });

    it('특정 가이드북을 조회한다', async () => {
      // Act
      const request = new NextRequest(`http://localhost:3000/api/guidebooks/${testGuidebookId}`);
      const response = await getGuidebook(request, { params: { id: testGuidebookId } });
      const result = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(result.data).toBeDefined();
      expect(result.data.id).toBe(testGuidebookId);
      expect(result.data.title).toBe('Detail Test Guidebook');
    });

    it('존재하지 않는 가이드북은 404 반환', async () => {
      // Act
      const request = new NextRequest(
        'http://localhost:3000/api/guidebooks/00000000-0000-0000-0000-000000000000'
      );
      const response = await getGuidebook(request, {
        params: { id: '00000000-0000-0000-0000-000000000000' },
      });
      const result = await response.json();

      // Assert
      expect(response.status).toBe(404);
      expect(result.error).toBeDefined();
      expect(result.error.code).toBe('NOT_FOUND');
    });

    it('잘못된 UUID 형식은 400 반환', async () => {
      // Act
      const request = new NextRequest('http://localhost:3000/api/guidebooks/invalid-uuid');
      const response = await getGuidebook(request, { params: { id: 'invalid-uuid' } });
      const result = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(result.error).toBeDefined();
      expect(result.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('PUT /api/guidebooks/[id]', () => {
    beforeEach(async () => {
      const [guidebook] = await db
        .insert(guidebooks)
        .values({
          hostId: testHostId,
          slug: `test-update-${Date.now()}`,
          title: 'Original Title',
          description: 'Original description',
          isPublished: false,
        })
        .returning();
      testGuidebookId = guidebook.id;
    });

    it('가이드북을 수정한다', async () => {
      // Arrange
      const updates = {
        title: 'Updated Title',
        description: 'Updated description',
        isPublished: true,
      };

      // Act
      const request = new NextRequest(`http://localhost:3000/api/guidebooks/${testGuidebookId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      const response = await updateGuidebook(request, { params: { id: testGuidebookId } });
      const result = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(result.data.title).toBe('Updated Title');
      expect(result.data.description).toBe('Updated description');
      expect(result.data.isPublished).toBe(true);

      // DB 확인
      const [dbGuidebook] = await db.select().from(guidebooks).where(eq(guidebooks.id, testGuidebookId));
      expect(dbGuidebook.title).toBe('Updated Title');
    });

    it('slug만 수정할 수 있다', async () => {
      // Arrange
      const newSlug = `updated-slug-${Date.now()}`;

      // Act
      const request = new NextRequest(`http://localhost:3000/api/guidebooks/${testGuidebookId}`, {
        method: 'PUT',
        body: JSON.stringify({ slug: newSlug }),
      });
      const response = await updateGuidebook(request, { params: { id: testGuidebookId } });
      const result = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(result.data.slug).toBe(newSlug);
    });

    it('존재하지 않는 가이드북 수정 시 404 반환', async () => {
      // Act
      const request = new NextRequest(
        'http://localhost:3000/api/guidebooks/00000000-0000-0000-0000-000000000000',
        {
          method: 'PUT',
          body: JSON.stringify({ title: 'Test' }),
        }
      );
      const response = await updateGuidebook(request, {
        params: { id: '00000000-0000-0000-0000-000000000000' },
      });
      const result = await response.json();

      // Assert
      expect(response.status).toBe(404);
      expect(result.error.code).toBe('NOT_FOUND');
    });

    it('중복된 slug로 변경 시 400 에러 반환', async () => {
      // Arrange: 다른 가이드북 생성
      const existingSlug = `existing-slug-${Date.now()}`;
      await db.insert(guidebooks).values({
        hostId: testHostId,
        slug: existingSlug,
        title: 'Existing',
      });

      // Act: 해당 slug로 변경 시도
      const request = new NextRequest(`http://localhost:3000/api/guidebooks/${testGuidebookId}`, {
        method: 'PUT',
        body: JSON.stringify({ slug: existingSlug }),
      });
      const response = await updateGuidebook(request, { params: { id: testGuidebookId } });
      const result = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(result.error.code).toBe('DUPLICATE_SLUG');
    });
  });

  describe('DELETE /api/guidebooks/[id]', () => {
    beforeEach(async () => {
      const [guidebook] = await db
        .insert(guidebooks)
        .values({
          hostId: testHostId,
          slug: `test-delete-${Date.now()}`,
          title: 'To Delete',
        })
        .returning();
      testGuidebookId = guidebook.id;
    });

    it('가이드북을 삭제한다', async () => {
      // Act
      const request = new NextRequest(`http://localhost:3000/api/guidebooks/${testGuidebookId}`, {
        method: 'DELETE',
      });
      const response = await deleteGuidebook(request, { params: { id: testGuidebookId } });
      const result = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(result.data).toBeDefined();
      expect(result.data.success).toBe(true);

      // DB 확인
      const dbGuidebooks = await db.select().from(guidebooks).where(eq(guidebooks.id, testGuidebookId));
      expect(dbGuidebooks).toHaveLength(0);
    });

    it('존재하지 않는 가이드북 삭제 시 404 반환', async () => {
      // Act
      const request = new NextRequest(
        'http://localhost:3000/api/guidebooks/00000000-0000-0000-0000-000000000000',
        { method: 'DELETE' }
      );
      const response = await deleteGuidebook(request, {
        params: { id: '00000000-0000-0000-0000-000000000000' },
      });
      const result = await response.json();

      // Assert
      expect(response.status).toBe(404);
      expect(result.error.code).toBe('NOT_FOUND');
    });
  });

  describe('GET /api/public/guidebooks/[slug]', () => {
    beforeEach(async () => {
      await db.insert(guidebooks).values([
        {
          hostId: testHostId,
          slug: 'public-test-guidebook',
          title: 'Public Guidebook',
          description: 'This is a public guidebook',
          isPublished: true,
        },
        {
          hostId: testHostId,
          slug: 'private-test-guidebook',
          title: 'Private Guidebook',
          description: 'This is private',
          isPublished: false,
        },
      ]);
    });

    it('공개된 가이드북을 slug로 조회한다', async () => {
      // Act
      const request = new NextRequest('http://localhost:3000/api/public/guidebooks/public-test-guidebook');
      const response = await getPublicGuidebook(request, { params: { slug: 'public-test-guidebook' } });
      const result = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(result.data).toBeDefined();
      expect(result.data.title).toBe('Public Guidebook');
      expect(result.data.slug).toBe('public-test-guidebook');
    });

    it('비공개 가이드북은 404 반환', async () => {
      // Act
      const request = new NextRequest('http://localhost:3000/api/public/guidebooks/private-test-guidebook');
      const response = await getPublicGuidebook(request, { params: { slug: 'private-test-guidebook' } });
      const result = await response.json();

      // Assert
      expect(response.status).toBe(404);
      expect(result.error.code).toBe('NOT_FOUND');
    });

    it('존재하지 않는 slug는 404 반환', async () => {
      // Act
      const request = new NextRequest('http://localhost:3000/api/public/guidebooks/non-existent');
      const response = await getPublicGuidebook(request, { params: { slug: 'non-existent' } });
      const result = await response.json();

      // Assert
      expect(response.status).toBe(404);
      expect(result.error.code).toBe('NOT_FOUND');
    });

    it('조회 시 viewCount가 증가한다', async () => {
      // Act: 첫 번째 조회
      const request1 = new NextRequest('http://localhost:3000/api/public/guidebooks/public-test-guidebook');
      await getPublicGuidebook(request1, { params: { slug: 'public-test-guidebook' } });

      // Act: 두 번째 조회
      const request2 = new NextRequest('http://localhost:3000/api/public/guidebooks/public-test-guidebook');
      const response = await getPublicGuidebook(request2, { params: { slug: 'public-test-guidebook' } });
      const result = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(result.data.viewCount).toBe(2);
    });
  });
});
