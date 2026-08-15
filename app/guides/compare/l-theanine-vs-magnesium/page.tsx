import type { Metadata } from 'next'

import RuntimeEvidenceComparison from '@/src/components/comparison/RuntimeEvidenceComparison'
import { buildPageMetadata } from '@/src/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'L-Theanine vs Magnesium: Evidence, Dose & Safety',
  description: 'Compare L-theanine and magnesium using canonical human-evidence, dose, form, safety, interaction, and mechanism context.',
  path: '/guides/compare/l-theanine-vs-magnesium/',
})

export default function LTheanineVsMagnesiumPage() {
  return (
    <RuntimeEvidenceComparison
      title="L-Theanine vs Magnesium"
      summary="L-theanine and magnesium can appear in the same calm, focus, and sleep conversations, but they are different interventions with different evidence and safety contexts. Compare what the structured records actually support rather than treating them as interchangeable."
      goal="Calm, focus, or sleep-adjacent decisions where evidence strength and safety matter more than shared marketing language"
      left={{ label: 'L-Theanine', candidates: ['l-theanine', 'theanine'] }}
      right={{ label: 'Magnesium', candidates: ['magnesium', 'magnesium-glycinate', 'magnesium-citrate', 'magnesium-threonate'] }}
    />
  )
}
