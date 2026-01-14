import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex h-16 items-center justify-center border-b border-neutral-100">
        <Link href="/" className="text-heading-md font-bold text-primary-500">
          Roomy
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">{children}</div>
      </main>

      {/* Footer */}
      <footer className="flex h-16 items-center justify-center border-t border-neutral-100">
        <p className="text-body-sm text-text-tertiary">
          © 2024 Roomy. 게스트에게 더 나은 경험을.
        </p>
      </footer>
    </div>
  )
}
