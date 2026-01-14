'use client'

import type { UserProfile } from '@/contracts/user.contract'
import { Crown, Calendar, CheckCircle, XCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'

interface PlanCardProps {
  license?: UserProfile['license']
}

export function PlanCard({ license }: PlanCardProps) {
  const getPlanName = (plan?: string) => {
    switch (plan) {
      case 'monthly':
        return '월간 플랜'
      case 'biannual':
        return '6개월 플랜'
      case 'annual':
        return '연간 플랜'
      default:
        return '무료 플랜'
    }
  }

  const isActive = license?.status === 'active'
  const isPremium = license?.plan !== 'free' && isActive

  return (
    <Card className={isPremium ? 'border-primary-300 bg-primary-50/30' : ''}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Crown
                className={`h-6 w-6 ${
                  isPremium ? 'text-primary-500' : 'text-neutral-400'
                }`}
              />
              <h3 className="text-heading-md font-semibold text-text-primary">
                {getPlanName(license?.plan)}
              </h3>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2">
                {isActive ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-semantic-success" />
                    <span className="text-body-sm text-text-secondary">활성</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 text-neutral-400" />
                    <span className="text-body-sm text-text-secondary">비활성</span>
                  </>
                )}
              </div>

              {license?.expiresAt && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-text-tertiary" />
                  <span className="text-body-sm text-text-secondary">
                    만료일:{' '}
                    {new Date(license.expiresAt).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {isPremium && (
            <div className="rounded-full bg-primary-500 px-3 py-1">
              <span className="text-body-xs font-medium text-white">Premium</span>
            </div>
          )}
        </div>

        {/* Features */}
        {license?.features && (
          <div className="mt-6 grid grid-cols-2 gap-3 border-t border-neutral-200 pt-4">
            <FeatureItem
              label="안내서"
              value={`${license.features.maxGuides}개`}
            />
            <FeatureItem
              label="AI 컨시어지"
              value={license.features.aiConcierge ? '활성' : '비활성'}
              isEnabled={license.features.aiConcierge}
            />
            <FeatureItem
              label="커스텀 테마"
              value={license.features.customTheme ? '사용 가능' : '사용 불가'}
              isEnabled={license.features.customTheme}
            />
            <FeatureItem
              label="워터마크"
              value={license.features.noWatermark ? '제거' : '표시'}
              isEnabled={license.features.noWatermark}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface FeatureItemProps {
  label: string
  value: string
  isEnabled?: boolean
}

function FeatureItem({ label, value, isEnabled = true }: FeatureItemProps) {
  return (
    <div className="flex flex-col">
      <span className="text-body-xs text-text-tertiary">{label}</span>
      <span
        className={`text-body-sm font-medium ${
          isEnabled ? 'text-text-primary' : 'text-neutral-400'
        }`}
      >
        {value}
      </span>
    </div>
  )
}

export default PlanCard
