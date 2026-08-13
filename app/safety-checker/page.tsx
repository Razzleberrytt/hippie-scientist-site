import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import Link from 'next/link'
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
    'Screen supplement and herb combinations for possible interaction patterns, contraindication signals, and stacking cautions. Educational tool only.',
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
      'Use the safety matrix as an educational screen for possible contraindication signals and overlapping caution patterns across selected supplements or active compounds.',
    breadcrumbs: [
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'Safety Interaction Checker', url: `${SITE_URL}/safety-checker/` },
    ],
    faqQuestions: [
      {
        question: 'What does the supplement safety checker evaluate?',
        answer:
          'The checker compares selected herbs and compounds against qualitative safety flags, mechanism categories, contraindication language, and medication-class cautions in the site reference database. A flag identifies something to review; it does not establish that a clinical interaction will occur.',
      },
      {
        question: 'Is the safety checker medical advice?',
        answer:
          'No. The checker is an educational screening tool and is not a substitute for individualized review by a clinician or pharmacist, especially when prescription medications, pregnancy, chronic conditions, surgery, or high-risk supplements are involved.',
      },
      {
        question: 'Why should supplement stacks be checked before buying?',
        answer:
          'Some supplements can interact with medications or with other supplements, and evidence is incomplete for many combinations. Screening a stack can surface reasons to simplify it or ask a clinician or pharmacist for a medication-specific review.',
      },
    ],
  })

  return (
    <div className='mx-auto max-w-6xl space-y-8 px-4 py-8 sm:py-10'>
      <SchemaGraphScript graph={schemaGraph} />

      <section className='rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8 space-y-4'>
        <p className='eyebrow-label'>Educational safety screen</p>
        <h1 className='text-3xl font-bold tracking-tight text-ink sm:text-5xl mt-2'>
          Safety Interaction Checker
        </h1>
        <p className='mt-4 max-w-3xl text-base leading-7 text-muted sm:text-lg'>
          Screen a supplement stack for possible interaction patterns and overlapping cautions. The checker uses structured safety and mechanism signals to decide what deserves a closer look; it cannot determine whether a combination is safe for you or predict a clinical interaction.
        </p>
      </section>

      <section className='grid gap-4 md:grid-cols-3' aria-label='How to use the supplement safety checker'>
        <article className='rounded-2xl border border-brand-900/10 bg-white/85 p-5 shadow-sm'>
          <h2 className='text-base font-bold text-ink'>Start with your full list</h2>
          <p className='mt-2 text-sm leading-6 text-muted'>
            Add the herbs, supplements, compounds, and medication classes you are trying to reason about. The screen looks for repeated caution categories such as sedation, stimulation, blood-pressure effects, serotonergic signals, bleeding concerns, and other structured safety flags.
          </p>
        </article>
        <article className='rounded-2xl border border-brand-900/10 bg-white/85 p-5 shadow-sm'>
          <h2 className='text-base font-bold text-ink'>Read flags, not permissions</h2>
          <p className='mt-2 text-sm leading-6 text-muted'>
            No flag does not mean a stack is proven safe, and a flag does not prove an interaction will occur. Use the output to decide what to simplify, research more carefully, or review with a clinician or pharmacist.
          </p>
        </article>
        <article className='rounded-2xl border border-brand-900/10 bg-white/85 p-5 shadow-sm'>
          <h2 className='text-base font-bold text-ink'>Escalate higher-risk contexts</h2>
          <p className='mt-2 text-sm leading-6 text-muted'>
            Prescription medications, pregnancy, breastfeeding, surgery, chronic disease, anticoagulants, antidepressants, sedatives, stimulants, and narrow-therapeutic-index medicines deserve medication-specific review rather than relying on a general supplement screen.
          </p>
        </article>
      </section>

      <section className='rounded-2xl border border-brand-900/10 bg-white/85 p-5 shadow-sm'>
        <h2 className='text-xl font-bold tracking-tight text-ink'>What this checker can and cannot tell you</h2>
        <div className='mt-4 grid gap-5 md:grid-cols-2'>
          <div>
            <h3 className='text-sm font-bold uppercase tracking-wide text-emerald-800'>Useful for</h3>
            <p className='mt-2 text-sm leading-6 text-muted'>
              Surfacing repeated caution categories, finding ingredient combinations that deserve a closer source check, comparing known safety notes, and identifying when a stack is becoming too complex to reason about from labels alone.
            </p>
          </div>
          <div>
            <h3 className='text-sm font-bold uppercase tracking-wide text-rose-800'>Not a substitute for</h3>
            <p className='mt-2 text-sm leading-6 text-muted'>
              Medication-specific interaction checking, dose-specific risk assessment, individual side-effect prediction, diagnosis, or professional review of your medical history. The database can also miss interactions that are unknown, newly reported, or not captured by its rules.
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

      <section className='rounded-2xl border border-emerald-900/10 bg-emerald-50/45 p-5 shadow-sm'>
        <p className='eyebrow-label'>Continue researching</p>
        <h2 className='mt-2 text-xl font-bold tracking-tight text-ink'>Trace a flag back to the evidence</h2>
        <p className='mt-2 max-w-3xl text-sm leading-6 text-muted'>
          Use the Botanical Activity Atlas and ingredient profiles to inspect the chemistry, evidence strength, and source-specific safety notes behind a screening flag. For medication questions, use those pages as background for a clinician or pharmacist review rather than as a clearance tool.
        </p>
        <div className='mt-4 flex flex-wrap gap-3'>
          <Link href='/tools/botanical-activity-atlas/serotonergic-interaction-risk/' className='rounded-full bg-emerald-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-800'>
            Review serotonergic-signal botanicals
          </Link>
          <Link href='/tools/botanical-activity-atlas/' className='rounded-full border border-emerald-900/20 bg-white px-4 py-2 text-sm font-bold text-emerald-900 transition hover:border-emerald-900/35'>
            Open the complete atlas
          </Link>
        </div>
      </section>

      <section className='rounded-2xl border border-rose-900/15 bg-rose-50/50 p-5 text-xs leading-relaxed text-rose-950'>
        <p className='font-bold flex items-center gap-1.5'>
          ⚠️ Educational screening limitation
        </p>
        <p className='mt-1.5'>
          This tool matches selected items against qualitative safety fields and rule-based overlap categories in the site database. It can surface possible concerns but cannot verify that an interaction will occur, rule out interactions, account for your dose or medical history, or replace medication-specific review. If you take prescription or over-the-counter medicines, share your complete medication and supplement list with a clinician or pharmacist before changing your regimen.
        </p>
      </section>
    </div>
  )
}
