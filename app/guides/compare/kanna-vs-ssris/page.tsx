import type { Metadata } from 'next'
import Image from 'next/image'
import { buildPageMetadata } from '../../../../src/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'Kanna vs SSRIs',
  description: 'Educational comparison of kanna and SSRI-related serotonergic systems, mood regulation, emotional processing, and safety considerations.',
  path: '/guides/compare/kanna-vs-ssris/',
})

import Link from 'next/link'
import FAQSchema from '@/components/seo/FAQSchema'
import References from '@/components/References'
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

const KANNA_VS_SSRIS_REFS = [
  { n: 1, text: 'Boyer EW, Shannon M. (2005). The serotonin syndrome. N Engl J Med, 352(11): 1112-1120.', url: 'https://pubmed.ncbi.nlm.nih.gov/15784664/' },
  { n: 2, text: 'Gericke N, Viljoen AM. (2008). Sceletium — a review update. J Ethnopharmacol, 119(3): 653-663.', url: 'https://pubmed.ncbi.nlm.nih.gov/18761074/' },
  { n: 3, text: 'Cipriani A, et al. (2018). Comparative efficacy of 21 antidepressants for major depression. Lancet, 391(10128): 1357-1366.', url: 'https://pubmed.ncbi.nlm.nih.gov/29477251/' },
  { n: 4, text: 'Harvey BH, et al. (2011). Sceletium tortuosum demonstrates antidepressant effects. Prog Neuropsychopharmacol Biol Psychiatry, 35(5): 1225-1230.', url: 'https://pubmed.ncbi.nlm.nih.gov/21338652/' },
  { n: 5, text: 'Gillman PK. (2010). Triptans, serotonin agonists, and serotonin syndrome. Headache, 50(2): 264-272.', url: 'https://pubmed.ncbi.nlm.nih.gov/19925619/' },
]

