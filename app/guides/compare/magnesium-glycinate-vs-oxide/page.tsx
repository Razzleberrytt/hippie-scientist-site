import type { Metadata } from 'next'

import RuntimeEvidenceComparison from '@/src/components/comparison/RuntimeEvidenceComparison'
import { buildPageMetadata } from '@/src/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'Magnesium Glycinate vs Oxide: Evidence, Dose & Safety',
  description: 'Compare magnesium glycinate and magnesium oxide using canonical evidence, dose, form, safety, interaction, and mechanism context.',
  path: '/guides/compare/magnesium-glycinate-vs-oxide/',
})

export default function MagnesiumGlycinateVsOxidePage() {
  return (
    <RuntimeEvidenceComparison
      title="Magnesium Glycinate vs Oxide"
      summary="Magnesium glycinate and magnesium oxide differ in formulation and may differ in practical dose and tolerability context. This comparison keeps the decision anchored to the evidence and safety data actually present for each form."
      goal="Choosing between two magnesium forms without equating elemental content or marketing claims with clinical superiority"
      left={{ label: 'Magnesium Glycinate', candidates: ['magnesium-glycinate', 'magnesium-bisglycinate'] }}
      right={{ label: 'Magnesium Oxide', candidates: ['magnesium-oxide'] }}
    />
  )
}
