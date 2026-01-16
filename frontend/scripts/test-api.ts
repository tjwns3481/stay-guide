import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const API_BASE = 'http://localhost:3000/api/guides'

async function parseSSE(response: Response): Promise<string> {
  const text = await response.text()
  let fullContent = ''

  const lines = text.split('\n')
  for (const line of lines) {
    if (line.startsWith('data:')) {
      try {
        const data = JSON.parse(line.slice(5).trim())
        if (data.chunk) {
          fullContent += data.chunk
        }
      } catch {
        // Skip invalid JSON
      }
    }
  }

  return fullContent
}

async function testChat(guideId: string, message: string) {
  console.log(`\n💬 질문: "${message}"`)

  try {
    const response = await fetch(`${API_BASE}/${guideId}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, sessionId: 'test-session' }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.log(`   ❌ 에러: ${JSON.stringify(error)}`)
      return
    }

    const content = await parseSSE(response)
    console.log(`   🤖 응답: ${content}`)
  } catch (error) {
    console.log(`   ❌ 요청 실패: ${(error as Error).message}`)
  }
}

async function main() {
  console.log('🚀 실제 채팅 API 테스트\n')

  // 가이드 조회
  const guide = await prisma.guide.findFirst({
    where: { accommodationName: '해운대 오션뷰 스테이' },
    select: { id: true, slug: true, isPublished: true },
  })

  if (!guide) {
    console.log('❌ 테스트 가이드를 찾을 수 없습니다.')
    return
  }

  console.log(`📋 테스트 가이드: ${guide.id}`)
  console.log(`   slug: ${guide.slug}`)
  console.log(`   isPublished: ${guide.isPublished}`)

  // API 상태 확인
  console.log('\n🔍 API 서버 상태 확인...')
  try {
    const statusRes = await fetch(`${API_BASE}/${guide.id}/ai/settings`)
    if (statusRes.ok) {
      const status = await statusRes.json()
      console.log(`   ✅ API 연결 성공`)
      console.log(`   AI 활성화: ${status.data?.aiEnabled}`)
    } else {
      console.log(`   ❌ API 응답 오류: ${statusRes.status}`)
      return
    }
  } catch (error) {
    console.log(`   ❌ API 서버에 연결할 수 없습니다. (http://localhost:3000)`)
    console.log(`   개발 서버를 실행해주세요: npm run dev`)
    return
  }

  console.log('\n' + '='.repeat(60))
  console.log('📝 채팅 API 테스트 시작')
  console.log('='.repeat(60))

  // 테스트 질문들
  await testChat(guide.id, '체크인 시간이 언제예요?')
  await testChat(guide.id, '와이파이 비밀번호 알려주세요')
  await testChat(guide.id, '주차 가능한가요?')
  await testChat(guide.id, '근처 맛집 추천해주세요')
  await testChat(guide.id, '가격 좀 깎아주세요')
  await testChat(guide.id, '오늘 날씨 어때요?')

  console.log('\n' + '='.repeat(60))
  console.log('✅ API 테스트 완료!')
  console.log('='.repeat(60))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
