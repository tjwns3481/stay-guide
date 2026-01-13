# Design System (기초 디자인 시스템) - Roomy (루미)

> 모바일 청첩장 스타일의 감성적이고 따뜻한 디자인 언어를 정의합니다.
> 최소 접근성 패키지를 포함합니다.

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

## 1. 디자인 철학

### 1.1 핵심 가치

| 가치 | 설명 | 구현 방법 |
|------|------|----------|
| **따뜻함** | 감성 숙소의 환대하는 느낌 | 따뜻한 뉴트럴 컬러, 부드러운 모서리, 친근한 문구 |
| **깔끔함** | 모바일 청첩장처럼 정돈된 레이아웃 | 충분한 여백, 단일 컬럼, 카드 기반 UI |
| **실용성** | 필요한 정보를 빠르게 찾기 | 복사 버튼, 지도 연동, 명확한 정보 구조 |

### 1.2 디자인 원칙

1. **모바일 우선**: 손님은 100% 모바일로 접속. 모바일 경험이 최우선.
2. **스크롤 친화적**: 한 손으로 편하게 스크롤하며 정보 확인.
3. **액션 강조**: 복사, 지도 열기 등 핵심 액션은 눈에 띄게.
4. **감성 유지**: 호스트의 숙소 분위기를 해치지 않는 UI.

### 1.3 참고 서비스 (무드보드)

| 서비스 | 참고할 점 | 참고하지 않을 점 |
|--------|----------|-----------------|
| 모바일 청첩장 | 감성적 레이아웃, 세로 스크롤, 사진 중심 | 과한 애니메이션 |
| 에어비앤비 | 정보 카드 구조, 깔끔한 타이포 | 복잡한 검색/필터 |
| 노션 | 블록 기반 편집 | 딱딱한 모바일 UI |
| 헤드스페이스 | 따뜻한 컬러, 여백 | 과한 일러스트 |

---

## 2. 컬러 팔레트

### 2.1 역할 기반 컬러

| 역할 | 컬러명 | Hex | Tailwind | 사용처 |
|------|--------|-----|----------|--------|
| **Primary** | Warm Brown | `#8B7355` | `amber-700` 커스텀 | 주요 버튼, 강조 |
| **Primary Light** | Soft Beige | `#D4C4B0` | `amber-200` 커스텀 | 호버, 배경 강조 |
| **Primary Dark** | Deep Brown | `#5C4D3D` | `amber-900` 커스텀 | 액티브, 포커스 |
| **Accent** | Terracotta | `#C17C60` | `orange-400` 커스텀 | 포인트 컬러, CTA |
| **Surface** | Cream | `#FAF7F2` | `stone-50` 커스텀 | 카드, 블록 배경 |
| **Background** | Off White | `#FEFDFB` | `white` 커스텀 | 전체 배경 |
| **Text Primary** | Charcoal | `#2D2A26` | `stone-800` | 주요 텍스트 |
| **Text Secondary** | Warm Gray | `#6B6560` | `stone-500` | 보조 텍스트 |
| **Border** | Light Tan | `#E8E2D9` | `stone-200` | 테두리, 구분선 |

### 2.2 피드백 컬러

| 상태 | 컬러명 | Hex | 사용처 |
|------|--------|-----|--------|
| **Success** | Sage Green | `#7BAE7F` | 성공 메시지, 완료 체크 |
| **Warning** | Honey | `#E5A84B` | 주의, 경고 |
| **Error** | Coral | `#E07070` | 오류, 삭제 경고 |
| **Info** | Dusty Blue | `#7BA3C9` | 정보, 도움말 |

### 2.3 테마별 컬러 (선택 가능)

호스트가 숙소 분위기에 맞게 테마를 선택할 수 있습니다.

| 테마 | Primary | Accent | Surface | 분위기 |
|------|---------|--------|---------|--------|
| **Modern** (기본) | `#8B7355` | `#C17C60` | `#FAF7F2` | 따뜻하고 세련된 |
| **Minimal** | `#4A5568` | `#718096` | `#F7FAFC` | 깔끔하고 모던한 |
| **Natural** | `#6B7C5B` | `#A8B89A` | `#F5F5F0` | 자연친화적 |

### 2.4 다크 모드

- MVP에서는 라이트 모드만 지원
- v2에서 다크 모드 추가 예정

---

## 3. 타이포그래피

### 3.1 폰트 패밀리

| 용도 | 폰트 | 대안 | 이유 |
|------|------|------|------|
| 본문 | **Pretendard** | system-ui, -apple-system, sans-serif | 한글 가독성 우수, 무료 |
| 숫자/코드 | **Pretendard** | monospace | 와이파이 비밀번호 등 고정폭 |

**설치:**
```css
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css');
```

### 3.2 타입 스케일

