import { GuideListSkeleton } from '@/components/ui/Skeleton'

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 헤더 스켈레톤 */}
        <div className="flex justify-between items-center mb-6">
          <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-11 w-32 bg-gray-200 rounded-lg animate-pulse" />
        </div>

        {/* 가이드 목록 스켈레톤 */}
        <GuideListSkeleton count={4} />
      </div>
    </div>
  )
}
