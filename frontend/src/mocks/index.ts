export async function initMocks() {
  if (typeof window === 'undefined') {
    // Server-side: MSW는 브라우저에서만 동작
    return
  }

  if (process.env.NODE_ENV !== 'development') {
    // Production에서는 MSW 비활성화
    return
  }

  if (process.env.NEXT_PUBLIC_API_MOCKING !== 'enabled') {
    // NEXT_PUBLIC_API_MOCKING=enabled 환경변수가 없으면 비활성화
    return
  }

  const { worker } = await import('./browser')

  await worker.start({
    onUnhandledRequest: 'bypass', // 처리되지 않은 요청은 그대로 통과
    serviceWorker: {
      url: '/mockServiceWorker.js',
    },
  })

  console.log('[MSW] Mock Service Worker started')
}
