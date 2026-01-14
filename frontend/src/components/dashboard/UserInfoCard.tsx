'use client'

import { useUser } from '@/hooks/useUser'
import { Card, CardContent } from '@/components/ui/Card'
import { Crown, FileText, Eye } from 'lucide-react'
import Link from 'next/link'

export function UserInfoCard() {
  const { user, license, stats, isLoading, isPremium } = useUser()

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 w-32 rounded bg-neutral-200" />
            <div className="mt-2 h-3 w-48 rounded bg-neutral-200" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!user) {
    return null
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-heading-sm font-semibold text-text-primary">
              {user.name || '호스트'}님의 계정
            </h3>
            <p className="mt-1 text-body-sm text-text-secondary">{user.email}</p>
          </div>

          {/* 라이선스 배지 */}
          <div
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-body-xs font-medium ${
              isPremium
                ? 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700'
                : 'bg-neutral-100 text-neutral-600'
            }`}
          >
            {isPremium && <Crown className="h-3.5 w-3.5" />}
            <span>
              {license?.plan === 'free'
                ? '무료'
                : license?.plan === 'monthly'
                  ? '월간'
                  : license?.plan === 'biannual'
                    ? '6개월'
                    : license?.plan === 'annual'
                      ? '연간'
                      : '무료'}
            </span>
          </div>
        </div>

        {/* 통계 */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-neutral-50 p-3">
            <div className="flex items-center gap-2 text-text-secondary">
              <FileText className="h-4 w-4" />
              <span className="text-body-xs">안내서</span>
            </div>
            <p className="mt-1 text-heading-sm font-bold text-text-primary">
              {stats?.guidesCount ?? 0}
            </p>
          </div>
          <div className="rounded-lg bg-neutral-50 p-3">
            <div className="flex items-center gap-2 text-text-secondary">
              <Eye className="h-4 w-4" />
              <span className="text-body-xs">조회수</span>
            </div>
            <p className="mt-1 text-heading-sm font-bold text-text-primary">
              {stats?.totalViews ?? 0}
            </p>
          </div>
        </div>

        {/* 라이선스 정보 (무료 사용자만) */}
        {!isPremium && (
          <div className="mt-4 rounded-lg border border-primary-200 bg-primary-50 p-3">
            <p className="text-body-sm text-primary-700">
              프리미엄으로 업그레이드하고 더 많은 기능을 사용해보세요!
            </p>
            <Link
              href="/settings/license"
              className="mt-2 inline-block text-body-sm font-medium text-primary-600 hover:text-primary-700"
            >
              업그레이드하기 →
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
