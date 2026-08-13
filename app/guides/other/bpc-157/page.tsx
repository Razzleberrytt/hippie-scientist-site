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
  title: 'BPC-157: Human Evidence, FDA Status, and Safety (2026)',
  description: 'Current evidence-first review of BPC-157, including the preclinical evidence gap, the July 2026 FDA advisory meeting, compounding status, and safety uncertainty.',
  path: '/guides/other/bpc-157/',
})

const HEADINGS: Heading[] = [
  { id: 'understanding', text: 'What Is BPC-157?', level: 2 },
  { id: 'evidence', text: 'What the Evidence Can Show', level: 2 },
  { id: 'legal', text: 'FDA & Compounding Status', level: 2 },
  { id: 'safety', text: 'Safety Uncertainty', level: 2 },
  { id: 'bottom-line', text: 'Bottom Line', level: 2 },
]

const BPC_157_REFS = [
  { n: 1, text: 'FDA. Certain Bulk Drug Substances for Use in Compounding that May Present Significant Safety Risks.', url: 'https://www.fda.gov/drugs/human-drug-compounding/certain-bulk-drug-substances-use-compounding-may-present-significant-safety-risks' },
  { n: 2, text: 'FDA. July 23-24, 2026 Meeting of the Pharmacy Compounding Advisory Committee.', url: 'https://www.fda.gov/advisory-committees/advisory-committee-calendar/july-23-24-2026-meeting-pharmacy-compounding-advisory-committee-07232026' },
  { n: 3, text: 'FDA. Bulk Drug Substances Used in Compounding Under Section 503A of the FD&C Act.', url: 'https://www.fda.gov/drugs/human-drug-compounding/bulk-drug-substances-used-compounding-under-section-503a-fdc-act' },
  { n: 4, text: 'Sikiric P, et al. BPC 157 research review. Curr Pharm Des. 2014.', url: 'https://pubmed.ncbi.nlm.nih.gov/23782141/' },
]

