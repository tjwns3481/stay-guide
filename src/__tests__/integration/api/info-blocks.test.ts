/**
 * Info Blocks API Integration Tests (TDD)
 * Phase 2, T2.2
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { db } from '@/db';
import { blocks, guidebooks, hosts } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { GET as getBlocks, POST as createBlock } from '@/app/api/guidebooks/[id]/blocks/route';
import {
  GET as getBlock,
  PUT as updateBlock,
  DELETE as deleteBlock,
} from '@/app/api/guidebooks/[id]/blocks/[blockId]/route';
import { NextRequest } from 'next/server';

describe('Info Blocks API Integration Tests', () => {
  let testHostId: string;
  let testGuidebookId: string;
  let testBlockId: string;

  beforeAll(async () => {
    // 테스트용 호스트 생성
    const [host] = await db
      .insert(hosts)
      .values({
        email: `test-blocks-${Date.now()}@example.com`,
        name: 'Test Host',
      })
      .returning();
    testHostId = host.id;

    // 테스트용 가이드북 생성
    const [guidebook] = await db
      .insert(guidebooks)
      .values({
        hostId: testHostId,
        slug: `test-guidebook-${Date.now()}`,
        title: 'Test Guidebook',
        description: 'Test Description',
      })
      .returning();
    testGuidebookId = guidebook.id;
  });

  afterAll(async () => {
    // 테스트 데이터 정리 (cascade로 자동 삭제됨)
    if (testHostId) {
      await db.delete(hosts).where(eq(hosts.id, testHostId));
    }
  });

  beforeEach(async () => {
    // 각 테스트 전에 블록 데이터 정리
    await db.delete(blocks).where(eq(blocks.guidebookId, testGuidebookId));
  });

  describe('GET /api/guidebooks/[id]/blocks', () => {
    it('가이드북의 블록 목록을 조회한다', async () => {
      // Arrange: 테스트 블록 생성
      await db.insert(blocks).values([
        {
          guidebookId: testGuidebookId,
          type: 'wifi',
          title: 'Wi-Fi 정보',
          content: { ssid: 'TestWiFi', password: '12345678' },
          order: 0,
        },
        {
          guidebookId: testGuidebookId,
          type: 'map',
          title: '위치 정보',
          content: { address: '서울시', latitude: 37.5665, longitude: 126.978 },
          order: 1,
        },
      ]);

      // Act: API 호출
      const request = new NextRequest(`http://localhost:3000/api/guidebooks/${testGuidebookId}/blocks`);
      const response = await getBlocks(request, { params: { id: testGuidebookId } });
      const result = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data).toHaveLength(2);
      expect(result.data[0].title).toBe('Wi-Fi 정보');
    });

    it('블록을 order 순으로 정렬하여 반환한다', async () => {
      // Arrange
      await db.insert(blocks).values([
        {
          guidebookId: testGuidebookId,
          type: 'wifi',
          title: 'Third',
          content: { ssid: 'test', password: 'test' },
          order: 2,
        },
        {
          guidebookId: testGuidebookId,
          type: 'map',
          title: 'First',
          content: { address: 'test', latitude: 0, longitude: 0 },
          order: 0,
        },
        {
          guidebookId: testGuidebookId,
          type: 'custom',
          title: 'Second',
          content: { text: 'test' },
          order: 1,
        },
      ]);

      // Act
      const request = new NextRequest(`http://localhost:3000/api/guidebooks/${testGuidebookId}/blocks`);
      const response = await getBlocks(request, { params: { id: testGuidebookId } });
      const result = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(result.data[0].title).toBe('First');
      expect(result.data[1].title).toBe('Second');
      expect(result.data[2].title).toBe('Third');
      expect(result.data[0].order).toBe(0);
      expect(result.data[1].order).toBe(1);
      expect(result.data[2].order).toBe(2);
    });

    it('존재하지 않는 가이드북은 빈 배열을 반환한다', async () => {
      // Act
      const request = new NextRequest(
        'http://localhost:3000/api/guidebooks/00000000-0000-0000-0000-000000000000/blocks'
      );
      const response = await getBlocks(request, {
        params: { id: '00000000-0000-0000-0000-000000000000' },
      });
      const result = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data).toHaveLength(0);
    });
  });

  describe('POST /api/guidebooks/[id]/blocks', () => {
    it('새 블록을 생성한다', async () => {
      // Arrange
      const newBlock = {
        type: 'wifi',
        title: 'New Wi-Fi Info',
        content: { ssid: 'NewWiFi', password: 'password123' },
        order: 0,
        isVisible: true,
      };

      // Act
      const request = new NextRequest(`http://localhost:3000/api/guidebooks/${testGuidebookId}/blocks`, {
        method: 'POST',
        body: JSON.stringify(newBlock),
      });
      const response = await createBlock(request, { params: { id: testGuidebookId } });
      const result = await response.json();

      // Assert
      expect(response.status).toBe(201);
      expect(result.data).toBeDefined();
      expect(result.data.id).toBeDefined();
      expect(result.data.title).toBe('New Wi-Fi Info');
      expect(result.data.guidebookId).toBe(testGuidebookId);

      // DB 확인
      const dbBlocks = await db.select().from(blocks).where(eq(blocks.guidebookId, testGuidebookId));
      expect(dbBlocks).toHaveLength(1);
      testBlockId = result.data.id;
    });

    it('유효하지 않은 데이터로 400 에러 반환', async () => {
      // Arrange
      const invalidBlock = {
        type: 'invalid_type',
        title: '',
        content: {},
      };

      // Act
      const request = new NextRequest(`http://localhost:3000/api/guidebooks/${testGuidebookId}/blocks`, {
        method: 'POST',
        body: JSON.stringify(invalidBlock),
      });
      const response = await createBlock(request, { params: { id: testGuidebookId } });
      const result = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(result.error).toBeDefined();
      expect(result.error.code).toBe('VALIDATION_ERROR');
    });

    it('content 필드가 타입에 맞지 않으면 400 에러 반환', async () => {
      // Arrange
      const invalidContent = {
        type: 'wifi',
        title: 'WiFi',
        content: { wrongField: 'test' }, // ssid, password 누락
      };

      // Act
      const request = new NextRequest(`http://localhost:3000/api/guidebooks/${testGuidebookId}/blocks`, {
        method: 'POST',
        body: JSON.stringify(invalidContent),
      });
      const response = await createBlock(request, { params: { id: testGuidebookId } });
      const result = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(result.error).toBeDefined();
    });
  });

  describe('GET /api/guidebooks/[id]/blocks/[blockId]', () => {
    beforeEach(async () => {
      // 테스트 블록 생성
      const [block] = await db
        .insert(blocks)
        .values({
          guidebookId: testGuidebookId,
          type: 'checkin',
          title: 'Check-in Info',
          content: { checkinTime: '15:00', checkoutTime: '11:00' },
          order: 0,
        })
        .returning();
      testBlockId = block.id;
    });

    it('특정 블록을 조회한다', async () => {
      // Act
      const request = new NextRequest(
        `http://localhost:3000/api/guidebooks/${testGuidebookId}/blocks/${testBlockId}`
      );
      const response = await getBlock(request, { params: { id: testGuidebookId, blockId: testBlockId } });
      const result = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(result.data).toBeDefined();
      expect(result.data.id).toBe(testBlockId);
      expect(result.data.title).toBe('Check-in Info');
      expect(result.data.type).toBe('checkin');
    });

    it('존재하지 않는 블록은 404 반환', async () => {
      // Act
      const request = new NextRequest(
        `http://localhost:3000/api/guidebooks/${testGuidebookId}/blocks/00000000-0000-0000-0000-000000000000`
      );
      const response = await getBlock(request, {
        params: { id: testGuidebookId, blockId: '00000000-0000-0000-0000-000000000000' },
      });
      const result = await response.json();

      // Assert
      expect(response.status).toBe(404);
      expect(result.error).toBeDefined();
      expect(result.error.code).toBe('NOT_FOUND');
      expect(result.error.message).toBe('블록을 찾을 수 없습니다');
    });

    it('다른 가이드북의 블록은 404 반환', async () => {
      // Act
      const request = new NextRequest(
        `http://localhost:3000/api/guidebooks/00000000-0000-0000-0000-000000000000/blocks/${testBlockId}`
      );
      const response = await getBlock(request, {
        params: { id: '00000000-0000-0000-0000-000000000000', blockId: testBlockId },
      });
      const result = await response.json();

      // Assert
      expect(response.status).toBe(404);
      expect(result.error.code).toBe('NOT_FOUND');
    });
  });

  describe('PUT /api/guidebooks/[id]/blocks/[blockId]', () => {
    beforeEach(async () => {
      const [block] = await db
        .insert(blocks)
        .values({
          guidebookId: testGuidebookId,
          type: 'custom',
          title: 'Original Title',
          content: { text: 'Original text' },
          order: 0,
        })
        .returning();
      testBlockId = block.id;
    });

    it('블록을 수정한다', async () => {
      // Arrange
      const updates = {
        title: 'Updated Title',
        content: { text: 'Updated text' },
        order: 5,
      };

      // Act
      const request = new NextRequest(
        `http://localhost:3000/api/guidebooks/${testGuidebookId}/blocks/${testBlockId}`,
        {
          method: 'PUT',
          body: JSON.stringify(updates),
        }
      );
      const response = await updateBlock(request, { params: { id: testGuidebookId, blockId: testBlockId } });
      const result = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(result.data.title).toBe('Updated Title');
      expect(result.data.order).toBe(5);

      // DB 확인
      const [dbBlock] = await db.select().from(blocks).where(eq(blocks.id, testBlockId));
      expect(dbBlock.title).toBe('Updated Title');
      expect(dbBlock.order).toBe(5);
    });

    it('존재하지 않는 블록 수정 시 404 반환', async () => {
      // Act
      const request = new NextRequest(
        `http://localhost:3000/api/guidebooks/${testGuidebookId}/blocks/00000000-0000-0000-0000-000000000000`,
        {
          method: 'PUT',
          body: JSON.stringify({ title: 'Test' }),
        }
      );
      const response = await updateBlock(request, {
        params: { id: testGuidebookId, blockId: '00000000-0000-0000-0000-000000000000' },
      });
      const result = await response.json();

      // Assert
      expect(response.status).toBe(404);
      expect(result.error.code).toBe('NOT_FOUND');
    });

    it('유효하지 않은 데이터로 400 에러 반환', async () => {
      // Arrange
      const invalidUpdates = {
        type: 'invalid_type',
      };

      // Act
      const request = new NextRequest(
        `http://localhost:3000/api/guidebooks/${testGuidebookId}/blocks/${testBlockId}`,
        {
          method: 'PUT',
          body: JSON.stringify(invalidUpdates),
        }
      );
      const response = await updateBlock(request, { params: { id: testGuidebookId, blockId: testBlockId } });
      const result = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(result.error).toBeDefined();
    });
  });

  describe('DELETE /api/guidebooks/[id]/blocks/[blockId]', () => {
    beforeEach(async () => {
      const [block] = await db
        .insert(blocks)
        .values({
          guidebookId: testGuidebookId,
          type: 'recommendation',
          title: 'To Delete',
          content: { category: 'test', items: [] },
          order: 0,
        })
        .returning();
      testBlockId = block.id;
    });

    it('블록을 삭제한다', async () => {
      // Act
      const request = new NextRequest(
        `http://localhost:3000/api/guidebooks/${testGuidebookId}/blocks/${testBlockId}`,
        { method: 'DELETE' }
      );
      const response = await deleteBlock(request, { params: { id: testGuidebookId, blockId: testBlockId } });
      const result = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(result.data).toBeDefined();
      expect(result.data.success).toBe(true);

      // DB 확인
      const dbBlocks = await db.select().from(blocks).where(eq(blocks.id, testBlockId));
      expect(dbBlocks).toHaveLength(0);
    });

    it('존재하지 않는 블록 삭제 시 404 반환', async () => {
      // Act
      const request = new NextRequest(
        `http://localhost:3000/api/guidebooks/${testGuidebookId}/blocks/00000000-0000-0000-0000-000000000000`,
        { method: 'DELETE' }
      );
      const response = await deleteBlock(request, {
        params: { id: testGuidebookId, blockId: '00000000-0000-0000-0000-000000000000' },
      });
      const result = await response.json();

      // Assert
      expect(response.status).toBe(404);
      expect(result.error.code).toBe('NOT_FOUND');
    });

    it('다른 가이드북의 블록은 삭제할 수 없다', async () => {
      // Act
      const request = new NextRequest(
        `http://localhost:3000/api/guidebooks/00000000-0000-0000-0000-000000000000/blocks/${testBlockId}`,
        { method: 'DELETE' }
      );
      const response = await deleteBlock(request, {
        params: { id: '00000000-0000-0000-0000-000000000000', blockId: testBlockId },
      });
      const result = await response.json();

      // Assert
      expect(response.status).toBe(404);
      expect(result.error.code).toBe('NOT_FOUND');
    });
  });
});
