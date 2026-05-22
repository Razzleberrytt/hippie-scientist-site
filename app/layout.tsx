import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Link from 'next/link'
import DesktopNav from '@/components/desktop-nav'
import MobileNav from '@/components/mobile-nav'
import MobileBottomNav from '@/components/mobile-bottom-nav'
import './globals.css'
import '@/styles/foundation-readability.css'

const siteName = 'The Hippie Scientist'
const siteDescription =
  'Evidence-aware research on herbs, compounds, mechanisms, safety context, and practical supplement decisions.'
const siteUrl = 'https://www.thehippiescientist.net'

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: siteName,
  url: siteUrl,
  description: siteDescription,
}

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: siteName,
  url: siteUrl,
  description: siteDescription,
}

const navLinks = [
  { href: '/herbs', label: 'Herbs' },
  { href: '/compounds', label: 'Compounds' },
  { href: '/goals', label: 'Goals' },
  { href: '/stacks', label: 'Stacks' },
  { href: '/compare', label: 'Compare' },
  { href: '/learn', label: 'Learn' },
  { href: '/search', label: 'Search' },
  { href: '/about', label: 'About' },
]

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: siteName, template: `%s | ${siteName}` },
  description: siteDescription,
  openGraph: {
    type: 'website',
    title: siteName,
    description: siteDescription,
    siteName,
    url: siteUrl,
  },
  twitter: {
    card: 'summary_large_image',
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang='en'>
      <body
        className='font-sans antialiased'
      >
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />

        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />

        <div className='min-h-screen bg-background text-ink'>
          <header className='sticky top-0 z-50 border-b border-brand-900/10 bg-white/[0.88] shadow-[0_1px_0_rgba(17,24,39,0.02)] backdrop-blur-xl supports-[backdrop-filter]:bg-white/[0.78]'>
            <div className='container-page flex min-h-[72px] items-center justify-between gap-6 py-3'>
              <Link
                href='/'
                className='inline-flex items-center rounded-full px-1 py-2 text-lg font-black tracking-tight text-ink transition hover:text-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white'
              >
                The Hippie Scientist
              </Link>

              <DesktopNav links={navLinks} />

              <MobileNav links={navLinks} />
            </div>
          </header>

          <div className='pb-[calc(env(safe-area-inset-bottom)+4rem)] md:pb-8'>
            {children}
          </div>

          <footer className='mt-8 border-t border-neutral-200 bg-neutral-50 sm:mt-12'>
            <div className='container-page py-8 sm:py-12'>
              <div className='grid gap-7 md:grid-cols-3'>
                <div className='space-y-4'>
                  <p className='font-semibold text-ink'>The Hippie Scientist</p>

                  <p className='text-sm text-muted'>
                    Evidence-first herb & compound reference.
                  </p>

                  <p className='text-sm leading-6 text-muted'>
                    Educational content grounded in human evidence, mechanisms, pathways, and scientific review.
                  </p>
                </div>

                <div className='space-y-3'>
                  <p className='font-semibold text-ink'>Explore</p>

                  <div className='flex flex-col gap-2 text-sm'>
                    <Link href='/herbs' className='text-muted hover:text-ink transition'>Herbs</Link>
                    <Link href='/compounds' className='text-muted hover:text-ink transition'>Compounds</Link>
                    <Link href='/goals' className='text-muted hover:text-ink transition'>Goals</Link>
                    <Link href='/stacks' className='text-muted hover:text-ink transition'>Stacks</Link>
                    <Link href='/blog' className='text-muted hover:text-ink transition'>Blog</Link>
                    <Link href='/about' className='text-muted hover:text-ink transition'>About</Link>
                  </div>
                </div>

                <div className='space-y-3'>
                  <p className='font-semibold text-ink'>Legal & Transparency</p>

                  <div className='flex flex-col gap-2 text-sm'>
                    <Link href='/privacy' className='text-muted hover:text-ink transition'>Privacy Policy</Link>
                    <Link href='/disclaimer' className='text-muted hover:text-ink transition'>Disclaimer</Link>
                    <Link href='/contact' className='text-muted hover:text-ink transition'>Contact</Link>
                  </div>
                </div>
              </div>

              <div className='mt-7 space-y-2.5 border-t border-neutral-200 pt-5 sm:mt-10 sm:pt-6'>
                <p className='text-xs leading-6 text-muted'>
                  This site contains affiliate links. We may earn a commission on qualifying purchases at no cost to you.
                </p>

                <p className='text-sm text-muted'>
                  © 2026 The Hippie Scientist
                </p>
              </div>
            </div>
          </footer>

          <MobileBottomNav />
        </div>
      </body>
    </html>
  )
}
