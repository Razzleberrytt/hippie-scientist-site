import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { INDEXABLE_SAFETY_PAIR_GUIDES, getSafetyPairGuide } from '@/lib/safety-pair-guides'
import { buildPageMetadata } from '@/lib/seo'

interface PageProps { params: Promise<{ slug: string }> }

export const dynamicParams = false

export function generateStaticParams() {
  return INDEXABLE_SAFETY_PAIR_GUIDES.map((guide) => ({ slug: guide.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const guide = getSafetyPairGuide(slug)
  if (!guide) return {}
  return buildPageMetadata({
    title: guide.title,
    description: guide.description,
    path: `/safety-checker/interactions/${guide.slug}`,
  })
}

const label = (value: string) => value.replaceAll('-', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())

export default async function SafetyPairGuidePage({ params }: PageProps) {
  const { slug } = await params
  const guide = getSafetyPairGuide(slug)
  if (!guide) notFound()

  const checkerSearch = `?items=herb:${guide.ingredientSlug}&meds=${guide.counterpartId}`

  return (
    <main className='mx-auto max-w-4xl space-y-8 px-4 py-8 sm:py-10'>
      <nav aria-label='Breadcrumb' className='text-sm text-muted'><Link href='/safety-checker/' className='font-semibold text-indigo-800 hover:underline'>Safety Checker</Link><span aria-hidden='true' className='mx-2'>/</span><Link href='/safety-checker/interactions/' className='font-semibold text-indigo-800 hover:underline'>Interaction guides</Link></nav>

      <section className='rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8'>
        <p className='eyebrow-label'>Editorial interaction review</p>
        <h1 className='mt-2 text-3xl font-bold tracking-tight text-ink sm:text-5xl'>{guide.title}</h1>
        <p className='mt-4 text-base leading-7 text-muted sm:text-lg'>{guide.summary}</p>
        <div className='mt-5 flex flex-wrap gap-2 text-xs font-bold uppercase tracking-wide'><span className='rounded-full bg-emerald-50 px-3 py-1 text-emerald-950'>Evidence: {label(guide.evidence)}</span><span className='rounded-full bg-indigo-50 px-3 py-1 text-indigo-950'>Confidence: {guide.confidence}</span><span className='rounded-full bg-sky-50 px-3 py-1 text-sky-950'>Mechanism: {label(guide.mechanism)}</span></div>
      </section>

      <section className='grid gap-4 md:grid-cols-2'>
        <article className='rounded-2xl border border-brand-900/10 bg-white p-5 shadow-sm'><p className='eyebrow-label'>Why it is flagged</p><h2 className='mt-2 text-xl font-bold text-ink'>{guide.ingredientName} + {guide.counterpartName}</h2><p className='mt-3 text-sm leading-6 text-muted'>{guide.summary}</p></article>
        <article className='rounded-2xl border border-brand-900/10 bg-white p-5 shadow-sm'><p className='eyebrow-label'>Interaction mechanism</p><h2 className='mt-2 text-xl font-bold text-ink'>{label(guide.mechanism)}</h2><p className='mt-3 text-sm leading-6 text-muted'>{guide.mechanismExplanation}</p></article>
      </section>

      <section className='rounded-2xl border border-amber-900/15 bg-amber-50/70 p-5'><h2 className='text-xl font-bold text-amber-950'>What remains uncertain</h2><p className='mt-2 text-sm leading-6 text-amber-950'>{guide.uncertainty}</p></section>

      <section className='rounded-2xl border border-brand-900/10 bg-white p-5 shadow-sm'>
        <h2 className='text-xl font-bold text-ink'>Sources supporting this interaction review</h2>
        <p className='mt-2 text-sm leading-6 text-muted'>Primary studies are labeled separately from authoritative secondary guidance so the evidence chain is visible.</p>
        <ul className='mt-4 space-y-3'>{guide.sources.map((source) => <li key={source.url} className='rounded-xl bg-brand-50/60 p-3 text-sm'><a href={source.url} target='_blank' rel='noreferrer' className='font-bold text-indigo-800 underline'>{source.label}</a><span className='ml-2 rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-muted'>{source.primary ? 'Primary source' : 'Authoritative guidance'}</span></li>)}</ul>
      </section>

      <section className='rounded-2xl border border-indigo-900/10 bg-indigo-50/50 p-5'><h2 className='text-xl font-bold text-ink'>Screen this combination</h2><p className='mt-2 text-sm leading-6 text-muted'>Open the interactive checker with only the public ingredient slug and medication-class ID preselected. The URL does not contain personal medical information.</p><Link href={`/safety-checker/${checkerSearch}`} className='mt-4 inline-flex rounded-full bg-indigo-950 px-4 py-2 text-sm font-bold text-white'>Open prefilled Safety Checker →</Link></section>

      <section className='rounded-2xl border border-rose-900/15 bg-rose-50/50 p-5 text-xs leading-5 text-rose-950'><strong>Educational use only.</strong> This interaction review cannot determine whether a specific medication regimen is safe for an individual or replace medication-specific review by a pharmacist or clinician.</section>
    </main>
  )
}
