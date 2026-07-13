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
  title: 'PT-141 (Bremelanotide): Evidence & Safety Guide',
  description: 'Evidence-based overview of PT-141 (bremelanotide) — melanocortin receptor mechanism, the FDA-approved Vyleesi indication, off-label/RUO use, and safety.',
  path: '/guides/other/pt-141/',
})

const HEADINGS: Heading[] = [
  { id: 'understanding', text: 'What Is PT-141?', level: 2 },
  { id: 'mechanism', text: 'Mechanism of Action', level: 2 },
  { id: 'evidence', text: 'What the Evidence Shows', level: 2 },
  { id: 'legal', text: 'Legal & Regulatory Status', level: 2 },
  { id: 'safety', text: 'Safety Considerations', level: 2 },
  { id: 'bottom-line', text: 'Bottom Line', level: 2 },
]

const PT_141_REFS = [
  { n: 1, text: 'Molinoff PB, et al. (2003). PT-141: a melanocortin agonist for sexual dysfunction. Ann N Y Acad Sci, 994: 96-102.', url: 'https://pubmed.ncbi.nlm.nih.gov/12851303/' },
  { n: 2, text: 'Diamond LE, et al. (2004). Bremelanotide for erectile dysfunction. Int J Impot Res, 16(1): 51-59.', url: 'https://pubmed.ncbi.nlm.nih.gov/14963472/' },
]

