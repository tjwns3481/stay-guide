/**
 * Guidebook Not Found Page
 * 가이드북을 찾을 수 없을 때 표시되는 404 페이지
 */

import Link from 'next/link';

export default function GuidebookNotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="text-center">
        {/* Icon */}
        <div className="mx-auto w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
          <svg
            className="w-12 h-12 text-muted-foreground"
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

        {/* Message */}
        <h1 className="text-2xl font-bold text-foreground mb-2">
          가이드북을 찾을 수 없습니다
        </h1>
        <p className="text-muted-foreground mb-8">
          요청하신 가이드북이 존재하지 않거나 비공개 상태입니다.
        </p>

        {/* Action */}
        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          홈으로 돌아가기
        </Link>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-8 text-center">
        <p className="text-sm text-muted-foreground">
          Powered by{' '}
          <span className="font-medium text-primary">Roomy</span>
        </p>
      </footer>
    </div>
  );
}
