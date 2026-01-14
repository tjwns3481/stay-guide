# TRD (기술 요구사항 정의서) - Roomy

> 개발자/AI 코딩 파트너가 참조하는 기술 문서입니다.
> 기술 표현을 사용하되, "왜 이 선택인지"를 함께 설명합니다.

---

## MVP 캡슐

| # | 항목 | 내용 |
|---|------|------|
| 1 | 목표 | 호스트의 시간을 벌어주고 숙소의 브랜드 가치를 높여주는 운영 솔루션 |
| 2 | 페르소나 | 감성 숙소/펜션/에어비앤비 호스트 (디자인과 고객 경험 중시, 반복 문의에 지친 상태) |
| 3 | 핵심 기능 | FEAT-1: 커스텀 에디터 (블록형 안내서 제작/수정) |
| 4 | 성공 지표 (노스스타) | 무료 → 유료 라이선스 전환율 |
| 5 | 입력 지표 | 신규 가입 호스트 수, 안내서 조회 수 |
| 6 | 비기능 요구 | 모바일에서도 PC와 동일한 수준의 에디터 경험 제공 |
| 7 | Out-of-scope | 예약 관리, 결제 시스템 자체 구현, 다크 모드 |
| 8 | Top 리스크 | 모바일 에디터 UX가 복잡해져 진입장벽이 높아질 위험 |
| 9 | 완화/실험 | 5명 이상의 실제 호스트와 프로토타입 테스트 |
| 10 | 다음 단계 | 커스텀 에디터 코어 개발 시작 |

---

## 1. 시스템 아키텍처

### 1.1 고수준 아키텍처

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              Client                                       │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐               │
│  │  Guest View   │  │ Host Editor   │  │ Host Dashboard│               │
│  │  (모바일 웹)  │  │  (반응형 웹)  │  │   (PC/모바일) │               │
│  └───────────────┘  └───────────────┘  └───────────────┘               │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         Next.js (App Router)                              │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │                    Hono API (within Next.js)                       │ │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐              │ │
│  │  │  Auth   │  │  Guide  │  │   AI    │  │ License │              │ │
│  │  │  API    │  │   API   │  │   API   │  │   API   │              │ │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘              │ │
│  └───────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           Supabase                                        │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐               │
│  │  PostgreSQL   │  │   pgvector    │  │  Supabase     │               │
│  │  (JSONB)      │  │   (RAG용)     │  │  Auth         │               │
│  └───────────────┘  └───────────────┘  └───────────────┘               │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        External Services                                  │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐               │
│  │ Naver/Kakao   │  │ Naver Smart   │  │   OpenAI /    │               │
│  │    Map API    │  │    Store      │  │  Anthropic    │               │
│  └───────────────┘  └───────────────┘  └───────────────┘               │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.2 컴포넌트 설명

| 컴포넌트 | 역할 | 왜 이 선택? |
|----------|------|-------------|
| Next.js (App Router) | SSR 프론트엔드 + API 통합 | 빠른 초기 로딩(게스트 이탈 방지), Hono와 통합 운영 가능 |
| Hono + Bun | 경량 API 서버 | 빠른 응답 속도, Next.js API Route 내 통합으로 배포 단순화 |
| Supabase | 데이터베이스 + 인증 | PostgreSQL의 JSONB로 블록 데이터 저장, pgvector로 RAG 지원, 인증 내장 |
| Zustand | 클라이언트 상태 관리 | 에디터의 복잡한 상태 관리에 적합, Redux보다 가벼움 |

---

## 2. 권장 기술 스택

### 2.1 프론트엔드

