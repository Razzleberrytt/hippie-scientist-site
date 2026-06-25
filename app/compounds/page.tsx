import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'

import { getAllCompounds } from '@/lib/server/runtime-data'
import { getRuntimeVisibility } from '../../lib/runtime-visibility'
import { buildPageMetadata } from '../../src/lib/seo'
import { COMPOUNDS_PAGE_SIZE, paginateItems } from '@/lib/pagination'
import CompoundsIndexClient from './CompoundsIndexClient'
import type { RuntimeRecord } from '../../src/types/content'

export const metadata: Metadata = buildPageMetadata({
  title: 'Compound Library',
  description:
    'Browse 600+ compound profiles with mechanisms, evidence levels, safety status, and practical context. Evidence-first, no hype.',
  path: '/compounds',
})

export const dynamic = 'force-static'

export default async function CompoundsPage() {
  const raw = await getAllCompounds()
  const allCompounds = (raw as unknown as RuntimeRecord[]).filter(
    (c) => c?.slug && getRuntimeVisibility(c).canRender,
  )

  const pageData = paginateItems(allCompounds, 1, COMPOUNDS_PAGE_SIZE)

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:py-8">
      {/* Hero */}
      <section className="hero-shell rounded-[0.95rem] border border-brand-900/10 px-4 py-5 shadow-sm sm:px-6 sm:py-6">
        <p className="eyebrow-label">Compound research library</p>
        <h1 className="mt-2 max-w-3xl font-display text-3xl font-semibold tracking-tight text-ink sm:text-5xl">
          Compound Library
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#46574d]">
          Mechanism, evidence strength, and safety context for bioactive molecules and supplement constituents.
        </p>
        <p className="mt-2 text-sm font-semibold text-[#46574d]">Browsing {allCompounds.length} compounds</p>
      </section>

      {/* SEO-crawlable index (hidden from visual users, served to Googlebot) */}
      <nav aria-label="Compound profiles index" className="sr-only">
        <ul>
          {allCompounds.map((c) => (
            <li key={c.slug}>
              <Link href={`/compounds/${c.slug}`}>{String(c.name || c.slug)}</Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Client-side filtered + searchable compound grid */}
      <Suspense
        fallback={
          <div className="py-12 text-center text-sm text-muted">Loading compounds…</div>
        }
      >
        <CompoundsIndexClient
          compounds={pageData.pageItems}
          allCompounds={allCompounds}
          paginated
          page={1}
          totalPages={pageData.totalPages}
        />
      </Suspense>
    </div>
  )
}
