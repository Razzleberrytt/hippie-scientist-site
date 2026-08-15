import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import Disclaimer from '@/src/components/Disclaimer'
import { buildPageMetadata } from '@/src/lib/seo'
import {
  cleanInteractionValue,
  interactionValueToText,
  loadIndexableInteractionIngredients,
} from '../interaction-data'

export async function generateStaticParams() {
  const ingredients = await loadIndexableInteractionIngredients()
  return ingredients.map((record) => ({ slug: cleanInteractionValue(record.slug) }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const ingredients = await loadIndexableInteractionIngredients()
  const record = ingredients.find((item) => cleanInteractionValue(item.slug) === slug)
  if (!record) return {}
  const name = cleanInteractionValue(record.name) || slug

  return buildPageMetadata({
    title: `${name} Interactions: Evidence & Safety Context`,
    description: `Documented ${name} interaction context from The Hippie Scientist's canonical safety record, with explicit uncertainty framing.`,
    path: `/guides/interactions/${slug}/`,
  })
}

export default async function IngredientInteractionsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const ingredients = await loadIndexableInteractionIngredients()
  const record = ingredients.find((item) => cleanInteractionValue(item.slug) === slug)
  if (!record) notFound()

  const name = cleanInteractionValue(record.name) || slug
  const interactionText = interactionValueToText(record.interactions)
  const safetyText = interactionValueToText(record.safety)
  const safetyConfidence = interactionValueToText(record.safety_confidence)
  const grade = cleanInteractionValue(record.evidence_grade)
  const profileHref = `/${record.entityType === 'compound' ? 'compounds' : 'herbs'}/${slug}/`

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
