# Coding Convention & AI Collaboration Guide - Roomy

> 고품질/유지보수/보안을 위한 인간-AI 협업 운영 지침서입니다.

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

### 1.3 Contract-First TDD

- 계약(API 스키마)을 먼저 정의
- 테스트를 먼저 작성 (RED)
- 테스트를 통과하는 코드 구현 (GREEN)
- 리팩토링 (REFACTOR)

---

## 2. 프로젝트 구조

### 2.1 디렉토리 구조

```
roomy/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (guest)/              # 게스트 라우트 그룹
│   │   │   └── g/[slug]/         # 안내서 페이지
│   │   ├── (host)/               # 호스트 라우트 그룹
│   │   │   ├── admin/            # 대시보드
│   │   │   │   ├── dashboard/
│   │   │   │   ├── editor/[id]/
│   │   │   │   └── settings/
│   │   │   └── layout.tsx        # 인증 필요 레이아웃
│   │   ├── api/                  # Hono API Routes
│   │   │   ├── auth/
│   │   │   ├── guides/
│   │   │   ├── blocks/
│   │   │   └── ai/
│   │   ├── layout.tsx
│   │   └── page.tsx              # 랜딩 페이지
│   │
│   ├── components/               # 재사용 컴포넌트
│   │   ├── ui/                   # 기본 UI (Button, Input, Card...)
│   │   ├── editor/               # 에디터 컴포넌트
│   │   ├── blocks/               # 블록 컴포넌트
│   │   ├── guest/                # 게스트용 컴포넌트
│   │   └── layouts/              # 레이아웃 컴포넌트
│   │
│   ├── hooks/                    # 커스텀 훅
│   │   ├── useGuide.ts
│   │   ├── useBlocks.ts
│   │   └── useAuth.ts
│   │
│   ├── stores/                   # Zustand 스토어
│   │   ├── editorStore.ts
│   │   └── authStore.ts
│   │
│   ├── lib/                      # 유틸리티, 설정
│   │   ├── supabase/
│   │   │   ├── client.ts         # 클라이언트 생성
│   │   │   └── server.ts         # 서버 컴포넌트용
│   │   ├── ai/
│   │   │   ├── embeddings.ts
│   │   │   └── chat.ts
│   │   └── utils/
│   │       ├── cn.ts             # className 유틸
│   │       └── slug.ts           # 슬러그 생성
│   │
│   ├── types/                    # TypeScript 타입
│   │   ├── guide.ts
│   │   ├── block.ts
│   │   └── api.ts
│   │
│   ├── mocks/                    # MSW Mock
│   │   ├── handlers/
│   │   └── data/
│   │
│   └── __tests__/                # 테스트
│       ├── components/
│       ├── hooks/
│       └── api/
│
├── contracts/                    # API 계약
│   ├── types.ts
│   ├── guide.contract.ts
│   └── ai.contract.ts
│
├── prisma/
│   └── schema.prisma
│
├── e2e/                          # E2E 테스트
│   ├── guest.spec.ts
│   ├── editor.spec.ts
│   └── ai-chat.spec.ts
│
├── docs/
│   └── planning/                 # 기획 문서
│       ├── 01-prd.md
│       ├── 02-trd.md
│       ├── 03-user-flow.md
│       ├── 04-database-design.md
│       ├── 05-design-system.md
│       ├── 06-tasks.md
│       └── 07-coding-convention.md
│
├── public/
├── .env.example
├── .env.local                    # 커밋 X
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── vitest.config.ts
```

### 2.2 네이밍 규칙

| 대상 | 규칙 | 예시 |
|------|------|------|
| 파일 (컴포넌트) | PascalCase | `GuideEditor.tsx` |
| 파일 (훅) | camelCase + use | `useGuide.ts` |
| 파일 (유틸) | camelCase | `formatDate.ts` |
| 파일 (테스트) | 원본명 + .test | `GuideEditor.test.tsx` |
| 컴포넌트 | PascalCase | `GuideEditor` |
| 함수/변수 | camelCase | `getGuideBySlug` |
| 상수 | UPPER_SNAKE | `MAX_BLOCKS_COUNT` |
| 타입/인터페이스 | PascalCase | `GuideBlock` |
| Zustand 스토어 | camelCase + Store | `editorStore` |
| API 라우트 | kebab-case | `/api/guides` |

---

## 3. 아키텍처 원칙

### 3.1 뼈대 먼저 (Skeleton First)

