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

type MedicationClass = {
  slug: string
  label: string
  examples: string
  pattern: RegExp
}

type EligiblePair = {
  record: RuntimeIngredient
  entityType: 'herb' | 'compound'
  medicationClass: MedicationClass
  sourceText: string
}

const MEDICATION_CLASSES: MedicationClass[] = [
  { slug: 'ssri-snri-antidepressants', label: 'SSRI / SNRI antidepressants', examples: 'sertraline, fluoxetine, escitalopram, duloxetine, venlafaxine', pattern: /\b(ssri|snri|sertraline|fluoxetine|escitalopram|citalopram|paroxetine|duloxetine|venlafaxine|antidepressant)\b/i },
  { slug: 'maoi-antidepressants', label: 'MAO inhibitors (MAOIs)', examples: 'phenelzine, tranylcypromine, selegiline', pattern: /\b(maoi|mao inhibitor|monoamine oxidase inhibitor|phenelzine|tranylcypromine|selegiline)\b/i },
  { slug: 'anticoagulants', label: 'blood thinners / anticoagulants', examples: 'warfarin, apixaban, rivaroxaban, clopidogrel', pattern: /\b(anticoagulant|blood thinner|warfarin|apixaban|eliquis|rivaroxaban|xarelto|clopidogrel|antiplatelet)\b/i },
  { slug: 'sedatives-sleep-meds', label: 'sedatives / sleep medicines', examples: 'benzodiazepines, zolpidem, gabapentin', pattern: /\b(benzodiazepine|benzo|sedative|sleep medication|sleep medicine|zolpidem|ambien|alprazolam|diazepam|clonazepam|gabapentin)\b/i },
  { slug: 'stimulant-adhd-meds', label: 'stimulant ADHD medicines', examples: 'amphetamine, lisdexamfetamine, methylphenidate', pattern: /\b(amphetamine|adderall|lisdexamfetamine|vyvanse|methylphenidate|ritalin|stimulant medication|adhd medication)\b/i },
  { slug: 'blood-pressure-meds', label: 'blood-pressure medicines', examples: 'beta-blockers, ACE inhibitors, calcium-channel blockers', pattern: /\b(beta[- ]?blocker|ace inhibitor|calcium channel blocker|antihypertensive|blood pressure medication|metoprolol|lisinopril|amlodipine)\b/i },
  { slug: 'thyroid-meds', label: 'thyroid medicines', examples: 'levothyroxine, liothyronine, methimazole', pattern: /\b(thyroid medication|levothyroxine|synthroid|liothyronine|methimazole|antithyroid)\b/i },
  { slug: 'statins', label: 'statins / cholesterol medicines', examples: 'atorvastatin, simvastatin, rosuvastatin', pattern: /\b(statin|atorvastatin|simvastatin|rosuvastatin|cholesterol medication|lipid[- ]lowering)\b/i },
  { slug: 'diabetes-meds', label: 'diabetes medicines', examples: 'metformin, insulin, sulfonylureas, GLP-1 medicines', pattern: /\b(diabetes medication|blood sugar medication|glucose[- ]lowering medication|metformin|insulin|sulfonylurea|glp[- ]?1|semaglutide|tirzepatide)\b/i },
  { slug: 'hormonal-contraceptives', label: 'hormonal contraceptives', examples: 'oral contraceptives, patch, ring, implant, injectable contraception', pattern: /\b(hormonal contraceptive|oral contraceptive|birth control pill|contraceptive pill|contraception|ethinyl estradiol)\b/i },
  { slug: 'immunosuppressants', label: 'immunosuppressants', examples: 'tacrolimus, cyclosporine, methotrexate, biologics', pattern: /\b(immunosuppressant|tacrolimus|cyclosporine|methotrexate|biologic therapy|transplant medication)\b/i },
]

function clean(value: unknown): string {
  if (typeof value === 'string') return value.replace(/\s+/g, ' ').trim()
  if (Array.isArray(value)) return value.map(clean).filter(Boolean).join('; ')
  if (value && typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>)
      .map(([key, nested]) => {
        const text = clean(nested)
        return text ? `${key.replace(/[_-]+/g, ' ')}: ${text}` : ''
      })
      .filter(Boolean)
      .join('; ')
  }
  return ''
}

function interactionSource(record: RuntimeIngredient): string {
  return clean(record.interactions)
}

