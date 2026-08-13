import { buildPageMetadata } from '../../../src/lib/seo'
import type { Metadata } from 'next'
import { getHerbs, getCompounds } from '../../../src/lib/runtime-data'
import { getRuntimeVisibility } from '../../../lib/runtime-visibility'
import DosageCalculatorClient from '../../../src/components/dosing/DosageCalculatorClient'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import { isRestrictedRecord } from '../../../src/lib/restricted-ingredients'
import { toDosingToolRecord } from '../../../src/lib/tool-page-payloads'
import type { RuntimeRecord } from '../../../src/types/content'

export const metadata: Metadata = buildPageMetadata({
  title: 'Supplement Dose Math & Active-Marker Calculator',
  description: 'Translate recorded supplement amounts and product-label standardization percentages into transparent active-marker math without personalized dose scaling.',
  path: '/info/dosing/',
})

export default async function DosingPage() {
  const [rawHerbs, rawCompounds] = await Promise.all([getHerbs(), getCompounds()])

  const herbs: RuntimeRecord[] = rawHerbs.filter((h: RuntimeRecord) => {
    if (isRestrictedRecord(h)) return false
    try {
      return getRuntimeVisibility(h).canRender
    } catch {
      return true
    }
  })

  const compounds: RuntimeRecord[] = rawCompounds.filter((c: RuntimeRecord) => {
    if (isRestrictedRecord(c)) return false
    try {
      return getRuntimeVisibility(c).canRender
    } catch {
      return true
    }
  })

  return (
    <div className='mx-auto max-w-6xl space-y-8 px-4 py-8 sm:py-10'>
      <AuthorityJsonLd
        title='Supplement Dose Math & Active-Marker Calculator'
        description='Translate recorded supplement amounts and product-label percentages into active-marker arithmetic without personalized dose recommendations.'
        url='https://thehippiescientist.net/info/dosing'
        type='MedicalWebPage'
      />

      <section className='space-y-4 rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8'>
        <p className='eyebrow-label'>Dose Math Tool</p>
        <h1 className='mt-2 text-3xl font-bold tracking-tight text-ink sm:text-5xl'>
          Supplement Dose Math &amp; Active-Marker Calculator
        </h1>
        <div className='rounded-2xl border border-rose-900/15 bg-rose-50 p-4 text-sm font-semibold leading-relaxed text-rose-950'>
          This tool does not calculate a dose for you. It converts simple recorded amounts and product-label percentages into transparent arithmetic so you can inspect the numbers without inventing a personalized regimen.
        </div>
        <p className='mt-4 max-w-3xl text-base leading-7 text-muted sm:text-lg'>
          Supplement records can mix raw-herb weight, extract weight, standardization percentage, serving size, and study context. Use this page to separate those quantities before deciding what evidence or safety information you still need.
        </p>
      </section>

      <section className='grid gap-4 md:grid-cols-3' aria-label='How to interpret supplement dose math'>
        <article className='rounded-2xl border border-brand-900/10 bg-white/85 p-5 shadow-sm'>
          <h2 className='text-base font-bold text-ink'>Source amount is not a personal dose</h2>
          <p className='mt-2 text-sm leading-6 text-muted'>
            A number recorded from a study, monograph, or product context belongs to that population, formulation, duration, and outcome. The calculator keeps the source amount visible instead of converting it into a body-weight recommendation.
          </p>
        </article>
        <article className='rounded-2xl border border-brand-900/10 bg-white/85 p-5 shadow-sm'>
          <h2 className='text-base font-bold text-ink'>Separate extract weight from marker yield</h2>
          <p className='mt-2 text-sm leading-6 text-muted'>
            A label can list 500 mg of extract while the standardized marker is only a fraction of that amount. Enter the percentage printed on the specific product to see the arithmetic rather than assuming a universal standardization.
          </p>
        </article>
        <article className='rounded-2xl border border-brand-900/10 bg-white/85 p-5 shadow-sm'>
          <h2 className='text-base font-bold text-ink'>Ambiguous units stay ambiguous</h2>
          <p className='mt-2 text-sm leading-6 text-muted'>
            If a source mixes units or does not provide a clean numeric amount, the tool leaves it uninterpreted. A missing or messy field should not silently become a made-up default range.
          </p>
        </article>
      </section>

      <section className='rounded-2xl border border-brand-900/10 bg-white/85 p-5 shadow-sm'>
        <h2 className='text-xl font-bold tracking-tight text-ink'>What this calculator is for</h2>
        <div className='mt-4 space-y-4 text-sm leading-7 text-muted'>
          <p>
            The useful part of dose math is often dimensional: converting grams to milligrams, understanding whether a number refers to total extract or an active marker, and checking what a stated percentage actually yields. Those calculations can expose label confusion without pretending to answer what a particular person should take.
          </p>
          <p>
            For any real-world decision, use the full profile to check the studied population, formulation, evidence quality, medication interactions, contraindications, and uncertainty. A larger body size does not automatically justify a larger supplement amount unless the underlying evidence specifically establishes weight-based dosing.
          </p>
        </div>
      </section>

      <DosageCalculatorClient
        herbs={herbs.map((herb) => toDosingToolRecord(herb, 'herb'))}
        compounds={compounds.map((compound) => toDosingToolRecord(compound, 'compound'))}
      />

      <section className='rounded-2xl border border-rose-900/15 bg-rose-50/50 p-5 text-xs leading-relaxed text-rose-950'>
        <p className='font-bold'>⚠️ Safety boundary</p>
        <p className='mt-1.5'>
          Do not use the arithmetic on this page as a prescription, escalation rule, cycling plan, or substitute for product-specific and person-specific medical guidance. Recorded ranges can be inappropriate outside the exact context in which they were studied or documented.
        </p>
      </section>
    </div>
  )
}
