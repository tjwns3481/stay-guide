import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Wifi, MapPin, Clock } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-background">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
          Roomy
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          앱 없이 링크 하나로,
          <br />
          소규모 숙박업소를 위한 감성 객실 안내서
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button size="lg" className="btn-primary">
            시작하기
          </Button>
          <Button size="lg" variant="secondary" className="btn-secondary">
            데모 보기
          </Button>
        </div>
      </div>

      {/* Design System 컴포넌트 미리보기 */}
      <div className="w-full max-w-4xl space-y-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">디자인 시스템 미리보기</h2>

        {/* 버튼 샘플 */}
        <Card>
          <CardHeader>
            <CardTitle>버튼 스타일</CardTitle>
            <CardDescription>shadcn/ui 버튼 컴포넌트</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Link</Button>
          </CardContent>
        </Card>

        {/* 정보 블록 카드 샘플 */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Wifi className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">와이파이</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">이름</span>
                <span className="font-medium">MinjisHouse_5G</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">비밀번호</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium font-mono">welcome2024!</span>
                  <Button size="sm" variant="ghost">복사</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">위치</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">서울시 마포구...</p>
              <Button size="sm" className="w-full" variant="outline">
                카카오맵에서 열기
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 입력 필드 샘플 */}
        <Card>
          <CardHeader>
            <CardTitle>입력 필드</CardTitle>
            <CardDescription>Form 컴포넌트 스타일</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">와이파이 이름</label>
              <Input placeholder="예: MinjisHouse_5G" />
              <p className="text-xs text-muted-foreground">손님에게 보여질 와이파이 이름입니다</p>
            </div>
          </CardContent>
        </Card>

        {/* 컬러 팔레트 */}
        <Card>
          <CardHeader>
            <CardTitle>컬러 팔레트</CardTitle>
            <CardDescription>Design System 컬러</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="h-20 rounded-lg bg-primary border border-border"></div>
                <p className="text-xs font-medium">Primary</p>
              </div>
              <div className="space-y-2">
                <div className="h-20 rounded-lg bg-secondary border border-border"></div>
                <p className="text-xs font-medium">Secondary</p>
              </div>
              <div className="space-y-2">
                <div className="h-20 rounded-lg bg-accent border border-border"></div>
                <p className="text-xs font-medium">Accent</p>
              </div>
              <div className="space-y-2">
                <div className="h-20 rounded-lg bg-destructive border border-border"></div>
                <p className="text-xs font-medium">Destructive</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
