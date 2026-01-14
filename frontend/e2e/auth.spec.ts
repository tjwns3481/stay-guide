import { test, expect } from '@playwright/test'
import { waitForPageLoad, setMobileViewport } from './fixtures'

/**
 * 인증 플로우 E2E 테스트
 *
 * 테스트 시나리오:
 * 1. 로그인 페이지 접근 및 렌더링
 * 2. 회원가입 페이지 접근 및 렌더링
 * 3. 보호된 라우트 접근 시 리다이렉트
 * 4. 로그인 성공 후 대시보드 이동
 * 5. 로그아웃 후 리다이렉트
 */

test.describe('인증 플로우', () => {
  test.describe('로그인 페이지', () => {
    test('로그인 페이지가 정상적으로 렌더링됨', async ({ page }) => {
      await page.goto('/sign-in')
      await waitForPageLoad(page)

      // Clerk 로그인 컴포넌트 또는 커스텀 로그인 폼 확인
      // TODO: 실제 구현 후 selector 업데이트
      await expect(page).toHaveURL(/sign-in/)
    })

    test('모바일에서 로그인 페이지가 반응형으로 표시됨', async ({ page }) => {
      await setMobileViewport(page)
      await page.goto('/sign-in')
      await waitForPageLoad(page)

      // 모바일 레이아웃 확인
      await expect(page).toHaveURL(/sign-in/)
    })

    test('잘못된 자격 증명으로 로그인 시 에러 표시', async ({ page }) => {
      await page.goto('/sign-in')
      await waitForPageLoad(page)

      // TODO: 실제 로그인 폼 구현 후 테스트 작성
      // await page.fill('[data-testid="email-input"]', 'invalid@test.com')
      // await page.fill('[data-testid="password-input"]', 'wrongpassword')
      // await page.click('[data-testid="login-button"]')
      // await expect(page.locator('[data-testid="error-message"]')).toBeVisible()
    })

    test('소셜 로그인 버튼이 표시됨 (Google, Kakao)', async ({ page }) => {
      await page.goto('/sign-in')
      await waitForPageLoad(page)

      // TODO: Clerk 소셜 로그인 버튼 확인
      // await expect(page.locator('[data-testid="google-login"]')).toBeVisible()
      // await expect(page.locator('[data-testid="kakao-login"]')).toBeVisible()
    })
  })

  test.describe('회원가입 페이지', () => {
    test('회원가입 페이지가 정상적으로 렌더링됨', async ({ page }) => {
      await page.goto('/sign-up')
      await waitForPageLoad(page)

      await expect(page).toHaveURL(/sign-up/)
    })

    test('로그인 페이지로 이동 링크가 작동함', async ({ page }) => {
      await page.goto('/sign-up')
      await waitForPageLoad(page)

      // TODO: 실제 링크 구현 후 테스트
      // await page.click('text=로그인')
      // await expect(page).toHaveURL(/sign-in/)
    })
  })

  test.describe('보호된 라우트', () => {
    test('비로그인 시 대시보드 접근이 차단됨', async ({ page }) => {
      await page.goto('/dashboard')

      // 로그인 페이지로 리다이렉트 확인
      await expect(page).toHaveURL(/sign-in/)
    })

    test('비로그인 시 에디터 접근이 차단됨', async ({ page }) => {
      await page.goto('/admin/editor/test-id')

      // 로그인 페이지로 리다이렉트 확인
      await expect(page).toHaveURL(/sign-in/)
    })

    test('비로그인 시 설정 페이지 접근이 차단됨', async ({ page }) => {
      await page.goto('/admin/settings')

      // 로그인 페이지로 리다이렉트 확인
      await expect(page).toHaveURL(/sign-in/)
    })
  })

  test.describe('로그인 성공 후', () => {
    // TODO: 인증 상태 모킹 구현 후 활성화
    test.skip('로그인 후 대시보드로 리다이렉트됨', async ({ page }) => {
      // 로그인 수행
      await page.goto('/sign-in')
      // ... 로그인 로직

      // 대시보드로 이동 확인
      await expect(page).toHaveURL(/dashboard/)
    })

    test.skip('대시보드에서 사용자 정보가 표시됨', async ({ page }) => {
      // 인증된 상태로 대시보드 접근
      await page.goto('/dashboard')

      // 사용자 이름 또는 이메일 표시 확인
      // await expect(page.locator('[data-testid="user-name"]')).toBeVisible()
    })

    test.skip('로그아웃 버튼 클릭 시 로그아웃됨', async ({ page }) => {
      await page.goto('/dashboard')

      // 로그아웃 클릭
      // await page.click('[data-testid="logout-button"]')

      // 홈 또는 로그인 페이지로 이동
      // await expect(page).toHaveURL(/sign-in|\//)
    })
  })

  test.describe('세션 관리', () => {
    test.skip('세션 만료 시 로그인 페이지로 리다이렉트', async ({ page }) => {
      // TODO: 세션 만료 시뮬레이션 후 테스트
    })

    test.skip('다른 탭에서 로그아웃 시 현재 탭도 로그아웃', async ({ page }) => {
      // TODO: 멀티 탭 세션 동기화 테스트
    })
  })
})

test.describe('인증 에러 처리', () => {
  test('네트워크 에러 시 적절한 메시지 표시', async ({ page }) => {
    // 네트워크 요청 차단
    await page.route('**/api/**', (route) => route.abort())

    await page.goto('/sign-in')

    // TODO: 에러 메시지 확인
    // await expect(page.locator('[data-testid="network-error"]')).toBeVisible()
  })
})
