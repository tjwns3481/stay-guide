# Roomy - AI 에이전트 협업 가이드

## 프로젝트 개요

Roomy는 숙박업소용 모바일 웹 안내서 & AI 챗봇 서비스입니다.
- **호스트**: 블록형 에디터로 안내서 제작
- **게스트**: URL 하나로 숙소 정보 확인 + AI 컨시어지

## 기술 스택

| 영역 | 기술 |
|------|------|
| 백엔드 | Hono + Bun |
| 프론트엔드 | Next.js 14 (App Router) |
| 데이터베이스 | Supabase (PostgreSQL + pgvector) |
| ORM | Prisma |
| 인증 | Clerk (Google/Kakao 소셜 로그인) |
| 상태관리 | Zustand |
| CSS | TailwindCSS |
| AI | OpenAI GPT-4 + RAG |

## 디렉토리 구조

```
roomy/
├── backend/           # Hono + Bun API 서버
│   ├── src/
│   │   ├── routes/    # API 라우트
│   │   ├── services/  # 비즈니스 로직
│   │   ├── schemas/   # Zod 스키마
│   │   ├── middleware/# 미들웨어
│   │   └── lib/       # 유틸리티
│   ├── tests/         # 백엔드 테스트
│   └── prisma/        # Prisma 스키마
├── frontend/          # Next.js 프론트엔드
│   └── src/
│       ├── app/       # App Router 페이지
│       ├── components/# React 컴포넌트
│       ├── hooks/     # 커스텀 훅
│       ├── lib/       # API 클라이언트, 유틸리티
│       ├── stores/    # Zustand 스토어
│       └── types/     # TypeScript 타입
├── docs/planning/     # 기획 문서
└── .claude/           # AI 에이전트 설정
    ├── agents/        # 전문가 에이전트
    └── commands/      # 커맨드
```

## 에이전트 팀

| 에이전트 | 역할 |
|----------|------|
| `/orchestrate` | 작업 분석 & 에이전트 호출 (커맨드) |
| `backend-specialist` | Hono API, 비즈니스 로직 |
| `frontend-specialist` | Next.js UI, Zustand 상태관리 |
| `database-specialist` | Prisma 스키마, 마이그레이션 |
| `test-specialist` | Vitest, Playwright 테스트 |

## 개발 워크플로우

### TDD 사이클 (Contract-First)

1. **Phase 0, T0.5.x**: 테스트 먼저 작성 (RED)
2. **Phase 1+**: 구현 코드 작성 (GREEN)
3. **REFACTOR**: 코드 정리

### Git Worktree 규칙

| Phase | 워크트리 |
|-------|---------|
| Phase 0 | main 브랜치에서 작업 |
| Phase 1+ | 별도 worktree에서 작업 |

```bash
# Phase 1+ 작업 시
git worktree add ../roomy-phase1-auth -b phase/1-auth
cd ../roomy-phase1-auth
# 작업 완료 후
git worktree remove ../roomy-phase1-auth
```

## 주요 명령어

```bash
# 백엔드
cd backend
bun install
bun run dev          # 개발 서버
bun test             # 테스트
bun run db:migrate   # DB 마이그레이션

# 프론트엔드
cd frontend
npm install
npm run dev          # 개발 서버
npm test             # 테스트
npm run build        # 빌드
```

## 기획 문서 참조

- `docs/planning/01-prd.md` - 제품 요구사항
- `docs/planning/02-trd.md` - 기술 요구사항
- `docs/planning/03-user-flow.md` - 사용자 흐름
- `docs/planning/04-database-design.md` - DB 설계
- `docs/planning/05-design-system.md` - 디자인 시스템
- `docs/planning/06-tasks.md` - 태스크 목록
- `docs/planning/07-coding-convention.md` - 코딩 컨벤션

## Lessons Learned

(이 섹션은 에이전트가 어려운 문제를 해결했을 때 자동으로 기록됩니다)

---

## 변경 이력

- 2026-01-14: 프로젝트 초기 셋업
