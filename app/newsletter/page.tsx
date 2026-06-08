import type { Metadata } from 'next'
import Link from 'next/link'
import EmailCapture from '../../components/EmailCapture'

export const metadata: Metadata = {
  title: 'Newsletter Archive',
  description: 'Static archive for The Hippie Scientist newsletter notes on supplement safety, evidence, and sourcing.',
  alternates: { canonical: '/newsletter' },
}

const archiveItems = [
  {
    title: 'How to read supplement safety labels',
    description: 'Medication context, dose transparency, and why product form matters before affiliate clicks.',
  },
  {
    title: 'Evidence levels in plain English',
    description: 'Separating human trials, mechanistic plausibility, traditional use, and marketing claims.',
  },
  {
    title: 'What to check before buying magnesium',
    description: 'Elemental dose, form, laxative effects, and kidney-disease caution.',
  },
]

export default function NewsletterArchivePage() {
  return (
    <div className='mx-auto max-w-5xl space-y-8 px-4 py-10 sm:px-6 lg:px-8'>
      <section className='rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-10'>
        <p className='text-xs font-bold uppercase tracking-[0.18em] text-brand-700'>Newsletter archive</p>
        <h1 className='mt-3 text-4xl font-bold tracking-tight text-ink sm:text-5xl'>Evidence-first supplement notes</h1>
        <p className='mt-5 max-w-3xl text-base leading-8 text-muted'>
          Short static notes for readers who want safety, sourcing, and evidence context without sales-first supplement rankings.
        </p>
      </section>

      <div className='grid gap-4 md:grid-cols-3'>
        {archiveItems.map((item) => (
          <article key={item.title} className='rounded-2xl border border-brand-900/10 bg-white/85 p-5 shadow-sm'>
            <h2 className='text-base font-semibold text-ink'>{item.title}</h2>
            <p className='mt-3 text-sm leading-6 text-muted'>{item.description}</p>
          </article>
        ))}
      </div>

      <EmailCapture
        headline='Get the next newsletter'
        description='Join for concise research notes, product-quality reminders, and new safety-first guides.'
        ctaLabel='Subscribe'
        location='newsletter-archive'
      />

      <Link href='/supplement-safety-checklist' className='inline-flex rounded-full border border-brand-900/10 bg-white px-5 py-3 text-sm font-semibold text-brand-800 transition hover:bg-brand-50'>
        Get the safety checklist
      </Link>
    </div>
  )
}