export default function Page() {
  const toc = <TableOfContents headings={HEADINGS} />
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Guides', href: '/guides' },
    { label: 'BPC-157: Human Evidence, FDA Status, and Safety' },
  ]

  return (
    <ArticleLayout toc={toc} zone="harm-reduction">
      <div className="space-y-8">
        <AuthorityBreadcrumbs items={breadcrumbs} />

        <section className="hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8">
          <p className="eyebrow-label">Experimental Peptide Guide</p>
          <h1 className="mt-2 text-3xl font-semibold text-ink sm:text-4xl">BPC-157: Human Evidence, FDA Status, and Safety</h1>
          <p className="detail-reading mt-4 text-muted">
            BPC-157 has extensive preclinical discussion but no established human efficacy profile. This guide separates animal findings, current FDA compounding information, and what remains unknown.
          </p>
          <figure className="mt-6">
            <div className="overflow-hidden rounded-2xl border border-brand-900/10 shadow-sm bg-white">
              <Image src="/images/guides/bpc-157.jpg" alt="A glass vial of lyophilized research peptide powder in a lab setting" width={1536} height={1024} priority className="w-full h-auto" />
            </div>
            <figcaption className="mt-3 text-center text-sm text-muted">BPC-157 — experimental peptide research, not an established human treatment.</figcaption>
          </figure>
        </section>

        <section className="rounded-2xl border border-rose-900/15 bg-rose-50/80 p-5 text-sm leading-6 text-rose-950">
          <p className="font-semibold">Unapproved-drug notice</p>
          <p className="mt-2">
            BPC-157 is not an FDA-approved drug product. A “research use only” label does not establish FDA approval, clinical effectiveness, product quality, or suitability for human use.
          </p>
        </section>

        <AffiliateDisclosure />

        <section className="prose-section space-y-6">
          <div className="card-premium p-6">
            <p className="text-sm font-semibold text-brand-700 uppercase tracking-wide">Review status</p>
            <p className="mt-3 text-sm text-muted">Regulatory wording reviewed August 12, 2026 against current FDA compounding and advisory-committee material.</p>
          </div>

          <div id="understanding" className="scroll-mt-20">
            <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">What Is BPC-157?</h2>
            <p className="text-muted leading-relaxed">
              BPC-157 is a synthetic 15-amino-acid peptide widely marketed around tendon, muscle, gastrointestinal, and recovery claims. The research literature is dominated by animal and mechanistic studies. Those studies can generate hypotheses, but they do not establish a human treatment effect, human dose, pharmacokinetics, or long-term safety.
            </p>
          </div>

          <div id="evidence" className="scroll-mt-20">
            <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">What the Evidence Can Show</h2>
            <ul className="list-disc pl-5 space-y-2 text-muted leading-relaxed">
              <li><strong>Preclinical findings:</strong> rodent and laboratory models report signals involving wound healing, gastrointestinal injury, vascular signaling, and musculoskeletal repair.</li>
              <li><strong>Human efficacy:</strong> controlled human evidence is insufficient to establish that BPC-157 heals tendons, muscles, ulcers, neurologic injury, or other conditions in people.</li>
              <li><strong>Human dosing:</strong> online dose schedules are not supported by an established human pharmacokinetic and efficacy program.</li>
              <li><strong>Product equivalence:</strong> a gray-market vial cannot be assumed to match the identity, purity, sterility, or formulation used in research.</li>
            </ul>
            <p className="text-muted leading-relaxed"><strong>Evidence quality: predominantly preclinical.</strong> Interesting animal findings are not a substitute for replicated human trials.</p>
          </div>

          <div id="legal" className="scroll-mt-20">
            <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">FDA &amp; Compounding Status (August 2026)</h2>
            <p className="text-muted leading-relaxed">
              FDA's Pharmacy Compounding Advisory Committee met on <strong>July 23, 2026</strong> and discussed BPC-157-related bulk drug substances for possible inclusion on the section 503A Bulks List. That meeting has already occurred; describing it as an upcoming decision is now stale.
            </p>
            <p className="text-muted leading-relaxed">
              An advisory-committee discussion or recommendation is not FDA approval and is not itself a final 503A listing. FDA's current 503A page explains that bulks-list decisions are addressed through the agency's notice-and-comment rulemaking process. The current FDA safety-risk page also continues to list BPC-157 among nominated-but-withdrawn substances and says safety information for proposed routes is absent or limited.
            </p>
            <p className="text-muted leading-relaxed">
              <strong>Bottom line:</strong> BPC-157 is not FDA-approved. Do not convert the July advisory meeting, an RUO label, clinic availability, or online sale into a claim of FDA authorization or proven human use.
            </p>
          </div>

          <div id="safety" className="scroll-mt-20">
            <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">Safety Uncertainty</h2>
            <ul className="list-disc pl-5 space-y-2 text-muted leading-relaxed">
              <li>FDA identifies potential immunogenicity, peptide-impurity, and API-characterization concerns for compounded BPC-157.</li>
              <li>FDA says it has no or only limited safety information for proposed routes and lacks sufficient information to know whether the drug would cause harm in humans.</li>
              <li>Human chronic-toxicity, reproductive-safety, carcinogenicity, and route-specific safety data are inadequate for confident long-term use claims.</li>
              <li>Injectable products add sterility, contamination, identity, and strength risks when product quality is uncertain.</li>
            </ul>
          </div>

          <div id="bottom-line" className="scroll-mt-20">
            <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">Bottom Line</h2>
            <p className="text-muted leading-relaxed">
              BPC-157 is a research-interest peptide with substantial preclinical literature and major human evidence gaps. The July 2026 FDA advisory meeting did not turn it into an approved treatment, and FDA's current safety material still emphasizes missing human safety information. This is a research topic to follow, not a protocol to infer from animal studies.
            </p>
          </div>
        </section>

        <div className="mt-8 flex gap-4 flex-wrap">
          <Link href="/guides/" className="text-sm font-medium text-emerald-700 hover:underline">Back to guides &rarr;</Link>
          <Link href="/compounds/bpc-157/" className="text-sm font-medium text-emerald-700 hover:underline">View BPC-157 compound profile &rarr;</Link>
          <Link href="/guides/other/tb-500/" className="text-sm font-medium text-emerald-700 hover:underline">Read the TB-500 guide &rarr;</Link>
        </div>
      </div>
      <References refs={BPC_157_REFS} />
    </ArticleLayout>
  )
}
