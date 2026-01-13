/**
 * Upload Utilities
 * 이미지 업로드 유틸리티 함수
 */

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * 이미지 파일 유효성 검사
 */
export function validateImageFile(file: File): boolean {
  // Check file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return false;
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return false;
  }

  return true;
}

/**
 * 파일 확장자 추출
 */
export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
}

/**
 * 고유 파일 이름 생성
 */
export function generateUniqueFilename(originalName: string): string {
  const extension = getFileExtension(originalName);
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${random}.${extension}`;
}
