import type { Metadata } from 'next'
import AuthorityHubTemplate from '@/components/authority/AuthorityHubTemplate'
import AuthoritySidebar from '@/components/authority/AuthoritySidebar'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import {
  getAuthorityComparisons,
  getAuthorityHubRecords,
  getAuthorityStacks,
} from '@/lib/authority-runtime'
import { authorityTopicSlugs } from '@/app/authority-links'
import { SITE_URL } from '@/lib/site'

function titleize(slug: string) {
  return slug
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

type TopicRouteProps = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return authorityTopicSlugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: TopicRouteProps): Promise<Metadata> {
  const resolvedParams = await params
  const slug = String(resolvedParams.slug || '')
  const title = `${titleize(slug)} | Topic Authority Hub`

  return {
    title,
    description:
      'Evidence-aware semantic authority hub covering mechanisms, pathways, related herbs, compounds, stacks, and comparisons.',
    robots: { index: false, follow: true },
  }
}

export default async function TopicHubPage({ params }: TopicRouteProps) {
  const resolvedParams = await params
  const slug = String(resolvedParams.slug || '').toLowerCase()
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
        url={`${SITE_URL}/topics/${slug}`}
        type="CollectionPage"
        breadcrumbs={[
          {
            name: 'Home',
            url: SITE_URL,
          },
          {
            name: 'Topics',
            url: `${SITE_URL}/topics`,
          },
          {
            name: title,
            url: `${SITE_URL}/topics/${slug}`,
          },
        ]}
      />

      <div className="container-page py-10 space-y-6">
        <AuthorityBreadcrumbs
          items={[
            {
              label: 'Home',
              href: '/',
            },
            {
              label: 'Topics',
              href: '/topics',
            },
            {
              label: title,
            },
          ]}
        />

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
          <AuthorityHubTemplate
            title={title}
            summary={description}
            records={records}
            comparisons={comparisons}
            stacks={stacks}
          />

          <AuthoritySidebar
            title="Related Topic Ecosystems"
            topics={[
              {
                href: '/topics/stress-response',
                label: 'Stress Response',
                meta: 'Adaptogens, cortisol regulation, and recovery pathways.',
              },
              {
                href: '/topics/sleep-recovery',
                label: 'Sleep Recovery',
                meta: 'Sleep-support systems and calming pathway exploration.',
              },
            ]}
            comparisons={[
              {
                href: '/compare/ashwagandha-vs-rhodiola',
                label: 'Ashwagandha vs Rhodiola',
              },
              {
                href: '/compare/l-theanine-vs-magnesium',
                label: 'L-Theanine vs Magnesium',
              },
            ]}
            protocols={[
              {
                href: '/protocols/deep-sleep-support',
                label: 'Deep Sleep Protocol',
              },
              {
                href: '/protocols/non-stimulant-focus',
                label: 'Morning Focus Protocol',
              },
            ]}
            stacks={[
              {
                href: '/stacks/sleep-recovery-stack',
                label: 'Sleep Recovery Stack',
              },
              {
                href: '/stacks/calm-focus-stack',
                label: 'Calm Focus Stack',
              },
            ]}
          />
        </div>
      </div>
    </>
  )
}
