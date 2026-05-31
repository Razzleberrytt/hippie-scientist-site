import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Newsletter Signup Confirmed | The Hippie Scientist',
  description: 'Newsletter signup confirmation page for The Hippie Scientist.',
  alternates: { canonical: '/newsletter/confirmed' },
}

export default function NewsletterConfirmedPage() {
  return (
    <main className='mx-auto max-w-3xl space-y-6 px-4 py-16 sm:px-6 lg:px-8'>
      <section className='rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-10'>
        <p className='text-xs font-bold uppercase tracking-[0.18em] text-brand-700'>Confirmed</p>
        <h1 className='mt-3 text-4xl font-bold tracking-tight text-ink'>You are on the list.</h1>
        <p className='mt-4 text-base leading-8 text-muted'>
          Thanks for joining The Hippie Scientist newsletter. Use the archive and safety checklist while the next note is prepared.
        </p>
        <div className='mt-7 flex flex-wrap gap-3'>
          <Link href='/newsletter' className='rounded-full bg-brand-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-900'>
            Open newsletter archive
          </Link>
          <Link href='/supplement-safety-checklist' className='rounded-full border border-brand-900/15 bg-white px-5 py-3 text-sm font-semibold text-brand-800 transition hover:bg-brand-50'>
            View safety checklist
          </Link>
        </div>
      </section>
    </main>
  )
}
