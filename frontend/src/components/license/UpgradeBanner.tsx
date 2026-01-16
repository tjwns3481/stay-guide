'use client'

import Link from 'next/link'
import { Sparkles, ArrowRight, X } from 'lucide-react'
import { useState } from 'react'

interface UpgradeBannerProps {
  variant?: 'inline' | 'floating'
  showDismiss?: boolean
}

export function UpgradeBanner({ variant = 'inline', showDismiss = true }: UpgradeBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false)

  if (isDismissed) {
    return null
  }

  if (variant === 'floating') {
    return (
      <div className="fixed bottom-4 right-4 z-40 max-w-sm">
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-4 shadow-lg">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="text-white font-semibold text-sm">프리미엄으로 업그레이드</h4>
              <p className="text-white/80 text-xs mt-1">
                워터마크 제거, AI 컨시어지, 무제한 안내서
              </p>
              <Link
                href="/settings/license"
                className="inline-flex items-center gap-1 mt-2 text-white text-xs font-medium hover:underline"
              >
                요금제 보기
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {showDismiss && (
              <button
                onClick={() => setIsDismissed(true)}
                className="flex-shrink-0 p-1 hover:bg-white/10 rounded-lg transition-colors"
                aria-label="닫기"
              >
                <X className="w-4 h-4 text-white/70" />
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-200 rounded-xl p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">프리미엄 기능을 사용해보세요</h4>
            <p className="text-sm text-gray-600">
              워터마크 제거, AI 컨시어지, 무제한 안내서 생성
            </p>
          </div>
        </div>
        <Link
          href="/settings/license"
          className="flex-shrink-0 inline-flex items-center gap-2 h-11 px-4 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors"
        >
          업그레이드
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}

// 에디터에서 사용할 작은 CTA
export function UpgradePrompt({ feature }: { feature: string }) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
        <p className="text-amber-800">
          <span className="font-medium">{feature}</span>은 프리미엄 기능입니다.{' '}
          <Link href="/settings/license" className="text-primary-600 hover:underline font-medium">
            업그레이드하기
          </Link>
        </p>
      </div>
    </div>
  )
}
