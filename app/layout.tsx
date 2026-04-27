import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Link from 'next/link'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import './globals.css'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/herbs', label: 'Herbs' },
  { href: '/compounds', label: 'Compounds' },
  { href: '/blog', label: 'Blog' },
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
              <Link href='/' className='text-lg font-semibold tracking-tight'>
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

              <details className='relative md:hidden'>
                <summary className='list-none rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white/90 transition hover:border-white/30 hover:bg-white/5'>
                  Menu
                </summary>

                <nav
                  aria-label='Mobile'
                  className='absolute right-0 top-full z-20 mt-2 w-52 rounded-2xl border border-white/10 bg-[var(--surface-2)] p-2 shadow-2xl'
                >
                  {navLinks.map(link => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className='block rounded-xl px-4 py-3 text-sm font-medium text-white/80 transition hover:bg-white/5 hover:text-white'
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </details>
            </div>
          </header>

          <main className='container-page py-8 sm:py-10'>{children}</main>

          <footer className='border-t border-white/10'>
            <div className='container-page flex flex-col gap-6 py-8 text-sm text-white/60 sm:flex-row sm:items-center sm:justify-between'>
              <p>
                © {year} The Hippie Scientist — Educational use only · Not medical advice
              </p>

              <nav aria-label='Footer' className='flex flex-wrap gap-4'>
                {navLinks
                  .filter(link => link.href !== '/')
                  .map(link => (
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
