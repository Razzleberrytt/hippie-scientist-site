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
  title: 'Semaglutide (Ozempic/Wegovy): Evidence, Mechanism, and What to Know',
  description: 'Evidence-based overview of semaglutide — GLP-1 mechanism, clinical trial data for weight management and diabetes, side effects, and the compounded-vs-brand landscape.',
  path: '/guides/other/semaglutide/',
})

const HEADINGS: Heading[] = [
  { id: 'understanding', text: 'What Is Semaglutide?', level: 2 },
  { id: 'mechanism', text: 'Mechanism of Action', level: 2 },
  { id: 'evidence', text: 'What the Evidence Shows', level: 2 },
  { id: 'legal', text: 'Legal & Regulatory Status', level: 2 },
  { id: 'safety', text: 'Safety Considerations', level: 2 },
  { id: 'bottom-line', text: 'Bottom Line', level: 2 },
]

const SEMAGLUTIDE_REFS = [
  { n: 1, text: 'Wilding JPH, et al. (2021). Once-weekly semaglutide in adults with overweight or obesity. N Engl J Med, 384(11): 989-1002.', url: 'https://pubmed.ncbi.nlm.nih.gov/33567185/' },
  { n: 2, text: 'Marso SP, et al. (2016). Semaglutide and cardiovascular outcomes in type 2 diabetes. N Engl J Med, 375(19): 1834-1844.', url: 'https://pubmed.ncbi.nlm.nih.gov/27633186/' },
  { n: 3, text: 'Davies MJ, et al. (2015). Efficacy of semaglutide vs placebo for weight management. Lancet, 397(10278): 971-984.', url: 'https://pubmed.ncbi.nlm.nih.gov/33667415/' },
]

