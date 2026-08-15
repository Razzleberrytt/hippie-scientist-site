import type { Metadata } from 'next'
import Link from 'next/link'
import { INDEXABLE_SAFETY_PAIR_GUIDES } from '@/lib/safety-pair-guides'
import { buildPageMetadata } from '@/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'Supplement & Medication Interaction Guides',
  description: 'Editorially reviewed, source-backed interaction guides for selected supplement and medication-class combinations.',
  path: '/safety-checker/interactions',
})

export default function InteractionGuidesPage() {
  return (
    <main className='mx-auto max-w-5xl space-y-8 px-4 py-8 sm:py-10'>
      <section className='rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8'>
        <p className='eyebrow-label'>Evidence-gated safety content</p>
        <h1 className='mt-2 text-3xl font-bold tracking-tight text-ink sm:text-5xl'>Interaction Guides</h1>
        <p className='mt-4 max-w-3xl text-base leading-7 text-muted sm:text-lg'>Only editorially approved combinations with meaningful supporting evidence are published here. Arbitrary Safety Checker combinations remain dynamic screening results and are not turned into indexable pages.</p>
      </section>

      <section className='grid gap-4 md:grid-cols-2'>
        {INDEXABLE_SAFETY_PAIR_GUIDES.map((guide) => <Link key={guide.slug} href={`/safety-checker/interactions/${guide.slug}/`} className='rounded-2xl border border-brand-900/10 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-900/20'><p className='text-xs font-bold uppercase tracking-wide text-emerald-800'>{guide.evidence} · {guide.confidence} confidence</p><h2 className='mt-2 text-xl font-bold text-ink'>{guide.title}</h2><p className='mt-2 text-sm leading-6 text-muted'>{guide.description}</p><span className='mt-4 inline-block text-sm font-bold text-indigo-800'>Read interaction evidence →</span></Link>)}
      </section>

      <section className='rounded-2xl border border-brand-900/10 bg-brand-50/50 p-5 text-sm leading-6 text-muted'>Need a combination that is not listed? Use the <Link href='/safety-checker/' className='font-bold text-indigo-800 underline'>interactive Safety Checker</Link>. A dynamic result is a screening aid, not an editorially verified interaction guide.</section>
    </main>
  )
}
