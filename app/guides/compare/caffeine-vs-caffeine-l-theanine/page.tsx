import type { Metadata } from 'next'

import RuntimeEvidenceComparison from '@/src/components/comparison/RuntimeEvidenceComparison'
import { buildRuntimeComparisonMetadata } from '@/src/lib/runtime-comparison-metadata'

const COMPARISON_LEFT = { label: 'Caffeine Alone', candidates: ['caffeine'] }
const COMPARISON_RIGHT = { label: 'L-Theanine Add-On Evidence', candidates: ['l-theanine', 'theanine'] }

export async function generateMetadata(): Promise<Metadata> {
  return buildRuntimeComparisonMetadata({
    title: 'Caffeine vs Caffeine + L-Theanine: Evidence & Safety',
    description: 'Compare caffeine alone with the L-theanine add-on evidence relevant to caffeine + L-theanine, using canonical dose and safety context.',
    path: '/guides/compare/caffeine-vs-caffeine-l-theanine/',
    left: COMPARISON_LEFT,
    right: COMPARISON_RIGHT,
  })
}

export default function CaffeineVsCaffeineLTheaninePage() {
  return (
    <RuntimeEvidenceComparison
      title="Caffeine vs Caffeine + L-Theanine"
      summary="This comparison treats caffeine as the shared base and uses the L-theanine record to show what changes when L-theanine is the add-on. The right column is component evidence, not a claim that every caffeine + L-theanine ratio has been clinically tested."
      goal="Focus decisions where the question is caffeine alone versus adding L-theanine, without generalizing beyond studied doses or formulations"
      left={COMPARISON_LEFT}
      right={COMPARISON_RIGHT}
    />
  )
}
