import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-display-lg font-bold text-text-primary">
            숙소 안내,{' '}
            <span className="text-primary-500">더 쉽고 예쁘게</span>
          </h1>
          <p className="mt-6 text-body-lg text-text-secondary">
            반복되는 체크인 안내, 와이파이 비밀번호 문의에서 벗어나세요.
            <br />
            게스트는 URL 하나로 모든 정보를, 호스트는 시간을 되찾습니다.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center rounded-lg bg-primary-500 px-8 py-3 text-body-md font-semibold text-white shadow-soft transition-colors hover:bg-primary-600"
            >
              무료로 시작하기
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center justify-center rounded-lg border border-neutral-200 bg-white px-8 py-3 text-body-md font-semibold text-text-primary shadow-soft transition-colors hover:bg-neutral-50"
            >
              데모 보기
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-display-sm font-bold text-text-primary">
            왜 Roomy인가요?
          </h2>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-neutral-100 bg-surface p-6 shadow-soft"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-50 text-primary-500">
                  {feature.icon}
                </div>
                <h3 className="mt-4 text-heading-md font-semibold text-text-primary">
                  {feature.title}
                </h3>
                <p className="mt-2 text-body-sm text-text-secondary">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-500 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-display-sm font-bold text-white">
            지금 바로 시작하세요
          </h2>
          <p className="mt-4 text-body-lg text-primary-100">
            무료 플랜으로 안내서를 만들고, 게스트에게 공유해보세요.
          </p>
          <Link
            href="/sign-up"
            className="mt-8 inline-flex items-center justify-center rounded-lg bg-white px-8 py-3 text-body-md font-semibold text-primary-500 shadow-soft transition-colors hover:bg-neutral-50"
          >
            무료로 시작하기
          </Link>
        </div>
      </section>
    </main>
  )
}

const features = [
  {
    title: '블록형 에디터',
    description: '드래그 앤 드롭으로 쉽게 안내서를 구성하세요. 코딩 지식 없이도 예쁜 안내서를 만들 수 있어요.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
      </svg>
    ),
  },
  {
    title: '모바일 최적화',
    description: 'PC에서 만들고, 모바일에서도 편집 가능. 게스트는 어디서든 편하게 안내서를 확인해요.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: 'AI 컨시어지',
    description: '게스트가 궁금한 건 AI에게 물어보세요. 안내서 내용을 바탕으로 친절하게 답변해드려요.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    ),
  },
  {
    title: '감성 테마',
    description: '숙소 분위기에 맞는 테마를 선택하세요. 커스텀 컬러와 폰트로 브랜드를 표현해요.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
    ),
  },
  {
    title: '원클릭 복사',
    description: 'Wi-Fi 비밀번호, 주소 등을 탭 한 번으로 복사. 게스트 편의를 최우선으로 생각해요.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
      </svg>
    ),
  },
  {
    title: '통계 대시보드',
    description: '안내서 조회수, 인기 블록, 자주 묻는 질문을 확인하세요. 데이터로 게스트를 이해해요.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
]
