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
  title: 'Tirzepatide (Mounjaro/Zepbound): Evidence, Mechanism, and What to Know',
  description: 'Evidence-based overview of tirzepatide — dual GIP/GLP-1 mechanism, head-to-head weight loss data vs. semaglutide, side effects, and current market status.',
  path: '/guides/other/tirzepatide/',
})

const HEADINGS: Heading[] = [
  { id: 'understanding', text: 'What Is Tirzepatide?', level: 2 },
  { id: 'mechanism', text: 'Mechanism of Action', level: 2 },
  { id: 'evidence', text: 'What the Evidence Shows', level: 2 },
  { id: 'legal', text: 'Legal & Regulatory Status', level: 2 },
  { id: 'safety', text: 'Safety Considerations', level: 2 },
  { id: 'bottom-line', text: 'Bottom Line', level: 2 },
]

const TIRZEPATIDE_REFS = [
  { n: 1, text: 'Jastreboff AM, et al. (2022). Tirzepatide once weekly for obesity. N Engl J Med, 387(3): 205-216.', url: 'https://pubmed.ncbi.nlm.nih.gov/35658024/' },
  { n: 2, text: 'Frías JP, et al. (2021). Tirzepatide vs semaglutide in type 2 diabetes. N Engl J Med, 385(6): 503-515.', url: 'https://pubmed.ncbi.nlm.nih.gov/34170647/' },
]

