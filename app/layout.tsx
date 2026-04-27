import type { Metadata } from 'next'
import Link from 'next/link'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import './globals.css'

export const metadata: Metadata = {
  title: 'The Hippie Scientist',
  description: 'Science-first harm reduction for psychoactive botany.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <body>
        <div className='relative flex min-h-screen flex-col'>
          <header className='sticky top-0 z-50 border-b border-[var(--border-subtle)] bg-[color:rgb(11_18_32/92%)] backdrop-blur-md'>
            <nav className='mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-2.5 sm:px-6'>
              <Link href='/' className='rounded-xl px-2 py-1.5 text-[var(--text-primary)]'>
                <span className='text-xl font-semibold tracking-tight'>🌿 The Hippie Scientist</span>
              </Link>
              <div className='hidden items-center gap-1.5 md:flex'>
                <Link href='/herbs' className='inline-flex min-h-11 items-center rounded-lg px-3.5 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]'>Herbs</Link>
                <Link href='/compounds' className='inline-flex min-h-11 items-center rounded-lg px-3.5 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]'>Compounds</Link>
                <Link href='/blog' className='inline-flex min-h-11 items-center rounded-lg px-3.5 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]'>Blog</Link>
              </div>
            </nav>
          </header>
          <main id='main' className='main relative z-10 flex-1'>
            {children}
          </main>
          <footer className='mt-8 w-full border-t border-white/8 bg-[#07080F] px-4 py-12'>
            <div className='mx-auto flex w-full max-w-screen-lg flex-col justify-between gap-3 text-sm text-white/60 sm:flex-row'>
              <p>© 2026 The Hippie Scientist — Educational use only · Not medical advice</p>
              <div className='flex gap-4'>
                <Link href='/herbs'>Herbs</Link>
                <Link href='/compounds'>Compounds</Link>
                <Link href='/blog'>Blog</Link>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
