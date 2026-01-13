/**
 * Metadata Utility Tests (TDD)
 * Phase 3, T3.4 - 메타 태그 및 OG 이미지
 */

import { describe, it, expect } from 'vitest';
import {
  generateGuidebookMetadata,
  getOgImageUrl,
  getCanonicalUrl,
} from '@/lib/utils/metadata';

describe('Metadata Utilities', () => {
  const mockGuidebook = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    slug: 'ocean-view-pension',
    title: '오션뷰 펜션',
    description: '제주도 해변가 감성 숙소입니다.',
    coverImage: 'https://example.com/cover.jpg',
    hostId: 'host-123',
    isPublished: true,
    viewCount: 100,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('generateGuidebookMetadata', () => {
    it('가이드북 정보로 메타데이터를 생성한다', () => {
      const metadata = generateGuidebookMetadata(mockGuidebook);

      expect(metadata.title).toBe('오션뷰 펜션 | Roomy');
      expect(metadata.description).toBe('제주도 해변가 감성 숙소입니다.');
    });

    it('description이 없으면 기본값을 사용한다', () => {
      const guidebook = { ...mockGuidebook, description: null };
      const metadata = generateGuidebookMetadata(guidebook);

      expect(metadata.description).toBe('오션뷰 펜션 - 객실 안내서');
    });

    it('OpenGraph 메타데이터를 포함한다', () => {
      const metadata = generateGuidebookMetadata(mockGuidebook);

      expect(metadata.openGraph).toBeDefined();
      expect(metadata.openGraph?.title).toBe('오션뷰 펜션');
      expect(metadata.openGraph?.description).toBe('제주도 해변가 감성 숙소입니다.');
      expect(metadata.openGraph?.type).toBe('website');
      expect(metadata.openGraph?.siteName).toBe('Roomy');
    });

    it('커버 이미지가 있으면 OG 이미지에 포함한다', () => {
      const metadata = generateGuidebookMetadata(mockGuidebook);

      expect(metadata.openGraph?.images).toContain('https://example.com/cover.jpg');
    });

    it('커버 이미지가 없으면 동적 OG 이미지 URL을 사용한다', () => {
      const guidebook = { ...mockGuidebook, coverImage: null };
      const metadata = generateGuidebookMetadata(guidebook);

      expect(metadata.openGraph?.images).toBeDefined();
      expect(Array.isArray(metadata.openGraph?.images)).toBe(true);
      // 동적 OG 이미지 URL 포함 확인
      const images = metadata.openGraph?.images as string[];
      expect(images.some((img) => img.includes('/api/og'))).toBe(true);
    });

    it('Twitter 카드 메타데이터를 포함한다', () => {
      const metadata = generateGuidebookMetadata(mockGuidebook);

      expect(metadata.twitter).toBeDefined();
      expect(metadata.twitter?.card).toBe('summary_large_image');
      expect(metadata.twitter?.title).toBe('오션뷰 펜션');
      expect(metadata.twitter?.description).toBe('제주도 해변가 감성 숙소입니다.');
    });

    it('robots 메타데이터를 포함한다', () => {
      const metadata = generateGuidebookMetadata(mockGuidebook);

      expect(metadata.robots).toBeDefined();
      expect(metadata.robots?.index).toBe(true);
      expect(metadata.robots?.follow).toBe(true);
    });
  });

  describe('getOgImageUrl', () => {
    it('slug로 OG 이미지 URL을 생성한다', () => {
      const url = getOgImageUrl('ocean-view-pension');

      expect(url).toContain('/api/og');
      expect(url).toContain('slug=ocean-view-pension');
    });

    it('title 파라미터를 포함할 수 있다', () => {
      const url = getOgImageUrl('ocean-view-pension', '오션뷰 펜션');

      expect(url).toContain('title=');
    });
  });

  describe('getCanonicalUrl', () => {
    it('slug로 정규 URL을 생성한다', () => {
      const url = getCanonicalUrl('ocean-view-pension');

      expect(url).toContain('/g/ocean-view-pension');
    });

    it('절대 URL을 반환한다', () => {
      const url = getCanonicalUrl('ocean-view-pension');

      expect(url).toMatch(/^https?:\/\//);
    });
  });
});

describe('OG Image API', () => {
  it('OG 이미지 라우트가 존재한다', async () => {
    // API 라우트 모듈이 존재하는지 확인
    const ogModule = await import('@/app/api/og/route');
    expect(ogModule.GET).toBeDefined();
  });
});