| 이름 | 크기 | 굵기 | 행간 | Tailwind | 용도 |
|------|------|------|------|----------|------|
| **Display** | 32px | Bold (700) | 1.2 | `text-3xl font-bold` | 숙소 이름 (가이드북 헤더) |
| **H1** | 24px | SemiBold (600) | 1.3 | `text-2xl font-semibold` | 섹션 제목 |
| **H2** | 20px | SemiBold (600) | 1.4 | `text-xl font-semibold` | 블록 제목 |
| **H3** | 18px | Medium (500) | 1.4 | `text-lg font-medium` | 서브 제목 |
| **Body Large** | 16px | Regular (400) | 1.6 | `text-base` | 강조 본문 |
| **Body** | 15px | Regular (400) | 1.6 | `text-[15px]` | 기본 본문 |
| **Caption** | 13px | Regular (400) | 1.5 | `text-sm` | 부가 정보, 힌트 |
| **Small** | 12px | Regular (400) | 1.4 | `text-xs` | 타임스탬프, 뱃지 |

### 3.3 텍스트 색상 사용

| 용도 | 색상 | Tailwind |
|------|------|----------|
| 주요 텍스트 | Text Primary | `text-stone-800` |
| 보조 텍스트 | Text Secondary | `text-stone-500` |
| 비활성 텍스트 | Light Gray | `text-stone-400` |
| 링크 | Primary | `text-amber-700` |
| 에러 메시지 | Error | `text-red-500` |

---

## 4. 간격 토큰 (Spacing)

### 4.1 기본 간격

| 이름 | 값 | Tailwind | 용도 |
|------|-----|----------|------|
| **xs** | 4px | `p-1`, `gap-1` | 아이콘-텍스트 간격 |
| **sm** | 8px | `p-2`, `gap-2` | 요소 내부 여백 |
| **md** | 16px | `p-4`, `gap-4` | 요소 간 간격, 카드 패딩 |
| **lg** | 24px | `p-6`, `gap-6` | 블록 간 간격 |
| **xl** | 32px | `p-8`, `gap-8` | 섹션 간 간격 |
| **2xl** | 48px | `p-12`, `gap-12` | 페이지 상하 여백 |

### 4.2 모바일 레이아웃

```
┌────────────────────────────────────┐
│         Safe Area (20px)           │
├────────────────────────────────────┤
│  ┌──────────────────────────────┐  │
│  │     Cover Image (100%)       │  │ 16px
│  └──────────────────────────────┘  │
│                                    │ 24px (lg)
│  ┌──────────────────────────────┐  │
│  │      Info Block Card         │  │ 16px
│  │      padding: 16px (md)      │  │ 16px
│  └──────────────────────────────┘  │
│                                    │ 16px (md)
│  ┌──────────────────────────────┐  │
│  │      Info Block Card         │  │
│  └──────────────────────────────┘  │
│                                    │
├────────────────────────────────────┤
│         Safe Area (20px)           │
└────────────────────────────────────┘

좌우 패딩: 20px (모바일), 24px (태블릿 이상)
```

---

## 5. 기본 컴포넌트

### 5.1 버튼 (Button)

#### 종류별 스타일

| 종류 | 기본 | 호버 | 포커스 | 비활성 |
|------|------|------|--------|--------|
| **Primary** | `bg-amber-700 text-white` | `bg-amber-800` | `ring-2 ring-amber-500` | `opacity-50` |
| **Secondary** | `border border-amber-700 text-amber-700` | `bg-amber-50` | `ring-2 ring-amber-500` | `opacity-50` |
| **Ghost** | `text-amber-700` | `underline` | `ring-2 ring-amber-500` | `opacity-50` |
| **Accent** | `bg-orange-400 text-white` | `bg-orange-500` | `ring-2 ring-orange-300` | `opacity-50` |

#### 크기

| 크기 | 높이 | 패딩 | 폰트 | Tailwind |
|------|------|------|------|----------|
| **Large** | 48px | 24px | 16px | `h-12 px-6 text-base` |
| **Medium** | 40px | 16px | 15px | `h-10 px-4 text-[15px]` |
| **Small** | 32px | 12px | 13px | `h-8 px-3 text-sm` |

#### 아이콘 버튼

```tsx
// 복사 버튼 예시
<button className="flex items-center gap-2 h-10 px-4 bg-amber-700 text-white rounded-lg">
  <CopyIcon className="w-5 h-5" />
  <span>복사하기</span>
</button>
```

### 5.2 입력 필드 (Input)

| 상태 | 스타일 |
|------|--------|
| 기본 | `border border-stone-200 bg-white rounded-lg px-4 py-3` |
| 포커스 | `border-amber-500 ring-2 ring-amber-200` |
| 에러 | `border-red-400 ring-2 ring-red-100` |
| 비활성 | `bg-stone-100 text-stone-400 cursor-not-allowed` |

