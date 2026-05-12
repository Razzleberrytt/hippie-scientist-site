import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Inter, Fraunces } from 'next/font/google'
import Link from 'next/link'
import MobileNav from '@/components/mobile-nav'
import MobileBottomNav from '@/components/mobile-bottom-nav'
import './globals.css'
import '@/styles/foundation-readability.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
})

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'The Hippie Scientist',
  url: 'https://www.thehippiescientist.net',
  description: 'Evidence-organized research on herbs, compounds, pathways, cognition, and human health.',
}

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'The Hippie Scientist',
  url: 'https://www.thehippiescientist.net',
}

const navLinks = [
  { href: '/herbs', label: 'Herbs' },
  { href: '/compounds', label: 'Compounds' },
  { href: '/goals', label: 'Goals' },
  { href: '/stacks', label: 'Stacks' },
  { href: '/blog', label: 'Blog' },
  { href: '/about', label: 'About' },
]

export const metadata: Metadata = {
  metadataBase: new URL('https://www.thehippiescientist.net'),
  title: { default: 'The Hippie Scientist', template: '%s | The Hippie Scientist' },
  description:
    'Evidence-organized research on herbs, compounds, pathways, cognition, neuroscience, and human health.',
  openGraph: {
    type: 'website',
    siteName: 'The Hippie Scientist',
    url: 'https://www.thehippiescientist.net',
  },
  twitter: {
    card: 'summary_large_image',
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang='en'>
      <body
        className={`${inter.variable} ${fraunces.variable} bg-[#fafaf9] pb-24 text-[#111827] font-sans antialiased md:pb-0`}
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
          <header className='sticky top-0 z-50 border-b border-neutral-200 bg-white/90 backdrop-blur-sm'>
            <div className='container-page flex items-center justify-between py-4'>
              <Link href='/' className='text-lg font-bold tracking-tight text-ink'>
                Hippie Scientist
              </Link>

              <nav className='hidden md:flex items-center gap-2'>
                {navLinks.map(l => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className='rounded-xl px-4 py-2 text-sm font-semibold text-muted hover:bg-neutral-100 hover:text-ink transition'
                  >
                    {l.label}
                  </Link>
                ))}
              </nav>

              <MobileNav links={navLinks} />
            </div>
          </header>

          <main className='container-page py-8 text-base leading-body sm:py-10'>
            {children}
          </main>

          <footer className='mt-16 border-t border-neutral-200 bg-neutral-50'>
            <div className='container-page py-12'>
              <div className='grid gap-10 md:grid-cols-3'>
                <div className='space-y-4'>
                  <h3 className='font-semibold text-ink'>The Hippie Scientist</h3>

                  <p className='text-sm text-muted'>
                    Evidence-first herb & compound reference.
                  </p>

                  <p className='text-sm leading-6 text-muted'>
                    Educational content grounded in human evidence, mechanisms, pathways, and scientific review.
                  </p>
                </div>

                <div className='space-y-3'>
                  <h3 className='font-semibold text-ink'>Explore</h3>

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
                  <h3 className='font-semibold text-ink'>Legal & Transparency</h3>

                  <div className='flex flex-col gap-2 text-sm'>
                    <Link href='/privacy' className='text-muted hover:text-ink transition'>Privacy Policy</Link>
                    <Link href='/disclaimer' className='text-muted hover:text-ink transition'>Disclaimer</Link>
                    <Link href='/contact' className='text-muted hover:text-ink transition'>Contact</Link>
                  </div>
                </div>
              </div>

              <div className='mt-10 border-t border-neutral-200 pt-6 space-y-3'>
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
