import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '@/lib/seo'
import { getResearchSourceRegister } from '@/lib/research-source-register'
import ResearchOperationsClient from './ResearchOperationsClient'

export const metadata:Metadata=buildPageMetadata({
  title:'Research Operations Observatory | The Hippie Scientist',
  description:'Operational view of The Hippie Scientist rolling research pipeline: five lanes, rolling 500-record batches, blockers and merged source coverage.',
  path:'/research/operations/',
  robots:{index:false,follow:true},
})

export default function ResearchOperationsPage(){
  const source=getResearchSourceRegister()
  return <div className='research-page-content mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 sm:py-10 lg:px-8'>
    <nav aria-label='Breadcrumb' className='text-sm text-muted'>
      <Link href='/research/' className='font-semibold text-brand-700 hover:underline'>Research</Link>
      <span aria-hidden='true' className='mx-2'>/</span><span>Operations observatory</span>
    </nav>
    <section className='rounded-[2rem] border border-brand-900/10 bg-white p-6 shadow-sm sm:p-8 lg:p-10'>
      <p className='eyebrow-label'>Research infrastructure</p>
      <h1 className='mt-3 max-w-4xl font-display text-3xl font-bold leading-tight tracking-tight text-ink sm:text-5xl'>Research should keep moving even when review is waiting.</h1>
      <p className='mt-5 max-w-3xl text-base leading-8 text-muted'>This observatory separates discovery, reservation, review, staging and merge state. It is an operations surface—not an evidence grade. The research-only boundary stays fail-closed until independent scientific review and exact-head repository gates pass.</p>
      <div className='mt-6 flex flex-wrap gap-3'>
        <Link href='/research/source-register/' className='inline-flex min-h-11 items-center rounded-full bg-brand-800 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700'>Open source register →</Link>
        <Link href='/research/intelligence/' className='inline-flex min-h-11 items-center rounded-full border border-brand-900/15 px-5 py-2 text-sm font-semibold text-brand-800 hover:bg-brand-50'>Science intelligence studio</Link>
      </div>
    </section>
    <ResearchOperationsClient mergedThroughWave={source.throughWave} mergedIndexedPmids={source.totalIndexedPmids} latestSourceVerified={source.latestSourceVerified}/>
  </div>
}
