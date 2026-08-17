import type { Metadata } from 'next'

import RuntimeEvidenceComparison from '@/src/components/comparison/RuntimeEvidenceComparison'
import { buildRuntimeComparisonMetadata } from '@/src/lib/runtime-comparison-metadata'

const COMPARISON_LEFT = { label: 'Creatine Monohydrate', candidates: ['creatine-monohydrate', 'creatine'] }
const COMPARISON_RIGHT = { label: 'Alternative Creatine Form', candidates: ['creatine-hcl', 'creatine-hydrochloride', 'buffered-creatine', 'creatine-ethyl-ester'] }

export async function generateMetadata(): Promise<Metadata> {
  return buildRuntimeComparisonMetadata({
    title: 'Creatine Monohydrate vs Alternative Forms: Evidence & Safety',
    description: 'Compare creatine monohydrate with alternative creatine forms using canonical evidence, dose, form, safety, interaction, and mechanism context.',
    path: '/guides/compare/creatine-monohydrate-vs-alternative-forms/',
    left: COMPARISON_LEFT,
    right: COMPARISON_RIGHT,
  })
}

export default function CreatineMonohydrateVsAlternativeFormsPage() {
  return (
    <RuntimeEvidenceComparison
      title="Creatine Monohydrate vs Alternative Forms"
      summary="Creatine monohydrate has a distinct evidence base and should not be assumed equivalent to every alternative creatine form. This comparison uses creatine HCl as the alternative-form record when available and keeps missing form-specific outcome data visible."
      goal="Choosing a creatine form while distinguishing formulation claims from form-specific human outcome evidence"
      left={COMPARISON_LEFT}
      right={COMPARISON_RIGHT}
    />
  )
}
