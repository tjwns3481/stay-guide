import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="flex flex-col items-center">
      <div className="mb-8 text-center">
        <h1 className="text-display-sm font-bold text-text-primary">
          Roomy에 오신 것을 환영해요
        </h1>
        <p className="mt-2 text-body-md text-text-secondary">
          무료로 시작하고 게스트에게 더 나은 경험을 선물하세요
        </p>
      </div>
      <SignUp
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
