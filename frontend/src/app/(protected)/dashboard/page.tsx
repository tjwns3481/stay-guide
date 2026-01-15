import { currentUser } from '@clerk/nextjs/server'
import Link from 'next/link'
import { UserInfoCard, GuidesList } from '@/components/dashboard'

export default async function DashboardPage() {
  const user = await currentUser()

  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-display-sm font-bold text-text-primary">
          안녕하세요, {user?.firstName || '호스트'}님
        </h1>
        <p className="mt-2 text-body-md text-text-secondary">
          오늘도 게스트에게 좋은 경험을 선물하세요
        </p>
      </div>

      {/* User Info Card */}
      <div className="mb-8">
        <UserInfoCard />
      </div>

      {/* Quick Actions */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/editor/new"
          className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-200 bg-white p-8 text-center transition-colors hover:border-primary-300 hover:bg-primary-50"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
            <svg
              className="h-6 w-6 text-primary-500"
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
          <h3 className="text-heading-sm font-semibold text-text-primary">
            새 안내서 만들기
          </h3>
          <p className="mt-1 text-body-sm text-text-secondary">
            게스트를 위한 안내서를 만들어보세요
          </p>
        </Link>
      </div>

      {/* Guides List */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-heading-md font-semibold text-text-primary">
            내 안내서
          </h2>
        </div>

        <GuidesList />
      </div>
    </div>
  )
}
