import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// 보호된 라우트 정의 (인증 필요)
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/editor(.*)',
  '/settings(.*)',
  '/admin(.*)',
])

// 인증 라우트 정의 (로그인 시 리다이렉트)
const isAuthRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
])

// 공개 라우트 정의 (인증 불필요)
const isPublicRoute = createRouteMatcher([
  '/',
  '/g/(.*)',  // 게스트용 안내서 페이지
  '/demo(.*)',
  '/api/webhooks(.*)',  // 웹훅은 공개
])

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth()
  const { pathname } = req.nextUrl

  // 1. 보호된 라우트에 비로그인 접근 시 → 로그인 페이지로 리다이렉트
  if (isProtectedRoute(req) && !userId) {
    const signInUrl = new URL('/sign-in', req.url)
    signInUrl.searchParams.set('redirect_url', req.url)
    return NextResponse.redirect(signInUrl)
  }

  // 2. 로그인 상태에서 인증 페이지 접근 시 → 대시보드로 리다이렉트
  if (isAuthRoute(req) && userId) {
    // redirect_url 파라미터가 있으면 해당 URL로 리다이렉트
    const redirectUrl = req.nextUrl.searchParams.get('redirect_url')
    if (redirectUrl) {
      try {
        const url = new URL(redirectUrl, req.url)
        // 외부 URL 방지 (same origin만 허용)
        if (url.origin === req.nextUrl.origin) {
          return NextResponse.redirect(url)
        }
      } catch {
        // Invalid URL, redirect to dashboard
      }
    }
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // 3. 루트 페이지에서 로그인 상태면 대시보드로 리다이렉트
  if (pathname === '/' && userId) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