| 항목 | 선택 | 이유 | 벤더 락인 리스크 |
|------|------|------|-----------------|
| 프레임워크 | Next.js 14+ (App Router) | SSR로 빠른 초기 로딩, 게스트 이탈 방지 | 중간 (Vercel 의존성) |
| 언어 | TypeScript 5.x | 타입 안전성, 에디터 자동완성 | - |
| 스타일링 | TailwindCSS 3.x | 빠른 개발, 반응형 쉬움 | 낮음 |
| 상태관리 | Zustand 4.x | 가볍고 간단, 에디터 상태 관리 적합 | 낮음 |
| HTTP 클라이언트 | fetch (내장) | Next.js와 통합 용이 | 낮음 |
| 드래그앤드롭 | @dnd-kit/core | 블록 순서 변경, 접근성 지원 | 낮음 |
| 폼 관리 | React Hook Form + Zod | 폼 검증, 타입 추론 | 낮음 |

### 2.2 백엔드

| 항목 | 선택 | 이유 | 벤더 락인 리스크 |
|------|------|------|-----------------|
| 프레임워크 | Hono 4.x | 경량, 빠름, Next.js API Route 내 통합 가능 | 낮음 |
| 런타임 | Bun (로컬), Node.js (배포) | Bun으로 빠른 개발 경험, 배포는 Node.js 호환 | 낮음 |
| ORM | Prisma 5.x | TypeScript 친화적, Supabase PostgreSQL 호환 | 중간 |
| 검증 | Zod | 프론트/백 스키마 공유 가능 | 낮음 |
| AI SDK | Vercel AI SDK | 스트리밍 응답, RAG 지원 | 중간 |

### 2.3 데이터베이스

| 항목 | 선택 | 이유 |
|------|------|------|
| 메인 DB | Supabase (PostgreSQL 15+) | JSONB로 블록 데이터 저장, pgvector로 RAG 지원 |
| 벡터 DB | pgvector (Supabase 확장) | AI RAG를 위한 임베딩 저장, 별도 DB 불필요 |
| 파일 저장 | Supabase Storage | 이미지 업로드, CDN 기본 제공 |

### 2.4 인프라

| 항목 | 선택 | 이유 |
|------|------|------|
| 호스팅 | Vercel | Next.js 최적화, Edge Function 지원, 무료 티어 |
| DB 호스팅 | Supabase Cloud | PostgreSQL 관리형, 무료 티어 |
| 도메인 | Vercel / Cloudflare | HTTPS 자동, DNS 관리 |

---

## 3. 비기능 요구사항

### 3.1 성능

| 항목 | 요구사항 | 측정 방법 |
|------|----------|----------|
| 응답 시간 | < 500ms (P95) | API 모니터링 (Vercel Analytics) |
| 초기 로딩 | < 3s (FCP) | Lighthouse |
| 에디터 반응 | < 100ms (입력 지연) | 실제 사용 테스트 |
| 이미지 최적화 | WebP 변환, lazy loading | next/image 활용 |

### 3.2 보안

| 항목 | 요구사항 |
|------|----------|
| 인증 | Supabase Auth (JWT + Refresh Token) |
| 비밀번호 | bcrypt 해싱 (Supabase 내장) |
| HTTPS | 필수 (Vercel 기본 제공) |
| 입력 검증 | Zod로 서버 측 필수 검증 |
| API 인증 | Bearer Token (Supabase RLS 활용) |
| 라이선스 키 | 무작위 생성, 사용 여부 추적 |

### 3.3 확장성

| 항목 | 현재 (MVP) | 목표 (v2) |
|------|------------|----------|
| 동시 사용자 | 100명 | 1,000명 |
| 안내서 수 | 1,000개 | 10,000개 |
| AI 요청 | 1,000회/일 | 10,000회/일 |

---

## 4. 외부 API 연동

### 4.1 인증

| 서비스 | 용도 | 필수/선택 | 연동 방식 |
|--------|------|----------|----------|
| Supabase Auth | 이메일/비밀번호 인증 | 필수 | Supabase SDK |
| Google OAuth | 소셜 로그인 | 선택 | Supabase OAuth |
| Kakao OAuth | 소셜 로그인 | 선택 | Supabase OAuth |

