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

type EcosystemHubPageProps = {
  params: Promise<{ slug: string }>
}

export default async function EcosystemHubPage({ params }: EcosystemHubPageProps) {
  const resolvedParams = await params
  const slug = String(resolvedParams.slug || '').toLowerCase()

  const [records, comparisons, stacks] = await Promise.all([
    getAuthorityHubRecords(slug),
    getAuthorityComparisons(slug),
    getAuthorityStacks(slug),
  ])

  return (
    <AuthorityHubTemplate
      title={`${titleize(slug)} Ecosystem`}
      summary="Semantic ecosystem authority hub generated from precomputed relationship graphs and continuity systems."
      records={records}
      comparisons={comparisons}
      stacks={stacks}
    />
  )
}
