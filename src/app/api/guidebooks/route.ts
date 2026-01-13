/**
 * Guidebook API Routes
 * GET /api/guidebooks - 가이드북 목록 조회 (hostId 필수)
 * POST /api/guidebooks - 가이드북 생성
 */

import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/db';
import { guidebooks, hosts } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { guidebookSchema } from '@/lib/validations/guidebook';
import { z, ZodError } from 'zod';

/**
 * GET /api/guidebooks
 * 호스트의 가이드북 목록을 최신순으로 조회
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const hostId = searchParams.get('hostId');

    // hostId 필수 검증
    if (!hostId) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'hostId는 필수입니다',
          },
        },
        { status: 400 }
      );
    }

    // UUID 형식 검증
    const uuidSchema = z.string().uuid();
    const hostIdResult = uuidSchema.safeParse(hostId);
    if (!hostIdResult.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: '유효한 UUID 형식이 아닙니다',
          },
        },
        { status: 400 }
      );
    }

    // 가이드북 목록 조회 (최신순 정렬)
    const guidebooksList = await db
      .select()
      .from(guidebooks)
      .where(eq(guidebooks.hostId, hostId))
      .orderBy(desc(guidebooks.createdAt));

    return NextResponse.json({ data: guidebooksList }, { status: 200 });
  } catch (error) {
    console.error('GET /api/guidebooks error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: '가이드북 목록을 조회하는 중 오류가 발생했습니다',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/guidebooks
 * 새 가이드북 생성 (인증된 사용자의 host를 자동으로 찾음)
 */
export async function POST(request: NextRequest) {
  try {
    // 인증 확인
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: '로그인이 필요합니다',
          },
        },
        { status: 401 }
      );
    }

    // 사용자의 이메일로 host 찾기
    const email = user.primaryEmailAddress?.emailAddress;
    if (!email) {
      return NextResponse.json(
        {
          error: {
            code: 'NO_EMAIL',
            message: '이메일 정보가 없습니다',
          },
        },
        { status: 400 }
      );
    }

    // host 조회 또는 생성
    let [host] = await db
      .select()
      .from(hosts)
      .where(eq(hosts.email, email))
      .limit(1);

    if (!host) {
      // 호스트가 없으면 자동 생성
      [host] = await db
        .insert(hosts)
        .values({
          email,
          name: user.fullName || user.firstName || email.split('@')[0],
        })
        .returning();
    }

    const body = await request.json();

    // 입력 검증
    const validatedData = guidebookSchema.parse(body);

    // slug 중복 확인
    const existingGuidebook = await db
      .select({ id: guidebooks.id })
      .from(guidebooks)
      .where(eq(guidebooks.slug, validatedData.slug))
      .limit(1);

    if (existingGuidebook.length > 0) {
      return NextResponse.json(
        {
          error: {
            code: 'DUPLICATE_SLUG',
            message: '이미 사용 중인 slug입니다',
          },
        },
        { status: 400 }
      );
    }

    // 가이드북 생성 (인증된 사용자의 hostId 사용)
    const [newGuidebook] = await db
      .insert(guidebooks)
      .values({
        hostId: host.id,
        slug: validatedData.slug,
        title: validatedData.title,
        description: validatedData.description,
        coverImage: validatedData.coverImage,
        isPublished: validatedData.isPublished,
      })
      .returning();

    return NextResponse.json({ data: newGuidebook }, { status: 201 });
  } catch (error) {
    // Zod 검증 에러
    if (error instanceof ZodError) {
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

    console.error('POST /api/guidebooks error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: '가이드북을 생성하는 중 오류가 발생했습니다',
        },
      },
      { status: 500 }
    );
  }
}
