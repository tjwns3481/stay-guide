'use client'

import { useApiClient } from '@/hooks/useApiClient'

export function ApiClientProvider({ children }: { children: React.ReactNode }) {
  // API 클라이언트에 Clerk 토큰 getter 연결
  useApiClient()

  return <>{children}</>
}
