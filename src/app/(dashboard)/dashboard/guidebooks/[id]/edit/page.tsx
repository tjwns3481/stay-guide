/**
 * Edit Guidebook Page
 * 가이드북 편집 페이지
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GuidebookForm } from '@/components/forms/GuidebookForm';
import { BlockEditor } from '@/components/forms/BlockEditor';

interface Block {
  id: string;
  type: string;
  title: string;
  content: Record<string, unknown>;
  order: number;
}

interface Guidebook {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  isPublished: boolean;
}

export default function EditGuidebookPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guidebook, setGuidebook] = useState<Guidebook | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);

  useEffect(() => {
    fetchGuidebook();
  }, [params.id]);

  const fetchGuidebook = async () => {
    try {
      const [gbRes, blocksRes] = await Promise.all([
        fetch(`/api/guidebooks/${params.id}`),
        fetch(`/api/guidebooks/${params.id}/blocks`),
      ]);

      if (!gbRes.ok) throw new Error('가이드북을 찾을 수 없습니다');

      const gbData = await gbRes.json();
      const blocksData = await blocksRes.json();

      setGuidebook(gbData.data);
      setBlocks(blocksData.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: {
    title: string;
    slug: string;
    description?: string;
  }) => {
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/guidebooks/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error?.message || '저장에 실패했습니다');
      }

      const result = await response.json();
      setGuidebook(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublishToggle = async () => {
    if (!guidebook) return;

    try {
      const response = await fetch(`/api/guidebooks/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !guidebook.isPublished }),
      });

      if (!response.ok) throw new Error('상태 변경에 실패했습니다');

      const result = await response.json();
      setGuidebook(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">로딩 중...</div>
      </div>
    );
  }

  if (!guidebook) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">가이드북을 찾을 수 없습니다</p>
        <Link href="/dashboard/guidebooks" className="text-primary mt-2 block">
          목록으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/guidebooks"
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {guidebook.title}
            </h1>
            <p className="text-muted-foreground mt-1">가이드북 편집</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {guidebook.isPublished && (
            <Link
              href={`/g/${guidebook.slug}`}
              target="_blank"
              className="px-4 py-2 text-muted-foreground hover:text-foreground border border-border rounded-lg transition-colors"
            >
              미리보기
            </Link>
          )}
          <button
            onClick={handlePublishToggle}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              guidebook.isPublished
                ? 'bg-secondary text-foreground hover:bg-secondary/80'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
          >
            {guidebook.isPublished ? '비공개로 전환' : '공개하기'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Basic Info */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            기본 정보
          </h2>
          <GuidebookForm
            initialData={guidebook}
            onSubmit={handleSubmit}
            isLoading={isSaving}
          />
        </div>

        {/* Blocks */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            정보 블록
          </h2>
          <BlockEditor blocks={blocks} onBlocksChange={setBlocks} />
        </div>
      </div>
    </div>
  );
}
