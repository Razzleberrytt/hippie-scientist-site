import { buildPageMetadata } from '../../../../src/lib/seo'
import type { Metadata } from 'next'
import { getHerbs, getCompounds } from '../../../../src/lib/runtime-data'
import { filterRenderableRuntimeRecords } from '../../../../lib/runtime-visibility'
import DynamicComparerClient from '../../../../src/components/compare/DynamicComparerClient'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'

export const metadata: Metadata = buildPageMetadata({
  title: 'Compare Supplements Side by Side: Evidence & Safety',
  description: 'Compare two herbs or supplements side by side by human evidence, mechanisms, dose context, side effects, and interaction risks.',
  path: '/guides/compare/dynamic/',
  robots: { index: false, follow: true },
})

function comparisonPayload(record: Record<string, unknown>) {
  const name = String(record.name || record.displayName || record.slug || '').trim()

  return {
    slug: String(record.slug || '').trim(),
    name,
    displayName: typeof record.displayName === 'string' ? record.displayName : undefined,
    summary: typeof record.summary === 'string' ? record.summary : undefined,
    description: typeof record.description === 'string' ? record.description : undefined,
    evidence_tier: typeof record.evidence_tier === 'string' ? record.evidence_tier : undefined,
    evidenceLevel: typeof record.evidenceLevel === 'string' ? record.evidenceLevel : undefined,
    confidence: typeof record.confidence === 'string' ? record.confidence : undefined,
    safety: typeof record.safety === 'string' ? record.safety : undefined,
    safety_flags: Array.isArray(record.safety_flags) ? record.safety_flags : undefined,
    mechanism: typeof record.mechanism === 'string' ? record.mechanism : undefined,
    mechanisms: Array.isArray(record.mechanisms) ? record.mechanisms : undefined,
    pathways: Array.isArray(record.pathways) ? record.pathways : undefined,
    onset: typeof record.onset === 'string' ? record.onset : undefined,
    time_to_effect: typeof record.time_to_effect === 'string' ? record.time_to_effect : undefined,
    duration: typeof record.duration === 'string' ? record.duration : undefined,
    dosage: typeof record.dosage === 'string' ? record.dosage : undefined,
    dose: typeof record.dose === 'string' ? record.dose : undefined,
    preparation: typeof record.preparation === 'string' ? record.preparation : undefined,
    preparations: typeof record.preparations === 'string' ? record.preparations : undefined,
    best_for: typeof record.best_for === 'string' || Array.isArray(record.best_for) ? record.best_for : undefined,
    bestFor: typeof record.bestFor === 'string' || Array.isArray(record.bestFor) ? record.bestFor : undefined,
  }
}

function renderableComparisonItems(records: Record<string, unknown>[]) {
  return filterRenderableRuntimeRecords(records)
    .map(comparisonPayload)
    .filter((record) => record.slug && record.name)
}

export default async function DynamicComparePage() {
  const [rawHerbs, rawCompounds] = await Promise.all([getHerbs(), getCompounds()])
  const herbs = renderableComparisonItems(rawHerbs as Record<string, unknown>[])
  const compounds = renderableComparisonItems(rawCompounds as Record<string, unknown>[])

  return (
    <div className='mx-auto max-w-6xl space-y-8 px-4 py-8 sm:py-10'>
      <AuthorityJsonLd
        title="Dynamic Ingredient Comparison Matrix"
        description="Side-by-side scientific comparison of herbs, compounds, and active extracts."
        url="https://thehippiescientist.net/guides/compare/dynamic"
        type="MedicalWebPage"
      />

      <section className='rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8'>
        <p className='eyebrow-label'>Scientific Tradeoff Auditor</p>
        <h1 className='text-3xl font-bold tracking-tight text-ink sm:text-5xl mt-2'>
          Dynamic Comparison Matrix
        </h1>
        <p className='mt-4 max-w-3xl text-base leading-7 text-muted sm:text-lg'>
          Audit potential options by choosing any two botanical extracts or compounds from our database. Compare safety profiles, receptor targets, evidence certitude, and standard preparations in real-time.
        </p>
      </section>

      <DynamicComparerClient herbs={herbs} compounds={compounds} />
    </div>
  )
}
