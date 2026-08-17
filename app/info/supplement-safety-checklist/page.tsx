import type { Metadata } from 'next'
import NewsletterSignup from '../../../components/NewsletterSignup'
import NewsletterCtaBlock from '../../../components/NewsletterCtaBlock'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import { buildPageMetadata } from '../../../src/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'Free Evidence-Based Supplement Safety Checklist (PDF)',
  description:
    'Download-style safety checklist: medications, dose and form checks, stacking risks, and quality markers before buying supplements.',
  path: '/info/supplement-safety-checklist',
})

const safetyChecks = [
  'Prescription & OTC medication overlap',
  'Pregnancy, breastfeeding, and chronic conditions',
  'Sedative / stimulant / serotonergic stacking',
  'Label dose, form, and third-party testing',
]

const checklistAreas = [
  ['Medication review', 'Flag interaction-prone categories before adding a new product.'],
  ['Dose and form check', 'Compare elemental dose, extract standardization, and serving size.'],
  ['Stacking risk', 'Spot sedative, stimulant, liver, kidney, and blood-pressure concerns.'],
] as const

export default function SupplementSafetyChecklistPage() {
  return (
    <div className='mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6 sm:py-10 lg:px-8'>
      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Info', href: '/info/' },
          { label: 'Supplement Safety Checklist' },
        ]}
      />

      <section className='hero-shell rounded-[2rem] border p-6 sm:p-8 lg:p-10'>
        <p className='eyebrow-label'>Free · No spam funnel</p>
        <h1 className='heading-premium mt-5 max-w-4xl'>The evidence-based supplement safety checklist</h1>
        <p className='text-reading mt-4 max-w-3xl'>
          Use this before any purchase: check medication conflicts, under-dosed extracts, risky stacks, and label-quality questions — the same categories the site reviews before linking affiliate products. Educational checklist only; it is not medical clearance for a product or stack.
        </p>
        <ul className='mt-6 grid gap-3 text-sm leading-6 sm:grid-cols-2' aria-label='Safety checklist coverage'>
          {safetyChecks.map(item => (
            <li key={item} className='flex gap-2 rounded-xl border border-[color:var(--hs-hairline)] bg-[color:var(--surface-subtle)] px-4 py-3 text-[color:var(--hs-body)]'>
              <span className='font-bold text-[color:var(--hs-gold-ink)]' aria-hidden='true'>✓</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <NewsletterSignup
        variant='card'
        title='Send me the free safety checklist'
        description='Enter your email to get the checklist workflow and occasional evidence-first updates. Educational only — not medical advice.'
        location='supplement-safety-checklist'
      />

      <section className='grid gap-4 md:grid-cols-3' aria-label='What the supplement safety checklist reviews'>
        {checklistAreas.map(([title, body]) => (
          <article key={title} className='card-premium p-5 sm:p-6'>
            <p className='eyebrow-label'>Safety check</p>
            <h2 className='mt-3 text-lg font-semibold tracking-tight text-[color:var(--hs-ink)]'>{title}</h2>
            <p className='mt-3 text-sm leading-6 text-[color:var(--hs-body)]'>{body}</p>
          </article>
        ))}
      </section>

      <section className='section-frame p-6 sm:p-8' aria-labelledby='safety-checklist-trust'>
        <p className='eyebrow-label'>Why trust it</p>
        <h2 id='safety-checklist-trust' className='compact-heading mt-3'>Built around caution, not conversion pressure</h2>
        <p className='mt-3 max-w-3xl text-sm leading-7 text-[color:var(--hs-body)]'>
          The checklist follows the same editorial rule as the main site: safety context comes before affiliate links, and uncertainty should stay visible when evidence is limited.
        </p>
      </section>

      <NewsletterCtaBlock
        title='Want the ongoing notes too?'
        description='The newsletter archive collects short safety and sourcing updates.'
        location='supplement-safety-checklist'
      />
    </div>
  )
}