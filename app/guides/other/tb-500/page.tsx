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
  title: 'TB-500: Human Evidence, FDA Status, and Safety (2026)',
  description: 'Current evidence-first overview of the TB-500 thymosin-beta-4 fragment, including molecule-specific evidence, the July 2026 FDA advisory meeting, and safety uncertainty.',
  path: '/guides/other/tb-500/',
})

const HEADINGS: Heading[] = [
  { id: 'understanding', text: 'TB-500 vs. Thymosin Beta-4', level: 2 },
  { id: 'evidence', text: 'What the Evidence Can Show', level: 2 },
  { id: 'legal', text: 'FDA & Compounding Status', level: 2 },
  { id: 'safety', text: 'Safety Uncertainty', level: 2 },
  { id: 'bottom-line', text: 'Bottom Line', level: 2 },
]

const TB_500_REFS = [
  { n: 1, text: 'FDA. Certain Bulk Drug Substances for Use in Compounding that May Present Significant Safety Risks.', url: 'https://www.fda.gov/drugs/human-drug-compounding/certain-bulk-drug-substances-use-compounding-may-present-significant-safety-risks' },
  { n: 2, text: 'FDA. July 23-24, 2026 Meeting of the Pharmacy Compounding Advisory Committee.', url: 'https://www.fda.gov/advisory-committees/advisory-committee-calendar/july-23-24-2026-meeting-pharmacy-compounding-advisory-committee-07232026' },
  { n: 3, text: 'FDA. Bulk Drug Substances Used in Compounding Under Section 503A of the FD&C Act.', url: 'https://www.fda.gov/drugs/human-drug-compounding/bulk-drug-substances-used-compounding-under-section-503a-fdc-act' },
  { n: 4, text: 'Goldstein AL, et al. Thymosin beta-4: a multi-functional regenerative peptide. Expert Opin Biol Ther. 2012.', url: 'https://pubmed.ncbi.nlm.nih.gov/22500833/' },
]

