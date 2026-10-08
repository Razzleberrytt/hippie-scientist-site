import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '@/lib/seo'
import { getResearchSourceRegisterSummary } from '@/lib/research-source-register'
import IntelligenceLab from './IntelligenceLab'

export const metadata: Metadata = buildPageMetadata({
  title:'Research Intelligence Lab | The Hippie Scientist',
  description:'Eight experimental source-backed semantic research instruments for scientific discovery. Research-only, not evidence grades, clinical claims or medical advice.',
  path:'/research/intelligence/',
  robots:{index:false,follow:true},
})

export default function IntelligencePage() {
  const source=getResearchSourceRegisterSummary()
  return (
    <div className='mx-auto max-w-7xl px-3 py-6 sm:px-5 sm:py-9 lg:px-8'>
      <nav aria-label='Breadcrumb' className='mb-5 flex flex-wrap items-center gap-2 text-sm text-muted'>
        <Link href='/research/' className='font-semibold text-brand-700 hover:underline'>Research</Link>
        <span aria-hidden='true'>/</span>
        <Link href='/research/source-register/' className='font-semibold text-brand-700 hover:underline'>Source register</Link>
        <span aria-hidden='true'>/</span><span>Intelligence Lab</span>
      </nav>
      <IntelligenceLab totalIndexedPmids={source.totalIndexedPmids} />
      <section aria-labelledby='lab-boundary-heading' className='mx-auto max-w-3xl space-y-3 py-9 text-sm leading-7 text-muted'>
        <h2 id='lab-boundary-heading' className='text-xl font-bold tracking-tight text-ink'>A transparent research instrument—not an AI medical authority</h2>
        <p>
          The pilot analyzes 500 exactly source-verified bibliographic records from research enrichment waves 7001–7500.
          The cumulative research inventory contains {source.totalIndexedPmids.toLocaleString()} distinct PubMed identities;
          older PMID-only records are not assigned invented semantic metadata. An unmerged batch is not counted or promoted.
        </p>
        <p>
          Semantic matches and publication chronology support discovery. They do not establish an intervention, direction of effect,
          study quality, causality, confirmed adverse event, drug interaction, evidence consensus, or treatment recommendation.
          Any claims used in published editorial guidance require separate review and provenance through the
          <Link href='/learn/citation-explorer/' className='font-semibold text-brand-700 hover:underline'> Citation Explorer</Link>.
        </p>
      </section>
    </div>
  )
}