1. 전체 구조를 먼저 잡고
2. 빈 함수/컴포넌트로 스켈레톤 생성
3. 하나씩 구현 채워나가기

### 3.2 작은 모듈로 분해

- 한 파일에 **200줄 이하** 권장
- 한 함수에 **50줄 이하** 권장
- 한 컴포넌트에 **100줄 이하** 권장

### 3.3 관심사 분리

| 레이어 | 역할 | 위치 |
|--------|------|------|
| UI | 화면 표시 | `components/` |
| 상태 | 데이터 관리 | `stores/` |
| 비즈니스 로직 | API 호출, 데이터 처리 | `hooks/`, `lib/` |
| 타입 | 타입 정의 | `types/` |

### 3.4 컴포넌트 설계 원칙

```tsx
// 좋은 예: 관심사 분리
// components/editor/BlockList.tsx
export function BlockList({ guideId }: { guideId: string }) {
  const { blocks, reorderBlocks } = useBlocks(guideId);

  return (
    <DndContext onDragEnd={handleDragEnd}>
      {blocks.map((block) => (
        <BlockItem key={block.id} block={block} />
      ))}
    </DndContext>
  );
}

// 나쁜 예: 모든 로직이 한 곳에
export function BlockList({ guideId }: { guideId: string }) {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/guides/${guideId}/blocks`)
      .then(res => res.json())
      .then(data => {
        setBlocks(data);
        setLoading(false);
      });
  }, [guideId]);

  // ... 200줄 이상의 로직
}
```

---

## 4. AI 소통 원칙

### 4.1 하나의 채팅 = 하나의 작업

- 한 번에 하나의 명확한 작업만 요청
- 작업 완료 후 다음 작업 진행
- 컨텍스트가 길어지면 새 대화 시작

### 4.2 컨텍스트 명시

**좋은 예:**
> "TASKS 문서의 T2.1을 구현해주세요.
> Database Design의 guides 테이블을 참조하고,
> TRD의 기술 스택(Next.js + Hono + Prisma)을 따라주세요."

**나쁜 예:**
> "에디터 만들어줘"

### 4.3 기존 코드 재사용

- 새로 만들기 전에 기존 코드 확인 요청
- 중복 코드 방지
- 일관성 유지

### 4.4 프롬프트 템플릿

```markdown
## 작업
{{무엇을 해야 하는지}}

## 참조 문서
- {{문서명}} 섹션 {{번호}}

## 제약 조건
- {{지켜야 할 것}}

## 예상 결과
- {{생성될 파일}}
- {{기대 동작}}
```

---

## 5. 코드 스타일

### 5.1 TypeScript

```typescript
// 인터페이스 정의
interface Guide {
  id: string;
  slug: string;
  title: string;
  status: 'draft' | 'published';
  theme: GuideTheme;
  blocks: Block[];
}

// 유니온 타입으로 블록 타입 정의
type BlockType =
  | 'hero'
  | 'quick_info'
  | 'amenities'
  | 'map'
  | 'host_pick'
  | 'notice';

