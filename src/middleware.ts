import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// 공개 라우트 정의 (인증 없이 접근 가능)
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/public/(.*)',
  '/g/(.*)', // 공개 가이드북 뷰어
]);

export default clerkMiddleware(async (auth, request) => {
  // 보호된 라우트는 로그인 필요
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
