import { nanoid } from 'nanoid'

/**
 * 안내서용 고유 슬러그 생성
 * 형식: g-{nanoid(8)}
 * 예: g-abc12def
 */
export function generateGuideSlug(): string {
  return `g-${nanoid(8).toLowerCase()}`
}

/**
 * 슬러그 유효성 검사
 * - 3~50자
 * - 영문 소문자, 숫자, 하이픈만 허용
 */
export function isValidSlug(slug: string): boolean {
  if (slug.length < 3 || slug.length > 50) {
    return false
  }
  return /^[a-z0-9-]+$/.test(slug)
}
