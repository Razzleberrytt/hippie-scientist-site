import type { Metadata } from 'next'

import RuntimeEvidenceComparison from '@/src/components/comparison/RuntimeEvidenceComparison'
import { buildPageMetadata } from '@/src/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'Berberine vs Cinnamon: Evidence, Dose & Safety',
  description: 'Compare berberine and cinnamon using canonical human-evidence, dose, form, safety, interaction, and mechanism context.',
  path: '/guides/compare/berberine-vs-cinnamon/',
})

export default function BerberineVsCinnamonPage() {
  return (
    <RuntimeEvidenceComparison
      title="Berberine vs Cinnamon"
      summary="Berberine and cinnamon are both discussed in metabolic-health searches, but their human evidence, preparations, doses, and interaction burdens are not interchangeable. This page compares the structured records directly."
      goal="Metabolic-health research where evidence strength and medication-interaction context matter more than shared blood-sugar marketing"
      left={{ label: 'Berberine', candidates: ['berberine'] }}
      right={{ label: 'Cinnamon', candidates: ['cinnamon', 'ceylon-cinnamon', 'cinnamomum-verum', 'cinnamomum-cassia'] }}
    />
  )
}
