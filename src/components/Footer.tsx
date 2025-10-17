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
    <footer className='relative mx-auto w-full max-w-screen-md px-4 py-10'>
      <div className='rounded-3xl bg-white/5 p-6 ring-1 ring-white/10 backdrop-blur-xl sm:p-7'>
        <div className='grid gap-8 sm:grid-cols-2'>
          <NonEmpty>
            {exploreLinks.length > 0 && (
              <div>
                <h4 className='mb-3 text-sm font-semibold uppercase tracking-wide text-white/70'>
                  Explore
                </h4>
                <ul className='space-y-1 text-sm text-white/75'>
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
                <h4 className='mb-3 text-sm font-semibold uppercase tracking-wide text-white/70'>
                  Stay safe
                </h4>
                <ul className='space-y-1 text-sm text-white/75'>
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

        <div className='mt-8 border-t border-white/10 pt-4 text-xs text-white/60'>
          © 2025 The Hippie Scientist — All Rights Reserved
        </div>
      </div>
      <ConsentManager open={open} onClose={() => setOpen(false)} />
    </footer>
  )
}
