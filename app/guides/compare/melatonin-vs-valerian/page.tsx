import type { Metadata } from 'next'

import RuntimeEvidenceComparison from '@/src/components/comparison/RuntimeEvidenceComparison'
import { buildRuntimeComparisonMetadata } from '@/src/lib/runtime-comparison-metadata'
import { RUNTIME_COMPARISON_SIDES } from '@/lib/runtime-comparison-sides'

const { left: COMPARISON_LEFT, right: COMPARISON_RIGHT } = RUNTIME_COMPARISON_SIDES['melatonin-vs-valerian']

export async function generateMetadata(): Promise<Metadata> {
  return buildRuntimeComparisonMetadata({
    title: 'Melatonin vs Valerian: Evidence, Dose & Safety',
    description: 'Compare melatonin and valerian using canonical human-evidence, dose, form, safety, interaction, and mechanism context.',
    path: '/guides/compare/melatonin-vs-valerian/',
    left: COMPARISON_LEFT,
    right: COMPARISON_RIGHT,
  })
}

export default function MelatoninVsValerianPage() {
  return (
    <RuntimeEvidenceComparison
      title="Melatonin vs Valerian"
      summary="Melatonin and valerian both appear in sleep conversations, but they should not be treated as equivalent sleep aids. Compare the human evidence, studied dose, preparation, safety, and interaction context recorded for each."
      goal="Sleep decisions where circadian-timing evidence and herbal sleep evidence need to be separated rather than blended together"
      left={COMPARISON_LEFT}
      right={COMPARISON_RIGHT}
    />
  )
}
