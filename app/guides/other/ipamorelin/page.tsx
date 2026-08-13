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
  title: 'Ipamorelin: Human Evidence, FDA Status, and Safety (2026)',
  description: 'Evidence-first overview of ipamorelin, including human GH-release pharmacology, limits of anti-aging and recovery claims, FDA compounding safety concerns, and current regulatory status.',
  path: '/guides/other/ipamorelin/',
})

const HEADINGS: Heading[] = [
  { id: 'understanding', text: 'What Is Ipamorelin?', level: 2 },
  { id: 'evidence', text: 'What the Evidence Can Show', level: 2 },
  { id: 'legal', text: 'FDA & Compounding Status', level: 2 },
  { id: 'safety', text: 'Safety Uncertainty', level: 2 },
  { id: 'bottom-line', text: 'Bottom Line', level: 2 },
]

const IPAMORELIN_REFS = [
  { n: 1, text: 'FDA. Certain Bulk Drug Substances for Use in Compounding that May Present Significant Safety Risks.', url: 'https://www.fda.gov/drugs/human-drug-compounding/certain-bulk-drug-substances-use-compounding-may-present-significant-safety-risks' },
  { n: 2, text: 'FDA. Bulk Drug Substances Used in Compounding Under Section 503A of the FD&C Act.', url: 'https://www.fda.gov/drugs/human-drug-compounding/bulk-drug-substances-used-compounding-under-section-503a-fdc-act' },
  { n: 3, text: 'Raun K, et al. Ipamorelin, the first selective growth hormone secretagogue. Eur J Endocrinol. 1998.', url: 'https://pubmed.ncbi.nlm.nih.gov/9849822/' },
]

