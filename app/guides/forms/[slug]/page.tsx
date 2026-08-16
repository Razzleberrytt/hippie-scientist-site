import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import Disclaimer from '@/src/components/Disclaimer'
import { buildPageMetadata } from '@/src/lib/seo'
import {
  cleanFormValue,
  formValueToText,
  getForms,
  loadIndexableFormIngredients,
} from '../form-data'

const EMPTY_STATIC_EXPORT_SLUG = '__static-export-empty__'

export async function generateStaticParams() {
  const ingredients = await loadIndexableFormIngredients()
  const realParams = ingredients.map((record) => ({ slug: cleanFormValue(record.slug) }))
  return realParams.length ? realParams : [{ slug: EMPTY_STATIC_EXPORT_SLUG }]
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const ingredients = await loadIndexableFormIngredients()
  const record = ingredients.find((item) => cleanFormValue(item.slug) === slug)
  if (!record) return {}
  const name = cleanFormValue(record.name) || slug

  return buildPageMetadata({
    title: `${name} Forms Compared: What Actually Differs?`,
    description: `Compare the forms recorded for ${name}, including formulation, dose, and bioavailability context when the canonical evidence record supports it.`,
    path: `/guides/forms/${slug}/`,
  })
}

export default async function IngredientFormsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const ingredients = await loadIndexableFormIngredients()
  const record = ingredients.find((item) => cleanFormValue(item.slug) === slug)
  if (!record) notFound()

  const name = cleanFormValue(record.name) || slug
  const forms = getForms(record)
  const bioavailability = formValueToText(record.bioavailability_notes)
  const dose = formValueToText(record.typical_dosage) || formValueToText(record.dosage)
  const profileHref = `/${record.entityType === 'compound' ? 'compounds' : 'herbs'}/${slug}/`

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
