import type { Metadata } from 'next'

import RuntimeEvidenceComparison from '@/src/components/comparison/RuntimeEvidenceComparison'
import { buildRuntimeComparisonMetadata } from '@/src/lib/runtime-comparison-metadata'

const COMPARISON_LEFT = { label: 'Bacopa', candidates: ['bacopa', 'bacopa-monnieri', 'bacopa-monnieri-extract'] }
const COMPARISON_RIGHT = { label: 'Citicoline', candidates: ['citicoline', 'cdp-choline'] }

export async function generateMetadata(): Promise<Metadata> {
  return buildRuntimeComparisonMetadata({
    title: 'Bacopa vs Citicoline: Evidence, Dose & Safety',
    description: 'Compare bacopa and citicoline using canonical human-evidence, dose, form, safety, interaction, and mechanism context.',
    path: '/guides/compare/bacopa-vs-citicoline/',
    left: COMPARISON_LEFT,
    right: COMPARISON_RIGHT,
  })
}

export default function BacopaVsCiticolinePage() {
  return (
    <RuntimeEvidenceComparison
      title="Bacopa vs Citicoline"
      summary="Bacopa and citicoline are both discussed for cognition, but they represent different intervention types and evidence bases. This page compares the canonical human evidence, dose, formulation, safety, interaction, and mechanism context for each."
      goal="Cognition or focus research where herbal memory evidence and choline-related evidence should remain distinct"
      left={COMPARISON_LEFT}
      right={COMPARISON_RIGHT}
    />
  )
}
