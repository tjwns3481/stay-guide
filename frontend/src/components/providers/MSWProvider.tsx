'use client'

import { useEffect, useState } from 'react'

export function MSWProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    async function init() {
      if (process.env.NEXT_PUBLIC_API_MOCKING === 'enabled') {
        const { initMocks } = await import('@/mocks')
        await initMocks()
      }
      setIsReady(true)
    }

    init()
  }, [])

  // MSW 초기화 전에는 children을 렌더링하지 않음
  // (Mock API를 사용하는 경우에만)
  if (process.env.NEXT_PUBLIC_API_MOCKING === 'enabled' && !isReady) {
    return null
  }

  return <>{children}</>
}
