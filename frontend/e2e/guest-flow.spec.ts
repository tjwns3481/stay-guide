import { test, expect } from '@playwright/test'
import {
  waitForPageLoad,
  waitForMSW,
  setDesktopViewport,
  setMobileViewport,
  expectToast,
  testGuide,
} from './fixtures'

/**
 * 게스트 전체 플로우 E2E 테스트
 *
 * 테스트 시나리오:
 * 1. 슬러그로 안내서 접근
 * 2. 모든 블록 렌더링 확인
 * 3. AI 채팅 버튼 표시
 * 4. 모바일 반응형 확인
 * 5. 상호작용 기능 (복사, 지도 링크)
 */

test.describe('게스트 전체 플로우', () => {
  test.beforeEach(async ({ page }) => {
    await setDesktopViewport(page)
    await waitForMSW(page)
  })

  test('슬러그로 안내서 접근', async ({ page }) => {
    await page.goto(`/g/${testGuide.slug}`)
    await waitForPageLoad(page)

    // URL 확인
    await expect(page).toHaveURL(`/g/${testGuide.slug}`)

    // 페이지 정상 렌더링 확인
    await expect(page.locator('body')).toBeVisible()
  })

  test('존재하지 않는 슬러그 접근 시 404', async ({ page }) => {
    await page.goto('/g/non-existent-guide-12345')
    await waitForPageLoad(page)

    // 404 페이지 또는 에러 메시지 확인
    await expect(
      page.locator('text=찾을 수 없습니다').or(page.locator('text=404'))
    ).toBeVisible()
  })

  test.skip('모든 블록이 순서대로 렌더링됨', async ({ page }) => {
    await page.goto(`/g/${testGuide.slug}`)
    await waitForPageLoad(page)

    // Hero 블록 확인
    const heroBlock = page.locator('[data-testid="block-hero"]')
    await expect(heroBlock).toBeVisible()
    await expect(heroBlock.locator('img')).toBeVisible()
    await expect(heroBlock.locator('[data-testid="hero-title"]')).toBeVisible()

    // QuickInfo 블록 확인
    const quickInfoBlock = page.locator('[data-testid="block-quickinfo"]')
    await expect(quickInfoBlock).toBeVisible()
    await expect(quickInfoBlock.locator('text=체크인')).toBeVisible()
    await expect(quickInfoBlock.locator('text=체크아웃')).toBeVisible()
    await expect(quickInfoBlock.locator('text=Wi-Fi')).toBeVisible()

    // Amenities 블록 확인
    const amenitiesBlock = page.locator('[data-testid="block-amenities"]')
    await expect(amenitiesBlock).toBeVisible()

    // Map 블록 확인
    const mapBlock = page.locator('[data-testid="block-map"]')
    await expect(mapBlock).toBeVisible()
    await expect(
      mapBlock.locator('[data-testid="naver-map-link"]')
    ).toBeVisible()
    await expect(
      mapBlock.locator('[data-testid="kakao-map-link"]')
    ).toBeVisible()

    // HostPick 블록 확인
    const hostPickBlock = page.locator('[data-testid="block-hostpick"]')
    await expect(hostPickBlock).toBeVisible()
    await expect(
      hostPickBlock.locator('[data-testid="pick-card"]').first()
    ).toBeVisible()

    // Notice 블록 확인
    const noticeBlock = page.locator('[data-testid="block-notice"]')
    await expect(noticeBlock).toBeVisible()
  })

  test.skip('AI 플로팅 버튼이 표시됨', async ({ page }) => {
    await page.goto(`/g/${testGuide.slug}`)
    await waitForPageLoad(page)

    // AI 채팅 버튼 확인
    const aiButton = page.locator('[data-testid="ai-floating-button"]')
    await expect(aiButton).toBeVisible()

    // 버튼에 아이콘 또는 텍스트 확인
    await expect(aiButton).toContainText('AI')
  })

  test.skip('AI 채팅 인터페이스 열기', async ({ page }) => {
    await page.goto(`/g/${testGuide.slug}`)
    await waitForPageLoad(page)

    // AI 버튼 클릭
    await page.click('[data-testid="ai-floating-button"]')

    // 채팅 인터페이스 표시 확인
    const chatInterface = page.locator('[data-testid="chat-interface"]')
    await expect(chatInterface).toBeVisible()

    // 채팅 입력창 확인
    await expect(page.locator('[data-testid="chat-input"]')).toBeVisible()

    // 채팅 전송 버튼 확인
    await expect(page.locator('[data-testid="chat-send-button"]')).toBeVisible()
  })

  test.skip('AI 채팅 메시지 전송 및 응답', async ({ page }) => {
    await page.goto(`/g/${testGuide.slug}`)
    await waitForPageLoad(page)

    // 채팅 열기
    await page.click('[data-testid="ai-floating-button"]')

    // 메시지 입력
    const testMessage = '체크인 시간이 언제인가요?'
    await page.fill('[data-testid="chat-input"]', testMessage)

    // 전송 버튼 클릭
    await page.click('[data-testid="chat-send-button"]')

    // 사용자 메시지 표시 확인
    const userMessage = page.locator('[data-testid="user-message"]').last()
    await expect(userMessage).toContainText(testMessage)

    // AI 응답 대기 및 확인 (MSW Mock 응답)
    const aiMessage = page.locator('[data-testid="ai-message"]').last()
    await expect(aiMessage).toBeVisible({ timeout: 5000 })

    // 응답에 체크인 관련 내용 포함 확인
    await expect(aiMessage).toContainText('15:00')
  })

  test.skip('Wi-Fi 비밀번호 복사 기능', async ({ page }) => {
    await page.goto(`/g/${testGuide.slug}`)
    await waitForPageLoad(page)

    // Wi-Fi 비밀번호 영역 클릭
    const wifiPassword = page.locator('[data-testid="wifi-password"]')
    await wifiPassword.click()

    // 복사 완료 토스트 확인
    await expectToast(page, '복사되었습니다')

    // 클립보드 내용 확인 (Playwright context.grantPermissions 필요)
    // const clipboardText = await page.evaluate(() => navigator.clipboard.readText())
    // expect(clipboardText).toBeTruthy()
  })

  test.skip('네이버 지도 링크 클릭', async ({ page }) => {
    await page.goto(`/g/${testGuide.slug}`)
    await waitForPageLoad(page)

    // 네이버 지도 링크 클릭 (새 탭)
    const [newPage] = await Promise.all([
      page.waitForEvent('popup'),
      page.click('[data-testid="naver-map-link"]'),
    ])

    // 네이버 지도 URL 확인
    expect(newPage.url()).toContain('map.naver.com')

    await newPage.close()
  })

  test.skip('카카오 지도 링크 클릭', async ({ page }) => {
    await page.goto(`/g/${testGuide.slug}`)
    await waitForPageLoad(page)

    // 카카오 지도 링크 클릭 (새 탭)
    const [newPage] = await Promise.all([
      page.waitForEvent('popup'),
      page.click('[data-testid="kakao-map-link"]'),
    ])

    // 카카오 지도 URL 확인
    expect(newPage.url()).toContain('map.kakao.com')

    await newPage.close()
  })

  test.skip('Host Pick 카드 클릭 시 상세 정보', async ({ page }) => {
    await page.goto(`/g/${testGuide.slug}`)
    await waitForPageLoad(page)

    // Host Pick 카드 클릭
    await page.click('[data-testid="pick-card"]')

    // 상세 정보 모달 또는 확장 표시
    await expect(page.locator('[data-testid="pick-detail"]')).toBeVisible()
  })
})

