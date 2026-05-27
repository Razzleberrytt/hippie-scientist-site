import type { Metadata } from 'next'
import { getHerbs, getCompounds } from '@/lib/runtime-data'
import { getRuntimeVisibility } from '@/lib/runtime-visibility'
import BuyGuideClient from '@/components/sourcing/BuyGuideClient'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'

export const metadata: Metadata = {
  title: 'Supplement Sourcing Checklist & Buying Guide',
  description: 'A scientific buying guide listing specific quality standards, standardized extracts, certificate of analysis (COA) requirements, and affiliate sourcing links.',
}

export default async function BuyGuidePage() {
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
    <main className='mx-auto max-w-6xl space-y-8 px-4 py-8 sm:py-10'>
      <AuthorityJsonLd
        title="Supplement Sourcing Checklist & Buying Guide"
        description="Verify standardized extracts and quality checklists for herbs and compounds before purchasing."
        url="https://thehippiescientist.net/buy-guide"
        type="MedicalWebPage"
      />

      <section className='rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8 space-y-4'>
        <p className='eyebrow-label'>Quality Control Auditor</p>
        <h1 className='text-3xl font-bold tracking-tight text-ink sm:text-5xl mt-2'>
          Sourcing Checklist & Buy Guide
        </h1>
        <p className='mt-4 max-w-3xl text-base leading-7 text-muted sm:text-lg'>
          The supplement marketplace is unregulated. Ensure safety and effectiveness by checking active chemical marker levels, heavy metal screening thresholds, and third-party laboratory verification before choosing a brand.
        </p>
      </section>

      <section className='grid gap-6 md:grid-cols-3'>
        <div className='rounded-2xl border border-brand-900/10 bg-white p-5 shadow-sm space-y-2'>
          <div className='h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center font-bold text-emerald-800 text-sm'>1</div>
          <h3 className='font-bold text-slate-800 text-sm'>Verify Standardization</h3>
          <p className='text-xs text-slate-500 leading-relaxed'>
            Raw root/leaf powders vary in potency. Always look for extracts standardized to active molecular compounds (e.g., 5% withanolides for Ashwagandha).
          </p>
        </div>
        <div className='rounded-2xl border border-brand-900/10 bg-white p-5 shadow-sm space-y-2'>
          <div className='h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center font-bold text-emerald-800 text-sm'>2</div>
          <h3 className='font-bold text-slate-800 text-sm'>Demand Third-Party COAs</h3>
          <p className='text-xs text-slate-500 leading-relaxed'>
            A Certificate of Analysis (COA) from an ISO-certified lab validates that the product is free from heavy metals, micro-contaminants, and solvent residues.
          </p>
        </div>
        <div className='rounded-2xl border border-brand-900/10 bg-white p-5 shadow-sm space-y-2'>
          <div className='h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center font-bold text-emerald-800 text-sm'>3</div>
          <h3 className='font-bold text-slate-800 text-sm'>Avoid Complex Proprietary Blends</h3>
          <p className='text-xs text-slate-500 leading-relaxed'>
            Proprietary formulas hide ingredient doses under a single group label. Opt for single extracts or fully transparent open-label formulas.
          </p>
        </div>
      </section>

      <BuyGuideClient herbs={herbs} compounds={compounds} />

      <section className='rounded-2xl border border-amber-900/15 bg-amber-50/70 p-5 text-xs leading-relaxed text-amber-950'>
        <p className='font-bold'>Disclosure & Safety Note:</p>
        <p className='mt-1'>
          Buying guides on this page include affiliate tracking codes to support our scientific research operations at no additional cost to you. We hold strict editorial independence and never accept payment to adjust our safety warnings, evidence ratings, or monograph assessments. Always consult a clinical professional before starting new dietary protocols.
        </p>
      </section>
    </main>
  )
}
