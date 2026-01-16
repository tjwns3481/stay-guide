'use client'

import { useState, useCallback, useEffect } from 'react'
import { Link2, AlertCircle, CheckCircle2, Loader2, X } from 'lucide-react'

interface SlugInputModalProps {
  isOpen: boolean
  onConfirm: (slug: string, title: string, accommodationName: string) => void
  onCancel: () => void
  isLoading?: boolean
}

// 슬러그 유효성 검사 (영문 소문자, 숫자, 하이픈만 허용, 3-50자)
function isValidSlug(slug: string): boolean {
  if (slug.length < 3 || slug.length > 50) {
    return false
  }
  return /^[a-z0-9-]+$/.test(slug)
}

// 슬러그 자동 변환 (대문자 → 소문자, 공백/특수문자 → 하이픈)
function normalizeSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, '') // 영문, 숫자, 한글, 공백, 하이픈만 남김
    .replace(/[가-힣]/g, '') // 한글 제거
    .replace(/\s+/g, '-') // 공백 → 하이픈
    .replace(/-+/g, '-') // 연속 하이픈 → 단일 하이픈
    .replace(/^-|-$/g, '') // 앞뒤 하이픈 제거
}

export function SlugInputModal({
  isOpen,
  onConfirm,
  onCancel,
  isLoading = false,
}: SlugInputModalProps) {
  const [slug, setSlug] = useState('')
  const [title, setTitle] = useState('')
  const [accommodationName, setAccommodationName] = useState('')
  const [isCheckingSlug, setIsCheckingSlug] = useState(false)
  const [slugStatus, setSlugStatus] = useState<'idle' | 'valid' | 'invalid' | 'taken'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  // 슬러그 입력 처리
  const handleSlugChange = useCallback((value: string) => {
    const normalized = normalizeSlug(value)
    setSlug(normalized)
    setSlugStatus('idle')
    setErrorMessage('')
  }, [])

  // 슬러그 중복 체크
  const checkSlugAvailability = useCallback(async (slugToCheck: string) => {
    if (!slugToCheck || !isValidSlug(slugToCheck)) {
      return
    }

    setIsCheckingSlug(true)
    try {
      const response = await fetch(`/api/guides/check-slug?slug=${encodeURIComponent(slugToCheck)}`)
      const data = await response.json()

      if (data.available) {
        setSlugStatus('valid')
        setErrorMessage('')
      } else {
        setSlugStatus('taken')
        setErrorMessage('이미 사용 중인 URL입니다')
      }
    } catch (error) {
      setSlugStatus('invalid')
      setErrorMessage('확인 중 오류가 발생했습니다')
    } finally {
      setIsCheckingSlug(false)
    }
  }, [])

  // 디바운스된 슬러그 체크
  useEffect(() => {
    if (!slug) {
      setSlugStatus('idle')
      return
    }

    if (!isValidSlug(slug)) {
      setSlugStatus('invalid')
      setErrorMessage('영문 소문자, 숫자, 하이픈만 사용 가능합니다 (3-50자)')
      return
    }

    const timer = setTimeout(() => {
      checkSlugAvailability(slug)
    }, 500)

    return () => clearTimeout(timer)
  }, [slug, checkSlugAvailability])

  // 제출 처리
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!slug || !title || !accommodationName) {
      return
    }

    if (slugStatus !== 'valid') {
      return
    }

    onConfirm(slug, title, accommodationName)
  }

  // 모달 닫힐 때 초기화
  useEffect(() => {
    if (!isOpen) {
      setSlug('')
      setTitle('')
      setAccommodationName('')
      setSlugStatus('idle')
      setErrorMessage('')
    }
  }, [isOpen])

  if (!isOpen) return null

  const previewUrl = slug ? `${typeof window !== 'undefined' ? window.location.origin : ''}/g/${slug}` : ''
  const canSubmit = slug && title && accommodationName && slugStatus === 'valid' && !isLoading

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* 모달 */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-white">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Link2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-lg">새 안내서 만들기</h2>
                <p className="text-white/80 text-sm">게스트가 접속할 URL을 설정하세요</p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="text-white/70 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* 숙소명 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              숙소 이름 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={accommodationName}
              onChange={(e) => setAccommodationName(e.target.value)}
              placeholder="예: 해운대 오션뷰 스테이"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-200 focus:border-primary-500 transition-all"
              required
              autoFocus
            />
          </div>

          {/* 안내서 제목 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              안내서 제목 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 해운대 오션뷰 스테이"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-200 focus:border-primary-500 transition-all"
              required
            />
          </div>

          {/* URL 슬러그 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              게스트 페이지 URL <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400 text-sm">
                /g/
              </div>
              <input
                type="text"
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="my-guesthouse"
                className={`w-full pl-10 pr-10 py-3 border rounded-xl focus:ring-2 transition-all ${
                  slugStatus === 'valid'
                    ? 'border-green-300 focus:ring-green-200 focus:border-green-500'
                    : slugStatus === 'invalid' || slugStatus === 'taken'
                    ? 'border-red-300 focus:ring-red-200 focus:border-red-500'
                    : 'border-gray-200 focus:ring-primary-200 focus:border-primary-500'
                }`}
                required
              />
              {/* 상태 아이콘 */}
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                {isCheckingSlug && (
                  <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                )}
                {!isCheckingSlug && slugStatus === 'valid' && (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                )}
                {!isCheckingSlug && (slugStatus === 'invalid' || slugStatus === 'taken') && (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                )}
              </div>
            </div>

            {/* 에러/도움말 메시지 */}
            {errorMessage ? (
              <p className="mt-1.5 text-xs text-red-500">{errorMessage}</p>
            ) : (
              <p className="mt-1.5 text-xs text-gray-400">
                영문 소문자, 숫자, 하이픈(-) 사용 가능
              </p>
            )}
          </div>

          {/* URL 미리보기 */}
          {slug && slugStatus === 'valid' && (
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">게스트 접속 URL</p>
              <p className="text-sm font-medium text-primary-600 break-all">
                {previewUrl}
              </p>
            </div>
          )}

          {/* 버튼 */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              disabled={isLoading}
            >
              취소
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="flex-1 px-4 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  생성 중...
                </>
              ) : (
                '안내서 만들기'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
