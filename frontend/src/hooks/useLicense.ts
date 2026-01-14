'use client'

import { useState } from 'react'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/lib/api/client'

interface VerifyResponse {
  isValid: boolean
  plan?: string
  expiresAt?: string
}

interface ActivateResponse {
  license: {
    plan: string
    status: string
    expiresAt?: string
    features: {
      maxGuides: number
      maxBlocksPerGuide: number
      aiConcierge: boolean
      customTheme: boolean
      noWatermark: boolean
      analytics: boolean
    }
  }
}

export function useLicense() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const syncUser = useAuthStore((state) => state.syncUser)

  /**
   * 라이선스 키 형식 검증
   * ROOMY-XXXX-XXXX-XXXX 형식
   */
  const verifyKey = async (licenseKey: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await api.post<VerifyResponse>('/licenses/verify', {
        licenseKey,
      })

      if (response.success && response.data) {
        return {
          isValid: response.data.isValid,
          plan: response.data.plan,
          expiresAt: response.data.expiresAt,
        }
      }

      throw new Error('키 검증에 실패했습니다.')
    } catch (err) {
      const message = err instanceof Error ? err.message : '키 검증에 실패했습니다.'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * 라이선스 활성화
   * 성공 시 사용자 정보를 다시 동기화합니다.
   */
  const activateLicense = async (licenseKey: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await api.post<ActivateResponse>('/licenses/activate', {
        licenseKey,
      })

      if (response.success && response.data) {
        // 사용자 정보 재동기화
        await syncUser()
        return response.data.license
      }

      throw new Error('라이선스 활성화에 실패했습니다.')
    } catch (err) {
      const message =
        err instanceof Error ? err.message : '라이선스 활성화에 실패했습니다.'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * 라이선스 키 형식 유효성 검사 (로컬)
   * ROOMY-XXXX-XXXX-XXXX 형식
   */
  const validateKeyFormat = (key: string): boolean => {
    const pattern = /^ROOMY-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/
    return pattern.test(key)
  }

  /**
   * 라이선스 키 포맷팅
   * 입력값을 자동으로 ROOMY-XXXX-XXXX-XXXX 형식으로 변환
   */
  const formatLicenseKey = (value: string): string => {
    // 알파벳과 숫자만 추출
    const clean = value.toUpperCase().replace(/[^A-Z0-9]/g, '')

    // ROOMY 접두사 처리
    let chars = clean
    if (!clean.startsWith('ROOMY')) {
      chars = 'ROOMY' + clean
    }
    chars = chars.slice(5) // ROOMY 제거

    // 4자리씩 끊어서 하이픈 추가
    const parts = []
    for (let i = 0; i < Math.min(chars.length, 12); i += 4) {
      parts.push(chars.slice(i, i + 4))
    }

    return parts.length > 0 ? 'ROOMY-' + parts.join('-') : 'ROOMY-'
  }

  return {
    verifyKey,
    activateLicense,
    validateKeyFormat,
    formatLicenseKey,
    isLoading,
    error,
  }
}

export default useLicense
