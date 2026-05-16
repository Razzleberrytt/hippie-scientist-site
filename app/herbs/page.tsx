import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getHerbSummaryIndex } from '@/lib/runtime-summary-indexes'
import { getRuntimeVisibility } from '@/lib/runtime-visibility'
import HerbsIndexClient from './HerbsIndexClient'

export const metadata: Metadata = {
  title: 'Herbs | The Hippie Scientist',
  description: 'Browse evidence-aware herb profiles with mechanisms, safety context, traditional use, and practical supplement research.',
}

export default async function HerbsPage() {
  const allHerbs = await getHerbSummaryIndex()
  const herbs = allHerbs.filter((herb: any) => getRuntimeVisibility(herb).canRender)

  return (
    <Suspense fallback={null}>
      <HerbsIndexClient herbs={herbs} />
    </Suspense>
  )
}