test.describe('모바일 게스트 플로우', () => {
  test.beforeEach(async ({ page }) => {
    await setMobileViewport(page)
    await waitForMSW(page)
  })

  test('모바일에서 안내서 접근', async ({ page }) => {
    await page.goto(`/g/${testGuide.slug}`)
    await waitForPageLoad(page)

    // 페이지 정상 렌더링
    await expect(page.locator('body')).toBeVisible()
  })

  test.skip('모바일에서 모든 블록 렌더링', async ({ page }) => {
    await page.goto(`/g/${testGuide.slug}`)
    await waitForPageLoad(page)

    // Hero 블록 (모바일 최적화)
    await expect(page.locator('[data-testid="block-hero"]')).toBeVisible()

    // QuickInfo 블록
    await expect(page.locator('[data-testid="block-quickinfo"]')).toBeVisible()

    // Amenities 블록
    await expect(page.locator('[data-testid="block-amenities"]')).toBeVisible()

    // Map 블록
    await expect(page.locator('[data-testid="block-map"]')).toBeVisible()

    // HostPick 블록 (스와이프 가능)
    await expect(page.locator('[data-testid="block-hostpick"]')).toBeVisible()

    // Notice 블록
    await expect(page.locator('[data-testid="block-notice"]')).toBeVisible()
  })

  test.skip('모바일에서 AI 채팅이 전체화면으로 열림', async ({ page }) => {
    await page.goto(`/g/${testGuide.slug}`)
    await waitForPageLoad(page)

    // AI 버튼 클릭
    await page.click('[data-testid="ai-floating-button"]')

    // 전체화면 채팅 인터페이스 확인
    const chatInterface = page.locator('[data-testid="chat-interface"]')
    await expect(chatInterface).toBeVisible()
    await expect(chatInterface).toHaveClass(/fullscreen/)
  })

  test.skip('모바일에서 채팅 닫기', async ({ page }) => {
    await page.goto(`/g/${testGuide.slug}`)
    await waitForPageLoad(page)

    // 채팅 열기
    await page.click('[data-testid="ai-floating-button"]')
    await expect(page.locator('[data-testid="chat-interface"]')).toBeVisible()

    // 닫기 버튼 클릭
    await page.click('[data-testid="chat-close-button"]')

    // 채팅 인터페이스 닫힘
    await expect(
      page.locator('[data-testid="chat-interface"]')
    ).not.toBeVisible()
  })

  test.skip('모바일에서 Host Pick 스와이프', async ({ page }) => {
    await page.goto(`/g/${testGuide.slug}`)
    await waitForPageLoad(page)

    const hostPickBlock = page.locator('[data-testid="block-hostpick"]')
    await expect(hostPickBlock).toBeVisible()

    // 첫 번째 카드
    const firstCard = hostPickBlock.locator('[data-testid="pick-card"]').first()
    await expect(firstCard).toBeVisible()

    // 스와이프 시뮬레이션 (터치 이벤트)
    const boundingBox = await firstCard.boundingBox()
    if (boundingBox) {
      await page.touchscreen.tap(boundingBox.x + 50, boundingBox.y + 50)
      await page.touchscreen.swipe(
        boundingBox.x + boundingBox.width - 50,
        boundingBox.y + 50,
        boundingBox.x + 50,
        boundingBox.y + 50
      )
    }

    // 다음 카드가 보임
    // 카드 인덱스 변경 또는 다음 카드 표시 확인
  })
})

