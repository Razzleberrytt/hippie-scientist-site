import type { Metadata } from 'next'
import { EmailCaptureBox } from '@/components/monetization/EmailCaptureBox'
import NewsletterCtaBlock from '../../components/NewsletterCtaBlock'

import { buildPageMetadata } from '@/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'Free Evidence-Based Supplement Safety Checklist (PDF)',
  description:
    'Download-style safety checklist: medications, dose and form checks, stacking risks, and quality markers before buying supplements.',
  path: '/supplement-safety-checklist',
})

export default function SupplementSafetyChecklistPage() {
  return (
    <main className='mx-auto max-w-5xl space-y-8 px-4 py-10 sm:px-6 lg:px-8'>
      <section className='rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-10'>
        <p className='text-xs font-bold uppercase tracking-[0.18em] text-brand-700'>Free checklist</p>
        <h1 className='mt-3 max-w-4xl text-4xl font-bold tracking-tight text-ink sm:text-5xl'>
          Check supplement safety before you buy, stack, or increase the dose.
        </h1>
        <p className='mt-5 max-w-3xl text-base leading-8 text-muted'>
          Use a simple safety-first checklist to review medications, pregnancy and breastfeeding, chronic conditions, sedative or stimulant stacking, product form, and dose transparency before making a supplement decision.
        </p>
      </section>

      <EmailCaptureBox goal='safety-checklist' variant='wide' />

      <section className='grid gap-4 md:grid-cols-3'>
        {[
          ['Medication review', 'Flag interaction-prone categories before adding a new product.'],
          ['Dose and form check', 'Compare elemental dose, extract standardization, and serving size.'],
          ['Stacking risk', 'Spot sedative, stimulant, liver, kidney, and blood-pressure concerns.'],
        ].map(([title, body]) => (
          <article key={title} className='rounded-2xl border border-brand-900/10 bg-white/85 p-5 shadow-sm'>
            <h2 className='text-base font-semibold text-ink'>{title}</h2>
            <p className='mt-3 text-sm leading-6 text-muted'>{body}</p>
          </article>
        ))}
      </section>

      <section className='rounded-[1.5rem] border border-brand-900/10 bg-white/85 p-6 shadow-sm sm:p-8'>
        <p className='text-xs font-bold uppercase tracking-[0.18em] text-brand-700'>Why trust it</p>
        <h2 className='mt-3 text-2xl font-semibold text-ink'>Built around caution, not conversion pressure</h2>
        <p className='mt-3 max-w-3xl text-sm leading-7 text-muted'>
          The checklist follows the same editorial rule as the main site: safety context comes before affiliate links, and uncertainty should stay visible when evidence is limited.
        </p>
      </section>

      <NewsletterCtaBlock
        title='Want the ongoing notes too?'
        description='The newsletter archive collects short safety and sourcing updates.'
        location='supplement-safety-checklist'
      />
    </main>
  )
}
