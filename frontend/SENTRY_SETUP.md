# Sentry 설정 가이드

Roomy 프로젝트에 Sentry 에러 추적을 설정하는 가이드입니다.

## 1. 설치

Sentry 마법사를 사용하여 Next.js 프로젝트에 자동으로 설정합니다:

```bash
cd frontend
npx @sentry/wizard@latest -i nextjs
```

마법사가 자동으로 다음 파일들을 생성합니다:
- `sentry.client.config.ts`
- `sentry.server.config.ts`
- `sentry.edge.config.ts`
- `next.config.js` 수정 (withSentryConfig 래핑)

## 2. 환경 변수

`.env.local` 파일에 다음 환경 변수를 추가합니다:

```env
# Sentry 기본 설정
SENTRY_DSN=https://your-public-key@o123456.ingest.sentry.io/project-id
NEXT_PUBLIC_SENTRY_DSN=https://your-public-key@o123456.ingest.sentry.io/project-id

# 소스맵 업로드용 (빌드 시 필요)
SENTRY_AUTH_TOKEN=your-auth-token
SENTRY_ORG=your-organization
SENTRY_PROJECT=roomy-frontend
```

> **참고**: DSN은 Sentry 대시보드 > Settings > Projects > [Project] > Client Keys에서 확인할 수 있습니다.

## 3. 설정 파일

### sentry.client.config.ts

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // 성능 모니터링 (프로덕션에서는 낮게 설정 권장)
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // 세션 리플레이 (프로덕션에서만)
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // 디버그 모드 (개발 환경에서만)
  debug: process.env.NODE_ENV === 'development',

  // 환경 구분
  environment: process.env.NODE_ENV,

  // 무시할 에러 패턴
  ignoreErrors: [
    // 네트워크 관련 일시적 에러
    'Network Error',
    'Failed to fetch',
    'Load failed',
    // 사용자 취소
    'AbortError',
    // 브라우저 확장 프로그램
    'top.GLOBALS',
  ],

  // Replay 통합
  integrations: [
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
});
```

### sentry.server.config.ts

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  debug: process.env.NODE_ENV === 'development',

  environment: process.env.NODE_ENV,
});
```

### sentry.edge.config.ts

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  debug: process.env.NODE_ENV === 'development',
});
```

## 4. Error Boundary 통합

기존 Error Boundary 파일들에 Sentry를 통합합니다:

### src/components/common/ErrorBoundary.tsx

```typescript
'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'
// ... 기존 imports

export function ErrorFallback({ error, reset, variant = 'page' }: ErrorBoundaryProps) {
  useEffect(() => {
    // Sentry로 에러 전송
    Sentry.captureException(error, {
      tags: {
        component: 'ErrorBoundary',
        variant,
      },
      extra: {
        digest: error.digest,
      },
    })
  }, [error, variant])

  // ... 기존 코드
}
```

### src/app/global-error.tsx

```typescript
'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'
// ... 기존 imports

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    Sentry.captureException(error, {
      tags: {
        type: 'global-error',
      },
    })
  }, [error])

  // ... 기존 코드
}
```

## 5. API 에러 추적

### Hono API에서 사용

```typescript
// src/app/api/[[...route]]/route.ts
import * as Sentry from '@sentry/nextjs'

// 전역 에러 핸들러
app.onError((err, c) => {
  Sentry.captureException(err, {
    tags: {
      path: c.req.path,
      method: c.req.method,
    },
  })

  return c.json({ error: 'Internal Server Error' }, 500)
})
```

## 6. 수동 에러 캡처

필요한 경우 수동으로 에러를 캡처할 수 있습니다:

```typescript
import * as Sentry from '@sentry/nextjs'

// 에러 캡처
try {
  await riskyOperation()
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      action: 'riskyOperation',
    },
    user: {
      id: userId,
      email: userEmail,
    },
  })
}

// 메시지 캡처
Sentry.captureMessage('User completed onboarding', 'info')

// 사용자 정보 설정 (로그인 시)
Sentry.setUser({
  id: user.id,
  email: user.email,
})

// 로그아웃 시 사용자 정보 제거
Sentry.setUser(null)
```

## 7. Vercel 배포 설정

Vercel에 배포 시 환경 변수를 설정합니다:

1. Vercel 대시보드 > Settings > Environment Variables
2. 다음 변수들을 추가:
   - `SENTRY_DSN`
   - `NEXT_PUBLIC_SENTRY_DSN`
   - `SENTRY_AUTH_TOKEN`
   - `SENTRY_ORG`
   - `SENTRY_PROJECT`

## 8. 소스맵 업로드

`next.config.js`에서 소스맵 업로드를 설정합니다:

```javascript
const { withSentryConfig } = require('@sentry/nextjs')

const nextConfig = {
  // 기존 설정
}

module.exports = withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // 소스맵 업로드 (프로덕션 빌드 시에만)
  silent: true,
  hideSourceMaps: true,

  // 자동 계측
  widenClientFileUpload: true,
  tunnelRoute: '/monitoring',
})
```

## 9. 테스트

설치 후 Sentry가 정상 작동하는지 테스트합니다:

```typescript
// 테스트용 버튼 (개발 환경에서만)
<button onClick={() => {
  throw new Error('Sentry Test Error')
}}>
  Sentry 테스트
</button>
```

## 참고 자료

- [Sentry Next.js SDK 문서](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Sentry 대시보드](https://sentry.io/)
- [Next.js 에러 핸들링](https://nextjs.org/docs/app/building-your-application/routing/error-handling)
