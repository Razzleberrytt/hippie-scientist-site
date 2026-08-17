import type { Metadata } from 'next'

import RuntimeEvidenceComparison from '@/src/components/comparison/RuntimeEvidenceComparison'
import { buildRuntimeComparisonMetadata } from '@/src/lib/runtime-comparison-metadata'

const COMPARISON_LEFT = { label: 'Magnesium Glycinate', candidates: ['magnesium-glycinate', 'magnesium-bisglycinate'] }
const COMPARISON_RIGHT = { label: 'Magnesium Threonate', candidates: ['magnesium-threonate', 'magnesium-l-threonate'] }

export async function generateMetadata(): Promise<Metadata> {
  return buildRuntimeComparisonMetadata({
    title: 'Magnesium Glycinate vs Threonate: Evidence, Dose & Safety',
    description: 'Compare magnesium glycinate and magnesium threonate using canonical evidence, dose, form, safety, interaction, and mechanism context.',
    path: '/guides/compare/magnesium-glycinate-vs-threonate/',
    left: COMPARISON_LEFT,
    right: COMPARISON_RIGHT,
  })
}

export default function MagnesiumGlycinateVsThreonatePage() {
  return (
    <RuntimeEvidenceComparison
      title="Magnesium Glycinate vs Threonate"
      summary="Magnesium glycinate and magnesium threonate are marketed for different reasons, but marketing is not outcome evidence. This page compares the structured human-evidence, formulation, dose, safety, and interaction context available for each form."
      goal="Choosing a magnesium form while separating form-specific evidence from marketing claims"
      left={COMPARISON_LEFT}
      right={COMPARISON_RIGHT}
    />
  )
}
