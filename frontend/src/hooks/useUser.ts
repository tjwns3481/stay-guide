'use client'

import { useEffect } from 'react'
import { useUser as useClerkUser } from '@clerk/nextjs'
import { useAuthStore, selectUser, selectIsLoading, selectError } from '@/stores/auth'

/**
 * useUser 훅
 *
 * Clerk 인증 상태와 백엔드 사용자 데이터를 통합하여 제공합니다.
 * - Clerk에서 인증 상태 확인
 * - 인증된 경우 백엔드에서 사용자 프로필 동기화
 */
export function useUser() {
  const { isLoaded: isClerkLoaded, isSignedIn, user: clerkUser } = useClerkUser()

  const user = useAuthStore(selectUser)
  const isLoading = useAuthStore(selectIsLoading)
  const error = useAuthStore(selectError)
  const syncUser = useAuthStore((state) => state.syncUser)
  const clearUser = useAuthStore((state) => state.clearUser)

  // Clerk 로그인 상태 변경 시 사용자 데이터 동기화
  useEffect(() => {
    if (!isClerkLoaded) return

    if (isSignedIn) {
      // 로그인 상태면 백엔드에서 사용자 데이터 동기화
      syncUser()
    } else {
      // 로그아웃 상태면 로컬 데이터 클리어
      clearUser()
    }
  }, [isClerkLoaded, isSignedIn, syncUser, clearUser])

  return {
    // Clerk 데이터
    clerkUser,
    isSignedIn: isSignedIn ?? false,
    isClerkLoaded,

    // 백엔드 사용자 데이터
    user,
    isLoading: !isClerkLoaded || isLoading,
    error,

    // 라이선스 정보
    license: user?.license,
    isPremium:
      user?.license?.plan !== 'free' && user?.license?.status === 'active',

    // 통계
    stats: user?.stats,

    // Actions
    refreshUser: syncUser,
  }
}

export default useUser
