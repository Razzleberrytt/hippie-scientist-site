import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { getHerbs, getCompounds } from '@/lib/runtime-data'
import { getRuntimeVisibility } from '@/lib/runtime-visibility'
import SchemaGraphScript from '@/components/seo/SchemaGraphScript'
import { WizardSkeleton } from '@/components/skeletons'
import { buildToolPageSchemaGraph } from '@/lib/schema-graph'
import { buildPageMetadata, SITE_URL } from '@/lib/seo'

const SafetyCheckerClient = dynamic(
  () => import('@/components/safety/SafetyCheckerClient'),
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

  const herbs = rawHerbs.filter((h: any) => {
    try {
      return getRuntimeVisibility(h).canRender
    } catch {
      return true
    }
  })

  const compounds = rawCompounds.filter((c: any) => {
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
