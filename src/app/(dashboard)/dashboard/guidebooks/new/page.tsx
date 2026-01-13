/**
 * New Guidebook Page
 * 새 가이드북 생성 페이지
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GuidebookForm } from '@/components/forms/GuidebookForm';

export default function NewGuidebookPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: {
    title: string;
    slug: string;
    description?: string;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/guidebooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error?.message || '가이드북 생성에 실패했습니다');
      }

      const result = await response.json();
      router.push(`/dashboard/guidebooks/${result.data.id}/edit`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
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
          <h1 className="text-2xl font-bold text-foreground">새 가이드북</h1>
          <p className="text-muted-foreground mt-1">
            새로운 숙소 안내서를 만들어보세요
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-card rounded-xl border border-border p-6">
        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
            {error}
          </div>
        )}
        <GuidebookForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </div>
  );
}
