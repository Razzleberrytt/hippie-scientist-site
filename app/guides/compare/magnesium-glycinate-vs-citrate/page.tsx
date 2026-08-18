import type { Metadata } from 'next'

import RuntimeEvidenceComparison from '@/src/components/comparison/RuntimeEvidenceComparison'
import { buildRuntimeComparisonMetadata } from '@/src/lib/runtime-comparison-metadata'
import { RUNTIME_COMPARISON_SIDES } from '@/lib/runtime-comparison-sides'

const { left: COMPARISON_LEFT, right: COMPARISON_RIGHT } = RUNTIME_COMPARISON_SIDES['magnesium-glycinate-vs-citrate']

export async function generateMetadata(): Promise<Metadata> {
  return buildRuntimeComparisonMetadata({
    title: 'Magnesium Glycinate vs Citrate: Evidence, Dose & Safety',
    description: 'Compare magnesium glycinate and magnesium citrate using canonical evidence, dose, form, safety, interaction, and mechanism context.',
    path: '/guides/compare/magnesium-glycinate-vs-citrate/',
    left: COMPARISON_LEFT,
    right: COMPARISON_RIGHT,
  })
}

export default function MagnesiumGlycinateVsCitratePage() {
  return (
    <RuntimeEvidenceComparison
      title="Magnesium Glycinate vs Citrate"
      summary="Magnesium glycinate and magnesium citrate are different magnesium forms. Compare the human-evidence, dose, formulation, tolerability, and safety information actually present in the site’s canonical records before treating them as interchangeable."
      goal="Choosing a magnesium form without assuming that marketing claims establish superior clinical outcomes"
      left={COMPARISON_LEFT}
      right={COMPARISON_RIGHT}
    />
  )
}
