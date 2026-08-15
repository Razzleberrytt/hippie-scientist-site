import type { Metadata } from 'next'

import RuntimeEvidenceComparison from '@/src/components/comparison/RuntimeEvidenceComparison'
import { buildPageMetadata } from '@/src/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'Melatonin vs L-Theanine: Evidence, Dose & Safety',
  description: 'Compare melatonin and L-theanine using canonical human-evidence, dose, form, safety, interaction, and mechanism context.',
  path: '/guides/compare/melatonin-vs-l-theanine/',
})

export default function MelatoninVsLTheaninePage() {
  return (
    <RuntimeEvidenceComparison
      title="Melatonin vs L-Theanine"
      summary="Melatonin and L-theanine can both appear in sleep routines, but one is closely tied to circadian signaling while the other is usually discussed in calm and relaxation contexts. This comparison keeps their evidence, dose, safety, and formulation records distinct."
      goal="Sleep or wind-down decisions where circadian timing and relaxation evidence should not be treated as interchangeable"
      left={{ label: 'Melatonin', candidates: ['melatonin'] }}
      right={{ label: 'L-Theanine', candidates: ['l-theanine', 'theanine'] }}
    />
  )
}