test.describe('게스트 플로우 성능', () => {
  test('페이지 로딩 시간이 3초 이내', async ({ page }) => {
    await waitForMSW(page)

    const startTime = Date.now()

    await page.goto(`/g/${testGuide.slug}`)
    await waitForPageLoad(page)

    const loadTime = Date.now() - startTime

    expect(loadTime).toBeLessThan(3000)
  })

  test.skip('이미지 레이지 로딩 확인', async ({ page }) => {
    await page.goto(`/g/${testGuide.slug}`)
    await waitForPageLoad(page)

    // 이미지 loading="lazy" 속성 확인
    const images = page.locator('img')
    const count = await images.count()

    for (let i = 0; i < count; i++) {
      const image = images.nth(i)
      const loading = await image.getAttribute('loading')
      // Hero 이미지 제외, 나머지는 lazy
      if (i > 0) {
        expect(loading).toBe('lazy')
      }
    }
  })
})

test.describe('게스트 플로우 접근성', () => {
  test.skip('주요 요소에 ARIA 속성', async ({ page }) => {
    await page.goto(`/g/${testGuide.slug}`)
    await waitForPageLoad(page)

    // 메인 콘텐츠 영역
    const main = page.locator('main')
    await expect(main).toHaveAttribute('role', 'main')

    // AI 버튼
    const aiButton = page.locator('[data-testid="ai-floating-button"]')
    await expect(aiButton).toHaveAttribute('aria-label')
  })

  test.skip('키보드 네비게이션', async ({ page }) => {
    await page.goto(`/g/${testGuide.slug}`)
    await waitForPageLoad(page)

    // Tab 키로 포커스 이동
    await page.keyboard.press('Tab')

    // 포커스된 요소 확인
    const focusedElement = await page.evaluate(
      () => document.activeElement?.tagName.toLowerCase()
    )

    expect(['a', 'button', 'input']).toContain(focusedElement)
  })

  test.skip('스크린 리더 지원: 이미지 alt 텍스트', async ({ page }) => {
    await page.goto(`/g/${testGuide.slug}`)
    await waitForPageLoad(page)

    // 모든 이미지에 alt 속성 확인
    const images = page.locator('img')
    const count = await images.count()

    for (let i = 0; i < count; i++) {
      const image = images.nth(i)
      const alt = await image.getAttribute('alt')
      expect(alt).toBeTruthy()
    }
  })
})

