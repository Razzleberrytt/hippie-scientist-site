import type { Metadata } from 'next'

import RuntimeEvidenceComparison from '@/src/components/comparison/RuntimeEvidenceComparison'
import { buildRuntimeComparisonMetadata } from '@/src/lib/runtime-comparison-metadata'
import { RUNTIME_COMPARISON_SIDES } from '@/lib/runtime-comparison-sides'

const { left: COMPARISON_LEFT, right: COMPARISON_RIGHT } = RUNTIME_COMPARISON_SIDES['citicoline-vs-alpha-gpc']

export async function generateMetadata(): Promise<Metadata> {
  return buildRuntimeComparisonMetadata({
    title: 'Citicoline vs Alpha-GPC: Evidence, Dose & Safety',
    description: 'Compare citicoline and Alpha-GPC using canonical human-evidence, dose, form, safety, interaction, and mechanism context.',
    path: '/guides/compare/citicoline-vs-alpha-gpc/',
    left: COMPARISON_LEFT,
    right: COMPARISON_RIGHT,
  })
}

export default function CiticolineVsAlphaGpcPage() {
  return (
    <RuntimeEvidenceComparison
      title="Citicoline vs Alpha-GPC"
      summary="Citicoline and Alpha-GPC are both choline-related options, but their evidence bases, studied doses, formulations, and safety context differ. This comparison keeps those differences tied to canonical records rather than category assumptions."
      goal="Focus or cognition research where two choline-related compounds need evidence-first comparison"
      left={COMPARISON_LEFT}
      right={COMPARISON_RIGHT}
    />
  )
}
