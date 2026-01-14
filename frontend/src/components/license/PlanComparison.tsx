'use client'

import type { LicensePlan } from '@/contracts/types'
import { Check, X } from 'lucide-react'

interface PlanComparisonProps {
  currentPlan: LicensePlan
}

interface PlanFeature {
  name: string
  free: boolean | string
  monthly: boolean | string
  biannual: boolean | string
  annual: boolean | string
}

const features: PlanFeature[] = [
  {
    name: '안내서 개수',
    free: '1개',
    monthly: '무제한',
    biannual: '무제한',
    annual: '무제한',
  },
  {
    name: '블록 개수',
    free: '10개',
    monthly: '무제한',
    biannual: '무제한',
    annual: '무제한',
  },
  {
    name: 'AI 컨시어지',
    free: false,
    monthly: true,
    biannual: true,
    annual: true,
  },
  {
    name: '커스텀 테마',
    free: false,
    monthly: true,
    biannual: true,
    annual: true,
  },
  {
    name: '워터마크 제거',
    free: false,
    monthly: true,
    biannual: true,
    annual: true,
  },
  {
    name: '분석 통계',
    free: false,
    monthly: true,
    biannual: true,
    annual: true,
  },
]

const planNames: Record<LicensePlan, string> = {
  free: '무료',
  monthly: '월간',
  biannual: '6개월',
  annual: '연간',
}

const planPrices: Record<LicensePlan, string> = {
  free: '₩0',
  monthly: '₩9,900/월',
  biannual: '₩49,900/6개월',
  annual: '₩89,900/년',
}

export function PlanComparison({ currentPlan }: PlanComparisonProps) {
  const plans: LicensePlan[] = ['free', 'monthly', 'biannual', 'annual']

  return (
    <div>
      <h3 className="mb-4 text-heading-sm font-semibold text-text-primary">
        플랜 비교
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] border-collapse">
          <thead>
            <tr className="border-b border-neutral-200">
              <th className="p-4 text-left text-body-sm font-medium text-text-secondary">
                기능
              </th>
              {plans.map((plan) => (
                <th
                  key={plan}
                  className={`p-4 text-center ${
                    plan === currentPlan
                      ? 'bg-primary-50 border-l-2 border-r-2 border-t-2 border-primary-300'
                      : ''
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-heading-xs font-semibold text-text-primary">
                        {planNames[plan]}
                      </span>
                      {plan === currentPlan && (
                        <span className="rounded-full bg-primary-500 px-2 py-0.5 text-body-xs font-medium text-white">
                          현재
                        </span>
                      )}
                    </div>
                    <span className="text-body-sm text-text-secondary">
                      {planPrices[plan]}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {features.map((feature, idx) => (
              <tr
                key={feature.name}
                className={`border-b border-neutral-100 ${
                  idx % 2 === 0 ? 'bg-white' : 'bg-neutral-50/50'
                }`}
              >
                <td className="p-4 text-body-sm text-text-primary">
                  {feature.name}
                </td>
                {plans.map((plan) => (
                  <td
                    key={plan}
                    className={`p-4 text-center ${
                      plan === currentPlan
                        ? 'bg-primary-50/30 border-l-2 border-r-2 border-primary-300'
                        : ''
                    }`}
                  >
                    <FeatureValue value={feature[plan]} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

interface FeatureValueProps {
  value: boolean | string
}

function FeatureValue({ value }: FeatureValueProps) {
  if (typeof value === 'boolean') {
    return value ? (
      <Check className="mx-auto h-5 w-5 text-semantic-success" />
    ) : (
      <X className="mx-auto h-5 w-5 text-neutral-300" />
    )
  }

  return <span className="text-body-sm text-text-primary">{value}</span>
}

export default PlanComparison
