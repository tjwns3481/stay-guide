/**
 * Dashboard Layout
 * 인증된 사용자용 대시보드 레이아웃
 */

import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-foreground">Roomy</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/dashboard"
              className="text-foreground/60 hover:text-foreground transition-colors"
            >
              대시보드
            </Link>
            <Link
              href="/dashboard/guidebooks"
              className="text-foreground/60 hover:text-foreground transition-colors"
            >
              가이드북
            </Link>
            <Link
              href="/dashboard/settings"
              className="text-foreground/60 hover:text-foreground transition-colors"
            >
              설정
            </Link>
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: 'w-9 h-9',
                  userButtonPopoverCard: 'bg-card border border-border shadow-lg',
                  userButtonPopoverActionButton:
                    'text-foreground hover:bg-secondary',
                  userButtonPopoverActionButtonText: 'text-foreground',
                  userButtonPopoverFooter: 'hidden',
                },
              }}
              afterSignOutUrl="/"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">{children}</main>
    </div>
  );
}
