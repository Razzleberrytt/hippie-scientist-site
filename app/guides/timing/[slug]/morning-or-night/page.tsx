import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import Disclaimer from '@/src/components/Disclaimer'
import { getUnifiedRuntimeRecords } from '@/src/lib/runtime-record-index'
import { buildPageMetadata } from '@/src/lib/seo'

type RuntimeIngredient = Record<string, unknown> & {
  slug?: string
  name?: string
  best_taken?: unknown
  evidence_grade?: unknown
  evidence_level?: unknown
}

type EligibleIngredient = {
  record: RuntimeIngredient
  kind: 'herb' | 'compound'
}

const DAYPART_PATTERN = /\b(morning|night|evening|bedtime|daytime|afternoon|a\.m\.|p\.m\.)\b/i

function clean(value: unknown): string {
  if (typeof value !== 'string') return ''
  return value.replace(/\s+/g, ' ').trim()
}

function getTiming(record: RuntimeIngredient): string {
  return clean(record.best_taken)
}

async function getEligibleIngredients(): Promise<EligibleIngredient[]> {
  const { herbs, compounds } = await getUnifiedRuntimeRecords()
  const bySlug = new Map<string, EligibleIngredient>()

  for (const [kind, records] of [
    ['herb', herbs],
    ['compound', compounds],
  ] as const) {
    for (const record of records as RuntimeIngredient[]) {
      const slug = clean(record.slug)
      const timing = getTiming(record)
      if (!slug || !timing || !DAYPART_PATTERN.test(timing)) continue
      if (!bySlug.has(slug)) bySlug.set(slug, { record, kind })
    }
  }

  return [...bySlug.values()]
}

export async function generateStaticParams() {
  const ingredients = await getEligibleIngredients()
  return ingredients.map(({ record }) => ({ slug: clean(record.slug) }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const ingredients = await getEligibleIngredients()
  const entry = ingredients.find(({ record }) => clean(record.slug) === slug)
  if (!entry) return {}

  const name = clean(entry.record.name) || slug
  return buildPageMetadata({
    title: `${name}: Morning or Night? Evidence-Based Timing`,
    description: `Should you take ${name} in the morning or at night? A direct answer based only on explicit timing guidance in the structured evidence record.`,
    path: `/guides/timing/${slug}/morning-or-night/`,
  })
}

export default async function MorningOrNightPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const ingredients = await getEligibleIngredients()
  const entry = ingredients.find(({ record }) => clean(record.slug) === slug)
  if (!entry) notFound()

  const { record, kind } = entry
  const name = clean(record.name) || slug
  const timing = getTiming(record)
  const grade = clean(record.evidence_grade) || clean(record.evidence_level)
  const profileHref = kind === 'herb' ? `/herbs/${slug}/` : `/compounds/${slug}/`

  return (
    <main className="container-page space-y-8 py-10">
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link href="/" className="hover:text-ink">Home</Link>
        <span aria-hidden="true"> / </span>
        <Link href={`/guides/timing/${slug}/`} className="hover:text-ink">Timing</Link>
        <span aria-hidden="true"> / </span>
        <span className="text-ink">Morning or night</span>
      </nav>

      <header className="max-w-3xl space-y-4">
        <p className="eyebrow-label">Morning-or-night decision</p>
        <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          Should you take {name} in the morning or at night?
        </h1>
        <p className="text-lg leading-8 text-muted">{timing}</p>
      </header>

      <section className="card-premium max-w-3xl space-y-4 p-6 sm:p-8" aria-labelledby="decision-answer">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-brand-700">Quick decision</p>
          <h2 id="decision-answer" className="mt-1 text-2xl font-semibold text-ink">Use the recorded timing guidance</h2>
        </div>
        <p className="leading-7 text-muted">{timing}</p>
        <p className="text-sm leading-6 text-muted">
          This page exists only when the canonical record explicitly names a daypart such as morning, evening, night, bedtime, or daytime. The site does not infer a morning-or-night answer from mechanism alone.
        </p>
        {grade ? <p className="text-sm text-muted">Profile evidence grade: <strong className="text-ink">{grade}</strong>.</p> : null}
      </section>

      <section className="max-w-3xl rounded-2xl border border-brand-900/10 bg-white/70 p-5 dark:bg-white/5">
        <h2 className="text-lg font-semibold text-ink">What can change the answer?</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          Timing can vary with dose, formulation, target outcome, tolerability, sleep schedule, and other medicines. If the structured record does not support a more specific distinction, this guide deliberately stops here.
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold">
          <Link href={`/guides/timing/${slug}/`} className="text-brand-800 hover:underline">Full timing guide →</Link>
          <Link href={profileHref} className="text-brand-800 hover:underline">{name} profile →</Link>
        </div>
      </section>

      <Disclaimer />
    </main>
  )
}
