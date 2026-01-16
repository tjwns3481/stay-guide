'use client'

import { ErrorFallback } from '@/components/common/ErrorBoundary'

export default function GuestGuideError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <ErrorFallback error={error} reset={reset} />
}
