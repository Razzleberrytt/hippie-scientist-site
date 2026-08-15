import type { Metadata } from 'next'

import RuntimeEvidenceComparison from '@/src/components/comparison/RuntimeEvidenceComparison'
import { buildPageMetadata } from '@/src/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'Melatonin vs Valerian: Evidence, Dose & Safety',
  description: 'Compare melatonin and valerian using canonical human-evidence, dose, form, safety, interaction, and mechanism context.',
  path: '/guides/compare/melatonin-vs-valerian/',
})

export default function MelatoninVsValerianPage() {
  return (
    <RuntimeEvidenceComparison
      title="Melatonin vs Valerian"
      summary="Melatonin and valerian both appear in sleep conversations, but they should not be treated as equivalent sleep aids. Compare the human evidence, studied dose, preparation, safety, and interaction context recorded for each."
      goal="Sleep decisions where circadian-timing evidence and herbal sleep evidence need to be separated rather than blended together"
      left={{ label: 'Melatonin', candidates: ['melatonin'] }}
      right={{ label: 'Valerian', candidates: ['valerian', 'valerian-root', 'valeriana-officinalis'] }}
    />
  )
}
