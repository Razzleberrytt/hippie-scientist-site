import { buildPageMetadata } from '../../../../src/lib/seo'
import Image from 'next/image'
import type { Metadata } from 'next'
import Link from 'next/link'
import AffiliateDisclosure from '../../../../components/AffiliateDisclosure'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import { ArticleLayout, TableOfContents } from '@/components/articles'
import type { Heading } from '@/components/articles'
import References from '@/components/References'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'

export const metadata: Metadata = buildPageMetadata({
  title: 'TB-500: Human Evidence, FDA Status, and Safety (2026)',
  description: 'Current evidence-first overview of the TB-500 thymosin-beta-4 fragment, including molecule-specific evidence, the July 2026 FDA advisory review, and safety uncertainty.',
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
  { n: 1, text: 'FDA. Certain Bulk Drug Substances for Use in Compounding that May Present Significant Safety Risks. Current TB-500 / thymosin beta-4 fragment safety entry.', url: 'https://www.fda.gov/drugs/human-drug-compounding/certain-bulk-drug-substances-use-compounding-may-present-significant-safety-risks' },
  { n: 2, text: 'FDA. July 23-24, 2026 Meeting of the Pharmacy Compounding Advisory Committee. TB-500 free base / acetate were evaluated for wound healing.', url: 'https://www.fda.gov/advisory-committees/advisory-committee-calendar/july-23-24-2026-meeting-pharmacy-compounding-advisory-committee-07232026' },
  { n: 3, text: 'FDA. Bulk Drug Substances Used in Compounding Under Section 503A of the FD&C Act. Current bulks-list framework and rulemaking process.', url: 'https://www.fda.gov/drugs/human-drug-compounding/bulk-drug-substances-used-compounding-under-section-503a-fdc-act' },
  { n: 4, text: 'Goldstein AL, et al. Thymosin beta-4: a multi-functional regenerative peptide. Expert Opin Biol Ther. 2012. PMID 22500833. Review concerns full-length thymosin beta-4, not direct human efficacy of marketed TB-500 fragment products.', url: 'https://pubmed.ncbi.nlm.nih.gov/22500833/', pmid: '22500833' },
  { n: 5, text: 'FDA. Understanding the Risks of Compounded Drugs. Compounded drugs are not FDA-approved and are not reviewed for safety, effectiveness, or quality before marketing.', url: 'https://www.fda.gov/drugs/human-drug-compounding/understanding-risks-compounded-drugs' },
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
        <AuthorityJsonLd
          title="TB-500: Human Evidence, FDA Status, and Safety (2026)"
          description="Evidence and regulatory review of TB-500 that keeps the marketed thymosin-beta-4 fragment distinct from full-length thymosin beta-4 research."
          url="https://thehippiescientist.net/guides/other/tb-500/"
          type="MedicalWebPage"
          citationUrls={TB_500_REFS.map(reference => reference.url)}
        />
        <AuthorityBreadcrumbs items={breadcrumbs} />

        <section className="hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8">
          <p className="eyebrow-label">Experimental Peptide Guide · Reviewed August 16, 2026</p>
          <h1 className="mt-2 text-3xl font-semibold text-ink sm:text-4xl">TB-500: Human Evidence, FDA Status, and Safety</h1>
          <p className="detail-reading mt-4 text-muted">
            TB-500 is commonly discussed alongside full-length thymosin beta-4, but they are not interchangeable evidence targets. This guide keeps the marketed fragment, the broader Tβ4 literature, and current FDA status separate.
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
          <p className="mt-2">TB-500 is not an FDA-approved drug product. Advisory-committee review, an RUO label, online sale, or a compounded preparation does not establish FDA approval, clinical effectiveness, product quality, or suitability for human use [2,3,5].</p>
        </section>

        <AffiliateDisclosure />

        <section className="prose-section space-y-6">
          <div id="understanding" className="scroll-mt-20">
            <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">TB-500 vs. Thymosin Beta-4</h2>
            <p className="text-muted leading-relaxed">
              Full-length thymosin beta-4 (Tβ4) is a naturally occurring 43-amino-acid peptide with a substantial preclinical research literature. FDA's current compounding safety page identifies <strong>TB-500 as the thymosin beta-4 fragment LKKTETQ</strong>. Evidence for full-length Tβ4 should not be silently presented as human efficacy or safety evidence for the TB-500 fragment [1,4].
            </p>
          </div>

          <section id="evidence" data-answer-engine-table="true" className="scroll-mt-20 space-y-4">
            <h2 className="text-2xl font-semibold text-ink">What the Evidence Can Show</h2>
            <div className="overflow-x-auto rounded-2xl border border-brand-900/10">
              <table className="w-full min-w-[820px] text-left text-sm">
                <caption className="sr-only">TB-500 evidence applicability by evidence target</caption>
                <thead className="bg-brand-50/70 text-ink">
                  <tr><th scope="col" className="p-3">Evidence target</th><th scope="col" className="p-3">What exists</th><th scope="col" className="p-3">What it supports</th><th scope="col" className="p-3">What it does not support</th></tr>
                </thead>
                <tbody className="divide-y divide-brand-900/10 text-muted">
                  <tr><th scope="row" className="p-3 font-semibold text-ink">Full-length Tβ4</th><td className="p-3">Broad preclinical and translational literature [4]</td><td className="p-3">Biologic hypotheses involving migration, repair, angiogenesis, and injury models</td><td className="p-3">Direct efficacy or safety of the TB-500 fragment</td></tr>
                  <tr><th scope="row" className="p-3 font-semibold text-ink">TB-500 fragment</th><td className="p-3">Much thinner molecule-specific evidence</td><td className="p-3">A reason to study the fragment separately</td><td className="p-3">A validated human treatment effect</td></tr>
                  <tr><th scope="row" className="p-3 font-semibold text-ink">Human exposure</th><td className="p-3">FDA says it has not identified human exposure data for drug products containing the fragment [1]</td><td className="p-3">Evidence that a major safety-information gap remains</td><td className="p-3">A human dose, adverse-event rate, or long-term safety profile</td></tr>
                  <tr><th scope="row" className="p-3 font-semibold text-ink">Wound healing</th><td className="p-3">FDA reviewed TB-500-related substances for this proposed use at the July 2026 PCAC meeting [2]</td><td className="p-3">Regulatory/scientific review of the nomination</td><td className="p-3">FDA approval or established efficacy</td></tr>
                  <tr><th scope="row" className="p-3 font-semibold text-ink">Sports recovery</th><td className="p-3">No robust controlled human outcome program identified for marketed fragment use</td><td className="p-3">Uncertainty</td><td className="p-3">Claims that TB-500 reliably accelerates tendon, ligament, or muscle recovery</td></tr>
                </tbody>
              </table>
            </div>
            <p className="text-muted leading-relaxed"><strong>Evidence quality: preliminary and molecule-sensitive.</strong> Parent-peptide biology is not proof for the marketed fragment.</p>
          </section>

          <section id="legal" data-answer-engine-table="true" className="scroll-mt-20 space-y-4">
            <h2 className="text-2xl font-semibold text-ink">FDA &amp; Compounding Status — checked August 16, 2026</h2>
            <p className="text-muted leading-relaxed">
              FDA's Pharmacy Compounding Advisory Committee reviewed TB-500 free base and TB-500 acetate on July 23, 2026 for the nominated use of wound healing [2]. FDA also states that advisory committees make non-binding recommendations. Committee consideration therefore should not be translated into FDA approval or a final 503A-list action.
            </p>
            <div className="overflow-x-auto rounded-2xl border border-brand-900/10">
              <table className="w-full min-w-[760px] text-left text-sm">
                <caption className="sr-only">TB-500 regulatory status as of August 16, 2026</caption>
                <thead className="bg-brand-50/70 text-ink"><tr><th scope="col" className="p-3">Statement</th><th scope="col" className="p-3">Status</th><th scope="col" className="p-3">Why</th></tr></thead>
                <tbody className="divide-y divide-brand-900/10 text-muted">
                  <tr><th scope="row" className="p-3 font-semibold text-ink">TB-500 is FDA-approved</th><td className="p-3 font-semibold">No</td><td className="p-3">No approved TB-500 drug product is established by the cited FDA record [1-3]</td></tr>
                  <tr><th scope="row" className="p-3 font-semibold text-ink">PCAC reviewed TB-500-related substances</th><td className="p-3 font-semibold">Yes</td><td className="p-3">July 23, 2026 meeting; wound healing was the evaluated use [2]</td></tr>
                  <tr><th scope="row" className="p-3 font-semibold text-ink">PCAC activity equals a final 503A rule</th><td className="p-3 font-semibold">No</td><td className="p-3">FDA describes 503A-list decisions as a separate agency rulemaking process [2,3]</td></tr>
                  <tr><th scope="row" className="p-3 font-semibold text-ink">Compounded TB-500 would be FDA-approved</th><td className="p-3 font-semibold">No</td><td className="p-3">Compounded drugs are not FDA-approved before marketing [5]</td></tr>
                  <tr><th scope="row" className="p-3 font-semibold text-ink">RUO / online availability proves lawful clinical use</th><td className="p-3 font-semibold">No</td><td className="p-3">Availability is not an approval, efficacy, quality, or legal-status determination</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <div id="safety" className="scroll-mt-20">
            <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">Safety Uncertainty</h2>
            <ul className="list-disc pl-5 space-y-2 text-muted leading-relaxed">
              <li>FDA flags potential immunogenicity for certain routes because of aggregation and peptide-related impurity concerns [1].</li>
              <li>FDA says it has not identified human exposure data for drug products containing the TB-500 fragment and lacks important information about whether it would cause harm in humans [1].</li>
              <li>Safety findings from full-length Tβ4 cannot automatically be transferred to a different fragment, formulation, dose, or route.</li>
              <li>Injectable compounded or gray-market products add identity, sterility, contamination, strength, and handling risks that efficacy studies do not resolve [5].</li>
            </ul>
          </div>

          <div id="bottom-line" className="scroll-mt-20">
            <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">Bottom Line</h2>
            <p className="text-muted leading-relaxed">
              TB-500 is often marketed using the scientific credibility of full-length thymosin beta-4, but the fragment has a much thinner direct human evidence trail. The July 2026 FDA advisory review did not make it an approved therapy, and FDA's current safety page still emphasizes missing human exposure and safety information [1,2].
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
