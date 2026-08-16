import type { Metadata } from 'next'
import type { RuntimeRecord } from '../../src/types/content'
import Link from 'next/link'
import { Suspense } from 'react'

import { HERBS_PAGE_SIZE, paginateItems } from '@/lib/pagination'
import { buildPageMetadata } from '../../src/lib/seo'
import { toLeanProfileIndexRecords } from '@/lib/profile-index-records'
import { getHerbName, loadPublishedHerbs } from './library-data'
import HerbsIndexClient from './HerbsIndexClient'
import Pagination from '@/components/Pagination'

export const metadata: Metadata = buildPageMetadata({
  title: 'Herb Profiles & Research Library',
  description:
    'Browse published herb profiles — mechanisms, safety notes, active compounds, and research context in plain language.',
  path: '/herbs',
})

export const dynamic = 'force-static'

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
  const herbs = await loadPublishedHerbs()
  const pageData = paginateItems(herbs, 1, HERBS_PAGE_SIZE)
  const leanHerbs = toLeanProfileIndexRecords(herbs)
  const leanPageItems = toLeanProfileIndexRecords(pageData.pageItems as RuntimeRecord[])

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-4 sm:py-6">
      <header className="hero-shell rounded-[2rem] border px-5 py-6 sm:p-8">
        <p className="eyebrow-label">Botanical Research Library</p>
        <h1 className="heading-premium mt-5 max-w-4xl">Herb Profiles</h1>
        <p className="text-reading mt-4 max-w-3xl">
          Mechanisms, safety notes, active compounds, and research context for {herbs.length} herbs — plain language, conservative claims.
        </p>
      </header>

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
