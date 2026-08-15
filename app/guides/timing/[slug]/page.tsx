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

function clean(value: unknown): string {
  if (typeof value !== 'string') return ''
  return value.replace(/\s+/g, ' ').trim()
}

function getTiming(record: RuntimeIngredient): string {
  return clean(record.best_taken)
}

async function getEligibleIngredients(): Promise<RuntimeIngredient[]> {
  const { herbs, compounds } = await getUnifiedRuntimeRecords()
  const bySlug = new Map<string, RuntimeIngredient>()

  for (const record of [...herbs, ...compounds] as RuntimeIngredient[]) {
    const slug = clean(record.slug)
    const timing = getTiming(record)
    if (!slug || !timing) continue
    if (!bySlug.has(slug)) bySlug.set(slug, record)
  }

  return [...bySlug.values()]
}

export async function generateStaticParams() {
  const ingredients = await getEligibleIngredients()
  return ingredients.map((record) => ({ slug: clean(record.slug) }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const ingredients = await getEligibleIngredients()
  const record = ingredients.find((item) => clean(item.slug) === slug)
  if (!record) return {}

  const name = clean(record.name) || slug
  return buildPageMetadata({
    title: `Best Time to Take ${name}: Evidence-Based Timing`,
    description: `When to take ${name}, based only on timing guidance present in The Hippie Scientist's structured evidence record.`,
    path: `/guides/timing/${slug}/`,
  })
}

export default async function IngredientTimingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const ingredients = await getEligibleIngredients()
  const record = ingredients.find((item) => clean(item.slug) === slug)
  if (!record) notFound()

  const name = clean(record.name) || slug
  const timing = getTiming(record)
  const grade = clean(record.evidence_grade) || clean(record.evidence_level)

  return (
    <main className="container-page space-y-8 py-10">
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link href="/" className="hover:text-ink">Home</Link>
        <span aria-hidden="true"> / </span>
        <span>Timing</span>
        <span aria-hidden="true"> / </span>
        <span className="text-ink">{name}</span>
      </nav>

      <header className="max-w-3xl space-y-4">
        <p className="eyebrow-label">Evidence-gated timing guide</p>
        <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">Best time to take {name}</h1>
        <p className="text-lg leading-8 text-muted">{timing}</p>
      </header>

      <section className="card-premium max-w-3xl space-y-3 p-6 sm:p-8" aria-labelledby="timing-answer">
        <h2 id="timing-answer" className="text-2xl font-semibold text-ink">Direct answer</h2>
        <p className="leading-7 text-muted">{timing}</p>
        {grade ? <p className="text-sm text-muted">Profile evidence grade: <strong className="text-ink">{grade}</strong>.</p> : null}
        <p className="text-sm leading-6 text-muted">
          This page is published only when the canonical ingredient record contains explicit timing guidance. It does not infer a schedule from mechanism alone.
        </p>
      </section>

      <section className="max-w-3xl rounded-2xl border border-brand-900/10 bg-white/70 p-5 text-sm leading-6 text-muted dark:bg-white/5">
        Timing can depend on the studied formulation, dose, goal, tolerability, and other medicines. Treat the statement above as evidence context rather than a universal dosing instruction.
      </section>

      <Disclaimer />
    </main>
  )
}
