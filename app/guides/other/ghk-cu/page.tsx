import { buildPageMetadata } from '../../../../src/lib/seo'
import Image from 'next/image'
import type { Metadata } from 'next'
import Link from 'next/link'
import AffiliateDisclosure from '../../../../components/AffiliateDisclosure'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import { ArticleLayout, TableOfContents } from '@/components/articles'
import type { Heading } from '@/components/articles'

export const metadata: Metadata = buildPageMetadata({
  title: 'GHK-Cu (Copper Peptide): Skin, Hair, and Wound Healing Evidence',
  description: 'Evidence-based overview of GHK-Cu — the copper peptide with the most topical/cosmetic evidence of any compound in this series, plus its injectable/RUO use and legal status.',
  path: '/guides/other/ghk-cu/',
})

const HEADINGS: Heading[] = [
  { id: 'understanding', text: 'What Is GHK-Cu?', level: 2 },
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
    { label: 'GHK-Cu (Copper Peptide): Skin, Hair, and Wound Healing Evidence' },
  ]

  return (
    <ArticleLayout toc={toc}>
    <div className="space-y-8">
      <AuthorityBreadcrumbs items={breadcrumbs} />

      <section className="hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8">
        <p className="eyebrow-label">Peptide &amp; Compound Guide</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink sm:text-4xl">GHK-Cu (Copper Peptide): Skin, Hair, and Wound Healing Evidence</h1>
        <p className="detail-reading mt-4 text-muted">Evidence-based overview of GHK-Cu — the copper peptide with the most topical/cosmetic evidence of any compound in this series, plus its injectable/RUO use and legal status.</p>

        <figure className="mt-6">
          <div className="overflow-hidden rounded-2xl border border-brand-900/10 shadow-sm bg-white">
            <Image
              src="/images/guides/ghk-cu.jpg"
              alt="A research peptide vial with a sterile syringe on a clinical surface"
              width={1536}
              height={1024}
              priority
              className="w-full h-auto"
            />
          </div>
          <figcaption className="mt-3 text-center text-sm text-muted">
            GHK-Cu — an educational, research-use-only overview.
          </figcaption>
        </figure>
      </section>

      <section className="rounded-2xl border border-rose-900/15 bg-rose-50/80 p-5 text-sm leading-6 text-rose-950">
        <p className="font-semibold">Topical cosmetic vs. injectable/RUO notice</p>
        <p className="mt-2">
          Topical GHK-Cu is a legally sold cosmetic ingredient. Injectable/systemic GHK-Cu is a separate, less-evidenced research-peptide category not intended for human consumption. This page is educational only and does not constitute medical advice or a claim to treat any disease.
        </p>
      </section>

      <AffiliateDisclosure />

      <section className="prose-section space-y-6">
        <div className="card-premium p-6">
          <p className="text-sm font-semibold text-brand-700 uppercase tracking-wide">Important Disclaimer</p>
          <p className="mt-3 text-sm text-muted">This guide is for informational purposes only and does not constitute medical advice. This page does not constitute medical advice or a claim to treat any disease. Consult a licensed physician before considering any peptide therapy. Content last reviewed for regulatory accuracy: June 30, 2026.</p>
        </div>

        <div id="understanding" className="scroll-mt-20">
          <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">What Is GHK-Cu?</h2>
          <p className="text-muted leading-relaxed">
            GHK-Cu (glycyl-L-histidyl-L-lysine, bound to copper) is a naturally occurring copper-binding tripeptide found in human plasma, saliva, and urine. Its concentration in the body declines with age — a pattern that's driven much of the interest in supplementing it topically for skin and hair applications. Unlike the other peptides in this series, GHK-Cu has a legitimate, well-established <strong>topical cosmetic</strong> market in addition to a smaller injectable/RUO research use.
          </p>
        </div>

        <div id="mechanism" className="scroll-mt-20">
          <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">Mechanism of Action</h2>
          <ul className="list-disc pl-5 space-y-2 text-muted leading-relaxed">
            <li><strong>Copper delivery and chelation</strong> — transports copper, a cofactor for numerous enzymes involved in tissue remodeling and antioxidant defense (including lysyl oxidase, involved in collagen/elastin crosslinking, and superoxide dismutase)</li>
            <li><strong>Collagen and elastin stimulation</strong> — shown in skin studies to upregulate collagen and glycosaminoglycan synthesis by fibroblasts</li>
            <li><strong>Antioxidant and anti-inflammatory activity</strong> — modulates inflammatory cytokine expression and has demonstrated antioxidant effects in cell studies</li>
            <li><strong>Wound-healing signaling</strong> — promotes angiogenesis and remodeling of the extracellular matrix in injury models</li>
          </ul>
        </div>

        <div id="evidence" className="scroll-mt-20">
          <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">What the Evidence Shows</h2>
          <p className="text-muted leading-relaxed">
            GHK-Cu has a notably stronger evidence base — including actual human clinical trials — than most peptides in this series, particularly for topical use:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-muted leading-relaxed">
            <li><span className="font-semibold text-ink">Skin appearance (topical):</span> Multiple human clinical trials of topical GHK-Cu formulations report improvements in fine lines, skin firmness/elasticity, and photodamage markers versus vehicle/placebo, with effect sizes broadly comparable to some retinoid and peptide-based cosmetic actives in head-to-head cosmetic studies.</li>
            <li><span className="font-semibold text-ink">Wound healing:</span> Animal studies and some human wound-healing research show accelerated healing and improved tissue remodeling with GHK-Cu application.</li>
            <li><span className="font-semibold text-ink">Hair growth:</span> Cell-culture and some human studies suggest GHK-Cu may stimulate hair follicle growth phase (anagen) activity and increase follicle size — an active area in cosmetic and dermatological research, sold in topical serums and shampoos.</li>
            <li><span className="font-semibold text-ink">Injectable/systemic use:</span> Less-studied than the topical form. Injectable GHK-Cu is marketed in the research-peptide space for broader anti-aging and tissue-repair claims, but this use case has a much thinner human evidence trail than the well-documented topical cosmetic literature.</li>
          </ul>
          <p className="text-muted leading-relaxed">
            <strong>Evidence quality: moderate-to-good for topical cosmetic use (real human RCTs exist); preliminary for injectable/systemic use.</strong>
          </p>
        </div>

        <div id="legal" className="scroll-mt-20">
          <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">Legal & Regulatory Status</h2>
          <ul className="list-disc pl-5 space-y-2 text-muted leading-relaxed">
            <li><strong>Topical GHK-Cu</strong> is legally sold as a cosmetic ingredient in serums, creams, and hair products — it does not require FDA drug approval for cosmetic marketing claims (appearance-related, not disease-treatment claims), and this is the legitimate, well-established commercial channel for this compound.</li>
            <li><strong>Injectable GHK-Cu</strong>, sold as a research peptide, falls into the same regulatory category as other RUO injectable peptides: not FDA-approved as a drug, named among the peptides discussed in the February 2026 HHS/FDA peptide reclassification announcement as one expected to move toward Category 1 compounding status, though formal rulemaking confirming this was still pending as of mid-2026.</li>
          </ul>
        </div>

        <div id="safety" className="scroll-mt-20">
          <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">Safety Considerations</h2>
          <ul className="list-disc pl-5 space-y-2 text-muted leading-relaxed">
            <li>Topical GHK-Cu has a good safety track record in cosmetic use, with occasional reports of mild irritation at higher concentrations — generally well-tolerated in trials.</li>
            <li>Injectable/systemic GHK-Cu safety data in humans is much more limited than the topical literature; the same RUO sourcing and quality-control caveats that apply to other gray-market peptides apply here.</li>
            <li>Copper is essential but can be harmful in excess — systemic copper-peptide use (rather than topical, where systemic absorption is minimal) should be approached with more caution and ideally physician oversight, particularly for anyone with a condition like Wilson's disease affecting copper metabolism.</li>
          </ul>
        </div>

        <div id="bottom-line" className="scroll-mt-20">
          <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">Bottom Line</h2>
          <p className="text-muted leading-relaxed">
            GHK-Cu stands out in this series: its topical cosmetic use is genuinely well-supported by human trial data and is a legitimate, established product category — worth treating differently from the injectable RUO peptides covered elsewhere on this site. Injectable/systemic use is a separate, less-evidenced application that shares more regulatory uncertainty with its peptide-series neighbors.
          </p>
        </div>

      </section>

      <div className="mt-8 flex gap-4 flex-wrap">
        <Link href="/guides/" className="text-sm font-medium text-emerald-700 hover:underline">Back to guides &rarr;</Link>
        <Link href="/compounds/ghk-cu" className="text-sm font-medium text-emerald-700 hover:underline">View GHK-Cu compound profile &rarr;</Link>

      </div>
    </div>
    </ArticleLayout>
  )
}
