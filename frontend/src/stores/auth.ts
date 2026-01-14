import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserProfile } from '@/contracts/user.contract'

interface AuthState {
  // 사용자 프로필 (API에서 가져온 데이터)
  user: UserProfile | null
  // 로딩 상태
  isLoading: boolean
  // 에러
  error: string | null
  // 마지막 동기화 시간
  lastSyncedAt: number | null

  // Actions
  setUser: (user: UserProfile | null) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  clearUser: () => void
  syncUser: () => Promise<void>
  updateUserName: (name: string) => Promise<void>
}

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787'

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,
      lastSyncedAt: null,

      setUser: (user) => set({ user, error: null }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      clearUser: () => set({ user: null, error: null, lastSyncedAt: null }),

      // 서버에서 사용자 정보 동기화
      syncUser: async () => {
        const { isLoading } = get()
        if (isLoading) return

        set({ isLoading: true, error: null })

        try {
          const response = await fetch(`${API_BASE_URL}/api/users/me`, {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          })

          if (!response.ok) {
            if (response.status === 401) {
              set({ user: null, isLoading: false })
              return
            }
            throw new Error('Failed to fetch user')
          }

          const data = await response.json()

          if (data.success && data.data) {
            set({
              user: data.data,
              isLoading: false,
              lastSyncedAt: Date.now(),
            })
          } else {
            throw new Error(data.error?.message || 'Failed to fetch user')
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Unknown error',
            isLoading: false,
          })
        }
      },

      // 사용자 이름 업데이트
      updateUserName: async (name: string) => {
        const { user } = get()
        if (!user) return

        set({ isLoading: true, error: null })

        try {
          const response = await fetch(`${API_BASE_URL}/api/users/me`, {
            method: 'PATCH',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name }),
          })

          if (!response.ok) {
            throw new Error('Failed to update user')
          }

          const data = await response.json()

          if (data.success && data.data) {
            set({
              user: { ...user, name: data.data.name },
              isLoading: false,
            })
          } else {
            throw new Error(data.error?.message || 'Failed to update user')
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Unknown error',
            isLoading: false,
          })
        }
      },
    }),
    {
      name: 'roomy-auth',
      partialize: (state) => ({
        user: state.user,
        lastSyncedAt: state.lastSyncedAt,
      }),
    }
  )
)

// Selectors
export const selectUser = (state: AuthState) => state.user
export const selectIsLoading = (state: AuthState) => state.isLoading
export const selectError = (state: AuthState) => state.error
export const selectLicense = (state: AuthState) => state.user?.license
export const selectIsPremium = (state: AuthState) =>
  state.user?.license?.plan !== 'free' && state.user?.license?.status === 'active'
