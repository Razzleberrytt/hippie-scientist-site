import { useEffect, useState } from 'react'
import { Link } from '@/lib/router-compat'
import ConsentManager from './ConsentManager'
import { onOpenConsent } from '../lib/consentBus'
import NonEmpty from './NonEmpty'
import { isAnalyticsRouteEnabled } from '@/lib/analyticsAccess'
import { PUBLIC_ROUTES } from '@/lib/publicRoutes'

const exploreLinks = [
  { href: PUBLIC_ROUTES.herbs, label: 'Herb Database' },
  { href: PUBLIC_ROUTES.compounds, label: 'Compounds' },
  { href: PUBLIC_ROUTES.build, label: 'Build a Blend' },
  ]

const safetyLinks = [
    { href: PUBLIC_ROUTES.disclaimer, label: 'Disclaimer' },
  { href: PUBLIC_ROUTES.contact, label: 'Contact' },
]

const legalLinks = [
  { href: PUBLIC_ROUTES.privacy, label: 'Privacy Policy' },
  { href: '/sitemap', label: 'Sitemap' },
]

function formatBuildDate(isoDate: string) {
  const timestamp = Date.parse(isoDate)
  if (Number.isNaN(timestamp)) {
    return null
  }
  return new Date(timestamp).toISOString().slice(0, 10)
}

export default function Footer() {
  const [open, setOpen] = useState(false)
  const availableLegalLinks = isAnalyticsRouteEnabled()
    ? [...legalLinks, { href: '/analytics', label: 'Analytics' }]
    : legalLinks

  useEffect(() => onOpenConsent(() => setOpen(true)), [])

  const buildDate = formatBuildDate(__BUILD_DATE__)
  const versionStampParts = [`v${__APP_VERSION__}`, __COMMIT_HASH__]
  if (buildDate) {
    versionStampParts.push(buildDate)
  }

  return (
    <footer className='mt-8 w-full border-t border-white/8 bg-[#07080F] px-4 py-12'>
      <div className='mx-auto w-full max-w-screen-lg'>
        <div className='grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4'>
          <div>
            <p className='font-display text-lg italic text-white'>The Hippie Scientist</p>
            <p className='mt-2 text-xs text-white/45'>
              Science-first harm reduction for psychoactive botany.
            </p>
          </div>

          <NonEmpty>
            {exploreLinks.length > 0 && (
              <div>
                <h4 className='section-label mb-3'>Explore</h4>
                <ul className='space-y-2'>
                  {exploreLinks.map(link => (
                    <li key={link.href}>
                      <Link className='text-sm text-white/55 transition-colors hover:text-white' to={link.href}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </NonEmpty>

          <NonEmpty>
            {safetyLinks.length > 0 && (
              <div>
                <h4 className='section-label mb-3'>Safety</h4>
                <ul className='space-y-2'>
                  {safetyLinks.map(link => (
                    <li key={link.href}>
                      <Link className='text-sm text-white/55 transition-colors hover:text-white' to={link.href}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <button
                      className='text-sm text-white/55 transition-colors hover:text-white'
                      type='button'
                      onClick={() => setOpen(true)}
                    >
                      Privacy settings
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </NonEmpty>

          <NonEmpty>
            {availableLegalLinks.length > 0 && (
              <div>
                <h4 className='section-label mb-3'>Legal</h4>
                <ul className='space-y-2'>
                  {availableLegalLinks.map(link => (
                    <li key={link.href}>
                      <Link className='text-sm text-white/55 transition-colors hover:text-white' to={link.href}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </NonEmpty>
        </div>

        <div className='mt-10 flex flex-col justify-between gap-2 border-t border-white/8 pt-4 text-xs text-white/30 sm:flex-row'>
          <div>Build {versionStampParts.join(' · ')}</div>
          <div>© 2026 The Hippie Scientist — Educational use only · Not medical advice</div>
        </div>
      </div>
      <ConsentManager open={open} onClose={() => setOpen(false)} />
    </footer>
  )
}
