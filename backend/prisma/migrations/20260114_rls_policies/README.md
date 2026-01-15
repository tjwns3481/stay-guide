# Supabase RLS + Clerk 연동 가이드

## 개요

이 마이그레이션은 Clerk 인증과 Supabase Row Level Security (RLS)를 연동합니다.
- **호스트**: 자신의 데이터만 CRUD 가능
- **게스트**: 발행된 안내서만 읽기 가능
- **서버**: service_role 키로 모든 데이터 접근 (웹훅, 임베딩 생성 등)

## 사전 설정 (필수)

### 1. Supabase Third-Party Auth 설정

1. [Supabase Dashboard](https://app.supabase.com) 접속
2. **Authentication** > **Sign In / Sign Up** > **Third Party Auth**
3. **Add provider** > **Clerk** 선택
4. Clerk JWKS URL 입력:
   ```
   https://<your-clerk-domain>/.well-known/jwks.json
   ```
   (Clerk Dashboard > JWT Templates에서 확인)

### 2. Clerk JWT Template 설정 (선택)

Clerk Dashboard > JWT Templates에서 커스텀 클레임 추가 가능:

```json
{
  "user_id": "{{user.id}}",
  "email": "{{user.primary_email_address}}"
}
```

## 마이그레이션 실행

### 방법 1: Supabase Dashboard

1. [Supabase Dashboard](https://app.supabase.com) > SQL Editor
2. `migration.sql` 내용 복사 & 붙여넣기
3. **Run** 클릭

### 방법 2: psql 직접 실행

```bash
# 환경변수에서 DATABASE_URL 사용
psql $DATABASE_URL -f migration.sql
```

### 방법 3: Supabase CLI

```bash
# Supabase CLI 설치
npm install -g supabase

# 로그인
supabase login

# 마이그레이션 실행
supabase db push
```

## 정책 설명

### Users 테이블

| 정책 | 설명 |
|------|------|
| `users_select_own` | 자신의 프로필만 조회 |
| `users_update_own` | 자신의 프로필만 수정 |

### Guides 테이블

| 정책 | 설명 |
|------|------|
| `guides_select_own` | 자신의 안내서 조회 (호스트) |
| `guides_select_published` | 발행된 안내서 조회 (게스트) |
| `guides_insert_own` | 자신의 안내서 생성 |
| `guides_update_own` | 자신의 안내서 수정 |
| `guides_delete_own` | 자신의 안내서 삭제 |

### Blocks 테이블

| 정책 | 설명 |
|------|------|
| `blocks_select_own` | 자신의 블록 조회 (호스트) |
| `blocks_select_published` | 발행된 안내서의 visible 블록 조회 (게스트) |
| `blocks_insert_own` | 자신의 안내서에 블록 추가 |
| `blocks_update_own` | 자신의 블록 수정 |
| `blocks_delete_own` | 자신의 블록 삭제 |

### Licenses 테이블

| 정책 | 설명 |
|------|------|
| `licenses_select_own` | 자신의 라이선스만 조회 |

> **Note**: 라이선스 생성/수정은 서버에서만 가능 (service_role 키 사용)

### Guide Embeddings 테이블

| 정책 | 설명 |
|------|------|
| `embeddings_select_own` | 자신의 임베딩 조회 |
| `embeddings_select_published` | 발행된 안내서 임베딩 조회 (AI 챗봇) |

### AI Conversations 테이블

| 정책 | 설명 |
|------|------|
| `conversations_select_by_session` | 세션 ID로 대화 조회 |
| `conversations_insert_published` | 발행된 안내서에 대화 추가 |

## 백엔드 코드 수정

### Prisma 클라이언트 설정

RLS를 사용하려면 Supabase 클라이언트로 요청해야 합니다.
Prisma는 service_role 키로 연결하므로 RLS를 바이패스합니다.

**현재 방식 (service_role로 바이패스)**:
```typescript
// backend/src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

// service_role 키 사용 → RLS 바이패스
export const prisma = new PrismaClient();
```

**RLS 적용 방식 (선택)**:
```typescript
// Supabase 클라이언트 사용
import { createClient } from '@supabase/supabase-js';

export function createSupabaseClient(accessToken: string) {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    }
  );
}
```

### 권장 아키텍처

```
┌─────────────────────────────────────────────────────────┐
│                      클라이언트                          │
│  (Clerk JWT 토큰 포함)                                   │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                    Hono API 서버                         │
│  - 인증 미들웨어: Clerk JWT 검증                          │
│  - 권한 체크: 비즈니스 로직에서 소유자 검증                 │
└─────────────────────────────────────────────────────────┘
                            │
            ┌───────────────┴───────────────┐
            ▼                               ▼
┌───────────────────────┐      ┌───────────────────────┐
│   Prisma (service)    │      │  Supabase (RLS)       │
│   - 웹훅 처리          │      │  - 클라이언트 직접 접근  │
│   - 임베딩 생성        │      │  - 실시간 구독          │
│   - 라이선스 관리      │      │  - 스토리지 업로드      │
└───────────────────────┘      └───────────────────────┘
```

## 테스트

### RLS 정책 테스트

```sql
-- 1. 일반 사용자로 테스트 (anon 키)
SET request.jwt.claims = '{"sub": "user_abc123"}';

-- 자신의 데이터 조회
SELECT * FROM guides;  -- 자신의 안내서 + 발행된 안내서

-- 2. 다른 사용자 데이터 접근 시도
SET request.jwt.claims = '{"sub": "user_xyz789"}';

SELECT * FROM guides WHERE user_id = 'other_user_id';  -- 빈 결과
```

### 정책 확인

```sql
-- 테이블별 RLS 정책 확인
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public';
```

## 롤백

문제 발생 시:

```bash
# Supabase Dashboard에서 rollback.sql 실행
# 또는
psql $DATABASE_URL -f rollback.sql
```

## 트러블슈팅

### 1. "permission denied" 오류

- 원인: RLS가 활성화되었지만 JWT가 없거나 잘못됨
- 해결: Clerk 토큰이 올바르게 전달되는지 확인

### 2. 데이터가 보이지 않음

- 원인: RLS 정책이 너무 제한적
- 해결: `auth.clerk_user_id()` 함수가 올바른 값 반환하는지 확인

```sql
-- JWT 클레임 확인
SELECT current_setting('request.jwt.claims', true);
SELECT auth.clerk_user_id();
SELECT auth.internal_user_id();
```

### 3. service_role 키로도 차단됨

- 원인: Supabase 설정 문제
- 해결: service_role 키는 기본적으로 RLS 바이패스됨

### 4. 게스트가 발행된 안내서를 못 봄

- 원인: `is_published = true` 조건 확인
- 해결: 안내서 발행 상태 확인

## 참고 자료

- [Clerk + Supabase 공식 문서](https://clerk.com/docs/guides/development/integrations/databases/supabase)
- [Supabase RLS 가이드](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Third-Party Auth](https://supabase.com/docs/guides/auth/third-party/clerk)
