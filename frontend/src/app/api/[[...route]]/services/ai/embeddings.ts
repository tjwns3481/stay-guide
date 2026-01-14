import OpenAI from 'openai'
import { prisma } from '@/lib/server/prisma'

let openai: OpenAI | null = null

function getOpenAI() {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }
  return openai
}

// 텍스트 임베딩 생성
export async function generateEmbedding(text: string): Promise<number[]> {
  const client = getOpenAI()
  const response = await client.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  })
  return response.data[0].embedding
}

// 블록 콘텐츠를 텍스트로 변환
export function blockToText(type: string, content: Record<string, unknown>): string {
  // 각 블록 타입별로 텍스트 추출
  switch (type) {
    case 'hero':
      return `${content.title || ''} ${content.subtitle || ''}`
    case 'quick_info':
      return `체크인: ${content.checkIn || ''}, 체크아웃: ${content.checkOut || ''}, 최대인원: ${content.maxGuests || ''}명, 주차: ${content.parking || ''}, 주소: ${content.address || ''}`
    case 'amenities':
      // wifi, items 정보
      const wifi = content.wifi as { ssid?: string; password?: string } | null
      const items = (content.items as { label: string }[]) || []
      return `와이파이: ${wifi?.ssid || ''}, 편의시설: ${items.map(i => i.label).join(', ')}`
    case 'map':
      return `위치: ${content.address || ''}`
    case 'host_pick':
      const picks = (content.items as { name: string; description?: string }[]) || []
      return `호스트 추천: ${picks.map(p => `${p.name}${p.description ? ` - ${p.description}` : ''}`).join(', ')}`
    case 'notice':
      return `공지: ${content.title || ''} - ${content.content || ''}`
    default:
      return ''
  }
}

// 가이드 블록 임베딩 생성 및 저장
export async function embedGuideBlocks(guideId: string): Promise<number> {
  // 1. 기존 임베딩 삭제
  await prisma.$executeRaw`DELETE FROM guide_embeddings WHERE guide_id = ${guideId}`

  // 2. 가이드의 모든 블록 조회
  const guide = await prisma.guide.findUnique({
    where: { id: guideId },
    include: { blocks: { where: { isVisible: true }, orderBy: { order: 'asc' } } },
  })

  if (!guide) throw new Error('Guide not found')

  // 3. 각 블록의 텍스트 임베딩 생성 및 저장
  let count = 0
  for (const block of guide.blocks) {
    const text = blockToText(block.type, block.content as Record<string, unknown>)
    if (!text.trim()) continue

    const embedding = await generateEmbedding(text)

    // pgvector에 저장 (raw SQL 필요)
    await prisma.$executeRaw`
      INSERT INTO guide_embeddings (id, guide_id, block_id, content, embedding, created_at)
      VALUES (${`emb_${Date.now()}_${count}`}, ${guideId}, ${block.id}, ${text}, ${embedding}::vector, NOW())
    `
    count++
  }

  return count
}
