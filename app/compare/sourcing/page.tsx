import type { Metadata } from 'next'
import { getHerbs, getCompounds } from '@/lib/runtime-data'
import { getRuntimeVisibility } from '@/lib/runtime-visibility'
import SourcingComparerClient from '@/components/sourcing/SourcingComparerClient'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'

export const metadata: Metadata = {
  title: 'Contextual Sourcing Comparer & Active Yield Auditor | The Hippie Scientist',
  description: 'Compare typical servings cost, dosage standardization efficiency, active yield metrics, and purchase safety quality checklists.',
}

export default async function SourcingComparerPage() {
  const [rawHerbs, rawCompounds] = await Promise.all([getHerbs(), getCompounds()])

  const herbs = rawHerbs.filter((h: any) => {
    try {
      return getRuntimeVisibility(h).canRender
    } catch {
      return true
    }
  })

  const compounds = rawCompounds.filter((c: any) => {
    try {
      return getRuntimeVisibility(c).canRender
    } catch {
      return true
    }
  })

  return (
    <main className='mx-auto max-w-7xl space-y-8 px-4 py-8 sm:py-10'>
      <AuthorityJsonLd
        title="Contextual Sourcing Comparer & Active Yield Auditor"
        description="Compare the financial and active constituent efficiency of botanical and nutritional sources with a built-in quality cart."
        url="https://thehippiescientist.net/compare/sourcing"
        type="MedicalWebPage"
      />

      <section className='rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8 space-y-4'>
        <p className='eyebrow-label'>Clinical Cost Auditor</p>
        <h1 className='text-3xl font-bold tracking-tight text-ink sm:text-5xl mt-2'>
          Sourcing Cost & Yield Comparer
        </h1>
        <p className='mt-4 max-w-3xl text-base leading-7 text-muted sm:text-lg'>
          Audit typical prices, serving numbers, standardize active percentages, and calculate the cumulative active yield per dollar spent. Avoid overpaying for low-grade powders.
        </p>
      </section>

      <SourcingComparerClient herbs={herbs} compounds={compounds} />

      <section className='rounded-2xl border border-brand-900/15 bg-slate-50 p-5 text-xs leading-relaxed text-slate-600'>
        <p className='font-bold text-slate-800'>Methodology for Cost-per-Dose and Yield Auditing:</p>
        <p className='mt-1.5'>
          Botanical extracts contain varying concentration profiles (e.g. 5% vs 20% active bacosides or withanolides). This comparison dashboard calculates active constituent yield by taking the dosage weight, multiplying it by the standardization percentage, and dividing by the cost per single serving. Pinned cart items include checkmarks for third-party laboratory audits, heavy metals screenings, and certificate of analysis (COA) compliance before redirection to retail sourcing links.
        </p>
      </section>
    </main>
  )
}