### 4.2 기타 서비스

| 서비스 | 용도 | 필수/선택 | 비고 |
|--------|------|----------|------|
| 네이버 지도 API | 지도 임베드, 길찾기 | 필수 | 월 무료 쿼터 확인 필요 |
| 카카오맵 API | 지도 임베드, 길찾기 | 필수 | 월 무료 쿼터 확인 필요 |
| 네이버 스마트스토어 | 라이선스 키 판매/결제 | 필수 | 키 자동 발급 연동 |
| OpenAI API | AI 컨시어지 (GPT-4o-mini) | 필수 | RAG 응답 생성 |
| Anthropic API | AI 컨시어지 (Claude) | 선택 | 대체 옵션 |

---

## 5. 접근제어·권한 모델

### 5.1 역할 정의

| 역할 | 설명 | 권한 |
|------|------|------|
| Guest | 비로그인 게스트 | 공개 안내서 읽기, AI 컨시어지 사용 (유료 안내서만) |
| Host (Free) | 무료 호스트 | 안내서 생성/수정 (워터마크), 미리보기 |
| Host (Paid) | 유료 호스트 | 안내서 발행, AI 컨시어지 활성화, 워터마크 제거 |
| Admin | 관리자 | 전체 접근, 사용자 관리 |

### 5.2 권한 매트릭스

| 리소스 | Guest | Host (Free) | Host (Paid) | Admin |
|--------|-------|-------------|-------------|-------|
| 안내서 조회 (공개) | O | O | O | O |
| 안내서 생성 | - | O (워터마크) | O | O |
| 안내서 수정 | - | O (본인) | O (본인) | O |
| 안내서 발행 | - | - | O | O |
| AI 컨시어지 | O (유료 안내서) | - | O | O |
| 라이선스 관리 | - | - | O (본인) | O |
| 사용자 관리 | - | - | - | O |

### 5.3 Supabase RLS 정책

