import type { Metadata } from 'next'

import RuntimeEvidenceComparison from '@/src/components/comparison/RuntimeEvidenceComparison'
import { buildRuntimeComparisonMetadata } from '@/src/lib/runtime-comparison-metadata'
import { RUNTIME_COMPARISON_SIDES } from '@/lib/runtime-comparison-sides'

const { left: COMPARISON_LEFT, right: COMPARISON_RIGHT } = RUNTIME_COMPARISON_SIDES['l-theanine-vs-ashwagandha']

export async function generateMetadata(): Promise<Metadata> {
  return buildRuntimeComparisonMetadata({
    title: 'L-Theanine vs Ashwagandha: Evidence, Dose & Safety',
    description: 'Compare L-theanine and ashwagandha using canonical human-evidence, dose, form, safety, interaction, and mechanism context.',
    path: '/guides/compare/l-theanine-vs-ashwagandha/',
    left: COMPARISON_LEFT,
    right: COMPARISON_RIGHT,
  })
}

export default function LTheanineVsAshwagandhaPage() {
  return (
    <RuntimeEvidenceComparison
      title="L-Theanine vs Ashwagandha"
      summary="L-theanine and ashwagandha are often grouped under stress or calm-support language, but their human evidence, dosing, formulations, and safety profiles are not the same. This page compares those records directly."
      goal="Stress or calm-support decisions where outcome evidence and safety should outrank shared category labels"
      left={COMPARISON_LEFT}
      right={COMPARISON_RIGHT}
    />
  )
}
