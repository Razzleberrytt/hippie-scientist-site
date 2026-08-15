import type { Metadata } from 'next'

import RuntimeEvidenceComparison from '@/src/components/comparison/RuntimeEvidenceComparison'
import { buildPageMetadata } from '@/src/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'Ashwagandha vs Magnesium: Evidence, Dose & Safety',
  description: 'Compare ashwagandha and magnesium using canonical human-evidence, dose, form, safety, interaction, and mechanism context.',
  path: '/guides/compare/ashwagandha-vs-magnesium/',
})

export default function AshwagandhaVsMagnesiumPage() {
  return (
    <RuntimeEvidenceComparison
      title="Ashwagandha vs Magnesium"
      summary="Ashwagandha and magnesium can overlap in stress and sleep-oriented searches, but their evidence, nutrient context, formulations, and safety considerations differ. This page compares the canonical records rather than treating them as substitutes."
      goal="Stress or sleep-adjacent decisions where an adaptogen and a mineral need separate evidence and safety interpretation"
      left={{ label: 'Ashwagandha', candidates: ['ashwagandha', 'ashwagandha-extract', 'ksm-66-ashwagandha'] }}
      right={{ label: 'Magnesium', candidates: ['magnesium', 'magnesium-glycinate', 'magnesium-citrate', 'magnesium-threonate'] }}
    />
  )
}
