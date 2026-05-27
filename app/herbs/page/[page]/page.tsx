import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { getHerbSummaryIndex } from '@/lib/runtime-summary-indexes'
import { getRuntimeVisibility } from '@/lib/runtime-visibility'
import { HERBS_PAGE_SIZE, clampPositiveInt, paginateItems } from '@/lib/pagination'
import HerbsIndexClient from '../../HerbsIndexClient'

type P={params:Promise<{page:string}>}
export async function generateStaticParams(){ const herbs=(await getHerbSummaryIndex()).filter((h:any)=>getRuntimeVisibility(h).canRender); const total=Math.max(1,Math.ceil(herbs.length/HERBS_PAGE_SIZE)); return Array.from({length:Math.max(total-1,0)},(_,i)=>({page:String(i+2)})) }
export async function generateMetadata({params}:P):Promise<Metadata>{const n=clampPositiveInt((await params).page,2);return{title:`Herb Profiles & Research Library — Page ${n}`,alternates:{canonical:`/herbs/page/${n}`}}}
export default async function HerbsPageN({params}:P){const n=clampPositiveInt((await params).page,2); const herbs=(await getHerbSummaryIndex()).filter((h:any)=>getRuntimeVisibility(h).canRender); const p=paginateItems(herbs,n,HERBS_PAGE_SIZE); return <main className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:py-10"><nav className="rounded-xl border border-brand-900/10 bg-white/80 p-4 text-sm"><p className="font-semibold">Page {p.currentPage} of {p.totalPages}</p><div className="mt-2 flex gap-4">{p.hasPrev?<Link rel="prev" href={p.currentPage===2?'/herbs':`/herbs/page/${p.currentPage-1}`}>← Previous page</Link>:null}{p.hasNext?<Link rel="next" href={`/herbs/page/${p.currentPage+1}`}>Next page →</Link>:null}</div></nav><Suspense fallback={null}><HerbsIndexClient herbs={p.pageItems} allHerbs={herbs} paginated page={p.currentPage} totalPages={p.totalPages} /></Suspense></main>}
