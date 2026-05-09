import { getSearchSummaryIndex } from '@/lib/runtime-summary-indexes'
import ComparisonTemplate from '@/components/comparison/ComparisonTemplate'

function normalize(value: string) {
  return String(value || '').trim().toLowerCase()
}

export default async function ComparePage({ params }: any) {
  const slug = normalize(params?.slug)
  const rows = await getSearchSummaryIndex()

  const [leftSlug, rightSlug] = slug.split('-vs-')

  const left = rows.find((row: any) => normalize(row.slug) === leftSlug)
  const right = rows.find((row: any) => normalize(row.slug) === rightSlug)

  if (!left || !right) {
    return null
  }

  return (
    <ComparisonTemplate
      title={`${left.name} vs ${right.name}`}
      summary="Evidence-aware semantic comparison generated from runtime relationship systems."
      left={left}
      right={right}
    />
  )
}
