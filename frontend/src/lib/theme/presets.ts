export type ThemePreset = 'emotional' | 'modern' | 'natural'

export interface ThemeConfig {
  name: string
  primaryColor: string
  secondaryColor: string
  backgroundColor: string
  fontFamily: string
}

export const THEME_PRESETS: Record<ThemePreset, ThemeConfig> = {
  emotional: {
    name: '감성적',
    primaryColor: '#E91E63',
    secondaryColor: '#FCE4EC',
    backgroundColor: '#FFFAF0',
    fontFamily: 'Noto Serif KR',
  },
  modern: {
    name: '모던',
    primaryColor: '#1976D2',
    secondaryColor: '#E3F2FD',
    backgroundColor: '#FAFAFA',
    fontFamily: 'Pretendard',
  },
  natural: {
    name: '자연',
    primaryColor: '#4CAF50',
    secondaryColor: '#E8F5E9',
    backgroundColor: '#F5F5DC',
    fontFamily: 'Nanum Gothic',
  },
}

export const DEFAULT_THEME: ThemeConfig = THEME_PRESETS.modern
