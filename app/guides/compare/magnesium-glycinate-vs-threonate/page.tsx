import type { Metadata } from 'next'

import RuntimeEvidenceComparison from '@/src/components/comparison/RuntimeEvidenceComparison'
import { buildPageMetadata } from '@/src/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'Magnesium Glycinate vs Threonate: Evidence, Dose & Safety',
  description: 'Compare magnesium glycinate and magnesium threonate using canonical evidence, dose, form, safety, interaction, and mechanism context.',
  path: '/guides/compare/magnesium-glycinate-vs-threonate/',
})

export default function MagnesiumGlycinateVsThreonatePage() {
  return (
    <RuntimeEvidenceComparison
      title="Magnesium Glycinate vs Threonate"
      summary="Magnesium glycinate and magnesium threonate are marketed for different reasons, but marketing is not outcome evidence. This page compares the structured human-evidence, formulation, dose, safety, and interaction context available for each form."
      goal="Choosing a magnesium form while separating form-specific evidence from marketing claims"
      left={{ label: 'Magnesium Glycinate', candidates: ['magnesium-glycinate', 'magnesium-bisglycinate'] }}
      right={{ label: 'Magnesium Threonate', candidates: ['magnesium-threonate', 'magnesium-l-threonate'] }}
    />
  )
}
