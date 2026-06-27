import { getSearchSummaryIndex } from '@/lib/runtime-summary-indexes'
import ComparisonTemplate from '@/components/comparison/ComparisonTemplate'

function normalize(value: string) {
  return String(value || '').trim().toLowerCase()
}

type ComparePageProps = {
  params: Promise<{ slug: string }>
}

export default async function ComparePage({ params }: ComparePageProps) {
  const resolvedParams = await params
  const slug = normalize(resolvedParams.slug)
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
