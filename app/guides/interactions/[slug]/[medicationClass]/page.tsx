import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import Disclaimer from '@/src/components/Disclaimer'
import { buildPageMetadata } from '@/src/lib/seo'
import {
  cleanInteractionValue,
  interactionValueToText,
  loadIndexableInteractionIngredients,
} from '../../interaction-data'

type MedicationClass = {
  slug: string
  label: string
  pattern: RegExp
}

const EMPTY_STATIC_EXPORT_SLUG = '__static-export-empty__'
const EMPTY_STATIC_EXPORT_MEDICATION_CLASS = '__static-export-empty__'

const MEDICATION_CLASSES: MedicationClass[] = [
  { slug: 'antidepressants', label: 'antidepressants', pattern: /\b(antidepressant|ssri|snri|maoi|serotonergic)\b/i },
  { slug: 'sedatives', label: 'sedatives and CNS depressants', pattern: /\b(sedative|benzodiazepine|cns depressant|sleep medication|hypnotic)\b/i },
  { slug: 'anticoagulants', label: 'anticoagulants and antiplatelet drugs', pattern: /\b(anticoagulant|antiplatelet|warfarin|blood thinner|bleeding)\b/i },
  { slug: 'diabetes-medications', label: 'diabetes medications', pattern: /\b(diabetes medication|antidiabetic|hypoglycemi|insulin|metformin|blood[- ]glucose)\b/i },
  { slug: 'blood-pressure-medications', label: 'blood-pressure medications', pattern: /\b(antihypertensive|blood pressure medication|hypotensi|ace inhibitor|beta blocker|calcium channel blocker)\b/i },
  { slug: 'thyroid-medications', label: 'thyroid medications', pattern: /\b(thyroid medication|levothyroxine|thyroxine|t3|t4)\b/i },
  { slug: 'immunosuppressants', label: 'immunosuppressants', pattern: /\b(immunosuppress|cyclosporine|tacrolimus)\b/i },
  { slug: 'cyp3a4-substrates', label: 'CYP3A4 substrates', pattern: /\bcyp3a4\b/i },
  { slug: 'cyp2d6-substrates', label: 'CYP2D6 substrates', pattern: /\bcyp2d6\b/i },
  { slug: 'cyp2c9-substrates', label: 'CYP2C9 substrates', pattern: /\bcyp2c9\b/i },
]

export async function generateStaticParams() {
  const records = await loadIndexableInteractionIngredients()
  const realParams = records.flatMap((record) => {
    const slug = cleanInteractionValue(record.slug)
    const interactions = interactionValueToText(record.interactions)
    return MEDICATION_CLASSES
      .filter((medicationClass) => medicationClass.pattern.test(interactions))
      .map((medicationClass) => ({ slug, medicationClass: medicationClass.slug }))
  })

  return realParams.length
    ? realParams
    : [{ slug: EMPTY_STATIC_EXPORT_SLUG, medicationClass: EMPTY_STATIC_EXPORT_MEDICATION_CLASS }]
}

async function resolvePage(slug: string, medicationClassSlug: string) {
  const records = await loadIndexableInteractionIngredients()
  const record = records.find((item) => cleanInteractionValue(item.slug) === slug)
  const medicationClass = MEDICATION_CLASSES.find((item) => item.slug === medicationClassSlug)
  if (!record || !medicationClass) return null

  const interactions = interactionValueToText(record.interactions)
  if (!medicationClass.pattern.test(interactions)) return null

  return { record, medicationClass, interactions }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string; medicationClass: string }> }): Promise<Metadata> {
  const { slug, medicationClass } = await params
  const resolved = await resolvePage(slug, medicationClass)
  if (!resolved) return {}
  const name = cleanInteractionValue(resolved.record.name) || slug

  return buildPageMetadata({
    title: `${name} + ${resolved.medicationClass.label}: Interaction Evidence`,
    description: `What The Hippie Scientist's canonical interaction record says about ${name} and ${resolved.medicationClass.label}, with uncertainty and safety context.`,
    path: `/guides/interactions/${slug}/${medicationClass}/`,
  })
}

export default async function MedicationClassInteractionPage({ params }: { params: Promise<{ slug: string; medicationClass: string }> }) {
  const { slug, medicationClass } = await params
  const resolved = await resolvePage(slug, medicationClass)
  if (!resolved) notFound()

  const { record, interactions, medicationClass: medicationClassConfig } = resolved
  const name = cleanInteractionValue(record.name) || slug
  const safety = interactionValueToText(record.safety)

  return (
    <main className="container-page space-y-8 py-10">
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link href="/" className="hover:text-ink">Home</Link>
        <span aria-hidden="true"> / </span>
        <Link href={`/guides/interactions/${slug}/`} className="hover:text-ink">{name} interactions</Link>
        <span aria-hidden="true"> / </span>
        <span className="text-ink">{medicationClassConfig.label}</span>
      </nav>

      <header className="max-w-4xl space-y-4">
        <p className="eyebrow-label">Medication-class safety explainer</p>
        <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">{name} and {medicationClassConfig.label}</h1>
        <p className="text-lg leading-8 text-muted">
          This explainer exists because the canonical {name} interaction record explicitly mentions this medication class or a named member of it. It does not create an interaction claim from mechanism alone.
        </p>
      </header>

      <section className="card-premium max-w-4xl space-y-4 p-6 sm:p-8">
        <h2 className="text-2xl font-semibold text-ink">What the structured record says</h2>
        <p className="leading-7 text-muted">{interactions}</p>
      </section>

      {safety ? (
        <section className="card-premium max-w-4xl space-y-3 p-6 sm:p-8">
          <h2 className="text-2xl font-semibold text-ink">Broader safety context</h2>
          <p className="leading-7 text-muted">{safety}</p>
        </section>
      ) : null}

      <section className="max-w-4xl rounded-2xl border border-amber-500/20 bg-amber-50/60 p-5 text-sm leading-6 text-muted dark:bg-amber-950/10">
        Interaction evidence can range from documented clinical events to pharmacokinetic or theoretical concerns. This page does not assume that every drug in a class behaves identically, and absence of a named drug from the dataset is not proof of safety.
      </section>

      <Disclaimer />
    </main>
  )
}
