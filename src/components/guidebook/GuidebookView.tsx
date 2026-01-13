/**
 * GuidebookView Component
 * 가이드북 전체 뷰 - 헤더 + 블록 목록
 */

import type { Guidebook, Block } from '@/db/schema';
import { GuidebookHeader } from './GuidebookHeader';
import { InfoBlock } from './InfoBlock';

interface GuidebookViewProps {
  guidebook: Guidebook;
  blocks: Block[];
}

export function GuidebookView({ guidebook, blocks }: GuidebookViewProps) {
  // 블록을 order 순서로 정렬하고 visible한 것만 필터링
  const sortedBlocks = [...blocks]
    .filter((block) => block.isVisible)
    .sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <GuidebookHeader guidebook={guidebook} />

      {/* Blocks */}
      <main className="px-4 md:px-6 py-6 space-y-4">
        {sortedBlocks.length > 0 ? (
          sortedBlocks.map((block) => (
            <InfoBlock key={block.id} block={block} />
          ))
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>아직 등록된 정보가 없습니다.</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="px-4 md:px-6 py-8 text-center">
        <p className="text-sm text-muted-foreground">
          Powered by{' '}
          <span className="font-medium text-primary">Roomy</span>
        </p>
      </footer>
    </div>
  );
}