```sql
-- 안내서 조회: 발행된 안내서는 누구나 조회 가능
CREATE POLICY "Anyone can view published guides"
ON guides FOR SELECT
USING (status = 'published');

-- 안내서 수정: 소유자만 수정 가능
CREATE POLICY "Hosts can update own guides"
ON guides FOR UPDATE
USING (auth.uid() = user_id);

-- 안내서 생성: 로그인한 사용자만
CREATE POLICY "Authenticated users can create guides"
ON guides FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

---

## 6. 데이터 생명주기

### 6.1 원칙

- **최소 수집**: 필요한 데이터만 수집
- **명시적 동의**: 개인정보 수집 전 동의
- **보존 기한**: 목적 달성 후 삭제

### 6.2 데이터 흐름

```
수집 → 저장 → 사용 → 보관 → 삭제/익명화
```

| 데이터 유형 | 보존 기간 | 삭제/익명화 |
|------------|----------|------------|
| 계정 정보 | 탈퇴 후 30일 | 완전 삭제 |
| 안내서 데이터 | 계정과 동일 | Cascade 삭제 |
| AI 대화 로그 | 30일 | 자동 삭제 |
| 분석 데이터 | 영구 | 익명화된 상태로 보관 |

---

## 7. 테스트 전략 (Contract-First TDD)

### 7.1 개발 방식: Contract-First Development

본 프로젝트는 **계약 우선 개발(Contract-First Development)** 방식을 채택합니다.
BE/FE가 독립적으로 병렬 개발하면서도 통합 시 호환성을 보장합니다.

```
┌─────────────────────────────────────────────────────────────┐
│                    Contract-First 흐름                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. 계약 정의 (Phase 0)                                     │
│     ├─ API 계약: contracts/*.contract.ts                   │
│     ├─ Zod 스키마: shared/schemas/*.ts                     │
│     └─ 타입 동기화: TypeScript ↔ Prisma                    │
│                                                             │
│  2. 테스트 선행 작성 (🔴 RED)                               │
│     ├─ API 테스트: src/__tests__/api/*.test.ts             │
│     ├─ 컴포넌트 테스트: src/__tests__/**/*.test.tsx        │
│     └─ 모든 테스트가 실패하는 상태 (정상!)                  │
│                                                             │
│  3. Mock 생성 (FE 독립 개발용)                              │
│     └─ MSW 핸들러: src/mocks/handlers/*.ts                 │
│                                                             │
│  4. 병렬 구현 (🔴→🟢)                                       │
│     ├─ API: 테스트 통과 목표로 구현                         │
│     └─ FE: Mock API로 개발 → 나중에 실제 API 연결          │
│                                                             │
│  5. 통합 검증                                               │
│     └─ Mock 제거 → E2E 테스트                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 7.2 테스트 피라미드

| 레벨 | 도구 | 커버리지 목표 | 위치 |
|------|------|-------------|------|
| Unit | Vitest | ≥ 80% | src/__tests__/ |
| Integration | Vitest + MSW | Critical paths | src/__tests__/integration/ |
| E2E | Playwright | Key user flows | e2e/ |

### 7.3 테스트 도구

| 도구 | 용도 |
|------|------|
| Vitest | 테스트 실행 (Vite 기반, 빠름) |
| React Testing Library | 컴포넌트 테스트 |
| MSW (Mock Service Worker) | API 모킹 |
| Playwright | E2E 테스트 |
| @testing-library/user-event | 사용자 이벤트 시뮬레이션 |

### 7.4 계약 파일 구조

```
roomy/
├── contracts/                    # API 계약 (공유)
│   ├── types.ts                 # 공통 타입 정의
│   ├── auth.contract.ts         # 인증 API 계약
│   ├── guide.contract.ts        # 안내서 API 계약
│   └── ai.contract.ts           # AI API 계약
│
├── src/
│   ├── app/
│   │   └── api/                 # Hono API Routes
│   │       ├── auth/
│   │       ├── guides/
│   │       └── ai/
│   │
│   ├── components/              # React 컴포넌트
│   ├── stores/                  # Zustand 스토어
│   │
│   ├── mocks/
│   │   ├── handlers/            # MSW Mock 핸들러
│   │   │   ├── auth.ts
│   │   │   ├── guide.ts
│   │   │   └── ai.ts
│   │   └── data/                # Mock 데이터
│   │
│   └── __tests__/
│       ├── api/                 # API 테스트
│       ├── components/          # 컴포넌트 테스트
│       └── integration/         # 통합 테스트
│
├── e2e/                         # E2E 테스트
│   ├── guest-view.spec.ts
│   ├── editor.spec.ts
│   └── ai-chat.spec.ts
│
└── prisma/
    └── schema.prisma            # DB 스키마
```

### 7.5 TDD 사이클

모든 기능 개발은 다음 사이클을 따릅니다:

```
🔴 RED    → 실패하는 테스트 먼저 작성 (Phase 0에서 완료)
🟢 GREEN  → 테스트를 통과하는 최소한의 코드 구현
🔵 REFACTOR → 테스트 통과 유지하며 코드 개선
```

### 7.6 품질 게이트

**병합 전 필수 통과:**
- [ ] 모든 단위 테스트 통과
- [ ] 커버리지 ≥ 80%
- [ ] 린트 통과 (ESLint)
- [ ] 타입 체크 통과 (TypeScript)
- [ ] E2E 테스트 통과 (해당 기능)

**검증 명령어:**
```bash
# 테스트 실행
npm run test

# 커버리지 확인
npm run test:coverage

# 린트
npm run lint

# 타입 체크
npm run type-check

# E2E
npm run e2e
```

---

## 8. API 설계 원칙

### 8.1 RESTful 규칙

| 메서드 | 용도 | 예시 |
|--------|------|------|
| GET | 조회 | GET /api/guides/{slug} |
| POST | 생성 | POST /api/guides |
| PUT | 전체 수정 | PUT /api/guides/{id} |
| PATCH | 부분 수정 | PATCH /api/guides/{id} |
| DELETE | 삭제 | DELETE /api/guides/{id} |

### 8.2 URL 설계

| 엔드포인트 | 설명 |
|-----------|------|
| `/g/{slug}` | 게스트용 안내서 조회 (SSR) |
| `/admin/dashboard` | 호스트 대시보드 |
| `/admin/editor/{id}` | 에디터 페이지 |
| `/api/auth/*` | 인증 API |
| `/api/guides/*` | 안내서 CRUD API |
| `/api/ai/chat` | AI 컨시어지 API |
| `/api/license/verify` | 라이선스 검증 API |

### 8.3 응답 형식

**성공 응답:**
```json
{
  "data": { ... },
  "meta": {
    "page": 1,
    "total": 100
  }
}
```

**에러 응답:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "이메일 형식이 올바르지 않습니다.",
    "details": [
      { "field": "email", "message": "유효한 이메일을 입력하세요" }
    ]
  }
}
```

### 8.4 AI 컨시어지 API

```typescript
// POST /api/ai/chat
interface ChatRequest {
  guideId: string;
  message: string;
  history?: { role: 'user' | 'assistant'; content: string }[];
}

interface ChatResponse {
  message: string;
  sources?: string[]; // 참조한 블록 ID
}
```

---

## 9. 병렬 개발 지원 (Git Worktree)

### 9.1 개요

BE/FE를 완전히 독립된 환경에서 병렬 개발할 때 Git Worktree를 사용합니다.

### 9.2 Worktree 구조

```
~/projects/
├── roomy/                    # 메인 (main 브랜치)
├── roomy-auth/               # Worktree: feature/auth
├── roomy-editor/             # Worktree: feature/editor
├── roomy-ai/                 # Worktree: feature/ai
└── roomy-theme/              # Worktree: feature/theme
```

### 9.3 명령어

```bash
# Worktree 생성
git worktree add ../roomy-auth -b feature/auth
git worktree add ../roomy-editor -b feature/editor

# 각 Worktree에서 독립 작업
cd ../roomy-auth && npm run test
cd ../roomy-editor && npm run test

# 테스트 통과 후 병합
git checkout main
git merge --no-ff feature/auth
git merge --no-ff feature/editor

# Worktree 정리
git worktree remove ../roomy-auth
git worktree remove ../roomy-editor
```

### 9.4 병합 규칙

| 조건 | 병합 가능 |
|------|----------|
| 단위 테스트 통과 (🟢) | 필수 |
| 커버리지 ≥ 80% | 필수 |
| 린트/타입 체크 통과 | 필수 |
| E2E 테스트 통과 | 권장 |

---

## Decision Log

| ID | 항목 | 선택 | 근거 | 영향 |
|----|------|------|------|------|
| TD-01 | 프론트엔드 | Next.js 14+ (App Router) | SSR로 빠른 초기 로딩, 게스트 이탈 방지 | 전체 프론트엔드 구조 |
| TD-02 | 백엔드 | Hono + Next.js API Route | 경량, 빠름, 배포 단순화 | API 개발 방식 |
| TD-03 | 데이터베이스 | Supabase (PostgreSQL + pgvector) | JSONB로 블록 저장, RAG 지원 | DB 설계 |
| TD-04 | 상태 관리 | Zustand | 가볍고 간단, 에디터 상태에 적합 | 프론트엔드 상태 관리 |
| TD-05 | 스타일링 | TailwindCSS | 빠른 개발, 반응형 쉬움 | UI 개발 방식 |
| TD-06 | 인증 | Supabase Auth | 내장 기능 활용, 소셜 로그인 지원 | 인증 구현 |
| TD-07 | AI | Vercel AI SDK + OpenAI | 스트리밍 응답, RAG 지원 | AI 컨시어지 구현 |
