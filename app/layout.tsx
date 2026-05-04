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
  { href: '/best/sleep', label: 'Sleep' },
  { href: '/best/focus', label: 'Focus' },
  { href: '/best/fat-loss', label: 'Fat Loss' },
  { href: '/compounds', label: 'Compounds' },
]

export const metadata: Metadata = {
  title: {
    default: 'The Hippie Scientist',
    template: '%s | The Hippie Scientist',
  },
  description: 'Evidence-first supplement decision engine.',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang='en'>
      <body>
        <div className='min-h-screen text-white'>
          <header className='sticky top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur-xl'>
            <div className='container-page flex items-center justify-between py-3'>
              <Link href='/' className='text-lg font-black tracking-tight text-white'>Hippie Scientist</Link>
              <nav className='hidden md:flex gap-2'>
                {navLinks.map(l => (
                  <Link key={l.href} href={l.href} className='px-4 py-2 rounded-xl text-sm font-bold text-white/70 hover:text-white hover:bg-white/10'>
                    {l.label}
                  </Link>
                ))}
              </nav>
              <MobileNav links={navLinks} />
            </div>
          </header>

          <main className='container-page py-6'>{children}</main>

          <footer className='border-t border-white/10 mt-10 bg-black/30 backdrop-blur-xl'>
            <div className='container-page py-8 text-sm text-white/50'>
              <p className='font-bold text-white'>© The Hippie Scientist</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
