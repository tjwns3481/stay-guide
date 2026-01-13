import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { Providers } from './providers';

const pretendard = localFont({
  src: [
    {
      path: '../../public/fonts/Pretendard-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Pretendard-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Pretendard-SemiBold.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Pretendard-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-pretendard',
  display: 'swap',
});

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
      <body className={`${pretendard.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
