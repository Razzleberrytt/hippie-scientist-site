import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Suspense } from 'react'
import { getHerbs, getCompounds } from '../../src/lib/runtime-data'
import { getRuntimeVisibility } from '../../lib/runtime-visibility'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
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

  const herbs: RuntimeRecord[] = rawHerbs.filter(
    (herb: RuntimeRecord) => getRuntimeVisibility(herb).canRender,
  )

  const compounds: RuntimeRecord[] = rawCompounds.filter(
    (compound: RuntimeRecord) => getRuntimeVisibility(compound).canRender,
  )

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
    <div className='mx-auto max-w-6xl space-y-6 px-4 pb-24 pt-4 sm:pt-6'>
      <SchemaGraphScript graph={schemaGraph} />

      <Breadcrumbs
        items={[
          { href: '/', label: 'Home' },
          { label: 'Safety Interaction Checker' },
        ]}
      />

      <header className='hero-shell rounded-[2rem] border px-5 py-6 sm:p-8'>
        <p className='eyebrow-label'>Educational safety screen</p>
        <h1 className='heading-premium mt-5 max-w-4xl'>Safety Interaction Checker</h1>
        <p className='text-reading mt-4 max-w-3xl'>
          Screen a supplement stack for possible interaction patterns and overlapping cautions. The checker uses structured safety and mechanism signals to decide what deserves a closer look; it cannot determine whether a combination is safe for you or predict a clinical interaction.
        </p>
      </header>

      <section className='grid gap-4 md:grid-cols-3' aria-label='How to use the supplement safety checker'>
        <article className='card-premium p-5 sm:p-6'>
          <p className='eyebrow-label'>Step 1</p>
          <h2 className='mt-3 text-lg font-semibold tracking-tight text-[color:var(--hs-ink)]'>Start with your full list</h2>
          <p className='mt-3 text-sm leading-6 text-[color:var(--hs-body)]'>
            Add the herbs, supplements, compounds, and medication classes you are trying to reason about. The screen looks for repeated caution categories such as sedation, stimulation, blood-pressure effects, serotonergic signals, bleeding concerns, and other structured safety flags.
          </p>
        </article>
        <article className='card-premium p-5 sm:p-6'>
          <p className='eyebrow-label'>Step 2</p>
          <h2 className='mt-3 text-lg font-semibold tracking-tight text-[color:var(--hs-ink)]'>Read flags, not permissions</h2>
          <p className='mt-3 text-sm leading-6 text-[color:var(--hs-body)]'>
            No flag does not mean a stack is proven safe, and a flag does not prove an interaction will occur. Use the output to decide what to simplify, research more carefully, or review with a clinician or pharmacist.
          </p>
        </article>
        <article className='card-premium p-5 sm:p-6'>
          <p className='eyebrow-label'>Step 3</p>
          <h2 className='mt-3 text-lg font-semibold tracking-tight text-[color:var(--hs-ink)]'>Escalate higher-risk contexts</h2>
          <p className='mt-3 text-sm leading-6 text-[color:var(--hs-body)]'>
            Prescription medications, pregnancy, breastfeeding, surgery, chronic disease, anticoagulants, antidepressants, sedatives, stimulants, and narrow-therapeutic-index medicines deserve medication-specific review rather than relying on a general supplement screen.
          </p>
        </article>
      </section>

      <section className='section-frame p-5 sm:p-6' aria-labelledby='safety-checker-boundaries'>
        <p className='eyebrow-label'>Interpret the output</p>
        <h2 id='safety-checker-boundaries' className='compact-heading mt-3'>What this checker can and cannot tell you</h2>
        <div className='mt-5 grid gap-5 border-t border-[color:var(--hs-hairline)] pt-5 md:grid-cols-2'>
          <div>
            <h3 className='text-sm font-bold uppercase tracking-wide text-emerald-800 dark:text-emerald-300'>Useful for</h3>
            <p className='mt-2 text-sm leading-6 text-[color:var(--hs-body)]'>
              Surfacing repeated caution categories, finding ingredient combinations that deserve a closer source check, comparing known safety notes, and identifying when a stack is becoming too complex to reason about from labels alone.
            </p>
          </div>
          <div>
            <h3 className='text-sm font-bold uppercase tracking-wide text-rose-800 dark:text-rose-300'>Not a substitute for</h3>
            <p className='mt-2 text-sm leading-6 text-[color:var(--hs-body)]'>
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

      <section className='section-frame p-5 sm:p-6' aria-labelledby='safety-checker-continue'>
        <p className='eyebrow-label'>Continue researching</p>
        <h2 id='safety-checker-continue' className='compact-heading mt-3'>Trace a flag back to the evidence</h2>
        <p className='mt-3 max-w-3xl text-sm leading-6 text-[color:var(--hs-body)]'>
          Use the Botanical Activity Atlas and ingredient profiles to inspect the chemistry, evidence strength, and source-specific safety notes behind a screening flag. For medication questions, use those pages as background for a clinician or pharmacist review rather than as a clearance tool.
        </p>
        <div className='mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap'>
          <Link href='/tools/botanical-activity-atlas/serotonergic-interaction-risk/' className='button-primary inline-flex min-h-11 items-center justify-center px-5 py-2.5 text-center text-sm font-bold'>
            Review serotonergic-signal botanicals
          </Link>
          <Link
            href='/tools/botanical-activity-atlas/'
            className='inline-flex min-h-11 items-center justify-center rounded-full border border-[color:var(--hs-hairline-strong)] bg-[color:var(--surface-card)] px-5 py-2.5 text-center text-sm font-bold text-[color:var(--hs-ink)] transition hover:border-[color:var(--hs-gold)] hover:text-[color:var(--hs-gold-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--hs-gold)] focus-visible:ring-offset-2'
          >
            Open the complete atlas
          </Link>
        </div>
      </section>

      <section className='rounded-[1.25rem] border border-rose-900/15 bg-rose-50/50 p-5 text-xs leading-relaxed text-rose-950 dark:border-rose-300/20 dark:bg-rose-950/20 dark:text-rose-100' aria-labelledby='safety-screening-limitation'>
        <h2 id='safety-screening-limitation' className='flex items-center gap-1.5 font-sans text-xs font-bold tracking-normal text-inherit'>
          <span aria-hidden='true'>⚠️</span> Educational screening limitation
        </h2>
        <p className='mt-2'>
          This tool matches selected items against qualitative safety fields and rule-based overlap categories in the site database. It can surface possible concerns but cannot verify that an interaction will occur, rule out interactions, account for your dose or medical history, or replace medication-specific review. If you take prescription or over-the-counter medicines, share your complete medication and supplement list with a clinician or pharmacist before changing your regimen.
        </p>
      </section>
    </div>
  )
}