test.describe('워터마크 (무료/유료)', () => {
  test.skip('무료 안내서에 워터마크 표시', async ({ page }) => {
    await page.goto(`/g/${testGuide.slug}`)
    await waitForPageLoad(page)

    // 워터마크 확인
    const watermark = page.locator('[data-testid="watermark"]')
    await expect(watermark).toBeVisible()
    await expect(watermark).toContainText('Powered by Roomy')
  })

  test.skip('유료 안내서에 워터마크 없음', async ({ page }) => {
    // TODO: 유료 안내서 슬러그로 테스트
    const premiumSlug = 'premium-guide-slug'
    await page.goto(`/g/${premiumSlug}`)
    await waitForPageLoad(page)

    // 워터마크가 표시되지 않음
    const watermark = page.locator('[data-testid="watermark"]')
    await expect(watermark).not.toBeVisible()
  })
})

test.describe('에러 처리', () => {
  test.skip('네트워크 에러 시 에러 메시지 표시', async ({ page }) => {
    // API 요청 차단
    await page.route('**/api/guides/**', (route) => route.abort())

    await page.goto(`/g/${testGuide.slug}`)

    // 에러 메시지 확인
    await expect(
      page.locator('text=불러오기 실패').or(page.locator('text=에러'))
    ).toBeVisible()
  })

  test.skip('AI 채팅 에러 시 재시도 가능', async ({ page }) => {
    await page.goto(`/g/${testGuide.slug}`)
    await waitForPageLoad(page)

    // 채팅 열기
    await page.click('[data-testid="ai-floating-button"]')

    // AI API 에러 시뮬레이션
    await page.route('**/api/chat/**', (route) =>
      route.fulfill({ status: 500 })
    )

    // 메시지 전송
    await page.fill('[data-testid="chat-input"]', '테스트 메시지')
    await page.click('[data-testid="chat-send-button"]')

    // 에러 메시지 표시
    await expect(page.locator('[data-testid="chat-error"]')).toBeVisible()

    // 재시도 버튼 확인
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible()
  })
})
