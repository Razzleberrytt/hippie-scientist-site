import type { Metadata } from 'next'
import type { RuntimeRecord } from '../../src/types/content'
import Link from 'next/link'
import { Suspense } from 'react'

import { getHerbSummaryIndex } from '../../src/lib/runtime-summary-indexes'
import { getRuntimeVisibility } from '../../lib/runtime-visibility'
import { HERBS_PAGE_SIZE, paginateItems } from '@/lib/pagination'
import { buildPageMetadata } from '../../src/lib/seo'
import { formatDisplayLabel } from '@/lib/display-utils'
import { isRedirectedDuplicate } from '@/lib/deprecated-herb-canonicals'
import { toLeanProfileIndexRecords } from '@/lib/profile-index-records'
import HerbsIndexClient from './HerbsIndexClient'
import Pagination from '@/components/Pagination'

export const metadata: Metadata = buildPageMetadata({
  title: 'Herb Profiles & Research Library',
  description:
    'Browse published herb profiles — mechanisms, safety notes, active compounds, and research context in plain language.',
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
        <div className="hero-shell animate-pulse h-32 rounded-[1.5rem] border border-[color:var(--hs-hairline)]" />
        <div className="h-24 animate-pulse rounded-[0.85rem] border border-brand-900/10 bg-white/85 p-3 shadow-sm" />
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-36 animate-pulse rounded-[0.85rem] border border-brand-900/10 bg-white/60 p-4 shadow-sm" />
          ))}
        </div>
      </div>
    </div>
  )
}

export default async function HerbsPage() {
  const allHerbs = (await getHerbSummaryIndex()) as RuntimeRecord[]
  const presentSlugs = new Set(allHerbs.map((herb) => String(herb.slug || '')))
  const herbs = allHerbs
    .filter(
      (herb) =>
        herb.slug &&
        getRuntimeVisibility(herb).canRender &&
        !isRedirectedDuplicate(String(herb.slug), presentSlugs),
    )
    .sort((a, b) => getHerbName(a).localeCompare(getHerbName(b)))
  const pageData = paginateItems(herbs, 1, HERBS_PAGE_SIZE)
  const leanHerbs = toLeanProfileIndexRecords(herbs)
  const leanPageItems = toLeanProfileIndexRecords(pageData.pageItems as RuntimeRecord[])

  const heroMetrics = [
    { value: herbs.length, label: 'profiles' },
    { value: pageData.totalPages, label: 'index pages' },
    { value: 'A–Z', label: 'searchable' },
  ]

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-4 sm:py-6">
      <header className="hero-shell rounded-[2rem] border px-5 py-6 sm:p-8">
        <p className="eyebrow-label">Botanical Research Library</p>
        <h1 className="heading-premium mt-5 max-w-4xl">Herb Profiles</h1>
        <p className="text-reading mt-4 max-w-3xl">
          Mechanisms, safety notes, active compounds, and research context for published herbs — plain language, conservative claims.
        </p>

        <dl className="mt-6 grid grid-cols-3 overflow-hidden rounded-2xl border border-[color:var(--hs-hairline)] bg-[color:color-mix(in_srgb,var(--hs-surface)_76%,transparent)] backdrop-blur-sm">
          {heroMetrics.map((metric, index) => (
            <div
              key={metric.label}
              className={`px-3 py-3.5 text-center sm:px-5 sm:py-4 ${index > 0 ? 'border-l border-[color:var(--hs-hairline)]' : ''}`}
            >
              <dt className="sr-only">{metric.label}</dt>
              <dd>
                <span className="block font-display text-2xl font-semibold tracking-[-0.035em] text-[color:var(--hs-ink)] sm:text-[1.7rem]">
                  {metric.value}
                </span>
                <span className="mt-1 block text-[0.62rem] font-bold uppercase tracking-[0.1em] text-[color:var(--hs-body)] sm:text-[0.7rem] sm:tracking-[0.12em]">
                  {metric.label}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </header>

      <Pagination basePath="/herbs" currentPage={1} totalPages={pageData.totalPages} itemLabel="Herb profiles" />

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
              <p className="mt-2 text-sm leading-6 text-muted">
                {String(herb.summary || herb.description || 'Herb profile with evidence, mechanism, and safety context.')}
              </p>
            </Link>
          ))}
        </section>
      </noscript>

      <Suspense fallback={<HerbsLoadingSkeleton />}>
        <HerbsIndexClient herbs={leanPageItems} allHerbs={leanHerbs} paginated page={1} totalPages={pageData.totalPages} />
      </Suspense>
      <Pagination basePath="/herbs" currentPage={1} totalPages={pageData.totalPages} itemLabel="Herb profiles" />
    </div>
  )
}
