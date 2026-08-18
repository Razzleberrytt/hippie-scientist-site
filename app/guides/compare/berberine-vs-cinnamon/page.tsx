import type { Metadata } from 'next'

import RuntimeEvidenceComparison from '@/src/components/comparison/RuntimeEvidenceComparison'
import { buildRuntimeComparisonMetadata } from '@/src/lib/runtime-comparison-metadata'
import { RUNTIME_COMPARISON_SIDES } from '@/lib/runtime-comparison-sides'

const { left: COMPARISON_LEFT, right: COMPARISON_RIGHT } = RUNTIME_COMPARISON_SIDES['berberine-vs-cinnamon']

export async function generateMetadata(): Promise<Metadata> {
  return buildRuntimeComparisonMetadata({
    title: 'Berberine vs Cinnamon: Evidence, Dose & Safety',
    description: 'Compare berberine and cinnamon using canonical human-evidence, dose, form, safety, interaction, and mechanism context.',
    path: '/guides/compare/berberine-vs-cinnamon/',
    left: COMPARISON_LEFT,
    right: COMPARISON_RIGHT,
  })
}

export default function BerberineVsCinnamonPage() {
  return (
    <RuntimeEvidenceComparison
      title="Berberine vs Cinnamon"
      summary="Berberine and cinnamon are both discussed in metabolic-health searches, but their human evidence, preparations, doses, and interaction burdens are not interchangeable. This page compares the structured records directly."
      goal="Metabolic-health research where evidence strength and medication-interaction context matter more than shared blood-sugar marketing"
      left={COMPARISON_LEFT}
      right={COMPARISON_RIGHT}
    />
  )
}
