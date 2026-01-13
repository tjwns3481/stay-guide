# TRD (기술 요구사항 정의서) - Roomy (루미)

> 개발자/AI 코딩 파트너가 참조하는 기술 문서입니다.
> 기술 표현을 사용하되, "왜 이 선택인지"를 함께 설명합니다.

---

## MVP 캡슐

| # | 항목 | 내용 |
|---|------|------|
| 1 | 목표 | 호스트의 반복 문의 응대 부담을 줄이고, 손님에게 필요한 정보를 링크 하나로 제공 |
| 2 | 페르소나 | 30대 에어비앤비/펜션 호스트 (직접 운영, 감성 숙소) |
| 3 | 핵심 기능 | FEAT-1: 필수 정보 블록 (와이파이 복사, 지도 연동 등) |
| 4 | 성공 지표 (노스스타) | 유료 구매 고객 수 |
| 5 | 입력 지표 | 주간 신규 가입 호스트 수, 가이드북 조회 수 |
| 6 | 비기능 요구 | 모바일 첫 화면 로딩 2초 이내 (SSR 최적화) |
| 7 | Out-of-scope | AI 챗봇 (v2), 결제 연동 (v2), 소셜 로그인 (v2) |
| 8 | Top 리스크 | 기존 노션/종이 안내문에 익숙한 호스트가 전환하지 않을 수 있음 |
| 9 | 완화/실험 | 무료 체험 후 유료 전환 유도, "10분 만에 만드는 가이드북" 온보딩 |
| 10 | 다음 단계 | 랜딩 페이지 제작 및 베타 테스터 모집 |

---

## 1. 시스템 아키텍처

### 1.1 고수준 아키텍처

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              Client Layer                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐ │
│  │  Guest View      │     │  Host Dashboard  │     │  Admin Panel     │ │
│  │  (손님 가이드북)  │     │  (관리자 페이지) │     │  (v2 이후)       │ │
│  │  - SSR/SSG       │     │  - CSR + Auth    │     │                  │ │
│  └────────┬─────────┘     └────────┬─────────┘     └──────────────────┘ │
│           │                        │                                     │
└───────────┼────────────────────────┼─────────────────────────────────────┘
            │                        │
            ▼                        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           Next.js App Router                             │
