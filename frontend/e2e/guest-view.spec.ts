import { test, expect } from '@playwright/test'
import {
  waitForPageLoad,
  setMobileViewport,
  setDesktopViewport,
  testGuide,
} from './fixtures'

/**
 * 게스트 안내서 뷰 E2E 테스트
 *
 * 테스트 시나리오:
 * 1. 안내서 페이지 접근 및 렌더링
 * 2. 각 블록 타입별 렌더링
 * 3. 상호작용 기능 (복사, 링크 등)
 * 4. AI 컨시어지 채팅
 * 5. 반응형 레이아웃
 */

test.describe('안내서 페이지 접근', () => {
  test('슬러그로 안내서 페이지 접근 가능', async ({ page }) => {
    await page.goto(`/g/${testGuide.slug}`)
    await waitForPageLoad(page)

    // 페이지가 정상적으로 로드됨
    await expect(page).toHaveURL(`/g/${testGuide.slug}`)
  })

  test('존재하지 않는 슬러그 접근 시 404 페이지 표시', async ({ page }) => {
    await page.goto('/g/non-existent-guide-slug')
    await waitForPageLoad(page)

    // 404 페이지 또는 에러 메시지
    await expect(
      page.locator('text=찾을 수 없습니다').or(page.locator('text=404'))
    ).toBeVisible()
  })

  test('비공개 안내서 접근 시 에러 메시지 표시', async ({ page }) => {
    // TODO: 비공개 안내서 슬러그로 테스트
    // await page.goto('/g/private-guide-slug')
    // await expect(page.locator('text=비공개')).toBeVisible()
  })

  test('모바일에서 안내서 페이지가 반응형으로 표시됨', async ({ page }) => {
    await setMobileViewport(page)
    await page.goto(`/g/${testGuide.slug}`)
    await waitForPageLoad(page)

    // 모바일 레이아웃 확인
    await expect(page.locator('body')).toBeVisible()
  })
})

test.describe('블록 렌더링', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/g/${testGuide.slug}`)
    await waitForPageLoad(page)
  })

  test.skip('Hero 블록이 정상적으로 렌더링됨', async ({ page }) => {
    const heroBlock = page.locator('[data-testid="block-hero"]')
    await expect(heroBlock).toBeVisible()

    // 숙소 이미지 확인
    await expect(heroBlock.locator('img')).toBeVisible()

    // 숙소명 확인
    await expect(heroBlock.locator('[data-testid="hero-title"]')).toBeVisible()
  })

  test.skip('QuickInfo 블록이 정상적으로 렌더링됨', async ({ page }) => {
    const quickInfoBlock = page.locator('[data-testid="block-quickinfo"]')
    await expect(quickInfoBlock).toBeVisible()

    // 체크인/체크아웃 시간 확인
    await expect(quickInfoBlock.locator('text=체크인')).toBeVisible()
    await expect(quickInfoBlock.locator('text=체크아웃')).toBeVisible()
  })

  test.skip('Amenities 블록이 정상적으로 렌더링됨', async ({ page }) => {
    const amenitiesBlock = page.locator('[data-testid="block-amenities"]')
    await expect(amenitiesBlock).toBeVisible()

    // Wi-Fi 정보 확인
    await expect(amenitiesBlock.locator('text=Wi-Fi')).toBeVisible()
  })

  test.skip('Map 블록이 정상적으로 렌더링됨', async ({ page }) => {
    const mapBlock = page.locator('[data-testid="block-map"]')
    await expect(mapBlock).toBeVisible()

    // 지도 링크 버튼 확인
    await expect(mapBlock.locator('[data-testid="naver-map-link"]')).toBeVisible()
    await expect(mapBlock.locator('[data-testid="kakao-map-link"]')).toBeVisible()
  })

  test.skip('HostPick 블록이 정상적으로 렌더링됨', async ({ page }) => {
    const hostPickBlock = page.locator('[data-testid="block-hostpick"]')
    await expect(hostPickBlock).toBeVisible()

    // 추천 장소 카드 확인
    await expect(
      hostPickBlock.locator('[data-testid="pick-card"]').first()
    ).toBeVisible()
  })

  test.skip('Notice 블록이 정상적으로 렌더링됨', async ({ page }) => {
    const noticeBlock = page.locator('[data-testid="block-notice"]')
    await expect(noticeBlock).toBeVisible()
  })
})

test.describe('상호작용 기능', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/g/${testGuide.slug}`)
    await waitForPageLoad(page)
  })

  test.skip('Wi-Fi 비밀번호 클릭 시 클립보드에 복사됨', async ({ page }) => {
    const wifiPassword = page.locator('[data-testid="wifi-password"]')
    await wifiPassword.click()

    // 복사 완료 피드백 (토스트 또는 텍스트 변경)
    await expect(page.locator('[role="alert"]')).toContainText('복사되었습니다')
  })

  test.skip('네이버 지도 링크 클릭 시 새 탭에서 열림', async ({ page }) => {
    const [newPage] = await Promise.all([
      page.waitForEvent('popup'),
      page.click('[data-testid="naver-map-link"]'),
    ])

    // 네이버 지도 URL 확인
    expect(newPage.url()).toContain('map.naver.com')
  })

  test.skip('카카오 지도 링크 클릭 시 새 탭에서 열림', async ({ page }) => {
    const [newPage] = await Promise.all([
      page.waitForEvent('popup'),
      page.click('[data-testid="kakao-map-link"]'),
    ])

    // 카카오 지도 URL 확인
    expect(newPage.url()).toContain('map.kakao.com')
  })

  test.skip('Host Pick 카드 클릭 시 상세 정보 표시', async ({ page }) => {
    await page.click('[data-testid="pick-card"]')

    // 상세 정보 모달 또는 확장
    await expect(page.locator('[data-testid="pick-detail"]')).toBeVisible()
  })
})

