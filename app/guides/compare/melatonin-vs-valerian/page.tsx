import type { Metadata } from 'next'

import RuntimeEvidenceComparison from '@/src/components/comparison/RuntimeEvidenceComparison'
import { buildRuntimeComparisonMetadata } from '@/src/lib/runtime-comparison-metadata'

const COMPARISON_LEFT = { label: 'Melatonin', candidates: ['melatonin'] }
const COMPARISON_RIGHT = { label: 'Valerian', candidates: ['valerian', 'valerian-root', 'valeriana-officinalis'] }

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
