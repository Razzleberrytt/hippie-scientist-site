import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { getHerbs, getCompounds } from '../../src/lib/runtime-data'
import { getRuntimeVisibility } from '../../lib/runtime-visibility'
import SchemaGraphScript from '@/components/seo/SchemaGraphScript'
import { WizardSkeleton } from '@/components/skeletons'
import { buildToolPageSchemaGraph } from '../../src/lib/schema-graph'
import { buildPageMetadata, SITE_URL } from '../../src/lib/seo'
import { toSafetyToolRecord } from '../../src/lib/tool-page-payloads'
import type { RuntimeRecord } from '../../src/types/content'

const SafetyCheckerClient = dynamic(
  () => import('../../src/components/safety/SafetyCheckerClient'),
  { loading: () => <WizardSkeleton /> },
)

export const metadata: Metadata = buildPageMetadata({
  title: 'Supplement Safety Interaction Checker – Stack Risk Tool',
  description:
    'Check supplement and herb combinations for interaction patterns, contraindications, and stacking risks before you buy. Educational tool only.',
  path: '/safety-checker',
})

export default async function SafetyCheckerPage() {
  const [rawHerbs, rawCompounds] = await Promise.all([getHerbs(), getCompounds()])

  const herbs: RuntimeRecord[] = rawHerbs.filter((h: RuntimeRecord) => {
    try {
      return getRuntimeVisibility(h).canRender
    } catch {
      return true
    }
  })

  const compounds: RuntimeRecord[] = rawCompounds.filter((c: RuntimeRecord) => {
    try {
      return getRuntimeVisibility(c).canRender
    } catch {
      return true
    }
  })

  const schemaGraph = buildToolPageSchemaGraph({
    path: '/safety-checker',
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

      <section className='grid gap-4 md:grid-cols-3' aria-label='How to use the supplement safety checker'>
        <article className='rounded-2xl border border-brand-900/10 bg-white/85 p-5 shadow-sm'>
          <h2 className='text-base font-bold text-ink'>Start with your full stack</h2>
          <p className='mt-2 text-sm leading-6 text-muted'>
            Add every herb, supplement, compound, and high-impact medication context you are trying to reason about. The most useful safety review looks for the combined burden: sedation, stimulation, blood-pressure effects, serotonergic load, bleeding risk, liver stress, or overlapping receptor targets.
          </p>
        </article>
        <article className='rounded-2xl border border-brand-900/10 bg-white/85 p-5 shadow-sm'>
          <h2 className='text-base font-bold text-ink'>Read patterns, not permissions</h2>
          <p className='mt-2 text-sm leading-6 text-muted'>
            A low-risk result does not mean a stack is guaranteed safe, and a caution flag does not diagnose an interaction. Treat the output as a screening layer that helps you decide what to simplify, research more carefully, or review with a clinician or pharmacist.
          </p>
        </article>
        <article className='rounded-2xl border border-brand-900/10 bg-white/85 p-5 shadow-sm'>
          <h2 className='text-base font-bold text-ink'>Escalate high-risk contexts</h2>
          <p className='mt-2 text-sm leading-6 text-muted'>
            Pregnancy, breastfeeding, surgery, bleeding disorders, liver or kidney disease, heart rhythm concerns, blood-pressure medication, anticoagulants, antidepressants, sedatives, and stimulants all deserve extra caution before experimenting with supplement combinations.
          </p>
        </article>
      </section>

      <section className='rounded-2xl border border-brand-900/10 bg-white/85 p-5 shadow-sm'>
        <h2 className='text-xl font-bold tracking-tight text-ink'>What this checker can and cannot tell you</h2>
        <div className='mt-4 grid gap-5 md:grid-cols-2'>
          <div>
            <h3 className='text-sm font-bold uppercase tracking-wide text-emerald-800'>Useful for</h3>
            <p className='mt-2 text-sm leading-6 text-muted'>
              Spotting repeated mechanism categories, comparing caution levels before buying, finding ingredient combinations that deserve slower titration, and identifying when a stack is becoming too complex to reason about from labels alone.
            </p>
          </div>
          <div>
            <h3 className='text-sm font-bold uppercase tracking-wide text-rose-800'>Not useful for</h3>
            <p className='mt-2 text-sm leading-6 text-muted'>
              Predicting individual side effects, replacing prescription guidance, checking exact drug metabolism for every medication, or proving that a combination is safe at a specific dose. Personal medical history can change the risk profile completely.
            </p>
          </div>
        </div>
      </section>

      <Suspense fallback={<WizardSkeleton />}>
        <SafetyCheckerClient
          herbs={herbs.map((herb) => toSafetyToolRecord(herb, 'herb'))}
          compounds={compounds.map((compound) => toSafetyToolRecord(compound, 'compound'))}
        />
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
