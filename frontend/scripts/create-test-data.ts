import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 테스트 데이터 생성 시작\n')

  // 사용자 확인
  let user = await prisma.user.findFirst()
  if (!user) {
    user = await prisma.user.create({
      data: {
        clerkId: 'test_clerk_id',
        email: 'test@example.com',
        name: '테스트 호스트',
      },
    })
    console.log('✅ 테스트 사용자 생성:', user.id)
  } else {
    console.log('✅ 기존 사용자 사용:', user.id)
  }

  // 기존 테스트 가이드 삭제
  const deleted = await prisma.guide.deleteMany({
    where: { slug: { startsWith: 'test-oceanview' } }
  })
  console.log(`🗑️ 기존 테스트 가이드 삭제: ${deleted.count}개`)

  // 새 테스트 가이드 생성
  const guide = await prisma.guide.create({
    data: {
      userId: user.id,
      slug: `test-oceanview-${Date.now()}`,
      title: '해운대 오션뷰 스테이',
      accommodationName: '해운대 오션뷰 스테이',
      isPublished: true,
      aiEnabled: true,
      aiInstructions: `1. 가격 협상에 대해서는 "가격 협상은 어렵습니다. 호스트에게 직접 문의해주세요."라고 답변하세요.
2. 체크인/체크아웃 시간 변경 요청은 "시간 변경은 호스트와 직접 협의가 필요합니다."라고 안내하세요.
3. 한국어로만 답변하세요.
4. 주변 맛집이나 관광지는 호스트 추천 정보에 있는 내용만 안내하세요.
5. 숙소와 관련 없는 질문에는 "죄송합니다. 숙소 관련 질문에만 답변드릴 수 있습니다."라고 답변하세요.`,
      blocks: {
        create: [
          {
            type: 'hero',
            order: 0,
            content: {
              title: '해운대 오션뷰 스테이',
              subtitle: '해운대 바다가 한눈에 보이는 프리미엄 숙소입니다. 일출과 야경을 모두 감상할 수 있습니다.',
            },
          },
          {
            type: 'quick_info',
            order: 1,
            content: {
              checkIn: '15:00',
              checkOut: '11:00',
              maxGuests: 4,
              parking: '무료 지하 주차장 이용 가능 (1대)',
              address: '부산광역시 해운대구 해운대해변로 123, 오션타워 15층',
            },
          },
          {
            type: 'amenities',
            order: 2,
            content: {
              wifi: { ssid: 'OceanView_5G', password: 'ocean1234!' },
              items: [
                { label: '65인치 스마트TV' },
                { label: '에어컨' },
                { label: '냉장고' },
                { label: '드럼세탁기' },
                { label: '전자레인지' },
                { label: '네스프레소 커피머신' },
              ],
            },
          },
          {
            type: 'host_pick',
            order: 3,
            content: {
              items: [
                { name: '해운대 시장', description: '도보 5분, 신선한 회와 해산물 맛집' },
                { name: '더베이101', description: '차량 10분, 부산 최고의 야경 명소' },
                { name: '해리단길', description: '도보 15분, 힙한 카페와 레스토랑 거리' },
                { name: '동백섬 APEC 하우스', description: '도보 20분, 해안 산책로와 전망대' },
              ],
            },
          },
          {
            type: 'notice',
            order: 4,
            content: {
              title: '숙소 이용 안내',
              content: '조용한 주거 환경입니다. 밤 10시 이후에는 소음에 주의해 주세요. 흡연은 베란다에서만 가능합니다. 반려동물은 소형견(5kg 미만)만 가능합니다.',
            },
          },
        ],
      },
    },
    include: { blocks: true },
  })

  console.log('\n✅ 테스트 가이드 생성 완료!')
  console.log(`   ID: ${guide.id}`)
  console.log(`   이름: ${guide.accommodationName}`)
  console.log(`   블록 수: ${guide.blocks.length}개`)
  console.log(`   AI 지침: 설정됨`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
