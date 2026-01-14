import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

// 라이선스 키 형식: ROOMY-XXXX-XXXX-XXXX
const LICENSE_KEY_REGEX = /^ROOMY-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/

// 플랜별 기능 매핑
const PLAN_FEATURES = {
  free: {
    maxGuides: 1,
    maxBlocksPerGuide: 6,
    aiConcierge: false,
    customTheme: false,
    noWatermark: false,
    analytics: false,
  },
  monthly: {
    maxGuides: 3,
    maxBlocksPerGuide: 20,
    aiConcierge: true,
    customTheme: true,
    noWatermark: true,
    analytics: false,
  },
  biannual: {
    maxGuides: 10,
    maxBlocksPerGuide: 50,
    aiConcierge: true,
    customTheme: true,
    noWatermark: true,
    analytics: true,
  },
  annual: {
    maxGuides: -1, // 무제한
    maxBlocksPerGuide: -1,
    aiConcierge: true,
    customTheme: true,
    noWatermark: true,
    analytics: true,
  },
}

export interface LicenseFeatures {
  maxGuides: number
  maxBlocksPerGuide: number
  aiConcierge: boolean
  customTheme: boolean
  noWatermark: boolean
  analytics: boolean
}

// 키 형식 검증
export function isValidKeyFormat(key: string): boolean {
  return LICENSE_KEY_REGEX.test(key)
}

// 키에서 플랜 추출 (두 번째 그룹 첫 글자)
export function extractPlanFromKey(key: string): 'monthly' | 'biannual' | 'annual' {
  if (!isValidKeyFormat(key)) {
    throw new Error('INVALID_KEY_FORMAT')
  }

  const parts = key.split('-')
  const planCode = parts[1][0] // 두 번째 그룹의 첫 글자

  switch (planCode) {
    case 'M':
      return 'monthly'
    case 'B':
      return 'biannual'
    case 'A':
      return 'annual'
    default:
      throw new Error('INVALID_PLAN_CODE')
  }
}

// 만료 날짜 계산
export function calculateExpirationDate(plan: string): Date {
  const now = new Date()

  switch (plan) {
    case 'monthly':
      return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate())
    case 'biannual':
      return new Date(now.getFullYear(), now.getMonth() + 6, now.getDate())
    case 'annual':
      return new Date(now.getFullYear() + 1, now.getMonth(), now.getDate())
    default:
      throw new Error('INVALID_PLAN')
  }
}

// 라이선스 키 검증 (형식만)
export function verifyLicenseKey(key: string): { valid: boolean; plan?: string } {
  if (!isValidKeyFormat(key)) {
    return { valid: false }
  }

  try {
    const plan = extractPlanFromKey(key)
    return { valid: true, plan }
  } catch {
    return { valid: false }
  }
}

// 라이선스 활성화
export async function activateLicense(userId: string, licenseKey: string) {
  // 키 형식 검증
  if (!isValidKeyFormat(licenseKey)) {
    throw new Error('INVALID_KEY_FORMAT')
  }

  // 키가 이미 사용 중인지 확인
  const existingLicense = await prisma.license.findUnique({
    where: { licenseKey },
  })

  if (existingLicense) {
    throw new Error('KEY_ALREADY_USED')
  }

  // 플랜 추출
  const plan = extractPlanFromKey(licenseKey)

  // 만료 날짜 계산
  const expiresAt = calculateExpirationDate(plan)

  // 기능 목록 가져오기
  const features = getPlanFeatures(plan)

  // 라이선스 생성
  const license = await prisma.license.create({
    data: {
      userId,
      licenseKey,
      plan,
      status: 'active',
      features: features as unknown as Prisma.InputJsonValue,
      startsAt: new Date(),
      expiresAt,
    },
  })

  return license
}

// 현재 활성 라이선스 조회
export async function getCurrentLicense(userId: string) {
  const license = await prisma.license.findFirst({
    where: {
      userId,
      status: 'active',
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  if (!license) {
    return null
  }

  // 만료 확인
  if (checkExpiration(license)) {
    // 만료된 경우 상태 업데이트
    await prisma.license.update({
      where: { id: license.id },
      data: { status: 'expired' },
    })
    return null
  }

  return license
}

// 라이선스 만료 확인
export function checkExpiration(license: { expiresAt: Date | null }): boolean {
  if (!license.expiresAt) {
    return false
  }

  return new Date() > license.expiresAt
}

// 플랜 기능 조회
export function getPlanFeatures(plan: string): LicenseFeatures {
  return PLAN_FEATURES[plan as keyof typeof PLAN_FEATURES] || PLAN_FEATURES.free
}
