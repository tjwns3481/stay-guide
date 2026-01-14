'use client'

import { useMemo } from 'react'
import type { ThemeSettings } from '@/contracts/types'
import { THEME_PRESETS, DEFAULT_THEME, ThemePreset } from '@/lib/theme'

interface ThemeProviderProps {
  themeSettings: ThemeSettings | null
  children: React.ReactNode
}

export function ThemeProvider({ themeSettings, children }: ThemeProviderProps) {
  // themeSettings에서 preset 또는 커스텀 값 추출
  const style = useMemo(() => {
    const theme =
      themeSettings?.preset && THEME_PRESETS[themeSettings.preset as ThemePreset]
        ? THEME_PRESETS[themeSettings.preset as ThemePreset]
        : DEFAULT_THEME

    return {
      '--theme-primary': themeSettings?.primaryColor || theme.primaryColor,
      '--theme-secondary': themeSettings?.secondaryColor || theme.secondaryColor,
      '--theme-background': themeSettings?.backgroundColor || theme.backgroundColor,
      '--theme-font': themeSettings?.fontFamily || theme.fontFamily,
    } as React.CSSProperties
  }, [themeSettings])

  return (
    <div style={style} className="theme-root">
      {children}
    </div>
  )
}
