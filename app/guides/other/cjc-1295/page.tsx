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
  title: 'CJC-1295: GHRH Analog Benefits, Evidence, and Legal Status',
  description: 'Evidence-based overview of CJC-1295, a growth hormone releasing hormone (GHRH) analog — mechanism, DAC vs. no-DAC forms, research, and current legal status.',
  path: '/guides/other/cjc-1295/',
})

const HEADINGS: Heading[] = [
  { id: 'understanding', text: 'What Is CJC-1295?', level: 2 },
  { id: 'mechanism', text: 'Mechanism of Action', level: 2 },
  { id: 'evidence', text: 'What the Evidence Shows', level: 2 },
  { id: 'legal', text: 'Legal & Regulatory Status', level: 2 },
  { id: 'safety', text: 'Safety Considerations', level: 2 },
  { id: 'bottom-line', text: 'Bottom Line', level: 2 },
]

const CJC_1295_REFS = [
  { n: 1, text: 'Teichman SL, et al. (2006). Prolonged stimulation of GH and IGF-1 by CJC-1295. J Clin Endocrinol Metab, 91(3): 799-805.', url: 'https://pubmed.ncbi.nlm.nih.gov/16352683/' },
  { n: 2, text: 'Sackmann-Sala L, et al. (2011). Heterogeneity of GH responsiveness to GHRH analogs. Endocrinology, 152(9): 3442-3450.', url: 'https://pubmed.ncbi.nlm.nih.gov/21712363/' },
]

