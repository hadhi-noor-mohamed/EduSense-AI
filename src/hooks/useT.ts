import { useCallback } from 'react'
import { useAppStore } from '../store/useAppStore'
import { translate, type Locale } from '../i18n'

/** Translation hook — components never need rewriting to add a language. */
export function useT() {
  const locale = useAppStore((s) => s.settings.language) as Locale
  return useCallback((key: string) => translate(locale, key), [locale])
}
