/**
 * User Sync API Route
 * POST /api/auth/sync - Clerk 사용자를 hosts 테이블과 동기화
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { hosts } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const syncSchema = z.object({
  clerkUserId: z.string(),
  email: z.string().email(),
  name: z.string().nullable().optional(),
  profileImage: z.string().nullable().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // 인증 확인
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = syncSchema.parse(body);

    // Clerk userId와 요청의 userId가 일치하는지 확인
    if (userId !== validatedData.clerkUserId) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: '권한이 없습니다' } },
        { status: 403 }
      );
    }

    // 이메일로 기존 호스트 찾기
    const [existingHost] = await db
      .select()
      .from(hosts)
      .where(eq(hosts.email, validatedData.email))
      .limit(1);

    if (existingHost) {
      // 기존 호스트 정보 업데이트
      const [updatedHost] = await db
        .update(hosts)
        .set({
          name: validatedData.name || existingHost.name,
          profileImage: validatedData.profileImage || existingHost.profileImage,
          updatedAt: new Date(),
        })
        .where(eq(hosts.id, existingHost.id))
        .returning();

      return NextResponse.json({ data: updatedHost }, { status: 200 });
    }

    // 새 호스트 생성
    const [newHost] = await db
      .insert(hosts)
      .values({
        email: validatedData.email,
        name: validatedData.name,
        profileImage: validatedData.profileImage,
      })
      .returning();

    return NextResponse.json({ data: newHost }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: '입력 데이터가 유효하지 않습니다',
            details: error.errors,
          },
        },
        { status: 400 }
      );
    }

    console.error('POST /api/auth/sync error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: '사용자 동기화 중 오류가 발생했습니다',
        },
      },
      { status: 500 }
    );
  }
}
