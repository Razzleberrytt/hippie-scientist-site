import type { Metadata } from 'next'

import RuntimeEvidenceComparison from '@/src/components/comparison/RuntimeEvidenceComparison'
import { buildPageMetadata } from '@/src/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'Lion’s Mane vs Bacopa: Evidence, Dose & Safety',
  description: 'Compare lion’s mane and bacopa using canonical human-evidence, dose, form, safety, interaction, and mechanism context.',
  path: '/guides/compare/lions-mane-vs-bacopa/',
})

export default function LionsManeVsBacopaPage() {
  return (
    <RuntimeEvidenceComparison
      title="Lion’s Mane vs Bacopa"
      summary="Lion’s mane and bacopa are both marketed for cognition, but mechanism narratives and human cognitive outcome evidence are not the same thing. This page compares the canonical evidence, dose, preparation, safety, and interaction records directly."
      goal="Cognition research where human outcomes should be separated from neurotrophic or mechanistic marketing"
      left={{ label: 'Lion’s Mane', candidates: ['lions-mane', 'lion-s-mane', 'lions-mane-mushroom'] }}
      right={{ label: 'Bacopa', candidates: ['bacopa', 'bacopa-monnieri', 'bacopa-monnieri-extract'] }}
    />
  )
}
