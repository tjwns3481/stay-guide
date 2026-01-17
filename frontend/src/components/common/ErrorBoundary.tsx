'use client'

import { useEffect } from 'react'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/Button'

// Sentry 설치 후 주석 해제
// import * as Sentry from '@sentry/nextjs'

interface ErrorBoundaryProps {
  error: Error & { digest?: string }
  reset: () => void
  variant?: 'page' | 'inline'
}

export function ErrorFallback({ error, reset, variant = 'page' }: ErrorBoundaryProps) {
  useEffect(() => {
    // 에러 로깅
    console.error('Error:', error)

    // Sentry 설치 후 주석 해제
    // Sentry.captureException(error, {
    //   tags: {
    //     component: 'ErrorBoundary',
    //     variant,
    //   },
    //   extra: {
    //     digest: error.digest,
    //   },
    // })
  }, [error, variant])

  if (variant === 'inline') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-red-800 mb-2">
          문제가 발생했습니다
        </h3>
        <p className="text-sm text-red-600 mb-4">
          {error.message || '일시적인 오류가 발생했습니다.'}
        </p>
        <Button onClick={reset} variant="secondary" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          다시 시도
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          문제가 발생했습니다
        </h1>

        <p className="text-gray-600 mb-6">
          페이지를 불러오는 중 오류가 발생했습니다.
          <br />
          잠시 후 다시 시도해주세요.
        </p>

        {process.env.NODE_ENV === 'development' && error.message && (
          <div className="bg-gray-100 rounded-lg p-3 mb-6 text-left">
            <p className="text-xs text-gray-500 mb-1">에러 메시지:</p>
            <code className="text-sm text-red-600 break-all">
              {error.message}
            </code>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset} variant="primary">
            <RefreshCw className="w-4 h-4 mr-2" />
            다시 시도
          </Button>
          <Button onClick={() => window.location.href = '/'} variant="secondary">
            <Home className="w-4 h-4 mr-2" />
            홈으로 이동
          </Button>
        </div>
      </div>
    </div>
  )
}
