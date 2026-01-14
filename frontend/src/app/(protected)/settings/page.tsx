'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { User, Mail, Crown, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default function SettingsPage() {
  const { user: clerkUser, isLoaded } = useUser()
  const authUser = useAuthStore((state) => state.user)
  const updateUserName = useAuthStore((state) => state.updateUserName)
  const isUpdating = useAuthStore((state) => state.isLoading)

  const [name, setName] = useState(authUser?.name || clerkUser?.firstName || '')
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  const handleSaveName = async () => {
    if (!name.trim()) return

    setIsSaving(true)
    setSaveMessage(null)

    try {
      await updateUserName(name)
      setSaveMessage({ type: 'success', text: '이름이 저장되었습니다.' })
    } catch {
      setSaveMessage({ type: 'error', text: '저장에 실패했습니다.' })
    } finally {
      setIsSaving(false)
    }
  }

  if (!isLoaded) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-48 rounded bg-neutral-200" />
        <div className="h-64 rounded-xl bg-neutral-200" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-display-sm font-bold text-text-primary">설정</h1>
        <p className="mt-2 text-body-md text-text-secondary">
          계정 정보와 환경설정을 관리하세요
        </p>
      </div>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            프로필 정보
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Image */}
          <div className="flex items-center gap-4">
            <div className="relative">
              {clerkUser?.imageUrl ? (
                <img
                  src={clerkUser.imageUrl}
                  alt="프로필"
                  className="h-20 w-20 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-100">
                  <User className="h-10 w-10 text-primary-500" />
                </div>
              )}
            </div>
            <div>
              <p className="text-body-sm text-text-secondary">
                프로필 이미지는 Clerk 대시보드에서 변경할 수 있습니다.
              </p>
            </div>
          </div>

          {/* Name */}
          <div className="max-w-md">
            <Input
              label="이름"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름을 입력하세요"
              hint="게스트에게 표시되는 이름입니다"
            />
          </div>

          {/* Email (Read-only) */}
          <div className="max-w-md">
            <label className="mb-1.5 block text-body-sm font-medium text-text-primary">
              이메일
            </label>
            <div className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2.5">
              <Mail className="h-4 w-4 text-text-secondary" />
              <span className="text-body-md text-text-secondary">
                {clerkUser?.emailAddresses[0]?.emailAddress}
              </span>
            </div>
            <p className="mt-1.5 text-body-xs text-text-tertiary">
              이메일은 Clerk 대시보드에서 변경할 수 있습니다.
            </p>
          </div>

          {/* Save Button */}
          <div className="flex items-center gap-4">
            <Button
              onClick={handleSaveName}
              disabled={isSaving || isUpdating || !name.trim()}
              isLoading={isSaving || isUpdating}
            >
              저장하기
            </Button>
            {saveMessage && (
              <p
                className={`text-body-sm ${
                  saveMessage.type === 'success'
                    ? 'text-semantic-success'
                    : 'text-semantic-error'
                }`}
              >
                {saveMessage.text}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* License Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            라이선스
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border border-neutral-200 p-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-heading-sm font-semibold text-text-primary">
                  {authUser?.license?.plan === 'free'
                    ? '무료 플랜'
                    : authUser?.license?.plan === 'monthly'
                      ? '월간 플랜'
                      : authUser?.license?.plan === 'biannual'
                        ? '6개월 플랜'
                        : authUser?.license?.plan === 'annual'
                          ? '연간 플랜'
                          : '무료 플랜'}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-body-xs font-medium ${
                    authUser?.license?.status === 'active'
                      ? 'bg-semantic-success/10 text-semantic-success'
                      : 'bg-neutral-100 text-neutral-600'
                  }`}
                >
                  {authUser?.license?.status === 'active' ? '활성' : '비활성'}
                </span>
              </div>
              {authUser?.license?.expiresAt && (
                <p className="mt-1 text-body-sm text-text-secondary">
                  만료일: {new Date(authUser.license.expiresAt).toLocaleDateString('ko-KR')}
                </p>
              )}
            </div>
            <Link href="/settings/license">
              <Button variant="secondary" size="sm">
                관리하기
              </Button>
            </Link>
          </div>

          {/* Features */}
          <div className="mt-4">
            <h4 className="mb-2 text-body-sm font-medium text-text-primary">
              현재 플랜 기능
            </h4>
            <ul className="space-y-2 text-body-sm text-text-secondary">
              <li className="flex items-center gap-2">
                <span
                  className={
                    authUser?.license?.features?.maxGuides
                      ? 'text-semantic-success'
                      : 'text-neutral-400'
                  }
                >
                  ✓
                </span>
                안내서 {authUser?.license?.features?.maxGuides || 1}개
              </li>
              <li className="flex items-center gap-2">
                <span
                  className={
                    authUser?.license?.features?.aiConcierge
                      ? 'text-semantic-success'
                      : 'text-neutral-400'
                  }
                >
                  {authUser?.license?.features?.aiConcierge ? '✓' : '✗'}
                </span>
                AI 컨시어지
              </li>
              <li className="flex items-center gap-2">
                <span
                  className={
                    authUser?.license?.features?.customTheme
                      ? 'text-semantic-success'
                      : 'text-neutral-400'
                  }
                >
                  {authUser?.license?.features?.customTheme ? '✓' : '✗'}
                </span>
                커스텀 테마
              </li>
              <li className="flex items-center gap-2">
                <span
                  className={
                    authUser?.license?.features?.noWatermark
                      ? 'text-semantic-success'
                      : 'text-neutral-400'
                  }
                >
                  {authUser?.license?.features?.noWatermark ? '✓' : '✗'}
                </span>
                워터마크 제거
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-semantic-error/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-semantic-error">
            <AlertTriangle className="h-5 w-5" />
            위험 구역
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-semantic-error/20 bg-semantic-error/5 p-4">
            <h4 className="font-medium text-text-primary">계정 삭제</h4>
            <p className="mt-1 text-body-sm text-text-secondary">
              계정을 삭제하면 모든 안내서와 데이터가 영구적으로 삭제됩니다.
              이 작업은 되돌릴 수 없습니다.
            </p>
            <Button variant="ghost" size="sm" className="mt-3 text-semantic-error">
              계정 삭제하기
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
