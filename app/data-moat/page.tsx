import type { Metadata } from 'next'
import { getHerbs, getCompounds } from '@/lib/runtime-data'
import { getRuntimeVisibility } from '@/lib/runtime-visibility'
import DataMoatClient from '@/components/moat/DataMoatClient'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'

export const metadata: Metadata = {
  title: 'Platform Evidence Trust Score & Data Moat Dashboard',
  description: 'View real-time database completeness stats, GRADE evidence tier distributions, and cited reference coverage profiles.',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function DataMoatPage() {
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
        title="Platform Evidence Trust Score & Data Moat Dashboard"
        description="Audits the evidence quality and structural integrity metrics across all active database monographs."
        url="https://thehippiescientist.net/data-moat"
        type="MedicalWebPage"
      />

      <section className='rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8 space-y-4'>
        <p className='eyebrow-label'>Database Integrity Audit</p>
        <h1 className='text-3xl font-bold tracking-tight text-ink sm:text-5xl mt-2'>
          Scientific Trust Score Dashboard
        </h1>
        <p className='mt-4 max-w-3xl text-base leading-7 text-muted sm:text-lg'>
          Transparency is our primary asset. This dashboard displays structural metrics reflecting monograph coverage, GRADE evidence quality distributions, and active mechanism citation profiles.
        </p>
      </section>

      <DataMoatClient herbs={herbs} compounds={compounds} />

      <section className='rounded-2xl border border-brand-900/15 bg-slate-50 p-5 text-xs leading-relaxed text-slate-600'>
        <p className='font-bold text-slate-800'>Methodology Notes:</p>
        <p className='mt-1.5'>
          Completeness metrics evaluate whether each profile contains non-empty text fields for safety cautions, standard dosage inputs, specific molecular targets, and valid PubMed/MEDLINE reference PMIDs. The metrics are rebuilt dynamically with each production static export to verify total catalog integrity.
        </p>
      </section>
    </main>
  )
}
