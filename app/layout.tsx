import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Link from 'next/link'
import MobileNav from '@/components/mobile-nav'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import './globals.css'

const navLinks = [
  { href: '/goals', label: 'Goals' },
  { href: '/stacks', label: 'Stacks' },
  { href: '/herbs', label: 'Herbs' },
  { href: '/compounds', label: 'Compounds' },
]

const footerLinks = navLinks

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
          <header className='sticky top-0 z-40 border-b border-slate-200/70 bg-[#fff8ec]/88 backdrop-blur-xl supports-[backdrop-filter]:bg-[#fff8ec]/72'>
            <div className='container-page flex min-h-16 items-center justify-between gap-4 py-3'>
              <Link href='/' className='text-lg font-black tracking-tight text-slate-950 transition hover:text-emerald-800'>The Hippie Scientist</Link>
              <nav className='hidden rounded-full border border-slate-200 bg-white/80 p-1 shadow-sm md:flex'>
                {navLinks.map(link => (
                  <Link key={link.href} href={link.href} className='rounded-full px-4 py-2 text-sm font-bold text-slate-650 transition hover:bg-emerald-50 hover:text-emerald-800'>
                    {link.label}
                  </Link>
                ))}
              </nav>
              <MobileNav links={navLinks} />
            </div>
          </header>

          <main className='container-page py-6 sm:py-8'>{children}</main>

          <footer className='mt-10 border-t border-slate-200/80 bg-white/45'>
            <div className='container-page py-8 text-sm text-slate-600'>
              <p className='font-bold text-slate-950'>© The Hippie Scientist — Educational use only</p>
              <p className='mt-1 max-w-2xl text-xs leading-5 text-slate-500'>Start with a goal, review the stack, then compare herbs, compounds, and product-search paths with safety context first.</p>
              <div className='mt-4 flex flex-wrap gap-4'>
                {footerLinks.map(link => (
                  <Link key={link.href} href={link.href} className='font-bold text-slate-600 transition hover:text-emerald-800'>
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
