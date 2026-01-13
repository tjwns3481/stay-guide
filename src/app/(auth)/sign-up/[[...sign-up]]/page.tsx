/**
 * Sign Up Page
 * Clerk 커스텀 회원가입 페이지 - Google & Kakao 소셜 로그인
 */

import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <SignUp
      appearance={{
        elements: {
          rootBox: 'mx-auto',
          card: 'bg-card shadow-lg border border-border rounded-xl',
          headerTitle: 'text-foreground text-xl font-bold',
          headerSubtitle: 'text-muted-foreground',
          socialButtonsBlockButton:
            'border border-border hover:bg-secondary transition-colors rounded-lg',
          socialButtonsBlockButtonText: 'text-foreground font-medium',
          socialButtonsProviderIcon: 'w-5 h-5',
          dividerLine: 'bg-border',
          dividerText: 'text-muted-foreground',
          formFieldLabel: 'text-foreground font-medium',
          formFieldInput:
            'border-border focus:border-primary focus:ring-primary rounded-lg',
          formButtonPrimary:
            'bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg',
          footerActionLink: 'text-primary hover:text-primary/80',
          identityPreviewEditButton: 'text-primary',
          formFieldAction: 'text-primary hover:text-primary/80',
          otpCodeFieldInput: 'border-border focus:border-primary',
        },
        layout: {
          socialButtonsPlacement: 'top',
          socialButtonsVariant: 'blockButton',
        },
      }}
      routing="path"
      path="/sign-up"
      signInUrl="/sign-in"
      fallbackRedirectUrl="/dashboard"
    />
  );
}
