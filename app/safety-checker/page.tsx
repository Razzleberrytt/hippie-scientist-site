import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { getHerbs, getCompounds } from '../../src/lib/runtime-data'
import { getRuntimeVisibility } from '../../lib/runtime-visibility'
import SchemaGraphScript from '@/components/seo/SchemaGraphScript'
import { WizardSkeleton } from '@/components/skeletons'
import { buildToolPageSchemaGraph } from '../../src/lib/schema-graph'
import { buildPageMetadata, SITE_URL } from '../../src/lib/seo'
import { isRestrictedRecord } from '../../src/lib/restricted-ingredients'

const SafetyCheckerClient = dynamic(
  () => import('../../src/components/safety/SafetyCheckerClient'),
  { loading: () => <WizardSkeleton /> },
)

export const metadata: Metadata = buildPageMetadata({
  title: 'Supplement Safety Interaction Checker – Stack Risk Tool',
  description:
    'Check supplement and herb combinations for interaction patterns, contraindications, and stacking risks before you buy. Educational tool only.',
  path: '/safety-checker/',
})

type RuntimeRecord = Record<string, any>
type SafetyClientItem = {
  slug: string
  name: string
  displayName: string
  safety?: string
  safety_flags?: string[]
  mechanism?: string
  mechanisms?: string[]
}

function asText(value: unknown) {
  if (typeof value === 'string') return value.trim()
  if (typeof value === 'number') return String(value)
  return ''
}

function firstText(...values: unknown[]) {
  return values.map(asText).find(Boolean) || ''
}

function toTextList(value: unknown) {
  if (Array.isArray(value)) return value.map(asText).filter(Boolean).slice(0, 12)
  const raw = asText(value)
  return raw ? raw.split(/[;,\n]+/).map(item => item.trim()).filter(Boolean).slice(0, 12) : []
}

function canUseRecord(record: RuntimeRecord) {
  if (isRestrictedRecord(record)) return false
  try {
    return getRuntimeVisibility(record).canRender
  } catch {
    return true
  }
}

function toSafetyClientItem(record: RuntimeRecord): SafetyClientItem {
  const slug = firstText(record.slug)
  const name = firstText(record.displayName, record.name, record.compoundName, slug)
  const mechanisms = toTextList(record.mechanisms)
  const safetyFlags = toTextList(record.safety_flags)

  return {
    slug,
    name,
    displayName: name,
    safety: firstText(record.safety, record.safety_level, record.safetyNotes, record.safety_notes),
    safety_flags: safetyFlags,
    mechanism: firstText(record.mechanism, mechanisms[0]),
    mechanisms,
  }
}

export default async function SafetyCheckerPage() {
  const [rawHerbs, rawCompounds] = await Promise.all([getHerbs(), getCompounds()])

  const herbs = rawHerbs
    .filter(canUseRecord)
    .map(toSafetyClientItem)
    .filter(item => item.slug)

  const compounds = rawCompounds
    .filter(canUseRecord)
    .map(toSafetyClientItem)
    .filter(item => item.slug)

  const schemaGraph = buildToolPageSchemaGraph({
    path: '/safety-checker/',
    title: 'Multi-Item Safety Interaction Checker',
    description:
      'Interact with the safety matrix to evaluate potential contraindications when stacking multiple dietary supplements or active compounds.',
    breadcrumbs: [
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'Safety Interaction Checker', url: `${SITE_URL}/safety-checker/` },
    ],
    faqQuestions: [
      {
        question: 'What does the supplement safety checker evaluate?',
        answer:
          'The safety checker compares selected herbs and compounds against qualitative interaction patterns, contraindications, overlapping neurotransmitter or receptor effects, and stacking risks in the site reference database.',
      },
      {
        question: 'Is the safety checker medical advice?',
        answer:
          'No. The checker is an educational screening tool and is not a substitute for individualized review by a clinician or pharmacist, especially when prescription medications, pregnancy, chronic conditions, or high-risk supplements are involved.',
      },
      {
        question: 'Why should supplement stacks be checked before buying?',
        answer:
          'Stacking multiple supplements can increase sedation, stimulation, blood-pressure effects, serotonergic load, bleeding risk, or medication interactions. Reviewing combinations first helps identify reasons to avoid or simplify a stack.',
      },
    ],
  })

  return (
    <div className='mx-auto max-w-6xl space-y-8 px-4 py-8 sm:py-10'>
      <SchemaGraphScript graph={schemaGraph} />

      <section className='rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8 space-y-4'>
        <p className='eyebrow-label'>Harm Reduction Portal</p>
        <h1 className='text-3xl font-bold tracking-tight text-ink sm:text-5xl mt-2'>
          Safety Interaction Checker
        </h1>
        <p className='mt-4 max-w-3xl text-base leading-7 text-muted sm:text-lg'>
          Polypharmacy and supplement stacking can result in dangerous receptor loading overlaps. Evaluate potential interactions, neurotransmitter excesses, and contraindications before starting your stack.
        </p>
      </section>

      <Suspense fallback={<WizardSkeleton />}>
        <SafetyCheckerClient herbs={herbs} compounds={compounds} />
      </Suspense>

      <section className='rounded-2xl border border-rose-900/15 bg-rose-50/50 p-5 text-xs leading-relaxed text-rose-950'>
        <p className='font-bold flex items-center gap-1.5'>
          ⚠️ Medical Disclaimer & Limitation of Liability:
        </p>
        <p className='mt-1.5'>
          This automated interaction auditor searches published biomedical mechanisms and qualitative safety profiles in our reference database. It does NOT constitute clinical advice and is NOT a substitute for professional pharmacological evaluation. Supplements can cause idiosyncratic adverse reactions or interact dangerously with prescription pharmaceuticals. Always consult your primary care clinician or pharmacist before modifying any wellness regime.
        </p>
      </section>
    </div>
  )
}
