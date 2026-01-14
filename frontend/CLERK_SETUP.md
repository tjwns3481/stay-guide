# Clerk 소셜 로그인 설정 가이드

이 문서는 Roomy 프로젝트에서 Clerk를 사용한 소셜 로그인(Google, Kakao)을 설정하는 방법을 설명합니다.

## 목차
1. [Clerk 프로젝트 생성](#1-clerk-프로젝트-생성)
2. [Google OAuth 설정](#2-google-oauth-설정)
3. [Kakao OAuth 설정](#3-kakao-oauth-설정)
4. [환경 변수 설정](#4-환경-변수-설정)
5. [로컬 테스트](#5-로컬-테스트)
6. [트러블슈팅](#6-트러블슈팅)

---

## 1. Clerk 프로젝트 생성

### 1.1 Clerk 계정 가입
1. [Clerk Dashboard](https://dashboard.clerk.com/)에 접속합니다.
2. 이메일 또는 GitHub 계정으로 회원가입/로그인합니다.

### 1.2 새 애플리케이션 생성
1. Dashboard에서 **"Create Application"** 버튼을 클릭합니다.
2. 애플리케이션 이름을 입력합니다 (예: `Roomy`)
3. 로그인 방법을 선택합니다:
   - ✅ **Google** (체크)
   - ✅ **Email** (선택사항 - 테스트용)
   - Kakao는 나중에 추가합니다 (기본 지원 안 함)
4. **"Create Application"** 버튼을 클릭합니다.

### 1.3 API Keys 확인
- 생성 후 자동으로 API Keys 페이지로 이동됩니다.
- 다음 두 키를 복사해 둡니다:
  - **Publishable Key** (예: `pk_test_...`)
  - **Secret Key** (예: `sk_test_...`)

> 🔑 **중요**: Secret Key는 절대 프론트엔드 코드에 노출되면 안 됩니다!

---

## 2. Google OAuth 설정

Clerk는 기본적으로 Clerk의 공유 OAuth 앱을 사용합니다. 프로덕션에서는 자체 Google OAuth 앱을 사용하는 것을 권장합니다.

### 2.1 개발 환경 (Clerk 공유 앱 사용)
Clerk가 제공하는 기본 Google OAuth를 사용하면 별도 설정 없이 바로 사용할 수 있습니다.

1. Clerk Dashboard → **"User & Authentication"** → **"Social Connections"**로 이동합니다.
2. **Google** 토글을 활성화합니다.
3. 설정 완료!

### 2.2 프로덕션 환경 (자체 OAuth 앱 사용)

#### Step 1: Google Cloud Console에서 OAuth 앱 생성
1. [Google Cloud Console](https://console.cloud.google.com/)에 접속합니다.
2. 프로젝트를 생성하거나 기존 프로젝트를 선택합니다.
3. **"APIs & Services"** → **"Credentials"**로 이동합니다.
4. **"Create Credentials"** → **"OAuth 2.0 Client IDs"**를 선택합니다.
5. **"Application type"**을 **"Web application"**으로 선택합니다.
6. 다음 정보를 입력합니다:
   - **Name**: `Roomy - Google Login`
   - **Authorized JavaScript origins**:
     ```
     https://yourdomain.com
     https://accounts.clerk.dev
     ```
   - **Authorized redirect URIs**:
     ```
     https://accounts.clerk.dev/v1/oauth_callback
     ```
7. **"Create"** 버튼을 클릭합니다.
8. 생성된 **Client ID**와 **Client Secret**을 복사합니다.

#### Step 2: Clerk에 OAuth 앱 등록
1. Clerk Dashboard → **"User & Authentication"** → **"Social Connections"** → **Google**로 이동합니다.
2. **"Use custom credentials"** 토글을 활성화합니다.
3. Google Cloud Console에서 복사한 정보를 입력합니다:
   - **Client ID**: `[Google OAuth Client ID]`
   - **Client Secret**: `[Google OAuth Client Secret]`
4. **"Save"** 버튼을 클릭합니다.

#### 스크린샷 참조
- [Google Cloud Console OAuth 설정](https://clerk.com/docs/authentication/social-connections/google#configuring-google)

---

## 3. Kakao OAuth 설정

Clerk는 Kakao를 기본 지원하지 않으므로, **Custom OAuth 2.0 Provider**로 설정해야 합니다.

### Step 1: Kakao Developers에서 앱 생성
1. [Kakao Developers](https://developers.kakao.com/)에 접속합니다.
2. 로그인 후 **"내 애플리케이션"** → **"애플리케이션 추가하기"**를 클릭합니다.
3. 다음 정보를 입력합니다:
   - **앱 이름**: `Roomy`
   - **사업자명**: (개인 또는 회사명)
4. **"저장"** 버튼을 클릭합니다.

### Step 2: Kakao 플랫폼 등록
1. 생성된 앱을 클릭 → **"플랫폼"** 메뉴로 이동합니다.
2. **"Web 플랫폼 등록"**을 클릭합니다.
3. **사이트 도메인**을 입력합니다:
   ```
   http://localhost:3000  (개발환경)
   https://yourdomain.com (프로덕션)
   ```

### Step 3: Kakao Redirect URI 설정
1. **"제품 설정"** → **"카카오 로그인"**으로 이동합니다.
2. **"활성화 설정"**을 **ON**으로 변경합니다.
3. **"Redirect URI"**에 다음을 추가합니다:
   ```
   https://accounts.clerk.dev/v1/oauth_callback
   ```
4. **"저장"** 버튼을 클릭합니다.

### Step 4: Kakao 동의 항목 설정
1. **"제품 설정"** → **"카카오 로그인"** → **"동의 항목"**으로 이동합니다.
2. 다음 항목을 **필수 동의**로 설정합니다:
   - **닉네임** (필수)
   - **프로필 사진** (선택)
   - **카카오계정(이메일)** (필수)

### Step 5: Kakao API Key 확인
1. **"앱 설정"** → **"앱 키"**로 이동합니다.
2. 다음 키를 복사합니다:
   - **REST API 키**: Clerk의 Client ID로 사용
3. **"제품 설정"** → **"카카오 로그인"** → **"보안"**으로 이동합니다.
4. **"Client Secret"**를 생성하고 복사합니다 (선택사항이지만 권장).

### Step 6: Clerk에 Kakao Custom OAuth 등록
1. Clerk Dashboard → **"User & Authentication"** → **"Social Connections"**로 이동합니다.
2. 하단의 **"Add connection"** 버튼을 클릭합니다.
3. **"Custom OAuth 2.0"**을 선택합니다.
4. 다음 정보를 입력합니다:

   **Basic Information:**
   - **Name**: `Kakao`
   - **Key**: `kakao` (URL에 사용됨)
   - **Logo URL**: `https://developers.kakao.com/assets/img/about/logos/kakaolink/kakaolink_btn_medium.png`

   **OAuth 2.0 Configuration:**
   - **Client ID**: `[Kakao REST API 키]`
   - **Client Secret**: `[Kakao Client Secret]` (생성한 경우)
   - **Authorization URL**: `https://kauth.kakao.com/oauth/authorize`
   - **Token URL**: `https://kauth.kakao.com/oauth/token`
   - **Scope**: `profile_nickname profile_image account_email`
   - **User Info URL**: `https://kapi.kakao.com/v2/user/me`

   **User Mapping (JSON Path):**
   - **ID**: `id`
   - **Email**: `kakao_account.email`
   - **First Name**: `properties.nickname`
   - **Avatar URL**: `properties.profile_image`

5. **"Save"** 버튼을 클릭합니다.

### 스크린샷 참조
- [Kakao 로그인 활성화](https://developers.kakao.com/docs/latest/ko/kakaologin/prerequisite#activate-service)
- [Clerk Custom OAuth 설정](https://clerk.com/docs/authentication/social-connections/custom-provider)

---

## 4. 환경 변수 설정

### 4.1 `.env.local` 파일 생성
프로젝트 루트의 `frontend/` 폴더에 `.env.local` 파일을 생성합니다:

```bash
cd frontend
cp ../.env.example .env.local
```

### 4.2 환경 변수 입력
`.env.local` 파일을 열고 Clerk API Keys를 입력합니다:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
```

> ⚠️ **주의사항**:
> - `NEXT_PUBLIC_` 접두사가 붙은 변수는 브라우저에서 접근 가능합니다.
> - `CLERK_SECRET_KEY`는 서버 사이드에서만 사용되며, 절대 프론트엔드 코드에 노출되면 안 됩니다.
> - `.env.local` 파일은 `.gitignore`에 포함되어 있어 Git에 커밋되지 않습니다.

### 4.3 환경 변수 확인
다음 파일들이 올바르게 설정되었는지 확인합니다:

```bash
# .env.local 파일 존재 확인
ls -la frontend/.env.local

# .gitignore에 .env.local이 포함되어 있는지 확인
cat frontend/.gitignore | grep .env.local
```

---

## 5. 로컬 테스트

### 5.1 개발 서버 실행
```bash
cd frontend
npm install  # 처음 한 번만
npm run dev
```

브라우저에서 `http://localhost:3000`을 엽니다.

### 5.2 로그인 테스트

#### Google 로그인 테스트
1. **"Sign In"** 버튼을 클릭합니다.
2. **"Continue with Google"** 버튼을 클릭합니다.
3. Google 계정을 선택하고 로그인합니다.
4. 권한 동의 화면에서 **"허용"**을 클릭합니다.
5. 로그인 성공 시 `/dashboard`로 리다이렉트됩니다.

#### Kakao 로그인 테스트
1. **"Sign In"** 버튼을 클릭합니다.
2. **"Continue with Kakao"** 버튼을 클릭합니다.
3. Kakao 계정으로 로그인합니다.
4. 동의 화면에서 **"동의하고 계속하기"**를 클릭합니다.
5. 로그인 성공 시 `/dashboard`로 리다이렉트됩니다.

### 5.3 로그인 상태 확인
Clerk는 자동으로 사용자 세션을 관리합니다. 다음 방법으로 확인할 수 있습니다:

```tsx
// 클라이언트 컴포넌트에서
import { useUser } from '@clerk/nextjs'

export default function Profile() {
  const { user, isLoaded, isSignedIn } = useUser()

  if (!isLoaded) return <div>Loading...</div>
  if (!isSignedIn) return <div>Not signed in</div>

  return <div>Hello, {user.firstName}!</div>
}
```

```tsx
// 서버 컴포넌트에서
import { auth, currentUser } from '@clerk/nextjs/server'

export default async function DashboardPage() {
  const { userId } = await auth()
  const user = await currentUser()

  if (!userId) {
    return <div>Not authenticated</div>
  }

  return <div>User ID: {userId}</div>
}
```

---

## 6. 트러블슈팅

### 문제 1: "Invalid API Key" 에러
**원인**: 환경 변수가 잘못 설정되었거나 누락되었습니다.

**해결 방법**:
1. `.env.local` 파일에 `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`와 `CLERK_SECRET_KEY`가 올바르게 입력되었는지 확인합니다.
2. 개발 서버를 재시작합니다 (`Ctrl + C` 후 `npm run dev`).
3. Clerk Dashboard에서 API Keys를 다시 확인합니다.

### 문제 2: Google 로그인 후 "Redirect URI Mismatch" 에러
**원인**: Google Cloud Console에 등록된 Redirect URI가 Clerk의 콜백 URL과 일치하지 않습니다.

**해결 방법**:
1. Google Cloud Console → OAuth Client → **"Authorized redirect URIs"**에 다음이 포함되어 있는지 확인합니다:
   ```
   https://accounts.clerk.dev/v1/oauth_callback
   ```
2. Clerk Dashboard → **"Social Connections"** → **"Google"**에서 **"Callback URL"**을 확인합니다.

### 문제 3: Kakao 로그인 시 "Invalid Redirect URI" 에러
**원인**: Kakao Developers에 등록된 Redirect URI가 Clerk와 일치하지 않습니다.

**해결 방법**:
1. Kakao Developers → 앱 선택 → **"카카오 로그인"** → **"Redirect URI"**에 다음이 추가되어 있는지 확인합니다:
   ```
   https://accounts.clerk.dev/v1/oauth_callback
   ```
2. 개발 환경에서는 `http://localhost:3000`도 추가해야 할 수 있습니다.

### 문제 4: Kakao 로그인 후 이메일 정보가 없음
**원인**: Kakao에서 이메일 동의 항목이 필수로 설정되지 않았습니다.

**해결 방법**:
1. Kakao Developers → **"카카오 로그인"** → **"동의 항목"**으로 이동합니다.
2. **"카카오계정(이메일)"** 항목을 **"필수 동의"**로 설정합니다.
3. 기존에 로그인한 사용자는 로그아웃 후 다시 로그인해야 합니다.

### 문제 5: "Middleware not found" 에러
**원인**: Next.js 13+ App Router에서 Clerk 미들웨어가 올바르게 설정되지 않았습니다.

**해결 방법**:
1. `frontend/src/middleware.ts` 파일이 존재하는지 확인합니다.
2. 파일 내용이 다음과 같은지 확인합니다:
   ```ts
   import { clerkMiddleware } from '@clerk/nextjs/server'

   export default clerkMiddleware()

   export const config = {
     matcher: [
       '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
       '/(api|trpc)(.*)',
     ],
   }
   ```

### 문제 6: 로그인 후 리다이렉트가 작동하지 않음
**원인**: `middleware.ts`의 리다이렉트 로직이 잘못되었습니다.

**해결 방법**:
1. `frontend/src/middleware.ts` 파일을 확인합니다.
2. 보호된 라우트(`/dashboard`, `/editor` 등)가 `isProtectedRoute`에 포함되어 있는지 확인합니다.
3. 로그인 후 `redirect_url` 파라미터가 올바르게 전달되는지 확인합니다.

---

## 참고 자료
- [Clerk 공식 문서](https://clerk.com/docs)
- [Clerk Next.js 가이드](https://clerk.com/docs/quickstarts/nextjs)
- [Clerk Social Connections](https://clerk.com/docs/authentication/social-connections/overview)
- [Kakao 로그인 가이드](https://developers.kakao.com/docs/latest/ko/kakaologin/common)
- [Google OAuth 2.0 가이드](https://developers.google.com/identity/protocols/oauth2)

---

## 라이선스
이 문서는 Roomy 프로젝트의 일부이며, MIT 라이선스 하에 배포됩니다.