export default function KannaVsSSRIsPage() {
  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd
        title="Kanna vs SSRIs"
        description="Educational comparison of kanna and SSRI-related serotonergic systems, mood regulation, emotional processing, and safety considerations."
        url="https://thehippiescientist.net/guides/compare/kanna-vs-ssris"
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
      <section className="card-premium p-6 space-y-4 max-w-4xl border-l-4 border-red-500 bg-red-50/30"><p className="text-xs font-bold uppercase tracking-wider text-red-700">⚠️ Do Not Combine</p>
        <p className="text-sm leading-7 text-red-900"><strong>Kanna + SSRIs = Serotonin Syndrome Risk.</strong> Kanna has serotonergic activity. SSRIs are serotonergic. The combination is dangerous. This comparison is educational only — not a recommendation to substitute or combine.</p></section>
        </p>

        <figure className="mt-6">
          <div className="overflow-hidden rounded-2xl border border-brand-900/10 shadow-sm bg-white">
            <Image
              src="/images/guides/kanna-vs-ssris.jpg"
              alt="Kanna (Sceletium tortuosum) herb beside prescription antidepressant tablets"
              width={1536}
              height={1024}
              priority
              className="w-full h-auto"
            />
          </div>
          <figcaption className="mt-3 text-center text-sm text-muted">
            Kanna vs SSRIs — an honest look at a very uneven comparison.
          </figcaption>
        </figure>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="card-premium p-6 space-y-4">
          <p className="eyebrow-label">Ethnobotanical System</p>
          <h2 className="text-3xl font-semibold tracking-tight text-ink">Kanna</h2>
          <p className="text-sm leading-7 text-muted">
            Kanna (Sceletium tortuosum) contains mesembrine and related alkaloids that act as serotonin reuptake inhibitors and PDE4 inhibitors. Traditional South African use includes mood elevation, stress reduction, and social bonding — but the pharmacology is under-studied compared to pharmaceutical antidepressants.
          </p>
          <Link href="/herbs/kanna" className="chip-readable">Explore Kanna</Link>
        </div>

        <div className="card-premium p-6 space-y-4">
          <p className="eyebrow-label">Pharmaceutical System</p>
          <h2 className="text-3xl font-semibold tracking-tight text-ink">SSRIs</h2>
          <p className="text-sm leading-7 text-muted">
            Selective serotonin reuptake inhibitors (fluoxetine, sertraline, escitalopram, etc.) are FDA-approved medications with decades of clinical trial data for depression and anxiety. They work by blocking serotonin transporter (SERT) proteins, gradually increasing synaptic serotonin over weeks.
          </p>
        </div>
      </section>

      <COAList entries={exampleCOAEntries} title="COA verification snapshot" />

      {/* Mechanism comparison */}
      <section className="card-premium p-6 space-y-4 max-w-4xl">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Why the comparison is uneven</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <h3 className="font-semibold text-ink">Kanna: Under-studied SRI</h3>
            <p className="mt-2 text-sm leading-7 text-muted">
              Kanna's mesembrine alkaloids inhibit serotonin reuptake — but the potency, selectivity, and clinical effect size are not well-characterized in human trials. There is no standardized dosing, no long-term safety data, and significant variability between products (plant part, extraction method, alkaloid content).
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-ink">SSRIs: Extensively studied</h3>
            <p className="mt-2 text-sm leading-7 text-muted">
              SSRIs have been studied in tens of thousands of patients across decades. Their efficacy, side effect profiles, drug interactions, withdrawal syndromes, and contraindications are well-documented. They are prescribed within a medical monitoring framework that includes dose titration and follow-up.
            </p>
          </div>
        </div>
      </section>

      {/* Safety warning */}
      <section className="rounded-2xl border-2 border-red-400 bg-red-50 p-6 max-w-4xl">
        <p className="text-sm font-black uppercase tracking-wider text-red-800">Do not combine kanna with SSRIs</p>
        <p className="mt-3 text-sm leading-7 text-red-900">
          Kanna has serotonergic activity. Combining it with SSRIs, SNRIs, MAOIs, tramadol, St. John's Wort, or other serotonergic substances increases the risk of serotonin syndrome — a potentially life-threatening condition. Symptoms include agitation, confusion, rapid heart rate, high blood pressure, dilated pupils, muscle rigidity, and hyperthermia. If you take any serotonergic medication, do not use kanna.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/learn/serotonin" className="rounded-full bg-red-100 px-3 py-1.5 text-xs font-bold text-red-800">Serotonin Pathway</Link>
          <Link href="/learn/serotonergic-stacking-risks" className="rounded-full bg-red-100 px-3 py-1.5 text-xs font-bold text-red-800">Serotonergic Risks</Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="card-premium p-6 space-y-4 max-w-4xl">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Frequently asked questions</h2>
        <div className="space-y-4 text-sm leading-7 text-muted">
          <div>
            <h3 className="text-lg font-semibold text-ink">Can kanna replace an SSRI?</h3>
            <p>No. Kanna is not a replacement for prescribed antidepressants. SSRIs are titrated under medical supervision with known efficacy and safety data. Kanna has no standardized dosing, no long-term outcome studies, and no regulatory quality control. Changing your depression treatment without medical guidance is dangerous.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-ink">What is serotonin syndrome?</h3>
            <p>Serotonin syndrome is a potentially life-threatening condition caused by excessive serotonergic activity. It can occur when multiple serotonergic substances are combined. Symptoms range from mild (shivering, diarrhea) to severe (hyperthermia, seizures, death). If you suspect serotonin syndrome, seek emergency medical attention immediately.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-ink">Is kanna safe on its own?</h3>
            <p>For most healthy adults not taking serotonergic medications, kanna at moderate doses appears to have a reasonable short-term safety profile based on traditional use and limited modern data. However, long-term safety is not established. Side effects may include headache, GI discomfort, and mild sedation. Start low and avoid daily use without breaks.</p>
          </div>
        </div>
      </section>

      <FAQSchema
        pagePath="/guides/compare/kanna-vs-ssris/"
        questions={[
          { question: 'Can kanna replace an SSRI?', answer: 'No. Kanna is not a replacement for prescribed antidepressants. SSRIs are titrated under medical supervision with known efficacy and safety data. Kanna has no standardized dosing, no long-term outcome studies, and no regulatory quality control. Changing your depression treatment without medical guidance is dangerous.' },
          { question: 'What is serotonin syndrome?', answer: 'Serotonin syndrome is a potentially life-threatening condition caused by excessive serotonergic activity. It can occur when multiple serotonergic substances are combined. Symptoms range from mild (shivering, diarrhea) to severe (hyperthermia, seizures, death). If you suspect serotonin syndrome, seek emergency medical attention immediately.' },
          { question: 'Is kanna safe on its own?', answer: 'For most healthy adults not taking serotonergic medications, kanna at moderate doses appears to have a reasonable short-term safety profile based on traditional use and limited modern data. However, long-term safety is not established. Side effects may include headache, GI discomfort, and mild sedation.' },
        ]}
      />

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

          <Link href="/learn/serotonergic-stacking-risks" className="chip-readable">
            Serotonergic Risks
          </Link>
        </div>
      </section>
      <References refs={KANNA_VS_SSRIS_REFS} />
    </div>
  )
}
