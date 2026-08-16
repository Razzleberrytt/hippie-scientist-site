'use client'

import { usePathname } from 'next/navigation'
import { getLocaleFromPathname } from '@/src/lib/localized-chrome'
import type { SupportedLocale } from '@/src/lib/international-seo'

/**
 * Five locales are supported but only two of these strings are translated, so
 * the map is deliberately partial and every lookup falls back to English. Typing
 * it as a complete record made indexing by `pt-BR`, `fr` or `de` a type error
 * and broke the production build.
 */
const LABELS: Partial<Record<SupportedLocale, string>> = {
  'en-US': 'Skip to main content',
  es: 'Saltar al contenido principal',
}

export default function LocalizedSkipLink() {
  const locale = getLocaleFromPathname(usePathname() || '/')
  return <a href='#main-content' className='skip-link'>{LABELS[locale] ?? LABELS['en-US']}</a>
}
