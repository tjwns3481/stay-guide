import { test, expect } from '@playwright/test'
import {
  waitForPageLoad,
  waitForMSW,
  setDesktopViewport,
  setMobileViewport,
  expectToast,
  testUser,
} from './fixtures'

/**
 * 라이선스/결제 플로우 E2E 테스트
 *
 * 테스트 시나리오:
 * 1. 설정 페이지 접근
 * 2. 라이선스 섹션 표시
 * 3. 라이선스 관리 페이지 이동
 * 4. 라이선스 키 입력 폼 확인
 * 5. 플랜 비교 테이블 확인
 * 6. 결제 플로우 (Portone 연동)
 */

test.describe('라이선스 관리 페이지 접근', () => {
  test.beforeEach(async ({ page }) => {
    await setDesktopViewport(page)
    await waitForMSW(page)

    // 인증 상태 설정
    await page.goto('/')
    await page.evaluate((user) => {
      localStorage.setItem('__clerk_test_auth', JSON.stringify(user))
    }, testUser)
  })

  test.skip('설정 페이지 접근', async ({ page }) => {
    await page.goto('/admin/settings')
    await waitForPageLoad(page)

    // 설정 페이지 확인
    await expect(page).toHaveURL(/\/admin\/settings/)

    // 페이지 제목 확인
    await expect(page.locator('h1')).toContainText('설정')
  })

  test.skip('라이선스 섹션 표시', async ({ page }) => {
    await page.goto('/admin/settings')
    await waitForPageLoad(page)

    // 라이선스 섹션 확인
    const licenseSection = page.locator('[data-testid="license-section"]')
    await expect(licenseSection).toBeVisible()

    // 현재 플랜 표시
    await expect(licenseSection).toContainText('현재 플랜')

    // 무료 플랜 표시 (기본값)
    await expect(licenseSection).toContainText('무료')

    // 업그레이드 버튼 표시
    await expect(
      licenseSection.locator('[data-testid="upgrade-button"]')
    ).toBeVisible()
  })

  test.skip('라이선스 관리 페이지로 이동', async ({ page }) => {
    await page.goto('/admin/settings')
    await waitForPageLoad(page)

    // 라이선스 관리 버튼 클릭
    await page.click('[data-testid="manage-license-button"]')

    // 라이선스 관리 페이지로 이동
    await expect(page).toHaveURL(/\/admin\/license/)
  })
})

test.describe('라이선스 관리 페이지', () => {
  test.beforeEach(async ({ page }) => {
    await setDesktopViewport(page)
    await waitForMSW(page)

    // 인증 상태 설정
    await page.goto('/')
    await page.evaluate((user) => {
      localStorage.setItem('__clerk_test_auth', JSON.stringify(user))
    }, testUser)

    await page.goto('/admin/license')
    await waitForPageLoad(page)
  })

  test.skip('라이선스 키 입력 폼 표시', async ({ page }) => {
    // 라이선스 키 입력 섹션 확인
    const licenseKeySection = page.locator(
      '[data-testid="license-key-section"]'
    )
    await expect(licenseKeySection).toBeVisible()

    // 입력 필드 확인
    await expect(
      licenseKeySection.locator('[data-testid="license-key-input"]')
    ).toBeVisible()

    // 적용 버튼 확인
    await expect(
      licenseKeySection.locator('[data-testid="apply-license-button"]')
    ).toBeVisible()
  })

  test.skip('유효한 라이선스 키 입력', async ({ page }) => {
    const validLicenseKey = 'ROOMY-PRO-2026-ABCD1234'

    // 라이선스 키 입력
    await page.fill(
      '[data-testid="license-key-input"]',
      validLicenseKey
    )

    // 적용 버튼 클릭
    await page.click('[data-testid="apply-license-button"]')

    // 성공 토스트 확인
    await expectToast(page, '라이선스가 적용되었습니다')

    // 플랜 변경 확인
    await expect(page.locator('[data-testid="current-plan"]')).toContainText(
      'Pro'
    )
  })

  test.skip('유효하지 않은 라이선스 키 입력', async ({ page }) => {
    const invalidLicenseKey = 'INVALID-KEY'

    // 라이선스 키 입력
    await page.fill('[data-testid="license-key-input"]', invalidLicenseKey)

    // 적용 버튼 클릭
    await page.click('[data-testid="apply-license-button"]')

    // 에러 토스트 확인
    await expectToast(page, '유효하지 않은 라이선스 키입니다')

    // 플랜 변경되지 않음
    await expect(page.locator('[data-testid="current-plan"]')).toContainText(
      '무료'
    )
  })

  test.skip('만료된 라이선스 키 입력', async ({ page }) => {
    const expiredLicenseKey = 'ROOMY-PRO-2025-EXPIRED01'

    await page.fill('[data-testid="license-key-input"]', expiredLicenseKey)
    await page.click('[data-testid="apply-license-button"]')

    // 만료 에러 메시지
    await expectToast(page, '만료된 라이선스입니다')
  })
})

