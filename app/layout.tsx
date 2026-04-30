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
  { href: PUBLIC_ROUTES.herbs, label: 'Herbs' },
  { href: PUBLIC_ROUTES.compounds, label: 'Compounds' },
  { href: PUBLIC_ROUTES.build, label: 'Build' },
  { href: PUBLIC_ROUTES.blog, label: 'Blog' },
  { href: PUBLIC_ROUTES.learning, label: 'Learning' },
  { href: PUBLIC_ROUTES.about, label: 'About' },
  { href: PUBLIC_ROUTES.contact, label: 'Contact' },
]

const footerLinks = [
  { href: PUBLIC_ROUTES.herbs, label: 'Herbs' },
  { href: PUBLIC_ROUTES.compounds, label: 'Compounds' },
  { href: PUBLIC_ROUTES.build, label: 'Build' },
  { href: PUBLIC_ROUTES.blog, label: 'Blog' },
  { href: PUBLIC_ROUTES.learning, label: 'Learning' },
  { href: PUBLIC_ROUTES.about, label: 'About' },
  { href: PUBLIC_ROUTES.contact, label: 'Contact' },
  { href: PUBLIC_ROUTES.disclaimer, label: 'Disclaimer' },
  { href: PUBLIC_ROUTES.privacy, label: 'Privacy' },
]

export const metadata: Metadata = {
  metadataBase: new URL('https://thehippiescientist.net'),
  title: {
    default: 'The Hippie Scientist',
    template: '%s | The Hippie Scientist',
  },
  description:
    'Plain-English, science-first education about herbs, compounds, and related research notes.',
  applicationName: 'The Hippie Scientist',
  keywords: [
    'herbs',
    'compounds',
    'plant science',
    'botanicals',
    'phytochemistry',
    'herbal education',
    'science communication',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: 'The Hippie Scientist',
    title: 'The Hippie Scientist',
    description:
      'Plain-English, science-first education about herbs, compounds, and related research notes.',
  },
  twitter: {
    card: 'summary',
    title: 'The Hippie Scientist',
    description:
      'Plain-English, science-first education about herbs, compounds, and related research notes.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
  category: 'education',
}

type RootLayoutProps = Readonly<{
  children: ReactNode
}>

export default function RootLayout({ children }: RootLayoutProps) {
  const year = new Date().getFullYear()

  return (
    <html lang='en'>
      <body>
        <div className='min-h-screen bg-[var(--bg)] text-[var(--text-primary)]'>
          <header className='border-b border-white/10'>
            <div className='container-page flex min-h-16 items-center justify-between gap-4 py-4'>
              <Link href={PUBLIC_ROUTES.home} className='text-lg font-semibold tracking-tight'>
                The Hippie Scientist
              </Link>

              <nav aria-label='Primary' className='hidden items-center gap-2 md:flex'>
                {navLinks.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className='rounded-full px-4 py-2 text-sm font-medium text-white/75 transition hover:bg-white/5 hover:text-white'
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <MobileNav links={navLinks} />
            </div>
          </header>

          <main className='container-page py-8 sm:py-10'>{children}</main>

          <footer className='border-t border-white/10'>
            <div className='container-page flex flex-col gap-6 py-8 text-sm text-white/60 sm:flex-row sm:items-center sm:justify-between'>
              <p>
                © {year} The Hippie Scientist — Educational use only · Not medical advice
              </p>

              <nav aria-label='Footer' className='flex flex-wrap gap-4'>
                {footerLinks.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className='transition hover:text-white'
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
