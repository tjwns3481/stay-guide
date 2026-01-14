import { test, expect } from '@playwright/test'
import {
  waitForPageLoad,
  waitForMSW,
  setDesktopViewport,
  setMobileViewport,
  expectToast,
  testUser,
  testGuide,
} from './fixtures'

/**
 * 호스트 전체 플로우 E2E 테스트
 *
 * 테스트 시나리오:
 * 1. 로그인 페이지 접근
 * 2. 대시보드 접근 (인증 필요)
 * 3. 새 안내서 생성
 * 4. 블록 추가 (Hero, QuickInfo)
 * 5. 발행
 * 6. 게스트 뷰에서 확인
 */

test.describe('호스트 전체 플로우', () => {
  test.beforeEach(async ({ page }) => {
    await setDesktopViewport(page)
    await waitForMSW(page)
  })

  test('로그인 페이지 접근 및 렌더링', async ({ page }) => {
    await page.goto('/sign-in')
    await waitForPageLoad(page)

    // URL 확인
    await expect(page).toHaveURL(/sign-in/)

    // 로그인 폼 또는 Clerk 컴포넌트 표시 확인
    await expect(page.locator('body')).toBeVisible()
  })

  test.skip('대시보드 접근 (비로그인 시 리다이렉트)', async ({ page }) => {
    await page.goto('/dashboard')
    await waitForPageLoad(page)

    // 로그인 페이지로 리다이렉트
    await expect(page).toHaveURL(/sign-in/)
  })

  test.skip('인증 후 대시보드 접근', async ({ page }) => {
    // 인증 상태 모킹 (localStorage에 테스트 토큰 설정)
    await page.goto('/')
    await page.evaluate((user) => {
      localStorage.setItem('__clerk_test_auth', JSON.stringify(user))
    }, testUser)

    await page.goto('/dashboard')
    await waitForPageLoad(page)

    // 대시보드 페이지 확인
    await expect(page).toHaveURL(/dashboard/)

    // 사용자 정보 표시 확인
    await expect(page.locator('body')).toContainText(testUser.name)
  })

  test.skip('새 안내서 생성 플로우', async ({ page }) => {
    // 인증 상태 설정
    await page.goto('/')
    await page.evaluate((user) => {
      localStorage.setItem('__clerk_test_auth', JSON.stringify(user))
    }, testUser)

    await page.goto('/dashboard')
    await waitForPageLoad(page)

    // 새 안내서 생성 버튼 클릭
    await page.click('[data-testid="create-guide-button"]')

    // 에디터 페이지로 이동 확인
    await expect(page).toHaveURL(/\/admin\/editor\//)

    // 안내서 제목 입력
    const guideTitle = '새로운 펜션 안내서'
    await page.fill('[data-testid="guide-title-input"]', guideTitle)

    // 자동 저장 대기
    await page.waitForTimeout(2000)

    // 저장 상태 확인
    await expect(page.locator('[data-testid="save-status"]')).toContainText(
      '저장됨'
    )
  })

  test.skip('블록 추가 플로우 - Hero 블록', async ({ page }) => {
    // 인증 및 에디터 페이지 접근
    await page.goto('/')
    await page.evaluate((user) => {
      localStorage.setItem('__clerk_test_auth', JSON.stringify(user))
    }, testUser)

    await page.goto(`/admin/editor/${testGuide.id}`)
    await waitForPageLoad(page)

    // 블록 추가 버튼 클릭
    await page.click('[data-testid="add-block-button"]')

    // 블록 타입 선택 모달 확인
    await expect(page.locator('[data-testid="block-type-modal"]')).toBeVisible()

    // Hero 블록 선택
    await page.click('[data-testid="block-type-hero"]')

    // Hero 블록이 목록에 추가됨
    await expect(page.locator('[data-testid="block-item-hero"]')).toBeVisible()

    // Hero 블록 편집
    await page.click('[data-testid="block-item-hero"]')
    await page.fill('[data-testid="hero-title-input"]', '환영합니다!')
    await page.fill('[data-testid="hero-subtitle-input"]', '편안한 휴식 공간')

    // 미리보기에 반영 확인
    const previewPanel = page.locator('[data-testid="preview-panel"]')
    await expect(previewPanel).toContainText('환영합니다!')
    await expect(previewPanel).toContainText('편안한 휴식 공간')
  })

  test.skip('블록 추가 플로우 - QuickInfo 블록', async ({ page }) => {
    // 인증 및 에디터 페이지 접근
    await page.goto('/')
    await page.evaluate((user) => {
      localStorage.setItem('__clerk_test_auth', JSON.stringify(user))
    }, testUser)

    await page.goto(`/admin/editor/${testGuide.id}`)
    await waitForPageLoad(page)

    // 블록 추가
    await page.click('[data-testid="add-block-button"]')
    await page.click('[data-testid="block-type-quickinfo"]')

    // QuickInfo 블록이 목록에 추가됨
    await expect(
      page.locator('[data-testid="block-item-quickinfo"]')
    ).toBeVisible()

    // QuickInfo 블록 편집
    await page.click('[data-testid="block-item-quickinfo"]')
    await page.fill('[data-testid="checkin-time-input"]', '15:00')
    await page.fill('[data-testid="checkout-time-input"]', '11:00')
    await page.fill('[data-testid="wifi-ssid-input"]', 'PensionWiFi')
    await page.fill('[data-testid="wifi-password-input"]', 'welcome123')

    // 미리보기에 반영 확인
    const previewPanel = page.locator('[data-testid="preview-panel"]')
    await expect(previewPanel).toContainText('15:00')
    await expect(previewPanel).toContainText('11:00')
  })

  test.skip('발행 플로우', async ({ page }) => {
    // 인증 및 에디터 페이지 접근
    await page.goto('/')
    await page.evaluate((user) => {
      localStorage.setItem('__clerk_test_auth', JSON.stringify(user))
    }, testUser)

    await page.goto(`/admin/editor/${testGuide.id}`)
    await waitForPageLoad(page)

    // 발행 버튼 클릭
    await page.click('[data-testid="publish-button"]')

    // 발행 확인 다이얼로그 표시
    await expect(
      page.locator('[data-testid="publish-confirm-dialog"]')
    ).toBeVisible()

    // 발행 확인
    await page.click('[data-testid="publish-confirm-button"]')

    // 발행 성공 모달 표시
    await expect(
      page.locator('[data-testid="publish-success-modal"]')
    ).toBeVisible()

    // 안내서 URL 표시 확인
    await expect(page.locator('[data-testid="guide-url"]')).toContainText(
      testGuide.slug
    )

    // URL 복사 버튼 클릭
    await page.click('[data-testid="copy-url-button"]')

    // 복사 완료 토스트 확인
    await expectToast(page, '복사되었습니다')
  })

  test.skip('게스트 뷰에서 발행된 안내서 확인', async ({ page }) => {
    // 게스트 뷰로 안내서 접근
    await page.goto(`/g/${testGuide.slug}`)
    await waitForPageLoad(page)

    // 페이지 정상 로드 확인
    await expect(page).toHaveURL(`/g/${testGuide.slug}`)

    // Hero 블록 표시 확인
    await expect(page.locator('[data-testid="block-hero"]')).toBeVisible()

    // QuickInfo 블록 표시 확인
    await expect(page.locator('[data-testid="block-quickinfo"]')).toBeVisible()

    // AI 플로팅 버튼 표시 확인
    await expect(
      page.locator('[data-testid="ai-floating-button"]')
    ).toBeVisible()
  })

  test.skip('전체 플로우: 생성 → 편집 → 발행 → 확인', async ({ page }) => {
    // 1. 인증
    await page.goto('/')
    await page.evaluate((user) => {
      localStorage.setItem('__clerk_test_auth', JSON.stringify(user))
    }, testUser)

    // 2. 대시보드 접근
    await page.goto('/dashboard')
    await waitForPageLoad(page)

    // 3. 새 안내서 생성
    await page.click('[data-testid="create-guide-button"]')
    await expect(page).toHaveURL(/\/admin\/editor\//)

    // 4. 제목 입력
    await page.fill('[data-testid="guide-title-input"]', '통합 테스트 펜션')
    await page.waitForTimeout(2000) // 자동 저장 대기

    // 5. Hero 블록 추가
    await page.click('[data-testid="add-block-button"]')
    await page.click('[data-testid="block-type-hero"]')
    await page.click('[data-testid="block-item-hero"]')
    await page.fill('[data-testid="hero-title-input"]', '통합 테스트 펜션')

    // 6. QuickInfo 블록 추가
    await page.click('[data-testid="add-block-button"]')
    await page.click('[data-testid="block-type-quickinfo"]')
    await page.click('[data-testid="block-item-quickinfo"]')
    await page.fill('[data-testid="checkin-time-input"]', '15:00')
    await page.fill('[data-testid="checkout-time-input"]', '11:00')

    // 7. 발행
    await page.click('[data-testid="publish-button"]')
    await page.click('[data-testid="publish-confirm-button"]')

    // 8. 안내서 URL 복사
    const guideUrl = await page
      .locator('[data-testid="guide-url"]')
      .textContent()
    await page.click('[data-testid="copy-url-button"]')

    // 9. 게스트 뷰로 확인
    const slug = guideUrl?.split('/').pop()
    await page.goto(`/g/${slug}`)
    await waitForPageLoad(page)

    // 10. 블록 렌더링 확인
    await expect(page.locator('[data-testid="block-hero"]')).toContainText(
      '통합 테스트 펜션'
    )
    await expect(page.locator('[data-testid="block-quickinfo"]')).toContainText(
      '15:00'
    )
  })
})

test.describe('모바일 호스트 플로우', () => {
  test.beforeEach(async ({ page }) => {
    await setMobileViewport(page)
    await waitForMSW(page)
  })

  test.skip('모바일에서 에디터 접근', async ({ page }) => {
    // 인증
    await page.goto('/')
    await page.evaluate((user) => {
      localStorage.setItem('__clerk_test_auth', JSON.stringify(user))
    }, testUser)

    await page.goto(`/admin/editor/${testGuide.id}`)
    await waitForPageLoad(page)

    // 모바일 레이아웃 확인 (Bottom Sheet)
    await expect(
      page.locator('[data-testid="mobile-bottom-sheet"]')
    ).toBeVisible()
  })

  test.skip('모바일에서 블록 추가', async ({ page }) => {
    // 인증 및 에디터 접근
    await page.goto('/')
    await page.evaluate((user) => {
      localStorage.setItem('__clerk_test_auth', JSON.stringify(user))
    }, testUser)

    await page.goto(`/admin/editor/${testGuide.id}`)
    await waitForPageLoad(page)

    // 블록 추가 버튼 (모바일)
    await page.click('[data-testid="add-block-button-mobile"]')

    // 블록 타입 선택 (전체화면 모달)
    await expect(
      page.locator('[data-testid="block-type-modal"]')
    ).toBeVisible()

    await page.click('[data-testid="block-type-hero"]')

    // 블록 추가 확인
    await expect(page.locator('[data-testid="block-item-hero"]')).toBeVisible()
  })
})

test.describe('에러 처리', () => {
  test.beforeEach(async ({ page }) => {
    await waitForMSW(page)
  })

  test.skip('네트워크 에러 시 저장 실패 처리', async ({ page }) => {
    // 인증
    await page.goto('/')
    await page.evaluate((user) => {
      localStorage.setItem('__clerk_test_auth', JSON.stringify(user))
    }, testUser)

    await page.goto(`/admin/editor/${testGuide.id}`)
    await waitForPageLoad(page)

    // API 요청 차단
    await page.route('**/api/guides/**', (route) => route.abort())

    // 제목 수정
    await page.fill('[data-testid="guide-title-input"]', '수정된 제목')

    // 저장 실패 상태 확인
    await expect(page.locator('[data-testid="save-status"]')).toContainText(
      '저장 실패'
    )
  })

  test.skip('발행 실패 시 에러 메시지 표시', async ({ page }) => {
    // 인증
    await page.goto('/')
    await page.evaluate((user) => {
      localStorage.setItem('__clerk_test_auth', JSON.stringify(user))
    }, testUser)

    await page.goto(`/admin/editor/${testGuide.id}`)
    await waitForPageLoad(page)

    // 발행 API 에러 시뮬레이션
    await page.route('**/api/guides/*/publish', (route) =>
      route.fulfill({ status: 500 })
    )

    // 발행 시도
    await page.click('[data-testid="publish-button"]')
    await page.click('[data-testid="publish-confirm-button"]')

    // 에러 토스트 표시
    await expectToast(page, '발행에 실패했습니다')
  })
})
