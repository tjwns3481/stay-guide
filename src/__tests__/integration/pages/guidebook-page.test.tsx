/**
 * Guidebook Page Tests (TDD)
 * Phase 3, T3.3 - SSG/ISR 설정
 */

import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import { db } from '@/db';
import { guidebooks, hosts, blocks } from '@/db/schema';
import { eq } from 'drizzle-orm';

// React cache mock (서버 컴포넌트 전용 기능)
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    cache: (fn: Function) => fn,
  };
});

import { getGuidebookBySlug, getGuidebookBlocks } from '@/lib/data/guidebook';

// Mock useCopyToClipboard
vi.mock('@/hooks/useCopyToClipboard', () => ({
  useCopyToClipboard: () => ({
    copied: false,
    copyToClipboard: vi.fn(),
  }),
}));

describe('Guidebook Page Data Fetching', () => {
  let testHostId: string;
  let testGuidebookId: string;

  beforeAll(async () => {
    // 테스트용 호스트 생성
    const [host] = await db
      .insert(hosts)
      .values({
        email: `test-ssg-${Date.now()}@example.com`,
        name: 'Test Host',
      })
      .returning();
    testHostId = host.id;

    // 테스트용 가이드북 생성
    const [guidebook] = await db
      .insert(guidebooks)
      .values({
        hostId: testHostId,
        slug: 'test-ssg-guidebook',
        title: 'SSG 테스트 가이드북',
        description: 'SSG/ISR 테스트용',
        isPublished: true,
      })
      .returning();
    testGuidebookId = guidebook.id;

    // 테스트용 블록 생성
    await db.insert(blocks).values([
      {
        guidebookId: testGuidebookId,
        type: 'wifi',
        title: 'Wi-Fi',
        content: { ssid: 'TestSSID', password: 'TestPass' },
        order: 0,
        isVisible: true,
      },
      {
        guidebookId: testGuidebookId,
        type: 'checkin',
        title: 'Check-in',
        content: { checkinTime: '15:00', checkoutTime: '11:00' },
        order: 1,
        isVisible: true,
      },
    ]);
  });

  afterAll(async () => {
    // 테스트 데이터 정리
    if (testHostId) {
      await db.delete(hosts).where(eq(hosts.id, testHostId));
    }
  });

  describe('getGuidebookBySlug', () => {
    it('공개된 가이드북을 slug로 조회한다', async () => {
      const guidebook = await getGuidebookBySlug('test-ssg-guidebook');

      expect(guidebook).not.toBeNull();
      expect(guidebook?.title).toBe('SSG 테스트 가이드북');
      expect(guidebook?.isPublished).toBe(true);
    });

    it('비공개 가이드북은 null을 반환한다', async () => {
      // 비공개 가이드북 생성
      await db.insert(guidebooks).values({
        hostId: testHostId,
        slug: 'private-test-guidebook',
        title: 'Private',
        isPublished: false,
      });

      const guidebook = await getGuidebookBySlug('private-test-guidebook');

      expect(guidebook).toBeNull();

      // 정리
      await db.delete(guidebooks).where(eq(guidebooks.slug, 'private-test-guidebook'));
    });

    it('존재하지 않는 slug는 null을 반환한다', async () => {
      const guidebook = await getGuidebookBySlug('non-existent-slug');

      expect(guidebook).toBeNull();
    });
  });

  describe('getGuidebookBlocks', () => {
    it('가이드북의 블록 목록을 조회한다', async () => {
      const blockList = await getGuidebookBlocks(testGuidebookId);

      expect(blockList).toHaveLength(2);
      expect(blockList[0].type).toBe('wifi');
      expect(blockList[1].type).toBe('checkin');
    });

    it('블록을 order 순으로 정렬한다', async () => {
      const blockList = await getGuidebookBlocks(testGuidebookId);

      expect(blockList[0].order).toBe(0);
      expect(blockList[1].order).toBe(1);
    });

    it('존재하지 않는 가이드북은 빈 배열을 반환한다', async () => {
      const blockList = await getGuidebookBlocks('00000000-0000-0000-0000-000000000000');

      expect(blockList).toHaveLength(0);
    });
  });
});

describe('Guidebook Page Rendering', () => {
  it('GuidebookView가 export 되어 있다', async () => {
    const { GuidebookView } = await import('@/components/guidebook/GuidebookView');
    expect(GuidebookView).toBeDefined();
  });

  it('NotFound 컴포넌트가 export 되어 있다', async () => {
    const NotFound = await import('@/app/g/[slug]/not-found');
    expect(NotFound.default).toBeDefined();
  });

  it('Loading 컴포넌트가 export 되어 있다', async () => {
    const Loading = await import('@/app/g/[slug]/loading');
    expect(Loading.default).toBeDefined();
  });
});
