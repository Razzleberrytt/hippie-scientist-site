import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'

import { getAllCompounds } from '@/lib/server/runtime-data'
import { getRuntimeVisibility } from '../../lib/runtime-visibility'
import { buildPageMetadata } from '../../src/lib/seo'
import { COMPOUNDS_PAGE_SIZE, paginateItems } from '@/lib/pagination'
import { toLeanProfileIndexRecords } from '@/lib/profile-index-records'
import { formatDisplayLabel } from '@/lib/display-utils'
import { isRedirectedCompoundDuplicate } from '@/lib/deprecated-compound-canonicals'
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

function getCompoundName(compound: RuntimeRecord) {
  return (
    formatDisplayLabel(compound.displayName) ||
    formatDisplayLabel(compound.name) ||
    formatDisplayLabel(compound.compoundName) ||
    formatDisplayLabel(compound.canonicalCompoundName) ||
    formatDisplayLabel(compound.slug)
  )
}

function loadBrowseCompounds(records: RuntimeRecord[]) {
  const presentSlugs = new Set(records.map((compound) => String(compound.slug || '')))

  return records
    .filter(
      (compound) =>
        compound?.slug &&
        getRuntimeVisibility(compound).canIndex &&
        !isRedirectedCompoundDuplicate(String(compound.slug), presentSlugs),
    )
    .sort((a, b) => getCompoundName(a).localeCompare(getCompoundName(b)))
}

export default async function CompoundsPage() {
  const raw = await getAllCompounds()
  const allCompounds = loadBrowseCompounds(raw as unknown as RuntimeRecord[])

  const pageData = paginateItems(allCompounds, 1, COMPOUNDS_PAGE_SIZE)
  const leanCompounds = toLeanProfileIndexRecords(allCompounds)
  const leanPageItems = toLeanProfileIndexRecords(pageData.pageItems as RuntimeRecord[])
  const heroMetrics = [
    { value: allCompounds.length, label: 'profiles' },
    { value: pageData.totalPages, label: 'index pages' },
    { value: 'A–Z', label: 'searchable' },
  ]

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-4 sm:py-6">
      <section className="hero-shell rounded-[2rem] border px-5 py-6 sm:p-8">
        <p className="eyebrow-label">Compound Research Library</p>
        <h1 className="heading-premium mt-5 max-w-4xl">Compound Library</h1>
        <p className="text-reading mt-4 max-w-3xl">
          Mechanism, evidence strength, and safety context for bioactive molecules and supplement constituents — evidence first, no hype.
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
      </section>

      <Pagination basePath="/compounds" currentPage={1} totalPages={pageData.totalPages} itemLabel="Compound profiles" />

      <nav aria-label="Published compound profiles index" className="sr-only">
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
