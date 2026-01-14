'use client'

import { useAuthStore, selectLicense, selectIsPremium } from '@/stores/auth'
import { LicenseForm, PlanCard, PlanComparison } from '@/components/license'
import { Card, CardContent } from '@/components/ui/Card'
import { ExternalLink } from 'lucide-react'
import Link from 'next/link'

export default function LicensePage() {
  const license = useAuthStore(selectLicense)
  const isPremium = useAuthStore(selectIsPremium)

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6">
      {/* Page Header */}
      <div>
        <Link
          href="/settings"
          className="mb-4 inline-flex items-center text-body-sm text-primary-500 hover:text-primary-600"
        >
          ← 설정으로 돌아가기
        </Link>
        <h1 className="text-display-sm font-bold text-text-primary">
          라이선스 관리
        </h1>
        <p className="mt-2 text-body-md text-text-secondary">
          라이선스를 관리하고 플랜을 업그레이드하세요.
        </p>
      </div>

      {/* Current Plan */}
      <section>
        <h2 className="mb-4 text-heading-md font-semibold text-text-primary">
          현재 플랜
        </h2>
        <PlanCard license={license} />
      </section>

      {/* License Key Input */}
      {!isPremium && (
        <section>
          <Card>
            <CardContent className="p-6">
              <LicenseForm />
            </CardContent>
          </Card>
        </section>
      )}

      {/* Plan Comparison */}
      <section>
        <Card>
          <CardContent className="p-6">
            <PlanComparison currentPlan={license?.plan || 'free'} />
          </CardContent>
        </Card>
      </section>

      {/* Purchase Link */}
      <section>
        <Card className="border-primary-200 bg-primary-50/30">
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                <h3 className="text-heading-sm font-semibold text-text-primary">
                  프리미엄 플랜 구매하기
                </h3>
                <p className="mt-2 text-body-sm text-text-secondary">
                  스마트스토어에서 라이선스를 구매하고 더 많은 기능을 이용하세요.
                </p>
                <ul className="mt-3 space-y-1 text-body-sm text-text-secondary">
                  <li>• 무제한 안내서 생성</li>
                  <li>• AI 컨시어지 기능</li>
                  <li>• 워터마크 제거</li>
                  <li>• 커스텀 테마 설정</li>
                </ul>
              </div>
              <a
                href="https://smartstore.naver.com/roomy"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2.5 text-body-sm font-medium text-white transition-colors hover:bg-primary-600"
              >
                스마트스토어 바로가기
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Help */}
      <section>
        <Card className="border-neutral-200 bg-neutral-50">
          <CardContent className="p-6">
            <h3 className="text-heading-sm font-semibold text-text-primary">
              도움이 필요하신가요?
            </h3>
            <p className="mt-2 text-body-sm text-text-secondary">
              라이선스 관련 문의사항은 고객센터로 연락주세요.
            </p>
            <div className="mt-3 space-y-1 text-body-sm">
              <p className="text-text-secondary">
                이메일:{' '}
                <a
                  href="mailto:support@roomy.app"
                  className="text-primary-500 hover:underline"
                >
                  support@roomy.app
                </a>
              </p>
              <p className="text-text-secondary">
                운영시간: 평일 10:00 - 18:00 (주말 및 공휴일 제외)
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
