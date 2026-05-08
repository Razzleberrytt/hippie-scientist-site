import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Inter, Fraunces } from 'next/font/google'
import Link from 'next/link'
import MobileNav from '@/components/mobile-nav'
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
  description: 'Evidence-organized research on herbs, compounds, pathways, and human health.',
}

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'The Hippie Scientist',
  url: 'https://www.thehippiescientist.net',
}

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/learn', label: 'Learn' },
  { href: '/stacks', label: 'Stacks' },
  { href: '/herbs', label: 'Herbs' },
  { href: '/compounds', label: 'Compounds' },
  { href: '/search', label: 'Search' },
  { href: '/about', label: 'About' },
]

export const metadata: Metadata = {
  metadataBase: new URL('https://www.thehippiescientist.net'),
  title: { default: 'The Hippie Scientist', template: '%s | The Hippie Scientist' },
  description: 'Evidence-organized research on herbs, compounds, pathways, and human health.',
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
      <body className={`${inter.variable} ${fraunces.variable} bg-[#fafaf9] text-[#111827] font-sans antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
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
                    className='rounded-xl px-4 py-2 text-sm font-semibold text-muted hover:bg-neutral-100 hover:text-ink'
                  >
                    {l.label}
                  </Link>
                ))}
              </nav>
              <MobileNav links={navLinks} />
            </div>
          </header>

          <main className='container-page py-10 text-base leading-body'>{children}</main>

          <footer className='mt-10 border-t border-neutral-200 bg-neutral-50'>
            <div className='container-page py-8 text-sm text-muted'>
              <p className='font-semibold'>© The Hippie Scientist</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
