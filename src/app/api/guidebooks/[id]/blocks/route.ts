/**
 * Info Blocks API Routes
 * GET /api/guidebooks/[id]/blocks - 블록 목록 조회
 * POST /api/guidebooks/[id]/blocks - 블록 생성
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { blocks } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';
import {
  blockSchema,
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
  };
};

/**
 * GET /api/guidebooks/[id]/blocks
 * 가이드북의 블록 목록을 order 순으로 조회
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: guidebookId } = params;

    // 블록 목록 조회 (order 순 정렬)
    const blocksList = await db
      .select()
      .from(blocks)
      .where(eq(blocks.guidebookId, guidebookId))
      .orderBy(asc(blocks.order));

    return NextResponse.json({ data: blocksList }, { status: 200 });
  } catch (error) {
    console.error('GET /api/guidebooks/[id]/blocks error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: '블록 목록을 조회하는 중 오류가 발생했습니다',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/guidebooks/[id]/blocks
 * 새 블록 생성
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: guidebookId } = params;
    const body = await request.json();

    // 입력 검증
    const validatedData = blockSchema.parse(body);

    // 타입별 content 검증
    const contentSchemaMap = {
      wifi: wifiContentSchema,
      map: mapContentSchema,
      checkin: checkinContentSchema,
      recommendation: recommendationContentSchema,
      custom: customContentSchema,
    };

    const contentSchema = contentSchemaMap[validatedData.type];
    contentSchema.parse(validatedData.content);

    // 블록 생성
    const [newBlock] = await db
      .insert(blocks)
      .values({
        guidebookId,
        type: validatedData.type,
        title: validatedData.title,
        content: validatedData.content,
        order: validatedData.order,
        isVisible: validatedData.isVisible,
      })
      .returning();

    return NextResponse.json({ data: newBlock }, { status: 201 });
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

    console.error('POST /api/guidebooks/[id]/blocks error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: '블록을 생성하는 중 오류가 발생했습니다',
        },
      },
      { status: 500 }
    );
  }
}
