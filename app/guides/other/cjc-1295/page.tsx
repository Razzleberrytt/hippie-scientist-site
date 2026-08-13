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
  description: 'Evidence-first overview of CJC-1295, including human GH/IGF-1 pharmacology, limits of benefit claims, FDA compounding safety concerns, and current regulatory context.',
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
  { n: 1, text: 'FDA. Certain Bulk Drug Substances for Use in Compounding that May Present Significant Safety Risks.', url: 'https://www.fda.gov/drugs/human-drug-compounding/certain-bulk-drug-substances-use-compounding-may-present-significant-safety-risks' },
  { n: 2, text: 'FDA. December 4, 2024 Meeting of the Pharmacy Compounding Advisory Committee.', url: 'https://www.fda.gov/advisory-committees/advisory-committee-calendar/updated-meeting-time-and-public-participation-information-december-4-2024-meeting-pharmacy' },
  { n: 3, text: 'FDA. Bulk Drug Substances Used in Compounding Under Section 503A of the FD&C Act.', url: 'https://www.fda.gov/drugs/human-drug-compounding/bulk-drug-substances-used-compounding-under-section-503a-fdc-act' },
  { n: 4, text: 'Teichman SL, et al. Prolonged stimulation of growth hormone and IGF-I secretion by CJC-1295. J Clin Endocrinol Metab. 2006.', url: 'https://pubmed.ncbi.nlm.nih.gov/16352683/' },
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
          <p className="eyebrow-label">Experimental Peptide Guide</p>
          <h1 className="mt-2 text-3xl font-semibold text-ink sm:text-4xl">CJC-1295: Human Evidence, FDA Status, and Safety</h1>
          <p className="detail-reading mt-4 text-muted">
            CJC-1295 can raise GH and IGF-1 in humans, but a measurable hormone response is not the same as proven benefit for recovery, sleep, body composition, or longevity.
          </p>
          <figure className="mt-6">
            <div className="overflow-hidden rounded-2xl border border-brand-900/10 shadow-sm bg-white">
              <Image src="/images/guides/cjc-1295.jpg" alt="A glass vial of lyophilized research peptide powder in a lab setting" width={1536} height={1024} priority className="w-full h-auto" />
            </div>
            <figcaption className="mt-3 text-center text-sm text-muted">CJC-1295 — human pharmacology exists, but broad clinical benefit claims remain unestablished.</figcaption>
          </figure>
        </section>

        <section className="rounded-2xl border border-rose-900/15 bg-rose-50/80 p-5 text-sm leading-6 text-rose-950">
          <p className="font-semibold">Unapproved-drug notice</p>
          <p className="mt-2">CJC-1295 is not an FDA-approved drug product. Online or RUO availability does not establish FDA authorization, clinical effectiveness, product quality, or suitability for human use.</p>
        </section>

        <AffiliateDisclosure />

        <section className="prose-section space-y-6">
          <div className="card-premium p-6">
            <p className="text-sm font-semibold text-brand-700 uppercase tracking-wide">Review status</p>
            <p className="mt-3 text-sm text-muted">Regulatory wording reviewed August 12, 2026 against current FDA compounding material.</p>
          </div>

          <div id="understanding" className="scroll-mt-20">
            <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">What Is CJC-1295?</h2>
            <p className="text-muted leading-relaxed">
              CJC-1295 is a synthetic growth-hormone-releasing-hormone analogue. The name is often used loosely in peptide marketing, so readers should verify the exact molecule and formulation rather than assuming every product sold as “CJC-1295” matches the material studied in published human pharmacology research.
            </p>
            <p className="text-muted leading-relaxed">
              CJC-1295 with a drug-affinity-complex modification was designed for prolonged exposure. Shorter-acting products marketed as “no DAC” or “Mod GRF 1-29” should not be treated as automatically equivalent to the long-acting molecule studied in the best-known CJC-1295 trial.
            </p>
          </div>

          <div id="evidence" className="scroll-mt-20">
            <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">What the Evidence Can Show</h2>
            <ul className="list-disc pl-5 space-y-2 text-muted leading-relaxed">
              <li><strong>Human pharmacology:</strong> early trials showed prolonged, dose-related increases in GH and IGF-1 after CJC-1295 administration.</li>
              <li><strong>Clinical benefit:</strong> hormone changes do not by themselves establish improved recovery, sleep, body composition, anti-aging outcomes, or long-term health.</li>
              <li><strong>Combination use:</strong> common CJC-1295 + ipamorelin protocols are not supported by robust controlled human outcome trials for the claims usually made online.</li>
              <li><strong>Long-term safety:</strong> available clinical data are limited, particularly for repeated real-world use outside research settings.</li>
            </ul>
            <p className="text-muted leading-relaxed"><strong>Evidence quality: pharmacology established better than patient-important benefit.</strong></p>
          </div>

          <div id="legal" className="scroll-mt-20">
            <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">FDA &amp; Compounding Status (August 2026)</h2>
            <p className="text-muted leading-relaxed">
              FDA's Pharmacy Compounding Advisory Committee discussed CJC-1295-related substances at its <strong>December 4, 2024</strong> meeting. FDA's current significant-safety-risk page still lists CJC-1295 among substances whose nominations were withdrawn and notes limited clinical data plus safety concerns.
            </p>
            <p className="text-muted leading-relaxed">
              FDA's 503A page explains that final bulks-list decisions are made through agency rulemaking. A past advisory-committee discussion, a withdrawn nomination, a clinic offering, or an RUO label should not be translated into a claim that CJC-1295 is FDA-approved or generally authorized for human use.
            </p>
            <p className="text-muted leading-relaxed"><strong>Bottom line:</strong> CJC-1295 is not FDA-approved, and the current FDA record does not support describing it as a settled or broadly authorized compounded therapy.</p>
          </div>

          <div id="safety" className="scroll-mt-20">
            <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">Safety Uncertainty</h2>
            <ul className="list-disc pl-5 space-y-2 text-muted leading-relaxed">
              <li>FDA identifies potential immunogenicity and peptide/API-characterization concerns for compounded CJC-1295.</li>
              <li>FDA reports serious adverse events associated with CJC-1295, including increased heart rate and a systemic vasodilatory reaction, while noting that available clinical data are limited.</li>
              <li>Repeated GH/IGF-1 elevation can have metabolic and growth-signaling consequences; CJC-1295-specific long-term outcome data are inadequate to quantify those risks confidently.</li>
              <li>Injectable products add sterility, contamination, identity, and strength risks when quality is uncertain.</li>
            </ul>
          </div>

          <div id="bottom-line" className="scroll-mt-20">
            <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">Bottom Line</h2>
            <p className="text-muted leading-relaxed">
              CJC-1295 has real human GH/IGF-1 pharmacology, but that is narrower than the recovery, sleep, physique, and longevity claims attached to it in marketing. FDA's current safety material remains cautious, and no regulatory shortcut turns a measurable hormone response into a proven or generally safe human therapy.
            </p>
          </div>
        </section>

        <div className="mt-8 flex gap-4 flex-wrap">
          <Link href="/guides/" className="text-sm font-medium text-emerald-700 hover:underline">Back to guides &rarr;</Link>
          <Link href="/compounds/cjc-1295/" className="text-sm font-medium text-emerald-700 hover:underline">View CJC-1295 compound profile &rarr;</Link>
          <Link href="/guides/other/ipamorelin/" className="text-sm font-medium text-emerald-700 hover:underline">Read the Ipamorelin guide &rarr;</Link>
        </div>
      </div>
      <References refs={CJC_1295_REFS} />
    </ArticleLayout>
  )
}
