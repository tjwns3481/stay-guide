import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useAuthStore, selectUser, selectIsLoading, selectError, selectLicense, selectIsPremium } from '@/stores/auth'
import type { UserProfile } from '@/contracts/user.contract'

// API 클라이언트 모듈 모킹
const mockGet = vi.fn()
const mockPatch = vi.fn()

vi.mock('@/lib/api/client', () => ({
  api: {
    get: (...args: unknown[]) => mockGet(...args),
    patch: (...args: unknown[]) => mockPatch(...args),
  },
  ApiError: class ApiError extends Error {
    status: number
    constructor(message: string, status: number = 500) {
      super(message)
      this.name = 'ApiError'
      this.status = status
    }
  },
}))

const mockUser: UserProfile = {
  id: 'user-1',
  email: 'test@example.com',
  name: '테스트 사용자',
  role: 'HOST',
  license: {
    plan: 'free',
    status: 'active',
    expiresAt: '2024-12-31T23:59:59Z',
  },
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

const mockPremiumUser: UserProfile = {
  ...mockUser,
  license: {
    plan: 'premium',
    status: 'active',
    expiresAt: '2024-12-31T23:59:59Z',
  },
}

describe('useAuthStore', () => {
  beforeEach(() => {
    // 각 테스트 전 스토어 초기화
    useAuthStore.setState({
      user: null,
      isLoading: false,
      error: null,
      lastSyncedAt: null,
    })
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('기본 액션', () => {
    it('setUser로 사용자를 설정할 수 있다', () => {
      useAuthStore.getState().setUser(mockUser)
      expect(useAuthStore.getState().user).toEqual(mockUser)
      expect(useAuthStore.getState().error).toBeNull()
    })

    it('setLoading으로 로딩 상태를 변경할 수 있다', () => {
      useAuthStore.getState().setLoading(true)
      expect(useAuthStore.getState().isLoading).toBe(true)

      useAuthStore.getState().setLoading(false)
      expect(useAuthStore.getState().isLoading).toBe(false)
    })

    it('setError로 에러를 설정할 수 있다', () => {
      useAuthStore.getState().setError('에러 메시지')
      expect(useAuthStore.getState().error).toBe('에러 메시지')
    })

    it('clearUser로 사용자 정보를 초기화할 수 있다', () => {
      useAuthStore.getState().setUser(mockUser)
      useAuthStore.setState({ lastSyncedAt: Date.now() })

      useAuthStore.getState().clearUser()

      expect(useAuthStore.getState().user).toBeNull()
      expect(useAuthStore.getState().error).toBeNull()
      expect(useAuthStore.getState().lastSyncedAt).toBeNull()
    })
  })

  describe('syncUser', () => {
    it('서버에서 사용자 정보를 동기화한다', async () => {
      mockGet.mockResolvedValue({ success: true, data: mockUser })

      await useAuthStore.getState().syncUser()

      expect(mockGet).toHaveBeenCalledWith('/users/me')
      expect(useAuthStore.getState().user).toEqual(mockUser)
      expect(useAuthStore.getState().isLoading).toBe(false)
      expect(useAuthStore.getState().lastSyncedAt).not.toBeNull()
    })

    it('이미 로딩 중이면 중복 요청하지 않는다', async () => {
      useAuthStore.setState({ isLoading: true })

      await useAuthStore.getState().syncUser()

      expect(mockGet).not.toHaveBeenCalled()
    })

    it('응답 데이터가 없으면 에러를 throw한다', async () => {
      mockGet.mockResolvedValue({ success: false })

      await useAuthStore.getState().syncUser()

      expect(useAuthStore.getState().error).toBe('Failed to fetch user')
      expect(useAuthStore.getState().isLoading).toBe(false)
    })

    it('401 에러 시 사용자 정보를 초기화한다', async () => {
      const { ApiError } = await import('@/lib/api/client')
      const error = new ApiError('Unauthorized', 401)
      mockGet.mockRejectedValue(error)

      useAuthStore.getState().setUser(mockUser)
      await useAuthStore.getState().syncUser()

      expect(useAuthStore.getState().user).toBeNull()
      expect(useAuthStore.getState().isLoading).toBe(false)
    })

    it('일반 에러 시 에러 상태가 설정된다', async () => {
      const error = new Error('네트워크 에러')
      mockGet.mockRejectedValue(error)

      await useAuthStore.getState().syncUser()

      expect(useAuthStore.getState().error).toBe('네트워크 에러')
      expect(useAuthStore.getState().isLoading).toBe(false)
    })

    it('알 수 없는 에러 시 Unknown error가 설정된다', async () => {
      mockGet.mockRejectedValue('문자열 에러')

      await useAuthStore.getState().syncUser()

      expect(useAuthStore.getState().error).toBe('Unknown error')
    })
  })

  describe('updateUserName', () => {
    it('사용자 이름을 업데이트한다', async () => {
      useAuthStore.getState().setUser(mockUser)
      const updatedUser = { ...mockUser, name: '수정된 이름' }
      mockPatch.mockResolvedValue({ success: true, data: updatedUser })

      await useAuthStore.getState().updateUserName('수정된 이름')

      expect(mockPatch).toHaveBeenCalledWith('/users/me', { name: '수정된 이름' })
      expect(useAuthStore.getState().user?.name).toBe('수정된 이름')
      expect(useAuthStore.getState().isLoading).toBe(false)
    })

    it('사용자가 없으면 아무것도 하지 않는다', async () => {
      await useAuthStore.getState().updateUserName('새 이름')

      expect(mockPatch).not.toHaveBeenCalled()
    })

    it('응답 데이터가 없으면 에러를 설정한다', async () => {
      useAuthStore.getState().setUser(mockUser)
      mockPatch.mockResolvedValue({ success: false })

      await useAuthStore.getState().updateUserName('새 이름')

      expect(useAuthStore.getState().error).toBe('Failed to update user')
    })

    it('에러 발생 시 에러 상태가 설정된다', async () => {
      useAuthStore.getState().setUser(mockUser)
      mockPatch.mockRejectedValue(new Error('업데이트 실패'))

      await useAuthStore.getState().updateUserName('새 이름')

      expect(useAuthStore.getState().error).toBe('업데이트 실패')
      expect(useAuthStore.getState().isLoading).toBe(false)
    })

    it('알 수 없는 에러 시 Unknown error가 설정된다', async () => {
      useAuthStore.getState().setUser(mockUser)
      mockPatch.mockRejectedValue('문자열 에러')

      await useAuthStore.getState().updateUserName('새 이름')

      expect(useAuthStore.getState().error).toBe('Unknown error')
    })
  })

  describe('Selectors', () => {
    it('selectUser가 사용자를 반환한다', () => {
      useAuthStore.getState().setUser(mockUser)
      const state = useAuthStore.getState()
      expect(selectUser(state)).toEqual(mockUser)
    })

    it('selectIsLoading이 로딩 상태를 반환한다', () => {
      useAuthStore.getState().setLoading(true)
      const state = useAuthStore.getState()
      expect(selectIsLoading(state)).toBe(true)
    })

    it('selectError가 에러를 반환한다', () => {
      useAuthStore.getState().setError('테스트 에러')
      const state = useAuthStore.getState()
      expect(selectError(state)).toBe('테스트 에러')
    })

    it('selectLicense가 라이선스 정보를 반환한다', () => {
      useAuthStore.getState().setUser(mockUser)
      const state = useAuthStore.getState()
      expect(selectLicense(state)).toEqual(mockUser.license)
    })

    it('사용자가 없으면 selectLicense가 undefined를 반환한다', () => {
      const state = useAuthStore.getState()
      expect(selectLicense(state)).toBeUndefined()
    })

    describe('selectIsPremium', () => {
      it('프리미엄 사용자면 true를 반환한다', () => {
        useAuthStore.getState().setUser(mockPremiumUser)
        const state = useAuthStore.getState()
        expect(selectIsPremium(state)).toBe(true)
      })

      it('무료 사용자면 false를 반환한다', () => {
        useAuthStore.getState().setUser(mockUser)
        const state = useAuthStore.getState()
        expect(selectIsPremium(state)).toBe(false)
      })

      it('사용자가 없으면 false를 반환한다', () => {
        const state = useAuthStore.getState()
        expect(selectIsPremium(state)).toBe(false)
      })

      it('라이선스 상태가 active가 아니면 false를 반환한다', () => {
        const expiredUser = {
          ...mockPremiumUser,
          license: { ...mockPremiumUser.license, status: 'expired' as const },
        }
        useAuthStore.getState().setUser(expiredUser)
        const state = useAuthStore.getState()
        expect(selectIsPremium(state)).toBe(false)
      })
    })
  })
})
