/**
 * Guidebook Loading State
 * 가이드북 로딩 중 스켈레톤 UI
 */

export default function GuidebookLoading() {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      {/* Header Skeleton */}
      <div className="relative">
        <div className="h-48 md:h-64 rounded-xl bg-muted" />
        <div className="relative -mt-16 px-4 md:px-6">
          <div className="bg-card rounded-xl p-6 shadow-lg border border-border">
            <div className="h-8 w-3/4 bg-muted rounded" />
            <div className="mt-3 h-4 w-1/2 bg-muted rounded" />
          </div>
        </div>
      </div>

      {/* Blocks Skeleton */}
      <div className="px-4 md:px-6 py-6 space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-card rounded-xl p-6 border border-border"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 bg-muted rounded" />
              <div className="h-5 w-24 bg-muted rounded" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-full bg-muted rounded" />
              <div className="h-4 w-2/3 bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
