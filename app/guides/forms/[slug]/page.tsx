import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import Disclaimer from '@/src/components/Disclaimer'
import { getUnifiedRuntimeRecords } from '@/src/lib/runtime-record-index'
import { buildPageMetadata } from '@/src/lib/seo'

type RuntimeIngredient = Record<string, unknown> & {
  slug?: string
  name?: string
  forms?: unknown
  available_forms?: unknown
  bioavailability_notes?: unknown
  dosage?: unknown
  typical_dosage?: unknown
}

type IngredientWithType = {
  record: RuntimeIngredient
  entityType: 'herb' | 'compound'
}

function clean(value: unknown): string {
  if (typeof value !== 'string') return ''
  return value.replace(/\s+/g, ' ').trim()
}

function toText(value: unknown): string {
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return clean(String(value))
  if (Array.isArray(value)) return value.map(toText).filter(Boolean).join('; ')
  if (value && typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>)
      .map(([key, nested]) => {
        const text = toText(nested)
        return text ? `${key.replace(/[_-]+/g, ' ')}: ${text}` : ''
      })
      .filter(Boolean)
      .join('; ')
  }
  return ''
}

function toFormItems(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(toText).filter(Boolean)
  if (value && typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>)
      .map(([key, nested]) => {
        const detail = toText(nested)
        return detail ? `${key.replace(/[_-]+/g, ' ')}: ${detail}` : key.replace(/[_-]+/g, ' ')
      })
      .filter(Boolean)
  }
  const text = toText(value)
  if (!text) return []
  const split = text.split(/\s*[;|]\s*/).map((item) => item.trim()).filter(Boolean)
  return split.length >= 2 ? split : []
}

function getForms(record: RuntimeIngredient): string[] {
  const primary = toFormItems(record.forms)
  const fallback = toFormItems(record.available_forms)
  return [...new Set([...primary, ...fallback])]
}

async function getEligibleIngredients(): Promise<IngredientWithType[]> {
  const { herbs, compounds } = await getUnifiedRuntimeRecords()
  const bySlug = new Map<string, IngredientWithType>()

  for (const record of herbs as RuntimeIngredient[]) {
    const slug = clean(record.slug)
    if (slug && getForms(record).length >= 2 && !bySlug.has(slug)) bySlug.set(slug, { record, entityType: 'herb' })
  }
  for (const record of compounds as RuntimeIngredient[]) {
    const slug = clean(record.slug)
    if (slug && getForms(record).length >= 2 && !bySlug.has(slug)) bySlug.set(slug, { record, entityType: 'compound' })
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
    title: `${name} Forms Compared: What Actually Differs?`,
    description: `Compare the forms recorded for ${name}, including formulation, dose, and bioavailability context when the canonical evidence record supports it.`,
    path: `/guides/forms/${slug}/`,
  })
}

export default async function IngredientFormsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const ingredients = await getEligibleIngredients()
  const match = ingredients.find(({ record }) => clean(record.slug) === slug)
  if (!match) notFound()

  const { record, entityType } = match
  const name = clean(record.name) || slug
  const forms = getForms(record)
  const bioavailability = toText(record.bioavailability_notes)
  const dose = toText(record.typical_dosage) || toText(record.dosage)
  const profileHref = `/${entityType === 'herb' ? 'herbs' : 'compounds'}/${slug}/`

  return (
    <main className="container-page space-y-8 py-10">
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link href="/" className="hover:text-ink">Home</Link>
        <span aria-hidden="true"> / </span>
        <span>Forms</span>
        <span aria-hidden="true"> / </span>
        <span className="text-ink">{name}</span>
      </nav>

      <header className="max-w-4xl space-y-4">
        <p className="eyebrow-label">Form comparison</p>
        <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">{name} forms compared</h1>
        <p className="text-lg leading-8 text-muted">
          {forms.length} forms are represented in the canonical {name} record. This page compares only the distinctions the dataset actually contains; it does not declare a form “best” without supporting evidence.
        </p>
      </header>

      <section className="card-premium max-w-4xl space-y-5 p-6 sm:p-8">
        <h2 className="text-2xl font-semibold text-ink">Forms in the evidence record</h2>
        <ol className="grid gap-3 sm:grid-cols-2">
          {forms.map((form) => (
            <li key={form} className="rounded-2xl border border-brand-900/10 bg-white/70 p-4 leading-6 text-muted dark:bg-white/5">
              {form}
            </li>
          ))}
        </ol>
      </section>

      {(bioavailability || dose) ? (
        <section className="card-premium max-w-4xl space-y-4 p-6 sm:p-8">
          <h2 className="text-2xl font-semibold text-ink">What may matter when choosing a form</h2>
          {bioavailability ? <div><h3 className="font-semibold text-ink">Bioavailability / formulation</h3><p className="mt-1 leading-7 text-muted">{bioavailability}</p></div> : null}
          {dose ? <div><h3 className="font-semibold text-ink">Dose context</h3><p className="mt-1 leading-7 text-muted">{dose}</p></div> : null}
        </section>
      ) : null}

      <section className="max-w-4xl rounded-2xl border border-brand-900/10 bg-white/70 p-5 text-sm leading-6 text-muted dark:bg-white/5">
        Different chemical forms, extracts, salts, or preparations should not be assumed equivalent. Where the dataset does not contain form-specific outcome evidence, this page keeps that uncertainty visible.
      </section>

      <Link href={profileHref} className="button-secondary inline-flex rounded-full px-4 py-2 text-sm">Read the full {name} profile</Link>
      <Disclaimer />
    </main>
  )
}
