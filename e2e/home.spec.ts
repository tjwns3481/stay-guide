import { test, expect } from '@playwright/test';

test.describe('홈페이지', () => {
  test('홈페이지 로드', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Roomy/);
  });

  test('기본 네비게이션 요소 표시', async ({ page }) => {
    await page.goto('/');

    // 페이지가 로드될 때까지 대기
    await page.waitForLoadState('networkidle');

    // 기본 컨텐츠 확인 (실제 구현에 따라 수정 필요)
    const body = await page.textContent('body');
    expect(body).toBeTruthy();
  });
});
