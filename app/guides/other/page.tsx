import type { Metadata } from 'next'
import Link from 'next/link'

import { GuideCardGrid } from '@/components/guides/GuideCardGrid'
import { HubSectionHeading } from '@/components/guides/HubSectionHeading'
import SchemaGraphScript from '@/components/seo/SchemaGraphScript'
import { SITE_URL, buildTwitterMetadata } from '@/src/lib/seo'

import { buildGuideHubSchemaGraph } from '@/src/lib/schema-graph'

import { ALL_TOPIC_GUIDES, TOPIC_GUIDE_GROUPS } from './topic-guides'

const TITLE = 'Supplement Topic Guides'
const DESCRIPTION =
  'Browse evidence-first guides on supplement forms, popular categories, goal-based routines, advanced compounds, and harm reduction.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/guides/other/` },
  openGraph: {
    title: `${TITLE} | The Hippie Scientist`,
    description: DESCRIPTION,
    url: `${SITE_URL}/guides/other/`,
    type: 'website',
    images: ['/og-default.jpg'],
  },
  twitter: buildTwitterMetadata({
    title: `${TITLE} | The Hippie Scientist`,
    description: DESCRIPTION,
  }),
}

export default function TopicGuideHub() {
  const schemaGraph = buildGuideHubSchemaGraph({
    path: '/guides/other/',
    title: TITLE,
    description: DESCRIPTION,
    breadcrumbs: [
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'Guides', url: `${SITE_URL}/guides/` },
      { name: 'Topic Guides', url: `${SITE_URL}/guides/other/` },
    ],
    itemListName: 'Supplement Topic Guides',
    items: ALL_TOPIC_GUIDES.map((guide) => ({ name: guide.title, url: guide.href })),
  })

  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-8">
      <SchemaGraphScript graph={schemaGraph} />

      <nav className="mb-4 text-xs text-muted" aria-label="Topic guide breadcrumb">
        <Link href="/guides/" className="hover:text-ink">Guides</Link>
        <span className="mx-1.5">/</span>
        <span className="font-medium text-ink">Topic guides</span>
      </nav>

      <header className="mb-10">
        <p className="eyebrow-label">Evidence library</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink sm:text-5xl">
          Supplement Topic Guides
        </h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-muted">
          Find the question closest to yours—from choosing a magnesium form to understanding a
          research peptide. These guides organize evidence, tradeoffs, safety context, and what
          remains uncertain.
        </p>
      </header>

      <nav aria-label="Topic guide sections" className="mb-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {TOPIC_GUIDE_GROUPS.map((group) => (
          <a
            key={group.id}
            href={`#${group.id}`}
            className="rounded-xl border border-brand-900/12 bg-white p-4 transition hover:border-brand-700/30 hover:bg-brand-50 dark:border-white/10 dark:bg-[var(--surface-card)] dark:hover:bg-white/10"
          >
            <span className="block text-[11px] font-bold uppercase tracking-widest text-brand-700">
              {group.guides.length} guides
            </span>
            <span className="mt-1 block font-semibold text-ink">{group.eyebrow}</span>
          </a>
        ))}
      </nav>

      <div className="space-y-16">
        {TOPIC_GUIDE_GROUPS.map((group) => (
          <section key={group.id} id={group.id} className="scroll-mt-28">
            <HubSectionHeading
              eyebrow={group.eyebrow}
              title={group.title}
              sub={group.description}
            />
            <GuideCardGrid cards={group.guides} />
          </section>
        ))}
      </div>

      <aside className="mt-16 rounded-2xl border border-brand-900/12 bg-brand-50/60 p-6 dark:border-white/10 dark:bg-[var(--surface-subtle)]">
        <h2 className="font-display text-xl font-semibold text-ink">Looking for a goal-specific guide?</h2>
        <p className="mt-2 text-sm leading-7 text-muted">
          ADHD, sleep, anxiety, focus, comparisons, and best-of guides have dedicated hubs with
          shorter decision paths.
        </p>
        <Link href="/guides/" className="mt-4 inline-flex font-semibold text-brand-800 hover:underline">
          Return to the full evidence library →
        </Link>
      </aside>
    </div>
  )
}
