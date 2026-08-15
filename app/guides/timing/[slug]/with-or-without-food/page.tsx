import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import Disclaimer from '@/src/components/Disclaimer'
import { buildPageMetadata } from '@/src/lib/seo'
import {
  cleanTimingValue,
  getFoodTimingGuidance,
  loadFoodTimingIngredients,
} from '../../timing-data'

export async function generateStaticParams() {
  const ingredients = await loadFoodTimingIngredients()
  return ingredients.map((record) => ({ slug: cleanTimingValue(record.slug) }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const ingredients = await loadFoodTimingIngredients()
  const record = ingredients.find((item) => cleanTimingValue(item.slug) === slug)
  if (!record) return {}

  const name = cleanTimingValue(record.name) || slug
  return buildPageMetadata({
    title: `${name}: With or Without Food? Evidence-Based Guidance`,
    description: `Whether to take ${name} with food, without food, or around meals, based only on explicit absorption or tolerability guidance in the structured evidence record.`,
    path: `/guides/timing/${slug}/with-or-without-food/`,
  })
}

export default async function WithOrWithoutFoodPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const ingredients = await loadFoodTimingIngredients()
  const record = ingredients.find((item) => cleanTimingValue(item.slug) === slug)
  if (!record) notFound()

  const name = cleanTimingValue(record.name) || slug
  const guidance = getFoodTimingGuidance(record)
  const grade = cleanTimingValue(record.evidence_grade) || cleanTimingValue(record.evidence_level)
  const profileHref = record.entityType === 'compound' ? `/compounds/${slug}/` : `/herbs/${slug}/`

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
