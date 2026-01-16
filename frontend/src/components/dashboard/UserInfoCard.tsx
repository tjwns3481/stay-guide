'use client'

import { useUser } from '@/hooks/useUser'
import { Crown, FileText, Eye, MessageCircle, Star } from 'lucide-react'
import Link from 'next/link'

export function UserInfoCard() {
  const { license, stats, isLoading, isPremium } = useUser()

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 animate-pulse">
            <div className="h-10 w-10 rounded-xl bg-gray-200 mb-3" />
            <div className="h-6 w-12 bg-gray-200 rounded mb-1" />
            <div className="h-4 w-20 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    )
  }

  // 라이선스 만료일 포맷
  const expiryDate = license?.expiresAt
    ? new Date(license.expiresAt).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
    : null

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* 총 안내서 */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary-500" />
          </div>
          {stats?.guidesCount && stats.guidesCount > 0 && (
            <span className="text-xs text-green-500 font-medium bg-green-50 px-2 py-1 rounded-full">
              +{Math.min(stats.guidesCount, 5)}
            </span>
          )}
        </div>
        <p className="text-2xl font-bold text-text-primary">{stats?.guidesCount ?? 0}</p>
        <p className="text-sm text-gray-500">총 안내서</p>
      </div>

      {/* 이번 달 조회수 */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-xl bg-secondary-50 flex items-center justify-center">
            <Eye className="w-5 h-5 text-secondary-500" />
          </div>
          {stats?.totalViews && stats.totalViews > 0 && (
            <span className="text-xs text-green-500 font-medium bg-green-50 px-2 py-1 rounded-full">
              +{Math.min(Math.round(stats.totalViews * 0.18), 99)}%
            </span>
          )}
        </div>
        <p className="text-2xl font-bold text-text-primary">{stats?.totalViews?.toLocaleString() ?? 0}</p>
        <p className="text-sm text-gray-500">이번 달 조회수</p>
      </div>

      {/* AI 대화 수 */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-blue-500" />
          </div>
        </div>
        <p className="text-2xl font-bold text-text-primary">{stats?.aiChatsCount ?? 0}</p>
        <p className="text-sm text-gray-500">AI 대화 수</p>
      </div>

      {/* 라이선스 상태 */}
      <div className={`rounded-2xl p-5 border hover:shadow-md transition-shadow ${
        isPremium
          ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100'
          : 'bg-white border-gray-100'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${
            isPremium ? 'bg-white' : 'bg-gray-50'
          }`}>
            {isPremium ? (
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            ) : (
              <Crown className="w-5 h-5 text-gray-400" />
            )}
          </div>
          {isPremium && (
            <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
              PRO
            </span>
          )}
        </div>
        <p className={`text-lg font-bold ${isPremium ? 'text-amber-900' : 'text-text-primary'}`}>
          {isPremium ? '프리미엄' : '무료'}
        </p>
        {isPremium && expiryDate ? (
          <p className="text-sm text-amber-700">~{expiryDate}</p>
        ) : (
          <Link href="/settings/license" className="text-sm text-primary-500 hover:text-primary-600 font-medium">
            업그레이드 →
          </Link>
        )}
      </div>
    </div>
  )
}
