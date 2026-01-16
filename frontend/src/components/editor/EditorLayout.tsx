'use client'

import { useEffect } from 'react'
import { useEditorStore } from '@/stores/editor'
import { useAutoSave, useGuide } from '@/hooks'
import { PreviewPanel } from './PreviewPanel'
import { ControlPanel } from './ControlPanel'
import { QuickNavSidebar } from './QuickNavSidebar'
import { MobileBottomSheet } from './MobileBottomSheet'
import { EditorHeader } from './EditorHeader'

interface EditorLayoutProps {
  guideId: string
}

export function EditorLayout({ guideId }: EditorLayoutProps) {
  const {
    guide,
    isLoading,
    error,
    viewMode,
  } = useEditorStore()

  const { loadGuide, saveGuide } = useGuide()

  // 자동 저장 훅
  const { saveNow } = useAutoSave(guideId, saveGuide, {
    debounceMs: 2000,
    onSaveSuccess: () => {
      console.log('[AutoSave] 저장 완료')
    },
    onSaveError: (error) => {
      console.error('[AutoSave] 저장 실패:', error)
    },
  })

  // 가이드 데이터 로드
  useEffect(() => {
    loadGuide(guideId)
  }, [guideId, loadGuide])

  // 페이지 이탈 시 저장 확인
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const { hasUnsavedChanges } = useEditorStore.getState()
      if (hasUnsavedChanges()) {
        e.preventDefault()
        e.returnValue = '저장되지 않은 변경사항이 있습니다. 정말 나가시겠습니까?'
        return e.returnValue
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  // 키보드 단축키 (Ctrl+S / Cmd+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        saveNow()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [saveNow])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent mx-auto" />
          <p className="mt-4 text-gray-600">안내서를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">!</div>
          <p className="text-gray-900 font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
          >
            다시 시도
          </button>
        </div>
      </div>
    )
  }

  if (!guide) {
    return null
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* 헤더 */}
      <EditorHeader guideId={guideId} onSaveNow={saveNow} />

      {/* 메인 컨텐츠 */}
      <div className="flex-1 flex overflow-hidden">
        {/* PC: 3-column 레이아웃 */}
        <div className="hidden lg:flex flex-1">
          {/* 왼쪽: 미리보기 */}
          <div className="flex-1 min-w-[400px] bg-gray-100 overflow-y-auto flex items-start justify-center py-8 px-6">
            <PreviewPanel />
          </div>

          {/* 가운데: 컨트롤 패널 */}
          <div className="w-[400px] flex-shrink-0 border-l border-gray-200 bg-white overflow-y-auto">
            <ControlPanel />
          </div>

          {/* 오른쪽: 빠른 네비게이션 사이드바 */}
          <div className="w-[200px] flex-shrink-0 overflow-y-auto">
            <QuickNavSidebar />
          </div>
        </div>

        {/* 모바일/태블릿: 전체 화면 */}
        <div className="flex lg:hidden flex-1 flex-col">
          {viewMode === 'edit' ? (
            <div className="flex-1 overflow-y-auto bg-white">
              <ControlPanel />
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
              <PreviewPanel />
            </div>
          )}
        </div>
      </div>

      {/* 모바일 Bottom Sheet */}
      <MobileBottomSheet />
    </div>
  )
}
