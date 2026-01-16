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

  return (
    <div className="relative rounded-xl overflow-hidden bg-gray-100 -mx-4 sm:mx-0">
      {imageUrl ? (
        <div className="relative w-full h-64 sm:h-80">
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, 672px"
            className="object-cover"
            priority
          />
        </div>
      ) : (
        <div className="w-full h-64 sm:h-80 theme-primary-bg opacity-90" />
      )}
      <div
        className="absolute inset-0 flex items-center justify-center text-white text-center p-6"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
      >
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold">{title}</h2>
          {subtitle && (
            <p className="text-sm sm:text-base mt-2 opacity-90">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  )
}
