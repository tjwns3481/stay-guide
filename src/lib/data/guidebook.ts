/**
 * Guidebook Data Fetching Functions
 * 서버 컴포넌트에서 사용하는 데이터 fetching 함수들
 */

import { db } from '@/db';
import { guidebooks, blocks } from '@/db/schema';
import { eq, and, asc } from 'drizzle-orm';
import { cache } from 'react';

/**
 * 공개된 가이드북을 slug로 조회
 * React cache로 중복 요청 방지
 */
export const getGuidebookBySlug = cache(async (slug: string) => {
  const [guidebook] = await db
    .select()
    .from(guidebooks)
    .where(and(eq(guidebooks.slug, slug), eq(guidebooks.isPublished, true)))
    .limit(1);

  return guidebook || null;
});

/**
 * 가이드북의 블록 목록 조회
 * order 순으로 정렬
 */
export const getGuidebookBlocks = cache(async (guidebookId: string) => {
  const blockList = await db
    .select()
    .from(blocks)
    .where(eq(blocks.guidebookId, guidebookId))
    .orderBy(asc(blocks.order));

  return blockList;
});

/**
 * 모든 공개 가이드북의 slug 목록 조회
 * generateStaticParams에서 사용
 */
export const getAllPublishedSlugs = cache(async () => {
  const slugs = await db
    .select({ slug: guidebooks.slug })
    .from(guidebooks)
    .where(eq(guidebooks.isPublished, true));

  return slugs.map((item) => item.slug);
});

/**
 * 가이드북 조회수 증가
 */
export async function incrementViewCount(guidebookId: string) {
  await db
    .update(guidebooks)
    .set({
      viewCount: db.raw`${guidebooks.viewCount} + 1`,
    })
    .where(eq(guidebooks.id, guidebookId));
}
