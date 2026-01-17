'use client'

import { useEffect } from 'react'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'

// Sentry 설치 후 주석 해제
// import * as Sentry from '@sentry/nextjs'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global error:', error)

    // Sentry 설치 후 주석 해제
    // Sentry.captureException(error, {
    //   tags: {
    //     type: 'global-error',
    //   },
    //   extra: {
    //     digest: error.digest,
    //   },
    // })
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              앗, 문제가 발생했어요
            </h1>

            <p className="text-gray-600 mb-6">
              예상치 못한 오류가 발생했습니다.
              <br />
              페이지를 새로고침 해주세요.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={reset}
                className="inline-flex items-center justify-center h-11 px-6 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                다시 시도
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="inline-flex items-center justify-center h-11 px-6 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Home className="w-4 h-4 mr-2" />
                홈으로 이동
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
