# Design System - T0.4 완료

## 설치 완료 항목

### 1. shadcn/ui 초기화
- ✅ components.json 설정 (base color: stone, CSS variables)
- ✅ lib/utils.ts (cn 유틸리티)
- ✅ 필수 패키지 설치:
  - class-variance-authority
  - clsx
  - tailwind-merge
  - lucide-react
  - tailwindcss-animate

### 2. 설치된 컴포넌트
- ✅ Button (`src/components/ui/button.tsx`)
- ✅ Input (`src/components/ui/input.tsx`)
- ✅ Card (`src/components/ui/card.tsx`)
- ✅ Toast (`src/components/ui/toast.tsx`, `toaster.tsx`)
- ✅ use-toast hook (`src/hooks/use-toast.ts`)

### 3. 디자인 시스템 적용

#### globals.css - CSS Variables
```css
:root {
  --background: 40 33% 99%;      /* Off White #FEFDFB */
  --foreground: 30 6% 16%;       /* Charcoal #2D2A26 */
  --card: 40 30% 97%;            /* Cream #FAF7F2 */
  --primary: 30 24% 44%;         /* Warm Brown #8B7355 */
  --accent: 20 55% 56%;          /* Terracotta #C17C60 */
  --destructive: 0 60% 65%;      /* Coral #E07070 */
  --border: 30 14% 89%;          /* Light Tan #E8E2D9 */
  --radius: 0.75rem;             /* 12px */
}
```

#### tailwind.config.ts - 확장 컬러
- **Primary**: Warm Brown (#8B7355) - 주요 버튼, 강조
- **Secondary**: Soft Beige - 부드러운 배경
- **Accent**: Terracotta (#C17C60) - 포인트 컬러
- **Warm Palette**: 따뜻한 색상 팔레트 (50-800)

### 4. Pretendard 폰트
- ✅ CDN 링크 추가 (layout.tsx)
- ✅ font-sans 설정 (Pretendard Variable)

### 5. Lucide Icons
- ✅ lucide-react 설치
- ✅ 주요 아이콘: Wifi, MapPin, Clock, Copy, etc.

## 사용 예시

### Button
```tsx
import { Button } from '@/components/ui/button';

<Button>Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button size="lg">Large Button</Button>
```

### Card (정보 블록)
```tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wifi } from 'lucide-react';

<Card className="bg-card border-border">
  <CardHeader>
    <div className="flex items-center gap-2">
      <Wifi className="w-5 h-5 text-primary" />
      <CardTitle>와이파이</CardTitle>
    </div>
  </CardHeader>
  <CardContent>
    <p>MinjisHouse_5G</p>
  </CardContent>
</Card>
```

### Input
```tsx
import { Input } from '@/components/ui/input';

<Input placeholder="와이파이 이름 입력" />
```

### Toast
```tsx
import { useToast } from '@/hooks/use-toast';

const { toast } = useToast();

toast({
  title: "복사 완료!",
  description: "와이파이 비밀번호가 복사되었습니다.",
});
```

## 검증 완료
- ✅ `npm run type-check` - 타입 에러 없음
- ✅ `npm run build` - 빌드 성공
- ✅ `npm run dev` - 개발 서버 정상 실행
- ✅ 홈페이지에서 모든 컴포넌트 렌더링 확인

## 다음 단계
Phase 1에서 실제 기능 컴포넌트 구현 시 이 디자인 시스템을 활용합니다.
