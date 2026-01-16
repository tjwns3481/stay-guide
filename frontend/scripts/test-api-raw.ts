import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const API_BASE = 'http://localhost:3000/api/guides'

async function testChatRaw(guideId: string, message: string) {
  console.log(`\n💬 질문: "${message}"`)
  console.log('─'.repeat(50))

  try {
    const response = await fetch(`${API_BASE}/${guideId}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, sessionId: 'test-session-raw' }),
    })

    console.log(`   Status: ${response.status}`)
    console.log(`   Content-Type: ${response.headers.get('content-type')}`)

    const text = await response.text()
    console.log(`   Raw Response (first 1000 chars):`)
    console.log(text.slice(0, 1000))
    console.log('─'.repeat(50))
  } catch (error) {
    console.log(`   ❌ 요청 실패: ${(error as Error).message}`)
  }
}

async function main() {
  console.log('🚀 채팅 API Raw 응답 테스트\n')

  const guide = await prisma.guide.findFirst({
    where: { accommodationName: '해운대 오션뷰 스테이' },
    select: { id: true },
  })

  if (!guide) {
    console.log('❌ 테스트 가이드를 찾을 수 없습니다.')
    return
  }

  console.log(`📋 가이드 ID: ${guide.id}`)

  await testChatRaw(guide.id, '체크인 시간이 언제예요?')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
