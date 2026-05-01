import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Link from 'next/link'
import MobileNav from '@/components/mobile-nav'
import { PUBLIC_ROUTES } from '@/lib/public-routes'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import './globals.css'

const navLinks = [
  { href: PUBLIC_ROUTES.home, label: 'Home' },
  { href: PUBLIC_ROUTES.herbs, label: 'Browse Herbs' },
  { href: PUBLIC_ROUTES.compounds, label: 'Compounds' },
  { href: '/stacks', label: 'Stacks' },
  { href: '/sleep-supplements', label: 'Sleep' },
  { href: '/stress-supplements', label: 'Stress' },
  { href: '/fat-loss-supplements', label: 'Fat Loss' },
  { href: '/cognition-supplements', label: 'Cognition' },
  { href: '/performance-supplements', label: 'Performance' },
]

const footerLinks = [
  { href: '/stacks', label: 'Stacks' },
  { href: '/sleep-supplements', label: 'Sleep' },
  { href: '/stress-supplements', label: 'Stress' },
  { href: '/fat-loss-supplements', label: 'Fat Loss' },
  { href: '/cognition-supplements', label: 'Cognition' },
  { href: '/performance-supplements', label: 'Performance' },
  { href: '/compare/creatine-vs-beta-alanine', label: 'Creatine vs Beta-Alanine' },
  { href: '/compare/caffeine-vs-l-theanine', label: 'Caffeine vs L-Theanine' },
]

export const metadata: Metadata = {
  metadataBase: new URL('https://thehippiescientist.net'),
  title: {
    default: 'The Hippie Scientist',
    template: '%s | The Hippie Scientist',
  },
  description:
    'Search herbs and compounds with plain-English summaries, safety context, active constituents, and evidence-aware discovery paths.',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang='en'>
      <body>
        <div className='min-h-screen bg-[var(--bg)] text-[var(--text-primary)]'>
          <header className='border-b border-white/10'>
            <div className='container-page flex min-h-16 items-center justify-between gap-4 py-4'>
              <Link href='/' className='text-lg font-semibold tracking-tight'>The Hippie Scientist</Link>
              <nav className='hidden md:flex gap-2'>
                {navLinks.map(link => (
                  <Link key={link.href} href={link.href} className='rounded-full px-4 py-2 text-sm text-white/75 hover:bg-white/5 hover:text-white'>
                    {link.label}
                  </Link>
                ))}
              </nav>
              <MobileNav links={navLinks} />
            </div>
          </header>

          <main className='container-page py-8'>{children}</main>

          <footer className='border-t border-white/10'>
            <div className='container-page py-8 text-sm text-white/60'>
              <p>© The Hippie Scientist — Educational use only</p>
              <p className='mt-1 text-xs text-white/45'>Official site branding stays in the footer only.</p>
              <div className='mt-4 flex flex-wrap gap-4'>
                {footerLinks.map(link => (
                  <Link key={link.href} href={link.href} className='hover:text-white'>
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
