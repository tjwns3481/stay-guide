# Roomy 기능 정의서

> 숙박업소용 모바일 웹 안내서 & AI 챗봇 서비스

**최종 수정일**: 2025-01-16
**버전**: 1.0.0

---

## 목차

1. [서비스 개요](#1-서비스-개요)
2. [사용자 유형 및 권한](#2-사용자-유형-및-권한)
3. [페이지별 기능 명세](#3-페이지별-기능-명세)
4. [핵심 기능 상세](#4-핵심-기능-상세)
5. [기술 스택 및 라이브러리](#5-기술-스택-및-라이브러리)
6. [API 명세](#6-api-명세)
7. [데이터 모델](#7-데이터-모델)

---

## 1. 서비스 개요

### 1.1 서비스 목적

Roomy는 숙박업소 호스트가 게스트를 위한 디지털 안내서를 손쉽게 제작하고, 게스트가 AI 컨시어지를 통해 숙소 정보를 빠르게 얻을 수 있는 서비스입니다.

### 1.2 핵심 가치

| 대상 | 가치 |
|------|------|
| **호스트** | 블록형 에디터로 5분 만에 안내서 제작, 반복 질문 감소 |
| **게스트** | URL 하나로 숙소 정보 확인, AI 컨시어지가 24시간 응대 |

### 1.3 주요 특징

- **블록형 에디터**: 6가지 블록 타입으로 직관적인 안내서 제작
- **실시간 미리보기**: 편집 즉시 게스트 화면 미리보기
- **AI 컨시어지**: RAG 기반 자연어 질의응답
- **모바일 우선**: 게스트 화면 모바일 최적화
- **자동 저장**: 2초 디바운스로 변경사항 자동 저장

---

## 2. 사용자 유형 및 권한

### 2.1 호스트 (Host)

숙박업소 운영자로, 안내서를 제작하고 관리합니다.

**필요 조건**: 소셜 로그인 (Google 또는 Kakao)

**권한**:
- 안내서 생성/수정/삭제
- 블록 추가/편집/순서 변경
- 테마 커스터마이징
- 안내서 발행/발행 취소
- AI 설정 관리 (커스텀 지침)
- 라이선스 관리

### 2.2 게스트 (Guest)

숙소 이용자로, 호스트가 공유한 URL로 안내서를 조회합니다.

**필요 조건**: 없음 (비로그인)

**권한**:
- 발행된 안내서 조회
- AI 컨시어지 이용
- 정보 복사 (주소, Wi-Fi 비밀번호 등)

---

## 3. 페이지별 기능 명세

### 3.1 공개 페이지

#### 3.1.1 랜딩 페이지 (`/`)

**파일**: `frontend/src/app/page.tsx`

| 섹션 | 요소 | 동작 |
|------|------|------|
| Hero | "무료로 시작하기" 버튼 | `/sign-up` 페이지로 이동 |
| Features | 6가지 기능 카드 | 정보 표시 (클릭 없음) |
| CTA | "지금 시작하기" 버튼 | `/sign-up` 페이지로 이동 |

**6가지 기능 소개**:
1. 블록형 에디터
2. 모바일 최적화
3. AI 컨시어지
4. 감성 테마
5. 원클릭 복사
6. 통계 대시보드

---

#### 3.1.2 로그인 페이지 (`/sign-in`)

**파일**: `frontend/src/app/(auth)/sign-in/[[...sign-in]]/page.tsx`

| 요소 | 동작 |
|------|------|
| Google 로그인 버튼 | Google OAuth 인증 → `/dashboard` 이동 |
| Kakao 로그인 버튼 | Kakao OAuth 인증 → `/dashboard` 이동 |
| 회원가입 링크 | `/sign-up` 페이지로 이동 |

**사용 라이브러리**: `@clerk/nextjs` (SignIn 컴포넌트)

---

#### 3.1.3 회원가입 페이지 (`/sign-up`)

**파일**: `frontend/src/app/(auth)/sign-up/[[...sign-up]]/page.tsx`

| 요소 | 동작 |
|------|------|
| Google 회원가입 버튼 | Google OAuth 인증 → 사용자 생성 → `/dashboard` 이동 |
| Kakao 회원가입 버튼 | Kakao OAuth 인증 → 사용자 생성 → `/dashboard` 이동 |
| 로그인 링크 | `/sign-in` 페이지로 이동 |

**백엔드 연동**: Clerk Webhook이 `user.created` 이벤트 수신 → Prisma User 레코드 생성

---

### 3.2 호스트 전용 페이지 (인증 필요)

#### 3.2.1 대시보드 (`/dashboard`)

**파일**: `frontend/src/app/(protected)/dashboard/page.tsx`

**레이아웃 구성**:

```
┌─────────────────────────────────────┐
│  헤더 (로고, 사용자 메뉴)           │
├─────────────────────────────────────┤
│  사용자 정보 카드                   │
│  ┌───────────────────────────────┐  │
│  │ 프로필 이미지 / 이름 / 이메일 │  │
│  │ 현재 플랜 / 라이선스 상태     │  │
│  └───────────────────────────────┘  │
├─────────────────────────────────────┤
│  [+ 새 안내서 만들기]               │
├─────────────────────────────────────┤
│  안내서 목록                        │
│  ┌───────────────────────────────┐  │
│  │ 안내서 카드 1                 │  │
│  │ 안내서 카드 2                 │  │
│  │ ...                           │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

| 요소 | 동작 |
|------|------|
| 사용자 정보 카드 | 프로필, 플랜 정보 표시 |
| "새 안내서 만들기" 버튼 | `/editor/new` 이동 → API로 안내서 생성 → `/editor/{id}`로 리다이렉트 |
| 안내서 카드 클릭 | `/editor/{id}` 에디터 페이지로 이동 |
| 안내서 외부 링크 버튼 | 새 탭에서 `/g/{slug}` 열기 (발행된 안내서만) |

**컴포넌트**:
- `UserInfoCard`: 사용자 정보 표시 (`frontend/src/components/dashboard/UserInfoCard.tsx`)
- `GuidesList`: 안내서 목록 (`frontend/src/components/dashboard/GuidesList.tsx`)

**사용 라이브러리**: Clerk `currentUser()`, Lucide Icons

---

#### 3.2.2 에디터 페이지 (`/editor/[id]`)

**파일**: `frontend/src/app/(protected)/editor/[id]/page.tsx`

**레이아웃 (PC - 2컬럼)**:

```
┌─────────────────────────────────────────────────────────┐
│  에디터 헤더                                            │
│  [←] 제목 입력          저장상태  [발행하기] [⋮ 더보기] │
├──────────────────────────┬──────────────────────────────┤
│                          │                              │
│   실시간 미리보기        │   편집 패널                  │
│   (PreviewPanel)         │   (ControlPanel)             │
│                          │                              │
│   게스트가 보는 화면     │   - 블록 관리               │
│   그대로 표시            │   - 설정 (제목, slug)       │
│                          │   - 테마 커스터마이징       │
│                          │                              │
└──────────────────────────┴──────────────────────────────┘
```

**레이아웃 (모바일 - 탭 전환)**:

```
┌─────────────────────────┐
│  에디터 헤더            │
│  [편집] [미리보기] 토글 │
├─────────────────────────┤
│                         │
│   현재 선택된 뷰        │
│   (편집 or 미리보기)    │
│                         │
├─────────────────────────┤
│  모바일 Bottom Sheet    │
│  (블록 추가 등)         │
└─────────────────────────┘
```

##### 에디터 헤더 (EditorHeader)

**파일**: `frontend/src/components/editor/EditorHeader.tsx`

| 요소 | 동작 |
|------|------|
| ← 뒤로가기 버튼 | `/dashboard`로 이동 (미저장 시 경고) |
| 제목 입력 필드 | 안내서 제목 실시간 수정 |
| 저장 상태 표시 | "저장됨" / "저장 중..." / "저장되지 않음" |
| 편집/미리보기 토글 (모바일) | 뷰 모드 전환 |
| "발행하기" 버튼 | API 호출 → 발행 완료 → URL 클립보드 복사 |
| "발행 취소" 버튼 (발행 시) | 발행 취소 API 호출 |
| "공유" 버튼 (발행 시) | `/g/{slug}` URL 클립보드 복사 |
| "새 탭에서 열기" (발행 시) | `/g/{slug}` 새 탭 열기 |
| "지금 저장" 버튼 | 수동 저장 트리거 |
| "안내서 삭제" | 삭제 확인 모달 → 삭제 API → `/dashboard` 이동 |

**단축키**: `Ctrl+S` / `Cmd+S` → 수동 저장

##### 편집 패널 (ControlPanel)

**파일**: `frontend/src/components/editor/ControlPanel.tsx`

**3개 아코디언 섹션**:

**1. 블록 섹션**

| 요소 | 동작 |
|------|------|
| "블록 추가" 버튼 | 블록 타입 선택 드롭다운 표시 |
| 블록 타입 선택 | 해당 타입 블록 추가 → 블록 목록 업데이트 |
| BlockList | 드래그앤드롭으로 순서 변경 가능 |

**블록 타입 6가지**:

| 타입 | 아이콘 | 설명 | 주요 필드 |
|------|--------|------|-----------|
| Hero | Image | 메인 이미지 + 환영 문구 | imageUrl, title, subtitle, layout |
| Quick Info | Clock | 체크인/아웃, 인원, 주차 | checkIn, checkOut, maxGuests, parking, address |
| Amenities | Wifi | 편의시설 목록 | wifiName, wifiPassword, items[] |
| Map | MapPin | 위치 및 지도 링크 | address, latitude, longitude, naverMapUrl, kakaoMapUrl |
| Host Pick | Heart | 호스트 추천 | title, items[{name, category, description, url}] |
| Notice | AlertCircle | 공지사항 | type(banner/popup), title, content |

**2. 설정 섹션**

| 필드 | 설명 | 검증 규칙 |
|------|------|-----------|
| 안내서 제목 | 대시보드에 표시되는 이름 | 필수 |
| 숙소명 | 게스트에게 표시되는 이름 | 필수 |
| URL 슬러그 | `/g/{slug}` 형태로 사용 | 영문 소문자, 숫자, 하이픈만 / 중복 불가 |

**3. 테마 섹션**

**파일**: `frontend/src/components/editor/ThemeCustomizer.tsx`

| 요소 | 동작 |
|------|------|
| 빠른 포인트 컬러 (6개) | 클릭 시 즉시 포인트 컬러 변경 |
| 테마 프리셋 | 미리 정의된 테마 세트 적용 |
| 커스텀 설정 (접이식) | 상세 커스터마이징 |

**커스텀 설정 항목**:
- 포인트 컬러 (Primary)
- 보조 컬러 (Secondary)
- 배경색
- 폰트 선택

##### 블록 목록 (BlockList)

**파일**: `frontend/src/components/editor/BlockList.tsx`

| 요소 | 동작 |
|------|------|
| 드래그 핸들 (⋮⋮) | 드래그하여 블록 순서 변경 |
| 블록 제목 클릭 | 인라인 편집기 펼침/접힘 (아코디언) |
| 토글 스위치 | 블록 표시/숨김 전환 |
| 복제 버튼 | 블록 복제 (바로 아래에 추가) |
| 삭제 버튼 | 블록 삭제 (확인 없이 즉시) |

**사용 라이브러리**: `@dnd-kit/core`, `@dnd-kit/sortable`

##### 블록 편집기 (BlockEditor)

**파일**: `frontend/src/components/blocks/BlockEditor.tsx`

**모드**:
- **인라인 모드**: 블록 목록 내 아코디언으로 펼쳐짐
- **전체 화면 모드**: 별도 패널로 표시 (모바일)

**블록별 에디터**:

| 블록 | 에디터 파일 | 주요 입력 |
|------|-------------|-----------|
| Hero | `HeroEditor.tsx` | 이미지 업로드/URL, 제목, 부제목, 레이아웃 스타일 |
| Quick Info | `QuickInfoEditor.tsx` | 체크인/아웃 시간, 최대 인원, 주차 정보, 주소 |
| Amenities | `AmenitiesEditor.tsx` | Wi-Fi SSID/비밀번호, 편의시설 체크리스트 |
| Map | `MapEditor.tsx` | 주소, 위도/경도, 네이버맵/카카오맵 URL |
| Host Pick | `HostPickEditor.tsx` | 섹션 제목, 추천 아이템 목록 (동적 추가) |
| Notice | `NoticeEditor.tsx` | 타입(배너/팝업), 제목, 내용 |

##### 미리보기 패널 (PreviewPanel)

**파일**: `frontend/src/components/editor/PreviewPanel.tsx`

- 게스트 뷰(`GuideRenderer`)와 동일한 렌더링
- 편집 내용 실시간 반영
- 모바일 프레임 시뮬레이션 (선택적)

---

#### 3.2.3 설정 페이지 (`/settings`)

**파일**: `frontend/src/app/(protected)/settings/page.tsx`

| 요소 | 동작 |
|------|------|
| 라이선스 관리 링크 | `/settings/license` 이동 |
| 프로필 설정 | 이름 변경 등 |

---

#### 3.2.4 라이선스 페이지 (`/settings/license`)

**파일**: `frontend/src/app/(protected)/settings/license/page.tsx`

| 요소 | 동작 |
|------|------|
| 현재 플랜 표시 | 활성 라이선스 정보 |
| 라이선스 키 입력 | 형식: `ROOMY-XXXX-XXXX-XXXX` |
| "활성화" 버튼 | API 호출 → 라이선스 적용 |
| 플랜 비교표 | 무료/월간/반기/연간 기능 비교 |

**컴포넌트**:
- `LicenseForm`: 라이선스 키 입력 폼
- `PlanCard`: 개별 플랜 카드
- `PlanComparison`: 플랜 비교표

---

### 3.3 게스트 전용 페이지 (비로그인)

#### 3.3.1 안내서 뷰 (`/g/[slug]`)

**파일**: `frontend/src/app/(guest)/g/[slug]/page.tsx`

**렌더링 방식**: Server-Side Rendering (SSR)

**레이아웃**:

```
┌─────────────────────────┐
│  헤더 (숙소명)          │  ← Sticky
├─────────────────────────┤
│                         │
│   블록 1 (Hero)         │
│                         │
├─────────────────────────┤
│   블록 2 (Quick Info)   │
├─────────────────────────┤
│   블록 3 (Amenities)    │
├─────────────────────────┤
│   ...                   │
├─────────────────────────┤
│  푸터 (Powered by Roomy)│
└─────────────────────────┘
         [💬]              ← AI 플로팅 버튼
```

**기능**:

| 요소 | 동작 |
|------|------|
| 블록 콘텐츠 | 호스트가 작성한 정보 표시 |
| 주소 복사 버튼 | 클립보드에 주소 복사 |
| Wi-Fi 비밀번호 복사 | 클립보드에 비밀번호 복사 |
| 네이버맵 버튼 | 네이버 지도 앱/웹 열기 |
| 카카오맵 버튼 | 카카오맵 앱/웹 열기 |
| AI 플로팅 버튼 | 채팅 인터페이스 열기 |

**SEO 최적화**:
- 동적 메타데이터 생성
- Open Graph 태그 (제목, 설명, 이미지)

**접근 제어**:
- `isPublished === false`인 경우 404 페이지 표시

##### 블록 렌더러 (BlockRenderer)

**파일**: `frontend/src/components/guest/BlockRenderer.tsx`

| 블록 | 뷰 컴포넌트 | 표시 내용 |
|------|-------------|-----------|
| Hero | `HeroBlock.tsx` | 배경 이미지 + 오버레이 텍스트 |
| Quick Info | `QuickInfoBlock.tsx` | 체크인/아웃 시간, 인원, 주차, 주소(복사) |
| Amenities | `AmenitiesBlock.tsx` | Wi-Fi 정보(복사), 편의시설 아이콘 |
| Map | `MapBlock.tsx` | 지도 이미지, 네이버/카카오맵 버튼 |
| Host Pick | `HostPickBlock.tsx` | 추천 아이템 카드 그리드 |
| Notice | `NoticeBlock.tsx` | 배너 또는 팝업 형태 공지 |

---

### 3.4 AI 챗봇 인터페이스

#### 3.4.1 플로팅 버튼 (AiFloatingButton)

**파일**: `frontend/src/components/ai/AiFloatingButton.tsx`

- **위치**: 우하단 고정 (position: fixed)
- **아이콘**: 메시지 버블 (Lucide MessageCircle)
- **동작**: 클릭 시 채팅 인터페이스 열기

#### 3.4.2 채팅 인터페이스 (ChatInterface)

**파일**: `frontend/src/components/ai/ChatInterface.tsx`

**레이아웃 (모바일)**:
```
┌─────────────────────────┐
│ AI 컨시어지    [초기화] │  ← 헤더
│ 숙소명              [X] │
├─────────────────────────┤
│                         │
│   [AI] 안녕하세요!      │
│        무엇을 도와...   │
│                         │
│            [User] 체크인│
│            시간이...    │
│                         │
│   [AI] 체크인은 오후... │
│        ...              │
│                         │
├─────────────────────────┤
│  [메시지 입력...]   [→] │  ← 입력 영역
└─────────────────────────┘
```

**레이아웃 (PC)**:
- 우하단 고정 패널 (384px × 600px)
- 플로팅 버튼 위에 표시

**기능**:

| 요소 | 동작 |
|------|------|
| 메시지 입력 | Enter → 전송, Shift+Enter → 줄바꿈 |
| 전송 버튼 | 메시지 전송 → AI 응답 스트리밍 |
| 중단 버튼 (응답 중) | 스트리밍 중단 (AbortController) |
| 초기화 버튼 | 대화 기록 삭제, 새 세션 시작 |
| 닫기 버튼 (X) | 채팅 인터페이스 닫기 |

**메시지 타입**:
- **사용자 메시지**: 우측 정렬, 파란색 배경
- **AI 메시지**: 좌측 정렬, 회색 배경, 스트리밍 타이핑 효과

**사용 훅**: `useAiChat` (`frontend/src/hooks/useAiChat.ts`)

---

## 4. 핵심 기능 상세

### 4.1 블록 에디터 시스템

#### 4.1.1 블록 데이터 구조

```typescript
interface Block {
  id: string;           // nanoid 생성
  guideId: string;      // 소속 안내서
  type: BlockType;      // 'hero' | 'quick_info' | 'amenities' | 'map' | 'host_pick' | 'notice'
  order: number;        // 표시 순서 (0부터 시작)
  content: JSON;        // 타입별 상이한 구조
  isVisible: boolean;   // 표시 여부
  createdAt: DateTime;
  updatedAt: DateTime;
}
```

#### 4.1.2 블록별 Content 스키마

**Hero 블록**:
```typescript
{
  imageUrl?: string;     // 이미지 URL
  title?: string;        // 메인 제목
  subtitle?: string;     // 부제목
  layout?: 'full' | 'half';  // 레이아웃 스타일
}
```

**Quick Info 블록**:
```typescript
{
  checkIn?: string;      // 체크인 시간 (예: "15:00")
  checkOut?: string;     // 체크아웃 시간 (예: "11:00")
  maxGuests?: number;    // 최대 인원
  parking?: string;      // 주차 정보 (예: "무료 주차 가능")
  address?: string;      // 숙소 주소
}
```

**Amenities 블록**:
```typescript
{
  wifiName?: string;     // Wi-Fi SSID
  wifiPassword?: string; // Wi-Fi 비밀번호
  items?: string[];      // 편의시설 목록 (예: ["에어컨", "냉장고", "전자레인지"])
}
```

**Map 블록**:
```typescript
{
  address?: string;      // 주소
  latitude?: number;     // 위도
  longitude?: number;    // 경도
  naverMapUrl?: string;  // 네이버 지도 URL
  kakaoMapUrl?: string;  // 카카오맵 URL
  directions?: string;   // 찾아오시는 길 안내
}
```

**Host Pick 블록**:
```typescript
{
  title?: string;        // 섹션 제목 (예: "맛집 추천")
  items?: {
    name: string;        // 장소명
    category?: string;   // 카테고리 (예: "카페", "맛집")
    description?: string;// 설명
    url?: string;        // 외부 링크
  }[];
}
```

**Notice 블록**:
```typescript
{
  type?: 'banner' | 'popup';  // 표시 형태
  title?: string;             // 공지 제목
  content?: string;           // 공지 내용
}
```

#### 4.1.3 드래그앤드롭

**라이브러리**: `@dnd-kit`

**구현**:
- `DndContext`: 드래그 컨텍스트 제공
- `SortableContext`: 정렬 가능 영역 정의
- `useSortable`: 개별 아이템 드래그 기능

**순서 변경 로직**:
1. 드래그 시작 → 시각적 피드백 (그림자, 반투명)
2. 드래그 중 → 다른 아이템 위로 이동 시 위치 미리보기
3. 드롭 → `reorderBlocks()` 액션 → order 값 재계산

---

### 4.2 자동 저장 시스템

**파일**: `frontend/src/hooks/useAutoSave.ts`

#### 4.2.1 동작 방식

```
사용자 편집 → saveStatus = 'unsaved' → 2초 대기 (디바운스)
                                            ↓
                                      추가 편집 발생?
                                      ├─ Yes → 타이머 리셋
                                      └─ No → 저장 실행
```

#### 4.2.2 저장 상태

| 상태 | 표시 | 설명 |
|------|------|------|
| `saved` | "저장됨" | 모든 변경사항 저장 완료 |
| `saving` | "저장 중..." | API 호출 진행 중 |
| `unsaved` | "저장되지 않음" | 미저장 변경사항 존재 |
| `error` | "저장 실패" | API 호출 실패 |

#### 4.2.3 변경 감지

- `JSON.stringify(currentGuide)` vs `JSON.stringify(originalGuide)` 비교
- 중복 저장 방지: 직전 저장 내용과 동일 시 스킵

#### 4.2.4 페이지 이탈 방지

- `beforeunload` 이벤트로 미저장 시 경고
- `router.push` 호출 전 미저장 확인

---

### 4.3 AI 컨시어지 시스템

#### 4.3.1 RAG (Retrieval-Augmented Generation) 아키텍처

```
┌─────────────────────────────────────────────────────────┐
│                    1. 임베딩 생성 (호스트 저장 시)        │
│  블록 내용 → HuggingFace API → 768차원 벡터 → pgvector  │
└─────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────┐
│                    2. 질의 처리 (게스트 질문 시)          │
│                                                          │
│  질문 → 동의어 확장 → 임베딩 변환                        │
│            ↓                                             │
│  하이브리드 검색 (키워드 + 벡터 유사도)                  │
│            ↓                                             │
│  관련 블록 Top-K 추출                                    │
│            ↓                                             │
│  컨텍스트 구성 (시스템 프롬프트 + 블록 정보 + 대화 기록)  │
│            ↓                                             │
│  LLM 응답 생성 (Gemini 2.0 Flash)                       │
│            ↓                                             │
│  SSE 스트리밍으로 실시간 전송                           │
└─────────────────────────────────────────────────────────┘
```

#### 4.3.2 임베딩 모델

**제공자**: HuggingFace Inference API
**모델**: `sentence-transformers/all-mpnet-base-v2`
**차원**: 768

**파일**: `frontend/src/app/api/[[...route]]/services/ai-free/embeddings.ts`

#### 4.3.3 하이브리드 검색

**파일**: `frontend/src/app/api/[[...route]]/services/ai-free/vectorstore.ts`

**검색 전략**:
1. **키워드 매칭**: 질문에서 키워드 추출 → 블록 content에서 검색
2. **동의어 확장**:
   - "체크인" → ["입실", "체크인", "check-in"]
   - "와이파이" → ["wi-fi", "wifi", "무선인터넷"]
3. **벡터 유사도**: 질문 임베딩 ↔ 블록 임베딩 코사인 유사도
4. **스코어 결합**: 키워드 점수 + 벡터 점수 가중 합산

#### 4.3.4 LLM 응답 생성

**제공자**: Google Generative AI
**모델**: `gemini-2.0-flash` (무료 티어)
**프레임워크**: LangChain

**파일**: `frontend/src/app/api/[[...route]]/services/ai-free/llm.ts`

**시스템 프롬프트 구성**:
```
당신은 "{숙소명}"의 AI 컨시어지입니다.
게스트의 질문에 친절하고 정확하게 답변해주세요.

[숙소 정보]
{검색된 블록 내용들}

[호스트 지침] (선택적)
{aiInstructions}

[대화 기록]
{최근 10개 메시지}
```

#### 4.3.5 스트리밍 응답 (SSE)

**프로토콜**: Server-Sent Events

**이벤트 타입**:
```
event: message
data: {"chunk": "안녕하세요"}

event: message
data: {"chunk": "! 무엇을"}

event: done
data: {"sessionId": "abc123", "messageId": "xyz789"}

event: error
data: {"message": "오류가 발생했습니다"}
```

**클라이언트 처리** (`useAiChat.ts`):
- `ReadableStream` 파싱
- 청크 단위로 메시지 업데이트
- 타이핑 효과 구현

---

### 4.4 라이선스 시스템

#### 4.4.1 플랜 종류

| 플랜 | 키 접두사 | 유효 기간 | 최대 안내서 | 최대 블록 | AI 챗봇 |
|------|-----------|-----------|-------------|-----------|---------|
| Free | - | 무제한 | 1개 | 6개 | X |
| Monthly | M | 30일 | 3개 | 20개 | O |
| Biannual | B | 180일 | 10개 | 50개 | O |
| Annual | A | 365일 | 무제한 | 무제한 | O |

#### 4.4.2 라이선스 키 형식

```
ROOMY-{plan}{random}-{random}-{random}
예: ROOMY-M1A2-B3C4-D5E6 (Monthly)
    ROOMY-B7X8-Y9Z0-A1B2 (Biannual)
    ROOMY-A3C4-D5E6-F7G8 (Annual)
```

#### 4.4.3 활성화 플로우

```
1. 사용자가 라이선스 키 입력
2. POST /api/licenses/activate
3. 키 형식 검증 (정규식)
4. 키 사용 여부 확인 (DB 조회)
5. 성공 시: License 레코드 생성, 만료일 계산
6. User에 licenseId 연결
7. 클라이언트에 라이선스 정보 반환
```

#### 4.4.4 기능 제한

**파일**: `frontend/src/app/api/[[...route]]/services/license/index.ts`

```typescript
const PLAN_FEATURES = {
  free: {
    maxGuides: 1,
    maxBlocks: 6,
    aiChat: false,
    customTheme: false,
    analytics: false,
    noWatermark: false,
  },
  monthly: {
    maxGuides: 3,
    maxBlocks: 20,
    aiChat: true,
    customTheme: true,
    analytics: false,
    noWatermark: true,
  },
  // ...
};
```

---

### 4.5 이미지 업로드

#### 4.5.1 업로드 플로우

```
1. 사용자가 이미지 선택 (드래그앤드롭 또는 파일 선택)
2. 클라이언트 검증:
   - 파일 타입: image/* 만 허용
   - 파일 크기: 5MB 이하
3. POST /api/upload (FormData)
4. 서버 검증 (동일 조건)
5. Supabase Storage에 업로드:
   - 버킷: guide-images
   - 경로: {userId}/{nanoid}.{ext}
6. 공개 URL 반환
7. 블록 content.imageUrl에 저장
```

#### 4.5.2 저장소

**제공자**: Supabase Storage
**버킷**: `guide-images` (public)
**파일명**: `{userId}/{nanoid}.{extension}`

---

### 4.6 테마 시스템

#### 4.6.1 테마 데이터 구조

```typescript
interface Theme {
  primaryColor: string;    // 포인트 컬러 (HEX)
  secondaryColor: string;  // 보조 컬러 (HEX)
  backgroundColor: string; // 배경색 (HEX)
  fontFamily: string;      // 폰트 패밀리
}
```

#### 4.6.2 프리셋 테마

| 테마명 | 포인트 | 보조 | 배경 |
|--------|--------|------|------|
| Warm Coral | #E07A5F | #81B29A | #FDFBF7 |
| Ocean Blue | #2E86AB | #A23B72 | #F5F9FA |
| Forest Green | #2D6A4F | #95D5B2 | #F7FCF9 |
| Sunset Orange | #F4A261 | #E76F51 | #FFF8F3 |
| Lavender | #9B5DE5 | #F15BB5 | #FAF5FF |
| Midnight | #1A1A2E | #16213E | #0F0F23 |

#### 4.6.3 테마 적용

**컴포넌트**: `ThemeProvider` (`frontend/src/components/guest/ThemeProvider.tsx`)

CSS 변수로 테마 값 주입:
```css
:root {
  --color-primary: #E07A5F;
  --color-secondary: #81B29A;
  --color-background: #FDFBF7;
  --font-family: 'Pretendard', sans-serif;
}
```

---

## 5. 기술 스택 및 라이브러리

### 5.1 프론트엔드

| 카테고리 | 기술/라이브러리 | 버전 | 용도 |
|----------|-----------------|------|------|
| **프레임워크** | Next.js | 14.2.0 | App Router, SSR |
| | React | 18.3.0 | UI 라이브러리 |
| | TypeScript | 5.6.0 | 타입 안전성 |
| **스타일링** | TailwindCSS | 3.4.0 | 유틸리티 CSS |
| | tailwind-merge | 2.6.0 | 클래스 병합 |
| | clsx | 2.1.1 | 조건부 클래스 |
| **UI 컴포넌트** | Radix UI | 다양한 | Headless UI |
| | Lucide React | 0.460.0 | 아이콘 |
| | Framer Motion | 11.11.0 | 애니메이션 |
| **상태관리** | Zustand | 5.0.0 | 전역 상태 |
| | React Query | 5.60.0 | 서버 상태 (미사용) |
| **인증** | Clerk | 5.7.0 | 소셜 로그인 |
| **드래그앤드롭** | @dnd-kit | 6.3.1 | 블록 정렬 |
| **테스트** | Vitest | 2.1.0 | 단위 테스트 |
| | Playwright | 1.57.0 | E2E 테스트 |
| | MSW | 2.12.7 | API 모킹 |

### 5.2 백엔드 (Next.js API Routes)

| 카테고리 | 기술/라이브러리 | 버전 | 용도 |
|----------|-----------------|------|------|
| **프레임워크** | Hono | 4.6.0 | 경량 API 프레임워크 |
| **검증** | Zod | 3.25.76 | 스키마 검증 |
| **ORM** | Prisma | 6.0.0 | 데이터베이스 ORM |
| **데이터베이스** | Supabase | 2.45.0 | PostgreSQL + pgvector |
| **인증** | Clerk Backend | 1.15.0 | JWT 검증 |
| **웹훅** | Svix | 1.84.1 | 서명 검증 |

### 5.3 AI 스택

| 카테고리 | 기술/라이브러리 | 버전 | 용도 |
|----------|-----------------|------|------|
| **LLM** | Google Generative AI | 0.24.1 | Gemini 2.0 Flash |
| | OpenAI | 4.104.0 | GPT-4 (대체) |
| **임베딩** | HuggingFace Inference | 4.13.9 | 텍스트 임베딩 |
| | @xenova/transformers | 2.17.2 | 브라우저 ML |
| **프레임워크** | LangChain | 1.2.10 | RAG 구현 |
| | @langchain/google-genai | 2.1.10 | Gemini 연동 |
| **벡터 DB** | pgvector | PostgreSQL 확장 | 벡터 검색 |
| | ChromaDB | 3.2.1 | 벡터 DB (대체) |

### 5.4 인프라

| 카테고리 | 서비스 | 용도 |
|----------|--------|------|
| **호스팅** | Vercel | Next.js 배포 |
| **데이터베이스** | Supabase | PostgreSQL + 스토리지 |
| **인증** | Clerk | 사용자 관리 |
| **AI** | Google AI Studio | Gemini API |
| | HuggingFace | 임베딩 API |

---

## 6. API 명세

### 6.1 인증 방식

**Bearer Token** (Clerk JWT)

```http
Authorization: Bearer {clerk_session_token}
```

### 6.2 공통 응답 형식

**성공**:
```json
{
  "success": true,
  "data": { ... }
}
```

**에러**:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "에러 메시지",
    "details": { ... }
  }
}
```

**페이지네이션**:
```json
{
  "success": true,
  "data": {
    "items": [...],
    "meta": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "totalPages": 5
    }
  }
}
```

### 6.3 엔드포인트 목록

#### 사용자 API

| 엔드포인트 | 메서드 | 인증 | 설명 |
|------------|--------|------|------|
| `/api/users/me` | GET | O | 현재 사용자 정보 조회 |
| `/api/users/me` | PATCH | O | 사용자 정보 수정 |
| `/api/users/me` | DELETE | O | 계정 삭제 |

#### 안내서 API

| 엔드포인트 | 메서드 | 인증 | 설명 |
|------------|--------|------|------|
| `/api/guides` | GET | O | 내 안내서 목록 조회 |
| `/api/guides` | POST | O | 새 안내서 생성 |
| `/api/guides/:id` | GET | O | 안내서 상세 조회 |
| `/api/guides/:id` | PATCH | O | 안내서 수정 |
| `/api/guides/:id` | DELETE | O | 안내서 삭제 |
| `/api/guides/:id/publish` | POST | O | 발행/발행 취소 |
| `/api/guides/:id/duplicate` | POST | O | 안내서 복제 |
| `/api/guides/slug/:slug` | GET | X | 공개 안내서 조회 (게스트용) |

#### AI API

| 엔드포인트 | 메서드 | 인증 | 설명 |
|------------|--------|------|------|
| `/api/ai/status` | GET | X | AI 서비스 상태 확인 |
| `/api/guides/:id/ai/embed` | POST | X | 블록 임베딩 생성 |
| `/api/guides/:id/ai/chat` | POST | X | AI 채팅 (SSE) |
| `/api/guides/:id/ai/conversations` | GET | X | 대화 기록 조회 |
| `/api/guides/:id/ai/settings` | GET | X | AI 설정 조회 |
| `/api/guides/:id/ai/settings` | PUT | X | AI 설정 수정 |

#### 라이선스 API

| 엔드포인트 | 메서드 | 인증 | 설명 |
|------------|--------|------|------|
| `/api/licenses/verify` | POST | X | 라이선스 키 검증 |
| `/api/licenses/activate` | POST | O | 라이선스 활성화 |
| `/api/licenses/me` | GET | O | 현재 라이선스 조회 |

#### 기타 API

| 엔드포인트 | 메서드 | 인증 | 설명 |
|------------|--------|------|------|
| `/api/upload` | POST | O | 이미지 업로드 |
| `/api/webhooks/clerk` | POST | Svix | Clerk 웹훅 수신 |

---

## 7. 데이터 모델

### 7.1 ERD 다이어그램

```
┌─────────────┐       ┌─────────────┐
│    User     │       │   License   │
├─────────────┤       ├─────────────┤
│ id          │───┐   │ id          │
│ clerkId     │   │   │ licenseKey  │
│ email       │   │   │ plan        │
│ name        │   │   │ status      │
│ imageUrl    │   └──→│ userId      │
│ createdAt   │       │ expiresAt   │
│ updatedAt   │       │ features    │
└──────┬──────┘       └─────────────┘
       │
       │ 1:N
       ↓
┌─────────────┐
│    Guide    │
├─────────────┤
│ id          │
│ userId      │
│ slug        │
│ title       │
│ accommName  │
│ theme       │
│ isPublished │
│ aiEnabled   │
│ aiInstructions│
│ viewCount   │
│ createdAt   │
│ updatedAt   │
└──────┬──────┘
       │
       │ 1:N
       ↓
┌─────────────┐       ┌─────────────────┐
│    Block    │       │ GuideEmbedding  │
├─────────────┤       ├─────────────────┤
│ id          │       │ id              │
│ guideId     │       │ guideId         │
│ type        │       │ blockId         │
│ order       │       │ content         │
│ content     │       │ embedding (768) │
│ isVisible   │       │ metadata        │
│ createdAt   │       │ createdAt       │
│ updatedAt   │       └─────────────────┘
└─────────────┘
       │
       │ (Guide 기준)
       ↓
┌─────────────────┐
│ AiConversation  │
├─────────────────┤
│ id              │
│ guideId         │
│ sessionId       │
│ role            │
│ content         │
│ createdAt       │
└─────────────────┘
```

### 7.2 주요 모델 상세

#### User

| 필드 | 타입 | 설명 |
|------|------|------|
| id | String | UUID |
| clerkId | String | Clerk 사용자 ID (unique) |
| email | String | 이메일 (unique) |
| name | String? | 표시 이름 |
| imageUrl | String? | 프로필 이미지 URL |

#### Guide

| 필드 | 타입 | 설명 |
|------|------|------|
| id | String | UUID |
| userId | String | 소유자 FK |
| slug | String | URL 경로 (unique) |
| title | String | 안내서 제목 |
| accommodationName | String | 숙소명 |
| theme | Json | 테마 설정 |
| isPublished | Boolean | 발행 여부 |
| aiEnabled | Boolean | AI 챗봇 활성화 |
| aiInstructions | String? | AI 커스텀 지침 |
| viewCount | Int | 조회수 |

#### Block

| 필드 | 타입 | 설명 |
|------|------|------|
| id | String | UUID |
| guideId | String | 소속 안내서 FK |
| type | String | 블록 타입 |
| order | Int | 표시 순서 |
| content | Json | 블록 내용 |
| isVisible | Boolean | 표시 여부 |

#### GuideEmbedding

| 필드 | 타입 | 설명 |
|------|------|------|
| id | String | UUID |
| guideId | String | 안내서 FK |
| blockId | String? | 블록 FK |
| content | String | 원본 텍스트 |
| embedding | Float[] | 768차원 벡터 |
| metadata | Json? | 추가 메타데이터 |

---

## 부록

### A. 환경 변수

```bash
# 애플리케이션
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=/api

# 데이터베이스
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# 인증 (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
CLERK_WEBHOOK_SECRET=whsec_xxx

# AI
GOOGLE_API_KEY=xxx
HUGGINGFACEHUB_API_KEY=hf_xxx
OPENAI_API_KEY=sk-xxx  # 선택적

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
```

### B. 개발 명령어

```bash
# 프론트엔드
cd frontend
npm install          # 의존성 설치
npm run dev          # 개발 서버 (localhost:3000)
npm run build        # 프로덕션 빌드
npm test             # 단위 테스트
npm run e2e          # E2E 테스트

# 데이터베이스
npm run db:generate  # Prisma 클라이언트 생성
npm run db:push      # 스키마 동기화
npm run db:migrate   # 마이그레이션
npm run db:studio    # Prisma Studio
```

### C. 파일 구조 요약

```
roomy/
├── frontend/
│   ├── src/
│   │   ├── app/                    # Next.js App Router
│   │   │   ├── (auth)/             # 인증 페이지
│   │   │   ├── (protected)/        # 호스트 페이지
│   │   │   ├── (guest)/            # 게스트 페이지
│   │   │   └── api/[[...route]]/   # Hono API
│   │   ├── components/
│   │   │   ├── ai/                 # AI 챗봇 UI
│   │   │   ├── blocks/             # 블록 에디터
│   │   │   ├── dashboard/          # 대시보드 컴포넌트
│   │   │   ├── editor/             # 에디터 UI
│   │   │   ├── guest/              # 게스트 뷰
│   │   │   └── ui/                 # 공통 UI
│   │   ├── hooks/                  # 커스텀 훅
│   │   ├── lib/                    # 유틸리티
│   │   ├── stores/                 # Zustand 스토어
│   │   └── types/                  # TypeScript 타입
│   ├── prisma/                     # Prisma 스키마
│   └── e2e/                        # E2E 테스트
├── backend/                        # 독립 백엔드 (일부)
├── docs/planning/                  # 기획 문서
└── FEATURE-SPEC.md                 # 이 문서
```

---

**문서 끝**