// 제네릭 활용
interface ApiResponse<T> {
  data: T;
  meta?: {
    page: number;
    total: number;
  };
}
```

### 5.2 React 컴포넌트

```tsx
// 함수형 컴포넌트 + Props 타입
interface BlockItemProps {
  block: Block;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function BlockItem({ block, onEdit, onDelete }: BlockItemProps) {
  // 이벤트 핸들러는 handle 접두사
  const handleEdit = () => {
    onEdit(block.id);
  };

  // 조건부 렌더링
  if (!block.isVisible) {
    return null;
  }

  return (
    <div className="rounded-xl border p-4">
      {/* 내용 */}
    </div>
  );
}
```

### 5.3 커스텀 훅

```typescript
// hooks/useGuide.ts
export function useGuide(slug: string) {
  const [guide, setGuide] = useState<Guide | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchGuide() {
      try {
        setLoading(true);
        const response = await fetch(`/api/guides/${slug}`);
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setGuide(data);
      } catch (e) {
        setError(e as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchGuide();
  }, [slug]);

  return { guide, loading, error };
}
```

### 5.4 Zustand 스토어

```typescript
// stores/editorStore.ts
import { create } from 'zustand';

interface EditorState {
  guide: Guide | null;
  selectedBlockId: string | null;
  isDirty: boolean;

  // Actions
  setGuide: (guide: Guide) => void;
  selectBlock: (id: string | null) => void;
  updateBlock: (id: string, content: BlockContent) => void;
  reorderBlocks: (from: number, to: number) => void;
  markAsDirty: () => void;
  markAsClean: () => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  guide: null,
  selectedBlockId: null,
  isDirty: false,

  setGuide: (guide) => set({ guide }),

  selectBlock: (id) => set({ selectedBlockId: id }),

  updateBlock: (id, content) => {
    const { guide } = get();
    if (!guide) return;

    const blocks = guide.blocks.map((block) =>
      block.id === id ? { ...block, content } : block
    );

    set({ guide: { ...guide, blocks }, isDirty: true });
  },

  reorderBlocks: (from, to) => {
    const { guide } = get();
    if (!guide) return;

    const blocks = [...guide.blocks];
    const [removed] = blocks.splice(from, 1);
    blocks.splice(to, 0, removed);

    set({ guide: { ...guide, blocks }, isDirty: true });
  },

  markAsDirty: () => set({ isDirty: true }),
  markAsClean: () => set({ isDirty: false }),
}));
```

---

## 6. API 스타일 (Hono)

```typescript
// src/app/api/guides/[id]/route.ts
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const app = new Hono()
  // GET /api/guides/:id
  .get('/:id', async (c) => {
    const id = c.req.param('id');

    const guide = await prisma.guide.findUnique({
      where: { id },
      include: { blocks: { orderBy: { orderIndex: 'asc' } } },
    });

    if (!guide) {
      return c.json({ error: { code: 'NOT_FOUND', message: '안내서를 찾을 수 없습니다.' } }, 404);
    }

    return c.json({ data: guide });
  })

  // PATCH /api/guides/:id
  .patch(
    '/:id',
    zValidator('json', z.object({
      title: z.string().optional(),
      theme: z.object({}).optional(),
      status: z.enum(['draft', 'published']).optional(),
    })),
    async (c) => {
      const id = c.req.param('id');
      const body = c.req.valid('json');

      const guide = await prisma.guide.update({
        where: { id },
        data: body,
      });

      return c.json({ data: guide });
    }
  );

export const GET = app.fetch;
export const PATCH = app.fetch;
```

---

## 7. 보안 체크리스트

### 7.1 절대 금지

- [ ] 비밀정보 하드코딩 금지 (API 키, 비밀번호, 토큰)
- [ ] `.env` 파일 커밋 금지
- [ ] SQL 직접 문자열 조합 금지 (SQL Injection)
- [ ] 사용자 입력 그대로 출력 금지 (XSS)

### 7.2 필수 적용

- [ ] 모든 사용자 입력 Zod로 검증 (서버 측)
- [ ] Supabase RLS로 권한 제어
- [ ] HTTPS 사용 (Vercel 기본)
- [ ] CORS 설정 (필요한 도메인만)

### 7.3 환경 변수 관리

```bash
# .env.example (커밋 O)
DATABASE_URL=postgresql://user:password@localhost:5432/roomy
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
OPENAI_API_KEY=sk-xxx

# .env.local (커밋 X)
DATABASE_URL=postgresql://real:real@prod:5432/roomy
# ... 실제 값
```

---

## 8. 테스트 워크플로우

### 8.1 테스트 명령어

```bash
# 단위 테스트
npm run test

# 커버리지 포함
npm run test:coverage

# 특정 파일만
npm run test -- src/__tests__/components/BlockItem.test.tsx

# Watch 모드
npm run test:watch

# E2E 테스트
npm run e2e

# E2E UI 모드
npm run e2e:ui
```

### 8.2 테스트 파일 구조

```typescript
// src/__tests__/components/BlockItem.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { BlockItem } from '@/components/editor/BlockItem';
import { mockBlock } from '@/mocks/data/blocks';

describe('BlockItem', () => {
  it('블록 제목을 표시한다', () => {
    render(<BlockItem block={mockBlock} onEdit={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByText(mockBlock.content.title)).toBeInTheDocument();
  });

  it('편집 버튼 클릭 시 onEdit이 호출된다', () => {
    const onEdit = vi.fn();
    render(<BlockItem block={mockBlock} onEdit={onEdit} onDelete={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /편집/i }));

    expect(onEdit).toHaveBeenCalledWith(mockBlock.id);
  });
});
```

### 8.3 오류 로그 공유 규칙

오류 발생 시 AI에게 전달할 정보:

1. 전체 에러 메시지
2. 관련 코드 스니펫
3. 재현 단계
4. 이미 시도한 해결책

**예시:**
```markdown
## 에러
TypeError: Cannot read property 'blocks' of undefined

