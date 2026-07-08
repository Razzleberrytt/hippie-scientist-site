import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { getHerbSummaryIndex } from '../../../../src/lib/runtime-summary-indexes'
import { getRuntimeVisibility } from '../../../../lib/runtime-visibility'
import { HERBS_PAGE_SIZE, clampPositiveInt, paginateItems } from '@/lib/pagination'
import { isRedirectedDuplicate } from '@/lib/deprecated-herb-canonicals'
import { toLeanProfileIndexRecords } from '@/lib/profile-index-records'
import HerbsIndexClient from '../../HerbsIndexClient'
import type { RuntimeRecord } from '../../../../src/types/content'

type P={params:Promise<{page:string}>}
async function loadBrowseHerbs(): Promise<RuntimeRecord[]> {
  const all = (await getHerbSummaryIndex()) as RuntimeRecord[]
  const present = new Set(all.map((h) => String(h.slug || '')))
  return all.filter((h) => h.slug && getRuntimeVisibility(h).canRender && !isRedirectedDuplicate(String(h.slug), present))
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
      <div className="space-y-1 pb-1">
        <p className="eyebrow-label">Botanical Research Library</p>
        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">Herb Profiles (Page {p.currentPage})</h1>
        <p className="text-sm text-muted">Mechanisms, safety notes, active compounds, and research context for {herbs.length} herbs — page {p.currentPage} of {p.totalPages}.</p>
      </div>
      <nav className="rounded-[0.8rem] border border-brand-900/10 bg-white/80 p-3 text-sm">
        <p className="font-semibold">Page {p.currentPage} of {p.totalPages}</p>
        <div className="mt-2 flex gap-4">
          {p.hasPrev ? <Link rel="prev" href={p.currentPage===2?'/herbs':`/herbs/page/${p.currentPage-1}`}>← Previous page</Link> : null}
          {p.hasNext ? <Link rel="next" href={`/herbs/page/${p.currentPage+1}`}>Next page →</Link> : null}
        </div>
      </nav>
      <Suspense fallback={<HerbsPageSkeleton />}>
        <HerbsIndexClient herbs={leanPageItems} allHerbs={leanHerbs} paginated page={p.currentPage} totalPages={p.totalPages} />
      </Suspense>
    </div>
  )
}