export default function Page() {
  const toc = <TableOfContents headings={HEADINGS} />
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Guides', href: '/guides' },
    { label: 'Ipamorelin: Human Evidence, FDA Status, and Safety' },
  ]

  return (
    <ArticleLayout toc={toc} zone="harm-reduction">
      <div className="space-y-8">
        <AuthorityBreadcrumbs items={breadcrumbs} />

        <section className="hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8">
          <p className="eyebrow-label">Experimental Peptide Guide</p>
          <h1 className="mt-2 text-3xl font-semibold text-ink sm:text-4xl">Ipamorelin: Human Evidence, FDA Status, and Safety</h1>
          <p className="detail-reading mt-4 text-muted">
            Ipamorelin can stimulate growth-hormone release, but that pharmacology is much better established than the anti-aging, recovery, sleep, or body-composition outcomes used to market it.
          </p>
          <figure className="mt-6">
            <div className="overflow-hidden rounded-2xl border border-brand-900/10 shadow-sm bg-white">
              <Image src="/images/guides/ipamorelin.jpg" alt="A research peptide vial with a sterile syringe on a clinical surface" width={1536} height={1024} priority className="w-full h-auto" />
            </div>
            <figcaption className="mt-3 text-center text-sm text-muted">Ipamorelin — hormone-release pharmacology does not establish broad clinical benefit.</figcaption>
          </figure>
        </section>

        <section className="rounded-2xl border border-rose-900/15 bg-rose-50/80 p-5 text-sm leading-6 text-rose-950">
          <p className="font-semibold">Unapproved-drug notice</p>
          <p className="mt-2">Ipamorelin is not an FDA-approved finished drug product. Clinic availability, a compounded preparation, or an RUO label does not establish FDA approval, broad clinical effectiveness, or long-term safety.</p>
        </section>

        <AffiliateDisclosure />

        <section className="prose-section space-y-6">
          <div className="card-premium p-6">
            <p className="text-sm font-semibold text-brand-700 uppercase tracking-wide">Review status</p>
            <p className="mt-3 text-sm text-muted">Regulatory wording reviewed August 12, 2026 against current FDA compounding safety material.</p>
          </div>

          <div id="understanding" className="scroll-mt-20">
            <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">What Is Ipamorelin?</h2>
            <p className="text-muted leading-relaxed">
              Ipamorelin is a synthetic growth-hormone secretagogue and ghrelin-receptor agonist. Older pharmacology studies support its ability to stimulate GH release with a different hormone-release profile from some earlier secretagogues. That does not make it a proven anti-aging or recovery treatment.
            </p>
          </div>

          <div id="evidence" className="scroll-mt-20">
            <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">What the Evidence Can Show</h2>
            <ul className="list-disc pl-5 space-y-2 text-muted leading-relaxed">
              <li><strong>GH release:</strong> pharmacology studies support that ipamorelin can stimulate GH secretion.</li>
              <li><strong>Clinical outcomes:</strong> direct controlled evidence is insufficient for broad claims about sleep, injury recovery, anti-aging, fat loss, or physique improvement in generally healthy users.</li>
              <li><strong>Combination protocols:</strong> common ipamorelin + CJC-1295 use is more strongly justified by mechanism than by replicated human outcome trials of the combination.</li>
              <li><strong>“Cleaner” secretagogue claims:</strong> relative hormone selectivity in a pharmacology experiment is not a blanket safety conclusion.</li>
            </ul>
            <p className="text-muted leading-relaxed"><strong>Evidence quality: stronger for hormone-release pharmacology than for marketed lifestyle outcomes.</strong></p>
          </div>

          <div id="legal" className="scroll-mt-20">
            <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">FDA &amp; Compounding Status (August 2026)</h2>
            <p className="text-muted leading-relaxed">
              Ipamorelin is not FDA-approved as a finished drug product. FDA's current significant-safety-risk page lists <strong>ipamorelin acetate in category 2 under the 503B interim policy</strong> and separately describes important safety-information and peptide-characterization gaps.
            </p>
            <p className="text-muted leading-relaxed">
              This is more reliable than forecasting a future reclassification or broad compounding access. FDA's compounding categories and final bulks-list decisions are specific regulatory processes; a clinic offering or prescription does not convert an unapproved product into an FDA-approved drug.
            </p>
            <p className="text-muted leading-relaxed"><strong>Bottom line:</strong> describe the current FDA category and safety record as they are; do not forecast approval or broad access from prior announcements or marketing.</p>
          </div>

          <div id="safety" className="scroll-mt-20">
            <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">Safety Uncertainty</h2>
            <ul className="list-disc pl-5 space-y-2 text-muted leading-relaxed">
              <li>FDA flags potential immunogenicity, aggregation, peptide-impurity, and characterization concerns for compounded ipamorelin acetate.</li>
              <li>FDA notes serious adverse events, including deaths, in a study using intravenous ipamorelin for gastric-motility purposes. That route-specific signal should not be generalized mechanically to every route, but it also cannot be reconciled with blanket “well tolerated” marketing.</li>
              <li>FDA says safety information is lacking for certain other injectable routes and therefore lacks sufficient information to know whether harm would occur through those routes.</li>
              <li>Repeated manipulation of the GH/IGF-1 axis raises metabolic and growth-signaling questions that short pharmacology studies cannot resolve.</li>
            </ul>
          </div>

          <div id="bottom-line" className="scroll-mt-20">
            <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">Bottom Line</h2>
            <p className="text-muted leading-relaxed">
              Ipamorelin has a legitimate pharmacology literature showing GH release, but that is narrower than the wellness claims attached to it. It is not FDA-approved, FDA currently flags significant compounding safety questions, and the evidence does not justify treating common gray-market protocols as established therapy.
            </p>
          </div>
        </section>

        <div className="mt-8 flex gap-4 flex-wrap">
          <Link href="/guides/" className="text-sm font-medium text-emerald-700 hover:underline">Back to guides &rarr;</Link>
          <Link href="/compounds/ipamorelin/" className="text-sm font-medium text-emerald-700 hover:underline">View Ipamorelin compound profile &rarr;</Link>
          <Link href="/guides/other/cjc-1295/" className="text-sm font-medium text-emerald-700 hover:underline">Read the CJC-1295 guide &rarr;</Link>
        </div>
      </div>
      <References refs={IPAMORELIN_REFS} />
    </ArticleLayout>
  )
}
