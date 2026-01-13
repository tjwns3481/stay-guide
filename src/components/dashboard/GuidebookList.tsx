/**
 * GuidebookList Component
 * 대시보드에서 호스트의 가이드북 목록을 표시
 */

'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

interface Guidebook {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  isPublished: boolean;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface GuidebookListProps {
  guidebooks: Guidebook[];
}

export function GuidebookList({ guidebooks }: GuidebookListProps) {
  if (guidebooks.length === 0) {
    return (
      <div className="text-center py-12 bg-card rounded-xl border border-border">
        <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        </div>
        <p className="text-muted-foreground">가이드북이 없습니다</p>
        <p className="text-sm text-muted-foreground mt-1">
          새 가이드북을 만들어 시작해보세요!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {guidebooks.map((guidebook) => (
        <div
          key={guidebook.id}
          className="bg-card rounded-xl border border-border p-4 hover:border-primary/50 transition-colors"
        >
          <div className="flex items-start justify-between gap-4">
            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-foreground truncate">
                  {guidebook.title}
                </h3>
                <span
                  className={`px-2 py-0.5 text-xs rounded-full ${
                    guidebook.isPublished
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                  }`}
                >
                  {guidebook.isPublished ? '공개' : '비공개'}
                </span>
              </div>
              {guidebook.description && (
                <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                  {guidebook.description}
                </p>
              )}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  {guidebook.viewCount}회 조회
                </span>
                <span>
                  {formatDistanceToNow(new Date(guidebook.createdAt), {
                    addSuffix: true,
                    locale: ko,
                  })}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {guidebook.isPublished && (
                <Link
                  href={`/g/${guidebook.slug}`}
                  target="_blank"
                  className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                  title="미리보기"
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
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </Link>
              )}
              <Link
                href={`/dashboard/guidebooks/${guidebook.id}/edit`}
                className="px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
              >
                편집
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
