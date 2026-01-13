/**
 * MSW 핸들러 - Blocks API
 */

import { http, HttpResponse } from 'msw';
import { mockBlocks } from '../data/blocks';
import type { MockBlock } from '../data/blocks';

export const blockHandlers = [
  // GET /api/guidebooks/:guidebookId/blocks - 블록 목록 조회
  http.get('/api/guidebooks/:guidebookId/blocks', ({ params }) => {
    const { guidebookId } = params;
    const blocks = mockBlocks.filter((b) => b.guidebookId === guidebookId);

    // order 기준 정렬
    const sortedBlocks = [...blocks].sort((a, b) => a.order - b.order);

    return HttpResponse.json({ data: sortedBlocks });
  }),

  // POST /api/guidebooks/:guidebookId/blocks - 블록 생성
  http.post('/api/guidebooks/:guidebookId/blocks', async ({ params, request }) => {
    const { guidebookId } = params;
    const body = (await request.json()) as {
      type: string;
      title: string;
      content: unknown;
      order?: number;
      isVisible?: boolean;
    };

    const newBlock: MockBlock = {
      id: `block-${Date.now()}`,
      guidebookId: guidebookId as string,
      type: body.type as MockBlock['type'],
      title: body.title,
      content: body.content as MockBlock['content'],
      order: body.order ?? 0,
      isVisible: body.isVisible ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockBlocks.push(newBlock);

    return HttpResponse.json({ data: newBlock }, { status: 201 });
  }),

  // GET /api/guidebooks/:guidebookId/blocks/:blockId - 특정 블록 조회
  http.get('/api/guidebooks/:guidebookId/blocks/:blockId', ({ params }) => {
    const { guidebookId, blockId } = params;
    const block = mockBlocks.find(
      (b) => b.id === blockId && b.guidebookId === guidebookId
    );

    if (!block) {
      return HttpResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: '블록을 찾을 수 없습니다',
          },
        },
        { status: 404 }
      );
    }

    return HttpResponse.json({ data: block });
  }),

  // PUT /api/guidebooks/:guidebookId/blocks/:blockId - 블록 수정
  http.put(
    '/api/guidebooks/:guidebookId/blocks/:blockId',
    async ({ params, request }) => {
      const { guidebookId, blockId } = params;
      const body = (await request.json()) as Record<string, unknown>;

      const block = mockBlocks.find(
        (b) => b.id === blockId && b.guidebookId === guidebookId
      );

      if (!block) {
        return HttpResponse.json(
          {
            error: {
              code: 'NOT_FOUND',
              message: '블록을 찾을 수 없습니다',
            },
          },
          { status: 404 }
        );
      }

      const updatedBlock = {
        ...block,
        ...body,
        updatedAt: new Date().toISOString(),
      };

      return HttpResponse.json({ data: updatedBlock });
    }
  ),

  // DELETE /api/guidebooks/:guidebookId/blocks/:blockId - 블록 삭제
  http.delete('/api/guidebooks/:guidebookId/blocks/:blockId', ({ params }) => {
    const { guidebookId, blockId } = params;
    const blockIndex = mockBlocks.findIndex(
      (b) => b.id === blockId && b.guidebookId === guidebookId
    );

    if (blockIndex === -1) {
      return HttpResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: '블록을 찾을 수 없습니다',
          },
        },
        { status: 404 }
      );
    }

    return HttpResponse.json({ data: { success: true } });
  }),

  // PATCH /api/guidebooks/:guidebookId/blocks/reorder - 블록 순서 변경
  http.patch('/api/guidebooks/:guidebookId/blocks/reorder', async ({ params, request }) => {
    const { guidebookId } = params;
    const body = (await request.json()) as { blockIds: string[] };

    const blocks = mockBlocks.filter((b) => b.guidebookId === guidebookId);
    const updatedBlocks = blocks.map((block) => {
      const newOrder = body.blockIds.indexOf(block.id);
      return {
        ...block,
        order: newOrder !== -1 ? newOrder : block.order,
        updatedAt: new Date().toISOString(),
      };
    });

    return HttpResponse.json({ data: updatedBlocks });
  }),
];