## 코드
const { blocks } = guide;  // guide가 undefined

## 재현
1. 에디터 페이지 진입
2. guideId가 잘못된 경우

## 시도한 것
- guide가 undefined인지 확인 → 맞음
- API 응답 확인 → 404 반환 중
```

---

## 9. Git 워크플로우

### 9.1 브랜치 전략

```
main              # 프로덕션
├── develop       # 개발 통합 (선택)
│   ├── feature/feat-0-auth
│   ├── feature/feat-1-editor
│   ├── feature/feat-2-blocks
│   └── fix/block-order-bug
```

### 9.2 브랜치 네이밍

| 접두사 | 용도 | 예시 |
|--------|------|------|
| `feature/` | 새 기능 | `feature/feat-1-editor` |
| `fix/` | 버그 수정 | `fix/wifi-copy-button` |
| `refactor/` | 리팩토링 | `refactor/block-types` |
| `docs/` | 문서 | `docs/api-readme` |
| `test/` | 테스트 | `test/editor-coverage` |

### 9.3 커밋 메시지

```
<type>(<scope>): <subject>

<body>
```

**타입:**
- `feat`: 새 기능
- `fix`: 버그 수정
- `refactor`: 리팩토링
- `docs`: 문서
- `test`: 테스트
- `chore`: 기타

**예시:**
```
feat(editor): 블록 드래그앤드롭 구현

- @dnd-kit 라이브러리 적용
- 블록 순서 변경 API 연동
- User Flow 문서 S-05 구현 완료
```

---

## 10. 코드 품질 도구

### 10.1 필수 설정

| 도구 | 설정 파일 | 용도 |
|------|-----------|------|
| ESLint | `.eslintrc.js` | 코드 린트 |
| Prettier | `.prettierrc` | 코드 포맷 |
| TypeScript | `tsconfig.json` | 타입 체크 |

### 10.2 ESLint 설정

```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/explicit-function-return-type': 'off',
    'react/display-name': 'off',
  },
};
```

### 10.3 Prettier 설정

```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

### 10.4 Pre-commit 훅 (선택)

```bash
# Husky 설치
npm install -D husky lint-staged
npx husky init

# .husky/pre-commit
npm run lint-staged

# package.json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

---

## 11. 자주 쓰는 스니펫

### 11.1 API 응답 타입

```typescript
// types/api.ts
export interface ApiResponse<T> {
  data: T;
  meta?: {
    page: number;
    total: number;
  };
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Array<{ field: string; message: string }>;
  };
}
```

### 11.2 서버 컴포넌트에서 데이터 페칭

```tsx
// app/g/[slug]/page.tsx
import { createServerClient } from '@/lib/supabase/server';

export default async function GuidePage({ params }: { params: { slug: string } }) {
  const supabase = createServerClient();

  const { data: guide, error } = await supabase
    .from('guides')
    .select('*, blocks(*)')
    .eq('slug', params.slug)
    .single();

  if (error || !guide) {
    notFound();
  }

  return <GuideView guide={guide} />;
}
```

### 11.3 클라이언트 컴포넌트에서 Mutation

```tsx
'use client';

export function PublishButton({ guideId }: { guideId: string }) {
  const [isPending, startTransition] = useTransition();

  const handlePublish = () => {
    startTransition(async () => {
      const response = await fetch(`/api/guides/${guideId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'published' }),
      });

      if (response.ok) {
        toast.success('발행되었습니다!');
      }
    });
  };

  return (
    <Button onClick={handlePublish} disabled={isPending}>
      {isPending ? '발행 중...' : '발행하기'}
    </Button>
  );
}
```

---

## Decision Log 참조

| ID | 항목 | 선택 | 근거 |
|----|------|------|------|
| CC-01 | 상태 관리 | Zustand | Redux보다 가볍고, 에디터 상태에 적합 |
| CC-02 | 폼 검증 | Zod | 프론트/백 스키마 공유 가능 |
| CC-03 | 테스트 | Vitest + RTL | Vite 기반으로 빠름, Jest 호환 |
| CC-04 | 린트 | ESLint + Prettier | 코드 품질 + 일관된 포맷 |
| CC-05 | 브랜치 전략 | Feature Branch | 기능별 독립 개발, 병합 전 검증 |
