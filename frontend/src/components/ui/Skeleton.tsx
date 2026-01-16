'use client'

import { cn } from '@/lib/utils/cn'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-gray-200',
        className
      )}
    />
  )
}

// 가이드 카드 스켈레톤
export function GuideCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <div className="flex items-center gap-4 pt-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  )
}

// 가이드 목록 스켈레톤
export function GuideListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <GuideCardSkeleton key={i} />
      ))}
    </div>
  )
}

// 블록 스켈레톤
export function BlockSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
      <Skeleton className="h-6 w-1/3" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  )
}

// 히어로 블록 스켈레톤
export function HeroBlockSkeleton() {
  return (
    <div className="relative">
      <Skeleton className="w-full h-64 sm:h-80 rounded-b-3xl" />
      <div className="absolute bottom-0 left-0 right-0 p-6 space-y-2">
        <Skeleton className="h-8 w-2/3 bg-gray-300" />
        <Skeleton className="h-4 w-1/2 bg-gray-300" />
      </div>
    </div>
  )
}

// 게스트 페이지 전체 스켈레톤
export function GuestPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <HeroBlockSkeleton />
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <BlockSkeleton />
        <BlockSkeleton />
        <BlockSkeleton />
      </div>
    </div>
  )
}

// 에디터 스켈레톤
export function EditorSkeleton() {
  return (
    <div className="flex h-screen">
      {/* 사이드바 스켈레톤 */}
      <div className="hidden lg:block w-80 border-r border-gray-200 bg-white p-4 space-y-4">
        <Skeleton className="h-8 w-full" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      </div>

      {/* 메인 콘텐츠 스켈레톤 */}
      <div className="flex-1 bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto space-y-4">
          <HeroBlockSkeleton />
          <BlockSkeleton />
          <BlockSkeleton />
        </div>
      </div>
    </div>
  )
}
