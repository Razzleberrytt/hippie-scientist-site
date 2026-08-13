'use client'

import { useEffect, useState } from 'react'
import { BookOpen, Brain, Leaf, Newspaper, Search, Shapes } from 'lucide-react'
import { Link } from '../lib/router-compat'
import ConsentManager from './ConsentManager'
import { onOpenConsent } from '../lib/consentBus'
import { isAnalyticsRouteEnabled } from '../lib/analyticsAccess'
import { PUBLIC_ROUTES } from '../lib/public-routes'
import NewsletterSignup from '../../components/NewsletterSignup'

const exploreLinks = [
  { href: PUBLIC_ROUTES.library, label: 'Explore Everything', Icon: BookOpen },
  { href: PUBLIC_ROUTES.guides, label: 'Topics & Guides', Icon: Brain },
  { href: PUBLIC_ROUTES.articles, label: 'Articles', Icon: Newspaper },
  { href: PUBLIC_ROUTES.herbs, label: 'Herb Database', Icon: Leaf },
  { href: PUBLIC_ROUTES.compounds, label: 'Compounds', Icon: Shapes },
  { href: '/search/', label: 'Search', Icon: Search },
]

const priorityGoalLinks = [
  { href: '/guides/mental-health/', label: 'Mental Health' },
  { href: '/guides/sleep/', label: 'Sleep' },
  { href: '/guides/adhd/', label: 'ADHD' },
  { href: '/guides/anxiety/', label: 'Anxiety' },
  { href: '/guides/focus/', label: 'Focus & Cognition' },
  { href: '/guides/other/', label: 'More topics' },
]

const researchLinks = [
  { href: '/articles/', label: 'All articles' },
  { href: '/learn/', label: 'Learning library' },
  { href: '/evidence/evidence-report/', label: 'Evidence report' },
  { href: '/evidence/evidence-digest/', label: 'Evidence digest' },
  { href: '/info/methodology/', label: 'Methodology' },
  { href: '/info/infographics/', label: 'Infographics' },
]

const safetyLinks = [
  { href: '/safety-checker/', label: 'Safety checker' },
  { href: '/evidence/evidence-checker/', label: 'Evidence lookup' },
  { href: '/info/dosing/', label: 'Dosing guide' },
  { href: '/info/supplement-safety-checklist/', label: 'Supplement checklist' },
  { href: '/learn/interactions/', label: 'Interactions' },
  { href: '/learn/product-quality/', label: 'Product quality' },
]