test.describe('플랜 비교 테이블', () => {
  test.beforeEach(async ({ page }) => {
    await setDesktopViewport(page)
    await waitForMSW(page)

    // 인증 상태 설정
    await page.goto('/')
    await page.evaluate((user) => {
      localStorage.setItem('__clerk_test_auth', JSON.stringify(user))
    }, testUser)

    await page.goto('/admin/license')
    await waitForPageLoad(page)
  })

  test.skip('플랜 비교 테이블 표시', async ({ page }) => {
    // 플랜 비교 섹션 확인
    const planComparisonTable = page.locator(
      '[data-testid="plan-comparison-table"]'
    )
    await expect(planComparisonTable).toBeVisible()

    // 무료 플랜 열 확인
    await expect(
      planComparisonTable.locator('[data-testid="plan-free"]')
    ).toBeVisible()

    // Pro 플랜 열 확인
    await expect(
      planComparisonTable.locator('[data-testid="plan-pro"]')
    ).toBeVisible()

    // Business 플랜 열 확인
    await expect(
      planComparisonTable.locator('[data-testid="plan-business"]')
    ).toBeVisible()
  })

  test.skip('플랜별 기능 비교', async ({ page }) => {
    const planComparisonTable = page.locator(
      '[data-testid="plan-comparison-table"]'
    )

    // 안내서 개수 제한 확인
    await expect(planComparisonTable).toContainText('안내서 개수')
    await expect(planComparisonTable).toContainText('1개') // 무료
    await expect(planComparisonTable).toContainText('5개') // Pro
    await expect(planComparisonTable).toContainText('무제한') // Business

    // AI 질문 횟수 확인
    await expect(planComparisonTable).toContainText('AI 질문')
    await expect(planComparisonTable).toContainText('50회/월') // 무료
    await expect(planComparisonTable).toContainText('500회/월') // Pro
    await expect(planComparisonTable).toContainText('무제한') // Business

    // 워터마크 제거 확인
    await expect(planComparisonTable).toContainText('워터마크 제거')

    // 커스텀 도메인 확인
    await expect(planComparisonTable).toContainText('커스텀 도메인')
  })

  test.skip('플랜 선택 버튼', async ({ page }) => {
    // Pro 플랜 선택 버튼
    const proSelectButton = page.locator(
      '[data-testid="select-plan-pro"]'
    )
    await expect(proSelectButton).toBeVisible()
    await expect(proSelectButton).toContainText('선택')

    // Business 플랜 선택 버튼
    const businessSelectButton = page.locator(
      '[data-testid="select-plan-business"]'
    )
    await expect(businessSelectButton).toBeVisible()
    await expect(businessSelectButton).toContainText('선택')
  })
})

