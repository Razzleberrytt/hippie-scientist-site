import type { Metadata } from 'next'

import RuntimeEvidenceComparison from '@/src/components/comparison/RuntimeEvidenceComparison'
import { buildPageMetadata } from '@/src/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'Ashwagandha vs Saffron: Evidence, Dose & Safety',
  description: 'Compare ashwagandha and saffron using canonical human-evidence, dose, form, safety, interaction, and mechanism context.',
  path: '/guides/compare/ashwagandha-vs-saffron/',
})

export default function AshwagandhaVsSaffronPage() {
  return (
    <RuntimeEvidenceComparison
      title="Ashwagandha vs Saffron"
      summary="Ashwagandha and saffron can overlap in mood and stress-oriented searches, but their clinical evidence, preparations, doses, and safety profiles are different. This comparison keeps those distinctions explicit."
      goal="Stress or mood research where human outcome evidence and safety should outrank broad wellness positioning"
      left={{ label: 'Ashwagandha', candidates: ['ashwagandha', 'ashwagandha-extract', 'ksm-66-ashwagandha'] }}
      right={{ label: 'Saffron', candidates: ['saffron', 'crocus-sativus', 'saffron-extract'] }}
    />
  )
}
