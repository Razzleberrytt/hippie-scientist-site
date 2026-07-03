import { buildPageMetadata } from '../../../../src/lib/seo'
import Image from 'next/image'
import type { Metadata } from 'next'
import Link from 'next/link'
import AffiliateDisclosure from '../../../../components/AffiliateDisclosure'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import { ArticleLayout, TableOfContents } from '@/components/articles'
import type { Heading } from '@/components/articles'

export const metadata: Metadata = buildPageMetadata({
  title: 'TB-500 (Thymosin Beta-4): Benefits, Evidence, Legal Status, and Safety',
  description: 'Evidence-based overview of TB-500 — actin-binding mechanism, recovery/repair research, FDA compounding status update, and safety.',
  path: '/guides/other/tb-500/',
})

const HEADINGS: Heading[] = [
  { id: 'understanding', text: 'What Is TB-500?', level: 2 },
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
    { label: 'TB-500 (Thymosin Beta-4): Benefits, Evidence, Legal Status, and Safety' },
  ]

  return (
    <ArticleLayout toc={toc} zone="harm-reduction">
    <div className="space-y-8">
      <AuthorityBreadcrumbs items={breadcrumbs} />

      <section className="hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8">
        <p className="eyebrow-label">Peptide &amp; Compound Guide</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink sm:text-4xl">TB-500 (Thymosin Beta-4): Benefits, Evidence, Legal Status, and Safety</h1>
        <p className="detail-reading mt-4 text-muted">Evidence-based overview of TB-500 — actin-binding mechanism, recovery/repair research, FDA compounding status update, and safety.</p>

        <figure className="mt-6">
          <div className="overflow-hidden rounded-2xl border border-brand-900/10 shadow-sm bg-white">
            <Image
              src="/images/guides/tb-500.jpg"
              alt="A research peptide vial with a sterile syringe on a clinical surface"
              width={1536}
              height={1024}
              priority
              className="w-full h-auto"
            />
          </div>
          <figcaption className="mt-3 text-center text-sm text-muted">
            TB-500 — an educational, research-use-only overview.
          </figcaption>
        </figure>
      </section>

      <section className="rounded-2xl border border-rose-900/15 bg-rose-50/80 p-5 text-sm leading-6 text-rose-950">
        <p className="font-semibold">Research-use-only (RUO) notice</p>
        <p className="mt-2">
          TB-500 is not FDA-approved for human use. This page is educational only, does not endorse purchase or use, and is not medical or legal advice. Its FDA compounding status is actively evolving — verify against current FDA guidance before drawing conclusions.
        </p>
      </section>

      <AffiliateDisclosure />

      <section className="prose-section space-y-6">
        <div className="card-premium p-6">
          <p className="text-sm font-semibold text-brand-700 uppercase tracking-wide">Important Disclaimer</p>
          <p className="mt-3 text-sm text-muted">This guide is for informational purposes only and does not constitute medical advice. TB-500 is not FDA-approved. Consult a licensed physician before considering any peptide therapy. Content last reviewed for regulatory accuracy: June 30, 2026.</p>
        </div>

        <div id="understanding" className="scroll-mt-20">
          <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">What Is TB-500?</h2>
          <p className="text-muted leading-relaxed">
            TB-500 is a synthetic fragment of thymosin beta-4 (Tβ4), a naturally occurring peptide found in nearly all human and animal cells. It's marketed primarily around muscle recovery, flexibility, and connective-tissue repair. TB-500 is often discussed alongside BPC-157, and the two are frequently stacked in gray-market use, though they act through different mechanisms.
          </p>
          <p className="text-muted leading-relaxed">
            TB-500 is <strong>not FDA-approved</strong> for human use.
          </p>
        </div>

        <div id="mechanism" className="scroll-mt-20">
          <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">Mechanism of Action</h2>
          <p className="text-muted leading-relaxed">
            Tβ4/TB-500's proposed mechanism centers on actin regulation:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-muted leading-relaxed">
            <li><strong>Actin binding</strong> — Tβ4 binds monomeric G-actin, a core structural protein involved in cell migration, shape, and repair. This is thought to be central to its wound-healing effects.</li>
            <li><strong>Cell migration promotion</strong> — supports migration of endothelial cells, keratinocytes, and other repair-related cell types to injury sites</li>
            <li><strong>Angiogenesis support</strong> — like BPC-157, associated with new blood vessel formation in animal injury models</li>
            <li><strong>Anti-fibrotic signaling</strong> — some animal data suggests reduced scar tissue formation after injury</li>
          </ul>
        </div>

        <div id="evidence" className="scroll-mt-20">
          <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">What the Evidence Shows</h2>
          <ul className="list-disc pl-5 space-y-2 text-muted leading-relaxed">
            <li><span className="font-semibold text-ink">Wound healing:</span> Animal studies (including full-thickness skin wounds) show accelerated closure and reduced inflammation with Tβ4 administration.</li>
            <li><span className="font-semibold text-ink">Cardiac tissue:</span> Some rodent cardiac-injury models show reduced fibrosis and improved cardiomyocyte survival — this is one of the more researched applications of the underlying Tβ4 molecule specifically (separate from the synthetic fragment sold as “TB-500,” which has a smaller and less-established evidence base).</li>
            <li><span className="font-semibold text-ink">Tendon/ligament:</span> Limited animal data suggests possible benefit in soft-tissue repair, similar rationale to BPC-157.</li>
            <li><span className="font-semibold text-ink">Human data:</span> No completed large-scale human RCTs on TB-500 specifically. Human evidence is essentially anecdotal or drawn from the broader (and more established) Tβ4 cardiac-repair literature, which studied a related but distinct molecule and delivery context.</li>
          </ul>
          <p className="text-muted leading-relaxed">
            <strong>Evidence quality: preliminary.</strong> The underlying Tβ4 biology has real scientific grounding; TB-500 the synthetic fragment product, as sold in the gray market, has a much thinner direct evidence trail.
          </p>
        </div>

        <div id="legal" className="scroll-mt-20">
          <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">Legal & Regulatory Status (Updated June 2026)</h2>
          <ul className="list-disc pl-5 space-y-2 text-muted leading-relaxed">
            <li><span className="font-semibold text-ink">2023–April 2026:</span> TB-500 was on the FDA's Category 2 restricted 503A bulk substances list, alongside BPC-157 and 17 other peptides — compounding pharmacies were barred from preparing it.</li>
            <li><span className="font-semibold text-ink">April 2026:</span> TB-500 was removed from Category 2, entering the same regulatory gray zone as BPC-157: not banned, not yet approved for compounding.</li>
            <li><span className="font-semibold text-ink">July 23, 2026:</span> TB-500 is on the FDA Pharmacy Compounding Advisory Committee's agenda (alongside BPC-157, KPV, and MOTS-C) for a formal 503A eligibility review.</li>
          </ul>
          <p className="text-muted leading-relaxed">
            <strong>Bottom line:</strong> TB-500 is not an FDA-approved drug. Its compounding-pharmacy legal status is unresolved pending the July 2026 PCAC review. Product sold online is almost universally labeled “research use only,” meaning it is not legally intended for human consumption regardless of marketing claims you may see elsewhere.
          </p>
        </div>

        <div id="safety" className="scroll-mt-20">
          <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">Safety Considerations</h2>
          <ul className="list-disc pl-5 space-y-2 text-muted leading-relaxed">
            <li>No controlled human safety data exists for the synthetic TB-500 fragment specifically.</li>
            <li>Theoretical concern: because Tβ4 supports angiogenesis and cell migration broadly, some researchers have raised caution around use in anyone with a personal or family history of cancer, given the general biological plausibility of growth-promoting peptides interacting with abnormal cell growth — this has not been demonstrated for TB-500 in humans, but it's a reason for physician oversight rather than self-directed use.</li>
            <li>RUO-sourced product carries the same purity/sterility/mislabeling risks common across the gray-market peptide industry.</li>
          </ul>
        </div>

        <div id="bottom-line" className="scroll-mt-20">
          <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">Bottom Line</h2>
          <p className="text-muted leading-relaxed">
            TB-500 borrows credibility from the genuinely interesting Tβ4 wound-healing literature, but the synthetic fragment sold under this name has thin direct evidence and an unresolved regulatory status. Treat it as an actively-reviewed compound to watch, not an established therapeutic.
          </p>
        </div>

      </section>

      <div className="mt-8 flex gap-4 flex-wrap">
        <Link href="/guides/" className="text-sm font-medium text-emerald-700 hover:underline">Back to guides &rarr;</Link>
        <Link href="/compounds/tb-500" className="text-sm font-medium text-emerald-700 hover:underline">View TB-500 compound profile &rarr;</Link>
        <Link href="/guides/other/bpc-157/" className="text-sm font-medium text-emerald-700 hover:underline">Read the BPC-157 guide &rarr;</Link>

      </div>
    </div>
    </ArticleLayout>
  )
}