test.describe('결제 플로우 (Portone)', () => {
  test.beforeEach(async ({ page }) => {
    await setDesktopViewport(page)
    await waitForMSW(page)

    // 인증 상태 설정
    await page.goto('/')
    await page.evaluate((user) => {
      localStorage.setItem('__clerk_test_auth', JSON.stringify(user))
    }, testUser)

    await page.goto('/admin/license')
    await waitForPageLoad(page)
  })

  test.skip('Pro 플랜 선택 시 결제 모달 표시', async ({ page }) => {
    // Pro 플랜 선택
    await page.click('[data-testid="select-plan-pro"]')

    // 결제 확인 모달 표시
    const paymentModal = page.locator('[data-testid="payment-modal"]')
    await expect(paymentModal).toBeVisible()

    // 플랜 정보 표시
    await expect(paymentModal).toContainText('Pro')
    await expect(paymentModal).toContainText('29,000원/월')

    // 결제 방법 선택
    await expect(
      paymentModal.locator('[data-testid="payment-method-card"]')
    ).toBeVisible()
    await expect(
      paymentModal.locator('[data-testid="payment-method-transfer"]')
    ).toBeVisible()
  })

  test.skip('결제 방법 선택 - 카드', async ({ page }) => {
    // Pro 플랜 선택
    await page.click('[data-testid="select-plan-pro"]')

    const paymentModal = page.locator('[data-testid="payment-modal"]')

    // 카드 결제 선택
    await page.click('[data-testid="payment-method-card"]')

    // 결제하기 버튼 클릭
    await page.click('[data-testid="proceed-payment-button"]')

    // Portone 결제창 로딩 (iframe 또는 새 창)
    // TODO: Portone 테스트 환경 구성 후 추가
  })

  test.skip('결제 성공 시 플랜 업그레이드', async ({ page }) => {
    // Pro 플랜 선택
    await page.click('[data-testid="select-plan-pro"]')

    // 카드 결제 선택
    await page.click('[data-testid="payment-method-card"]')

    // 결제 진행 (Mock 성공 응답)
    await page.click('[data-testid="proceed-payment-button"]')

    // 결제 성공 토스트
    await expectToast(page, '결제가 완료되었습니다')

    // 플랜 변경 확인
    await expect(page.locator('[data-testid="current-plan"]')).toContainText(
      'Pro'
    )
  })

  test.skip('결제 실패 시 에러 처리', async ({ page }) => {
    // Pro 플랜 선택
    await page.click('[data-testid="select-plan-pro"]')

    // 카드 결제 선택
    await page.click('[data-testid="payment-method-card"]')

    // 결제 API 에러 시뮬레이션
    await page.route('**/api/payments/**', (route) =>
      route.fulfill({ status: 500 })
    )

    // 결제 진행
    await page.click('[data-testid="proceed-payment-button"]')

    // 결제 실패 에러 메시지
    await expectToast(page, '결제에 실패했습니다')

    // 플랜 변경되지 않음
    await expect(page.locator('[data-testid="current-plan"]')).toContainText(
      '무료'
    )
  })

  test.skip('결제 취소', async ({ page }) => {
    // Pro 플랜 선택
    await page.click('[data-testid="select-plan-pro"]')

    const paymentModal = page.locator('[data-testid="payment-modal"]')

    // 취소 버튼 클릭
    await page.click('[data-testid="cancel-payment-button"]')

    // 모달 닫힘
    await expect(paymentModal).not.toBeVisible()

    // 플랜 변경되지 않음
    await expect(page.locator('[data-testid="current-plan"]')).toContainText(
      '무료'
    )
  })
})

test.describe('구독 관리', () => {
  test.beforeEach(async ({ page }) => {
    await setDesktopViewport(page)
    await waitForMSW(page)

    // 인증 상태 설정 (Pro 플랜 사용자)
    await page.goto('/')
    await page.evaluate((user) => {
      localStorage.setItem(
        '__clerk_test_auth',
        JSON.stringify({ ...user, plan: 'pro' })
      )
    }, testUser)

    await page.goto('/admin/license')
    await waitForPageLoad(page)
  })

  test.skip('현재 구독 정보 표시', async ({ page }) => {
    // 구독 정보 섹션 확인
    const subscriptionSection = page.locator(
      '[data-testid="subscription-section"]'
    )
    await expect(subscriptionSection).toBeVisible()

    // 현재 플랜
    await expect(subscriptionSection).toContainText('Pro')

    // 다음 결제일
    await expect(subscriptionSection).toContainText('다음 결제일')

    // 결제 금액
    await expect(subscriptionSection).toContainText('29,000원')
  })

  test.skip('구독 해지', async ({ page }) => {
    // 구독 해지 버튼 클릭
    await page.click('[data-testid="cancel-subscription-button"]')

    // 확인 다이얼로그 표시
    const confirmDialog = page.locator('[data-testid="confirm-cancel-dialog"]')
    await expect(confirmDialog).toBeVisible()
    await expect(confirmDialog).toContainText('정말 구독을 해지하시겠습니까?')

    // 해지 확인
    await page.click('[data-testid="confirm-cancel-button"]')

    // 해지 완료 토스트
    await expectToast(page, '구독이 해지되었습니다')

    // 무료 플랜으로 변경
    await expect(page.locator('[data-testid="current-plan"]')).toContainText(
      '무료'
    )
  })

  test.skip('플랜 변경 (Pro → Business)', async ({ page }) => {
    // Business 플랜 선택
    await page.click('[data-testid="select-plan-business"]')

    // 플랜 변경 확인 모달
    const changePlanModal = page.locator('[data-testid="change-plan-modal"]')
    await expect(changePlanModal).toBeVisible()
    await expect(changePlanModal).toContainText('플랜을 변경하시겠습니까?')

    // 변경 확인
    await page.click('[data-testid="confirm-change-button"]')

    // 플랜 변경 완료 토스트
    await expectToast(page, '플랜이 변경되었습니다')

    // Business 플랜으로 변경
    await expect(page.locator('[data-testid="current-plan"]')).toContainText(
      'Business'
    )
  })
})

