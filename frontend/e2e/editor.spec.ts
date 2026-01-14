import { test, expect } from '@playwright/test'
import {
  waitForPageLoad,
  setMobileViewport,
  setDesktopViewport,
  testGuide,
} from './fixtures'

/**
 * 에디터 E2E 테스트
 *
 * 테스트 시나리오:
 * 1. 에디터 페이지 레이아웃 (PC/모바일)
 * 2. 안내서 생성 및 편집
 * 3. 블록 추가/수정/삭제
 * 4. 블록 드래그앤드롭
 * 5. 자동 저장
 * 6. 발행 플로우
 */

test.describe('에디터 페이지', () => {
  // 모든 에디터 테스트는 인증이 필요함
  // TODO: 인증 픽스처 적용 후 활성화
  test.skip('에디터 페이지가 2-column 레이아웃으로 렌더링됨 (PC)', async ({
    page,
  }) => {
    await setDesktopViewport(page)
    await page.goto(`/admin/editor/${testGuide.id}`)
    await waitForPageLoad(page)

    // 미리보기 패널 확인
    await expect(page.locator('[data-testid="preview-panel"]')).toBeVisible()

    // 컨트롤 패널 확인
    await expect(page.locator('[data-testid="control-panel"]')).toBeVisible()
  })

  test.skip('에디터 페이지가 전체화면으로 렌더링됨 (모바일)', async ({
    page,
  }) => {
    await setMobileViewport(page)
    await page.goto(`/admin/editor/${testGuide.id}`)
    await waitForPageLoad(page)

    // Bottom Sheet 컨트롤 확인
    await expect(
      page.locator('[data-testid="mobile-bottom-sheet"]')
    ).toBeVisible()
  })
})

