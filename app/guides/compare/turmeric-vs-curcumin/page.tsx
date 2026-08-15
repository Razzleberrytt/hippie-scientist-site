import type { Metadata } from 'next'

import RuntimeEvidenceComparison from '@/src/components/comparison/RuntimeEvidenceComparison'
import { buildPageMetadata } from '@/src/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'Turmeric vs Curcumin: Evidence, Dose & Safety',
  description: 'Compare turmeric and curcumin using canonical human-evidence, dose, form, safety, interaction, and mechanism context.',
  path: '/guides/compare/turmeric-vs-curcumin/',
})

export default function TurmericVsCurcuminPage() {
  return (
    <RuntimeEvidenceComparison
      title="Turmeric vs Curcumin"
      summary="Turmeric is a botanical matrix while curcumin is a major constituent/extract target, so evidence from one should not automatically be generalized to the other. This page compares their canonical evidence, dose, formulation, safety, and interaction records directly."
      goal="Choosing between a whole-botanical turmeric product and curcumin-focused preparations without treating the evidence as interchangeable"
      left={{ label: 'Turmeric', candidates: ['turmeric', 'curcuma-longa', 'turmeric-extract'] }}
      right={{ label: 'Curcumin', candidates: ['curcumin', 'curcuminoids'] }}
    />
  )
}
