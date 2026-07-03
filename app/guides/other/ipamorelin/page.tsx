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
  title: 'Ipamorelin: Growth Hormone Secretagogue Benefits, Evidence & Legal Status',
  description: 'Evidence-based overview of Ipamorelin, a selective growth-hormone secretagogue — mechanism, research on body composition and sleep, and current legal status.',
  path: '/guides/other/ipamorelin/',
})

const HEADINGS: Heading[] = [
  { id: 'understanding', text: 'What Is Ipamorelin?', level: 2 },
  { id: 'mechanism', text: 'Mechanism of Action', level: 2 },
  { id: 'evidence', text: 'What the Evidence Shows', level: 2 },
  { id: 'legal', text: 'Legal & Regulatory Status', level: 2 },
  { id: 'safety', text: 'Safety Considerations', level: 2 },
  { id: 'bottom-line', text: 'Bottom Line', level: 2 },
]

const IPAMORELIN_REFS = [
  { n: 1, text: 'Johannsson G, et al. (1997). GH secretagogues: pharmacology and clinical potential. Endocr Rev, 18(5): 646-677.', url: 'https://pubmed.ncbi.nlm.nih.gov/9331546/' },
  { n: 2, text: 'Bowers CY. (1998). Growth hormone-releasing peptide (GHRP). Cell Mol Life Sci, 54(12): 1316-1329.', url: 'https://pubmed.ncbi.nlm.nih.gov/9893709/' },
]

