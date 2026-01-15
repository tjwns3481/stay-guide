import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { ApiClientProvider } from '@/components/providers/ApiClientProvider'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ApiClientProvider>
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-heading-md font-bold text-primary-500">
              Roomy
            </span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="text-body-sm font-medium text-text-secondary hover:text-text-primary"
            >
              대시보드
            </Link>
            <Link
              href="/editor"
              className="text-body-sm font-medium text-text-secondary hover:text-text-primary"
            >
              에디터
            </Link>
            <Link
              href="/settings"
              className="text-body-sm font-medium text-text-secondary hover:text-text-primary"
            >
              설정
            </Link>
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: 'h-9 w-9',
                },
              }}
            />
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
    </ApiClientProvider>
  )
}
