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
          <header className='sticky top-0 z-50 border-b border-brand-900/10 bg-white/88 shadow-[0_1px_0_rgba(17,24,39,0.02)] backdrop-blur-xl supports-[backdrop-filter]:bg-white/78'>
            <div className='container-page flex min-h-[72px] items-center justify-between gap-6 py-3'>
              <Link
                href='/'
                className='inline-flex items-center rounded-full px-1 py-2 text-lg font-black tracking-tight text-ink transition hover:text-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white'
              >
                The Hippie Scientist
              </Link>

              <nav className='hidden items-center gap-1.5 md:flex' aria-label='Primary navigation'>
                {navLinks.map(l => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className='rounded-full px-3.5 py-2 text-sm font-semibold text-[#5c6d63] transition duration-200 hover:bg-emerald-50 hover:text-emerald-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white lg:px-4'
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

          <footer className='border-t border-emerald-200/10 bg-[#07110d] text-emerald-50'>
            <div className='container-page py-12'>
              <div className='grid gap-10 md:grid-cols-3'>
                <div className='space-y-4'>
                  <h3 className='font-semibold uppercase tracking-[-0.02em] text-emerald-50'>The Hippie Scientist</h3>

                  <p className='!text-sm !leading-6 !text-emerald-50/58'>
                    A botanical research portal for herbs, compounds, mechanisms, evidence, comparisons, and safety-aware exploration.
                  </p>
                </div>

                <div className='space-y-3'>
                  <h3 className='font-semibold text-emerald-100'>Explore</h3>

                  <div className='flex flex-col gap-2 text-sm'>
                    <Link href='/herbs' className='text-emerald-50/60 transition hover:text-emerald-100'>Herbs</Link>
                    <Link href='/compounds' className='text-emerald-50/60 transition hover:text-emerald-100'>Compounds</Link>
                    <Link href='/goals' className='text-emerald-50/60 transition hover:text-emerald-100'>Goals</Link>
                    <Link href='/stacks' className='text-emerald-50/60 transition hover:text-emerald-100'>Stacks</Link>
                    <Link href='/compare' className='text-emerald-50/60 transition hover:text-emerald-100'>Compare</Link>
                    <Link href='/learn' className='text-emerald-50/60 transition hover:text-emerald-100'>Learn</Link>
                    <Link href='/search' className='text-emerald-50/60 transition hover:text-emerald-100'>Search</Link>
                  </div>
                </div>

                <div className='space-y-3'>
                  <h3 className='font-semibold text-emerald-100'>Legal & Transparency</h3>

                  <div className='flex flex-col gap-2 text-sm'>
                    <Link href='/privacy' className='text-emerald-50/60 transition hover:text-emerald-100'>Privacy Policy</Link>
                    <Link href='/disclaimer' className='text-emerald-50/60 transition hover:text-emerald-100'>Disclaimer</Link>
                    <Link href='/contact' className='text-emerald-50/60 transition hover:text-emerald-100'>Contact</Link>
                    <Link href='/about' className='text-emerald-50/60 transition hover:text-emerald-100'>About</Link>
                  </div>
                </div>
              </div>

              <div className='mt-10 space-y-3 border-t border-emerald-200/10 pt-6'>
                <p className='!text-xs !leading-6 !text-emerald-50/42'>
                  This site contains affiliate links. We may earn a commission on qualifying purchases at no cost to you.
                </p>

                <p className='!text-sm !text-emerald-50/42'>
                  © 2026 The Hippie Scientist. Educational research support only; consult a qualified clinician for medical care.
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
