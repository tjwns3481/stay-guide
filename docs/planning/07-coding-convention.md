# Coding Convention & AI Collaboration Guide - Roomy (루미)

> 고품질/유지보수/보안을 위한 인간-AI 협업 운영 지침서입니다.

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

## 1. 핵심 원칙

### 1.1 신뢰하되, 검증하라 (Don't Trust, Verify)

AI가 생성한 코드는 반드시 검증해야 합니다:

- [ ] **코드 리뷰**: 생성된 코드 직접 확인
- [ ] **테스트 실행**: 자동화 테스트 통과 확인
- [ ] **보안 검토**: 민감 정보 노출 여부 확인
- [ ] **동작 확인**: 실제로 실행하여 기대 동작 확인

### 1.2 최종 책임은 인간에게

- AI는 도구이고, 최종 결정과 책임은 개발자에게 있습니다
- 이해하지 못하는 코드는 사용하지 않습니다
- 의심스러운 부분은 반드시 질문합니다

### 1.3 단순함 우선

- 복잡한 추상화보다 명확한 코드 선호
- 미래 확장보다 현재 요구사항 해결 집중
- 한 번에 하나의 기능만 구현

---

## 2. 프로젝트 구조

### 2.1 디렉토리 구조 (Next.js App Router)

```
roomy/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── (auth)/                 # 인증 관련 라우트 그룹
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── signup/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx          # 인증 페이지 공통 레이아웃
│   │   │
│   │   ├── (dashboard)/            # 호스트 대시보드 라우트 그룹
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx        # 대시보드 메인
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx    # 새 가이드북 생성
│   │   │   │   ├── [id]/
│   │   │   │   │   └── edit/
│   │   │   │   │       └── page.tsx # 가이드북 편집
│   │   │   │   └── settings/
│   │   │   │       └── page.tsx    # 설정
│   │   │   └── layout.tsx          # 대시보드 공통 레이아웃
│   │   │
│   │   ├── [slug]/                 # 공개 가이드북 (동적 라우트)
│   │   │   └── page.tsx            # SSG/ISR
│   │   │
│   │   ├── api/                    # API Routes
│   │   │   ├── auth/
│   │   │   │   ├── signup/
│   │   │   │   │   └── route.ts
│   │   │   │   └── [...supabase]/
│   │   │   │       └── route.ts    # Supabase Auth 콜백
│   │   │   ├── guidebooks/
│   │   │   │   ├── route.ts        # GET (목록), POST (생성)
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts    # GET, PUT, DELETE
│   │   │   └── upload/
│   │   │       └── route.ts        # 이미지 업로드
│   │   │
│   │   ├── layout.tsx              # 루트 레이아웃
│   │   ├── page.tsx                # 랜딩 페이지
│   │   ├── not-found.tsx           # 404 페이지
│   │   └── error.tsx               # 에러 페이지
│   │
│   ├── components/
│   │   ├── ui/                     # shadcn/ui 컴포넌트
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   └── ...
│   │   ├── guidebook/              # 가이드북 관련 컴포넌트
│   │   │   ├── GuidebookView.tsx   # 가이드북 전체 뷰
│   │   │   ├── GuidebookHeader.tsx # 헤더 (숙소명, 사진)
│   │   │   ├── InfoBlock.tsx       # 정보 블록 컨테이너
│   │   │   ├── WifiBlock.tsx       # 와이파이 블록
│   │   │   ├── MapBlock.tsx        # 지도 블록
│   │   │   ├── CheckinBlock.tsx    # 체크인/아웃 블록
│   │   │   └── RecommendationBlock.tsx # 추천 블록
│   │   ├── forms/                  # 폼 컴포넌트
│   │   │   ├── GuidebookForm.tsx
│   │   │   ├── InfoBlockForm.tsx
│   │   │   └── AuthForm.tsx
│   │   └── layout/                 # 레이아웃 컴포넌트
│   │       ├── Header.tsx
│   │       ├── Footer.tsx
│   │       └── Sidebar.tsx
│   │
│   ├── lib/
│   │   ├── supabase/               # Supabase 클라이언트
│   │   │   ├── client.ts           # 클라이언트 사이드
│   │   │   ├── server.ts           # 서버 사이드
│   │   │   └── middleware.ts       # 미들웨어용
│   │   ├── validations/            # Zod 스키마
│   │   │   ├── auth.ts
│   │   │   ├── guidebook.ts
│   │   │   └── info-block.ts
│   │   └── utils/                  # 유틸리티 함수
│   │       ├── cn.ts               # className 병합
│   │       ├── format.ts           # 포맷팅
│   │       └── clipboard.ts        # 클립보드 복사
│   │
│   ├── db/
│   │   ├── schema.ts               # Drizzle 스키마
│   │   ├── index.ts                # DB 클라이언트
│   │   └── migrations/             # 마이그레이션
│   │
│   ├── hooks/                      # 커스텀 훅
│   │   ├── useAuth.ts
│   │   ├── useGuidebook.ts
│   │   └── useCopyToClipboard.ts
│   │
│   ├── stores/                     # Zustand 스토어
│   │   ├── auth.ts
│   │   └── guidebook-editor.ts
│   │
│   ├── types/                      # TypeScript 타입
│   │   ├── database.ts             # DB 스키마 기반 타입
│   │   ├── api.ts                  # API 요청/응답 타입
│   │   └── guidebook.ts            # 가이드북 관련 타입
│   │
│   ├── __tests__/                  # 테스트 파일
│   │   ├── unit/
│   │   ├── integration/
│   │   └── e2e/
│   │
│   └── mocks/                      # MSW 목 데이터
│       ├── handlers/
│       └── data/
│
├── public/
│   ├── images/
│   └── fonts/
│
├── docs/
│   └── planning/                   # 기획 문서
│       ├── 01-prd.md
│       ├── 02-trd.md
│       ├── 03-user-flow.md
│       ├── 04-database-design.md
│       ├── 05-design-system.md
│       ├── 06-tasks.md
│       └── 07-coding-convention.md
│
├── e2e/                            # Playwright E2E 테스트
│
├── .env.local                      # 환경 변수 (gitignore)
├── .env.example                    # 환경 변수 예시
├── drizzle.config.ts               # Drizzle 설정
├── next.config.js                  # Next.js 설정
├── tailwind.config.ts              # Tailwind 설정
├── vitest.config.ts                # Vitest 설정
├── playwright.config.ts            # Playwright 설정
├── tsconfig.json                   # TypeScript 설정
└── package.json
```

