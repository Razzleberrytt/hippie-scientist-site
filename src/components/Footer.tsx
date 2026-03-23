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
  { href: '/contribute', label: 'Contribute / Help improve this data' },
  { href: '/graph', label: 'NeuroHerbGraph' },
]

const legalLinks = [
  { href: '/methodology', label: 'Methodology' },
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/disclaimer', label: 'Disclaimer' },
  { href: '/contact', label: 'Contact' },
  { href: '/sitemap', label: 'Sitemap' },
]

export default function Footer() {
  const [open, setOpen] = useState(false)

  useEffect(() => onOpenConsent(() => setOpen(true)), [])

  return (
    <footer className='relative mx-auto mt-8 w-full max-w-screen-lg px-4 pb-8 pt-4'>
      <div className='border-white/12 ring-white/8 rounded-2xl border bg-white/5 p-5 ring-1 backdrop-blur-xl sm:p-6'>
        <div className='grid gap-6 sm:grid-cols-2 sm:gap-8'>
          <NonEmpty>
            {exploreLinks.length > 0 && (
              <div>
                <h4 className='text-white/62 mb-3 text-xs font-semibold uppercase tracking-[0.24em]'>
                  Explore
                </h4>
                <ul className='text-white/78 space-y-2 text-sm'>
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
                <h4 className='text-white/62 mb-3 text-xs font-semibold uppercase tracking-[0.24em]'>
                  Trust & safety
                </h4>
                <ul className='text-white/78 space-y-2 text-sm'>
                  {legalLinks.map(link => (
                    <li key={link.href}>
                      <a className='transition hover:text-white' href={normalizeHref(link.href)}>
                        {link.label}
                      </a>
                    </li>
                  ))}
                  <li>
                    <button
                      className='text-white/72 underline decoration-dotted underline-offset-4 transition hover:text-white'
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

        <div className='mt-6 border-t border-white/10 pt-3 text-xs text-white/55'>
          © 2026 The Hippie Scientist — Educational use only · Not medical advice
        </div>
      </div>
      <ConsentManager open={open} onClose={() => setOpen(false)} />
    </footer>
  )
}
