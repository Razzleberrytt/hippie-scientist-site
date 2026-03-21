import { useEffect, useState } from 'react'
import ConsentManager from './ConsentManager'
import { onOpenConsent } from '../lib/consentBus'
import NonEmpty from './NonEmpty'
import { normalizeHref } from '../lib/routing'

const exploreLinks = [
  { href: '/herbs', label: 'Herb Database' },
  { href: '/compounds', label: 'Compounds' },
  { href: '/build', label: 'Build a Blend' },
  { href: '/blog', label: 'Blog' },
  { href: '/graph', label: 'NeuroHerbGraph' },
]

const legalLinks = [
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/disclaimer', label: 'Disclaimer' },
  { href: '/contact', label: 'Contact' },
  { href: '/sitemap', label: 'Sitemap' },
]

export default function Footer() {
  const [open, setOpen] = useState(false)

  useEffect(() => onOpenConsent(() => setOpen(true)), [])

  return (
    <footer className='relative mx-auto mt-8 w-full max-w-screen-lg px-4 pb-10 pt-8'>
      <div className='bg-white/6 ring-white/12 rounded-3xl p-6 ring-1 backdrop-blur-xl sm:p-7'>
        <div className='grid gap-8 sm:grid-cols-2 sm:gap-10'>
          <NonEmpty>
            {exploreLinks.length > 0 && (
              <div>
                <h4 className='mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-white/65'>
                  Explore
                </h4>
                <ul className='space-y-1.5 text-sm text-white/75'>
                  {exploreLinks.map(link => (
                    <li key={link.href}>
                      <a className='transition hover:text-white' href={normalizeHref(link.href)}>
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </NonEmpty>
          <NonEmpty>
            {legalLinks.length > 0 && (
              <div>
                <h4 className='mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-white/65'>
                  Stay safe
                </h4>
                <ul className='space-y-1.5 text-sm text-white/75'>
                  {legalLinks.map(link => (
                    <li key={link.href}>
                      <a className='transition hover:text-white' href={normalizeHref(link.href)}>
                        {link.label}
                      </a>
                    </li>
                  ))}
                  <li>
                    <button
                      className='text-white/70 underline decoration-dotted underline-offset-4 transition hover:text-white'
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
        </div>

        <div className='mt-8 border-t border-white/10 pt-4 text-xs text-white/55'>
          © 2025 The Hippie Scientist — All Rights Reserved
        </div>
      </div>
      <ConsentManager open={open} onClose={() => setOpen(false)} />
    </footer>
  )
}
