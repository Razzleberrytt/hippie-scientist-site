'use client'

import { usePathname } from 'next/navigation'
import { getLocaleFromPathname } from '@/src/lib/localized-chrome'

const LABELS = { 'en-US': 'Skip to main content', es: 'Saltar al contenido principal' } as const

export default function LocalizedSkipLink() {
  const locale = getLocaleFromPathname(usePathname() || '/')
  return <a href='#main-content' className='skip-link'>{LABELS[locale] ?? LABELS['en-US']}</a>
}
