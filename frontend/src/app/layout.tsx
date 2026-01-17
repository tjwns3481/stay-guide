import type { Metadata, Viewport } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: {
    default: 'Roomy - 숙소 안내서',
    template: '%s | Roomy',
  },
  description: '앱 설치 없이 URL로 전달하는 숙박업소용 모바일 웹 안내서 & AI 챗봇',
  keywords: ['숙소', '안내서', '펜션', '에어비앤비', '게스트하우스', 'AI 컨시어지'],
  authors: [{ name: 'Roomy' }],
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    siteName: 'Roomy',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#E07A5F',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="ko" suppressHydrationWarning>
        <body className="font-sans antialiased">
          <Providers>{children}</Providers>
          <Analytics />
          <SpeedInsights />
        </body>
      </html>
    </ClerkProvider>
  )
}