│                     (Vercel Edge Runtime 배포)                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐ │
│  │  Server Actions  │     │  API Routes      │     │  Middleware      │ │
│  │  (폼 처리)        │     │  (/api/*)       │     │  (인증 체크)     │ │
│  └────────┬─────────┘     └────────┬─────────┘     └──────────────────┘ │
│           │                        │                                     │
└───────────┼────────────────────────┼─────────────────────────────────────┘
            │                        │
            ▼                        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           Data Layer (Supabase)                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐ │
│  │  PostgreSQL      │     │  Auth            │     │  Storage         │ │
│  │  (메인 DB)       │     │  (인증)          │     │  (이미지)        │ │
│  └──────────────────┘     └──────────────────┘     └──────────────────┘ │
│                                                                          │
│  ┌──────────────────┐                                                    │
│  │  pgvector (v2)   │                                                    │
│  │  (AI 챗봇 RAG)   │                                                    │
│  └──────────────────┘                                                    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.2 컴포넌트 설명

| 컴포넌트 | 역할 | 왜 이 선택? |
|----------|------|-------------|
| Next.js App Router | SSR/SSG 프론트엔드 + API Routes 백엔드 | 빠른 로딩 필수 요구사항 충족, 1인 개발에 적합한 풀스택 |
| Vercel Edge | 글로벌 CDN + Edge Runtime | 한국 사용자 대상 빠른 응답, 무료 티어로 시작 |
| Supabase | PostgreSQL + Auth + Storage | 무료 티어, Supabase Auth로 인증 간소화, v2 pgvector 확장 용이 |
| React Server Components | 서버 사이드 렌더링 | 가이드북 초기 로딩 최적화 (2초 이내 목표) |

---

## 2. 권장 기술 스택

### 2.1 프론트엔드

| 항목 | 선택 | 이유 | 벤더 락인 리스크 |
|------|------|------|-----------------|
| 프레임워크 | Next.js 14 (App Router) | SSR/SSG 지원, API Routes 통합 | 중간 (Vercel 최적화) |
| 언어 | TypeScript 5.x | 타입 안전성, 개발 생산성 | - |
| 스타일링 | Tailwind CSS + shadcn/ui | 빠른 UI 개발, 감성적 커스터마이징 용이 | 낮음 |
| 상태관리 | Zustand | 경량, 보일러플레이트 최소 | 낮음 |
| 폼 관리 | React Hook Form + Zod | 타입 안전한 폼 검증 | 낮음 |
| HTTP 클라이언트 | fetch (native) | Next.js 최적화, 추가 의존성 없음 | 없음 |
| 지도 연동 | Kakao Maps SDK | 한국 주소 검색 최적화 | 중간 (한국 한정) |

### 2.2 백엔드

| 항목 | 선택 | 이유 | 벤더 락인 리스크 |
|------|------|------|-----------------|
| 프레임워크 | Next.js API Routes | 프론트엔드와 통합, 배포 단순화 | 중간 |
| 언어 | TypeScript 5.x | 프론트엔드와 언어 통일 | - |
| ORM | Drizzle ORM | 타입 안전, SQL-like 문법, 경량 | 낮음 |
| 검증 | Zod | 프론트엔드와 스키마 공유 가능 | 낮음 |
| 인증 | Supabase Auth | 이메일 인증 내장, JWT 자동 관리 | 중간 |

### 2.3 데이터베이스

| 항목 | 선택 | 이유 |
|------|------|------|
| 메인 DB | Supabase PostgreSQL | 무료 500MB, Row Level Security 지원, pgvector 확장 가능 |
| 파일 스토리지 | Supabase Storage | 이미지 업로드용, CDN 제공 |
| 캐시 | 없음 (MVP) | 초기 트래픽 낮음, Vercel ISR로 충분 |

### 2.4 인프라

| 항목 | 선택 | 이유 |
|------|------|------|
| 호스팅 | Vercel | Next.js 최적화, 무료 티어, Edge Runtime |
| 도메인 | Vercel Domains 또는 외부 | roomy.kr 또는 roomy.so |
| 모니터링 | Vercel Analytics | 기본 제공, Core Web Vitals 추적 |
| 에러 추적 | Sentry (v2) | MVP에서는 console.error로 시작 |

---

## 3. 비기능 요구사항

### 3.1 성능

| 항목 | 요구사항 | 측정 방법 |
|------|----------|----------|
| 가이드북 초기 로딩 | < 2초 (LCP) | Lighthouse, Vercel Analytics |
| API 응답 시간 | < 500ms (P95) | Vercel Logs |
| 이미지 최적화 | WebP, lazy loading | next/image 자동 최적화 |
| 번들 사이즈 | < 100KB (gzip) | next build 분석 |

### 3.2 보안

| 항목 | 요구사항 |
|------|----------|
| 인증 | Supabase Auth (JWT + Refresh Token) |
| 비밀번호 | Supabase 내장 bcrypt 해싱 |
| HTTPS | Vercel 자동 제공 |
| 입력 검증 | Zod로 서버/클라이언트 양측 검증 |
| RLS | Row Level Security로 데이터 격리 |

### 3.3 확장성

| 항목 | MVP | v2 목표 |
|------|-----|---------|
| 동시 사용자 | 100명 | 1,000명 |
| 가이드북 수 | 100개 | 1,000개 |
| 이미지 스토리지 | 1GB (Supabase 무료) | 10GB |

---

## 4. 외부 API 연동

### 4.1 인증

| 서비스 | 용도 | 필수/선택 | 연동 방식 |
|--------|------|----------|----------|
| Supabase Auth | 이메일 가입/로그인 | 필수 | Supabase SDK |
| Google OAuth | 소셜 로그인 | v2 선택 | Supabase Auth Provider |

### 4.2 기타 서비스

| 서비스 | 용도 | 필수/선택 | 비고 |
|--------|------|----------|------|
| Kakao Maps | 지도 표시, 주소 검색 | MVP 필수 | JavaScript SDK, 무료 30만 호출/월 |
| Vercel Blob | 이미지 업로드 | MVP 선택 | Supabase Storage 대안 |
| Resend | 이메일 발송 | v2 선택 | 인증 메일, 알림 |

---

## 5. 접근제어/권한 모델

### 5.1 역할 정의

| 역할 | 설명 | 권한 |
|------|------|------|
| Guest | 비로그인 (손님) | 가이드북 읽기 전용 |
| Host | 호스트 (유료/무료) | 본인 가이드북 CRUD |
| Admin | 관리자 (v2) | 전체 접근, 사용자 관리 |

### 5.2 권한 매트릭스

| 리소스 | Guest | Host | Admin |
|--------|-------|------|-------|
| 가이드북 조회 (공개) | O | O | O |
| 가이드북 생성 | - | O | O |
| 가이드북 수정 | - | O (본인) | O |
| 가이드북 삭제 | - | O (본인) | O |
| 호스트 프로필 조회 | - | O (본인) | O |
| 호스트 프로필 수정 | - | O (본인) | O |
| 사용자 목록 조회 | - | - | O |

### 5.3 Row Level Security (RLS) 정책

```sql
-- 가이드북 RLS: 공개 가이드북은 누구나 조회, 수정은 본인만
CREATE POLICY "Guidebooks are viewable by everyone"
ON guidebooks FOR SELECT
USING (is_published = true);

CREATE POLICY "Hosts can CRUD own guidebooks"
ON guidebooks FOR ALL
USING (auth.uid() = host_id);
```

---

## 6. 데이터 생명주기

### 6.1 원칙

- **최소 수집**: 이메일, 숙소 정보 등 필요한 데이터만 수집
- **명시적 동의**: 가입 시 개인정보 처리방침 동의
- **보존 기한**: 탈퇴 후 30일 이내 삭제

### 6.2 데이터 흐름

```
수집 → 저장 → 사용 → 보관 → 삭제/익명화
```

| 데이터 유형 | 보존 기간 | 삭제/익명화 |
|------------|----------|------------|
| 호스트 계정 정보 | 탈퇴 후 30일 | 완전 삭제 |
| 가이드북 데이터 | 탈퇴 후 즉시 | 완전 삭제 |
| 손님 접속 로그 | 30일 | 익명화 (통계용) |
| 이미지 파일 | 가이드북 삭제 시 | 완전 삭제 |

---

## 7. 테스트 전략 (Contract-First TDD)

### 7.1 개발 방식: Fullstack TDD

Next.js 풀스택 환경에서의 TDD 방식을 채택합니다.

```
┌─────────────────────────────────────────────────────────────────┐
│                    Contract-First 흐름                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. 타입/스키마 정의 (Phase 0)                                   │
│     ├─ Zod 스키마: src/schemas/*.ts                             │
│     ├─ DB 스키마: src/db/schema.ts (Drizzle)                    │
│     └─ 타입 추출: z.infer<typeof schema>                        │
│                                                                  │
│  2. 테스트 선행 작성 (RED)                                       │
│     ├─ API 테스트: src/__tests__/api/*.test.ts                  │
│     ├─ 컴포넌트 테스트: src/__tests__/components/*.test.tsx     │
│     └─ 모든 테스트가 실패하는 상태 (정상!)                       │
│                                                                  │
│  3. Mock 생성 (컴포넌트 독립 개발용)                             │
│     └─ MSW 핸들러: src/mocks/handlers/*.ts                      │
│                                                                  │
│  4. 구현 (RED→GREEN)                                             │
│     ├─ API Routes: src/app/api/**/route.ts                      │
│     ├─ Server Actions: src/app/actions/*.ts                     │
│     └─ Components: src/components/**/*.tsx                      │
│                                                                  │
│  5. 통합 검증                                                    │
│     └─ E2E 테스트 (Playwright)                                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 테스트 피라미드

| 레벨 | 도구 | 커버리지 목표 | 위치 |
|------|------|-------------|------|
| Unit | Vitest | ≥ 80% | src/__tests__/unit/ |
| Integration | Vitest + MSW | Critical paths | src/__tests__/integration/ |
| E2E | Playwright | Key user flows | e2e/ |

### 7.3 테스트 도구

| 도구 | 용도 |
|------|------|
| Vitest | 테스트 실행 (Jest 호환, 빠른 속도) |
| React Testing Library | 컴포넌트 테스트 |
| MSW (Mock Service Worker) | API 모킹 |
| Playwright | E2E 테스트 |
| @testing-library/user-event | 사용자 이벤트 시뮬레이션 |

### 7.4 테스트 파일 구조

```
src/
├── __tests__/
│   ├── unit/
│   │   ├── schemas/         # Zod 스키마 테스트
│   │   ├── utils/           # 유틸 함수 테스트
│   │   └── hooks/           # 커스텀 훅 테스트
│   ├── integration/
│   │   ├── api/             # API Routes 테스트
│   │   └── components/      # 컴포넌트 통합 테스트
│   └── e2e/
│       └── flows/           # 사용자 플로우 테스트
├── mocks/
│   ├── handlers/            # MSW 핸들러
│   │   ├── auth.ts
│   │   └── guidebook.ts
│   └── data/                # Mock 데이터
└── schemas/                 # Zod 스키마 (테스트 대상)
```

### 7.5 TDD 사이클

모든 기능 개발은 다음 사이클을 따릅니다:

```
🔴 RED     → 실패하는 테스트 먼저 작성
🟢 GREEN   → 테스트를 통과하는 최소한의 코드 구현
🔵 REFACTOR → 테스트 통과 유지하며 코드 개선
```

### 7.6 품질 게이트

**병합 전 필수 통과:**
- [ ] 모든 단위 테스트 통과
- [ ] 커버리지 ≥ 80%
- [ ] ESLint 통과
- [ ] TypeScript 타입 체크 통과
- [ ] E2E 테스트 통과 (해당 기능)

**검증 명령어:**
```bash
# 테스트 실행
pnpm test               # 단위 + 통합 테스트
pnpm test:coverage      # 커버리지 포함
pnpm test:e2e           # E2E 테스트

# 린트 & 타입 체크
pnpm lint               # ESLint
pnpm type-check         # tsc --noEmit

# 전체 검증 (CI용)
pnpm verify             # lint + type-check + test
```

---

## 8. API 설계 원칙

### 8.1 RESTful 규칙

| 메서드 | 용도 | 예시 |
|--------|------|------|
| GET | 조회 | GET /api/guidebooks/{slug} |
| POST | 생성 | POST /api/guidebooks |
| PUT | 전체 수정 | PUT /api/guidebooks/{id} |
| PATCH | 부분 수정 | PATCH /api/guidebooks/{id} |
| DELETE | 삭제 | DELETE /api/guidebooks/{id} |

### 8.2 응답 형식

**성공 응답:**
```json
{
  "data": {
    "id": "uuid",
    "slug": "minjis-house",
    "title": "민지네 숙소"
  }
}
```

**목록 응답:**
```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "pageSize": 10,
    "total": 42
  }
}
```

**에러 응답:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "슬러그는 필수입니다.",
    "details": [
      { "field": "slug", "message": "필수 입력 항목입니다" }
    ]
  }
}
```

### 8.3 API 엔드포인트 목록 (MVP)

| 엔드포인트 | 메서드 | 설명 | 인증 |
|------------|--------|------|------|
| /api/auth/signup | POST | 이메일 가입 | - |
| /api/auth/login | POST | 로그인 | - |
| /api/auth/logout | POST | 로그아웃 | 필수 |
| /api/guidebooks | GET | 내 가이드북 목록 | 필수 |
| /api/guidebooks | POST | 가이드북 생성 | 필수 |
| /api/guidebooks/{id} | GET | 가이드북 상세 | 필수 |
| /api/guidebooks/{id} | PUT | 가이드북 수정 | 필수 |
| /api/guidebooks/{id} | DELETE | 가이드북 삭제 | 필수 |
| /api/public/guidebooks/{slug} | GET | 공개 가이드북 조회 | - |
| /api/upload | POST | 이미지 업로드 | 필수 |

---

## 9. 폴더 구조

```
roomy/
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── (auth)/              # 인증 관련 페이지 그룹
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── (dashboard)/         # 호스트 대시보드 그룹
│   │   │   ├── guidebooks/
│   │   │   └── settings/
│   │   ├── [slug]/              # 공개 가이드북 (동적 라우트)
│   │   │   └── page.tsx         # SSG/ISR
│   │   ├── api/                 # API Routes
│   │   │   ├── auth/
│   │   │   ├── guidebooks/
│   │   │   └── upload/
│   │   ├── layout.tsx
│   │   └── page.tsx             # 랜딩 페이지
│   │
│   ├── components/
│   │   ├── ui/                  # shadcn/ui 컴포넌트
│   │   ├── guidebook/           # 가이드북 관련 컴포넌트
│   │   │   ├── GuidebookView.tsx
│   │   │   ├── InfoBlock.tsx
│   │   │   ├── WifiBlock.tsx
│   │   │   └── MapBlock.tsx
│   │   ├── forms/               # 폼 컴포넌트
│   │   └── layout/              # 레이아웃 컴포넌트
│   │
│   ├── lib/
│   │   ├── supabase/            # Supabase 클라이언트
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   └── middleware.ts
│   │   ├── validations/         # Zod 스키마
│   │   └── utils/               # 유틸리티 함수
│   │
│   ├── db/
│   │   ├── schema.ts            # Drizzle 스키마
│   │   └── migrations/          # DB 마이그레이션
│   │
│   ├── hooks/                   # 커스텀 훅
│   ├── stores/                  # Zustand 스토어
│   ├── types/                   # TypeScript 타입
│   │
│   ├── __tests__/               # 테스트 파일
│   └── mocks/                   # MSW 목 데이터
│
├── e2e/                         # Playwright E2E 테스트
├── public/                      # 정적 파일
├── .env.local                   # 환경 변수
├── drizzle.config.ts            # Drizzle 설정
├── next.config.js               # Next.js 설정
├── tailwind.config.ts           # Tailwind 설정
├── vitest.config.ts             # Vitest 설정
└── package.json
```

---

## Decision Log 참조

| ID | 항목 | 선택 | 근거 |
|----|------|------|------|
| D-05 | 기술 스택 | Next.js + Supabase | 빠른 로딩 필수, 1인 개발 효율, 무료 티어 |
| D-06 | 백엔드 | Next.js API Routes | 별도 서버 불필요, 배포 단순화 |
| D-07 | ORM | Drizzle | 타입 안전, 경량, SQL-like 문법 |
| D-08 | 스타일링 | Tailwind + shadcn/ui | 빠른 UI 개발, 감성적 커스터마이징 |
| D-09 | 지도 | Kakao Maps | 한국 주소 검색 최적화 |
| D-10 | 배포 | Vercel | Next.js 최적화, Edge Runtime |
