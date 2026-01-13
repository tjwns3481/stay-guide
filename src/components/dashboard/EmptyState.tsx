/**
 * EmptyState Component
 * 가이드북이 없을 때 표시되는 빈 상태
 */

import Link from 'next/link';

export function EmptyState() {
  return (
    <div className="text-center py-16 bg-card rounded-xl border border-border">
      <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <svg
          className="w-10 h-10 text-primary"
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
      <h3 className="text-xl font-semibold text-foreground mb-2">
        아직 가이드북이 없습니다
      </h3>
      <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
        손님에게 전달할 숙소 안내서를 만들어보세요.
        <br />
        몇 분이면 완성할 수 있어요!
      </p>
      <Link
        href="/dashboard/guidebooks/new"
        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
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
            d="M12 4v16m8-8H4"
          />
        </svg>
        새 가이드북 만들기
      </Link>
    </div>
  );
}
