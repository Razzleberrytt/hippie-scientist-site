import Link from 'next/link'
import { LOCALE_CONFIG } from '@/lib/international-seo'
import type { ExpandedProfileLocale } from '@/lib/expanded-profile-translations'

const PATHS = {
  'en-US': '/herbs/ashwagandha/',
  es: '/es/hierbas/ashwagandha/',
  'pt-BR': '/pt/ervas/ashwagandha/',
  fr: '/fr/plantes/ashwagandha/',
  de: '/de/kraeuter/ashwagandha/',
  ar: '/ar/herbs/ashwagandha/',
  ru: '/ru/travy/ashwagandha/',
  vi: '/vi/thao-duoc/ashwagandha/',
  th: '/th/herbs/ashwagandha/',
  sv: '/sv/orter/ashwagandha/',
} as const

export default function ExpandedProfileLanguageLinks({ current }: { current: ExpandedProfileLocale }) {
  return (
    <nav aria-label='Available profile languages' className='mx-auto flex max-w-5xl flex-wrap gap-2 px-5 pt-6 sm:px-8 lg:px-10'>
      {Object.entries(PATHS).map(([locale, href]) => {
        const label = LOCALE_CONFIG[locale as keyof typeof LOCALE_CONFIG]
        const active = locale === current
        return active ? (
          <span key={locale} aria-current='page' title={label.languageLabel} className='rounded-full border border-[var(--border-strong)] bg-[var(--surface-subtle)] px-3 py-1.5 text-xs font-bold text-[var(--text-primary)]'>{label.shortLabel}</span>
        ) : (
          <Link key={locale} href={href} hrefLang={locale} title={label.languageLabel} className='rounded-full border border-[var(--border-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] transition hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]'>{label.shortLabel}</Link>
        )
      })}
    </nav>
  )
}
