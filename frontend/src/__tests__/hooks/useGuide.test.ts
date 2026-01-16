import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useGuide } from '@/hooks/useGuide'
import { useEditorStore } from '@/stores/editor'

// API 클라이언트 모듈 모킹
const mockGet = vi.fn()
const mockPatch = vi.fn()
const mockPost = vi.fn()
const mockDelete = vi.fn()

vi.mock('@/lib/api/client', () => ({
  api: {
    get: (...args: unknown[]) => mockGet(...args),
    patch: (...args: unknown[]) => mockPatch(...args),
    post: (...args: unknown[]) => mockPost(...args),
    delete: (...args: unknown[]) => mockDelete(...args),
  },
  ApiError: class ApiError extends Error {
    constructor(message: string) {
      super(message)
      this.name = 'ApiError'
    }
  },
}))

const mockGuideApiResponse = {
  id: 'guide-1',
  userId: 'user-1',
  slug: 'test-guide',
  title: '테스트 안내서',
  accommodationName: '테스트 숙소',
  isPublished: false,
  themeId: null,
  themeSettings: null,
  blocks: [
    {
      id: 'block-1',
      guideId: 'guide-1',
      type: 'hero',
      order: 0,
      content: { title: '환영합니다' },
      isVisible: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  ],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

describe('useGuide 훅', () => {
  beforeEach(() => {
    // 스토어 초기화
    useEditorStore.setState({
      guide: null,
      originalGuide: null,
      viewMode: 'edit',
      activePanel: 'blocks',
      selectedBlockId: null,
      isMobileSheetOpen: false,
      saveStatus: 'saved',
      lastSavedAt: null,
      isLoading: false,
      error: null,
    })

    // 모킹 초기화
    vi.clearAllMocks()
    mockGet.mockReset()
    mockPatch.mockReset()
    mockPost.mockReset()
    mockDelete.mockReset()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('loadGuide', () => {
    it('가이드를 성공적으로 로드한다', async () => {
      mockGet.mockResolvedValue({ data: mockGuideApiResponse })

      const { result } = renderHook(() => useGuide())

      await act(async () => {
        await result.current.loadGuide('guide-1')
      })

      expect(mockGet).toHaveBeenCalledWith('/guides/guide-1')

      const state = useEditorStore.getState()
      expect(state.guide?.id).toBe('guide-1')
      expect(state.guide?.title).toBe('테스트 안내서')
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
    })

    it('API 에러 시 에러 상태가 설정된다', async () => {
      const error = new Error('가이드를 찾을 수 없습니다')
      error.name = 'ApiError'
      mockGet.mockRejectedValue(error)

      const { result } = renderHook(() => useGuide())

      await act(async () => {
        await result.current.loadGuide('nonexistent')
      })

      const state = useEditorStore.getState()
      expect(state.guide).toBeNull()
      expect(state.error).toBe('가이드를 찾을 수 없습니다')
      expect(state.isLoading).toBe(false)
    })

    it('데이터가 없으면 에러 상태가 설정된다', async () => {
      mockGet.mockResolvedValue({ data: null })

      const { result } = renderHook(() => useGuide())

      await act(async () => {
        await result.current.loadGuide('guide-1')
      })

      const state = useEditorStore.getState()
      expect(state.error).toBe('가이드 데이터가 없습니다')
    })

    it('블록 데이터가 올바르게 변환된다', async () => {
      mockGet.mockResolvedValue({ data: mockGuideApiResponse })

      const { result } = renderHook(() => useGuide())

      await act(async () => {
        await result.current.loadGuide('guide-1')
      })

      const state = useEditorStore.getState()
      expect(state.guide?.blocks).toHaveLength(1)
      expect(state.guide?.blocks[0]).toEqual({
        id: 'block-1',
        type: 'hero',
        order: 0,
        content: { title: '환영합니다' },
        isVisible: true,
      })
    })
  })

  describe('saveGuide', () => {
    it('가이드를 저장한다', async () => {
      mockPatch.mockResolvedValue({ data: mockGuideApiResponse })

      const { result } = renderHook(() => useGuide())

      const payload = {
        title: '수정된 제목',
        accommodationName: '테스트 숙소',
        themeId: null,
        themeSettings: null,
        blocks: [],
      }

      await act(async () => {
        await result.current.saveGuide('guide-1', payload)
      })

      expect(mockPatch).toHaveBeenCalledWith('/guides/guide-1', payload)
    })

    it('저장 응답이 없으면 에러를 throw한다', async () => {
      mockPatch.mockResolvedValue({ data: null })

      const { result } = renderHook(() => useGuide())

      await expect(
        result.current.saveGuide('guide-1', {
          title: '테스트',
          accommodationName: '숙소',
          themeId: null,
          themeSettings: null,
          blocks: [],
        })
      ).rejects.toThrow('저장 응답이 없습니다')
    })
  })

  describe('publishGuide', () => {
    it('가이드를 발행한다', async () => {
      const publishedResponse = {
        ...mockGuideApiResponse,
        isPublished: true,
      }
      mockPost.mockResolvedValue({ data: publishedResponse })

      const { result } = renderHook(() => useGuide())

      let response: { slug: string; url: string } | undefined
      await act(async () => {
        response = await result.current.publishGuide('guide-1')
      })

      expect(mockPost).toHaveBeenCalledWith('/guides/guide-1/publish', {
        isPublished: true,
      })
      expect(response?.slug).toBe('test-guide')
      expect(response?.url).toContain('/g/test-guide')

      const state = useEditorStore.getState()
      expect(state.saveStatus).toBe('saved')
    })

    it('발행 실패 시 saveStatus가 error가 된다', async () => {
      mockPost.mockRejectedValue(new Error('발행 실패'))

      const { result } = renderHook(() => useGuide())

      await expect(result.current.publishGuide('guide-1')).rejects.toThrow('발행 실패')

      const state = useEditorStore.getState()
      expect(state.saveStatus).toBe('error')
    })
  })

  describe('unpublishGuide', () => {
    it('가이드 발행을 취소한다', async () => {
      mockPost.mockResolvedValue({ data: mockGuideApiResponse })

      // 먼저 발행된 상태로 설정
      useEditorStore.setState({
        guide: {
          ...mockGuideApiResponse,
          isPublished: true,
          blocks: [],
        },
      })

      const { result } = renderHook(() => useGuide())

      await act(async () => {
        await result.current.unpublishGuide('guide-1')
      })

      expect(mockPost).toHaveBeenCalledWith('/guides/guide-1/publish', {
        isPublished: false,
      })

      const state = useEditorStore.getState()
      expect(state.saveStatus).toBe('saved')
    })

    it('발행 취소 실패 시 saveStatus가 error가 된다', async () => {
      mockPost.mockRejectedValue(new Error('발행 취소 실패'))

      const { result } = renderHook(() => useGuide())

      await expect(result.current.unpublishGuide('guide-1')).rejects.toThrow('발행 취소 실패')

      const state = useEditorStore.getState()
      expect(state.saveStatus).toBe('error')
    })
  })

  describe('deleteGuide', () => {
    it('가이드를 삭제한다', async () => {
      mockDelete.mockResolvedValue({})

      const { result } = renderHook(() => useGuide())

      await act(async () => {
        await result.current.deleteGuide('guide-1')
      })

      expect(mockDelete).toHaveBeenCalledWith('/guides/guide-1')
    })
  })
})
