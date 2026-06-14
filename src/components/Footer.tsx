'use client'

import { useEffect, useState } from 'react'
import { Link } from '@/lib/router-compat'
import ConsentManager from './ConsentManager'
import { onOpenConsent } from '../lib/consentBus'
import NonEmpty from './NonEmpty'
import { isAnalyticsRouteEnabled } from '@/lib/analyticsAccess'
import { PUBLIC_ROUTES } from '@/lib/public-routes'
import NewsletterSignup from '../../components/NewsletterSignup'

const exploreLinks = [
  { href: PUBLIC_ROUTES.herbs, label: 'Herb Database' },
  { href: PUBLIC_ROUTES.compounds, label: 'Compounds' },
  { href: '/compare', label: 'Compare' },
  { href: PUBLIC_ROUTES.guides, label: 'Guides' },
  { href: PUBLIC_ROUTES.articles, label: 'Articles' },
  { href: '/search', label: 'Search' },
  { href: '/goals', label: 'Goals' },
]

const safetyLinks = [
  { href: '/methodology', label: 'Methodology' },
  { href: PUBLIC_ROUTES.disclaimer, label: 'Disclaimer' },
  { href: PUBLIC_ROUTES.contact, label: 'Contact' },
]

const legalLinks = [
  { href: PUBLIC_ROUTES.privacy, label: 'Privacy Policy' },
  { href: '/affiliate-disclosure', label: 'Affiliate Disclosure' },
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

  const showBuildMeta = process.env.NEXT_PUBLIC_SHOW_BUILD_META === 'true'
  // typeof guard: DefinePlugin injects these for webpack; Turbopack dev leaves them undeclared.
  const buildDate = formatBuildDate(typeof __BUILD_DATE__ !== 'undefined' ? __BUILD_DATE__ : '')
  const copyrightYear = buildDate ? new Date(buildDate).getUTCFullYear() : new Date().getFullYear()
  const rawHash = typeof __COMMIT_HASH__ !== 'undefined' ? __COMMIT_HASH__ : 'dev'
  const commitHash = typeof rawHash === 'string' ? rawHash.slice(0, 7) : 'dev'
  const appVersion = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '1.0.0'
  const versionStampParts = [`v${appVersion}`, commitHash]
  if (buildDate) {
    versionStampParts.push(buildDate)
  }

  return (
    <footer className='mt-8 w-full border-t border-white/8 bg-[#07080F] px-4 py-12'>
      <div className='mx-auto w-full max-w-screen-lg'>
        <div className='mb-10 border-b border-white/8 pb-8'>
          <div className='max-w-3xl'>
            <NewsletterSignup
              title='Get the supplement safety checklist'
              description='Weekly evidence updates plus the printable checklist: meds, dose, form, and stacking risk before you buy.'
              ctaLabel='Join the list'
              location='footer'
              variant='footer'
            />
          </div>
        </div>

        <div className='grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4'>
          <div>
            <p className='font-display text-lg italic text-white'>The Hippie Scientist</p>
            <p className='mt-2 text-xs text-white/65'>
              Evidence-first botanical research. Not medical advice.
            </p>
            <div className='mt-4 flex flex-wrap items-center gap-x-2 text-xs text-white/50'>
              <a href='https://twitter.com/HippieScientist' target='_blank' rel='noopener noreferrer' className='flex min-h-[44px] items-center px-1 transition-colors hover:text-white'>
                Twitter
              </a>
              <span>•</span>
              <a href='https://www.instagram.com/thehippiescientist' target='_blank' rel='noopener noreferrer' className='flex min-h-[44px] items-center px-1 transition-colors hover:text-white'>
                Instagram
              </a>
              <span>•</span>
              <a href='https://www.youtube.com/@HippieScientist' target='_blank' rel='noopener noreferrer' className='flex min-h-[44px] items-center px-1 transition-colors hover:text-white'>
                YouTube
              </a>
            </div>
          </div>

          <NonEmpty>
            {exploreLinks.length > 0 && (
              <div>
                <h4 className='section-label mb-3'>Explore</h4>
                <ul className='space-y-2'>
                  {exploreLinks.map(link => (
                    <li key={link.href}>
                      <Link className='text-sm text-white/70 transition-colors hover:text-white' to={link.href} prefetch={true}>
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
                      <Link className='text-sm text-white/70 transition-colors hover:text-white' to={link.href} prefetch={true}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <button
                      className='text-sm text-white/70 transition-colors hover:text-white'
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
                      <Link className='text-sm text-white/70 transition-colors hover:text-white' to={link.href} prefetch={true}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </NonEmpty>
        </div>

        <div className='mt-10 flex flex-col justify-between gap-2 border-t border-white/8 pt-4 text-xs text-white/65 sm:flex-row'>
          {showBuildMeta && <div>Build {versionStampParts.join(' · ')}</div>}
          <div>© 2024–{copyrightYear} The Hippie Scientist – Educational use only. Not medical advice.</div>
        </div>
      </div>
      <ConsentManager open={open} onClose={() => setOpen(false)} />
    </footer>
  )
}
