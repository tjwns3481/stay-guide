export interface FontOption {
  value: string
  label: string
  family: string
}

export const FONT_OPTIONS: FontOption[] = [
  { value: 'pretendard', label: 'Pretendard', family: 'Pretendard, -apple-system, sans-serif' },
  { value: 'noto-sans', label: 'Noto Sans KR', family: '"Noto Sans KR", sans-serif' },
  { value: 'noto-serif', label: 'Noto Serif KR', family: '"Noto Serif KR", serif' },
  { value: 'nanum-gothic', label: '나눔고딕', family: '"Nanum Gothic", sans-serif' },
]
