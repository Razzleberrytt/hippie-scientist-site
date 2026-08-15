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
  bioavailability_notes?: unknown
  evidence_grade?: unknown
  evidence_level?: unknown
}

type EligibleIngredient = {
  record: RuntimeIngredient
  kind: 'herb' | 'compound'
  guidance: string
}

const FOOD_PATTERN = /\b(food|meal|meals|fasting|fasted|empty stomach|with breakfast|with dinner|with lunch|fat-containing|dietary fat)\b/i

function clean(value: unknown): string {
  if (typeof value !== 'string') return ''
  return value.replace(/\s+/g, ' ').trim()
}

function getFoodGuidance(record: RuntimeIngredient): string {
  const candidates = [clean(record.best_taken), clean(record.bioavailability_notes)]
  return candidates.find((value) => FOOD_PATTERN.test(value)) || ''
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
      const guidance = getFoodGuidance(record)
      if (!slug || !guidance) continue
      if (!bySlug.has(slug)) bySlug.set(slug, { record, kind, guidance })
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
    title: `${name}: With or Without Food? Evidence-Based Guidance`,
    description: `Whether to take ${name} with food, without food, or around meals, based only on explicit absorption or tolerability guidance in the structured evidence record.`,
    path: `/guides/timing/${slug}/with-or-without-food/`,
  })
}

export default async function WithOrWithoutFoodPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const ingredients = await getEligibleIngredients()
  const entry = ingredients.find(({ record }) => clean(record.slug) === slug)
  if (!entry) notFound()

  const { record, kind, guidance } = entry
  const name = clean(record.name) || slug
  const grade = clean(record.evidence_grade) || clean(record.evidence_level)
  const profileHref = kind === 'herb' ? `/herbs/${slug}/` : `/compounds/${slug}/`

  return (
    <main className="container-page space-y-8 py-10">
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link href="/" className="hover:text-ink">Home</Link>
        <span aria-hidden="true"> / </span>
        <Link href={`/guides/timing/${slug}/`} className="hover:text-ink">Timing</Link>
        <span aria-hidden="true"> / </span>
        <span className="text-ink">With or without food</span>
      </nav>

      <header className="max-w-3xl space-y-4">
        <p className="eyebrow-label">Food and absorption decision</p>
        <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          Should you take {name} with or without food?
        </h1>
        <p className="text-lg leading-8 text-muted">{guidance}</p>
      </header>

      <section className="card-premium max-w-3xl space-y-4 p-6 sm:p-8" aria-labelledby="food-answer">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-brand-700">Direct answer</p>
          <h2 id="food-answer" className="mt-1 text-2xl font-semibold text-ink">Follow the explicit meal guidance</h2>
        </div>
        <p className="leading-7 text-muted">{guidance}</p>
        <p className="text-sm leading-6 text-muted">
          This route is generated only when the canonical record explicitly mentions food, meals, fasting, an empty stomach, or a food-dependent absorption issue. It does not invent meal advice from chemistry alone.
        </p>
        {grade ? <p className="text-sm text-muted">Profile evidence grade: <strong className="text-ink">{grade}</strong>.</p> : null}
      </section>

      <section className="max-w-3xl rounded-2xl border border-brand-900/10 bg-white/70 p-5 dark:bg-white/5">
        <h2 className="text-lg font-semibold text-ink">Why the answer can differ</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          Food can matter because of absorption, gastrointestinal tolerability, formulation, or the exact dose studied. When the record does not distinguish those factors, this page preserves the narrower source-backed wording rather than expanding it into a universal rule.
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
