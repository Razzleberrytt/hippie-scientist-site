import { buildPageMetadata } from '../../../../src/lib/seo'
import Image from 'next/image'
import type { Metadata } from 'next'
import Link from 'next/link'
import AffiliateDisclosure from '../../../../components/AffiliateDisclosure'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import { ArticleLayout, TableOfContents } from '@/components/articles'
import type { Heading } from '@/components/articles'
import References from '@/components/References'

export const metadata: Metadata = buildPageMetadata({
  title: 'CJC-1295: Human Evidence, FDA Status, and Safety (2026)',
  description:
    'Evidence-first review of CJC-1295: human GH/IGF-1 pharmacology, limits of recovery and anti-aging claims, current FDA compounding status, and safety uncertainty.',
  path: '/guides/other/cjc-1295/',
})

const HEADINGS: Heading[] = [
  { id: 'understanding', text: 'What Is CJC-1295?', level: 2 },
  { id: 'evidence', text: 'What the Evidence Can Show', level: 2 },
  { id: 'legal', text: 'FDA & Compounding Status', level: 2 },
  { id: 'safety', text: 'Safety Uncertainty', level: 2 },
  { id: 'bottom-line', text: 'Bottom Line', level: 2 },
]

const CJC_1295_REFS = [
  {
    n: 1,
    text: 'FDA. Certain Bulk Drug Substances for Use in Compounding that May Present Significant Safety Risks. Current CJC-1295 entry.',
    url: 'https://www.fda.gov/drugs/human-drug-compounding/certain-bulk-drug-substances-use-compounding-may-present-significant-safety-risks',
  },
  {
    n: 2,
    text: 'FDA. December 4, 2024 Meeting of the Pharmacy Compounding Advisory Committee. CJC-1295-related bulk drug substances reviewed for growth hormone deficiency.',
    url: 'https://www.fda.gov/advisory-committees/advisory-committee-calendar/updated-meeting-time-and-public-participation-information-december-4-2024-meeting-pharmacy',
  },
  {
    n: 3,
    text: 'FDA. Bulk Drug Substances Used in Compounding Under Section 503A of the FD&C Act. Current framework and rulemaking process.',
    url: 'https://www.fda.gov/drugs/human-drug-compounding/bulk-drug-substances-used-compounding-under-section-503a-fdc-act',
  },
  {
    n: 4,
    text: 'Teichman SL, et al. Prolonged stimulation of growth hormone and IGF-I secretion by CJC-1295, a long-acting analog of GH-releasing hormone, in healthy adults. J Clin Endocrinol Metab. 2006. PMID 16352683.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/16352683/',
    pmid: '16352683',
  },
  {
    n: 5,
    text: 'Teichman SL, et al. Pulsatile secretion of growth hormone persists during continuous stimulation by CJC-1295, a long-acting GH-releasing hormone analog. J Clin Endocrinol Metab. 2006. PMID 17018654.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/17018654/',
    pmid: '17018654',
  },
  {
    n: 6,
    text: 'FDA. Human Drug Compounding Policies and Rules. Current policy and rulemaking index.',
    url: 'https://www.fda.gov/drugs/human-drug-compounding/human-drug-compounding-policies-and-rules',
  },
]

