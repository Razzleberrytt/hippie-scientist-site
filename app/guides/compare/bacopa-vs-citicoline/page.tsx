import type { Metadata } from 'next'

import RuntimeEvidenceComparison from '@/src/components/comparison/RuntimeEvidenceComparison'
import { buildPageMetadata } from '@/src/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'Bacopa vs Citicoline: Evidence, Dose & Safety',
  description: 'Compare bacopa and citicoline using canonical human-evidence, dose, form, safety, interaction, and mechanism context.',
  path: '/guides/compare/bacopa-vs-citicoline/',
})

export default function BacopaVsCiticolinePage() {
  return (
    <RuntimeEvidenceComparison
      title="Bacopa vs Citicoline"
      summary="Bacopa and citicoline are both discussed for cognition, but they represent different intervention types and evidence bases. This page compares the canonical human evidence, dose, formulation, safety, interaction, and mechanism context for each."
      goal="Cognition or focus research where herbal memory evidence and choline-related evidence should remain distinct"
      left={{ label: 'Bacopa', candidates: ['bacopa', 'bacopa-monnieri', 'bacopa-monnieri-extract'] }}
      right={{ label: 'Citicoline', candidates: ['citicoline', 'cdp-choline'] }}
    />
  )
}
