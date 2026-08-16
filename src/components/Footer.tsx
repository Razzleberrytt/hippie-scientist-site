'use client'

import { useEffect, useState } from 'react'
import { Leaf } from 'lucide-react'
import { Link } from '../lib/router-compat'
import ConsentManager from './ConsentManager'
import { onOpenConsent } from '../lib/consentBus'
import { isAnalyticsRouteEnabled } from '../lib/analyticsAccess'
import { PUBLIC_ROUTES } from '../lib/public-routes'

const exploreLinks = [
  { href: '/goals/', label: 'Goals' },
  { href: PUBLIC_ROUTES.herbs, label: 'Herbs' },
  { href: PUBLIC_ROUTES.compounds, label: 'Compounds' },
  { href: '/guides/compare/', label: 'Compare' },
  { href: PUBLIC_ROUTES.articles, label: 'Research' },
]

const safetyLinks = [
  { href: '/safety-checker/', label: 'Safety checker' },
  { href: '/evidence/evidence-checker/', label: 'Evidence lookup' },
  { href: '/info/dosing/', label: 'Dosing guide' },
  { href: '/learn/interactions/', label: 'Interactions' },
]

const aboutLinks = [
  { href: PUBLIC_ROUTES.about, label: 'About' },
  { href: PUBLIC_ROUTES.author, label: 'Author' },
  { href: PUBLIC_ROUTES.contact, label: 'Contact' },
  { href: '/info/methodology/', label: 'Methodology' },
]

const legalLinks = [
  { href: PUBLIC_ROUTES.privacy, label: 'Privacy' },
  { href: PUBLIC_ROUTES.disclaimer, label: 'Disclaimer' },
  { href: '/info/affiliate-disclosure/', label: 'Affiliate disclosure' },
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

  const footerLinkClass =
    'text-sm font-medium text-[color:var(--hs-body)] transition hover:text-[color:var(--hs-ink)]'

  return (
    <footer className='editorial-footer mt-16 w-full border-t border-[color:var(--hs-hairline)] px-5 pb-10 pt-10 sm:px-8 sm:pb-12 sm:pt-12'>
      <div className='mx-auto w-full max-w-6xl'>
        <div className='grid gap-10 lg:grid-cols-[1.15fr_1.85fr] lg:gap-16'>
          <div className='max-w-md'>
            <div className='flex items-center gap-3'>
              <span className='editorial-icon-disc flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--hs-hairline)]'>
                <Leaf aria-hidden='true' className='h-5 w-5 text-[color:var(--hs-gold)]' strokeWidth={1.6} />
              </span>
              <p className='font-display text-xl font-semibold tracking-[-0.02em] text-[color:var(--hs-ink)] sm:text-2xl'>
                The Hippie Scientist
              </p>
            </div>

            <p className='mt-4 text-sm leading-6 text-[color:var(--hs-body)]'>
              Evidence-first supplement research for clearer, safer decisions. Educational only — not medical advice.
            </p>

            <div className='mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm'>
              <a className={footerLinkClass} href='https://x.com/TheHippieSci' target='_blank' rel='noopener noreferrer'>X</a>
              <a className={footerLinkClass} href='https://www.instagram.com/thehippiesci' target='_blank' rel='noopener noreferrer'>Instagram</a>
              <a className={footerLinkClass} href='https://www.youtube.com/@TheHippieSci' target='_blank' rel='noopener noreferrer'>YouTube</a>
            </div>

            <div className='mt-7 border-l border-[color:var(--hs-hairline-strong)] pl-4'>
              <p className='editorial-eyebrow text-[0.68rem] font-bold uppercase'>New here?</p>
              <p className='mt-2 text-sm leading-6 text-[color:var(--hs-body)]'>
                Choose a goal, look up an ingredient, or check safety first.
              </p>
              <Link className='mt-2 inline-flex text-sm font-bold text-[color:var(--hs-gold)] hover:text-[color:var(--hs-ink)]' to={PUBLIC_ROUTES.start} prefetch={true}>
                Start here →
              </Link>
            </div>
          </div>

          <div className='grid grid-cols-2 gap-x-8 gap-y-9 sm:grid-cols-4'>
            <FooterGroup title='Explore' links={exploreLinks} linkClass={footerLinkClass} />
            <FooterGroup title='Safety' links={safetyLinks} linkClass={footerLinkClass} />
            <FooterGroup title='About' links={aboutLinks} linkClass={footerLinkClass} />
            <div>
              <p className='editorial-eyebrow text-[0.68rem] font-bold uppercase'>Legal</p>
              <ul className='mt-4 space-y-2.5'>
                {availableLegalLinks.map((link) => (
                  <li key={link.href}>
                    <Link className={footerLinkClass} to={link.href} prefetch={true}>{link.label}</Link>
                  </li>
                ))}
                <li>
                  <button className={footerLinkClass} type='button' onClick={() => setOpen(true)}>
                    Privacy settings
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className='mt-10 flex flex-col justify-between gap-3 border-t border-[color:var(--hs-hairline)] pt-6 text-xs text-[color:var(--hs-body)] sm:flex-row sm:items-center'>
          <div>© 2024–{copyrightYear} The Hippie Scientist</div>
          <div className='flex flex-wrap gap-x-4 gap-y-1'>
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

function FooterGroup({
  title,
  links,
  linkClass,
}: {
  title: string
  links: { href: string; label: string }[]
  linkClass: string
}) {
  return (
    <div>
      <p className='editorial-eyebrow text-[0.68rem] font-bold uppercase'>{title}</p>
      <ul className='mt-4 space-y-2.5'>
        {links.map((link) => (
          <li key={link.href}>
            <Link className={linkClass} to={link.href} prefetch={true}>{link.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
