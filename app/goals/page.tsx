import type { Metadata } from 'next'
import Link from 'next/link'
import { goals } from '@/data/goals'
import DecisionCtaGroup from '../../src/components/decision/DecisionCtaGroup'
import SchemaGraphScript from '@/components/seo/SchemaGraphScript'
import { buildSchemaGraph } from '@/lib/schema-graph'

import {
  buildPageMetadata,
  breadcrumbJsonLd,
  collectionPageJsonLd,
  itemListJsonLd,
  SEO_YEAR,
  SITE_URL,
} from '../../src/lib/seo'

const GOALS_PAGE_TITLE = `Supplement Goal Guides ${SEO_YEAR} – Evidence, Safety & Comparisons`
const GOALS_PAGE_DESCRIPTION =
  'Choose your goal — sleep, stress, focus, anxiety, pain, and more — then compare herbs and compounds by evidence strength, safety, and practical tradeoffs.'
const GOALS_CANONICAL_URL = `${SITE_URL}/goals/`
const GOALS_BREADCRUMB_ID = `${GOALS_CANONICAL_URL}#breadcrumb`
const GOALS_ITEM_LIST_ID = `${GOALS_CANONICAL_URL}#goal-list`

export const metadata: Metadata = buildPageMetadata({
  title: GOALS_PAGE_TITLE,
  description: GOALS_PAGE_DESCRIPTION,
  path: '/goals',
})

function displayGoalTitle(title: string) {
  return title.replace(/\s+decisions$/i, '')
}

const goalsSchemaGraph = buildSchemaGraph([
  collectionPageJsonLd({
    title: GOALS_PAGE_TITLE,
    description: GOALS_PAGE_DESCRIPTION,
    path: '/goals/',
    itemListId: GOALS_ITEM_LIST_ID,
    breadcrumbId: GOALS_BREADCRUMB_ID,
  }),
  breadcrumbJsonLd(
    [
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'Goals', url: GOALS_CANONICAL_URL },
    ],
    { id: GOALS_BREADCRUMB_ID },
  ),
  itemListJsonLd({
    id: GOALS_ITEM_LIST_ID,
    name: 'Supplement Goal Guides',
    path: '/goals/',
    items: goals.map((goal) => ({
      name: displayGoalTitle(goal.title),
      url: `/goals/${goal.slug}/`,
    })),
  }),
])

export default function GoalsPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-7 px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
      <SchemaGraphScript graph={goalsSchemaGraph} />
      <section className="hero-shell rounded-[1.5rem] border border-brand-900/10 p-5 shadow-sm sm:rounded-[2rem] sm:p-10">
        <p className="eyebrow-label">Goal guide system</p>
        <h1 className="heading-premium mt-3 max-w-[12ch] text-ink sm:max-w-[16ch]">
          Choose by outcome, then compare options clearly.
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-muted sm:text-base">
          These pages are educational comparison summaries designed for fast scanning. They help readers compare evidence context, tolerance considerations, and practical tradeoffs before opening a detailed profile.
        </p>

        <div className="mt-6 flex flex-wrap gap-3 text-[11px] font-semibold uppercase tracking-[0.13em] sm:gap-4 sm:text-xs">
          <Link href="/methodology" className="text-brand-700 hover:text-brand-800 hover:underline dark:text-brand-100 dark:hover:text-white">
            Research methodology →
          </Link>
          <Link href="/education/evidence-hierarchy" className="text-brand-700 hover:text-brand-800 hover:underline dark:text-brand-100 dark:hover:text-white">
            Evidence hierarchy →
          </Link>
          <Link href="/disclaimer" className="text-brand-700 hover:text-brand-800 hover:underline dark:text-brand-100 dark:hover:text-white">
            Disclaimer →
          </Link>
        </div>
      </section>

      {/* Decision CTAs — primary actions above the goal grid */}
      <DecisionCtaGroup
        ctas={[
          { label: 'Browse goal paths', href: '#goals', variant: 'primary' },
          { label: 'Search the library', href: '/search', variant: 'secondary' },
          { label: 'Compare compounds', href: '/compare', variant: 'ghost' },
        ]}
      />

      <section id="goals" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {goals.map((goal) => (
          <Link
            key={goal.slug}
            href={`/goals/${goal.slug}`}
            className="group card-premium flex min-h-[17rem] flex-col justify-between overflow-hidden p-4 sm:min-h-[18rem] sm:p-6"
          >
            <div>
              <h2 className="!font-display !text-[1.9rem] !font-semibold !leading-[1.02] !tracking-tight text-ink transition group-hover:text-brand-800 sm:!text-[2rem] lg:!text-[1.55rem] dark:group-hover:text-brand-100">
                {displayGoalTitle(goal.title)}
              </h2>
              <p className="mt-3 text-sm leading-7 text-muted line-clamp-3 sm:mt-4 sm:line-clamp-4">
                {goal.description}
              </p>
            </div>
            <div className="mt-4 border-t border-brand-900/10 pt-3 dark:border-white/10 sm:mt-5 sm:pt-4">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-brand-700 dark:text-brand-200">Options compared</p>
              <div className="flex flex-wrap gap-1.5">
                {goal.options.slice(0, 3).map((option) => (
                  <span
                    key={option.slug}
                    className="inline-flex max-w-full items-center rounded-full border border-brand-100/50 bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-800 dark:border-white/10 dark:bg-white/5 dark:text-brand-100"
                  >
                    <span className="truncate">{option.name}</span>
                  </span>
                ))}
                {goal.options.length > 3 && (
                  <span className="self-center text-[10px] font-semibold text-muted">
                    +{goal.options.length - 3} more
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </section>
    </div>
  )
}