export default function Page() {
  const toc = <TableOfContents headings={HEADINGS} />

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Guides', href: '/guides' },
    { label: 'Ipamorelin: Growth Hormone Secretagogue Benefits, Evidence & Legal Status' },
  ]

  return (
    <ArticleLayout toc={toc} zone="harm-reduction">
    <div className="space-y-8">
      <AuthorityBreadcrumbs items={breadcrumbs} />

      <section className="hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8">
        <p className="eyebrow-label">Peptide &amp; Compound Guide</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink sm:text-4xl">Ipamorelin: Growth Hormone Secretagogue Benefits, Evidence & Legal Status</h1>
        <p className="detail-reading mt-4 text-muted">Evidence-based overview of Ipamorelin, a selective growth-hormone secretagogue — mechanism, research on body composition and sleep, and current legal status.</p>

        <figure className="mt-6">
          <div className="overflow-hidden rounded-2xl border border-brand-900/10 shadow-sm bg-white">
            <Image
              src="/images/guides/ipamorelin.jpg"
              alt="A research peptide vial with a sterile syringe on a clinical surface"
              width={1536}
              height={1024}
              priority
              className="w-full h-auto"
            />
          </div>
          <figcaption className="mt-3 text-center text-sm text-muted">
            Ipamorelin — an educational, research-use-only overview.
          </figcaption>
        </figure>
      </section>

      <section className="rounded-2xl border border-rose-900/15 bg-rose-50/80 p-5 text-sm leading-6 text-rose-950">
        <p className="font-semibold">Research-use-only (RUO) notice</p>
        <p className="mt-2">
          Ipamorelin is not FDA-approved as a finished drug product. This page is educational only, does not endorse purchase or use, and is not medical or legal advice. Its compounding category is pending formal Federal Register rulemaking — verify against current FDA guidance before drawing conclusions.
        </p>
      </section>

      <AffiliateDisclosure />

      <section className="prose-section space-y-6">
        <div className="card-premium p-6">
          <p className="text-sm font-semibold text-brand-700 uppercase tracking-wide">Important Disclaimer</p>
          <p className="mt-3 text-sm text-muted">This guide is for informational purposes only and does not constitute medical advice. Ipamorelin is not FDA-approved. Consult a licensed physician before considering any peptide therapy. Content last reviewed for regulatory accuracy: June 30, 2026.</p>
        </div>

        <div id="understanding" className="scroll-mt-20">
          <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">What Is Ipamorelin?</h2>
          <p className="text-muted leading-relaxed">
            Ipamorelin is a synthetic pentapeptide classified as a growth-hormone secretagogue (GHS) — specifically a selective ghrelin receptor agonist. It stimulates the pituitary gland to release growth hormone (GH) with relatively minimal effect on cortisol, prolactin, or appetite compared to older secretagogues like GHRP-6. This selectivity is Ipamorelin's main claim to differentiation within the GHS class.
          </p>
          <p className="text-muted leading-relaxed">
            It is often paired with CJC-1295 in combination protocols (see our CJC-1295 guide), since the two act on complementary pathways to produce a more sustained GH pulse.
          </p>
        </div>

        <div id="mechanism" className="scroll-mt-20">
          <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">Mechanism of Action</h2>
          <ul className="list-disc pl-5 space-y-2 text-muted leading-relaxed">
            <li><strong>Ghrelin receptor (GHS-R1a) agonism</strong> — Ipamorelin binds the ghrelin receptor in the pituitary and hypothalamus, triggering a pulsatile release of endogenous growth hormone</li>
            <li><strong>Selectivity</strong> — unlike GHRP-2/6, Ipamorelin shows minimal cross-reactivity with ACTH/cortisol and prolactin pathways in study data, which is the basis for its reputation as a “cleaner” secretagogue</li>
            <li><strong>Pulsatile, not continuous</strong> — it mimics the body's natural GH pulse pattern rather than producing sustained elevation, which is thought to reduce desensitization risk relative to continuous GH administration</li>
          </ul>
        </div>

        <div id="evidence" className="scroll-mt-20">
          <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">What the Evidence Shows</h2>
          <p className="text-muted leading-relaxed">
            Ipamorelin has more human clinical data than most peptides on this list, largely from studies conducted in the 1990s–2000s (including some in postoperative ileus and GH-deficiency contexts, prior to its current “research/anti-aging” market positioning):
          </p>
          <ul className="list-disc pl-5 space-y-2 text-muted leading-relaxed">
            <li><span className="font-semibold text-ink">GH release:</span> Human studies confirm reliable, dose-dependent GH secretion with minimal effect on other pituitary hormones.</li>
            <li><span className="font-semibold text-ink">Body composition:</span> Animal and limited human data suggest potential for modest improvements in lean mass and fat metabolism with sustained use, consistent with GH's known physiological effects.</li>
            <li><span className="font-semibold text-ink">Bone density:</span> Some rodent studies show positive effects on bone metabolism.</li>
            <li><span className="font-semibold text-ink">GI motility:</span> Ipamorelin was originally studied for postoperative ileus (a related secretagogue mechanism affects gut motility), though this application did not lead to FDA approval.</li>
            <li><span className="font-semibold text-ink">Sleep, recovery, anti-aging claims:</span> Widely marketed for these uses, but direct controlled human evidence for these specific outcomes at typical gray-market self-administration protocols is limited — most support is extrapolated from GH physiology generally rather than Ipamorelin-specific trials.</li>
          </ul>
          <p className="text-muted leading-relaxed">
            <strong>Evidence quality: moderate for GH-release mechanism, limited for downstream lifestyle/aesthetic claims.</strong>
          </p>
        </div>

        <div id="legal" className="scroll-mt-20">
          <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">Legal & Regulatory Status</h2>
          <p className="text-muted leading-relaxed">
            Unlike BPC-157, TB-500, and CJC-1295, Ipamorelin was <strong>not</strong> removed from the FDA's Category 2 restricted 503A bulk substances list in the April 2026 action for the same three peptides — however, per the February 2026 HHS/FDA announcement, Ipamorelin was named among the ~14 of 19 originally restricted peptides expected to move back toward Category 1 (compoundable) status. As of mid-2026, formal Federal Register rulemaking confirming its final category had not yet published; treat its compounding-pharmacy status as pending, not settled.
          </p>
          <ul className="list-disc pl-5 space-y-2 text-muted leading-relaxed">
            <li>Ipamorelin is <strong>not FDA-approved</strong> as a finished drug product for any indication.</li>
            <li>No prescription form of Ipamorelin exists on the market; any product is either RUO or compounded (where currently accessible) under a physician's off-label prescription.</li>
            <li>Ipamorelin is prohibited under WADA's S2 category (peptide hormones, growth factors, and related substances) for competitive athletes, independent of its FDA compounding status.</li>
          </ul>
        </div>

        <div id="safety" className="scroll-mt-20">
          <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">Safety Considerations</h2>
          <ul className="list-disc pl-5 space-y-2 text-muted leading-relaxed">
            <li>Short-term human studies have not identified major safety signals at studied doses; long-term (multi-year) safety data does not exist.</li>
            <li>Because it stimulates endogenous GH release, theoretical concerns around GH's known effects (insulin sensitivity changes, potential growth-factor-driven proliferation effects) apply and are a reason for physician-supervised use and monitoring rather than self-directed protocols.</li>
            <li>RUO-sourced product quality is not independently verified.</li>
          </ul>
        </div>

        <div id="bottom-line" className="scroll-mt-20">
          <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">Bottom Line</h2>
          <p className="text-muted leading-relaxed">
            Of the peptides covered in this series, Ipamorelin has one of the stronger direct human data trails for its core mechanism (GH secretion). The downstream claims around body composition, sleep, and anti-aging benefit are more extrapolated than proven. Regulatory status is trending toward eventual compounding access but is not yet finalized.
          </p>
        </div>

      </section>

      <div className="mt-8 flex gap-4 flex-wrap">
        <Link href="/guides/" className="text-sm font-medium text-emerald-700 hover:underline">Back to guides &rarr;</Link>
        <Link href="/compounds/ipamorelin" className="text-sm font-medium text-emerald-700 hover:underline">View Ipamorelin compound profile &rarr;</Link>
        <Link href="/guides/other/cjc-1295/" className="text-sm font-medium text-emerald-700 hover:underline">Read the CJC-1295 guide &rarr;</Link>

      </div>
    </div>
    </ArticleLayout>
  )
}
