import type { Metadata } from 'next'
import AuthorityHubTemplate from '@/components/authority/AuthorityHubTemplate'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import {
  getAuthorityComparisons,
  getAuthorityHubRecords,
  getAuthorityStacks,
} from '@/lib/authority-runtime'
import { authorityTopicSlugs } from '@/app/authority-links'

function titleize(slug: string) {
  return slug
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export async function generateStaticParams() {
  return authorityTopicSlugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: any): Promise<Metadata> {
  const slug = String(params?.slug || '')
  const title = `${titleize(slug)} | Topic Authority Hub`

  return {
    title,
    description:
      'Evidence-aware semantic authority hub covering mechanisms, pathways, related herbs, compounds, stacks, and comparisons.',
  }
}

export default async function TopicHubPage({ params }: any) {
  const slug = String(params?.slug || '').toLowerCase()
  const title = titleize(slug)
  const description = 'Evidence-aware semantic authority hub generated from the Hippie Scientist runtime graph system.'

  const [records, comparisons, stacks] = await Promise.all([
    getAuthorityHubRecords(slug),
    getAuthorityComparisons(slug),
    getAuthorityStacks(slug),
  ])

  return (
    <>
      <AuthorityJsonLd
        title={title}
        description={description}
        url={`https://thehippiescientist.net/topics/${slug}`}
        type="CollectionPage"
        breadcrumbs={[
          {
            name: 'Home',
            url: 'https://thehippiescientist.net',
          },
          {
            name: 'Topics',
            url: 'https://thehippiescientist.net/topics',
          },
          {
            name: title,
            url: `https://thehippiescientist.net/topics/${slug}`,
          },
        ]}
      />

      <AuthorityHubTemplate
        title={title}
        summary={description}
        records={records}
        comparisons={comparisons}
        stacks={stacks}
      />
    </>
  )
}
