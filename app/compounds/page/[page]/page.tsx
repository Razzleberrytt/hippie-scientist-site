import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getAllCompounds } from '@/lib/server/runtime-data'
import { getRuntimeVisibility } from '../../../../lib/runtime-visibility'
import { COMPOUNDS_PAGE_SIZE, clampPositiveInt, paginateItems } from '@/lib/pagination'
import { toLeanProfileIndexRecords } from '@/lib/profile-index-records'
import { formatDisplayLabel } from '@/lib/display-utils'
import Link from 'next/link'
import CompoundsIndexClient from '../../CompoundsIndexClient'
import type { RuntimeRecord } from '../../../../src/types/content'
import Pagination from '@/components/Pagination'

type P = {
  params: Promise<{ page: string }>
}

function getCompoundName(compound: RuntimeRecord) {
  return (
    formatDisplayLabel(compound.displayName) ||
    formatDisplayLabel(compound.name) ||
    formatDisplayLabel(compound.compoundName) ||
    formatDisplayLabel(compound.canonicalCompoundName) ||
    formatDisplayLabel(compound.slug)
  )
}

async function loadBrowseCompounds(): Promise<RuntimeRecord[]> {
  return ((await getAllCompounds()) as unknown as RuntimeRecord[])
    .filter((compound) => compound?.slug && getRuntimeVisibility(compound).canRender)
    .sort((a, b) => getCompoundName(a).localeCompare(getCompoundName(b)))
}

export async function generateStaticParams() {
  const compounds = await loadBrowseCompounds()
  const total = Math.max(1, Math.ceil(compounds.length / COMPOUNDS_PAGE_SIZE))

  return Array.from({ length: Math.max(total - 1, 0) }, (_, i) => ({
    page: String(i + 2),
  }))
}

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const n = clampPositiveInt((await params).page, 2)

  return {
    title: `Compound Profiles & Research Library — Page ${n}`,
    description: `Browse page ${n} of The Hippie Scientist compound research library, with evidence, mechanism, safety, and practical context for supplement constituents.`,
    alternates: {
      canonical: `/compounds/page/${n}/`,
    },
  }
}

export default async function CompoundsPageN({ params }: P) {
  const n = clampPositiveInt((await params).page, 2)
  const compounds = await loadBrowseCompounds()
  const p = paginateItems(compounds, n, COMPOUNDS_PAGE_SIZE)
  const leanCompounds = toLeanProfileIndexRecords(compounds)
  const leanPageItems = toLeanProfileIndexRecords(p.pageItems as RuntimeRecord[])

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:py-8">
      <header className="hero-shell rounded-[0.95rem] border border-brand-900/10 px-4 py-5 shadow-sm sm:px-6 sm:py-6">
        <p className="eyebrow-label">Compound research library</p>
        <h1 className="mt-2 max-w-3xl text-balance font-display text-3xl font-semibold leading-[1.08] text-ink sm:text-5xl">
          Compound Library <span className="text-muted">— Page {p.currentPage}</span>
        </h1>
        <p className="mt-2 max-w-2xl text-pretty text-sm leading-6 text-muted">
          Browse evidence, mechanism, and safety summaries for published compound profiles.
        </p>
      </header>

      <Pagination basePath="/compounds" currentPage={p.currentPage} totalPages={p.totalPages} itemLabel="Compound profiles" />

      <nav aria-label="Compound profiles on this page" className="sr-only">
        <ul>
          {p.pageItems.map((compound) => (
            <li key={compound.slug}>
              <Link href={`/compounds/${compound.slug}`}>{getCompoundName(compound)}</Link>
            </li>
          ))}
        </ul>
      </nav>

      <Suspense fallback={null}>
        <CompoundsIndexClient
          compounds={leanPageItems}
          allCompounds={leanCompounds}
          paginated
          page={p.currentPage}
          totalPages={p.totalPages}
        />
      </Suspense>
      <Pagination basePath="/compounds" currentPage={p.currentPage} totalPages={p.totalPages} itemLabel="Compound profiles" />
    </div>
  )
}
