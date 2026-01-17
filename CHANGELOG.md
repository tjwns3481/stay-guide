# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-18

### Added

#### Core Features (FEAT-1: 커스텀 에디터)
- 블록형 안내서 에디터 (드래그앤드롭 지원)
- 6종 블록 타입: Hero, QuickInfo, Amenities, Map, HostPick, Notice
- 갤러리 블록 (반응형 이미지 그리드)
- 자동 저장 기능 (2초 디바운스)
- 안내서 발행/복제/삭제

#### Authentication (FEAT-0: 인증)
- Clerk 기반 소셜 로그인 (Google, Kakao)
- 보호된 라우트 미들웨어
- 사용자 프로필 관리

#### Guest Experience (FEAT-2: 게스트 뷰)
- 슬러그 기반 공개 안내서 페이지 (`/g/[slug]`)
- 모바일 최적화 UI
- 오프닝 애니메이션
- 시즌별 이펙트 (봄/여름/가을/겨울)

#### Theme System (FEAT-3: 테마)
- 3가지 프리셋 테마 (Emotional, Modern, Natural)
- 커스텀 컬러 피커
- 폰트 선택 (4종)

#### AI Concierge (FEAT-4: AI 컨시어지)
- Gemini 2.0 Flash 기반 AI 챗봇
- Long Context 방식 RAG
- 스트리밍 응답 지원
- 플로팅 채팅 UI

#### License System (FEAT-5: 라이선스)
- 라이선스 키 검증 시스템
- 4단계 플랜 (Free/Monthly/Biannual/Annual)
- 스마트스토어 결제 연동
- 워터마크 표시/제거

#### Infrastructure
- Supabase PostgreSQL 데이터베이스
- Prisma ORM
- Vercel 배포
- Vercel Analytics & Speed Insights
- ISR (Incremental Static Regeneration)

### Performance Optimizations
- next/image 최적화 (WebP, lazy loading)
- 동적 import 코드 스플리팅 (번들 57% 감소)
- Cache-Control 헤더 설정
- ISR revalidate=60

### Developer Experience
- TypeScript strict 모드 (0 errors)
- Vitest 단위 테스트 (136개, stores 92.6% 커버리지)
- Playwright E2E 테스트 스위트
- ESLint 설정
- API 문서화 (25개 엔드포인트)

### Accessibility
- ARIA 라벨 추가
- 키보드 네비게이션 지원
- 모달 포커스 관리
- 스크린 리더 지원

---

## Development Phases

| Phase | Description | Status |
|-------|-------------|--------|
| M0 | 프로젝트 셋업 | ✅ |
| M0.5 | 계약 & 테스트 설계 | ✅ |
| M1 | FEAT-0: 인증 & 온보딩 | ✅ |
| M2 | FEAT-1: 커스텀 에디터 | ✅ |
| M3 | FEAT-2: 필수 정보 블록 | ✅ |
| M4 | FEAT-3: 테마 & 디자인 | ✅ |
| M5 | FEAT-4: AI 컨시어지 | ✅ |
| M6 | 라이선스 & 결제 | ✅ |
| M7 | 통합 & 배포 | ✅ |
| M8 | 배포 준비 & 품질 개선 | ✅ |
| M9 | 프로덕션 안정화 & 최적화 | ✅ |

---

## Links

- **Production URL**: https://roomy-app.vercel.app
- **Repository**: (private)
