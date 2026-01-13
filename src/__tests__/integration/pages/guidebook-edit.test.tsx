/**
 * Guidebook Edit Page Tests (TDD)
 * Phase 4, T4.2 - 가이드북 편집 페이지
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// React cache mock
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
}));

describe('Guidebook Edit Components', () => {
  describe('GuidebookForm', () => {
    it('GuidebookForm 컴포넌트가 export 되어 있다', async () => {
      const { GuidebookForm } = await import(
        '@/components/forms/GuidebookForm'
      );
      expect(GuidebookForm).toBeDefined();
    });

    it('가이드북 기본 정보 입력 필드를 렌더링한다', async () => {
      const { GuidebookForm } = await import(
        '@/components/forms/GuidebookForm'
      );

      render(<GuidebookForm onSubmit={vi.fn()} />);

      expect(screen.getByLabelText(/제목/)).toBeInTheDocument();
      expect(screen.getByLabelText(/슬러그/)).toBeInTheDocument();
    });

    it('수정 모드에서 기존 값을 표시한다', async () => {
      const { GuidebookForm } = await import(
        '@/components/forms/GuidebookForm'
      );

      const initialData = {
        title: '기존 가이드북',
        slug: 'existing-guidebook',
        description: '기존 설명',
      };

      render(<GuidebookForm initialData={initialData} onSubmit={vi.fn()} />);

      expect(screen.getByDisplayValue('기존 가이드북')).toBeInTheDocument();
      expect(screen.getByDisplayValue('existing-guidebook')).toBeInTheDocument();
    });
  });

  describe('BlockEditor', () => {
    it('BlockEditor 컴포넌트가 export 되어 있다', async () => {
      const { BlockEditor } = await import('@/components/forms/BlockEditor');
      expect(BlockEditor).toBeDefined();
    });

    it('블록 추가 버튼을 렌더링한다', async () => {
      const { BlockEditor } = await import('@/components/forms/BlockEditor');

      render(<BlockEditor blocks={[]} onBlocksChange={vi.fn()} />);

      expect(screen.getByText(/블록 추가/)).toBeInTheDocument();
    });

    it('블록 목록을 렌더링한다', async () => {
      const { BlockEditor } = await import('@/components/forms/BlockEditor');

      const blocks = [
        { id: '1', type: 'wifi', title: 'Wi-Fi', content: {}, order: 0 },
        { id: '2', type: 'checkin', title: '체크인', content: {}, order: 1 },
      ];

      render(<BlockEditor blocks={blocks} onBlocksChange={vi.fn()} />);

      expect(screen.getByText('Wi-Fi')).toBeInTheDocument();
      expect(screen.getByText('체크인')).toBeInTheDocument();
    });
  });
});

describe('Guidebook Edit Pages', () => {
  it('새 가이드북 페이지가 존재한다', async () => {
    const NewPage = await import(
      '@/app/(dashboard)/dashboard/guidebooks/new/page'
    );
    expect(NewPage.default).toBeDefined();
  });

  it('가이드북 편집 페이지가 존재한다', async () => {
    const EditPage = await import(
      '@/app/(dashboard)/dashboard/guidebooks/[id]/edit/page'
    );
    expect(EditPage.default).toBeDefined();
  });

  it('가이드북 목록 페이지가 존재한다', async () => {
    const ListPage = await import(
      '@/app/(dashboard)/dashboard/guidebooks/page'
    );
    expect(ListPage.default).toBeDefined();
  });
});
