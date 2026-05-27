import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { getHerbSummaryIndex } from '@/lib/runtime-summary-indexes'
import { getRuntimeVisibility } from '@/lib/runtime-visibility'
import { HERBS_PAGE_SIZE, paginateItems } from '@/lib/pagination'
import HerbsIndexClient from './HerbsIndexClient'

export const metadata: Metadata = { title: 'Herb Profiles & Research Library', description: 'Browse evidence-aware profiles for 100+ herbs — mechanisms, safety notes, active compounds, and research context in plain language.', alternates:{canonical:'/herbs'} }

export default async function HerbsPage() {
  const herbs=(await getHerbSummaryIndex()).filter((h:any)=>getRuntimeVisibility(h).canRender)
  const pageData=paginateItems(herbs,1,HERBS_PAGE_SIZE)
  return <main className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:py-10"><section className="rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8"><h1 className="text-3xl font-bold tracking-tight text-ink sm:text-5xl">Herb profiles and supplement research</h1></section><nav className="rounded-xl border border-brand-900/10 bg-white/80 p-4 text-sm"><p className="font-semibold">Page 1 of {pageData.totalPages}</p>{pageData.hasNext?<Link rel="next" href="/herbs/page/2">Next page →</Link>:null}</nav><Suspense fallback={null}><HerbsIndexClient herbs={pageData.pageItems} allHerbs={herbs} paginated page={1} totalPages={pageData.totalPages} /></Suspense></main>
}
