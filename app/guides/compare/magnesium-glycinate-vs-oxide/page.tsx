import type { Metadata } from 'next'

import RuntimeEvidenceComparison from '@/src/components/comparison/RuntimeEvidenceComparison'
import { buildRuntimeComparisonMetadata } from '@/src/lib/runtime-comparison-metadata'

const COMPARISON_LEFT = { label: 'Magnesium Glycinate', candidates: ['magnesium-glycinate', 'magnesium-bisglycinate'] }
const COMPARISON_RIGHT = { label: 'Magnesium Oxide', candidates: ['magnesium-oxide'] }

export async function generateMetadata(): Promise<Metadata> {
  return buildRuntimeComparisonMetadata({
    title: 'Magnesium Glycinate vs Oxide: Evidence, Dose & Safety',
    description: 'Compare magnesium glycinate and magnesium oxide using canonical evidence, dose, form, safety, interaction, and mechanism context.',
    path: '/guides/compare/magnesium-glycinate-vs-oxide/',
    left: COMPARISON_LEFT,
    right: COMPARISON_RIGHT,
  })
}

export default function MagnesiumGlycinateVsOxidePage() {
  return (
    <RuntimeEvidenceComparison
      title="Magnesium Glycinate vs Oxide"
      summary="Magnesium glycinate and magnesium oxide differ in formulation and may differ in practical dose and tolerability context. This comparison keeps the decision anchored to the evidence and safety data actually present for each form."
      goal="Choosing between two magnesium forms without equating elemental content or marketing claims with clinical superiority"
      left={COMPARISON_LEFT}
      right={COMPARISON_RIGHT}
    />
  )
}