export default function Page() {
  const toc = <TableOfContents headings={HEADINGS} />

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Guides', href: '/guides' },
    { label: 'PT-141 (Bremelanotide/Vyleesi): Evidence, Mechanism, and Legal Status' },
  ]

  return (
    <ArticleLayout toc={toc} zone="harm-reduction">
    <div className="space-y-8">
      <AuthorityBreadcrumbs items={breadcrumbs} />

      <section className="hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8">
        <p className="eyebrow-label">Peptide &amp; Compound Guide</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink sm:text-4xl">PT-141 (Bremelanotide/Vyleesi): Evidence, Mechanism, and Legal Status</h1>
        <p className="detail-reading mt-4 text-muted">Evidence-based overview of PT-141 (bremelanotide) — melanocortin receptor mechanism, the FDA-approved Vyleesi indication, off-label/RUO use, and safety.</p>

        <figure className="mt-6">
          <div className="overflow-hidden rounded-2xl border border-brand-900/10 shadow-sm bg-white">
            <Image
              src="/images/guides/pt-141.jpg"
              alt="A glass vial of lyophilized research peptide powder in a lab setting"
              width={1536}
              height={1024}
              priority
              className="w-full h-auto"
            />
          </div>
          <figcaption className="mt-3 text-center text-sm text-muted">
            PT-141 — an educational, research-use-only overview.
          </figcaption>
        </figure>
      </section>

      <section className="rounded-2xl border border-rose-900/15 bg-rose-50/80 p-5 text-sm leading-6 text-rose-950">
        <p className="font-semibold">Approved-drug vs. research-chemical notice</p>
        <p className="mt-2">
          Bremelanotide (Vyleesi) is FDA-approved only for hypoactive sexual desire disorder (HSDD) in premenopausal women. PT-141 sold as a research chemical is a separate regulatory category not intended for human consumption. This page is educational only and is not medical or legal advice.
        </p>
      </section>

      <AffiliateDisclosure />

      <section className="prose-section space-y-6">
        <div className="card-premium p-6">
          <p className="text-sm font-semibold text-brand-700 uppercase tracking-wide">Important Disclaimer</p>
          <p className="mt-3 text-sm text-muted">This guide is for informational purposes only and does not constitute medical advice. Bremelanotide (Vyleesi) is FDA-approved only for HSDD in premenopausal women. Consult a licensed physician before considering any peptide therapy. Content last reviewed for regulatory accuracy: June 30, 2026.</p>
        </div>

        <div id="understanding" className="scroll-mt-20">
          <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">What Is PT-141?</h2>
          <p className="text-muted leading-relaxed">
            PT-141 is the research/gray-market name for <strong>bremelanotide</strong>, a melanocortin receptor agonist. Unlike most peptides in this series, bremelanotide has an actual FDA-approved product: <strong>Vyleesi</strong>, indicated for hypoactive sexual desire disorder (HSDD) in premenopausal women. Most PT-141 sold online as a research chemical, marketed more broadly (including to men, and for erectile dysfunction), falls outside that approved indication and is not the FDA-regulated product.
          </p>
        </div>

        <div id="mechanism" className="scroll-mt-20">
          <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">Mechanism of Action</h2>
          <ul className="list-disc pl-5 space-y-2 text-muted leading-relaxed">
            <li><strong>Melanocortin receptor agonism</strong> — activates MC3R and MC4R receptors in the central nervous system, distinct from the peripheral vascular mechanism used by PDE5 inhibitors like sildenafil</li>
            <li><strong>Central, not vascular, pathway</strong> — because it works on brain melanocortin pathways involved in sexual arousal and desire rather than blood flow directly, it's mechanistically different from erectile dysfunction drugs, even though it's sometimes marketed as an alternative to them</li>
            <li><strong>Non-hormonal</strong> — does not directly act on sex hormone pathways</li>
          </ul>
        </div>

        <div id="evidence" className="scroll-mt-20">
          <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">What the Evidence Shows</h2>
          <ul className="list-disc pl-5 space-y-2 text-muted leading-relaxed">
            <li><span className="font-semibold text-ink">FDA-approved indication (Vyleesi):</span> Phase 3 trials in premenopausal women with HSDD showed statistically significant, though modest, improvements in desire and reduction in distress related to low desire, compared to placebo — the basis for FDA approval.</li>
            <li><span className="font-semibold text-ink">Male sexual function:</span> Earlier-phase trials explored bremelanotide for erectile dysfunction; results were mixed, and the drug was ultimately developed and approved for the female HSDD indication rather than for ED. Off-label/gray-market use in men for this purpose is not backed by the same trial data that supports the approved indication.</li>
            <li><span className="font-semibold text-ink">Side-effect trade-off:</span> Trials noted a meaningful rate of nausea (partly why the initial nasal-spray formulation was discontinued in favor of the current subcutaneous auto-injector) and increases in blood pressure that need monitoring, particularly relevant for anyone with hypertension.</li>
          </ul>
          <p className="text-muted leading-relaxed">
            <strong>Evidence quality: moderate, and indication-specific.</strong> The FDA-approved use (HSDD in premenopausal women) has real Phase 3 data behind it. Broader marketed uses (general “libido enhancer,” male use) rely on much thinner evidence.
          </p>
        </div>

        <div id="legal" className="scroll-mt-20">
          <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">Legal & Regulatory Status</h2>
          <ul className="list-disc pl-5 space-y-2 text-muted leading-relaxed">
            <li>Bremelanotide is FDA-approved as <strong>Vyleesi</strong>, prescription-only, for HSDD in premenopausal women specifically.</li>
            <li>PT-141 sold as a research chemical is a different regulatory category from Vyleesi — it is not FDA-approved for any use outside that narrow indication, and RUO-labeled product is not legally intended for human consumption.</li>
            <li>PT-141/bremelanotide is not on the FDA's Category 1/2 peptide compounding lists discussed for BPC-157, TB-500, etc. — it sits in its own regulatory track as an approved-drug active ingredient with off-label/RUO gray-market use outside that approval.</li>
          </ul>
        </div>

        <div id="safety" className="scroll-mt-20">
          <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">Safety Considerations</h2>
          <ul className="list-disc pl-5 space-y-2 text-muted leading-relaxed">
            <li><strong>Blood pressure:</strong> Bremelanotide can transiently raise blood pressure and, in a subset of patients, may cause a notable spike — Vyleesi carries specific dosing-frequency limits partly for this reason. This is a meaningful consideration for anyone with cardiovascular risk factors.</li>
            <li><strong>Nausea:</strong> One of the most commonly reported side effects in trials.</li>
            <li><strong>Skin/mucosal hyperpigmentation:</strong> Melanocortin receptor activation can, with repeated use, cause focal skin darkening in some patients — a known class effect.</li>
            <li><strong>Not evaluated for the off-label uses</strong> (e.g., male sexual enhancement, general libido) it's most often marketed for in the gray market.</li>
          </ul>
        </div>

        <div id="bottom-line" className="scroll-mt-20">
          <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">Bottom Line</h2>
          <p className="text-muted leading-relaxed">
            PT-141 is unusual in this series: there's a genuinely FDA-approved product built on this molecule, but it's approved for one specific population and indication. Most gray-market marketing extends well beyond that approved use, on considerably thinner evidence, and RUO product isn't the same regulatory entity as Vyleesi.
          </p>
        </div>

      </section>

      <div className="mt-8 flex gap-4 flex-wrap">
        <Link href="/guides/" className="text-sm font-medium text-emerald-700 hover:underline">Back to guides &rarr;</Link>
        <Link href="/compounds/pt-141/" className="text-sm font-medium text-emerald-700 hover:underline">View PT-141 compound profile &rarr;</Link>

      </div>
    </div>
    <References refs={PT_141_REFS} />
    </ArticleLayout>
  )
}
