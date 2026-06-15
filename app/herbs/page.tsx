import type { Metadata } from 'next'
import type { RuntimeRecord } from '@/types/content'
import Link from 'next/link'
import { Suspense } from 'react'

import { getHerbSummaryIndex } from '@/lib/runtime-summary-indexes'
import { getRuntimeVisibility } from '@/lib/runtime-visibility'
import { HERBS_PAGE_SIZE, paginateItems } from '@/lib/pagination'
import { buildPageMetadata } from '@/lib/seo'
import { formatDisplayLabel } from '@/lib/display-utils'
import HerbsIndexClient from './HerbsIndexClient'

export const metadata: Metadata = buildPageMetadata({
  title: 'Herb Profiles & Research Library',
  description: 'Browse profiles for 100+ herbs — mechanisms, safety notes, active compounds, and research context in plain language.',
  path: '/herbs',
})

export const dynamic = 'force-static'

function getHerbName(herb: RuntimeRecord) {
  return formatDisplayLabel(herb.displayName) || formatDisplayLabel(herb.name) || formatDisplayLabel(herb.slug)
}

function HerbsLoadingSkeleton() {
  return (
    <div className="px-2 py-2 sm:px-3 sm:py-3">
      <div className="mx-auto max-w-7xl space-y-4">
        <div className="hero-shell animate-pulse rounded-[0.95rem] border border-brand-900/10 px-3 py-4 shadow-sm sm:px-4 sm:py-5 h-32" />
        <div className="animate-pulse rounded-[0.85rem] border border-brand-900/10 bg-white/85 p-3 shadow-sm h-24" />
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-[0.85rem] border border-brand-900/10 bg-white/60 p-4 shadow-sm h-36" />
          ))}
        </div>
      </div>
    </div>
  )
}

export default async function HerbsPage() {
  const herbs = ((await getHerbSummaryIndex()) as RuntimeRecord[])
    .filter((herb) => herb.slug && getRuntimeVisibility(herb).canRender)
    .sort((a, b) => getHerbName(a).localeCompare(getHerbName(b)))
  const pageData = paginateItems(herbs, 1, HERBS_PAGE_SIZE)

  return (
    <div className="mx-auto max-w-6xl space-y-5 px-4 py-4 sm:py-6">
      <div className="space-y-1 pb-1">
        <p className="eyebrow-label">Botanical Research Library</p>
        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">Herb Profiles</h1>
        <p className="text-sm text-muted">
          Mechanisms, safety notes, active compounds, and research context for {herbs.length} herbs — plain language, conservative claims.
        </p>
      </div>

      <nav className="rounded-[0.8rem] border border-brand-900/10 bg-white/80 p-3 text-sm" aria-label="Herb pagination">
        <p className="font-semibold">Page 1 of {pageData.totalPages}</p>
        {pageData.hasNext ? <Link rel="next" href="/herbs/page/2">Next page →</Link> : null}
      </nav>

      <nav aria-label="Herb profiles index" className="sr-only">
        <ul>
          {herbs.map((herb) => (
            <li key={herb.slug}>
              <Link href={`/herbs/${herb.slug}`}>{getHerbName(herb)}</Link>
            </li>
          ))}
        </ul>
      </nav>

      <noscript>
        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3" aria-label="Herb profiles">
          {pageData.pageItems.map((herb) => (
            <Link
              key={herb.slug}
              href={`/herbs/${herb.slug}`}
              className="block rounded-[0.85rem] border border-brand-900/10 bg-white/80 p-4 shadow-sm"
            >
              <h2 className="text-base font-semibold tracking-tight text-ink">{getHerbName(herb)}</h2>
              <p className="mt-2 text-sm leading-6 text-[#46574d]">
                {String(herb.summary || herb.description || 'Herb profile with evidence, mechanism, and safety context.')}
              </p>
            </Link>
          ))}
        </section>
      </noscript>

      <Suspense fallback={<HerbsLoadingSkeleton />}>
        <HerbsIndexClient herbs={pageData.pageItems} allHerbs={herbs} paginated page={1} totalPages={pageData.totalPages} />
      </Suspense>
    </div>
  )
}
