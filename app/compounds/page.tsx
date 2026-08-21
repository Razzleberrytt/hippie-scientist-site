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

export const metadata: Metadata = buildPageMetadata({
  title: 'Compound Library',
  description:
    'Browse published compound profiles with mechanisms, evidence levels, safety status, and practical context. Evidence-first, no hype.',
  path: '/compounds',
})

export const dynamic = 'force-static'

export default async function CompoundsPage() {
  const allCompounds = await loadPublishedCompounds()

  const pageData = paginateItems(allCompounds, 1, COMPOUNDS_PAGE_SIZE)
  const leanCompounds = toLeanProfileIndexRecords(allCompounds)
  const leanPageItems = toLeanProfileIndexRecords(pageData.pageItems as RuntimeRecord[])

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-4 sm:py-6">
      <section className="hero-shell rounded-[2rem] border px-5 py-6 sm:p-8">
        <p className="eyebrow-label">Compound Research Library</p>
        <h1 className="heading-premium mt-5 max-w-4xl">Compound Library</h1>
        <p className="text-reading mt-4 max-w-3xl">
          Mechanism, evidence strength, and safety context for {allCompounds.length} published compounds and supplement constituents — evidence first, no hype.
        </p>
      </section>

      <nav aria-label="Published compound profiles index" className="hidden">
        <ul>
          {allCompounds.map((c) => (
            <li key={c.slug}>
              <Link href={`/compounds/${c.slug}`}>{getCompoundName(c)}</Link>
            </li>
          ))}
        </ul>
      </nav>

      <Suspense
        fallback={
          <div className="py-12 text-center text-sm text-muted">Loading compounds…</div>
        }
      >
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