export default function Page() {
  const toc = <TableOfContents headings={HEADINGS} />

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Guides', href: '/guides' },
    { label: 'CJC-1295: GHRH Analog Benefits, Evidence, and Legal Status' },
  ]

  return (
    <ArticleLayout toc={toc} zone="harm-reduction">
    <div className="space-y-8">
      <AuthorityBreadcrumbs items={breadcrumbs} />

      <section className="hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8">
        <p className="eyebrow-label">Peptide &amp; Compound Guide</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink sm:text-4xl">CJC-1295: GHRH Analog Benefits, Evidence, and Legal Status</h1>
        <p className="detail-reading mt-4 text-muted">Evidence-based overview of CJC-1295, a growth hormone releasing hormone (GHRH) analog — mechanism, DAC vs. no-DAC forms, research, and current legal status.</p>

        <figure className="mt-6">
          <div className="overflow-hidden rounded-2xl border border-brand-900/10 shadow-sm bg-white">
            <Image
              src="/images/guides/cjc-1295.jpg"
              alt="A glass vial of lyophilized research peptide powder in a lab setting"
              width={1536}
              height={1024}
              priority
              className="w-full h-auto"
            />
          </div>
          <figcaption className="mt-3 text-center text-sm text-muted">
            CJC-1295 — an educational, research-use-only overview.
          </figcaption>
        </figure>
      </section>

      <section className="rounded-2xl border border-rose-900/15 bg-rose-50/80 p-5 text-sm leading-6 text-rose-950">
        <p className="font-semibold">Research-use-only (RUO) notice</p>
        <p className="mt-2">
          CJC-1295 is not FDA-approved for any human use. This page is educational only, does not endorse purchase or use, and is not medical or legal advice. Its compounding-pharmacy pathway is currently uncertain — verify against current FDA guidance before drawing conclusions.
        </p>
      </section>

      <AffiliateDisclosure />

      <section className="prose-section space-y-6">
        <div className="card-premium p-6">
          <p className="text-sm font-semibold text-brand-700 uppercase tracking-wide">Important Disclaimer</p>
          <p className="mt-3 text-sm text-muted">This guide is for informational purposes only and does not constitute medical advice. CJC-1295 is not FDA-approved. Consult a licensed physician before considering any peptide therapy. Content last reviewed for regulatory accuracy: June 30, 2026.</p>
        </div>

        <div id="understanding" className="scroll-mt-20">
          <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">What Is CJC-1295?</h2>
          <p className="text-muted leading-relaxed">
            CJC-1295 is a synthetic analog of growth hormone releasing hormone (GHRH), engineered for a longer half-life than natural GHRH. It works upstream of growth hormone secretagogues like Ipamorelin — rather than triggering GH release via the ghrelin receptor, it acts directly on GHRH receptors in the pituitary, and the two are commonly combined in gray-market protocols to produce a larger, more sustained GH pulse than either compound alone.
          </p>
          <p className="text-muted leading-relaxed">
            There are two distinct forms sold under this name, and they are not interchangeable:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-muted leading-relaxed">
            <li><strong>CJC-1295 with DAC</strong> (Drug Affinity Complex) — modified to bind serum albumin, extending its half-life to several days and producing sustained, non-pulsatile GH/IGF-1 elevation</li>
            <li><strong>CJC-1295 without DAC</strong> (also sold as “Mod GRF 1-29”) — a shorter-acting form with a half-life of roughly 30 minutes, producing a more natural pulsatile GH release closer to the body's endogenous pattern</li>
          </ul>
        </div>

        <div id="mechanism" className="scroll-mt-20">
          <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">Mechanism of Action</h2>
          <ul className="list-disc pl-5 space-y-2 text-muted leading-relaxed">
            <li><strong>GHRH receptor agonism</strong> — binds and activates GHRH receptors in the anterior pituitary, stimulating synthesis and release of growth hormone</li>
            <li><strong>DAC modification</strong> — the DAC form's albumin-binding extends circulating half-life dramatically, trading the natural pulsatile GH pattern for sustained elevation</li>
            <li><strong>Downstream IGF-1 increase</strong> — as with other GH-axis compounds, sustained use is associated with elevated IGF-1 levels, the main mediator of GH's tissue-building effects</li>
          </ul>
        </div>

        <div id="evidence" className="scroll-mt-20">
          <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">What the Evidence Shows</h2>
          <ul className="list-disc pl-5 space-y-2 text-muted leading-relaxed">
            <li><span className="font-semibold text-ink">GH/IGF-1 elevation:</span> Early-phase human studies (largely from the compound's original pharmaceutical development in the 2000s, before development was discontinued) confirmed dose-dependent GH and IGF-1 increases with both DAC and non-DAC forms.</li>
            <li><span className="font-semibold text-ink">Body composition:</span> Some human trial data from CJC-1295's original clinical development program showed modest increases in lean body mass over weeks of dosing, consistent with GH-axis activation.</li>
            <li><span className="font-semibold text-ink">Combination protocols:</span> No controlled human trials exist for CJC-1295 combined with Ipamorelin specifically, despite this being the most common gray-market use pattern — the rationale is mechanistic (complementary GHRH + ghrelin receptor pathways) rather than trial-validated for the combination itself.</li>
            <li><span className="font-semibold text-ink">Long-term outcomes:</span> No long-term human safety or efficacy data exists at any dose or protocol.</li>
          </ul>
          <p className="text-muted leading-relaxed">
            <strong>Evidence quality: preliminary.</strong> The GH/IGF-1 mechanism is reasonably well established from early pharmaceutical development; specific downstream benefit claims (recovery, sleep, aesthetics) are not directly trial-validated.
          </p>
        </div>

        <div id="legal" className="scroll-mt-20">
          <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">Legal & Regulatory Status (Updated June 2026)</h2>
          <ul className="list-disc pl-5 space-y-2 text-muted leading-relaxed">
            <li><span className="font-semibold text-ink">2023–April 2026:</span> CJC-1295 was on the FDA's Category 2 restricted 503A bulk substances list.</li>
            <li><span className="font-semibold text-ink">April 2026:</span> The FDA removed CJC-1295 from Category 2 following withdrawal of its nomination — but, as with BPC-157 and TB-500, this did <em>not</em> move it to Category 1. It is not FDA-approved, has no recognized USP/NF monograph, and sits in a regulatory gray zone: neither explicitly prohibited from compounding nor formally authorized.</li>
            <li><span className="font-semibold text-ink">PCAC agenda:</span> CJC-1295 was <em>not</em> among the peptides scheduled for the July 23–24, 2026 PCAC meeting agenda (which covers BPC-157, KPV, TB-500, MOTS-C, Emideltide/DSIP, Semax, and Epitalon) — its longer-term compounding pathway remains less clear than those compounds.</li>
          </ul>
          <p className="text-muted leading-relaxed">
            <strong>Bottom line:</strong> CJC-1295 is not FDA-approved for any human use. It is legally sellable only as “research use only” product; the compounding-pharmacy pathway is currently uncertain and not on the near-term PCAC review calendar.
          </p>
        </div>

        <div id="safety" className="scroll-mt-20">
          <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">Safety Considerations</h2>
          <ul className="list-disc pl-5 space-y-2 text-muted leading-relaxed">
            <li>The DAC form's sustained, non-pulsatile GH elevation is a meaningfully different physiological exposure than the body's natural pulsatile GH pattern, and this distinction matters for theoretical long-term risk — sustained supraphysiological GH/IGF-1 exposure is associated with known risks (insulin resistance, potential growth-factor-related concerns) in the broader GH-axis literature, though CJC-1295-specific long-term human data doesn't exist to confirm or rule out these effects.</li>
            <li>No completed long-term human safety trials exist for either DAC or non-DAC forms.</li>
            <li>RUO product sourcing carries the same purity and mislabeling risks as other gray-market peptides.</li>
          </ul>
        </div>

        <div id="bottom-line" className="scroll-mt-20">
          <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">Bottom Line</h2>
          <p className="text-muted leading-relaxed">
            CJC-1295 has legitimate GH-axis pharmacology behind it from its original (discontinued) clinical development, but current use is almost entirely off-label and unregulated. The DAC vs. non-DAC distinction matters for risk profile and is frequently glossed over in consumer-facing marketing.
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
