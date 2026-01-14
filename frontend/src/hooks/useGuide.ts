'use client'

import { useCallback } from 'react'
import { api, ApiError } from '@/lib/api/client'
import { useEditorStore, Guide, Block } from '@/stores/editor'

interface GuideApiResponse {
  id: string
  userId: string
  slug: string
  title: string
  accommodationName: string
  isPublished: boolean
  themeId: string | null
  themeSettings: Record<string, unknown> | null
  blocks: Array<{
    id: string
    guideId: string
    type: string
    order: number
    content: Record<string, unknown>
    isVisible: boolean
    createdAt: string
    updatedAt: string
  }>
  createdAt: string
  updatedAt: string
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
 * 가이드 API 연동 훅
 */
export function useGuide() {
  const { setGuide, setSaveStatus, setLoading, setError, updateGuide } = useEditorStore()

  /**
   * 가이드 로드
   */
  const loadGuide = useCallback(
    async (guideId: string): Promise<Guide | null> => {
      setLoading(true)
      setError(null)

      try {
        const response = await api.get<GuideApiResponse>(`/guides/${guideId}`)

        if (!response.data) {
          throw new Error('가이드 데이터가 없습니다')
        }

        const guide: Guide = {
          id: response.data.id,
          userId: response.data.userId,
          slug: response.data.slug,
          title: response.data.title,
          accommodationName: response.data.accommodationName,
          isPublished: response.data.isPublished,
          themeId: response.data.themeId,
          themeSettings: response.data.themeSettings,
          blocks: response.data.blocks.map((block) => ({
            id: block.id,
            type: block.type as Block['type'],
            order: block.order,
            content: block.content,
            isVisible: block.isVisible,
          })),
          createdAt: response.data.createdAt,
          updatedAt: response.data.updatedAt,
        }

        setGuide(guide)
        setLoading(false)
        return guide
      } catch (error) {
        const message =
          error instanceof ApiError
            ? error.message
            : error instanceof Error
              ? error.message
              : '가이드를 불러올 수 없습니다'
        setError(message)
        setLoading(false)
        return null
      }
    },
    [setGuide, setLoading, setError]
  )

  /**
   * 가이드 저장
   */
  const saveGuide = useCallback(
    async (guideId: string, payload: SavePayload): Promise<void> => {
      const response = await api.patch<GuideApiResponse>(`/guides/${guideId}`, payload)

      if (!response.data) {
        throw new Error('저장 응답이 없습니다')
      }
    },
    []
  )

  /**
   * 가이드 발행
   */
  const publishGuide = useCallback(
    async (guideId: string): Promise<{ slug: string; url: string }> => {
      setSaveStatus('saving')

      try {
        const response = await api.post<GuideApiResponse>(`/guides/${guideId}/publish`, {
          isPublished: true,
        })

        if (!response.data) {
          throw new Error('발행 응답이 없습니다')
        }

        // 발행 상태 업데이트
        updateGuide({ isPublished: true })
        setSaveStatus('saved')

        const url = `${window.location.origin}/g/${response.data.slug}`
        return { slug: response.data.slug, url }
      } catch (error) {
        setSaveStatus('error')
        throw error
      }
    },
    [setSaveStatus, updateGuide]
  )

  /**
   * 가이드 발행 취소
   */
  const unpublishGuide = useCallback(
    async (guideId: string): Promise<void> => {
      setSaveStatus('saving')

      try {
        await api.post(`/guides/${guideId}/publish`, {
          isPublished: false,
        })

        // 발행 상태 업데이트
        updateGuide({ isPublished: false })
        setSaveStatus('saved')
      } catch (error) {
        setSaveStatus('error')
        throw error
      }
    },
    [setSaveStatus, updateGuide]
  )

  /**
   * 가이드 삭제
   */
  const deleteGuide = useCallback(async (guideId: string): Promise<void> => {
    await api.delete(`/guides/${guideId}`)
  }, [])

  return {
    loadGuide,
    saveGuide,
    publishGuide,
    unpublishGuide,
    deleteGuide,
  }
}

export default useGuide
