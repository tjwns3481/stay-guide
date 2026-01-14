export default function GuestGuideLoading() {
  return (
    <div className="min-h-screen bg-gray-50 animate-pulse">
      {/* Hero 스켈레톤 */}
      <div className="w-full h-64 bg-gray-200" />

      {/* 컨텐츠 스켈레톤 */}
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        <div className="bg-white rounded-xl p-4 space-y-3">
          <div className="h-6 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
        </div>

        <div className="bg-white rounded-xl p-4 space-y-3">
          <div className="h-6 bg-gray-200 rounded w-1/4" />
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
        </div>

        <div className="bg-white rounded-xl p-4 space-y-3">
          <div className="h-6 bg-gray-200 rounded w-1/3" />
          <div className="grid grid-cols-2 gap-2">
            <div className="h-16 bg-gray-200 rounded" />
            <div className="h-16 bg-gray-200 rounded" />
            <div className="h-16 bg-gray-200 rounded" />
            <div className="h-16 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    </div>
  )
}
