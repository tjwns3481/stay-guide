import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { koKR } from '@clerk/localizations';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'Roomy - 감성 객실 안내서',
  description: '앱 없이 링크 하나로, 소규모 숙박업소를 위한 모바일 객실 안내서',
  keywords: ['숙소', '가이드북', '객실안내', '펜션', '에어비앤비'],
  openGraph: {
    title: 'Roomy - 감성 객실 안내서',
    description: '앱 없이 링크 하나로, 소규모 숙박업소를 위한 모바일 객실 안내서',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      localization={koKR}
      appearance={{
        variables: {
          colorPrimary: '#8B7355',
          colorTextOnPrimaryBackground: '#FFFFFF',
          colorBackground: '#FEFDFB',
          colorInputBackground: '#FAF7F2',
          colorInputText: '#2D2A26',
          colorTextSecondary: '#6B6560',
          borderRadius: '0.75rem',
        },
        elements: {
          formButtonPrimary:
            'bg-[#8B7355] hover:bg-[#7A6548] text-white font-medium shadow-sm',
          card: 'bg-[#FAF7F2] shadow-lg border border-[#E8E2D9]',
          headerTitle: 'text-[#2D2A26] font-bold',
          headerSubtitle: 'text-[#6B6560]',
          socialButtonsBlockButton:
            'border border-[#E8E2D9] hover:bg-[#FAF7F2] transition-colors',
          socialButtonsBlockButtonText: 'text-[#2D2A26] font-medium',
          formFieldLabel: 'text-[#2D2A26] font-medium',
          formFieldInput:
            'border-[#E8E2D9] focus:border-[#8B7355] focus:ring-[#8B7355]',
          footerActionLink: 'text-[#8B7355] hover:text-[#7A6548]',
          identityPreviewEditButton: 'text-[#8B7355]',
        },
      }}
    >
      <html lang="ko">
        <head>
          <link
            rel="stylesheet"
            as="style"
            crossOrigin="anonymous"
            href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
          />
        </head>
        <body className="font-sans antialiased">
          <Providers>
            {children}
            <Toaster />
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
