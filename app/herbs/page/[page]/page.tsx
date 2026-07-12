import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getHerbSummaryIndex } from '../../../../src/lib/runtime-summary-indexes'
import { getRuntimeVisibility } from '../../../../lib/runtime-visibility'
import { HERBS_PAGE_SIZE, clampPositiveInt, paginateItems } from '@/lib/pagination'
import { isRedirectedDuplicate } from '@/lib/deprecated-herb-canonicals'
import { toLeanProfileIndexRecords } from '@/lib/profile-index-records'
import HerbsIndexClient from '../../HerbsIndexClient'
import type { RuntimeRecord } from '../../../../src/types/content'
import { formatDisplayLabel } from '@/lib/display-utils'
import Pagination from '@/components/Pagination'

type P={params:Promise<{page:string}>}
async function loadBrowseHerbs(): Promise<RuntimeRecord[]> {
  const all = (await getHerbSummaryIndex()) as RuntimeRecord[]
  const present = new Set(all.map((h) => String(h.slug || '')))
  return all
    .filter((h) => h.slug && getRuntimeVisibility(h).canRender && !isRedirectedDuplicate(String(h.slug), present))
    .sort((a, b) => {
      const aName = formatDisplayLabel(a.displayName) || formatDisplayLabel(a.name) || formatDisplayLabel(a.slug)
      const bName = formatDisplayLabel(b.displayName) || formatDisplayLabel(b.name) || formatDisplayLabel(b.slug)
      return aName.localeCompare(bName)
    })
}
export async function generateStaticParams(){ const herbs=await loadBrowseHerbs(); const total=Math.max(1,Math.ceil(herbs.length/HERBS_PAGE_SIZE)); return Array.from({length:Math.max(total-1,0)},(_,i)=>({page:String(i+2)})) }
export async function generateMetadata({ params }: P): Promise<Metadata> {
  const n = clampPositiveInt((await params).page, 2)

  return {
    title: `Herb Profiles & Research Library — Page ${n}`,
    description: `Browse evidence-first herb profiles on page ${n} of the botanical research library, with mechanisms, safety notes, and practical context.`,
    alternates: { canonical: `/herbs/page/${n}/` },
  }
}

function HerbsPageSkeleton() {
  return (
    <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-[0.85rem] border border-brand-900/10 bg-white/60 p-4 shadow-sm h-36" />
      ))}
    </div>
  )
}

export default async function HerbsPageN({params}:P){
  const n=clampPositiveInt((await params).page,2);
  const herbs=await loadBrowseHerbs();
  const p=paginateItems(herbs,n,HERBS_PAGE_SIZE);
  const leanHerbs = toLeanProfileIndexRecords(herbs)
  const leanPageItems = toLeanProfileIndexRecords(p.pageItems as RuntimeRecord[])
  return (
    <div className="mx-auto max-w-6xl space-y-5 px-4 py-4 sm:py-6">
      <header className="hero-shell rounded-[0.95rem] border border-brand-900/10 px-4 py-5 shadow-sm sm:px-6 sm:py-6">
        <p className="eyebrow-label">Botanical Research Library</p>
        <h1 className="mt-2 max-w-3xl text-balance font-display text-3xl font-semibold leading-[1.08] text-ink sm:text-5xl">Herb Profiles <span className="text-muted">— Page {p.currentPage}</span></h1>
        <p className="mt-2 max-w-2xl text-pretty text-sm leading-6 text-muted">Mechanisms, safety notes, active compounds, and research context for {herbs.length} herbs.</p>
      </header>
      <Pagination basePath="/herbs" currentPage={p.currentPage} totalPages={p.totalPages} itemLabel="Herb profiles" />
      <Suspense fallback={<HerbsPageSkeleton />}>
        <HerbsIndexClient herbs={leanPageItems} allHerbs={leanHerbs} paginated page={p.currentPage} totalPages={p.totalPages} />
      </Suspense>
      <Pagination basePath="/herbs" currentPage={p.currentPage} totalPages={p.totalPages} itemLabel="Herb profiles" />
    </div>
  )
}
