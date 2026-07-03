import { buildPageMetadata } from '../../../../src/lib/seo'
import Image from 'next/image'
import type { Metadata } from 'next'
import Link from 'next/link'
import AffiliateDisclosure from '../../../../components/AffiliateDisclosure'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import { ArticleLayout, TableOfContents } from '@/components/articles'
import type { Heading } from '@/components/articles'

export const metadata: Metadata = buildPageMetadata({
  title: 'BPC-157: Benefits, Evidence, Legal Status, and Safety (2026)',
  description: 'An evidence-based look at BPC-157 — mechanism, preclinical research, current FDA compounding status, and safety considerations.',
  path: '/guides/other/bpc-157/',
})

const HEADINGS: Heading[] = [
  { id: 'understanding', text: 'What Is BPC-157?', level: 2 },
  { id: 'mechanism', text: 'Mechanism of Action', level: 2 },
  { id: 'evidence', text: 'What the Evidence Shows', level: 2 },
  { id: 'legal', text: 'Legal & Regulatory Status', level: 2 },
  { id: 'safety', text: 'Safety Considerations', level: 2 },
  { id: 'bottom-line', text: 'Bottom Line', level: 2 },
]

export default function Page() {
  const toc = <TableOfContents headings={HEADINGS} />

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Guides', href: '/guides' },
    { label: 'BPC-157: Benefits, Evidence, Legal Status, and Safety' },
  ]

  return (
    <ArticleLayout toc={toc} zone="harm-reduction">
    <div className="space-y-8">
      <AuthorityBreadcrumbs items={breadcrumbs} />

      <section className="hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8">
        <p className="eyebrow-label">Peptide &amp; Compound Guide</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink sm:text-4xl">BPC-157: Benefits, Evidence, Legal Status, and Safety</h1>
        <p className="detail-reading mt-4 text-muted">An evidence-based look at BPC-157 — mechanism, preclinical research, current FDA compounding status, and safety considerations.</p>

        <figure className="mt-6">
          <div className="overflow-hidden rounded-2xl border border-brand-900/10 shadow-sm bg-white">
            <Image
              src="/images/guides/bpc-157.jpg"
              alt="A glass vial of lyophilized research peptide powder in a lab setting"
              width={1536}
              height={1024}
              priority
              className="w-full h-auto"
            />
          </div>
          <figcaption className="mt-3 text-center text-sm text-muted">
            BPC-157 — an educational, research-use-only overview.
          </figcaption>
        </figure>
      </section>

      <section className="rounded-2xl border border-rose-900/15 bg-rose-50/80 p-5 text-sm leading-6 text-rose-950">
        <p className="font-semibold">Research-use-only (RUO) notice</p>
        <p className="mt-2">
          BPC-157 is not FDA-approved as a finished drug product. This page is educational only, does not endorse purchase or use, and is not medical or legal advice. Its FDA compounding status is actively evolving — verify against current FDA guidance before drawing conclusions.
        </p>
      </section>

      <AffiliateDisclosure />

      <section className="prose-section space-y-6">
        <div className="card-premium p-6">
          <p className="text-sm font-semibold text-brand-700 uppercase tracking-wide">Important Disclaimer</p>
          <p className="mt-3 text-sm text-muted">This guide is for informational purposes only and does not constitute medical advice. BPC-157 is not FDA-approved. Consult a licensed physician before considering any peptide therapy. Content last reviewed for regulatory accuracy: June 30, 2026.</p>
        </div>

        <div id="understanding" className="scroll-mt-20">
          <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">What Is BPC-157?</h2>
          <p className="text-muted leading-relaxed">
            BPC-157 (Body Protection Compound-157) is a synthetic 15-amino-acid peptide derived from a partial sequence found in human gastric juice. It's one of the most widely discussed peptides in the recovery and longevity space, generally studied for its potential role in gut healing, tendon and ligament repair, and inflammation modulation.
          </p>
          <p className="text-muted leading-relaxed">
            BPC-157 is <strong>not an FDA-approved drug</strong>. There is no commercially available, FDA-approved product containing it.
          </p>
        </div>

        <div id="mechanism" className="scroll-mt-20">
          <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">Mechanism of Action</h2>
          <p className="text-muted leading-relaxed">
            Preclinical research suggests BPC-157 may act through several overlapping pathways:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-muted leading-relaxed">
            <li><strong>Angiogenesis promotion</strong> — upregulation of VEGFR2 expression, supporting new blood vessel formation in damaged tissue</li>
            <li><strong>Nitric oxide system modulation</strong> — interaction with the NO pathway, implicated in vascular and gut-lining repair</li>
            <li><strong>Growth factor interaction</strong> — influence on the FAK-paxillin pathway involved in cell migration and wound healing</li>
            <li><strong>Anti-inflammatory signaling</strong> — reduced pro-inflammatory cytokine activity in some animal models</li>
          </ul>
          <p className="text-muted leading-relaxed">
            Almost all mechanistic data comes from rodent and <em>in vitro</em> studies. Human mechanistic confirmation is lacking.
          </p>
        </div>

        <div id="evidence" className="scroll-mt-20">
          <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">What the Evidence Shows</h2>
          <ul className="list-disc pl-5 space-y-2 text-muted leading-relaxed">
            <li><span className="font-semibold text-ink">Gut healing:</span> Animal models show accelerated healing of gastric ulcers, fistulas, and inflammatory bowel-type injury.</li>
            <li><span className="font-semibold text-ink">Tendon/ligament repair:</span> Rat studies report improved healing of transected Achilles tendons and ligament injuries when BPC-157 was administered locally or systemically.</li>
            <li><span className="font-semibold text-ink">Muscle injury:</span> Some rodent data suggests faster recovery from crush and laceration injuries.</li>
            <li><span className="font-semibold text-ink">Human data:</span> Human clinical trial data is essentially absent. Most human-facing claims are extrapolated from animal models, physician case reports, or anecdotal self-reported use. Treat any specific human dosing claim you encounter online with skepticism — it is not derived from controlled human trials.</li>
          </ul>
          <p className="text-muted leading-relaxed">
            <strong>Evidence quality: preliminary/preclinical.</strong> This is not a “well-studied” compound in the way many herbs on this site are; it's a promising research molecule with a thin human evidence base.
          </p>
        </div>

        <div id="legal" className="scroll-mt-20">
          <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">Legal & Regulatory Status (Updated June 2026)</h2>
          <p className="text-muted leading-relaxed">
            BPC-157's regulatory status has changed significantly in 2026 and is still in motion:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-muted leading-relaxed">
            <li><span className="font-semibold text-ink">2023–April 2026:</span> The FDA placed BPC-157 on its Category 2 list of the 503A bulk drug substances list, effectively prohibiting licensed compounding pharmacies from preparing it.</li>
            <li><span className="font-semibold text-ink">April 22, 2026:</span> The FDA removed BPC-157 from Category 2. This is <em>not</em> the same as approving it — it moved BPC-157 into a regulatory gray zone: no longer explicitly banned from compounding, but not yet on the Category 1 “approved to compound” list either.</li>
            <li><span className="font-semibold text-ink">July 23–24, 2026:</span> The FDA's Pharmacy Compounding Advisory Committee (PCAC) is scheduled to formally review BPC-157 (alongside KPV, TB-500, and MOTS-C) for potential 503A compounding eligibility.</li>
            <li><span className="font-semibold text-ink">World Anti-Doping Agency (WADA):</span> BPC-157 remains banned under WADA's S0 (non-approved substances) category year-round, in and out of competition. This is unaffected by the FDA compounding status change.</li>
          </ul>
          <p className="text-muted leading-relaxed">
            <strong>Bottom line:</strong> As of this writing, BPC-157 is not FDA-approved, cannot be legally sold as a finished drug product for human use, and sits in regulatory limbo for compounding pharmacies pending the July 2026 PCAC decision. Products sold as “research use only” (RUO) are not legally intended or labeled for human consumption. This status is actively evolving — verify against current FDA guidance before drawing conclusions.
          </p>
        </div>

        <div id="safety" className="scroll-mt-20">
          <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">Safety Considerations</h2>
          <ul className="list-disc pl-5 space-y-2 text-muted leading-relaxed">
            <li>No large-scale human safety trials exist. Long-term safety in humans is unknown.</li>
            <li>Animal toxicology studies to date have not identified major red flags at studied doses, but this does not establish human safety.</li>
            <li>Because most BPC-157 available for purchase is sold RUO, sourced product purity, sterility, and actual peptide content are not independently verified or regulated. Contamination and mislabeling are documented risks in the gray-market research peptide industry.</li>
            <li>Anyone considering BPC-157 for a therapeutic purpose should do so only under the guidance of a licensed physician, ideally through a legitimate compounding pathway once regulatory status clarifies — not through unregulated online vendors.</li>
          </ul>
        </div>

        <div id="bottom-line" className="scroll-mt-20">
          <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">Bottom Line</h2>
          <p className="text-muted leading-relaxed">
            BPC-157 has genuinely interesting preclinical data for tissue repair, but the human evidence base is thin, the regulatory status is unsettled, and the RUO supply chain carries real quality-control risk. This is a “watch closely” compound, not a “well-established” one — its FDA compounding status is likely to be clarified by the July 2026 PCAC decision.
          </p>
        </div>

      </section>

      <div className="mt-8 flex gap-4 flex-wrap">
        <Link href="/guides/" className="text-sm font-medium text-emerald-700 hover:underline">Back to guides &rarr;</Link>
        <Link href="/compounds/bpc-157" className="text-sm font-medium text-emerald-700 hover:underline">View BPC-157 compound profile &rarr;</Link>
        <Link href="/guides/other/tb-500/" className="text-sm font-medium text-emerald-700 hover:underline">Read the TB-500 guide &rarr;</Link>

      </div>
    </div>
    </ArticleLayout>
  )
}
