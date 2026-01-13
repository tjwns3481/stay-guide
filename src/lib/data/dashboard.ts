/**
 * Dashboard Data Fetching Functions
 * 대시보드용 데이터 fetching 함수들
 */

import { db } from '@/db';
import { guidebooks, hosts } from '@/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { cache } from 'react';

/**
 * 이메일로 호스트 조회
 */
export const getHostByEmail = cache(async (email: string) => {
  const [host] = await db
    .select()
    .from(hosts)
    .where(eq(hosts.email, email))
    .limit(1);

  return host || null;
});

/**
 * 호스트의 가이드북 목록 조회
 * 최신순 정렬
 */
export const getHostGuidebooks = cache(async (hostId: string) => {
  const guidebookList = await db
    .select()
    .from(guidebooks)
    .where(eq(guidebooks.hostId, hostId))
    .orderBy(desc(guidebooks.createdAt));

  return guidebookList;
});

/**
 * 호스트의 통계 조회
 */
export const getHostStats = cache(async (hostId: string) => {
  // 가이드북 목록을 가져와서 통계 계산 (SQL 호환성 문제 회피)
  const guidebookList = await db
    .select()
    .from(guidebooks)
    .where(eq(guidebooks.hostId, hostId));

  return {
    totalGuidebooks: guidebookList.length,
    publishedGuidebooks: guidebookList.filter((g) => g.isPublished).length,
    totalViews: guidebookList.reduce((sum, g) => sum + g.viewCount, 0),
  };
});

/**
 * 호스트의 최근 가이드북 조회 (제한된 개수)
 */
export const getRecentGuidebooks = cache(
  async (hostId: string, limit: number = 5) => {
    const guidebookList = await db
      .select()
      .from(guidebooks)
      .where(eq(guidebooks.hostId, hostId))
      .orderBy(desc(guidebooks.updatedAt))
      .limit(limit);

    return guidebookList;
  }
);
