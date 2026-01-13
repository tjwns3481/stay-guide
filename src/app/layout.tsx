import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
