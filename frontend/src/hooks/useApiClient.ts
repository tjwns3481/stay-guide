'use client'

import { useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { api } from '@/lib/api/client'

/**
 * API 클라이언트 초기화 훅
 *
 * Clerk의 getToken 함수를 API 클라이언트에 연결하여
 * 모든 API 요청에 자동으로 인증 토큰을 추가합니다.
 *
 * 이 훅은 앱의 최상위 레벨에서 한 번만 호출해야 합니다.
 */
export function useApiClient() {
  const { getToken } = useAuth()

  useEffect(() => {
    // API 클라이언트에 토큰 getter 설정
    api.setTokenGetter(async () => {
      try {
        return await getToken()
      } catch {
        return null
      }
    })
  }, [getToken])
}

export default useApiClient
