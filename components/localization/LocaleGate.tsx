'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import type { SupportedLocale } from '@/src/lib/international-seo'
import { getLocaleFromPathname, isTranslatedPath } from '@/src/lib/localized-chrome'

export function EnglishOnly({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  return isTranslatedPath(pathname) ? null : <>{children}</>
}

export function LocalizedOnly({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  return isTranslatedPath(pathname) ? <>{children}</> : null
}

export function LocaleOnly({ locale, children }: { locale: SupportedLocale; children: ReactNode }) {
  const pathname = usePathname()
  return getLocaleFromPathname(pathname) === locale ? <>{children}</> : null
}
