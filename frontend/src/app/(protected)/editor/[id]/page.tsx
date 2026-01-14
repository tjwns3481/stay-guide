'use client'

import { useParams } from 'next/navigation'
import { EditorLayout } from '@/components/editor'

export default function EditorPage() {
  const params = useParams()
  const guideId = params.id as string

  if (!guideId) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-500">안내서 ID가 필요합니다</p>
      </div>
    )
  }

  return <EditorLayout guideId={guideId} />
}
