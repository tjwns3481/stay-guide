'use client'

import { useState } from 'react'
import { useLicense } from '@/hooks/useLicense'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { CheckCircle, AlertCircle } from 'lucide-react'

export function LicenseForm() {
  const {
    activateLicense,
    formatLicenseKey,
    validateKeyFormat,
    isLoading,
    error,
  } = useLicense()

  const [licenseKey, setLicenseKey] = useState('')
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatLicenseKey(e.target.value)
    setLicenseKey(formatted)
    setMessage(null)
  }

  const handleActivate = async () => {
    if (!validateKeyFormat(licenseKey)) {
      setMessage({
        type: 'error',
        text: '올바른 라이선스 키 형식이 아닙니다.',
      })
      return
    }

    try {
      await activateLicense(licenseKey)
      setMessage({
        type: 'success',
        text: '라이선스가 활성화되었습니다.',
      })
      setLicenseKey('')
    } catch {
      setMessage({
        type: 'error',
        text: error || '라이선스 활성화에 실패했습니다.',
      })
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-heading-sm font-semibold text-text-primary">
          라이선스 키 입력
        </h3>
        <p className="mt-1 text-body-sm text-text-secondary">
          구매하신 라이선스 키를 입력하여 활성화하세요.
        </p>
      </div>

      <div className="max-w-md space-y-4">
        <Input
          label="라이선스 키"
          value={licenseKey}
          onChange={handleInputChange}
          placeholder="ROOMY-XXXX-XXXX-XXXX"
          hint="하이픈은 자동으로 입력됩니다"
          maxLength={23} // ROOMY-XXXX-XXXX-XXXX
        />

        <Button
          onClick={handleActivate}
          disabled={isLoading || !validateKeyFormat(licenseKey)}
          isLoading={isLoading}
          className="w-full"
        >
          활성화하기
        </Button>

        {message && (
          <div
            className={`flex items-start gap-2 rounded-lg p-3 ${
              message.type === 'success'
                ? 'bg-semantic-success/10 text-semantic-success'
                : 'bg-semantic-error/10 text-semantic-error'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
            )}
            <p className="text-body-sm">{message.text}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default LicenseForm
