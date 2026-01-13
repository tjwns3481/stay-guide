/**
 * Dashboard Home Page
 * 호스트 대시보드 메인 페이지
 */

import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { UserSync } from '@/components/auth/UserSync';

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  return (
    <div className="space-y-8">
      {/* User Sync (호스트 DB 동기화) */}
      <UserSync />

      {/* Welcome Section */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h1 className="text-2xl font-bold text-foreground">
          안녕하세요, {user.firstName || user.emailAddresses[0]?.emailAddress}님!
        </h1>
        <p className="text-muted-foreground mt-2">
          Roomy에 오신 것을 환영합니다. 아래에서 가이드북을 관리해보세요.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Create Guidebook */}
        <Link
          href="/dashboard/guidebooks/new"
          className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 hover:border-primary/50 transition-colors"
        >
          <div className="flex items-center space-x-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <svg
                className="h-6 w-6 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">새 가이드북 만들기</h3>
              <p className="text-sm text-muted-foreground">
                객실 안내서를 만들어보세요
              </p>
            </div>
          </div>
        </Link>

        {/* My Guidebooks */}
        <Link
          href="/dashboard/guidebooks"
          className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 hover:border-primary/50 transition-colors"
        >
          <div className="flex items-center space-x-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
              <svg
                className="h-6 w-6 text-accent"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">내 가이드북</h3>
              <p className="text-sm text-muted-foreground">
                가이드북 목록 보기
              </p>
            </div>
          </div>
        </Link>

        {/* Settings */}
        <Link
          href="/dashboard/settings"
          className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 hover:border-primary/50 transition-colors"
        >
          <div className="flex items-center space-x-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
              <svg
                className="h-6 w-6 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">설정</h3>
              <p className="text-sm text-muted-foreground">계정 설정 관리</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">최근 활동</h2>
        <div className="text-center py-8 text-muted-foreground">
          <p>아직 활동 내역이 없습니다.</p>
          <p className="text-sm mt-1">가이드북을 만들어 시작해보세요!</p>
        </div>
      </div>
    </div>
  );
}
