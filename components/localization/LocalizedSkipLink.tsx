'use client'

import { usePathname } from 'next/navigation'
import { LOCALIZED_CHROME, getLocaleFromPathname } from '@/src/lib/localized-chrome'

export default function LocalizedSkipLink() {
  const pathname = usePathname()
  const locale = getLocaleFromPathname(pathname)
  return (
    <a href='#main-content' className='skip-link' lang={locale}>
      {LOCALIZED_CHROME[locale].skipLabel}
    </a>
  )
}
