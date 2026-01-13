/**
 * Public Guidebook API Route
 * GET /api/public/guidebooks/[slug] - 공개 가이드북 조회 (slug)
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { guidebooks } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';

type RouteParams = {
  params: {
    slug: string;
  };
};

/**
 * GET /api/public/guidebooks/[slug]
 * 공개된 가이드북을 slug로 조회 (viewCount 증가)
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = params;

    // 공개된 가이드북만 조회
    const [guidebook] = await db
      .select()
      .from(guidebooks)
      .where(and(eq(guidebooks.slug, slug), eq(guidebooks.isPublished, true)))
      .limit(1);

    if (!guidebook) {
      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: '가이드북을 찾을 수 없습니다',
          },
        },
        { status: 404 }
      );
    }

    // viewCount 증가
    const [updatedGuidebook] = await db
      .update(guidebooks)
      .set({
        viewCount: sql`${guidebooks.viewCount} + 1`,
      })
      .where(eq(guidebooks.id, guidebook.id))
      .returning();

    return NextResponse.json({ data: updatedGuidebook }, { status: 200 });
  } catch (error) {
    console.error('GET /api/public/guidebooks/[slug] error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: '가이드북을 조회하는 중 오류가 발생했습니다',
        },
      },
      { status: 500 }
    );
  }
}
