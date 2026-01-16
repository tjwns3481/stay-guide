import { currentUser } from '@clerk/nextjs/server'
import Link from 'next/link'
import { UserInfoCard, GuidesList } from '@/components/dashboard'
import { UpgradeBanner } from '@/components/license/UpgradeBanner'
import { cookies } from 'next/headers'
import { Upload, BarChart3, Settings } from 'lucide-react'

async function getUserProfile() {
  try {
    const cookieStore = await cookies()
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/users/me`, {
      headers: {
        Cookie: cookieStore.toString(),
      },
      cache: 'no-store',
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.success ? data.data : null
  } catch {
    return null
  }
}

export default async function DashboardPage() {
  const user = await currentUser()
  const profile = await getUserProfile()

  // 무료 플랜 사용자인지 확인
  const isFreePlan = !profile?.license || profile.license.plan === 'free' || profile.license.status !== 'active'

  // 사용자 이니셜 (아바타용)
  const userInitial = user?.firstName?.[0] || user?.emailAddresses?.[0]?.emailAddress?.[0]?.toUpperCase() || 'H'

  return (
    <div className="max-w-6xl mx-auto">
      {/* Welcome Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-lg">
            {userInitial}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              안녕하세요, {user?.firstName || '호스트'}님
            </h1>
            <p className="text-gray-500">
              오늘도 게스트에게 좋은 경험을 선물하세요
            </p>
          </div>
        </div>
      </div>

      {/* Upgrade Banner for Free Users */}
      {isFreePlan && (
        <div className="mb-8">
          <UpgradeBanner />
        </div>
      )}

      {/* User Info Card (Stats) */}
      <div className="mb-8">
        <UserInfoCard />
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-text-primary mb-4">빠른 작업</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link
            href="/editor/new"
            className="flex flex-col items-center justify-center p-5 bg-white rounded-2xl border-2 border-dashed border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-primary-100 group-hover:bg-primary-200 flex items-center justify-center mb-2 transition-colors">
              <svg
                className="w-6 h-6 text-primary-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
            <span className="font-medium text-text-primary">새 안내서</span>
          </Link>

          <button
            className="flex flex-col items-center justify-center p-5 bg-white rounded-2xl border border-gray-100 hover:border-secondary-300 hover:bg-secondary-50 transition-all group"
            disabled
          >
            <div className="w-12 h-12 rounded-xl bg-secondary-100 group-hover:bg-secondary-200 flex items-center justify-center mb-2 transition-colors">
              <Upload className="w-6 h-6 text-secondary-600" />
            </div>
            <span className="font-medium text-text-primary">가져오기</span>
            <span className="text-xs text-gray-400 mt-0.5">준비 중</span>
          </button>

          <button
            className="flex flex-col items-center justify-center p-5 bg-white rounded-2xl border border-gray-100 hover:border-blue-300 hover:bg-blue-50 transition-all group"
            disabled
          >
            <div className="w-12 h-12 rounded-xl bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center mb-2 transition-colors">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <span className="font-medium text-text-primary">통계 보기</span>
            <span className="text-xs text-gray-400 mt-0.5">준비 중</span>
          </button>

          <Link
            href="/settings/license"
            className="flex flex-col items-center justify-center p-5 bg-white rounded-2xl border border-gray-100 hover:border-purple-300 hover:bg-purple-50 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-100 group-hover:bg-purple-200 flex items-center justify-center mb-2 transition-colors">
              <Settings className="w-6 h-6 text-purple-600" />
            </div>
            <span className="font-medium text-text-primary">설정</span>
          </Link>
        </div>
      </div>

      {/* Guides List */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-text-primary">
            내 안내서
          </h2>
        </div>

        <GuidesList />
      </div>
    </div>
  )
}