async function getEligiblePairs(): Promise<EligiblePair[]> {
  const { herbs, compounds } = await getUnifiedRuntimeRecords()
  const pairs: EligiblePair[] = []

  for (const [entityType, records] of [
    ['herb', herbs],
    ['compound', compounds],
  ] as const) {
    for (const record of records as RuntimeIngredient[]) {
      const slug = clean(record.slug)
      const sourceText = interactionSource(record)
      if (!slug || !sourceText) continue

      for (const medicationClass of MEDICATION_CLASSES) {
        if (medicationClass.pattern.test(sourceText)) {
          pairs.push({ record, entityType, medicationClass, sourceText })
        }
      }
    }
  }

  return pairs
}

export async function generateStaticParams() {
  const pairs = await getEligiblePairs()
  return pairs.map(({ record, medicationClass }) => ({
    slug: clean(record.slug),
    medicationClass: medicationClass.slug,
  }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string; medicationClass: string }> }): Promise<Metadata> {
  const { slug, medicationClass } = await params
  const pairs = await getEligiblePairs()
  const pair = pairs.find((item) => clean(item.record.slug) === slug && item.medicationClass.slug === medicationClass)
  if (!pair) return {}

  const name = clean(pair.record.name) || slug
  return buildPageMetadata({
    title: `${name} + ${pair.medicationClass.label}: Interaction Safety`,
    description: `What the canonical ${name} interaction record says about ${pair.medicationClass.label}, with explicit uncertainty and safety framing.`,
    path: `/guides/interactions/${slug}/${medicationClass}/`,
  })
}

export default async function MedicationClassInteractionPage({ params }: { params: Promise<{ slug: string; medicationClass: string }> }) {
  const { slug, medicationClass } = await params
  const pairs = await getEligiblePairs()
  const pair = pairs.find((item) => clean(item.record.slug) === slug && item.medicationClass.slug === medicationClass)
  if (!pair) notFound()

  const { record, entityType, sourceText } = pair
  const name = clean(record.name) || slug
  const safetyConfidence = clean(record.safety_confidence)
  const grade = clean(record.evidence_grade)
  const profileHref = `/${entityType === 'herb' ? 'herbs' : 'compounds'}/${slug}/`

  return (
    <main className="container-page space-y-8 py-10">
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link href="/" className="hover:text-ink">Home</Link>
        <span aria-hidden="true"> / </span>
        <Link href={`/guides/interactions/${slug}/`} className="hover:text-ink">{name} interactions</Link>
        <span aria-hidden="true"> / </span>
        <span className="text-ink">{pair.medicationClass.label}</span>
      </nav>

      <header className="max-w-4xl space-y-4">
        <p className="eyebrow-label">Medication-class safety explainer</p>
        <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          {name} + {pair.medicationClass.label}
        </h1>
        <p className="text-lg leading-8 text-muted">
          This page exists because the canonical interaction record explicitly references this medication class or one of its common medicines. It is a screening resource, not a personalized interaction clearance.
        </p>
      </header>

      <section className="card-premium max-w-4xl space-y-4 p-6 sm:p-8">
        <h2 className="text-2xl font-semibold text-ink">What the source record says</h2>
        <p className="leading-7 text-muted">{sourceText}</p>
        <p className="text-sm leading-6 text-muted">
          Class examples include {pair.medicationClass.examples}. Examples are for recognition only; medicines within a class can differ in metabolism, dose, and interaction risk.
        </p>
      </section>

      <section className="max-w-4xl rounded-2xl border border-amber-500/20 bg-amber-50/60 p-5 dark:bg-amber-950/10">
        <h2 className="text-lg font-semibold text-ink">How to interpret this</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          A class-level flag means the combination deserves review. It does not prove that every medicine in the class interacts, and absence from this page does not prove safety. Confirm the exact medicine and dose with a pharmacist or prescribing clinician.
        </p>
        {(safetyConfidence || grade) ? (
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            {safetyConfidence ? <div><dt className="font-semibold text-ink">Safety confidence</dt><dd className="text-muted">{safetyConfidence}</dd></div> : null}
            {grade ? <div><dt className="font-semibold text-ink">Profile evidence grade</dt><dd className="text-muted">{grade}</dd></div> : null}
          </dl>
        ) : null}
      </section>

      <div className="flex flex-wrap gap-3">
        <Link href={`/guides/interactions/${slug}/`} className="button-secondary inline-flex rounded-full px-4 py-2 text-sm">All {name} interactions</Link>
        <Link href={profileHref} className="button-secondary inline-flex rounded-full px-4 py-2 text-sm">Full {name} profile</Link>
        <Link href="/safety-checker/" className="button-secondary inline-flex rounded-full px-4 py-2 text-sm">Safety Checker</Link>
      </div>

      <Disclaimer />
    </main>
  )
}
