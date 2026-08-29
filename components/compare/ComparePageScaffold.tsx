import Link from 'next/link'
import type { ReactNode } from 'react'
import { bestPageHref } from '@/data/best'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import RelatedDiscoveryGroups from '@/components/ui/RelatedDiscoveryGroups'
import SchemaGraphScript from '@/components/seo/SchemaGraphScript'
import CompareHero from '@/components/compare/CompareHero'
import CompareDecisionGuide from '@/components/compare/CompareDecisionGuide'
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

type ComparisonFaq = { question: string; answer: string }

type ComparePageScaffoldProps = {
  item1: CompareItem
  item2: CompareItem
  slug: string
  faqs: ComparisonFaq[]
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

export function sanitizeComparisonFaqs(
  item1: Pick<CompareItem, 'name' | 'onsetTime'>,
  item2: Pick<CompareItem, 'name' | 'onsetTime'>,
  faqs: ComparisonFaq[],
): ComparisonFaq[] {
  return faqs.map((faq) => {
    const question = faq.question.trim()
    const normalized = question.toLowerCase()

    if (normalized.startsWith('which is better,')) {
      return {
        question,
        answer: `There is no universal winner between ${item1.name} and ${item2.name}. The better fit depends on the exact outcome, the quality of evidence for that outcome, dose and form, side effects, interactions, and your medical context. Use the comparison table to match those tradeoffs rather than treating one ingredient as the default winner.`,
      }
    }

    if (normalized.startsWith('can i take') && normalized.includes('together')) {
      return {
        question,
        answer: `This comparison does not establish that ${item1.name} and ${item2.name} are safe or beneficial to combine. Interaction data for supplements can be incomplete, and mechanism differences do not prove compatibility. Review each ingredient's interaction and contraindication information and check the full combination with a pharmacist or other qualified health professional if you use medications or have a medical condition.`,
      }
    }

    if (normalized.startsWith('which works faster')) {
      const timingParts = [
        item1.onsetTime ? `${item1.name}: ${item1.onsetTime}` : null,
        item2.onsetTime ? `${item2.name}: ${item2.onsetTime}` : null,
      ].filter((value): value is string => Boolean(value))

      return {
        question,
        answer: timingParts.length > 0
          ? `The source data report these ingredient-specific onset notes: ${timingParts.join('; ')}. They are not a head-to-head timing result, and onset can vary by outcome, dose, form, and individual response.`
          : `There is no reliable head-to-head onset estimate surfaced here for ${item1.name} versus ${item2.name}. Onset can vary by the outcome being measured, dose, form, and individual response, so avoid assuming that either requires a generic days-or-weeks timeline.`,
      }
    }

    if (normalized.startsWith('which is safer')) {
      return {
        question,
        answer: `Safety is not a single ranking between ${item1.name} and ${item2.name}. It depends on dose, product quality, health conditions, pregnancy or breastfeeding status, and other medicines or supplements. Compare the contraindications and interaction sections for both ingredients before making a decision.`,
      }
    }

    if (normalized.startsWith('what is the key difference')) {
      return {
        question,
        answer: `${item1.name} and ${item2.name} differ in their evidence base, proposed mechanisms, dosing context, and safety profile. Those differences can help narrow a choice, but a different mechanism does not by itself prove that one is more effective, faster, safer, or better to combine.`,
      }
    }

    return faq
  })
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
  const safeFaqs = sanitizeComparisonFaqs(item1, item2, faqs)
  const schemaFaqs = isHarmReduction ? [] : safeFaqs

  return (
    <div className="mx-auto max-w-5xl px-4 py-7 space-y-8 sm:space-y-10">
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

      <section id="compare-decision" className="scroll-mt-24">
        <CompareDecisionGuide item1={item1} item2={item2} isHarmReduction={isHarmReduction} />
      </section>

      <CompareSummaryTable item1={item1} item2={item2} />
      {children}

      <CompareRelated comparisons={relatedComparisons} currentSlug={slug} />
      <CompareFAQ faqs={safeFaqs} />
      <CompareCitations item1={item1} item2={item2} />

      {/* Continue-researching navigation: compact link rows rather than three
          peer cards, so it never competes with the comparison itself. */}
      <section className="grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
        {relatedStack && (
          <article className="min-w-0">
            <h3 className="text-sm font-semibold text-ink">Use in a routine</h3>
            <p className="mt-1 text-xs leading-5 text-muted">A related routine is available. Review combined safety and avoid assuming that a stack is more effective than testing ingredients individually.</p>
            <ul className="hs-linklist mt-2">
              <li>
                <Link href={`/stacks/${relatedStack.slug}`}>
                  <span>Review routine</span>
                  <span aria-hidden="true" className="hs-linklist__arrow">→</span>
                </Link>
              </li>
            </ul>
          </article>
        )}
        {runtimeComparisonLinks.length > 0 && (
          <article className="min-w-0">
            <h3 className="text-sm font-semibold text-ink">More comparison paths</h3>
            <ul className="hs-linklist mt-2">
              {runtimeComparisonLinks.map(item => (
                <li key={item.slug}>
                  <Link href={`/guides/compare/${item.slug}`}>
                    <span>{item.title}</span>
                    <span aria-hidden="true" className="hs-linklist__arrow">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </article>
        )}
        {relatedBestPages.length > 0 && (
          <article className="min-w-0">
            <h3 className="text-sm font-semibold text-ink">Best-of guides</h3>
            <ul className="hs-linklist mt-2">
              {relatedBestPages.map(page => (
                <li key={page.slug}>
                  <Link href={bestPageHref(page.slug)}>
                    <span>{page.title}</span>
                    <span aria-hidden="true" className="hs-linklist__arrow">→</span>
                  </Link>
                </li>
              ))}
            </ul>
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
