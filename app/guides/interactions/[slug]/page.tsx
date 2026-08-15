import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import Disclaimer from '@/src/components/Disclaimer'
import { getUnifiedRuntimeRecords } from '@/src/lib/runtime-record-index'
import { buildPageMetadata } from '@/src/lib/seo'

type RuntimeIngredient = Record<string, unknown> & {
  slug?: string
  name?: string
  interactions?: unknown
  safety?: unknown
  safety_confidence?: unknown
  evidence_grade?: unknown
}

type IngredientWithType = {
  record: RuntimeIngredient
  entityType: 'herb' | 'compound'
}

function clean(value: unknown): string {
  if (typeof value !== 'string') return ''
  return value.replace(/\s+/g, ' ').trim()
}

function labelKey(value: string): string {
  return value.replace(/[_-]+/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}

function toText(value: unknown): string {
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return clean(String(value))
  if (Array.isArray(value)) return value.map(toText).filter(Boolean).join('; ')
  if (value && typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>)
      .map(([key, nested]) => {
        const text = toText(nested)
        return text ? `${labelKey(key)}: ${text}` : ''
      })
      .filter(Boolean)
      .join('; ')
  }
  return ''
}

function hasMeaningfulInteractions(record: RuntimeIngredient): boolean {
  const text = toText(record.interactions)
  if (!text) return false
  return !/^(none|none known|unknown|n\/?a|not available|no data|no known interactions?)\.?$/i.test(text)
}

async function getEligibleIngredients(): Promise<IngredientWithType[]> {
  const { herbs, compounds } = await getUnifiedRuntimeRecords()
  const bySlug = new Map<string, IngredientWithType>()

  for (const record of herbs as RuntimeIngredient[]) {
    const slug = clean(record.slug)
    if (slug && hasMeaningfulInteractions(record) && !bySlug.has(slug)) bySlug.set(slug, { record, entityType: 'herb' })
  }
  for (const record of compounds as RuntimeIngredient[]) {
    const slug = clean(record.slug)
    if (slug && hasMeaningfulInteractions(record) && !bySlug.has(slug)) bySlug.set(slug, { record, entityType: 'compound' })
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
  const match = ingredients.find(({ record }) => clean(record.slug) === slug)
  if (!match) return {}
  const name = clean(match.record.name) || slug

  return buildPageMetadata({
    title: `${name} Interactions: Evidence & Safety Context`,
    description: `Documented ${name} interaction context from The Hippie Scientist's canonical safety record, with explicit uncertainty framing.`,
    path: `/guides/interactions/${slug}/`,
  })
}

export default async function IngredientInteractionsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const ingredients = await getEligibleIngredients()
  const match = ingredients.find(({ record }) => clean(record.slug) === slug)
  if (!match) notFound()

  const { record, entityType } = match
  const name = clean(record.name) || slug
  const interactionText = toText(record.interactions)
  const safetyText = toText(record.safety)
  const safetyConfidence = toText(record.safety_confidence)
  const grade = clean(record.evidence_grade)
  const profileHref = `/${entityType === 'herb' ? 'herbs' : 'compounds'}/${slug}/`

  return (
    <main className="container-page space-y-8 py-10">
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link href="/" className="hover:text-ink">Home</Link>
        <span aria-hidden="true"> / </span>
        <span>Interactions</span>
        <span aria-hidden="true"> / </span>
        <span className="text-ink">{name}</span>
      </nav>

      <header className="max-w-4xl space-y-4">
        <p className="eyebrow-label">Safety resource</p>
        <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">{name} interactions</h1>
        <p className="text-lg leading-8 text-muted">
          The structured record contains interaction information for {name}. This page surfaces that information without turning missing data into a claim of safety.
        </p>
      </header>

      <section className="card-premium max-w-4xl space-y-4 p-6 sm:p-8" aria-labelledby="documented-interactions">
        <h2 id="documented-interactions" className="text-2xl font-semibold text-ink">What the record flags</h2>
        <p className="leading-7 text-muted">{interactionText}</p>
        <p className="rounded-xl border border-amber-500/20 bg-amber-50/60 p-4 text-sm leading-6 text-muted dark:bg-amber-950/10">
          “Not listed” is not the same as “proven safe.” Interaction evidence is often incomplete, formulation-specific, dose-dependent, or based on mechanism rather than clinical events.
        </p>
      </section>

      {(safetyText || safetyConfidence || grade) ? (
        <section className="card-premium max-w-4xl space-y-3 p-6 sm:p-8">
          <h2 className="text-2xl font-semibold text-ink">Safety and evidence context</h2>
          {safetyText ? <p className="leading-7 text-muted">{safetyText}</p> : null}
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            {safetyConfidence ? <div><dt className="font-semibold text-ink">Safety confidence</dt><dd className="text-muted">{safetyConfidence}</dd></div> : null}
            {grade ? <div><dt className="font-semibold text-ink">Profile evidence grade</dt><dd className="text-muted">{grade}</dd></div> : null}
          </dl>
        </section>
      ) : null}

      <section className="max-w-4xl">
        <Link href={profileHref} className="button-secondary inline-flex rounded-full px-4 py-2 text-sm">
          Read the full {name} profile
        </Link>
      </section>

      <Disclaimer />
    </main>
  )
}