### 2.2 네이밍 규칙

| 대상 | 규칙 | 예시 |
|------|------|------|
| **파일 (컴포넌트)** | PascalCase | `GuidebookView.tsx` |
| **파일 (훅)** | camelCase + use 접두사 | `useAuth.ts` |
| **파일 (유틸)** | camelCase | `formatDate.ts` |
| **파일 (스키마)** | camelCase | `guidebook.ts` |
| **폴더** | kebab-case | `info-block/` |
| **컴포넌트** | PascalCase | `GuidebookView` |
| **함수/변수** | camelCase | `getGuidebookBySlug` |
| **상수** | UPPER_SNAKE_CASE | `MAX_BLOCKS_COUNT` |
| **타입/인터페이스** | PascalCase | `Guidebook`, `InfoBlockType` |
| **Zod 스키마** | camelCase + Schema 접미사 | `guidebookSchema` |
| **API 라우트** | kebab-case | `/api/guidebooks/[id]` |

### 2.3 파일 크기 제한

| 대상 | 권장 최대 줄 | 초과 시 |
|------|-------------|---------|
| 컴포넌트 | 150줄 | 하위 컴포넌트로 분리 |
| 훅 | 100줄 | 로직 분리 |
| 유틸 함수 | 50줄 | 헬퍼 함수로 분리 |
| API 라우트 | 100줄 | 서비스 레이어로 분리 |

---

## 3. TypeScript 규칙

### 3.1 타입 정의

```typescript
// 1. 인터페이스 vs 타입: 객체는 interface, 유니온/튜플은 type
interface Guidebook {
  id: string;
  slug: string;
  title: string;
  hostId: string;
}

type InfoBlockType = 'wifi' | 'map' | 'checkin' | 'recommendation' | 'custom';

// 2. Props 타입: 컴포넌트명 + Props
interface GuidebookViewProps {
  guidebook: Guidebook;
  blocks: InfoBlock[];
}

// 3. Zod 스키마에서 타입 추출
import { z } from 'zod';

export const guidebookSchema = z.object({
  slug: z.string().min(3).max(50),
  title: z.string().min(1).max(100),
});

export type GuidebookInput = z.infer<typeof guidebookSchema>;
```