**라벨 + 입력 구조:**
```tsx
<div className="space-y-2">
  <label className="text-sm font-medium text-stone-700">와이파이 이름</label>
  <input className="w-full border border-stone-200 rounded-lg px-4 py-3 focus:border-amber-500 focus:ring-2 focus:ring-amber-200" />
  <p className="text-xs text-stone-500">손님에게 보여질 와이파이 이름입니다</p>
</div>
```

### 5.3 카드 (Card) - 정보 블록

가이드북의 핵심 UI 요소입니다.

| 속성 | 값 | Tailwind |
|------|-----|----------|
| 배경 | Surface (Cream) | `bg-[#FAF7F2]` |
| 테두리 | Light Tan | `border border-stone-200` |
| 모서리 | 12px | `rounded-xl` |
| 그림자 | soft | `shadow-sm` |
| 내부 여백 | 16px | `p-4` |

**정보 블록 카드 예시:**
```tsx
<div className="bg-[#FAF7F2] border border-stone-200 rounded-xl p-4 shadow-sm">
  <div className="flex items-center gap-2 mb-3">
    <WifiIcon className="w-5 h-5 text-amber-700" />
    <h3 className="font-semibold text-stone-800">와이파이</h3>
  </div>
  <div className="space-y-2">
    <div className="flex justify-between items-center">
      <span className="text-stone-500">이름</span>
      <span className="font-medium">MinjisHouse_5G</span>
    </div>
    <div className="flex justify-between items-center">
      <span className="text-stone-500">비밀번호</span>
      <div className="flex items-center gap-2">
        <span className="font-medium font-mono">welcome2024!</span>
        <button className="p-2 hover:bg-stone-100 rounded-lg">
          <CopyIcon className="w-4 h-4 text-amber-700" />
        </button>
      </div>
    </div>
  </div>
</div>
```

### 5.4 토스트 (Toast)

| 유형 | 배경 | 아이콘 | 텍스트 |
|------|------|--------|--------|
| Success | `bg-green-50 border-green-200` | CheckCircle | `text-green-800` |
| Error | `bg-red-50 border-red-200` | XCircle | `text-red-800` |
| Info | `bg-blue-50 border-blue-200` | Info | `text-blue-800` |

**위치:** 하단 중앙, 모바일 Safe Area 고려

---

## 6. 가이드북 레이아웃

### 6.1 모바일 가이드북 구조

```
┌─────────────────────────────────────┐
│                                     │
│         [Cover Image]               │  ratio: 16:9
│         숙소 대표 사진               │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  숙소 이름                           │  Display, Bold
│  간단한 소개 문구                     │  Body, Secondary
│                                     │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 📶 와이파이                  │   │  Info Block
│  │ SSID: MinjisHouse_5G        │   │
│  │ PW: ●●●●●●●● [복사]         │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 📍 위치 안내                 │   │  Info Block
│  │ [지도 미니뷰]                │   │
│  │ 주소: 서울시 마포구...        │   │
│  │ [카카오맵에서 열기]          │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ ⏰ 체크인/아웃               │   │  Info Block
│  │ IN: 15:00 / OUT: 11:00      │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🍽️ 주변 추천                 │   │  Recommendation
│  │ [맛집 카드 1]                │   │
│  │ [맛집 카드 2]                │   │
│  │ [카페 카드 1]                │   │
│  └─────────────────────────────┘   │
│                                     │
├─────────────────────────────────────┤
│  Made with Roomy                    │  Footer
└─────────────────────────────────────┘
```

### 6.2 반응형 브레이크포인트

| 이름 | 크기 | 용도 |
|------|------|------|
| **Mobile** | < 640px | 손님 가이드북 기본 |
| **Tablet** | 640px ~ 1024px | 호스트 대시보드 |
| **Desktop** | > 1024px | 호스트 대시보드 |

---

## 7. 접근성 체크리스트

### 7.1 필수 (MVP)

- [x] **색상 대비**: 텍스트와 배경의 대비율 4.5:1 이상 (Charcoal on Cream = 7.2:1)
- [x] **포커스 링**: 키보드 탐색 시 `ring-2 ring-amber-500` 표시
- [x] **클릭 영역**: 버튼/링크 최소 44x44px (터치 타겟)
- [x] **에러 표시**: 색상 + 아이콘 + 텍스트 병행
- [x] **폰트 크기**: 본문 최소 15px

### 7.2 권장 (v2)

- [ ] 키보드 전체 탐색 가능 (Tab, Enter, Escape)
- [ ] 스크린 리더 호환 (ARIA 라벨)
- [ ] `prefers-reduced-motion` 존중
- [ ] 고대비 모드 지원