test.describe('안내서 생성', () => {
  test.skip('새 안내서 생성 버튼 클릭 시 에디터로 이동', async ({ page }) => {
    await page.goto('/dashboard')
    await waitForPageLoad(page)

    // 새 안내서 생성 버튼 클릭
    await page.click('[data-testid="create-guide-button"]')

    // 에디터 페이지로 이동 확인
    await expect(page).toHaveURL(/\/admin\/editor\//)
  })

  test.skip('안내서 제목 입력 시 자동 슬러그 생성', async ({ page }) => {
    await page.goto(`/admin/editor/${testGuide.id}`)
    await waitForPageLoad(page)

    // 제목 입력
    await page.fill('[data-testid="guide-title-input"]', '새로운 펜션 안내서')

    // 슬러그 자동 생성 확인
    // await expect(page.locator('[data-testid="guide-slug"]')).toContainText('새로운-펜션-안내서')
  })
})

test.describe('블록 관리', () => {
  test.skip('블록 추가 버튼 클릭 시 블록 선택 모달 표시', async ({ page }) => {
    await page.goto(`/admin/editor/${testGuide.id}`)
    await waitForPageLoad(page)

    await page.click('[data-testid="add-block-button"]')

    // 블록 타입 선택 모달 확인
    await expect(page.locator('[data-testid="block-type-modal"]')).toBeVisible()
  })

  test.skip('Hero 블록 추가 및 편집', async ({ page }) => {
    await page.goto(`/admin/editor/${testGuide.id}`)
    await waitForPageLoad(page)

    // Hero 블록 추가
    await page.click('[data-testid="add-block-button"]')
    await page.click('[data-testid="block-type-hero"]')

    // 블록이 목록에 추가됨
    await expect(page.locator('[data-testid="block-item-hero"]')).toBeVisible()

    // 블록 편집
    await page.click('[data-testid="block-item-hero"]')
    await page.fill('[data-testid="hero-title-input"]', '환영합니다!')

    // 미리보기에 반영 확인
    await expect(page.locator('[data-testid="preview-panel"]')).toContainText(
      '환영합니다!'
    )
  })

  test.skip('QuickInfo 블록 추가 및 편집', async ({ page }) => {
    await page.goto(`/admin/editor/${testGuide.id}`)
    await waitForPageLoad(page)

    await page.click('[data-testid="add-block-button"]')
    await page.click('[data-testid="block-type-quickinfo"]')

    await expect(
      page.locator('[data-testid="block-item-quickinfo"]')
    ).toBeVisible()
  })

  test.skip('블록 삭제 확인 다이얼로그 표시', async ({ page }) => {
    await page.goto(`/admin/editor/${testGuide.id}`)
    await waitForPageLoad(page)

    // 삭제 버튼 클릭
    await page.click('[data-testid="block-delete-button"]')

    // 확인 다이얼로그 표시
    await expect(
      page.locator('[data-testid="confirm-delete-dialog"]')
    ).toBeVisible()
  })

  test.skip('블록 삭제 확인 시 블록 제거됨', async ({ page }) => {
    await page.goto(`/admin/editor/${testGuide.id}`)
    await waitForPageLoad(page)

    const blockCount = await page.locator('[data-testid^="block-item-"]').count()

    await page.click('[data-testid="block-delete-button"]')
    await page.click('[data-testid="confirm-delete-button"]')

    // 블록 개수 감소 확인
    await expect(page.locator('[data-testid^="block-item-"]')).toHaveCount(
      blockCount - 1
    )
  })
})

test.describe('블록 드래그앤드롭', () => {
  test.skip('블록 순서 변경 (드래그앤드롭)', async ({ page }) => {
    await page.goto(`/admin/editor/${testGuide.id}`)
    await waitForPageLoad(page)

    // 첫 번째 블록 드래그하여 두 번째 위치로 이동
    const firstBlock = page.locator('[data-testid^="block-item-"]').first()
    const secondBlock = page.locator('[data-testid^="block-item-"]').nth(1)

    await firstBlock.dragTo(secondBlock)

    // 순서 변경 확인 (API 호출 또는 UI 상태)
  })

  test.skip('모바일에서 블록 순서 변경 (터치 드래그)', async ({ page }) => {
    await setMobileViewport(page)
    await page.goto(`/admin/editor/${testGuide.id}`)
    await waitForPageLoad(page)

    // 터치 드래그 시뮬레이션
    // TODO: 터치 이벤트 구현 후 테스트
  })
})

test.describe('자동 저장', () => {
  test.skip('편집 후 자동 저장 상태 표시', async ({ page }) => {
    await page.goto(`/admin/editor/${testGuide.id}`)
    await waitForPageLoad(page)

    // 제목 수정
    await page.fill('[data-testid="guide-title-input"]', '수정된 제목')

    // 저장 중 상태 표시
    await expect(page.locator('[data-testid="save-status"]')).toContainText(
      '저장 중'
    )

    // 저장 완료 상태
    await expect(page.locator('[data-testid="save-status"]')).toContainText(
      '저장됨'
    )
  })

  test.skip('저장 실패 시 에러 상태 표시', async ({ page }) => {
    // 네트워크 에러 시뮬레이션
    await page.route('**/api/guides/**', (route) => route.abort())

    await page.goto(`/admin/editor/${testGuide.id}`)
    await waitForPageLoad(page)

    await page.fill('[data-testid="guide-title-input"]', '수정된 제목')

    // 저장 실패 상태
    await expect(page.locator('[data-testid="save-status"]')).toContainText(
      '저장 실패'
    )
  })
})

test.describe('발행 플로우', () => {
  test.skip('발행 버튼 클릭 시 확인 다이얼로그 표시', async ({ page }) => {
    await page.goto(`/admin/editor/${testGuide.id}`)
    await waitForPageLoad(page)

    await page.click('[data-testid="publish-button"]')

    await expect(
      page.locator('[data-testid="publish-confirm-dialog"]')
    ).toBeVisible()
  })

  test.skip('발행 성공 시 URL 복사 모달 표시', async ({ page }) => {
    await page.goto(`/admin/editor/${testGuide.id}`)
    await waitForPageLoad(page)

    await page.click('[data-testid="publish-button"]')
    await page.click('[data-testid="publish-confirm-button"]')

    // 발행 성공 모달 (URL 복사)
    await expect(
      page.locator('[data-testid="publish-success-modal"]')
    ).toBeVisible()
    await expect(page.locator('[data-testid="guide-url"]')).toContainText(
      testGuide.slug
    )
  })

  test.skip('URL 복사 버튼 클릭 시 클립보드에 복사됨', async ({ page }) => {
    await page.goto(`/admin/editor/${testGuide.id}`)
    await waitForPageLoad(page)

    await page.click('[data-testid="publish-button"]')
    await page.click('[data-testid="publish-confirm-button"]')
    await page.click('[data-testid="copy-url-button"]')

    // 복사 완료 토스트
    await expect(page.locator('[role="alert"]')).toContainText('복사되었습니다')
  })

  test.skip('발행 취소 (draft로 변경)', async ({ page }) => {
    await page.goto(`/admin/editor/${testGuide.id}`)
    await waitForPageLoad(page)

    await page.click('[data-testid="unpublish-button"]')

    // 상태가 draft로 변경됨
    await expect(page.locator('[data-testid="guide-status"]')).toContainText(
      '초안'
    )
  })
})

test.describe('테마 설정', () => {
  test.skip('테마 프리셋 선택 시 미리보기에 반영', async ({ page }) => {
    await page.goto(`/admin/editor/${testGuide.id}`)
    await waitForPageLoad(page)

    // 테마 설정 탭 열기
    await page.click('[data-testid="theme-tab"]')

    // Modern 테마 선택
    await page.click('[data-testid="theme-preset-modern"]')

    // 미리보기에 테마 반영 확인
    await expect(page.locator('[data-testid="preview-panel"]')).toHaveClass(
      /theme-modern/
    )
  })

  test.skip('커스텀 컬러 선택 시 미리보기에 반영', async ({ page }) => {
    await page.goto(`/admin/editor/${testGuide.id}`)
    await waitForPageLoad(page)

    await page.click('[data-testid="theme-tab"]')
    await page.click('[data-testid="custom-color-picker"]')

    // 컬러 선택
    await page.fill('[data-testid="color-input"]', '#FF5733')

    // 미리보기에 컬러 반영 확인
  })
})