### 3.2 타입 안전성

```typescript
// ❌ Bad: any 사용
const data: any = await fetchData();

// ✅ Good: 명시적 타입
const data: Guidebook = await fetchData();

// ❌ Bad: 타입 단언 남용
const block = data as WifiBlock;

// ✅ Good: 타입 가드 사용
function isWifiBlock(block: InfoBlock): block is WifiBlock {
  return block.type === 'wifi';
}

if (isWifiBlock(block)) {
  console.log(block.content.ssid); // 타입 안전
}
```

### 3.3 Null 처리

```typescript
// ❌ Bad: 옵셔널 체이닝 남용
const name = user?.profile?.name?.first;

// ✅ Good: 명시적 null 체크
if (!user) {
  redirect('/login');
}
const name = user.profile.name.first;

// ✅ Good: nullish coalescing
const displayName = user.name ?? 'Guest';
```

---

## 4. React/Next.js 규칙

### 4.1 컴포넌트 구조

```typescript
// 1. 파일 구조
// components/guidebook/WifiBlock.tsx

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import type { WifiBlockContent } from '@/types/guidebook';

// 2. Props 인터페이스
interface WifiBlockProps {
  content: WifiBlockContent;
}

// 3. 컴포넌트 정의
export function WifiBlock({ content }: WifiBlockProps) {
  const { copy, copied } = useCopyToClipboard();

  const handleCopy = () => {
    copy(content.password);
  };

  return (
    <div className="bg-surface rounded-xl p-4">
      <h3 className="font-semibold mb-3">와이파이</h3>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-muted">이름</span>
          <span className="font-medium">{content.ssid}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted">비밀번호</span>
          <div className="flex items-center gap-2">
            <span className="font-mono">{content.password}</span>
            <Button variant="ghost" size="icon" onClick={handleCopy}>
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 4.2 Server vs Client 컴포넌트

```typescript
// 1. Server Component (기본값) - 데이터 페칭
// app/[slug]/page.tsx
import { getGuidebookBySlug } from '@/lib/api';
import { GuidebookView } from '@/components/guidebook/GuidebookView';

export default async function GuidebookPage({ params }: { params: { slug: string } }) {
  const guidebook = await getGuidebookBySlug(params.slug);

  if (!guidebook) {
    notFound();
  }

  return <GuidebookView guidebook={guidebook} />;
}

// 2. Client Component - 인터랙션이 필요한 경우
// components/guidebook/WifiBlock.tsx
'use client';

import { useState } from 'react';
// ... 인터랙티브 로직
```

### 4.3 데이터 페칭 패턴

```typescript
// 1. Server Component에서 직접 페칭 (권장)
// app/[slug]/page.tsx
export default async function Page({ params }: { params: { slug: string } }) {
  const guidebook = await db
    .select()
    .from(guidebooks)
    .where(eq(guidebooks.slug, params.slug))
    .limit(1);

  return <GuidebookView guidebook={guidebook[0]} />;
}

// 2. Server Action (폼 처리)
// app/actions/guidebook.ts
'use server';

import { revalidatePath } from 'next/cache';

export async function createGuidebook(formData: FormData) {
  const data = guidebookSchema.parse({
    title: formData.get('title'),
    slug: formData.get('slug'),
  });

  await db.insert(guidebooks).values(data);
  revalidatePath('/dashboard');
}

// 3. Client에서 API 호출 (복잡한 인터랙션)
// hooks/useGuidebook.ts
'use client';

export function useGuidebook(id: string) {
  const [guidebook, setGuidebook] = useState<Guidebook | null>(null);

  useEffect(() => {
    fetch(`/api/guidebooks/${id}`)
      .then((res) => res.json())
      .then(setGuidebook);
  }, [id]);

  return guidebook;
}
```

---

## 5. API 설계 규칙

### 5.1 API Route 구조

```typescript
// app/api/guidebooks/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { guidebookSchema } from '@/lib/validations/guidebook';
import { db } from '@/db';
import { guidebooks } from '@/db/schema';