export default function Page() {
  const toc = <TableOfContents headings={HEADINGS} />

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Guides', href: '/guides' },
    { label: 'Semaglutide (Ozempic/Wegovy): Evidence, Mechanism, and What to Know' },
  ]

  return (
    <ArticleLayout toc={toc}>
    <div className="space-y-8">
      <AuthorityBreadcrumbs items={breadcrumbs} />

      <section className="hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8">
        <p className="eyebrow-label">Peptide &amp; Compound Guide</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink sm:text-4xl">Semaglutide (Ozempic/Wegovy): Evidence, Mechanism, and What to Know</h1>
        <p className="detail-reading mt-4 text-muted">Evidence-based overview of semaglutide — GLP-1 mechanism, clinical trial data for weight management and diabetes, side effects, and the compounded-vs-brand landscape.</p>

        <figure className="mt-6">
          <div className="overflow-hidden rounded-2xl border border-brand-900/10 shadow-sm bg-white">
            <Image
              src="/images/guides/semaglutide.jpg"
              alt="A GLP-1 metabolic medication injection pen on a clinical surface"
              width={1536}
              height={1024}
              priority
              className="w-full h-auto"
            />
          </div>
          <figcaption className="mt-3 text-center text-sm text-muted">
            Semaglutide — mechanism, evidence, and safety context.
          </figcaption>
        </figure>
      </section>

      <section className="rounded-2xl border border-rose-900/15 bg-rose-50/80 p-5 text-sm leading-6 text-rose-950">
        <p className="font-semibold">Prescription-drug notice</p>
        <p className="mt-2">
          Semaglutide is a prescription medication and is not sold as a research peptide. This page is educational only and is not medical advice or a substitute for a prescribing clinician.
        </p>
      </section>

      <AffiliateDisclosure />

      <section className="prose-section space-y-6">
        <div className="card-premium p-6">
          <p className="text-sm font-semibold text-brand-700 uppercase tracking-wide">Important Disclaimer</p>
          <p className="mt-3 text-sm text-muted">This guide is for informational purposes only and does not constitute medical advice. Semaglutide is a prescription medication. Consult a licensed physician before considering any peptide therapy. Content last reviewed for regulatory accuracy: June 30, 2026.</p>
        </div>

        <div id="understanding" className="scroll-mt-20">
          <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">What Is Semaglutide?</h2>
          <p className="text-muted leading-relaxed">
            Semaglutide is a GLP-1 (glucagon-like peptide-1) receptor agonist, FDA-approved under the brand names <strong>Ozempic</strong> (type 2 diabetes) and <strong>Wegovy</strong> (chronic weight management), with an oral form marketed as <strong>Rybelsus</strong>. Unlike most peptides covered elsewhere in this series, semaglutide is a fully FDA-approved prescription drug backed by a large randomized controlled trial program — it belongs in a different evidence tier entirely.
          </p>
        </div>

        <div id="mechanism" className="scroll-mt-20">
          <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">Mechanism of Action</h2>
          <ul className="list-disc pl-5 space-y-2 text-muted leading-relaxed">
            <li><strong>GLP-1 receptor agonism</strong> — mimics the incretin hormone GLP-1, which the gut releases after eating</li>
            <li><strong>Glucose-dependent insulin secretion</strong> — stimulates insulin release from the pancreas specifically when blood glucose is elevated, reducing hypoglycemia risk relative to some other diabetes drugs</li>
            <li><strong>Glucagon suppression</strong> — reduces glucagon secretion, lowering hepatic glucose output</li>
            <li><strong>Gastric emptying delay</strong> — slows stomach emptying, contributing to increased satiety</li>
            <li><strong>Central appetite regulation</strong> — acts on GLP-1 receptors in the hypothalamus and brainstem to reduce hunger signaling and food reward response</li>
          </ul>
        </div>

        <div id="evidence" className="scroll-mt-20">
          <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">What the Evidence Shows</h2>
          <p className="text-muted leading-relaxed">
            Semaglutide has one of the strongest evidence bases of any drug covered on this site:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-muted leading-relaxed">
            <li><span className="font-semibold text-ink">Weight loss (STEP trial program):</span> In the pivotal STEP 1 trial, participants without diabetes lost an average of ~15% of body weight over 68 weeks at the 2.4mg/week dose, versus ~2.4% with placebo.</li>
            <li><span className="font-semibold text-ink">Type 2 diabetes (SUSTAIN trial program):</span> Consistent, clinically meaningful reductions in HbA1c across multiple trials, generally outperforming other GLP-1 class comparators at equivalent doses.</li>
            <li><span className="font-semibold text-ink">Cardiovascular outcomes (SELECT trial):</span> In adults with cardiovascular disease and overweight/obesity but without diabetes, semaglutide reduced major adverse cardiovascular events (heart attack, stroke, cardiovascular death) versus placebo — this expanded its approved indication beyond weight loss alone.</li>
            <li><span className="font-semibold text-ink">Kidney outcomes (FLOW trial):</span> Demonstrated benefit in reducing kidney disease progression in type 2 diabetes patients with chronic kidney disease.</li>
          </ul>
          <p className="text-muted leading-relaxed">
            <strong>Evidence quality: strong.</strong> This is Phase 3 RCT-backed, FDA-approved data across multiple large trial programs — categorically different from the preclinical/gray-market peptides elsewhere in this series.
          </p>
        </div>

        <div id="legal" className="scroll-mt-20">
          <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">Regulatory & Market Status (Updated June 2026)</h2>
          <ul className="list-disc pl-5 space-y-2 text-muted leading-relaxed">
            <li>Semaglutide is FDA-approved and commercially available by prescription (Ozempic, Wegovy, Rybelsus).</li>
            <li>The nationwide semaglutide shortage that drove a wave of 503A/503B <strong>compounded semaglutide</strong> has resolved — the FDA determined semaglutide is no longer in shortage, and per current FDA guidance, 503B outsourcing facilities can no longer compound semaglutide in bulk since it's not on the 503B bulks list and is no longer shortage-eligible. Patients seeking a compounded version now generally need an individualized, physician-documented clinical justification (e.g., an allergy to a brand-name excipient, or a dose not commercially available) rather than simple cost or availability.</li>
            <li>Semaglutide is not sold as a “research peptide” — legitimate access is prescription-only through a licensed pharmacy.</li>
          </ul>
        </div>

        <div id="safety" className="scroll-mt-20">
          <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">Side Effects & Safety</h2>
          <ul className="list-disc pl-5 space-y-2 text-muted leading-relaxed">
            <li><strong>Common:</strong> nausea, vomiting, diarrhea, constipation — most pronounced during dose escalation and often improve over time</li>
            <li><strong>Less common but notable:</strong> gallbladder disease, pancreatitis (rare), risk of aspiration under anesthesia due to delayed gastric emptying (relevant for pre-surgical planning)</li>
            <li><strong>Boxed warning:</strong> risk of thyroid C-cell tumors observed in rodent studies; contraindicated in patients with a personal or family history of medullary thyroid carcinoma or Multiple Endocrine Neoplasia syndrome type 2</li>
            <li><strong>Not for use in pregnancy</strong></li>
          </ul>
        </div>

        <div id="bottom-line" className="scroll-mt-20">
          <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">Bottom Line</h2>
          <p className="text-muted leading-relaxed">
            Semaglutide is a genuinely well-studied, FDA-approved drug with strong outcomes data across weight management, diabetes, cardiovascular risk, and kidney disease — it's an outlier in this peptide series in terms of evidence quality. The main current landscape shift is the wind-down of the compounded/shortage-era supply, pushing most patients back toward branded, prescription-only access.
          </p>
        </div>

      </section>

      <div className="mt-8 flex gap-4 flex-wrap">
        <Link href="/guides/" className="text-sm font-medium text-emerald-700 hover:underline">Back to guides &rarr;</Link>
        <Link href="/compounds/semaglutide/" className="text-sm font-medium text-emerald-700 hover:underline">View Semaglutide compound profile &rarr;</Link>
        <Link href="/guides/other/tirzepatide/" className="text-sm font-medium text-emerald-700 hover:underline">Read the Tirzepatide guide &rarr;</Link>

      </div>
    </div>
    <References refs={SEMAGLUTIDE_REFS} />
    </ArticleLayout>
  )
}
