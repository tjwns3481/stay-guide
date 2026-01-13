/**
 * Auth Layout
 * 인증 페이지 (로그인/회원가입) 공통 레이아웃
 */

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      {/* Logo & Branding */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-foreground">Roomy</h1>
        <p className="text-muted-foreground mt-2">감성 객실 안내서</p>
      </div>

      {/* Auth Content */}
      <div className="w-full max-w-md px-4">
        {children}
      </div>

      {/* Footer */}
      <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p>앱 없이 링크 하나로, 소규모 숙박업소를 위한 모바일 객실 안내서</p>
      </footer>
    </div>
  );
}
