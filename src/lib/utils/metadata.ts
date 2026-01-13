/**
 * Metadata Utility Functions
 * 가이드북 메타 태그 및 OG 이미지 생성을 위한 유틸리티
 */

import { Metadata } from 'next';

// 환경 변수에서 베이스 URL 가져오기 (기본값: localhost)
const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return 'http://localhost:3000';
};

interface GuidebookForMetadata {
  slug: string;
  title: string;
  description: string | null;
  coverImage: string | null;
}

/**
 * 가이드북 정보로 메타데이터 객체를 생성합니다.
 */
export function generateGuidebookMetadata(
  guidebook: GuidebookForMetadata
): Metadata {
  const baseUrl = getBaseUrl();
  const description =
    guidebook.description || `${guidebook.title} - 객실 안내서`;
  const canonicalUrl = getCanonicalUrl(guidebook.slug);

  // OG 이미지: 커버 이미지가 있으면 사용, 없으면 동적 OG 이미지 생성
  const ogImages: string[] = [];
  if (guidebook.coverImage) {
    ogImages.push(guidebook.coverImage);
  }
  // 동적 OG 이미지 항상 포함 (fallback 또는 추가 이미지로)
  ogImages.push(getOgImageUrl(guidebook.slug, guidebook.title));

  return {
    title: `${guidebook.title} | Roomy`,
    description,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: guidebook.title,
      description,
      type: 'website',
      siteName: 'Roomy',
      url: canonicalUrl,
      images: ogImages,
      locale: 'ko_KR',
    },
    twitter: {
      card: 'summary_large_image',
      title: guidebook.title,
      description,
      images: ogImages,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
  };
}

/**
 * 동적 OG 이미지 URL을 생성합니다.
 */
export function getOgImageUrl(slug: string, title?: string): string {
  const baseUrl = getBaseUrl();
  const params = new URLSearchParams({ slug });
  if (title) {
    params.append('title', title);
  }
  return `${baseUrl}/api/og?${params.toString()}`;
}

/**
 * 가이드북의 정규 URL을 생성합니다.
 */
export function getCanonicalUrl(slug: string): string {
  const baseUrl = getBaseUrl();
  return `${baseUrl}/g/${slug}`;
}
