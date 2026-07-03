'use client'

import { useEffect, useState } from 'react'
import { Leaf } from 'lucide-react'
import { Link } from '../lib/router-compat'
import ConsentManager from './ConsentManager'
import { onOpenConsent } from '../lib/consentBus'
import NonEmpty from './NonEmpty'
import { isAnalyticsRouteEnabled } from '../lib/analyticsAccess'
import { PUBLIC_ROUTES } from '../lib/public-routes'

const exploreLinks = [
  { href: PUBLIC_ROUTES.herbs, label: 'Herb Database' },
  { href: PUBLIC_ROUTES.compounds, label: 'Compounds' },
  { href: '/guides/compare/', label: 'Compare' },
  { href: PUBLIC_ROUTES.guides, label: 'Guides' },
  { href: '/learn/', label: 'Learn the Science' },
  { href: '/search/', label: 'Search' },
]

const priorityGoalLinks = [
  { href: '/guides/sleep/', label: 'Sleep' },
  { href: '/guides/anxiety/', label: 'Stress' },
  { href: '/guides/anxiety/', label: 'Anxiety' },
  { href: '/guides/focus/', label: 'Focus' },
]

const safetyLinks = [
  { href: '/info/methodology/', label: 'Methodology' },
  { href: PUBLIC_ROUTES.disclaimer, label: 'Disclaimer' },
  { href: PUBLIC_ROUTES.contact, label: 'Contact' },
]

const legalLinks = [
  { href: PUBLIC_ROUTES.privacy, label: 'Privacy Policy' },
  { href: '/info/affiliate-disclosure/', label: 'Affiliate Disclosure' },
  { href: '/sitemap.xml', label: 'Sitemap' },
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
    <footer className='mt-8 w-full px-4 py-12'>
      <div className='mx-auto w-full max-w-screen-lg'>
        <div className='grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4'>
          <div>
            <div className='flex items-center gap-2'>
              <Leaf aria-hidden='true' className='h-5 w-5 text-[#8dc49a]' strokeWidth={1.75} />
              <p className='font-display text-lg italic text-white'>The Hippie Scientist</p>
            </div>
            <p className='mt-1.5 text-[0.8rem] tracking-[0.02em] text-white/55'>
              Evidence-first botanical research. Not medical advice.
            </p>
            <div className='mt-4 flex flex-wrap items-center gap-x-2 text-xs text-white/50'>
              <a href='https://twitter.com/HippieScientist' target='_blank' rel='noopener noreferrer' aria-label='The Hippie Scientist on Twitter' className='flex min-h-[44px] items-center gap-1.5 rounded-md px-2 text-xs font-medium text-white/55 transition-all duration-200 hover:bg-white/10 hover:text-white'>
                Twitter
              </a>
              <span>•</span>
              <a href='https://www.instagram.com/thehippiescientist' target='_blank' rel='noopener noreferrer' aria-label='The Hippie Scientist on Instagram' className='flex min-h-[44px] items-center gap-1.5 rounded-md px-2 text-xs font-medium text-white/55 transition-all duration-200 hover:bg-white/10 hover:text-white'>
                Instagram
              </a>
              <span>•</span>
              <a href='https://www.youtube.com/@HippieScientist' target='_blank' rel='noopener noreferrer' aria-label='The Hippie Scientist on YouTube' className='flex min-h-[44px] items-center gap-1.5 rounded-md px-2 text-xs font-medium text-white/55 transition-all duration-200 hover:bg-white/10 hover:text-white'>
                YouTube
              </a>
            </div>
          </div>

          <NonEmpty>
            {exploreLinks.length > 0 && (
              <div>
                <h3 className='section-label mb-3 !text-white/60'>Explore</h3>
                <ul className='space-y-2'>
                  {exploreLinks.map(link => (
                    <li key={link.href}>
                      <Link className='text-[0.85rem] text-white/65 transition-colors hover:text-white' to={link.href} prefetch={true}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </NonEmpty>

          <NonEmpty>
            {priorityGoalLinks.length > 0 && (
              <div>
                <h3 className='section-label mb-3 !text-white/60'>Popular Goals</h3>
                <ul className='space-y-2'>
                  {priorityGoalLinks.map(link => (
                    <li key={link.href}>
                      <Link className='text-[0.85rem] text-white/65 transition-colors hover:text-white' to={link.href} prefetch={true}>
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
                <h3 className='section-label mb-3 !text-white/60'>Safety</h3>
                <ul className='space-y-2'>
                  {safetyLinks.map(link => (
                    <li key={link.href}>
                      <Link className='text-[0.85rem] text-white/65 transition-colors hover:text-white' to={link.href} prefetch={true}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <button
                      className='text-[0.85rem] text-white/65 transition-colors hover:text-white'
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
                <h3 className='section-label mb-3 !text-white/60'>Legal</h3>
                <ul className='space-y-2'>
                  {availableLegalLinks.map(link => (
                    <li key={link.href}>
                      <Link className='text-[0.85rem] text-white/65 transition-colors hover:text-white' to={link.href} prefetch={true}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </NonEmpty>
        </div>

        <div className='mt-10 flex flex-col justify-between gap-2 border-t border-white/10 pt-5 text-xs text-white/65 sm:flex-row'>
          {showBuildMeta && <div>Build {versionStampParts.join(' · ')}</div>}
          <div>© 2024–{copyrightYear} The Hippie Scientist – Educational use only. Not medical advice.</div>
        </div>
      </div>
      <ConsentManager open={open} onClose={() => setOpen(false)} />
    </footer>
  )
}
