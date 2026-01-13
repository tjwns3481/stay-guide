/**
 * GuidebookHeader Component
 * 가이드북 헤더 - 제목, 설명, 커버 이미지
 */

import Image from 'next/image';
import type { Guidebook } from '@/db/schema';

interface GuidebookHeaderProps {
  guidebook: Guidebook;
}

export function GuidebookHeader({ guidebook }: GuidebookHeaderProps) {
  const { title, description, coverImage } = guidebook;

  return (
    <header className="relative">
      {/* Cover Image or Gradient Background */}
      <div className="relative h-48 md:h-64 rounded-xl overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20">
        {coverImage && (
          <Image
            src={coverImage}
            alt={title}
            fill
            className="object-cover"
            priority
          />
        )}
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      {/* Title & Description */}
      <div className="relative -mt-16 px-4 md:px-6">
        <div className="bg-card rounded-xl p-6 shadow-lg border border-border">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {title}
          </h1>
          {description && (
            <p className="mt-2 text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
    </header>
  );
}
