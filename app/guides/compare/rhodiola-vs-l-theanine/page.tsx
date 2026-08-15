import type { Metadata } from 'next'

import RuntimeEvidenceComparison from '@/src/components/comparison/RuntimeEvidenceComparison'
import { buildPageMetadata } from '@/src/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'Rhodiola vs L-Theanine: Evidence, Dose & Safety',
  description: 'Compare rhodiola and L-theanine using canonical human-evidence, dose, form, safety, interaction, and mechanism context.',
  path: '/guides/compare/rhodiola-vs-l-theanine/',
})

export default function RhodiolaVsLTheaninePage() {
  return (
    <RuntimeEvidenceComparison
      title="Rhodiola vs L-Theanine"
      summary="Rhodiola and L-theanine can both appear in stress and focus searches, but they occupy different evidence and practical contexts. This page compares their human evidence, doses, preparations, safety, interactions, and mechanisms without assuming similar categories mean similar effects."
      goal="Stress or focus research where activation and calm-focus positioning need separate evidence interpretation"
      left={{ label: 'Rhodiola', candidates: ['rhodiola', 'rhodiola-rosea', 'rhodiola-rosea-extract'] }}
      right={{ label: 'L-Theanine', candidates: ['l-theanine', 'theanine'] }}
    />
  )
}