const legalLinks = [
  { href: PUBLIC_ROUTES.about, label: 'About' },
  { href: PUBLIC_ROUTES.author, label: 'Author' },
  { href: PUBLIC_ROUTES.faq, label: 'FAQ' },
  { href: PUBLIC_ROUTES.contact, label: 'Contact' },
  { href: PUBLIC_ROUTES.privacy, label: 'Privacy Policy' },
  { href: PUBLIC_ROUTES.disclaimer, label: 'Disclaimer' },
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
        <NewsletterSignup
          title='Take the 5-question safety check before your next supplement'
          description='Get the printable checklist for screening medications, dose and form, stacking risk, product quality, and when to ask a clinician.'
          ctaLabel='Send me the checklist'
          location='global-footer'
          variant='editorial'
          className='mb-10 sm:mb-14'
        />

        <div className='grid gap-8 md:grid-cols-[0.85fr_1.15fr] md:gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-12'>
          <div>
            <div className='flex items-center gap-3'>
              <span className='editorial-icon-disc h-12 w-12'>
                <Leaf aria-hidden='true' className='h-6 w-6 text-[#315f50]' strokeWidth={1.7} />
              </span>
              <p className='font-display text-2xl font-semibold tracking-[-0.025em] text-[#123c2f] dark:text-[var(--text-primary)]'>
                The Hippie Scientist
              </p>
            </div>
            <p className='mt-3 max-w-md text-sm leading-6 text-[#526159] dark:text-[var(--text-secondary)]'>
              Evidence-first botanical research for clearer, safer supplement decisions. Educational only — not medical advice.
            </p>

            <div className='mt-4 flex flex-wrap gap-2'>
              <a href='https://x.com/TheHippieSci' target='_blank' rel='noopener noreferrer' aria-label='The Hippie Scientist on X (opens in a new tab)' className='rounded-full border border-[#123c2f]/10 bg-[#fffdf8]/75 px-4 py-2 text-xs font-bold text-[#315f50] transition hover:border-[#b88a42]/35 hover:bg-[#fffdf8] dark:border-white/10 dark:bg-white/5 dark:text-[#a9c6b3] dark:hover:border-[#dec69b]/30 dark:hover:bg-white/10 dark:hover:text-[#d9e8de]'>
                X
              </a>
              <a href='https://www.instagram.com/thehippiesci' target='_blank' rel='noopener noreferrer' className='rounded-full border border-[#123c2f]/10 bg-[#fffdf8]/75 px-4 py-2 text-xs font-bold text-[#315f50] transition hover:border-[#b88a42]/35 hover:bg-[#fffdf8] dark:border-white/10 dark:bg-white/5 dark:text-[#a9c6b3] dark:hover:border-[#dec69b]/30 dark:hover:bg-white/10 dark:hover:text-[#d9e8de]'>
                Instagram
              </a>
              <a href='https://www.youtube.com/@TheHippieSci' target='_blank' rel='noopener noreferrer' className='rounded-full border border-[#123c2f]/10 bg-[#fffdf8]/75 px-4 py-2 text-xs font-bold text-[#315f50] transition hover:border-[#b88a42]/35 hover:bg-[#fffdf8] dark:border-white/10 dark:bg-white/5 dark:text-[#a9c6b3] dark:hover:border-[#dec69b]/30 dark:hover:bg-white/10 dark:hover:text-[#d9e8de]'>
                YouTube
              </a>
            </div>

            <div className='editorial-card mt-6 rounded-2xl p-4 sm:p-5'>
              <p className='editorial-eyebrow'>Lost or not sure where to begin?</p>
              <p className='mt-2 text-sm leading-6 text-[#526159] dark:text-[var(--text-secondary)]'>
                The master directory explains how the site is organized and links every major guide, article, profile, research, and safety collection.
              </p>
              <Link className='mt-3 inline-flex text-sm font-bold text-[#315f50] hover:text-[#123c2f] dark:text-[#8dc49a] dark:hover:text-[#c9e4d2]' to={PUBLIC_ROUTES.library} prefetch={true}>
                Explore the complete site →
              </Link>
            </div>
          </div>

          <div>
            <p className='editorial-eyebrow'>Explore</p>
            <div className='mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3'>
              {exploreLinks.map(({ href, label, Icon }) => (
                <Link
                  key={href}
                  to={href}
                  prefetch={true}
                  className='editorial-link-tile group flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[#123c2f] transition dark:text-[var(--text-primary)]'
                >
                  <Icon className='h-4 w-4 shrink-0 text-[#315f50] dark:text-[#8dc49a]' aria-hidden='true' strokeWidth={1.7} />
                  <span className='text-sm font-bold leading-tight text-balance'>{label}</span>
                </Link>
              ))}
            </div>

            <div className='mt-7 grid grid-cols-2 gap-x-5 gap-y-7 lg:grid-cols-4'>
              <div>
                <h3 className='text-xs font-extrabold uppercase tracking-[0.15em] text-[#315f50] dark:text-[#8dc49a]'>Popular topics</h3>
                <ul className='mt-3 space-y-2'>
                  {priorityGoalLinks.map((link) => (
                    <li key={`${link.href}-${link.label}`}>
                      <Link className='text-sm font-medium text-[#526159] transition hover:text-[#123c2f] dark:text-[var(--text-secondary)] dark:hover:text-[var(--text-primary)]' to={link.href} prefetch={true}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className='text-xs font-extrabold uppercase tracking-[0.15em] text-[#315f50] dark:text-[#8dc49a]'>Research</h3>
                <ul className='mt-3 space-y-2'>
                  {researchLinks.map((link) => (
                    <li key={link.href}>
                      <Link className='text-sm font-medium text-[#526159] transition hover:text-[#123c2f] dark:text-[var(--text-secondary)] dark:hover:text-[var(--text-primary)]' to={link.href} prefetch={true}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className='text-xs font-extrabold uppercase tracking-[0.15em] text-[#315f50] dark:text-[#8dc49a]'>Safety</h3>
                <ul className='mt-3 space-y-2'>
                  {safetyLinks.map((link) => (
                    <li key={link.href}>
                      <Link className='text-sm font-medium text-[#526159] transition hover:text-[#123c2f] dark:text-[var(--text-secondary)] dark:hover:text-[var(--text-primary)]' to={link.href} prefetch={true}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <button className='text-sm font-medium text-[#526159] transition hover:text-[#123c2f] dark:text-[var(--text-secondary)] dark:hover:text-[var(--text-primary)]' type='button' onClick={() => setOpen(true)}>
                      Privacy settings
                    </button>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className='text-xs font-extrabold uppercase tracking-[0.15em] text-[#315f50] dark:text-[#8dc49a]'>About & legal</h3>
                <ul className='mt-3 space-y-2'>
                  {availableLegalLinks.map((link) => (
                    <li key={link.href}>
                      <Link className='text-sm font-medium text-[#526159] transition hover:text-[#123c2f] dark:text-[var(--text-secondary)] dark:hover:text-[var(--text-primary)]' to={link.href} prefetch={true}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className='mt-8 flex flex-col justify-between gap-3 border-t border-[#123c2f]/10 pt-6 text-xs text-[#647168] sm:flex-row dark:border-white/10 dark:text-[#93a89b]'>
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
