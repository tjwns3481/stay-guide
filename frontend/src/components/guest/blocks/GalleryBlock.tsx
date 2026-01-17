'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import Image from 'next/image'

interface GalleryBlockProps {
  content: Record<string, unknown>
}

interface GalleryImage {
  url: string
  caption?: string
}

const getImages = (value: unknown): GalleryImage[] => {
  if (!Array.isArray(value)) return []
  return value.filter(
    (item): item is GalleryImage =>
      typeof item === 'object' &&
      item !== null &&
      'url' in item &&
      typeof (item as GalleryImage).url === 'string'
  )
}

const getString = (value: unknown): string | undefined => {
  return typeof value === 'string' ? value : undefined
}

export function GalleryBlock({ content }: GalleryBlockProps) {
  const images = getImages(content.images)
  const title = getString(content.title) || '공간 둘러보기'
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // 최소 스와이프 거리
  const minSwipeDistance = 50

  const goToSlide = useCallback((index: number) => {
    const newIndex = Math.max(0, Math.min(index, images.length - 1))
    setCurrentIndex(newIndex)

    if (scrollRef.current) {
      const slideWidth = scrollRef.current.offsetWidth
      scrollRef.current.scrollTo({
        left: newIndex * slideWidth,
        behavior: 'smooth'
      })
    }
  }, [images.length])

  const goToPrev = useCallback(() => {
    goToSlide(currentIndex - 1)
  }, [currentIndex, goToSlide])

  const goToNext = useCallback(() => {
    goToSlide(currentIndex + 1)
  }, [currentIndex, goToSlide])

  // 터치 이벤트 핸들러
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      goToNext()
    } else if (isRightSwipe) {
      goToPrev()
    }
  }

  // 스크롤 동기화
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollRef.current) return
      const slideWidth = scrollRef.current.offsetWidth
      const scrollLeft = scrollRef.current.scrollLeft
      const newIndex = Math.round(scrollLeft / slideWidth)
      if (newIndex !== currentIndex && newIndex >= 0 && newIndex < images.length) {
        setCurrentIndex(newIndex)
      }
    }

    const ref = scrollRef.current
    ref?.addEventListener('scroll', handleScroll)
    return () => ref?.removeEventListener('scroll', handleScroll)
  }, [currentIndex, images.length])

  if (images.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <p className="text-gray-400 text-center">이미지를 추가해주세요</p>
      </div>
    )
  }

  // 메이슨리 그리드 (이미지가 3개 이상일 때)
  const showMasonryGrid = images.length >= 3

  return (
    <>
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
        {/* 헤더 */}
        <div className="px-5 py-4 border-b border-gray-50">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-primary-500 rounded-full" />
            {title}
          </h3>
        </div>

        <div className="p-4">
          {showMasonryGrid ? (
            // 메이슨리 그리드 레이아웃
            <div
              className="grid grid-cols-3 gap-2 cursor-pointer"
              onClick={() => setIsFullscreen(true)}
            >
              {/* 큰 이미지 (2x2) */}
              <div className="col-span-2 row-span-2 relative rounded-xl overflow-hidden aspect-square">
                <Image
                  src={images[0].url}
                  alt={images[0].caption || '이미지 1'}
                  fill
                  sizes="(max-width: 640px) 66vw, 400px"
                  className="object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              {/* 작은 이미지 1 */}
              <div className="relative rounded-xl overflow-hidden aspect-square">
                <Image
                  src={images[1].url}
                  alt={images[1].caption || '이미지 2'}
                  fill
                  sizes="(max-width: 640px) 33vw, 200px"
                  className="object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              {/* 작은 이미지 2 (더보기 오버레이) */}
              <div className="relative rounded-xl overflow-hidden aspect-square">
                <Image
                  src={images[2].url}
                  alt={images[2].caption || '이미지 3'}
                  fill
                  sizes="(max-width: 640px) 33vw, 200px"
                  className="object-cover"
                />
                {images.length > 3 && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center hover:bg-black/50 transition-colors">
                    <span className="text-white font-semibold text-sm">+{images.length - 3}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // 캐러셀 레이아웃 (이미지가 1-2개일 때)
            <div className="relative group">
              <div
                ref={scrollRef}
                className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide rounded-xl"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
              >
                {images.map((image, index) => (
                  <div
                    key={index}
                    className="flex-shrink-0 w-full snap-center cursor-pointer"
                    onClick={() => setIsFullscreen(true)}
                  >
                    <div className="aspect-[4/3] relative rounded-xl overflow-hidden">
                      <Image
                        src={image.url}
                        alt={image.caption || `이미지 ${index + 1}`}
                        fill
                        sizes="(max-width: 640px) 100vw, 600px"
                        className="object-cover"
                        priority={index === 0}
                      />
                      {/* Caption overlay */}
                      {image.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                          <p className="text-white text-sm">{image.caption}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Navigation Buttons */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      goToPrev()
                    }}
                    disabled={currentIndex === 0}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
                    aria-label="이전 이미지"
                  >
                    <ChevronLeft className="w-6 h-6 text-gray-700" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      goToNext()
                    }}
                    disabled={currentIndex === images.length - 1}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
                    aria-label="다음 이미지"
                  >
                    <ChevronRight className="w-6 h-6 text-gray-700" />
                  </button>
                </>
              )}

              {/* Dots Indicator */}
              {images.length > 1 && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation()
                        goToSlide(index)
                      }}
                      className="p-1.5"
                      aria-label={`이미지 ${index + 1}로 이동`}
                    >
                      <span
                        className={`block rounded-full transition-all ${
                          index === currentIndex
                            ? 'bg-white w-4 h-1.5'
                            : 'bg-white/50 hover:bg-white/70 w-1.5 h-1.5'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Image counter */}
              <div className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                {currentIndex + 1} / {images.length}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-50 bg-black flex items-center justify-center"
          onClick={() => setIsFullscreen(false)}
        >
          {/* Close button */}
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            aria-label="닫기"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Fullscreen Image */}
          <div
            className="w-full h-full flex items-center justify-center p-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[currentIndex].url}
              alt={images[currentIndex].caption || `이미지 ${currentIndex + 1}`}
              fill
              sizes="100vw"
              className="object-contain"
              priority
            />
          </div>

          {/* Fullscreen Navigation */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  goToPrev()
                }}
                disabled={currentIndex === 0}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors disabled:opacity-30"
                aria-label="이전 이미지"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  goToNext()
                }}
                disabled={currentIndex === images.length - 1}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors disabled:opacity-30"
                aria-label="다음 이미지"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </>
          )}

          {/* Caption in fullscreen */}
          {images[currentIndex]?.caption && (
            <div className="absolute bottom-8 left-0 right-0 text-center">
              <p className="text-white text-base bg-black/40 inline-block px-4 py-2 rounded-lg">
                {images[currentIndex].caption}
              </p>
            </div>
          )}

          {/* Fullscreen counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
            {currentIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  )
}