---

## 8. 아이콘 & 일러스트

### 8.1 아이콘 라이브러리

**선택: Lucide Icons**

| 항목 | 설명 |
|------|------|
| 라이브러리 | [Lucide](https://lucide.dev) |
| 스타일 | 라운드 라인 아이콘 (따뜻한 느낌) |
| 패키지 | `lucide-react` |

### 8.2 주요 아이콘 매핑

| 용도 | 아이콘 | 이름 |
|------|--------|------|
| 와이파이 | 📶 | `Wifi` |
| 지도/위치 | 📍 | `MapPin` |
| 체크인 | ⏰ | `Clock` |
| 맛집 | 🍽️ | `Utensils` |
| 카페 | ☕ | `Coffee` |
| 관광지 | 🏛️ | `Landmark` |
| 복사 | 📋 | `Copy` |
| 체크 | ✓ | `Check` |
| 편집 | ✏️ | `Pencil` |
| 삭제 | 🗑️ | `Trash2` |
| 설정 | ⚙️ | `Settings` |

### 8.3 아이콘 사용 규칙

| 크기 | px | Tailwind | 용도 |
|------|-----|----------|------|
| Small | 16px | `w-4 h-4` | 인라인, 버튼 내 |
| Medium | 20px | `w-5 h-5` | 기본, 카드 헤더 |
| Large | 24px | `w-6 h-6` | 강조, 빈 상태 |

- 색상: 상황에 맞게 (`text-amber-700`, `text-stone-500` 등)
- 버튼 내: 텍스트 왼쪽, 8px 간격

---

## 9. 애니메이션 & 트랜지션

### 9.1 기본 원칙

- **절제된 사용**: 필수적인 피드백에만 사용
- **빠른 응답**: 300ms 이하
- **자연스러움**: ease-out 또는 ease-in-out

### 9.2 트랜지션 토큰

| 이름 | Duration | Easing | 용도 |
|------|----------|--------|------|
| **fast** | 150ms | ease-out | 버튼 호버, 토글 |
| **normal** | 200ms | ease-out | 모달, 드롭다운 |
| **slow** | 300ms | ease-in-out | 페이지 전환, 토스트 |

### 9.3 Tailwind 적용

```tsx
// 버튼 호버
<button className="transition-colors duration-150 ease-out hover:bg-amber-800">

// 토스트 슬라이드업
<div className="animate-in slide-in-from-bottom duration-300">
```

---

## 10. shadcn/ui 커스터마이징

### 10.1 globals.css 테마 변수

```css
@layer base {
  :root {
    --background: 40 33% 99%;      /* Off White */
    --foreground: 30 6% 16%;       /* Charcoal */

    --card: 40 30% 97%;            /* Cream */
    --card-foreground: 30 6% 16%;

    --primary: 30 24% 44%;         /* Warm Brown */
    --primary-foreground: 0 0% 100%;

    --secondary: 30 8% 88%;        /* Light Tan */
    --secondary-foreground: 30 6% 16%;

    --muted: 30 8% 88%;
    --muted-foreground: 30 5% 39%; /* Warm Gray */

    --accent: 20 55% 56%;          /* Terracotta */
    --accent-foreground: 0 0% 100%;

    --destructive: 0 60% 65%;      /* Coral */
    --destructive-foreground: 0 0% 100%;

    --border: 30 14% 89%;          /* Light Tan */
    --input: 30 14% 89%;
    --ring: 30 24% 44%;            /* Warm Brown */

    --radius: 0.75rem;             /* 12px rounded corners */
  }
}
```

### 10.2 tailwind.config.ts 확장

```typescript
const config = {
  theme: {
    extend: {
      colors: {
        warm: {
          50: '#FAF7F2',
          100: '#F5F0E8',
          200: '#E8E2D9',
          300: '#D4C4B0',
          400: '#C17C60',
          500: '#8B7355',
          600: '#6B6560',
          700: '#5C4D3D',
          800: '#2D2A26',
        },
      },
      fontFamily: {
        sans: ['Pretendard', 'system-ui', 'sans-serif'],
      },
    },
  },
};
```

---

## Decision Log 참조

| ID | 항목 | 선택 | 근거 |
|----|------|------|------|
| D-04 | UI 스타일 | 모바일 청첩장 | 노션 대비 차별점, 감성 숙소 타겟 |
| D-20 | 폰트 | Pretendard | 한글 가독성 우수, 무료, 모던 |
| D-21 | 아이콘 | Lucide | 라운드 스타일로 따뜻한 느낌 |
| D-22 | 컬러 | Warm Brown 베이스 | 따뜻하고 환대하는 감성 |
| D-23 | 컴포넌트 | shadcn/ui | Tailwind 기반, 커스터마이징 용이 |
