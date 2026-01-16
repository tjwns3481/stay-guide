import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('=== 저장된 임베딩 확인 ===\n')

  const embeddings = await prisma.$queryRaw<{ id: string; content: string }[]>`
    SELECT id, content FROM guide_embeddings ORDER BY created_at DESC LIMIT 10
  `

  if (embeddings.length === 0) {
    console.log('❌ 임베딩이 없습니다!')
    return
  }

  embeddings.forEach((e, i) => {
    console.log(`${i + 1}. ${e.content.slice(0, 100)}...`)
    console.log()
  })

  // 키워드 검색 테스트
  console.log('=== 키워드 포함 확인 ===\n')
  const keywords = ['체크인', '와이파이', '비밀번호', '주차', '맛집']

  for (const kw of keywords) {
    const found = embeddings.filter(e => e.content.toLowerCase().includes(kw))
    console.log(`"${kw}": ${found.length > 0 ? '✅ 발견' : '❌ 없음'}`)
    if (found.length > 0) {
      console.log(`   → ${found[0].content.slice(0, 60)}...`)
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