test.describe('AI 컨시어지', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/g/${testGuide.slug}`)
    await waitForPageLoad(page)
  })

  test.skip('AI 플로팅 버튼이 표시됨', async ({ page }) => {
    await expect(
      page.locator('[data-testid="ai-floating-button"]')
    ).toBeVisible()
  })

  test.skip('AI 버튼 클릭 시 채팅 인터페이스 열림', async ({ page }) => {
    await page.click('[data-testid="ai-floating-button"]')

    await expect(page.locator('[data-testid="chat-interface"]')).toBeVisible()
  })

  test.skip('채팅 메시지 전송 및 응답 수신', async ({ page }) => {
    await page.click('[data-testid="ai-floating-button"]')

    // 메시지 입력 및 전송
    await page.fill('[data-testid="chat-input"]', '체크인 시간이 어떻게 되나요?')
    await page.click('[data-testid="chat-send-button"]')

    // 사용자 메시지 표시
    await expect(
      page.locator('[data-testid="user-message"]').last()
    ).toContainText('체크인')

    // AI 응답 대기 및 확인
    await expect(
      page.locator('[data-testid="ai-message"]').last()
    ).toBeVisible()
  })

  test.skip('모바일에서 채팅이 전체화면으로 열림', async ({ page }) => {
    await setMobileViewport(page)
    await page.goto(`/g/${testGuide.slug}`)
    await waitForPageLoad(page)

    await page.click('[data-testid="ai-floating-button"]')

    // 전체화면 채팅 확인
    await expect(page.locator('[data-testid="chat-interface"]')).toHaveClass(
      /fullscreen/
    )
  })

  test.skip('채팅 닫기 버튼 클릭 시 인터페이스 닫힘', async ({ page }) => {
    await page.click('[data-testid="ai-floating-button"]')
    await page.click('[data-testid="chat-close-button"]')

    await expect(
      page.locator('[data-testid="chat-interface"]')
    ).not.toBeVisible()
  })

  test.skip('참조 블록 하이라이트', async ({ page }) => {
    await page.click('[data-testid="ai-floating-button"]')

    // 체크인 관련 질문
    await page.fill('[data-testid="chat-input"]', '체크인')
    await page.click('[data-testid="chat-send-button"]')

    // AI 응답 대기
    await page.waitForSelector('[data-testid="ai-message"]')

    // 참조 블록 링크 클릭
    await page.click('[data-testid="reference-block-link"]')

    // 해당 블록으로 스크롤 및 하이라이트
    await expect(page.locator('[data-testid="block-quickinfo"]')).toHaveClass(
      /highlighted/
    )
  })
})

test.describe('테마 적용', () => {
  test.skip('프리셋 테마가 적용되어 표시됨', async ({ page }) => {
    await page.goto(`/g/${testGuide.slug}`)
    await waitForPageLoad(page)

    // CSS 변수 또는 클래스로 테마 확인
    // await expect(page.locator('body')).toHaveCSS('--primary-color', ...)
  })

  test.skip('커스텀 컬러가 적용되어 표시됨', async ({ page }) => {
    await page.goto(`/g/${testGuide.slug}`)
    await waitForPageLoad(page)

    // 커스텀 컬러 확인
  })
})

test.describe('성능 및 접근성', () => {
  test('페이지 로딩 시간이 3초 이내', async ({ page }) => {
    const startTime = Date.now()

    await page.goto(`/g/${testGuide.slug}`)
    await waitForPageLoad(page)

    const loadTime = Date.now() - startTime

    expect(loadTime).toBeLessThan(3000)
  })

  test.skip('주요 요소에 적절한 ARIA 속성이 있음', async ({ page }) => {
    await page.goto(`/g/${testGuide.slug}`)
    await waitForPageLoad(page)

    // 메인 콘텐츠 영역
    await expect(page.locator('main')).toHaveAttribute('role', 'main')

    // 네비게이션
    await expect(page.locator('nav')).toHaveAttribute('role', 'navigation')
  })

  test.skip('키보드 네비게이션이 작동함', async ({ page }) => {
    await page.goto(`/g/${testGuide.slug}`)
    await waitForPageLoad(page)

    // Tab 키로 포커스 이동
    await page.keyboard.press('Tab')

    // 포커스된 요소 확인
    const focusedElement = await page.evaluate(() =>
      document.activeElement?.tagName.toLowerCase()
    )

    expect(['a', 'button', 'input']).toContain(focusedElement)
  })
})

test.describe('워터마크 (무료 버전)', () => {
  test.skip('무료 안내서에 워터마크가 표시됨', async ({ page }) => {
    await page.goto(`/g/${testGuide.slug}`)
    await waitForPageLoad(page)

    // 워터마크 확인
    await expect(page.locator('[data-testid="watermark"]')).toBeVisible()
  })

  test.skip('유료 안내서에 워터마크가 표시되지 않음', async ({ page }) => {
    // TODO: 유료 안내서 슬러그로 테스트
    // await page.goto('/g/premium-guide-slug')
    // await expect(page.locator('[data-testid="watermark"]')).not.toBeVisible()
  })
})
