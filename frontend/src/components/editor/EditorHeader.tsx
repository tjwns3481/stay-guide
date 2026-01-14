'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Eye, Edit3, Save, MoreVertical, Share2, Trash2, Check, Copy, ExternalLink } from 'lucide-react'
import { useEditorStore } from '@/stores/editor'
import { useGuide } from '@/hooks'
import { SaveStatus } from './SaveStatus'
import { useState } from 'react'

interface EditorHeaderProps {
  guideId: string
  onSaveNow: () => Promise<void>
}

export function EditorHeader({ guideId, onSaveNow }: EditorHeaderProps) {
  const router = useRouter()
  const { guide, viewMode, setViewMode, saveStatus, hasUnsavedChanges } = useEditorStore()
  const { publishGuide, unpublishGuide, deleteGuide } = useGuide()

  const [showMenu, setShowMenu] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [showShareToast, setShowShareToast] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  if (!guide) return null

  const handlePublish = async () => {
    if (isPublishing) return

    setIsPublishing(true)
    try {
      // 먼저 저장되지 않은 변경사항 저장
      if (hasUnsavedChanges()) {
        await onSaveNow()
      }

      if (guide.isPublished) {
        // 발행 취소
        await unpublishGuide(guideId)
      } else {
        // 발행
        const { url } = await publishGuide(guideId)
        // URL 복사
        await navigator.clipboard.writeText(url)
        setShowShareToast(true)
        setTimeout(() => setShowShareToast(false), 3000)
      }
    } catch (error) {
      console.error('발행 실패:', error)
      alert(guide.isPublished ? '발행 취소에 실패했습니다.' : '발행에 실패했습니다.')
    } finally {
      setIsPublishing(false)
    }
  }

  const handleShare = async () => {
    if (!guide.isPublished) return

    const url = `${window.location.origin}/g/${guide.slug}`
    try {
      await navigator.clipboard.writeText(url)
      setShowShareToast(true)
      setTimeout(() => setShowShareToast(false), 3000)
    } catch {
      // 클립보드 API 실패 시 prompt 사용
      prompt('URL을 복사하세요:', url)
    }
  }

  const handleOpenPreview = () => {
    if (guide.isPublished) {
      window.open(`/g/${guide.slug}`, '_blank')
    }
  }

  const handleDelete = async () => {
    try {
      await deleteGuide(guideId)
      router.push('/dashboard')
    } catch (error) {
      console.error('삭제 실패:', error)
      alert('안내서 삭제에 실패했습니다.')
    }
  }

  return (
    <>
      <header className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-4 relative">
        {/* 왼쪽: 뒤로가기 + 제목 */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="대시보드로 돌아가기"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>

          <div className="hidden sm:block">
            <h1 className="font-medium text-gray-900 truncate max-w-[200px]">
              {guide.title}
            </h1>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>{guide.accommodationName}</span>
              <span className={`px-1.5 py-0.5 rounded ${
                guide.isPublished
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {guide.isPublished ? '발행됨' : '초안'}
              </span>
            </div>
          </div>
        </div>

        {/* 중앙: 뷰 모드 토글 (모바일) */}
        <div className="flex lg:hidden items-center bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('edit')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'edit'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span>편집</span>
          </button>
          <button
            onClick={() => setViewMode('preview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'preview'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>미리보기</span>
          </button>
        </div>

        {/* 오른쪽: 저장 상태 + 액션 버튼 */}
        <div className="flex items-center gap-2">
          <SaveStatus />

          {/* 공유 버튼 */}
          {guide.isPublished && (
            <button
              onClick={handleShare}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span>공유</span>
            </button>
          )}

          {/* 외부 링크 버튼 */}
          {guide.isPublished && (
            <button
              onClick={handleOpenPreview}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="새 탭에서 열기"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          )}

          {/* 발행/발행 취소 버튼 */}
          <button
            onClick={handlePublish}
            disabled={isPublishing || saveStatus === 'saving'}
            className={`hidden sm:flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              guide.isPublished
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                : 'bg-primary-500 text-white hover:bg-primary-600'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isPublishing ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>{guide.isPublished ? '취소 중...' : '발행 중...'}</span>
              </>
            ) : (
              <>
                {guide.isPublished ? '발행 취소' : '발행하기'}
              </>
            )}
          </button>

          {/* 더보기 메뉴 */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1">
                  {/* 수동 저장 */}
                  <button
                    onClick={async () => {
                      await onSaveNow()
                      setShowMenu(false)
                    }}
                    disabled={saveStatus === 'saving' || saveStatus === 'saved'}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    지금 저장
                  </button>

                  {/* URL 복사 */}
                  {guide.isPublished && (
                    <button
                      onClick={() => {
                        handleShare()
                        setShowMenu(false)
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Copy className="w-4 h-4" />
                      URL 복사
                    </button>
                  )}

                  {/* 모바일 발행 버튼 */}
                  <button
                    onClick={() => {
                      handlePublish()
                      setShowMenu(false)
                    }}
                    disabled={isPublishing}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 sm:hidden"
                  >
                    <Save className="w-4 h-4" />
                    {guide.isPublished ? '발행 취소' : '발행하기'}
                  </button>

                  <hr className="my-1 border-gray-100" />

                  {/* 삭제 버튼 */}
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(true)
                      setShowMenu(false)
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    안내서 삭제
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 공유 완료 토스트 */}
        {showShareToast && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg flex items-center gap-2 animate-fade-in z-50">
            <Check className="w-4 h-4 text-green-400" />
            URL이 복사되었습니다!
          </div>
        )}
      </header>

      {/* 삭제 확인 모달 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 animate-fade-in">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              안내서를 삭제할까요?
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              &quot;{guide.title}&quot;을(를) 삭제하면 복구할 수 없습니다.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
