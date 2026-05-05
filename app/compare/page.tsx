import { CompareTableClient } from '@/components/compare-table-client'
import { getCompounds } from '@/lib/runtime-data'

export default async function ComparePage() {
  const compounds = await getCompounds()

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <h1 className="text-3xl font-bold text-ink">Compound comparison</h1>
      <CompareTableClient compounds={compounds} />
    </main>
  )
}
