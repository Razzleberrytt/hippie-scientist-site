import type { Metadata } from 'next'
import { buildPageMetadata } from '../../../../src/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'Kanna vs SSRIs',
  description: 'Educational comparison of kanna and SSRI-related serotonergic systems, mood regulation, emotional processing, and safety considerations.',
  path: '/compare/kanna-vs-ssris/',
})

import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import COAList from '../../../../src/components/coa/COAList'
import type { COADocument } from '../../../../src/types/coa'

const exampleCOAEntries: COADocument[] = [
  {
    id: 'vendor-a-lot-2402',
    labName: 'Aurora Analytics Lab',
    isIso17025Accredited: true,
    testDate: '2026-03-08',
    batchLot: 'KAN-2402-A',
    pdfUrl: '#',
    confidence: 'high',
    confidenceRationale: 'Accredited lab, recent date, and complete potency/heavy-metal/microbial panel fields.',
    availability: 'verified',
    testResults: [
      { category: 'potency', analyte: 'Mesembrine', measuredValue: '0.42%', limit: 'Label claim ±10%', status: 'pass' },
      { category: 'heavy_metals', analyte: 'Lead', measuredValue: '<0.05 ppm', limit: '<0.5 ppm', status: 'pass' },
      { category: 'microbes', analyte: 'Total yeast and mold', measuredValue: '<100 CFU/g', limit: '<1000 CFU/g', status: 'pass' },
    ],
  },
  {
    id: 'vendor-b-lot-unknown',
    labName: 'Lab not listed',
    isIso17025Accredited: false,
    testDate: 'Not listed',
    batchLot: 'Not listed',
    confidence: 'low',
    confidenceRationale: 'Missing lab verification and limited report metadata reduce confidence.',
    availability: 'unverified_lab',
    testResults: [],
  },
]

export default function KannaVsSSRIsPage() {
  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd
        title="Kanna vs SSRIs"
        description="Educational comparison of kanna and SSRI-related serotonergic systems, mood regulation, emotional processing, and safety considerations."
        url="https://thehippiescientist.net/compare/kanna-vs-ssris"
        type="Article"
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Compare', href: '/compare' },
          { label: 'Kanna vs SSRIs' },
        ]}
      />

      <section className="space-y-5 max-w-4xl">
        <p className="eyebrow-label">Educational Comparison</p>

        <h1 className="text-5xl font-bold tracking-tight text-ink">
          Kanna vs SSRIs
        </h1>

        <p className="text-lg leading-8 text-muted">
          Educational comparison of kanna and SSRI-related serotonergic systems through the lens of emotional processing, mood regulation, psychoactive neuropharmacology, and safety awareness.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="card-premium p-6 space-y-4">
          <p className="eyebrow-label">Ethnobotanical System</p>

          <h2 className="text-3xl font-semibold tracking-tight text-ink">
            Kanna
          </h2>

          <p className="text-sm leading-7 text-muted">
            Traditionally used psychoactive ethnobotanical associated with emotional regulation, stress modulation, and serotonergic mechanisms.
          </p>

          <Link href="/herbs/kanna" className="chip-readable">
            Explore Kanna
          </Link>
        </div>

        <div className="card-premium p-6 space-y-4">
          <p className="eyebrow-label">Pharmaceutical System</p>

          <h2 className="text-3xl font-semibold tracking-tight text-ink">
            SSRIs
          </h2>

          <p className="text-sm leading-7 text-muted">
            Selective serotonin reuptake inhibitors are prescription medications associated with serotonergic modulation and mood-related neuropharmacology.
          </p>
        </div>
      </section>

      <COAList entries={exampleCOAEntries} title="COA verification snapshot" />

      <section className="surface-subtle rounded-3xl p-6 space-y-5">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">
          Safety and serotonergic considerations
        </h2>

        <p className="text-sm leading-7 text-muted">
          Serotonergic substances may interact with medications, mood systems, emotional-processing pathways, and stress-response signaling. Educational comparison should prioritize conservative interpretation and interaction awareness.
        </p>

        <div className="flex flex-wrap gap-3">
          <Link href="/learn/serotonin" className="chip-readable">
            Serotonin Pathway
          </Link>

          <Link href="/psychoactive/serotonergic-stacking-risks" className="chip-readable">
            Serotonergic Risks
          </Link>
        </div>
      </section>
    </div>
  )
}
