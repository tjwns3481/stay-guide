/**
 * Public Guidebook Page
 * SSG + ISR로 정적 생성되는 공개 가이드북 페이지
 */

import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { GuidebookView } from '@/components/guidebook/GuidebookView';
import {
  getGuidebookBySlug,
  getGuidebookBlocks,
  getAllPublishedSlugs,
} from '@/lib/data/guidebook';
import { generateGuidebookMetadata } from '@/lib/utils/metadata';

interface PageProps {
  params: {
    slug: string;
  };
}

// ISR: 60초마다 재검증
export const revalidate = 60;

// SSG: 빌드 시 정적 생성할 페이지 목록
export async function generateStaticParams() {
  const slugs = await getAllPublishedSlugs();

  return slugs.map((slug) => ({
    slug,
  }));
}

// 동적 메타데이터 (OG 이미지, Twitter 카드, robots 포함)
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const guidebook = await getGuidebookBySlug(params.slug);

  if (!guidebook) {
    return {
      title: '가이드북을 찾을 수 없습니다',
      robots: { index: false },
    };
  }

  return generateGuidebookMetadata(guidebook);
}

export default async function GuidebookPage({ params }: PageProps) {
  const guidebook = await getGuidebookBySlug(params.slug);

  if (!guidebook) {
    notFound();
  }

  const blocks = await getGuidebookBlocks(guidebook.id);

  return <GuidebookView guidebook={guidebook} blocks={blocks} />;
}
