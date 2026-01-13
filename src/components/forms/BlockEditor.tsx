/**
 * BlockEditor Component
 * 가이드북 블록 편집기
 */

'use client';

import { useState } from 'react';

interface Block {
  id: string;
  type: string;
  title: string;
  content: Record<string, unknown>;
  order: number;
}

interface BlockEditorProps {
  blocks: Block[];
  onBlocksChange: (blocks: Block[]) => void;
}

const blockTypes = [
  { type: 'wifi', label: 'Wi-Fi', icon: '📶' },
  { type: 'checkin', label: '체크인/아웃', icon: '🕐' },
  { type: 'map', label: '지도', icon: '📍' },
  { type: 'recommendation', label: '추천 장소', icon: '⭐' },
  { type: 'custom', label: '커스텀', icon: '📝' },
];

export function BlockEditor({ blocks, onBlocksChange }: BlockEditorProps) {
  const [showAddMenu, setShowAddMenu] = useState(false);

  const handleAddBlock = (type: string, label: string) => {
    const newBlock: Block = {
      id: `temp-${Date.now()}`,
      type,
      title: label,
      content: {},
      order: blocks.length,
    };
    onBlocksChange([...blocks, newBlock]);
    setShowAddMenu(false);
  };

  const handleRemoveBlock = (id: string) => {
    onBlocksChange(blocks.filter((b) => b.id !== id));
  };

  const handleMoveBlock = (index: number, direction: 'up' | 'down') => {
    const newBlocks = [...blocks];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= blocks.length) return;

    [newBlocks[index], newBlocks[newIndex]] = [
      newBlocks[newIndex],
      newBlocks[index],
    ];
    newBlocks.forEach((b, i) => (b.order = i));
    onBlocksChange(newBlocks);
  };

  return (
    <div className="space-y-4">
      {/* 블록 목록 */}
      {blocks.length > 0 ? (
        <div className="space-y-3">
          {blocks.map((block, index) => (
            <div
              key={block.id}
              className="flex items-center gap-3 p-4 bg-card border border-border rounded-lg"
            >
              {/* 순서 변경 버튼 */}
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => handleMoveBlock(index, 'up')}
                  disabled={index === 0}
                  className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                >
                  ▲
                </button>
                <button
                  type="button"
                  onClick={() => handleMoveBlock(index, 'down')}
                  disabled={index === blocks.length - 1}
                  className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                >
                  ▼
                </button>
              </div>

              {/* 블록 정보 */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {blockTypes.find((t) => t.type === block.type)?.icon || '📄'}
                  </span>
                  <span className="font-medium text-foreground">
                    {block.title}
                  </span>
                  <span className="text-xs text-muted-foreground px-2 py-0.5 bg-secondary rounded">
                    {block.type}
                  </span>
                </div>
              </div>

              {/* 삭제 버튼 */}
              <button
                type="button"
                onClick={() => handleRemoveBlock(block.id)}
                className="p-2 text-muted-foreground hover:text-destructive transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <p>아직 블록이 없습니다.</p>
          <p className="text-sm">블록을 추가하여 가이드북을 꾸며보세요!</p>
        </div>
      )}

      {/* 블록 추가 버튼 */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowAddMenu(!showAddMenu)}
          className="w-full py-3 border-2 border-dashed border-border rounded-lg text-muted-foreground hover:border-primary hover:text-primary transition-colors"
        >
          + 블록 추가
        </button>

        {showAddMenu && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg p-2 z-10">
            <div className="grid grid-cols-2 gap-2">
              {blockTypes.map((blockType) => (
                <button
                  key={blockType.type}
                  type="button"
                  onClick={() =>
                    handleAddBlock(blockType.type, blockType.label)
                  }
                  className="flex items-center gap-2 p-3 rounded-lg hover:bg-secondary transition-colors text-left"
                >
                  <span className="text-xl">{blockType.icon}</span>
                  <span className="text-sm font-medium">{blockType.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
