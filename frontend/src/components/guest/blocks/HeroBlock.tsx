'use client'

import Image from 'next/image'

interface HeroBlockProps {
  content: Record<string, unknown>
}

const getString = (value: unknown): string | undefined => {
  return typeof value === 'string' ? value : undefined
}

export function HeroBlock({ content }: HeroBlockProps) {
  const imageUrl = getString(content.imageUrl)
  const title = getString(content.title) || '환영합니다'
  const subtitle = getString(content.subtitle)
  const tag = getString(content.tag)

  return (
    <div className="relative h-[320px] sm:h-[420px] overflow-hidden -mx-4 sm:mx-0 sm:rounded-2xl">
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={title}
          fill
          sizes="(max-width: 640px) 100vw, 672px"
          className="object-cover"
          priority
        />
      ) : (
        <div className="w-full h-full theme-primary-bg opacity-90" />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      {/* Hero Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <div className="max-w-2xl">
          {tag && (
            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur rounded-full text-xs font-medium mb-3">
              {tag}
            </span>
          )}
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">{title}</h2>
          {subtitle && (
            <p className="text-white/80 text-sm sm:text-base">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  )
}
