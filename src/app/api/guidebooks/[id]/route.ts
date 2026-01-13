/**
 * Guidebook Detail API Routes
 * GET /api/guidebooks/[id] - 가이드북 상세 조회
 * PUT /api/guidebooks/[id] - 가이드북 수정
 * DELETE /api/guidebooks/[id] - 가이드북 삭제
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { guidebooks } from '@/db/schema';
import { eq, and, ne } from 'drizzle-orm';
import { updateGuidebookSchema } from '@/lib/validations/guidebook';
import { z, ZodError } from 'zod';

type RouteParams = {
  params: {
    id: string;
  };
};

const uuidSchema = z.string().uuid('유효한 UUID 형식이 아닙니다');

/**
 * GET /api/guidebooks/[id]
 * 특정 가이드북 상세 조회
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;

    // UUID 형식 검증
    const idResult = uuidSchema.safeParse(id);
    if (!idResult.success) {
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

    // 가이드북 조회
    const [guidebook] = await db
      .select()
      .from(guidebooks)
      .where(eq(guidebooks.id, id))
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

    return NextResponse.json({ data: guidebook }, { status: 200 });
  } catch (error) {
    console.error('GET /api/guidebooks/[id] error:', error);
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

/**
 * PUT /api/guidebooks/[id]
 * 가이드북 수정
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const body = await request.json();

    // UUID 형식 검증
    const idResult = uuidSchema.safeParse(id);
    if (!idResult.success) {
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

    // 입력 검증
    const validatedData = updateGuidebookSchema.parse(body);

    // 가이드북 존재 확인
    const [existingGuidebook] = await db
      .select()
      .from(guidebooks)
      .where(eq(guidebooks.id, id))
      .limit(1);

    if (!existingGuidebook) {
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

    // slug 변경 시 중복 확인
    if (validatedData.slug && validatedData.slug !== existingGuidebook.slug) {
      const duplicateSlug = await db
        .select({ id: guidebooks.id })
        .from(guidebooks)
        .where(and(eq(guidebooks.slug, validatedData.slug), ne(guidebooks.id, id)))
        .limit(1);

      if (duplicateSlug.length > 0) {
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
    }

    // 가이드북 수정
    const [updatedGuidebook] = await db
      .update(guidebooks)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(guidebooks.id, id))
      .returning();

    return NextResponse.json({ data: updatedGuidebook }, { status: 200 });
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

    console.error('PUT /api/guidebooks/[id] error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: '가이드북을 수정하는 중 오류가 발생했습니다',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/guidebooks/[id]
 * 가이드북 삭제
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;

    // UUID 형식 검증
    const idResult = uuidSchema.safeParse(id);
    if (!idResult.success) {
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

    // 가이드북 존재 확인
    const [existingGuidebook] = await db
      .select({ id: guidebooks.id })
      .from(guidebooks)
      .where(eq(guidebooks.id, id))
      .limit(1);

    if (!existingGuidebook) {
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

    // 가이드북 삭제
    await db.delete(guidebooks).where(eq(guidebooks.id, id));

    return NextResponse.json({ data: { success: true } }, { status: 200 });
  } catch (error) {
    console.error('DELETE /api/guidebooks/[id] error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: '가이드북을 삭제하는 중 오류가 발생했습니다',
        },
      },
      { status: 500 }
    );
  }
}
