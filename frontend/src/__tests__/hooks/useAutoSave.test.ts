import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAutoSave } from '@/hooks/useAutoSave'
import { useEditorStore } from '@/stores/editor'

const mockGuide = {
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
      type: 'hero' as const,
      order: 0,
      content: { title: '환영합니다' },
      isVisible: true,
    },
  ],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

describe('useAutoSave 훅', () => {
  let mockSaveFn: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockSaveFn = vi.fn().mockResolvedValue(undefined)

    // 스토어 초기화
    useEditorStore.setState({
      guide: mockGuide,
      originalGuide: mockGuide,
      viewMode: 'edit',
      activePanel: 'blocks',
      selectedBlockId: null,
      isMobileSheetOpen: false,
      saveStatus: 'saved',
      lastSavedAt: null,
      isLoading: false,
      error: null,
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('수동 저장 (saveNow)', () => {
    it('saveNow로 즉시 저장할 수 있다', async () => {
      const { result } = renderHook(() =>
        useAutoSave('guide-1', mockSaveFn, { debounceMs: 2000 })
      )

      // 변경사항 만들기
      act(() => {
        useEditorStore.getState().updateGuide({ title: '수정된 제목' })
      })

      await act(async () => {
        await result.current.saveNow()
      })

      expect(mockSaveFn).toHaveBeenCalledTimes(1)
      expect(mockSaveFn).toHaveBeenCalledWith(
        'guide-1',
        expect.objectContaining({
          title: '수정된 제목',
        })
      )
    })

    it('변경사항이 없으면 저장하지 않는다', async () => {
      const { result } = renderHook(() => useAutoSave('guide-1', mockSaveFn))

      await act(async () => {
        await result.current.saveNow()
      })

      // 초기 상태와 동일하므로 저장하지 않음
      expect(mockSaveFn).not.toHaveBeenCalled()
    })

    it('저장 성공 시 onSaveSuccess 콜백이 호출된다', async () => {
      const onSaveSuccess = vi.fn()

      const { result } = renderHook(() =>
        useAutoSave('guide-1', mockSaveFn, { onSaveSuccess })
      )

      // 변경사항 만들기
      act(() => {
        useEditorStore.getState().updateGuide({ title: '수정된 제목' })
      })

      await act(async () => {
        await result.current.saveNow()
      })

      expect(onSaveSuccess).toHaveBeenCalledTimes(1)
    })

    it('저장 실패 시 onSaveError 콜백이 호출된다', async () => {
      const onSaveError = vi.fn()
      const error = new Error('저장 실패')
      mockSaveFn.mockRejectedValueOnce(error)

      const { result } = renderHook(() =>
        useAutoSave('guide-1', mockSaveFn, { onSaveError })
      )

      // 변경사항 만들기
      act(() => {
        useEditorStore.getState().updateGuide({ title: '수정된 제목' })
      })

      await act(async () => {
        await result.current.saveNow()
      })

      expect(onSaveError).toHaveBeenCalledWith(error)
      expect(useEditorStore.getState().saveStatus).toBe('error')
    })

    it('disabled가 true면 저장되지 않는다', async () => {
      const { result } = renderHook(() =>
        useAutoSave('guide-1', mockSaveFn, { disabled: true })
      )

      // 변경사항 만들기
      act(() => {
        useEditorStore.getState().updateGuide({ title: '수정된 제목' })
      })

      await act(async () => {
        await result.current.saveNow()
      })

      expect(mockSaveFn).not.toHaveBeenCalled()
    })
  })

  describe('isSaving 상태', () => {
    it('저장 시작 시 saveStatus가 saving으로 변경된다', async () => {
      let resolveSave: () => void
      mockSaveFn.mockImplementation(
        () =>
          new Promise<void>((resolve) => {
            resolveSave = resolve
          })
      )

      const { result } = renderHook(() => useAutoSave('guide-1', mockSaveFn))

      // 변경사항 만들기
      act(() => {
        useEditorStore.getState().updateGuide({ title: '저장 중 테스트' })
      })

      // 저장 시작 (완료 대기하지 않음)
      let savePromise: Promise<void>
      act(() => {
        savePromise = result.current.saveNow()
      })

      // 저장 중 상태 확인
      expect(useEditorStore.getState().saveStatus).toBe('saving')
      expect(result.current.isSaving).toBe(true)

      // 저장 완료
      await act(async () => {
        resolveSave!()
        await savePromise
      })

      expect(useEditorStore.getState().saveStatus).toBe('saved')
      expect(result.current.isSaving).toBe(false)
    })
  })

  describe('payload 구조', () => {
    it('올바른 payload 형식으로 저장한다', async () => {
      const { result } = renderHook(() => useAutoSave('guide-1', mockSaveFn))

      // 변경사항 만들기
      act(() => {
        useEditorStore.getState().updateGuide({ title: 'Payload 테스트' })
      })

      await act(async () => {
        await result.current.saveNow()
      })

      expect(mockSaveFn).toHaveBeenCalledWith('guide-1', {
        title: 'Payload 테스트',
        accommodationName: '테스트 숙소',
        themeId: null,
        themeSettings: null,
        blocks: [
          {
            id: 'block-1',
            type: 'hero',
            order: 0,
            content: { title: '환영합니다' },
            isVisible: true,
          },
        ],
      })
    })
  })

  describe('중복 저장 방지', () => {
    it('동일한 내용은 중복 저장하지 않는다', async () => {
      const { result } = renderHook(() => useAutoSave('guide-1', mockSaveFn))

      // 변경사항 만들기
      act(() => {
        useEditorStore.getState().updateGuide({ title: '첫 번째 저장' })
      })

      // 첫 번째 저장
      await act(async () => {
        await result.current.saveNow()
      })

      expect(mockSaveFn).toHaveBeenCalledTimes(1)

      // 동일한 내용으로 다시 저장 시도
      await act(async () => {
        await result.current.saveNow()
      })

      // 중복 저장되지 않음
      expect(mockSaveFn).toHaveBeenCalledTimes(1)
    })

    it('내용이 변경되면 다시 저장한다', async () => {
      const { result } = renderHook(() => useAutoSave('guide-1', mockSaveFn))

      // 첫 번째 변경 및 저장
      act(() => {
        useEditorStore.getState().updateGuide({ title: '첫 번째' })
      })
      await act(async () => {
        await result.current.saveNow()
      })

      // 두 번째 변경 및 저장
      act(() => {
        useEditorStore.getState().updateGuide({ title: '두 번째' })
      })
      await act(async () => {
        await result.current.saveNow()
      })

      expect(mockSaveFn).toHaveBeenCalledTimes(2)
    })
  })
})
