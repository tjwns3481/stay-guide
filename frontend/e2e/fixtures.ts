import { test as base, expect, Page, BrowserContext } from '@playwright/test'

/**
 * E2E 테스트용 커스텀 픽스처
 * 공통 테스트 유틸리티와 인증 상태 관리
 */

// 테스트용 사용자 정보
export const testUser = {
  id: 'user_e2e_test',
  email: 'test@example.com',
  name: '테스트 호스트',
}

// 테스트용 안내서 정보
export const testGuide = {
  id: 'guide_e2e_test',
  slug: 'test-pension',
  title: '테스트 펜션 안내서',
}

// 인증된 사용자 상태를 포함하는 테스트 픽스처
type AuthFixtures = {
  authenticatedPage: Page
  authenticatedContext: BrowserContext
}

/**
 * 인증된 상태로 테스트를 실행하는 픽스처
 * Clerk 인증을 모킹하거나 테스트 토큰을 설정
 */
export const test = base.extend<AuthFixtures>({
  authenticatedContext: async ({ browser }, use) => {
    // 인증된 컨텍스트 생성
    const context = await browser.newContext({
      // 테스트 환경에서 Clerk 인증 우회를 위한 스토리지 상태
      storageState: {
        cookies: [],
        origins: [
          {
            origin: 'http://localhost:3000',
            localStorage: [
              {
                name: '__clerk_test_auth',
                value: JSON.stringify({
                  userId: testUser.id,
                  email: testUser.email,
                }),
              },
            ],
          },
        ],
      },
    })
    await use(context)
    await context.close()
  },

  authenticatedPage: async ({ authenticatedContext }, use) => {
    const page = await authenticatedContext.newPage()
    await use(page)
    await page.close()
  },
})

export { expect } from '@playwright/test'

/**
 * 페이지가 완전히 로드될 때까지 대기
 */
export async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('networkidle')
}

/**
 * 특정 텍스트가 화면에 보일 때까지 대기
 */
export async function waitForText(page: Page, text: string) {
  await page.waitForSelector(`text=${text}`)
}

/**
 * MSW가 초기화될 때까지 대기 (개발 환경)
 */
export async function waitForMSW(page: Page) {
  // MSW 콘솔 로그를 감지하거나 일정 시간 대기
  await page.waitForTimeout(1000)
}

/**
 * 토스트 메시지 확인
 */
export async function expectToast(page: Page, message: string) {
  const toast = page.locator('[role="alert"]', { hasText: message })
  await expect(toast).toBeVisible()
}

/**
 * 모바일 뷰포트로 전환
 */
export async function setMobileViewport(page: Page) {
  await page.setViewportSize({ width: 375, height: 667 })
}

/**
 * 데스크탑 뷰포트로 전환
 */
export async function setDesktopViewport(page: Page) {
  await page.setViewportSize({ width: 1280, height: 720 })
}