export default function Page() {
  const toc = <TableOfContents headings={HEADINGS} />
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Guides', href: '/guides' },
    { label: 'CJC-1295: Human Evidence, FDA Status, and Safety' },
  ]

  return (
    <ArticleLayout toc={toc} zone="harm-reduction">
      <div className="space-y-8">
        <AuthorityBreadcrumbs items={breadcrumbs} />

        <section className="hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8">
          <p className="eyebrow-label">Experimental peptide · Reviewed August 16, 2026</p>
          <h1 className="mt-2 text-3xl font-semibold text-ink sm:text-4xl">
            CJC-1295: Human Evidence, FDA Status, and Safety
          </h1>
          <p className="detail-reading mt-4 text-muted">
            CJC-1295 can raise growth hormone and IGF-1 in humans. That measurable pharmacology is real, but it is much narrower than the recovery, sleep, physique, anti-aging, and longevity claims commonly attached to the peptide.
          </p>
          <figure className="mt-6">
            <div className="overflow-hidden rounded-2xl border border-brand-900/10 bg-white shadow-sm">
              <Image
                src="/images/guides/cjc-1295.jpg"
                alt="A glass vial of lyophilized research peptide powder in a lab setting"
                width={1536}
                height={1024}
                priority
                className="h-auto w-full"
              />
            </div>
            <figcaption className="mt-3 text-center text-sm text-muted">
              Human hormone-response studies exist; broad patient-important benefits and long-term safety remain unestablished.
            </figcaption>
          </figure>
        </section>

        <section className="rounded-2xl border border-rose-900/15 bg-rose-50/80 p-5 text-sm leading-6 text-rose-950">
          <p className="font-semibold">Unapproved-drug notice</p>
          <p className="mt-2">
            CJC-1295 is not an FDA-approved drug product. Online sale, “research use only” labeling, clinic availability, or a past compounding nomination does not establish FDA approval, clinical effectiveness, product quality, or suitability for human use [1–3].
          </p>
        </section>

        <AffiliateDisclosure />

        <section className="prose-section space-y-6">
          <div id="understanding" className="scroll-mt-20">
            <h2 className="mb-4 mt-8 text-2xl font-semibold text-ink">What Is CJC-1295?</h2>
            <p className="text-muted leading-relaxed">
              CJC-1295 is a synthetic growth-hormone-releasing-hormone analogue. The name is used loosely in peptide marketing, so evidence from one defined molecule or formulation should not be assumed to validate every product sold as “CJC-1295.”
            </p>
            <p className="text-muted leading-relaxed">
              The best-known human studies evaluated long-acting CJC-1295 with a drug-affinity-complex modification. Shorter-acting products marketed as “no DAC” or “Mod GRF 1-29” should not be treated as pharmacologically or clinically interchangeable with that material without direct evidence [4,5].
            </p>
          </div>

          <div id="evidence" className="scroll-mt-20 space-y-4">
            <h2 className="mb-4 mt-8 text-2xl font-semibold text-ink">What the Evidence Can Show</h2>
            <p className="text-muted leading-relaxed">
              Two controlled human pharmacology reports show that CJC-1295 can produce sustained GH and IGF-1 changes in healthy adults [4,5]. Those studies answer a pharmacology question; they do not establish a treatment effect for recovery, sleep, fat loss, muscle gain, anti-aging, or longevity.
            </p>
            <div className="overflow-x-auto rounded-2xl border border-brand-900/10">
              <table id="cjc1295-evidence-table" data-answer-engine-table className="w-full min-w-[820px] text-left text-sm">
                <caption className="sr-only">CJC-1295 evidence by question and current conclusion</caption>
                <thead className="bg-brand-50/70 text-ink">
                  <tr>
                    <th scope="col" className="p-3">Question</th>
                    <th scope="col" className="p-3">Best current evidence</th>
                    <th scope="col" className="p-3">What it supports</th>
                    <th scope="col" className="p-3">What it does not establish</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-900/10 text-muted">
                  <tr>
                    <th scope="row" className="p-3 font-semibold text-ink">Can CJC-1295 raise GH and IGF-1?</th>
                    <td className="p-3">Randomized placebo-controlled pharmacology studies in healthy adults [4,5]</td>
                    <td className="p-3">Sustained GH/IGF-1 elevation and preserved GH pulsatility</td>
                    <td className="p-3">Patient-important clinical benefit</td>
                  </tr>
                  <tr>
                    <th scope="row" className="p-3 font-semibold text-ink">Does it improve recovery, sleep, or body composition?</th>
                    <td className="p-3">No robust controlled outcome program identified in this review</td>
                    <td className="p-3">No reliable conclusion</td>
                    <td className="p-3">Routine therapeutic effectiveness</td>
                  </tr>
                  <tr>
                    <th scope="row" className="p-3 font-semibold text-ink">Are CJC-1295 + ipamorelin stacks validated?</th>
                    <td className="p-3">Marketing use substantially outruns controlled human outcome evidence</td>
                    <td className="p-3">A research gap</td>
                    <td className="p-3">A validated combination protocol</td>
                  </tr>
                  <tr>
                    <th scope="row" className="p-3 font-semibold text-ink">Is long-term safety characterized?</th>
                    <td className="p-3">Limited clinical exposure plus FDA safety concerns [1,4,5]</td>
                    <td className="p-3">Short-term pharmacology context</td>
                    <td className="p-3">Long-duration safety or uncommon-risk estimates</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div id="legal" className="scroll-mt-20 space-y-4">
            <h2 className="mb-4 mt-8 text-2xl font-semibold text-ink">FDA &amp; Compounding Status — Checked August 16, 2026</h2>
            <p className="text-muted leading-relaxed">
              FDA's December 4, 2024 Pharmacy Compounding Advisory Committee meeting evaluated several CJC-1295-related bulk drug substances for growth hormone deficiency [2]. FDA's current significant-safety-risk page now places CJC-1295 in the section for substances whose nominations were withdrawn and continues to describe limited clinical data and potential safety concerns [1].
            </p>
            <p className="text-muted leading-relaxed">
              FDA's current 503A framework states that bulk substances generally must satisfy the applicable monograph, approved-drug-component, or 503A-bulks-list pathway. A withdrawn nomination, a past advisory-committee discussion, clinic availability, or an RUO label is not equivalent to FDA approval [3,6].
            </p>
            <div className="overflow-x-auto rounded-2xl border border-brand-900/10">
              <table id="cjc1295-regulatory-table" data-answer-engine-table className="w-full min-w-[720px] text-left text-sm">
                <caption className="sr-only">Current CJC-1295 regulatory and compounding status</caption>
                <thead className="bg-brand-50/70 text-ink">
                  <tr>
                    <th scope="col" className="p-3">Statement</th>
                    <th scope="col" className="p-3">Current status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-900/10 text-muted">
                  <tr><th scope="row" className="p-3 font-semibold text-ink">“CJC-1295 is FDA-approved.”</th><td className="p-3">False</td></tr>
                  <tr><th scope="row" className="p-3 font-semibold text-ink">“FDA reviewed CJC-1295-related substances for possible 503A listing.”</th><td className="p-3">Yes; PCAC discussed them in December 2024 [2]</td></tr>
                  <tr><th scope="row" className="p-3 font-semibold text-ink">“The nomination remains an active Category 1 pathway.”</th><td className="p-3">No; FDA's current safety page lists CJC-1295 under withdrawn nominations [1]</td></tr>
                  <tr><th scope="row" className="p-3 font-semibold text-ink">“Clinic or RUO availability proves legal or clinical authorization.”</th><td className="p-3">No</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div id="safety" className="scroll-mt-20">
            <h2 className="mb-4 mt-8 text-2xl font-semibold text-ink">Safety Uncertainty</h2>
            <ul className="list-disc space-y-2 pl-5 text-muted leading-relaxed">
              <li>FDA identifies potential immunogenicity and peptide/API-characterization concerns for compounded CJC-1295 [1].</li>
              <li>FDA reports serious adverse events associated with CJC-1295, including increased heart rate and a systemic vasodilatory reaction, while noting that available clinical data are limited [1].</li>
              <li>The human pharmacology trials were not designed to establish multi-year safety, rare adverse-event rates, or safety in medically complex populations [4,5].</li>
              <li>Injectable products introduce additional identity, sterility, contamination, and strength risks when product quality is uncertain.</li>
            </ul>
          </div>

          <div id="bottom-line" className="scroll-mt-20">
            <h2 className="mb-4 mt-8 text-2xl font-semibold text-ink">Bottom Line</h2>
            <p className="text-muted leading-relaxed">
              CJC-1295 has real human GH/IGF-1 pharmacology. That does not make it a proven recovery, sleep, physique, anti-aging, or longevity therapy. FDA's current record remains cautious, the compounding nomination is withdrawn, and long-term human benefit and safety are not established.
            </p>
          </div>
        </section>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="/guides/" className="text-sm font-medium text-emerald-700 hover:underline">Back to guides &rarr;</Link>
          <Link href="/compounds/cjc-1295/" className="text-sm font-medium text-emerald-700 hover:underline">View CJC-1295 compound profile &rarr;</Link>
          <Link href="/guides/other/ipamorelin/" className="text-sm font-medium text-emerald-700 hover:underline">Read the Ipamorelin guide &rarr;</Link>
        </div>
      </div>
      <References refs={CJC_1295_REFS} />
    </ArticleLayout>
  )
}
