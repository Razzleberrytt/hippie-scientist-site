import type { Metadata } from 'next'
import Link from 'next/link'
import ResearchMatricesClient from '@/components/matrices/ResearchMatricesClient'
import { getResearchMatrixRows } from '@/lib/research-matrices'
import { buildPageMetadata } from '@/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'Supplement Evidence & Safety Matrices',
  description: 'Compare supplements across structured outcome mappings, evidence grades, human-study counts, and normalized safety signals.',
  path: '/tools/evidence-matrices',
})

export default async function EvidenceMatricesPage() {
  const rows = await getResearchMatrixRows()

  return (
    <main className='mx-auto max-w-7xl space-y-8 px-4 py-8 sm:py-10'>
      <section className='rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8'>
        <p className='eyebrow-label'>Research comparison tool</p>
        <h1 className='mt-2 text-3xl font-bold tracking-tight text-ink sm:text-5xl'>Supplement Evidence & Safety Matrices</h1>
        <p className='mt-4 max-w-4xl text-base leading-7 text-muted sm:text-lg'>One evidence matrix and eight safety-focused screening views built from the same canonical ingredient records. Use them to compare what is mapped, where evidence is stronger, and which safety signals deserve deeper review—without converting a database flag into medical advice.</p>
        <div className='mt-5 flex flex-wrap gap-3 text-sm'><Link href='/tools/botanical-activity-atlas/' className='font-semibold text-indigo-800 hover:underline'>Open the Botanical Activity Atlas →</Link><Link href='/safety-checker/' className='font-semibold text-indigo-800 hover:underline'>Screen a combination →</Link></div>
      </section>

      <section className='grid gap-4 md:grid-cols-3'>
        <article className='rounded-2xl border border-brand-900/10 bg-white/85 p-5 shadow-sm'><h2 className='font-bold text-ink'>Evidence stays separate</h2><p className='mt-2 text-sm leading-6 text-muted'>The profile grade and human-study count are displayed independently from outcome mappings and safety flags.</p></article>
        <article className='rounded-2xl border border-brand-900/10 bg-white/85 p-5 shadow-sm'><h2 className='font-bold text-ink'>Flags are screening signals</h2><p className='mt-2 text-sm leading-6 text-muted'>A structured caution does not by itself establish severity, dose dependence, or a documented clinical interaction.</p></article>
        <article className='rounded-2xl border border-brand-900/10 bg-white/85 p-5 shadow-sm'><h2 className='font-bold text-ink'>Missing is not safe</h2><p className='mt-2 text-sm leading-6 text-muted'>An empty field means the dataset does not currently contain that signal. It is never translated into a claim of no risk.</p></article>
      </section>

      <ResearchMatricesClient rows={rows} />

      <section className='rounded-2xl border border-brand-900/10 bg-white/80 p-5 text-xs leading-relaxed text-muted'><p className='font-bold text-ink'>Educational research tool</p><p className='mt-1.5'>These matrices summarize structured reference data. They do not diagnose conditions, choose treatment, establish pregnancy safety, or determine whether a medication-supplement combination is appropriate for an individual.</p></section>
    </main>
  )
}
