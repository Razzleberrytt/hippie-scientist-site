import AuthorityHubTemplate from '@/components/authority/AuthorityHubTemplate'
import {
  getAuthorityComparisons,
  getAuthorityHubRecords,
  getAuthorityStacks,
} from '@/lib/authority-runtime'

function titleize(slug: string) {
  return slug
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export default async function TopicHubPage({ params }: any) {
  const slug = String(params?.slug || '').toLowerCase()

  const [records, comparisons, stacks] = await Promise.all([
    getAuthorityHubRecords(slug),
    getAuthorityComparisons(slug),
    getAuthorityStacks(slug),
  ])

  return (
    <AuthorityHubTemplate
      title={titleize(slug)}
      summary="Evidence-aware semantic authority hub generated from the Hippie Scientist runtime graph system."
      records={records}
      comparisons={comparisons}
      stacks={stacks}
    />
  )
}
