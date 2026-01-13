/**
 * Info Block Detail API Routes
 * GET /api/guidebooks/[id]/blocks/[blockId] - 블록 조회
 * PUT /api/guidebooks/[id]/blocks/[blockId] - 블록 수정
 * DELETE /api/guidebooks/[id]/blocks/[blockId] - 블록 삭제
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { blocks } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import {
  updateBlockSchema,
  wifiContentSchema,
  mapContentSchema,
  checkinContentSchema,
  recommendationContentSchema,
  customContentSchema,
} from '@/lib/validations/info-block';
import { ZodError } from 'zod';

type RouteParams = {
  params: {
    id: string;
    blockId: string;
  };
};

/**
 * GET /api/guidebooks/[id]/blocks/[blockId]
 * 특정 블록 조회
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: guidebookId, blockId } = params;

    // 블록 조회
    const [block] = await db
      .select()
      .from(blocks)
      .where(and(eq(blocks.id, blockId), eq(blocks.guidebookId, guidebookId)));

    if (!block) {
      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: '블록을 찾을 수 없습니다',
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: block }, { status: 200 });
  } catch (error) {
    console.error('GET /api/guidebooks/[id]/blocks/[blockId] error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: '블록을 조회하는 중 오류가 발생했습니다',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/guidebooks/[id]/blocks/[blockId]
 * 블록 수정
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: guidebookId, blockId } = params;
    const body = await request.json();

    // 블록 존재 확인
    const [existingBlock] = await db
      .select()
      .from(blocks)
      .where(and(eq(blocks.id, blockId), eq(blocks.guidebookId, guidebookId)));

    if (!existingBlock) {
      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: '블록을 찾을 수 없습니다',
          },
        },
        { status: 404 }
      );
    }

    // 입력 검증 (부분 업데이트)
    const validatedData = updateBlockSchema.parse(body);

    // 타입별 content 검증 (type과 content가 함께 제공된 경우)
    if (validatedData.type && validatedData.content) {
      const contentSchemaMap = {
        wifi: wifiContentSchema,
        map: mapContentSchema,
        checkin: checkinContentSchema,
        recommendation: recommendationContentSchema,
        custom: customContentSchema,
      };

      const contentSchema = contentSchemaMap[validatedData.type];
      contentSchema.parse(validatedData.content);
    }

    // 블록 수정
    const [updatedBlock] = await db
      .update(blocks)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(and(eq(blocks.id, blockId), eq(blocks.guidebookId, guidebookId)))
      .returning();

    return NextResponse.json({ data: updatedBlock }, { status: 200 });
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

    console.error('PUT /api/guidebooks/[id]/blocks/[blockId] error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: '블록을 수정하는 중 오류가 발생했습니다',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/guidebooks/[id]/blocks/[blockId]
 * 블록 삭제
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: guidebookId, blockId } = params;

    // 블록 존재 확인
    const [existingBlock] = await db
      .select()
      .from(blocks)
      .where(and(eq(blocks.id, blockId), eq(blocks.guidebookId, guidebookId)));

    if (!existingBlock) {
      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: '블록을 찾을 수 없습니다',
          },
        },
        { status: 404 }
      );
    }

    // 블록 삭제
    await db
      .delete(blocks)
      .where(and(eq(blocks.id, blockId), eq(blocks.guidebookId, guidebookId)));

    return NextResponse.json({ data: { success: true } }, { status: 200 });
  } catch (error) {
    console.error('DELETE /api/guidebooks/[id]/blocks/[blockId] error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: '블록을 삭제하는 중 오류가 발생했습니다',
        },
      },
      { status: 500 }
    );
  }
}
