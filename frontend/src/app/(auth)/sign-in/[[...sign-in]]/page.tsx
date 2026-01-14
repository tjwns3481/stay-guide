import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="flex flex-col items-center">
      <div className="mb-8 text-center">
        <h1 className="text-display-sm font-bold text-text-primary">
          다시 만나서 반가워요
        </h1>
        <p className="mt-2 text-body-md text-text-secondary">
          Roomy에 로그인하고 안내서를 관리하세요
        </p>
      </div>
      <SignIn
        appearance={{
          elements: {
            formButtonPrimary:
              'bg-primary-500 hover:bg-primary-600 text-sm normal-case',
            card: 'shadow-card',
            headerTitle: 'hidden',
            headerSubtitle: 'hidden',
            socialButtonsBlockButton:
              'border border-neutral-200 hover:bg-neutral-50',
            formFieldInput:
              'border-neutral-200 focus:border-primary-500 focus:ring-primary-500',
            footerActionLink: 'text-primary-500 hover:text-primary-600',
          },
        }}
      />
    </div>
  )
}
