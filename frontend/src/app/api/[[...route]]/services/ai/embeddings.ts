import OpenAI from 'openai'
import { prisma } from '@/lib/server/prisma'
import { getAIProvider, generateOllamaEmbedding } from './ollama'

let openai: OpenAI | null = null

function getOpenAI() {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }
  return openai
}

// OpenAI 텍스트 임베딩 생성
async function generateOpenAIEmbedding(text: string): Promise<number[]> {
  const client = getOpenAI()
  const response = await client.embeddings.create({
    model: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small',
    input: text,
  })
  return response.data[0].embedding
}

// 텍스트 임베딩 생성 (Provider 선택)
export async function generateEmbedding(text: string): Promise<number[]> {
  const provider = getAIProvider()
  console.log(`[Embedding] Provider: ${provider}, AI_PROVIDER env: ${process.env.AI_PROVIDER}`)

  if (provider === 'ollama') {
    const embedding = await generateOllamaEmbedding(text)
    console.log(`[Embedding] Ollama embedding dimension: ${embedding.length}`)
    return embedding
  } else {
    const embedding = await generateOpenAIEmbedding(text)
    console.log(`[Embedding] OpenAI embedding dimension: ${embedding.length}`)
    return embedding
  }
}

// 블록 타입별 키워드 힌트 (검색 정확도 향상)
const BLOCK_TYPE_HINTS: Record<string, string[]> = {
  hero: ['숙소 소개', '숙소 이름', '숙소명'],
  quick_info: ['체크인', '체크아웃', '입실', '퇴실', '시간', '인원', '최대인원', '주차', '주차장', '주소', '위치', '찾아오는 길'],
  amenities: ['와이파이', 'wifi', '비밀번호', '패스워드', '인터넷', '편의시설', '시설', 'TV', '에어컨', '냉장고', '세탁기'],
  map: ['위치', '주소', '찾아오는 길', '지도', '길찾기'],
  host_pick: ['맛집', '추천', '주변', '관광', '카페', '식당', '명소', '볼거리'],
  notice: ['공지', '안내', '주의사항', '규칙', '흡연', '반려동물', '소음', '이용안내'],
}

// 블록 콘텐츠를 텍스트로 변환 (키워드 힌트 포함)
export function blockToText(type: string, content: Record<string, unknown>): string {
  const hints = BLOCK_TYPE_HINTS[type] || []
  const hintPrefix = hints.length > 0 ? `[${hints.join(', ')}] ` : ''

  switch (type) {
    case 'hero':
      return `${hintPrefix}숙소 소개: ${content.title || ''} - ${content.subtitle || ''}`

    case 'quick_info':
      const parts = []
      if (content.checkIn) parts.push(`체크인 시간: ${content.checkIn}`)
      if (content.checkOut) parts.push(`체크아웃 시간: ${content.checkOut}`)
      if (content.maxGuests) parts.push(`최대 인원: ${content.maxGuests}명`)
      if (content.parking) parts.push(`주차: ${content.parking}`)
      if (content.address) parts.push(`주소: ${content.address}`)
      return `${hintPrefix}${parts.join('. ')}`

    case 'amenities':
      const wifi = content.wifi as { ssid?: string; password?: string } | null
      const items = (content.items as { label: string }[]) || []
      const amenityParts = []
      if (wifi?.ssid) amenityParts.push(`와이파이 SSID: ${wifi.ssid}`)
      if (wifi?.password) amenityParts.push(`와이파이 비밀번호: ${wifi.password}`)
      if (items.length > 0) amenityParts.push(`편의시설: ${items.map(i => i.label).join(', ')}`)
      return `${hintPrefix}${amenityParts.join('. ')}`

    case 'map':
      return `${hintPrefix}위치 및 찾아오는 길: ${content.address || ''}`

    case 'host_pick':
      const picks = (content.items as { name: string; description?: string }[]) || []
      const pickTexts = picks.map(p => `${p.name}${p.description ? ` (${p.description})` : ''}`)
      return `${hintPrefix}주변 맛집 및 추천 장소: ${pickTexts.join(', ')}`

    case 'notice':
      return `${hintPrefix}숙소 이용 안내 및 주의사항 - ${content.title || ''}: ${content.content || ''}`

    default:
      return ''
  }
}

// 임베딩 차원 수 반환 (Provider별로 다름)
export function getEmbeddingDimension(): number {
  const provider = getAIProvider()
  if (provider === 'ollama') {
    // nomic-embed-text: 768, bge-m3: 1024
    const model = process.env.OLLAMA_EMBEDDING_MODEL || 'nomic-embed-text'
    if (model.includes('bge')) return 1024
    return 768
  } else {
    // text-embedding-3-small: 1536, text-embedding-3-large: 3072
    const model = process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small'
    if (model.includes('large')) return 3072
    return 1536
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

    try {
      const embedding = await generateEmbedding(text)

      // pgvector에 저장 (raw SQL 필요)
      await prisma.$executeRaw`
        INSERT INTO guide_embeddings (id, guide_id, block_id, content, embedding, created_at)
        VALUES (${`emb_${Date.now()}_${count}`}, ${guideId}, ${block.id}, ${text}, ${embedding}::vector, NOW())
      `
      count++
    } catch (error) {
      console.error(`[Embedding Error] Block ${block.id}:`, error)
      // 개별 블록 실패 시 계속 진행
    }
  }

  return count
}

// 가이드 전체 콘텐츠 텍스트로 변환 (임베딩용)
export async function getGuideContentText(guideId: string): Promise<string> {
  const guide = await prisma.guide.findUnique({
    where: { id: guideId },
    include: { blocks: { where: { isVisible: true }, orderBy: { order: 'asc' } } },
  })

  if (!guide) throw new Error('Guide not found')

  const texts: string[] = [
    `숙소명: ${guide.accommodationName}`,
    `안내서 제목: ${guide.title}`,
  ]

  for (const block of guide.blocks) {
    const text = blockToText(block.type, block.content as Record<string, unknown>)
    if (text.trim()) {
      texts.push(text)
    }
  }

  return texts.join('\n')
}
