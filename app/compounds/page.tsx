import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'

import { buildPageMetadata } from '../../src/lib/seo'
import { COMPOUNDS_PAGE_SIZE, paginateItems } from '@/lib/pagination'
import { toLeanProfileIndexRecords } from '@/lib/profile-index-records'
import { loadPublishedCompounds } from './library-data'
import { getCompoundName } from './library-selector'
import CompoundsIndexClient from './CompoundsIndexClient'
import type { RuntimeRecord } from '../../src/types/content'
import Pagination from '@/components/Pagination'
import '../../styles/library-browse.css'

export const metadata: Metadata = buildPageMetadata({
  title: 'Compound Library',
  description:
    'Browse published compound profiles with mechanisms, evidence levels, safety status, and practical context. Evidence-first, no hype.',
  path: '/compounds',
})

export const dynamic = 'force-static'

function CompoundsLoadingSkeleton() {
  return (
    <div className="px-2 py-2 sm:px-3 sm:py-3" aria-hidden="true">
      <div className="mx-auto max-w-7xl space-y-4">
        <div className="section-frame h-32 animate-pulse" />
        <div className="section-frame h-24 animate-pulse" />
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card-premium h-36 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}

export default async function CompoundsPage() {
  const allCompounds = await loadPublishedCompounds()

  const pageData = paginateItems(allCompounds, 1, COMPOUNDS_PAGE_SIZE)
  const leanCompounds = toLeanProfileIndexRecords(allCompounds)
  const leanPageItems = toLeanProfileIndexRecords(pageData.pageItems as RuntimeRecord[])

  return (
    <div className="library-browse-page mx-auto max-w-7xl space-y-6 px-4 py-4 sm:py-6">
      <header className="hero-shell rounded-[2rem] border px-5 py-6 sm:p-8">
        <p className="eyebrow-label">Compound Research Library</p>
        <h1 className="heading-premium mt-5 max-w-4xl">Compound Library</h1>
        <p className="text-reading mt-4 max-w-3xl">
          Mechanism, evidence strength, and safety context for {allCompounds.length} published compounds and supplement constituents — evidence first, no hype.
        </p>
      </header>

      <nav aria-label="Published compound profiles index" className="hidden">
        <ul>
          {allCompounds.map((compound) => (
            <li key={compound.slug}>
              <Link href={`/compounds/${compound.slug}`}>{getCompoundName(compound)}</Link>
            </li>
          ))}
        </ul>
      </nav>

      <noscript>
        <section className="section-frame p-4 sm:p-5" aria-label="Compound profiles">
          <p className="eyebrow-label">Browse without JavaScript</p>
          <h2 className="compact-heading mt-2">Published compound profiles</h2>
          <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {pageData.pageItems.map((compound) => (
              <Link
                key={compound.slug}
                href={`/compounds/${compound.slug}`}
                className="card-premium block p-4"
              >
                <h3 className="text-base font-semibold tracking-tight text-ink">{getCompoundName(compound)}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {String(compound.summary || compound.description || 'Compound profile with evidence, mechanism, and safety context.')}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </noscript>

      <Suspense fallback={<CompoundsLoadingSkeleton />}>
        <CompoundsIndexClient
          compounds={leanPageItems}
          allCompounds={leanCompounds}
          paginated
          page={1}
          totalPages={pageData.totalPages}
        />
      </Suspense>
      <Pagination basePath="/compounds" currentPage={1} totalPages={pageData.totalPages} itemLabel="Compound profiles" />
    </div>
  )
}
