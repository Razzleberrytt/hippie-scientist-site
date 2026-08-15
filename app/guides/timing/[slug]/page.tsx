import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import Disclaimer from '@/src/components/Disclaimer'
import { buildPageMetadata } from '@/src/lib/seo'
import {
  cleanTimingValue,
  getTiming,
  loadIndexableTimingIngredients,
  type RuntimeIngredient,
} from '../timing-data'

function hasDaypartDecision(timing: string): boolean {
  return /\b(morning|afternoon|evening|night|nighttime|bedtime|before bed|daytime|earlier in the day|later in the day)\b/i.test(timing)
}

function getFoodDecision(record: RuntimeIngredient, timing: string): string {
  const bioavailability = cleanTimingValue(record.bioavailability_notes)
  const candidates = [bioavailability, timing].filter(Boolean)
  return candidates.find((value) => /\b(food|meal|meals|with fat|empty stomach|fasted|fasting)\b/i.test(value)) || ''
}

export async function generateStaticParams() {
  const ingredients = await loadIndexableTimingIngredients()
  return ingredients.map((record) => ({ slug: cleanTimingValue(record.slug) }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const ingredients = await loadIndexableTimingIngredients()
  const record = ingredients.find((item) => cleanTimingValue(item.slug) === slug)
  if (!record) return {}

  const name = cleanTimingValue(record.name) || slug
  return buildPageMetadata({
    title: `Best Time to Take ${name}: Evidence-Based Timing`,
    description: `When to take ${name}, based only on timing guidance present in The Hippie Scientist's structured evidence record.`,
    path: `/guides/timing/${slug}/`,
  })
}

export default async function IngredientTimingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const ingredients = await loadIndexableTimingIngredients()
  const record = ingredients.find((item) => cleanTimingValue(item.slug) === slug)
  if (!record) notFound()

  const name = cleanTimingValue(record.name) || slug
  const timing = getTiming(record)
  const grade = cleanTimingValue(record.evidence_grade) || cleanTimingValue(record.evidence_level)
  const showDaypartDecision = hasDaypartDecision(timing)
  const foodDecision = getFoodDecision(record, timing)

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

      {showDaypartDecision ? (
        <section className="card-premium max-w-3xl space-y-3 p-6 sm:p-8" aria-labelledby="morning-or-night">
          <p className="eyebrow-label">Morning or night?</p>
          <h2 id="morning-or-night" className="text-2xl font-semibold text-ink">Should you take {name} in the morning or at night?</h2>
          <p className="leading-7 text-muted">{timing}</p>
          <p className="text-sm leading-6 text-muted">
            The answer above is intentionally the canonical timing statement rather than a separate rule generated from pharmacology. If the source record does not support a morning-versus-night distinction, this section is omitted.
          </p>
        </section>
      ) : null}

      {foodDecision ? (
        <section className="card-premium max-w-3xl space-y-3 p-6 sm:p-8" aria-labelledby="with-food">
          <p className="eyebrow-label">Food and absorption</p>
          <h2 id="with-food" className="text-2xl font-semibold text-ink">Should you take {name} with or without food?</h2>
          <p className="leading-7 text-muted">{foodDecision}</p>
          <p className="text-sm leading-6 text-muted">
            This section appears only when the canonical timing or bioavailability record explicitly mentions food, meals, fasting, or an empty stomach. No food rule is generated from chemical properties alone.
          </p>
        </section>
      ) : null}

      <section className="max-w-3xl rounded-2xl border border-brand-900/10 bg-white/70 p-5 text-sm leading-6 text-muted dark:bg-white/5">
        Timing can depend on the studied formulation, dose, goal, tolerability, and other medicines. Treat the statement above as evidence context rather than a universal dosing instruction.
      </section>

      <Disclaimer />
    </main>
  )
}
