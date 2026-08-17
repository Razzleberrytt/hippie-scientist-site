import type { Metadata } from 'next'

import RuntimeEvidenceComparison from '@/src/components/comparison/RuntimeEvidenceComparison'
import { buildRuntimeComparisonMetadata } from '@/src/lib/runtime-comparison-metadata'

const COMPARISON_LEFT = { label: 'Ashwagandha', candidates: ['ashwagandha', 'ashwagandha-extract', 'ksm-66-ashwagandha'] }
const COMPARISON_RIGHT = { label: 'Saffron', candidates: ['saffron', 'crocus-sativus', 'saffron-extract'] }

export async function generateMetadata(): Promise<Metadata> {
  return buildRuntimeComparisonMetadata({
    title: 'Ashwagandha vs Saffron: Evidence, Dose & Safety',
    description: 'Compare ashwagandha and saffron using canonical human-evidence, dose, form, safety, interaction, and mechanism context.',
    path: '/guides/compare/ashwagandha-vs-saffron/',
    left: COMPARISON_LEFT,
    right: COMPARISON_RIGHT,
  })
}

export default function AshwagandhaVsSaffronPage() {
  return (
    <RuntimeEvidenceComparison
      title="Ashwagandha vs Saffron"
      summary="Ashwagandha and saffron can overlap in mood and stress-oriented searches, but their clinical evidence, preparations, doses, and safety profiles are different. This comparison keeps those distinctions explicit."
      goal="Stress or mood research where human outcome evidence and safety should outrank broad wellness positioning"
      left={COMPARISON_LEFT}
      right={COMPARISON_RIGHT}
    />
  )
}
