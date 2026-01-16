'use client'

import type { BlockType } from '@/stores/editor'
import {
  HeroBlock,
  QuickInfoBlock,
  AmenitiesBlock,
  MapBlock,
  HostPickBlock,
  NoticeBlock,
  GalleryBlock,
} from './blocks'

interface BlockRendererProps {
  type: BlockType
  content: Record<string, unknown>
}

export function BlockRenderer({ type, content }: BlockRendererProps) {
  switch (type) {
    case 'hero':
      return <HeroBlock content={content} />
    case 'quick_info':
      return <QuickInfoBlock content={content} />
    case 'amenities':
      return <AmenitiesBlock content={content} />
    case 'map':
      return <MapBlock content={content} />
    case 'host_pick':
      return <HostPickBlock content={content} />
    case 'notice':
      return <NoticeBlock content={content} />
    case 'gallery':
      return <GalleryBlock content={content} />
    default:
      return null
  }
}
