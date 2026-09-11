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
    <nav aria-label='Available profile languages' className='mx-auto max-w-5xl px-5 pt-6 sm:px-8 lg:px-10'>
      <ul className='flex flex-wrap gap-2' role='list'>
        {Object.entries(PATHS).map(([locale, href]) => {
          const label = LOCALE_CONFIG[locale as keyof typeof LOCALE_CONFIG]
          const active = locale === current
          return (
            <li key={locale}>
              {active ? (
                <span
                  aria-current='page'
                  title={label.languageLabel}
                  className='inline-flex min-h-11 items-center rounded-full border border-[var(--border-strong)] bg-[var(--surface-subtle)] px-3 py-2 text-xs font-bold text-[var(--text-primary)]'
                >
                  {label.shortLabel}
                </span>
              ) : (
                <Link
                  href={href}
                  hrefLang={locale}
                  title={label.languageLabel}
                  className='inline-flex min-h-11 items-center rounded-full border border-[var(--border-soft)] px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] transition hover:border-[var(--border-strong)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-page)]'
                >
                  {label.shortLabel}
                </Link>
              )}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
