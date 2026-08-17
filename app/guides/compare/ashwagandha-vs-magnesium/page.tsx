import type { Metadata } from 'next'

import RuntimeEvidenceComparison from '@/src/components/comparison/RuntimeEvidenceComparison'
import { buildRuntimeComparisonMetadata } from '@/src/lib/runtime-comparison-metadata'

const COMPARISON_LEFT = { label: 'Ashwagandha', candidates: ['ashwagandha', 'ashwagandha-extract', 'ksm-66-ashwagandha'] }
const COMPARISON_RIGHT = { label: 'Magnesium', candidates: ['magnesium', 'magnesium-glycinate', 'magnesium-citrate', 'magnesium-threonate'] }

export async function generateMetadata(): Promise<Metadata> {
  return buildRuntimeComparisonMetadata({
    title: 'Ashwagandha vs Magnesium: Evidence, Dose & Safety',
    description: 'Compare ashwagandha and magnesium using canonical human-evidence, dose, form, safety, interaction, and mechanism context.',
    path: '/guides/compare/ashwagandha-vs-magnesium/',
    left: COMPARISON_LEFT,
    right: COMPARISON_RIGHT,
  })
}

export default function AshwagandhaVsMagnesiumPage() {
  return (
    <RuntimeEvidenceComparison
      title="Ashwagandha vs Magnesium"
      summary="Ashwagandha and magnesium can overlap in stress and sleep-oriented searches, but their evidence, nutrient context, formulations, and safety considerations differ. This page compares the canonical records rather than treating them as substitutes."
      goal="Stress or sleep-adjacent decisions where an adaptogen and a mineral need separate evidence and safety interpretation"
      left={COMPARISON_LEFT}
      right={COMPARISON_RIGHT}
    />
  )
}
