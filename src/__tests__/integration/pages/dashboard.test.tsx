/**
 * Dashboard Page Tests (TDD)
 * Phase 4, T4.1 - 대시보드 레이아웃
 */

import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import { db } from '@/db';
import { guidebooks, hosts } from '@/db/schema';
import { eq } from 'drizzle-orm';

// React cache mock (서버 컴포넌트 전용 기능)
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    cache: (fn: Function) => fn,
  };
});

// Mock Clerk
vi.mock('@clerk/nextjs', () => ({
  useUser: () => ({
    isLoaded: true,
    user: { id: 'test-clerk-id', firstName: 'Test' },
  }),
  useAuth: () => ({
    isLoaded: true,
    userId: 'test-clerk-id',
  }),
  ClerkProvider: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock('@clerk/nextjs/server', () => ({
  currentUser: () =>
    Promise.resolve({
      id: 'test-clerk-id',
      firstName: 'Test',
      emailAddresses: [{ emailAddress: 'test@example.com' }],
    }),
  auth: () => Promise.resolve({ userId: 'test-clerk-id' }),
}));

describe('Dashboard Components', () => {
  describe('GuidebookList', () => {
    it('GuidebookList 컴포넌트가 export 되어 있다', async () => {
      const { GuidebookList } = await import(
        '@/components/dashboard/GuidebookList'
      );
      expect(GuidebookList).toBeDefined();
    });

    it('가이드북 목록을 렌더링한다', async () => {
      const { GuidebookList } = await import(
        '@/components/dashboard/GuidebookList'
      );

      const mockGuidebooks = [
        {
          id: '1',
          slug: 'test-1',
          title: '테스트 가이드북 1',
          description: '설명 1',
          isPublished: true,
          viewCount: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          slug: 'test-2',
          title: '테스트 가이드북 2',
          description: null,
          isPublished: false,
          viewCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      render(<GuidebookList guidebooks={mockGuidebooks} />);

      expect(screen.getByText('테스트 가이드북 1')).toBeInTheDocument();
      expect(screen.getByText('테스트 가이드북 2')).toBeInTheDocument();
    });

    it('공개/비공개 상태를 표시한다', async () => {
      const { GuidebookList } = await import(
        '@/components/dashboard/GuidebookList'
      );

      const mockGuidebooks = [
        {
          id: '1',
          slug: 'test-1',
          title: '공개 가이드북',
          description: null,
          isPublished: true,
          viewCount: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          slug: 'test-2',
          title: '비공개 가이드북',
          description: null,
          isPublished: false,
          viewCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      render(<GuidebookList guidebooks={mockGuidebooks} />);

      expect(screen.getByText('공개')).toBeInTheDocument();
      expect(screen.getByText('비공개')).toBeInTheDocument();
    });

    it('빈 목록일 때 안내 메시지를 표시한다', async () => {
      const { GuidebookList } = await import(
        '@/components/dashboard/GuidebookList'
      );

      render(<GuidebookList guidebooks={[]} />);

      expect(screen.getByText(/가이드북이 없습니다/)).toBeInTheDocument();
    });

    it('편집 링크를 포함한다', async () => {
      const { GuidebookList } = await import(
        '@/components/dashboard/GuidebookList'
      );

      const mockGuidebooks = [
        {
          id: '123',
          slug: 'test',
          title: '테스트',
          description: null,
          isPublished: true,
          viewCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      render(<GuidebookList guidebooks={mockGuidebooks} />);

      const editLink = screen.getByRole('link', { name: /편집/ });
      expect(editLink).toHaveAttribute('href', '/dashboard/guidebooks/123/edit');
    });
  });

  describe('DashboardStats', () => {
    it('DashboardStats 컴포넌트가 export 되어 있다', async () => {
      const { DashboardStats } = await import(
        '@/components/dashboard/DashboardStats'
      );
      expect(DashboardStats).toBeDefined();
    });

    it('통계 정보를 표시한다', async () => {
      const { DashboardStats } = await import(
        '@/components/dashboard/DashboardStats'
      );

      const stats = {
        totalGuidebooks: 5,
        publishedGuidebooks: 3,
        totalViews: 150,
      };

      render(<DashboardStats stats={stats} />);

      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('150')).toBeInTheDocument();
    });
  });

  describe('EmptyState', () => {
    it('EmptyState 컴포넌트가 export 되어 있다', async () => {
      const { EmptyState } = await import('@/components/dashboard/EmptyState');
      expect(EmptyState).toBeDefined();
    });

    it('새 가이드북 만들기 버튼을 포함한다', async () => {
      const { EmptyState } = await import('@/components/dashboard/EmptyState');

      render(<EmptyState />);

      const createLink = screen.getByRole('link', { name: /새 가이드북/ });
      expect(createLink).toHaveAttribute('href', '/dashboard/guidebooks/new');
    });
  });
});

describe('Dashboard Data Fetching', () => {
  let testHostId: string;

  beforeAll(async () => {
    // 테스트용 호스트 생성
    const [host] = await db
      .insert(hosts)
      .values({
        email: `test-dashboard-${Date.now()}@example.com`,
        name: 'Dashboard Test Host',
      })
      .returning();
    testHostId = host.id;

    // 테스트용 가이드북 생성
    await db.insert(guidebooks).values([
      {
        hostId: testHostId,
        slug: 'dashboard-test-1',
        title: 'Dashboard Test 1',
        isPublished: true,
        viewCount: 50,
      },
      {
        hostId: testHostId,
        slug: 'dashboard-test-2',
        title: 'Dashboard Test 2',
        isPublished: false,
        viewCount: 0,
      },
    ]);
  });

  afterAll(async () => {
    if (testHostId) {
      await db.delete(hosts).where(eq(hosts.id, testHostId));
    }
  });

  describe('getHostGuidebooks', () => {
    it('호스트의 가이드북 목록을 조회한다', async () => {
      const { getHostGuidebooks } = await import('@/lib/data/dashboard');

      const guidebookList = await getHostGuidebooks(testHostId);

      expect(guidebookList.length).toBeGreaterThanOrEqual(2);
      expect(guidebookList.some((g) => g.title === 'Dashboard Test 1')).toBe(
        true
      );
    });

    it('최신순으로 정렬한다', async () => {
      const { getHostGuidebooks } = await import('@/lib/data/dashboard');

      const guidebookList = await getHostGuidebooks(testHostId);

      // createdAt 기준 내림차순 정렬 확인
      for (let i = 0; i < guidebookList.length - 1; i++) {
        expect(
          new Date(guidebookList[i].createdAt).getTime()
        ).toBeGreaterThanOrEqual(
          new Date(guidebookList[i + 1].createdAt).getTime()
        );
      }
    });
  });

  describe('getHostStats', () => {
    it('호스트의 통계를 조회한다', async () => {
      const { getHostStats } = await import('@/lib/data/dashboard');

      const stats = await getHostStats(testHostId);

      expect(stats.totalGuidebooks).toBeGreaterThanOrEqual(2);
      expect(stats.publishedGuidebooks).toBeGreaterThanOrEqual(1);
      expect(stats.totalViews).toBeGreaterThanOrEqual(50);
    });
  });

  describe('getHostByEmail', () => {
    it('이메일로 호스트를 조회한다', async () => {
      const { getHostByEmail } = await import('@/lib/data/dashboard');

      // 테스트용 호스트의 이메일 패턴 사용
      const allHosts = await db.select().from(hosts).where(eq(hosts.id, testHostId));
      const testEmail = allHosts[0]?.email;

      const host = await getHostByEmail(testEmail);

      expect(host).not.toBeNull();
      expect(host?.id).toBe(testHostId);
    });

    it('존재하지 않는 이메일은 null을 반환한다', async () => {
      const { getHostByEmail } = await import('@/lib/data/dashboard');

      const host = await getHostByEmail('non-existent@example.com');

      expect(host).toBeNull();
    });
  });
});
