import Link from 'next/link'
import type { ReactNode } from 'react'
import { bestPageHref } from '@/data/best'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import RelatedDiscoveryGroups from '@/components/ui/RelatedDiscoveryGroups'
import SchemaGraphScript from '@/components/seo/SchemaGraphScript'
import CompareHero from '@/components/compare/CompareHero'
import CompareDecisionWidget from '@/components/compare/CompareDecisionWidget'
import CompareSummaryTable from '@/components/compare/CompareSummaryTable'
import CompareRelated from '@/components/compare/CompareRelated'
import CompareFAQ from '@/components/compare/CompareFAQ'
import CompareCitations from '@/components/compare/CompareCitations'
import CompareSchema from '@/components/compare/CompareSchema'
import type { CompareItem } from '@/lib/compare'

type RelatedComparisonLink = {
  slug: string
  title: string
}

type BestPageLink = {
  slug: string
  title: string
}

type DiscoveryGroup = {
  title: string
  description?: string
  links: Array<{ href: string; label: string }>
}

type ComparePageScaffoldProps = {
  item1: CompareItem
  item2: CompareItem
  slug: string
  faqs: { question: string; answer: string }[]
  schemaGraph: Record<string, unknown>
  title: string
  isHarmReduction: boolean
  relatedComparisons: string[]
  runtimeComparisonLinks: RelatedComparisonLink[]
  relatedBestPages: BestPageLink[]
  relatedStack?: { slug: string } | null
  relatedDiscoveryGroups: DiscoveryGroup[]
  citationUrls?: string[]
  children: ReactNode
}

export default function ComparePageScaffold({
  item1,
  item2,
  slug,
  faqs,
  schemaGraph,
  title,
  isHarmReduction,
  relatedComparisons,
  runtimeComparisonLinks,
  relatedBestPages,
  relatedStack,
  relatedDiscoveryGroups,
  citationUrls = [],
  children,
}: ComparePageScaffoldProps) {
  const schemaFaqs = isHarmReduction ? [] : faqs

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-12">
      <SchemaGraphScript graph={schemaGraph} />
      <CompareSchema item1={item1} item2={item2} slug={slug} faqs={schemaFaqs} citationUrls={citationUrls} />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Compare', href: '/guides/compare/' },
          { label: title },
        ]}
      />

      <CompareHero item1={item1} item2={item2} />

      <section>
        <CompareDecisionWidget item1={item1} item2={item2} isHarmReduction={isHarmReduction} />
      </section>

      <CompareSummaryTable item1={item1} item2={item2} />
      {children}

      <CompareRelated comparisons={relatedComparisons} currentSlug={slug} />
      <CompareFAQ faqs={faqs} />
      <CompareCitations item1={item1} item2={item2} />

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {relatedStack && (
          <article className="card-premium p-5 space-y-2">
            <h3 className="font-bold text-ink">Use in a routine</h3>
            <p className="text-sm text-muted">These options can be stacked for goal-based synergy.</p>
            <Link href={`/stacks/${relatedStack.slug}`} className="inline-block text-sm font-bold text-brand-700 hover:text-brand-900">
              View stack →
            </Link>
          </article>
        )}
        {runtimeComparisonLinks.length > 0 && (
          <article className="card-premium p-5 space-y-2">
            <h3 className="font-bold text-ink">More comparison paths</h3>
            <div className="flex flex-col gap-2">
              {runtimeComparisonLinks.map(item => (
                <Link key={item.slug} href={`/guides/compare/${item.slug}`} className="text-sm font-semibold text-brand-850 hover:underline">
                  {item.title} →
                </Link>
              ))}
            </div>
          </article>
        )}
        {relatedBestPages.length > 0 && (
          <article className="card-premium p-5 space-y-2">
            <h3 className="font-bold text-ink">Best-of guides</h3>
            <div className="flex flex-col gap-2">
              {relatedBestPages.map(page => (
                <Link key={page.slug} href={bestPageHref(page.slug)} className="text-sm font-semibold text-brand-850 hover:underline">
                  {page.title} →
                </Link>
              ))}
            </div>
          </article>
        )}
      </section>

      <RelatedDiscoveryGroups
        eyebrow="Continue comparison research"
        title="Explore nearby decision paths"
        groups={relatedDiscoveryGroups}
      />
    </div>
  )
}