test.describe('모바일 결제 플로우', () => {
  test.beforeEach(async ({ page }) => {
    await setMobileViewport(page)
    await waitForMSW(page)

    // 인증 상태 설정
    await page.goto('/')
    await page.evaluate((user) => {
      localStorage.setItem('__clerk_test_auth', JSON.stringify(user))
    }, testUser)
  })

  test.skip('모바일에서 라이선스 관리 페이지 접근', async ({ page }) => {
    await page.goto('/admin/license')
    await waitForPageLoad(page)

    // 페이지 정상 렌더링
    await expect(page.locator('body')).toBeVisible()
  })

  test.skip('모바일에서 플랜 비교 테이블 (스크롤)', async ({ page }) => {
    await page.goto('/admin/license')
    await waitForPageLoad(page)

    // 플랜 비교 테이블 (가로 스크롤)
    const planComparisonTable = page.locator(
      '[data-testid="plan-comparison-table"]'
    )
    await expect(planComparisonTable).toBeVisible()

    // 스크롤 가능 여부 확인
    const isScrollable = await planComparisonTable.evaluate((el) => {
      return el.scrollWidth > el.clientWidth
    })
    expect(isScrollable).toBe(true)
  })

  test.skip('모바일에서 결제 모달 (전체화면)', async ({ page }) => {
    await page.goto('/admin/license')
    await waitForPageLoad(page)

    // Pro 플랜 선택
    await page.click('[data-testid="select-plan-pro"]')

    // 결제 모달 전체화면 확인
    const paymentModal = page.locator('[data-testid="payment-modal"]')
    await expect(paymentModal).toBeVisible()
    await expect(paymentModal).toHaveClass(/fullscreen/)
  })
})

test.describe('결제 히스토리', () => {
  test.beforeEach(async ({ page }) => {
    await setDesktopViewport(page)
    await waitForMSW(page)

    // 인증 상태 설정 (Pro 플랜 사용자)
    await page.goto('/')
    await page.evaluate((user) => {
      localStorage.setItem(
        '__clerk_test_auth',
        JSON.stringify({ ...user, plan: 'pro' })
      )
    }, testUser)

    await page.goto('/admin/license')
    await waitForPageLoad(page)
  })

  test.skip('결제 히스토리 탭 표시', async ({ page }) => {
    // 결제 히스토리 탭 클릭
    await page.click('[data-testid="payment-history-tab"]')

    // 결제 내역 테이블 표시
    const historyTable = page.locator('[data-testid="payment-history-table"]')
    await expect(historyTable).toBeVisible()

    // 테이블 헤더 확인
    await expect(historyTable).toContainText('날짜')
    await expect(historyTable).toContainText('플랜')
    await expect(historyTable).toContainText('금액')
    await expect(historyTable).toContainText('상태')
  })

  test.skip('결제 내역 항목 표시', async ({ page }) => {
    await page.click('[data-testid="payment-history-tab"]')

    const historyTable = page.locator('[data-testid="payment-history-table"]')

    // 첫 번째 결제 내역 확인
    const firstRow = historyTable.locator('tbody tr').first()
    await expect(firstRow).toBeVisible()

    // 날짜, 플랜, 금액, 상태 확인
    await expect(firstRow).toContainText('2026-')
    await expect(firstRow).toContainText('Pro')
    await expect(firstRow).toContainText('29,000원')
    await expect(firstRow).toContainText('완료')
  })

  test.skip('영수증 다운로드', async ({ page }) => {
    await page.click('[data-testid="payment-history-tab"]')

    // 영수증 다운로드 버튼 클릭
    const downloadPromise = page.waitForEvent('download')
    await page.click('[data-testid="download-receipt-button"]')

    const download = await downloadPromise

    // 파일명 확인
    expect(download.suggestedFilename()).toContain('receipt')
  })
})
