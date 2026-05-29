import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import MobileBottomNav from '@/components/mobile-bottom-nav'
import CitationDrawer from '@/components/education/CitationDrawer'
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

        <a href='#main-content' className='sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-ink focus:shadow-lg'>Skip to main content</a>

        <div className='min-h-screen bg-background text-ink'>
          <Header />

          <main id='main-content' className='pb-[calc(env(safe-area-inset-bottom)+4rem)] md:pb-8'>
            {children}
          </main>

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
                  <h2 className='font-semibold text-ink'>Explore</h2>

                  <div className='flex flex-col gap-2 text-sm'>
                    <Link href='/herbs' className='text-muted hover:text-ink transition'>Herbs</Link>
                    <Link href='/compounds' className='text-muted hover:text-ink transition'>Compounds</Link>
                    <Link href='/goals' className='text-muted hover:text-ink transition'>Goals</Link>
                    <Link href='/stacks' className='text-muted hover:text-ink transition'>Stacks</Link>
                    <Link href='/compare' className='text-muted hover:text-ink transition'>Compare</Link>
                    <Link href='/learn' className='text-muted hover:text-ink transition'>Learn</Link>
                    <Link href='/search' className='text-muted hover:text-ink transition'>Search</Link>
                    <Link href='/blog' className='text-muted hover:text-ink transition'>Blog</Link>
                    <Link href='/about' className='text-muted hover:text-ink transition'>About</Link>
                  </div>
                </div>

                <div className='space-y-3'>
                  <h2 className='font-semibold text-ink'>Legal & Transparency</h2>

                  <div className='flex flex-col gap-2 text-sm'>
                    <Link href='/privacy' className='text-muted hover:text-ink transition'>Privacy Policy</Link>
                    <Link href='/disclaimer' className='text-muted hover:text-ink transition'>Disclaimer</Link>
                    <Link href='/contact' className='text-muted hover:text-ink transition'>Contact</Link>
                  </div>
                </div>
              </div>

              <section aria-label='Affiliate disclosure' className='mt-7 space-y-2.5 border-t border-neutral-200 pt-5 sm:mt-10 sm:pt-6'>
                <p className='text-xs leading-6 text-muted'>
                  This site contains affiliate links. We may earn a commission on qualifying purchases at no cost to you.
                </p>

                <p className='text-sm text-muted'>
                  © {new Date().getFullYear()} The Hippie Scientist
                </p>
              </section>
            </div>
          </footer>

          <MobileBottomNav />
          <CitationDrawer />
        </div>
      </body>
    </html>
  )
}
