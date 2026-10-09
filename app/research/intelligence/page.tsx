import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '@/lib/seo'
import ResearchIntelligenceClient from './ResearchIntelligenceClient'

export const metadata: Metadata = buildPageMetadata({
  title:'Research Intelligence Studio | The Hippie Scientist',
  description:'Explore the source-grounded research atlas: study fingerprints, reviewed citation differences, knowledge frontiers, publication chronology, semantic trails, safety-literature mapping and editorial proposals.',
  path:'/research/intelligence/',
  robots:{index:false,follow:true},
})

export default function ResearchIntelligencePage(){
  return (
    <div className='research-page-content mx-auto max-w-7xl px-4 pb-14 pt-6 sm:px-6 lg:px-8'>
      <nav aria-label='Breadcrumb' className='mb-5 flex flex-wrap gap-2 text-sm text-muted'>
        <Link href='/research/' className='font-semibold text-brand-700 hover:underline'>Research</Link>
        <span aria-hidden='true'>/</span>
        <Link href='/research/source-register/' className='font-semibold text-brand-700 hover:underline'>Source register</Link>
        <span aria-hidden='true'>/</span>
        <span>Intelligence Studio</span>
      </nav>
      <ResearchIntelligenceClient/>
      <section aria-label='Research intelligence limitations' className='mt-8 max-w-4xl border-t border-brand-900/15 pt-5 text-sm leading-7 text-muted'>
        This experimental discovery interface analyzes only the currently integrated, source-verified research-intake batch
        and separately published evidence identities. The historical PMID-only index has no invented semantics.
        Bibliographic co-mentions, research gaps, changes over time, or candidate disagreements do not establish
        clinical effects, adverse interactions, safety, efficacy, or causal mechanisms.
        <Link href='/info/methodology/' className='ml-1 font-semibold text-brand-700 underline'>Read the methodology.</Link>
        <Link href='/learn/citation-explorer/' className='ml-2 font-semibold text-brand-700 underline'>Read reviewed evidence.</Link>
      </section>
    </div>
  )
}
