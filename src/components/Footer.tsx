'use client'

import { useEffect, useState } from 'react'
import { BookOpen, FlaskConical, Leaf, Scale, Search, Shapes } from 'lucide-react'
import { Link } from '../lib/router-compat'
import ConsentManager from './ConsentManager'
import { onOpenConsent } from '../lib/consentBus'
import { isAnalyticsRouteEnabled } from '../lib/analyticsAccess'
import { PUBLIC_ROUTES } from '../lib/public-routes'

const exploreLinks = [
  { href: PUBLIC_ROUTES.herbs, label: 'Herb Database', Icon: Leaf },
  { href: PUBLIC_ROUTES.compounds, label: 'Compounds', Icon: Shapes },
  { href: '/guides/compare/', label: 'Compare', Icon: Scale },
  { href: PUBLIC_ROUTES.guides, label: 'Guides', Icon: BookOpen },
  { href: '/learn/', label: 'Learn the Science', Icon: FlaskConical },
  { href: '/search/', label: 'Search', Icon: Search },
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
  if (Number.isNaN(timestamp)) return null
  return new Date(timestamp).toISOString().slice(0, 10)
}

export default function Footer() {
  const [open, setOpen] = useState(false)
  const availableLegalLinks = isAnalyticsRouteEnabled()
    ? [...legalLinks, { href: '/analytics', label: 'Analytics' }]
    : legalLinks

  useEffect(() => onOpenConsent(() => setOpen(true)), [])

  const showBuildMeta = process.env.NEXT_PUBLIC_SHOW_BUILD_META === 'true'
  const buildDate = formatBuildDate(typeof __BUILD_DATE__ !== 'undefined' ? __BUILD_DATE__ : '')
  const copyrightYear = buildDate ? new Date(buildDate).getUTCFullYear() : new Date().getFullYear()
  const rawHash = typeof __COMMIT_HASH__ !== 'undefined' ? __COMMIT_HASH__ : 'dev'
  const commitHash = typeof rawHash === 'string' ? rawHash.slice(0, 7) : 'dev'
  const appVersion = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '1.0.0'
  const versionStampParts = [`v${appVersion}`, commitHash]
  if (buildDate) versionStampParts.push(buildDate)

  return (
    <footer className='editorial-footer mt-12 w-full px-4 pb-28 pt-12 sm:px-6 sm:pt-16 md:pb-12'>
      <div className='relative z-10 mx-auto w-full max-w-6xl'>
        <div className='grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16'>
          <div>
            <div className='flex items-center gap-3'>
              <span className='editorial-icon-disc h-12 w-12'>
                <Leaf aria-hidden='true' className='h-6 w-6 text-[#315f50]' strokeWidth={1.7} />
              </span>
              <p className='font-display text-2xl font-semibold tracking-[-0.025em] text-[#123c2f] dark:text-[var(--text-primary)]'>
                The Hippie Scientist
              </p>
            </div>
            <p className='mt-4 max-w-md text-sm leading-7 text-[#526159] dark:text-[var(--text-secondary)]'>
              Evidence-first botanical research for clearer, safer supplement decisions. Educational only — not medical advice.
            </p>

            <div className='mt-6 flex flex-wrap gap-2'>
              <a href='https://twitter.com/HippieScientist' target='_blank' rel='noopener noreferrer' className='rounded-full border border-[#123c2f]/10 bg-[#fffdf8]/75 px-4 py-2 text-xs font-bold text-[#315f50] transition hover:border-[#b88a42]/35 hover:bg-[#fffdf8]'>
                Twitter
              </a>
              <a href='https://www.instagram.com/thehippiescientist' target='_blank' rel='noopener noreferrer' className='rounded-full border border-[#123c2f]/10 bg-[#fffdf8]/75 px-4 py-2 text-xs font-bold text-[#315f50] transition hover:border-[#b88a42]/35 hover:bg-[#fffdf8]'>
                Instagram
              </a>
              <a href='https://www.youtube.com/@HippieScientist' target='_blank' rel='noopener noreferrer' className='rounded-full border border-[#123c2f]/10 bg-[#fffdf8]/75 px-4 py-2 text-xs font-bold text-[#315f50] transition hover:border-[#b88a42]/35 hover:bg-[#fffdf8]'>
                YouTube
              </a>
            </div>

            <div className='editorial-card mt-7 rounded-2xl p-5'>
              <p className='editorial-eyebrow'>Built on evidence, not trends</p>
              <p className='mt-3 text-sm leading-6 text-[#526159] dark:text-[var(--text-secondary)]'>
                Use this library as an evidence map, not a prescription pad. Compare human evidence, dose realism, product standardization, and safety before buying or stacking.
              </p>
              <Link className='mt-4 inline-flex text-sm font-bold text-[#315f50] hover:text-[#123c2f]' to='/info/methodology/' prefetch={true}>
                Read the evidence methodology →
              </Link>
            </div>
          </div>

          <div>
            <p className='editorial-eyebrow'>Explore</p>
            <div className='mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3'>
              {exploreLinks.map(({ href, label, Icon }) => (
                <Link
                  key={href}
                  to={href}
                  prefetch={true}
                  className='editorial-link-tile group flex min-h-20 flex-col justify-between rounded-2xl p-4 text-[#123c2f] transition dark:text-[var(--text-primary)]'
                >
                  <Icon className='h-5 w-5 text-[#315f50]' aria-hidden='true' strokeWidth={1.7} />
                  <span className='mt-3 text-sm font-bold'>{label}</span>
                </Link>
              ))}
            </div>

            <div className='mt-8 grid gap-7 sm:grid-cols-3'>
              <div>
                <h3 className='text-xs font-extrabold uppercase tracking-[0.15em] text-[#315f50]'>Popular goals</h3>
                <ul className='mt-3 space-y-2'>
                  {priorityGoalLinks.map((link) => (
                    <li key={`${link.href}-${link.label}`}>
                      <Link className='text-sm font-medium text-[#526159] transition hover:text-[#123c2f]' to={link.href} prefetch={true}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className='text-xs font-extrabold uppercase tracking-[0.15em] text-[#315f50]'>Safety</h3>
                <ul className='mt-3 space-y-2'>
                  {safetyLinks.map((link) => (
                    <li key={link.href}>
                      <Link className='text-sm font-medium text-[#526159] transition hover:text-[#123c2f]' to={link.href} prefetch={true}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <button className='text-sm font-medium text-[#526159] transition hover:text-[#123c2f]' type='button' onClick={() => setOpen(true)}>
                      Privacy settings
                    </button>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className='text-xs font-extrabold uppercase tracking-[0.15em] text-[#315f50]'>Legal</h3>
                <ul className='mt-3 space-y-2'>
                  {availableLegalLinks.map((link) => (
                    <li key={link.href}>
                      <Link className='text-sm font-medium text-[#526159] transition hover:text-[#123c2f]' to={link.href} prefetch={true}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className='mt-10 flex flex-col justify-between gap-3 border-t border-[#123c2f]/10 pt-6 text-xs text-[#647168] sm:flex-row'>
          <div>© 2024–{copyrightYear} The Hippie Scientist. All rights reserved.</div>
          <div className='flex flex-wrap gap-x-4 gap-y-2'>
            <span>Educational use only</span>
            <span>Not medical advice</span>
            {showBuildMeta && <span>Build {versionStampParts.join(' · ')}</span>}
          </div>
        </div>
      </div>
      <ConsentManager open={open} onClose={() => setOpen(false)} />
    </footer>
  )
}
