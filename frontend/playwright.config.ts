import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright E2E 테스트 설정
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // 테스트 파일 위치
  testDir: './e2e',

  // 각 테스트의 최대 실행 시간
  timeout: 30 * 1000,

  // 테스트 expect 타임아웃
  expect: {
    timeout: 5000,
  },

  // 전체 테스트 실행 제한 시간
  fullyParallel: true,

  // CI에서 재시도 횟수
  retries: process.env.CI ? 2 : 0,

  // 병렬 실행 워커 수
  workers: process.env.CI ? 1 : undefined,

  // 리포터 설정
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
  ],

  // 공통 설정
  use: {
    // 기본 URL
    baseURL: 'http://localhost:3000',

    // 스크린샷 설정 (실패 시)
    screenshot: 'only-on-failure',

    // 비디오 설정 (실패 시)
    video: 'retain-on-failure',

    // 트레이스 설정 (실패 시)
    trace: 'retain-on-failure',

    // 액션 타임아웃
    actionTimeout: 10000,

    // 네비게이션 타임아웃
    navigationTimeout: 15000,
  },

  // 브라우저별 프로젝트 설정
  projects: [
    // 데스크탑 브라우저
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // 모바일 브라우저 (Roomy는 모바일 우선)
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 13'] },
    },
  ],

  // 개발 서버 자동 시작
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
})
