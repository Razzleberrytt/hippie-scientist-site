import type { Metadata } from 'next'

import RuntimeEvidenceComparison from '@/src/components/comparison/RuntimeEvidenceComparison'
import { buildRuntimeComparisonMetadata } from '@/src/lib/runtime-comparison-metadata'
import { RUNTIME_COMPARISON_SIDES } from '@/lib/runtime-comparison-sides'

const { left: COMPARISON_LEFT, right: COMPARISON_RIGHT } = RUNTIME_COMPARISON_SIDES['rhodiola-vs-l-theanine']

export async function generateMetadata(): Promise<Metadata> {
  return buildRuntimeComparisonMetadata({
    title: 'Rhodiola vs L-Theanine: Evidence, Dose & Safety',
    description: 'Compare rhodiola and L-theanine using canonical human-evidence, dose, form, safety, interaction, and mechanism context.',
    path: '/guides/compare/rhodiola-vs-l-theanine/',
    left: COMPARISON_LEFT,
    right: COMPARISON_RIGHT,
  })
}

export default function RhodiolaVsLTheaninePage() {
  return (
    <RuntimeEvidenceComparison
      title="Rhodiola vs L-Theanine"
      summary="Rhodiola and L-theanine can both appear in stress and focus searches, but they occupy different evidence and practical contexts. This page compares their human evidence, doses, preparations, safety, interactions, and mechanisms without assuming similar categories mean similar effects."
      goal="Stress or focus research where activation and calm-focus positioning need separate evidence interpretation"
      left={COMPARISON_LEFT}
      right={COMPARISON_RIGHT}
    />
  )
}