export default function Page() {
  const toc = <TableOfContents headings={HEADINGS} />
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Guides', href: '/guides' },
    { label: 'TB-500: Human Evidence, FDA Status, and Safety' },
  ]

  return (
    <ArticleLayout toc={toc} zone="harm-reduction">
      <div className="space-y-8">
        <AuthorityBreadcrumbs items={breadcrumbs} />

        <section className="hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8">
          <p className="eyebrow-label">Experimental Peptide Guide</p>
          <h1 className="mt-2 text-3xl font-semibold text-ink sm:text-4xl">TB-500: Human Evidence, FDA Status, and Safety</h1>
          <p className="detail-reading mt-4 text-muted">
            TB-500 is commonly discussed alongside full-length thymosin beta-4, but they are not interchangeable evidence targets. This guide keeps the fragment, the broader Tβ4 literature, and current FDA status separate.
          </p>
          <figure className="mt-6">
            <div className="overflow-hidden rounded-2xl border border-brand-900/10 shadow-sm bg-white">
              <Image src="/images/guides/tb-500.jpg" alt="A research peptide vial with a sterile syringe on a clinical surface" width={1536} height={1024} priority className="w-full h-auto" />
            </div>
            <figcaption className="mt-3 text-center text-sm text-muted">TB-500 — experimental fragment research, not established human therapy.</figcaption>
          </figure>
        </section>

        <section className="rounded-2xl border border-rose-900/15 bg-rose-50/80 p-5 text-sm leading-6 text-rose-950">
          <p className="font-semibold">Unapproved-drug notice</p>
          <p className="mt-2">TB-500 is not an FDA-approved drug product. An RUO label or online sale does not establish approval, clinical effectiveness, product quality, or suitability for human use.</p>
        </section>

        <AffiliateDisclosure />

        <section className="prose-section space-y-6">
          <div className="card-premium p-6">
            <p className="text-sm font-semibold text-brand-700 uppercase tracking-wide">Review status</p>
            <p className="mt-3 text-sm text-muted">Regulatory wording reviewed August 12, 2026 against current FDA compounding and advisory-committee material.</p>
          </div>

          <div id="understanding" className="scroll-mt-20">
            <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">TB-500 vs. Thymosin Beta-4</h2>
            <p className="text-muted leading-relaxed">
              Full-length thymosin beta-4 (Tβ4) is a naturally occurring 43-amino-acid peptide with a substantial preclinical research literature. FDA's current compounding safety page identifies <strong>TB-500 as the thymosin beta-4 fragment LKKTETQ</strong>. Evidence for full-length Tβ4 should not be silently presented as human efficacy or safety evidence for the TB-500 fragment.
            </p>
          </div>

          <div id="evidence" className="scroll-mt-20">
            <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">What the Evidence Can Show</h2>
            <ul className="list-disc pl-5 space-y-2 text-muted leading-relaxed">
              <li><strong>Full-length Tβ4:</strong> animal and early research programs examine cell migration, wound repair, angiogenesis, cardiac injury, and other tissue-repair pathways.</li>
              <li><strong>TB-500 fragment:</strong> the direct human evidence base is much thinner than the broader Tβ4 literature often cited in marketing.</li>
              <li><strong>Human exposure:</strong> FDA says it has not identified human exposure data for drug products containing the TB-500 fragment.</li>
              <li><strong>Sports-recovery claims:</strong> controlled human evidence does not establish that TB-500 accelerates tendon, ligament, or muscle recovery in athletes.</li>
            </ul>
            <p className="text-muted leading-relaxed"><strong>Evidence quality: preliminary and molecule-sensitive.</strong> Parent-peptide biology is not proof for the marketed fragment.</p>
          </div>

          <div id="legal" className="scroll-mt-20">
            <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">FDA &amp; Compounding Status (August 2026)</h2>
            <p className="text-muted leading-relaxed">
              FDA's Pharmacy Compounding Advisory Committee met on <strong>July 23, 2026</strong> and discussed TB-500-related bulk drug substances for possible inclusion on the section 503A Bulks List. The meeting is no longer an upcoming event.
            </p>
            <p className="text-muted leading-relaxed">
              Advisory-committee consideration does not equal FDA approval or final inclusion on the 503A Bulks List. FDA's current 503A page describes the bulks-list process as agency rulemaking, and its current safety-risk page continues to list the TB-500 fragment among nominated-but-withdrawn substances with significant information gaps.
            </p>
            <p className="text-muted leading-relaxed"><strong>Bottom line:</strong> TB-500 is not FDA-approved. Do not turn the July advisory meeting, an RUO label, or product availability into a claim of legal authorization or established clinical use.</p>
          </div>

          <div id="safety" className="scroll-mt-20">
            <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">Safety Uncertainty</h2>
            <ul className="list-disc pl-5 space-y-2 text-muted leading-relaxed">
              <li>FDA flags potential immunogenicity, aggregation, and peptide-related impurity concerns for compounded drug products containing the TB-500 fragment.</li>
              <li>FDA says it has not identified human exposure data for drug products containing the fragment and lacks important information about whether it would cause harm in humans.</li>
              <li>Safety findings from full-length Tβ4 cannot automatically be transferred to a different fragment, formulation, dose, or route.</li>
              <li>Injectable products add sterility, contamination, identity, and strength risks when product quality is uncertain.</li>
            </ul>
          </div>

          <div id="bottom-line" className="scroll-mt-20">
            <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">Bottom Line</h2>
            <p className="text-muted leading-relaxed">
              TB-500 is often marketed using the scientific credibility of full-length thymosin beta-4, but the fragment has a much thinner direct human evidence trail. The July 2026 FDA advisory meeting did not make it an approved therapy, and FDA's current safety page still emphasizes missing human exposure and safety information.
            </p>
          </div>
        </section>

        <div className="mt-8 flex gap-4 flex-wrap">
          <Link href="/guides/" className="text-sm font-medium text-emerald-700 hover:underline">Back to guides &rarr;</Link>
          <Link href="/compounds/tb-500/" className="text-sm font-medium text-emerald-700 hover:underline">View TB-500 compound profile &rarr;</Link>
          <Link href="/guides/other/bpc-157/" className="text-sm font-medium text-emerald-700 hover:underline">Read the BPC-157 guide &rarr;</Link>
        </div>
      </div>
      <References refs={TB_500_REFS} />
    </ArticleLayout>
  )
}
