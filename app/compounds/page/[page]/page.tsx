import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { getAllCompounds } from '@/lib/server/runtime-data'
import { getRuntimeVisibility } from '@/lib/runtime-visibility'
import { COMPOUNDS_PAGE_SIZE, clampPositiveInt, paginateItems } from '@/lib/pagination'
import CompoundsIndexClient from '../../CompoundsIndexClient'

type P={params:Promise<{page:string}>}
export async function generateStaticParams(){ const compounds=(await getAllCompounds()).filter((c:any)=>getRuntimeVisibility(c).canRender); const total=Math.max(1,Math.ceil(compounds.length/COMPOUNDS_PAGE_SIZE)); return Array.from({length:Math.max(total-1,0)},(_,i)=>({page:String(i+2)})) }
export async function generateMetadata({params}:P):Promise<Metadata>{const n=clampPositiveInt((await params).page,2);return{title:`Compound Profiles & Research Library — Page ${n}`,alternates:{canonical:`/compounds/page/${n}`}}}
export default async function CompoundsPageN({params}:P){const n=clampPositiveInt((await params).page,2); const runtime=await getAllCompounds(); const compounds=runtime.filter((c:any)=>c?.slug && getRuntimeVisibility(c).canRender); const p=paginateItems(compounds,n,COMPOUNDS_PAGE_SIZE); return <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:py-10"><nav className="rounded-xl border border-brand-900/10 bg-white/80 p-4 text-sm"><p className="font-semibold">Page {p.currentPage} of {p.totalPages}</p><div className="mt-2 flex gap-4">{p.hasPrev?<Link rel="prev" href={p.currentPage===2?'/compounds':`/compounds/page/${p.currentPage-1}`}>← Previous page</Link>:null}{p.hasNext?<Link rel="next" href={`/compounds/page/${p.currentPage+1}`}>Next page →</Link>:null}</div></nav><Suspense fallback={null}><CompoundsIndexClient compounds={p.pageItems} allCompounds={compounds} paginated page={p.currentPage} totalPages={p.totalPages} /></Suspense></div>}