export default function Page() {
  const toc = <TableOfContents headings={HEADINGS} />

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Guides', href: '/guides' },
    { label: 'Tirzepatide (Mounjaro/Zepbound): Evidence, Mechanism, and What to Know' },
  ]

  return (
    <ArticleLayout toc={toc}>
    <div className="space-y-8">
      <AuthorityBreadcrumbs items={breadcrumbs} />

      <section className="hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8">
        <p className="eyebrow-label">Peptide &amp; Compound Guide</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink sm:text-4xl">Tirzepatide (Mounjaro/Zepbound): Evidence, Mechanism, and What to Know</h1>
        <p className="detail-reading mt-4 text-muted">Evidence-based overview of tirzepatide — dual GIP/GLP-1 mechanism, head-to-head weight loss data vs. semaglutide, side effects, and current market status.</p>

        <figure className="mt-6">
          <div className="overflow-hidden rounded-2xl border border-brand-900/10 shadow-sm bg-white">
            <Image
              src="/images/guides/tirzepatide.jpg"
              alt="A GLP-1 metabolic medication injection pen on a clinical surface"
              width={1536}
              height={1024}
              priority
              className="w-full h-auto"
            />
          </div>
          <figcaption className="mt-3 text-center text-sm text-muted">
            Tirzepatide — mechanism, evidence, and safety context.
          </figcaption>
        </figure>
      </section>

      <section className="rounded-2xl border border-rose-900/15 bg-rose-50/80 p-5 text-sm leading-6 text-rose-950">
        <p className="font-semibold">Prescription-drug notice</p>
        <p className="mt-2">
          Tirzepatide is a prescription medication and is not sold as a research peptide. This page is educational only and is not medical advice or a substitute for a prescribing clinician.
        </p>
      </section>

      <AffiliateDisclosure />

      <section className="prose-section space-y-6">
        <div className="card-premium p-6">
          <p className="text-sm font-semibold text-brand-700 uppercase tracking-wide">Important Disclaimer</p>
          <p className="mt-3 text-sm text-muted">This guide is for informational purposes only and does not constitute medical advice. Tirzepatide is a prescription medication. Consult a licensed physician before considering any peptide therapy. Content last reviewed for regulatory accuracy: June 30, 2026.</p>
        </div>

        <div id="understanding" className="scroll-mt-20">
          <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">What Is Tirzepatide?</h2>
          <p className="text-muted leading-relaxed">
            Tirzepatide is a dual GIP (glucose-dependent insulinotropic polypeptide) and GLP-1 receptor agonist, FDA-approved under the brand names <strong>Mounjaro</strong> (type 2 diabetes) and <strong>Zepbound</strong> (chronic weight management). It's the first approved drug in its dual-agonist class and has shown larger average weight-loss effects in trials than single-agonist GLP-1 drugs like semaglutide.
          </p>
        </div>

        <div id="mechanism" className="scroll-mt-20">
          <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">Mechanism of Action</h2>
          <ul className="list-disc pl-5 space-y-2 text-muted leading-relaxed">
            <li><strong>Dual receptor agonism</strong> — activates both GIP and GLP-1 receptors, the two primary incretin pathways, whereas semaglutide activates GLP-1 alone</li>
            <li><strong>GIP's additive role</strong> — GIP receptor activation appears to enhance insulin sensitivity and may work synergistically with GLP-1 effects on appetite and energy balance, though the precise mechanistic contribution of GIP agonism to weight loss is still being characterized</li>
            <li><strong>Glucose-dependent insulin secretion</strong> — like semaglutide, stimulates insulin release primarily when glucose is elevated</li>
            <li><strong>Appetite suppression</strong> — central nervous system effects on satiety, similar to GLP-1 monotherapy but with generally larger observed effect sizes</li>
          </ul>
        </div>

        <div id="evidence" className="scroll-mt-20">
          <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">What the Evidence Shows</h2>
          <ul className="list-disc pl-5 space-y-2 text-muted leading-relaxed">
            <li><span className="font-semibold text-ink">Weight loss (SURMOUNT trial program):</span> In SURMOUNT-1, participants without diabetes lost an average of up to ~22.5% of body weight at the highest studied dose (15mg/week) over 72 weeks — among the largest average weight-loss effects seen in a pharmaceutical trial for obesity to date.</li>
            <li><span className="font-semibold text-ink">Type 2 diabetes (SURPASS trial program):</span> Superior HbA1c reduction compared to several existing diabetes drugs, including semaglutide in a head-to-head trial (SURPASS-2).</li>
            <li><span className="font-semibold text-ink">Head-to-head vs. semaglutide:</span> Available head-to-head and real-world comparative data generally show tirzepatide producing somewhat greater average weight loss than semaglutide at maximum doses, though individual response varies significantly and both remain effective options.</li>
            <li><span className="font-semibold text-ink">Sleep apnea (SURMOUNT-OSA):</span> Demonstrated significant improvement in obstructive sleep apnea severity in adults with obesity — an indication now reflected in its expanded approved use.</li>
            <li><span className="font-semibold text-ink">Cardiovascular/other outcomes:</span> Longer-term cardiovascular outcomes data (analogous to semaglutide's SELECT trial) has been building out through ongoing trials; check current labeling for the latest approved indications, as this is an active area of expansion.</li>
          </ul>
          <p className="text-muted leading-relaxed">
            <strong>Evidence quality: strong.</strong> FDA-approved with a large, multi-trial Phase 3 program — same evidence tier as semaglutide, distinct from the RUO/gray-market peptides elsewhere in this series.
          </p>
        </div>

        <div id="legal" className="scroll-mt-20">
          <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">Regulatory & Market Status (Updated June 2026)</h2>
          <ul className="list-disc pl-5 space-y-2 text-muted leading-relaxed">
            <li>Tirzepatide is FDA-approved and commercially available by prescription (Mounjaro, Zepbound).</li>
            <li>As with semaglutide, the FDA has determined tirzepatide is no longer in shortage, which curtails 503B outsourcing facilities' ability to compound it in bulk. Compounded tirzepatide now generally requires individualized physician documentation of clinical necessity rather than general availability or cost-based justification.</li>
            <li>Not sold as a research peptide; legitimate access is prescription-only.</li>
          </ul>
        </div>

        <div id="safety" className="scroll-mt-20">
          <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">Side Effects & Safety</h2>
          <ul className="list-disc pl-5 space-y-2 text-muted leading-relaxed">
            <li><strong>Common:</strong> nausea, diarrhea, vomiting, constipation — dose-dependent and most common during titration</li>
            <li><strong>Less common but notable:</strong> gallbladder disease, pancreatitis (rare), injection-site reactions, risk of aspiration under anesthesia</li>
            <li><strong>Boxed warning:</strong> thyroid C-cell tumor risk in rodent studies; same contraindication profile as semaglutide (personal/family history of medullary thyroid carcinoma or MEN 2)</li>
            <li><strong>Not for use in pregnancy</strong></li>
          </ul>
        </div>

        <div id="bottom-line" className="scroll-mt-20">
          <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">Bottom Line</h2>
          <p className="text-muted leading-relaxed">
            Tirzepatide currently shows the largest average weight-loss effect of any FDA-approved obesity drug, backed by a robust trial program comparable in rigor to semaglutide's. The dual-mechanism rationale is scientifically sound, though the precise individual contribution of the GIP component is still an active research question. Like semaglutide, the compounded-supply era is winding down as the FDA shortage determination resolves.
          </p>
        </div>

      </section>

      <div className="mt-8 flex gap-4 flex-wrap">
        <Link href="/guides/" className="text-sm font-medium text-emerald-700 hover:underline">Back to guides &rarr;</Link>
        <Link href="/compounds/tirzepatide" className="text-sm font-medium text-emerald-700 hover:underline">View Tirzepatide compound profile &rarr;</Link>
        <Link href="/guides/other/semaglutide/" className="text-sm font-medium text-emerald-700 hover:underline">Read the Semaglutide guide &rarr;</Link>

      </div>
    </div>
    </ArticleLayout>
  )
}
