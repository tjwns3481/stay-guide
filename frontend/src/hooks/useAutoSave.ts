'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useEditorStore, Guide, Block } from '@/stores/editor'

interface UseAutoSaveOptions {
  /** 디바운스 딜레이 (ms) */
  debounceMs?: number
  /** 자동 저장 비활성화 */
  disabled?: boolean
  /** 저장 성공 콜백 */
  onSaveSuccess?: () => void
  /** 저장 실패 콜백 */
  onSaveError?: (error: Error) => void
}

interface SavePayload {
  title: string
  accommodationName: string
  themeId: string | null
  themeSettings: Record<string, unknown> | null
  blocks: Array<{
    id: string
    type: string
    order: number
    content: Record<string, unknown>
    isVisible: boolean
  }>
}

/**
 * 에디터 자동 저장 훅
 *
 * Zustand 스토어의 변경을 감지하여 디바운스 후 자동 저장합니다.
 */
export function useAutoSave(
  guideId: string,
  saveFn: (guideId: string, payload: SavePayload) => Promise<void>,
  options: UseAutoSaveOptions = {}
) {
  const { debounceMs = 2000, disabled = false, onSaveSuccess, onSaveError } = options

  const { guide, saveStatus, setSaveStatus, markAsSaved } = useEditorStore()

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isSavingRef = useRef(false)
  const lastSavedJsonRef = useRef<string>('')

  // 저장 실행
  const save = useCallback(async () => {
    if (!guide || isSavingRef.current || disabled) return

    // 현재 상태를 JSON으로 직렬화하여 비교
    const currentJson = JSON.stringify({
      title: guide.title,
      accommodationName: guide.accommodationName,
      themeId: guide.themeId,
      themeSettings: guide.themeSettings,
      blocks: guide.blocks,
    })

    // 마지막 저장과 동일하면 스킵
    if (currentJson === lastSavedJsonRef.current) {
      setSaveStatus('saved')
      return
    }

    isSavingRef.current = true
    setSaveStatus('saving')

    try {
      const payload: SavePayload = {
        title: guide.title,
        accommodationName: guide.accommodationName,
        themeId: guide.themeId,
        themeSettings: guide.themeSettings,
        blocks: guide.blocks.map((block) => ({
          id: block.id,
          type: block.type,
          order: block.order,
          content: block.content,
          isVisible: block.isVisible,
        })),
      }

      await saveFn(guideId, payload)

      lastSavedJsonRef.current = currentJson
      markAsSaved()
      onSaveSuccess?.()
    } catch (error) {
      setSaveStatus('error')
      onSaveError?.(error instanceof Error ? error : new Error('저장 실패'))
    } finally {
      isSavingRef.current = false
    }
  }, [guide, guideId, saveFn, disabled, setSaveStatus, markAsSaved, onSaveSuccess, onSaveError])

  // 수동 저장 트리거
  const saveNow = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    return save()
  }, [save])

  // 변경 감지 및 디바운스 저장
  useEffect(() => {
    if (disabled || saveStatus !== 'unsaved') return

    // 기존 타이머 취소
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // 새 디바운스 타이머 설정
    timeoutRef.current = setTimeout(() => {
      save()
    }, debounceMs)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [saveStatus, disabled, debounceMs, save])

  // 컴포넌트 언마운트 시 저장되지 않은 변경사항 저장
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      // 언마운트 시 저장 시도
      if (saveStatus === 'unsaved') {
        save()
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // 초기 상태 설정
  useEffect(() => {
    if (guide) {
      lastSavedJsonRef.current = JSON.stringify({
        title: guide.title,
        accommodationName: guide.accommodationName,
        themeId: guide.themeId,
        themeSettings: guide.themeSettings,
        blocks: guide.blocks,
      })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    saveNow,
    isSaving: saveStatus === 'saving',
  }
}

export default useAutoSave