// GET /api/guidebooks - 목록 조회
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
        { status: 401 }
      );
    }

    const result = await db
      .select()
      .from(guidebooks)
      .where(eq(guidebooks.hostId, user.id));

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error('GET /api/guidebooks error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}

// POST /api/guidebooks - 생성
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = guidebookSchema.parse(body);

    const [newGuidebook] = await db
      .insert(guidebooks)
      .values({ ...validatedData, hostId: user.id })
      .returning();

    return NextResponse.json({ data: newGuidebook }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: '입력값이 올바르지 않습니다.',
            details: error.errors,
          },
        },
        { status: 400 }
      );
    }

    console.error('POST /api/guidebooks error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}
```

### 5.2 응답 형식

```typescript
// 성공 응답
interface SuccessResponse<T> {
  data: T;
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
  };
}

// 에러 응답
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown[];
  };
}

// 에러 코드
type ErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'CONFLICT'
  | 'INTERNAL_ERROR';
```

---

## 6. 보안 체크리스트

### 6.1 절대 금지

- [ ] **비밀정보 하드코딩 금지** (API 키, 비밀번호, Supabase URL 등)
- [ ] **.env 파일 커밋 금지** (.gitignore 확인)
- [ ] **SQL 직접 조합 금지** (Drizzle ORM 사용)
- [ ] **사용자 입력 직접 렌더링 금지** (XSS 방지)

### 6.2 필수 적용

- [ ] **모든 입력 Zod로 검증** (서버 측)
- [ ] **인증 미들웨어 적용** (보호된 라우트)
- [ ] **RLS 정책 활성화** (Supabase)
- [ ] **HTTPS 사용** (Vercel 자동 적용)
- [ ] **CORS 설정** (Next.js 기본)

### 6.3 환경 변수 관리

```bash
# .env.example (커밋 O)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
NEXT_PUBLIC_KAKAO_MAP_KEY=your-kakao-key-here

# .env.local (커밋 X)
NEXT_PUBLIC_SUPABASE_URL=https://actual-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=actual-anon-key
SUPABASE_SERVICE_ROLE_KEY=actual-service-role-key
NEXT_PUBLIC_KAKAO_MAP_KEY=actual-kakao-key
```

---

## 7. 테스트 워크플로우

### 7.1 테스트 파일 위치

```
src/__tests__/
├── unit/
│   ├── lib/
│   │   └── validations/
│   │       └── guidebook.test.ts    # Zod 스키마 테스트
│   └── hooks/
│       └── useCopyToClipboard.test.ts
├── integration/
│   ├── api/
│   │   └── guidebooks.test.ts       # API 라우트 테스트
│   └── components/
│       └── WifiBlock.test.tsx       # 컴포넌트 테스트
└── e2e/
    └── guidebook-creation.spec.ts   # E2E 테스트
```

### 7.2 테스트 실행 명령어

```bash
# 단위 + 통합 테스트
pnpm test

# watch 모드
pnpm test:watch

# 커버리지
pnpm test:coverage

# E2E 테스트
pnpm test:e2e

# 특정 파일만
pnpm test -- guidebook

# 전체 검증 (CI)
pnpm verify
```

### 7.3 테스트 작성 예시

```typescript
// src/__tests__/unit/lib/validations/guidebook.test.ts
import { describe, it, expect } from 'vitest';
import { guidebookSchema } from '@/lib/validations/guidebook';

describe('guidebookSchema', () => {
  it('유효한 데이터를 통과시킨다', () => {
    const validData = {
      slug: 'my-house',
      title: '민지네 숙소',
    };

    const result = guidebookSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('slug가 3자 미만이면 실패한다', () => {
    const invalidData = {
      slug: 'ab',
      title: '민지네 숙소',
    };

    const result = guidebookSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});

// src/__tests__/integration/components/WifiBlock.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WifiBlock } from '@/components/guidebook/WifiBlock';

describe('WifiBlock', () => {
  it('와이파이 정보를 표시한다', () => {
    render(
      <WifiBlock
        content={{ ssid: 'TestWifi', password: 'test1234' }}
      />
    );

    expect(screen.getByText('TestWifi')).toBeInTheDocument();
    expect(screen.getByText('test1234')).toBeInTheDocument();
  });

  it('복사 버튼 클릭 시 비밀번호를 복사한다', async () => {
    const user = userEvent.setup();

    render(
      <WifiBlock
        content={{ ssid: 'TestWifi', password: 'test1234' }}
      />
    );

    const copyButton = screen.getByRole('button');
    await user.click(copyButton);

    // 복사 성공 시 체크 아이콘으로 변경
    expect(screen.getByTestId('check-icon')).toBeInTheDocument();
  });
});
```

---

## 8. Git 워크플로우

### 8.1 브랜치 전략

```
main                    # 프로덕션
├── develop             # 개발 통합
│   ├── feature/feat-0-auth           # 인증 기능
│   ├── feature/feat-1-info-blocks    # 정보 블록
│   ├── feature/feat-2-guidebook-view # 가이드북 뷰
│   ├── feature/feat-3-dashboard      # 대시보드
│   └── fix/wifi-copy-button          # 버그 수정
```

### 8.2 커밋 메시지 규칙

```
<type>(<scope>): <subject>

<body>

<footer>
```

**타입:**
| 타입 | 설명 |
|------|------|
| `feat` | 새 기능 |
| `fix` | 버그 수정 |
| `refactor` | 리팩토링 |
| `style` | 포맷팅, 세미콜론 등 |
| `docs` | 문서 |
| `test` | 테스트 |
| `chore` | 빌드, 설정 등 |

**예시:**
```
feat(guidebook): 와이파이 블록 복사 기능 추가

- useCopyToClipboard 훅 구현
- WifiBlock 컴포넌트에 복사 버튼 추가
- 복사 성공 시 토스트 표시

Closes #12
```

### 8.3 PR 규칙

- [ ] 테스트 통과 확인
- [ ] 린트 통과 확인
- [ ] 타입 체크 통과 확인
- [ ] 자기 리뷰 완료
- [ ] 관련 이슈 링크

---

## 9. AI 소통 원칙

### 9.1 효과적인 요청

**좋은 예:**
```
TASKS.md의 T1.2(와이파이 블록 컴포넌트)를 구현해주세요.

참조:
- PRD의 FEAT-1 사용자 스토리
- Database Design의 info_blocks.content 구조
- Design System의 카드 컴포넌트 스타일

요구사항:
- 복사 버튼 클릭 시 클립보드에 비밀번호 복사
- 복사 성공 시 체크 아이콘으로 2초간 변경
- 모바일 터치 영역 44px 이상
```

**나쁜 예:**
```
와이파이 컴포넌트 만들어줘
```

### 9.2 오류 보고 템플릿

```
## 에러
TypeError: Cannot read property 'password' of undefined

## 코드
// components/guidebook/WifiBlock.tsx:15
const password = content.password;

## 재현 단계
1. 대시보드에서 새 가이드북 생성
2. 와이파이 블록 추가
3. 저장 없이 미리보기 클릭

## 시도한 것
- content가 undefined인지 확인 → undefined임
- API 응답 확인 → blocks 배열이 비어있음

## 예상 원인
새로 생성된 가이드북에 blocks가 없어서 발생하는 것 같음
```

### 9.3 컨텍스트 유지

- 한 대화에서 하나의 기능만 구현
- 기존 코드 변경 시 해당 파일 전체 공유
- 관련 문서 섹션 명시

---

## 10. 코드 품질 도구

### 10.1 설정 파일

**ESLint (.eslintrc.cjs):**
```javascript
module.exports = {
  extends: [
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
  },
};
```

**Prettier (.prettierrc):**
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

### 10.2 검증 스크립트 (package.json)

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "type-check": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "verify": "pnpm lint && pnpm type-check && pnpm test",
    "db:generate": "drizzle-kit generate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  }
}
```

---

## Decision Log 참조

| ID | 항목 | 선택 | 근거 |
|----|------|------|------|
| D-05 | 기술 스택 | Next.js + Supabase | 빠른 로딩, 1인 개발 효율 |
| D-06 | 백엔드 | Next.js API Routes | 배포 단순화 |
| D-07 | ORM | Drizzle | 타입 안전, 경량 |
| D-23 | 컴포넌트 | shadcn/ui | Tailwind 기반, 커스터마이징 용이 |
| D-24 | 테스트 | Vitest + Playwright | 빠른 속도, Next.js 호환 |
| D-25 | 상태 관리 | Zustand | 경량, 간단한 API |
