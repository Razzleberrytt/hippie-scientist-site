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
  title: 'Semaglutide (Ozempic/Wegovy): Evidence, Safety, and FDA Status (2026)',
  description: 'Evidence-first overview of semaglutide, including GLP-1 pharmacology, major clinical outcomes, safety considerations, and the current FDA compounding framework.',
  path: '/guides/other/semaglutide/',
})

const HEADINGS: Heading[] = [
  { id: 'understanding', text: 'What Is Semaglutide?', level: 2 },
  { id: 'mechanism', text: 'Mechanism of Action', level: 2 },
  { id: 'evidence', text: 'What the Evidence Shows', level: 2 },
  { id: 'legal', text: 'FDA & Compounding Status', level: 2 },
  { id: 'safety', text: 'Safety Considerations', level: 2 },
  { id: 'bottom-line', text: 'Bottom Line', level: 2 },
]

const SEMAGLUTIDE_REFS = [
  { n: 1, text: 'Wilding JPH, et al. Once-weekly semaglutide in adults with overweight or obesity. N Engl J Med. 2021;384:989-1002.', url: 'https://pubmed.ncbi.nlm.nih.gov/33567185/' },
  { n: 2, text: 'Marso SP, et al. Semaglutide and cardiovascular outcomes in patients with type 2 diabetes. N Engl J Med. 2016;375:1834-1844.', url: 'https://pubmed.ncbi.nlm.nih.gov/27633186/' },
  { n: 3, text: 'Lincoff AM, et al. Semaglutide and cardiovascular outcomes in obesity without diabetes. N Engl J Med. 2023;389:2221-2232.', url: 'https://pubmed.ncbi.nlm.nih.gov/37952131/' },
  { n: 4, text: 'Perkovic V, et al. Effects of semaglutide on chronic kidney disease in patients with type 2 diabetes. N Engl J Med. 2024;391:109-121.', url: 'https://pubmed.ncbi.nlm.nih.gov/38785209/' },
  { n: 5, text: 'FDA. FDA clarifies policies for compounders as national GLP-1 supply begins to stabilize. Updated April 1, 2026.', url: 'https://www.fda.gov/drugs/drug-alerts-and-statements/fda-clarifies-policies-compounders-national-glp-1-supply-begins-stabilize' },
  { n: 6, text: 'FDA. FDA proposes to exclude semaglutide, tirzepatide, and liraglutide on 503B Bulks List. April 30, 2026.', url: 'https://www.fda.gov/news-events/press-announcements/fda-proposes-exclude-semaglutide-tirzepatide-and-liraglutide-503b-bulks-list' },
]

export default function Page() {
  const toc = <TableOfContents headings={HEADINGS} />

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Guides', href: '/guides' },
    { label: 'Semaglutide: Evidence, Safety, and FDA Status' },
  ]

  return (
    <ArticleLayout toc={toc}>
      <div className="space-y-8">
        <AuthorityBreadcrumbs items={breadcrumbs} />

        <section className="hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8">
          <p className="eyebrow-label">Prescription GLP-1 Guide</p>
          <h1 className="mt-2 text-3xl font-semibold text-ink sm:text-4xl">Semaglutide: Evidence, Safety, and FDA Status</h1>
          <p className="detail-reading mt-4 text-muted">
            Semaglutide has a large randomized-trial evidence base and multiple FDA-approved uses. The approved-drug evidence should be kept separate from questions about compounded products, which follow a different regulatory framework.
          </p>

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
              Semaglutide — approved-drug evidence and compounded-product rules are separate questions.
            </figcaption>
          </figure>
        </section>

        <section className="rounded-2xl border border-rose-900/15 bg-rose-50/80 p-5 text-sm leading-6 text-rose-950">
          <p className="font-semibold">Prescription-drug notice</p>
          <p className="mt-2">
            FDA-approved semaglutide products are prescription medicines. Compounded semaglutide is not FDA-approved and does not undergo FDA premarket review for safety, effectiveness, or manufacturing quality.
          </p>
        </section>

        <AffiliateDisclosure />

        <section className="prose-section space-y-6">
          <div className="card-premium p-6">
            <p className="text-sm font-semibold text-brand-700 uppercase tracking-wide">Review status</p>
            <p className="mt-3 text-sm text-muted">Regulatory wording reviewed August 12, 2026 against current FDA compounding and GLP-1 shortage material.</p>
          </div>

          <div id="understanding" className="scroll-mt-20">
            <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">What Is Semaglutide?</h2>
            <p className="text-muted leading-relaxed">
              Semaglutide is a glucagon-like peptide-1 (GLP-1) receptor agonist used in FDA-approved prescription products including Ozempic, Wegovy, and Rybelsus. Its evidence base includes large randomized trials in type 2 diabetes, chronic weight management, cardiovascular outcomes, and chronic kidney disease populations. That puts the approved drug in a very different evidence category from experimental peptides marketed through gray-market channels.
            </p>
          </div>

          <div id="mechanism" className="scroll-mt-20">
            <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">Mechanism of Action</h2>
            <ul className="list-disc pl-5 space-y-2 text-muted leading-relaxed">
              <li><strong>GLP-1 receptor agonism:</strong> reproduces several actions of endogenous GLP-1 signaling.</li>
              <li><strong>Glucose-dependent insulin secretion:</strong> supports insulin release when glucose is elevated.</li>
              <li><strong>Glucagon suppression:</strong> can reduce inappropriate glucagon signaling and hepatic glucose output.</li>
              <li><strong>Gastric emptying and satiety:</strong> slows gastric emptying and affects appetite-related signaling, especially around treatment initiation and dose escalation.</li>
              <li><strong>Central appetite regulation:</strong> GLP-1 receptor signaling in the nervous system contributes to reduced energy intake.</li>
            </ul>
          </div>

          <div id="evidence" className="scroll-mt-20">
            <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">What the Evidence Shows</h2>
            <ul className="list-disc pl-5 space-y-2 text-muted leading-relaxed">
              <li><span className="font-semibold text-ink">Chronic weight management:</span> STEP 1 found substantially greater mean weight loss with once-weekly semaglutide 2.4 mg than placebo over 68 weeks in adults with overweight or obesity without diabetes.</li>
              <li><span className="font-semibold text-ink">Type 2 diabetes:</span> the SUSTAIN program established clinically meaningful glycemic effects and supplied part of the cardiovascular-outcomes evidence base.</li>
              <li><span className="font-semibold text-ink">Cardiovascular outcomes:</span> SELECT found fewer major adverse cardiovascular events with semaglutide than placebo in adults with established cardiovascular disease and overweight or obesity without diabetes.</li>
              <li><span className="font-semibold text-ink">Kidney outcomes:</span> FLOW found a lower risk of major kidney-disease outcomes in people with type 2 diabetes and chronic kidney disease.</li>
            </ul>
            <p className="text-muted leading-relaxed">
              <strong>Evidence quality: strong for approved, studied indications and populations.</strong> That does not mean every semaglutide formulation, compounded product, dose, or off-label use inherits the same evidence automatically.
            </p>
          </div>

          <div id="legal" className="scroll-mt-20">
            <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">FDA &amp; Compounding Status (August 2026)</h2>
            <p className="text-muted leading-relaxed">
              FDA determined the semaglutide injection shortage was resolved on February 21, 2025. The temporary shortage-related enforcement discretion for making essentially copies of FDA-approved semaglutide products has ended.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-muted leading-relaxed">
              <li><strong>Section 503A pharmacies and physicians:</strong> patient-specific compounding can still qualify for statutory exemptions when all 503A conditions are met, including the restriction against regularly or in inordinate amounts compounding products that are essentially copies of commercially available drugs. The rule is more specific than saying all compounded access simply requires a generic “medical necessity” note.</li>
              <li><strong>Section 503B outsourcing facilities:</strong> FDA states that semaglutide is not currently on the 503B bulks list and is not on the drug-shortage list. Those facilities therefore cannot rely on shortage status as a basis for routine bulk compounding of semaglutide.</li>
              <li><strong>503B bulks-list proposal:</strong> on April 30, 2026, FDA proposed excluding semaglutide, tirzepatide, and liraglutide from the 503B bulks list after finding no clinical need for outsourcing-facility bulk compounding. FDA described that action as a proposal and said it would consider public comments before a final determination.</li>
            </ul>
            <p className="text-muted leading-relaxed">
              <strong>Practical reading:</strong> “shortage resolved” does not mean every form of patient-specific compounding became categorically illegal, and a compounded product is not the same thing as an FDA-approved generic. The applicable pathway and statutory conditions matter.
            </p>
          </div>

          <div id="safety" className="scroll-mt-20">
            <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">Safety Considerations</h2>
            <ul className="list-disc pl-5 space-y-2 text-muted leading-relaxed">
              <li><strong>Common adverse effects:</strong> nausea, vomiting, diarrhea, constipation, and abdominal symptoms are common, particularly during dose escalation.</li>
              <li><strong>Important clinical risks:</strong> labeling and clinical guidance address issues including gallbladder disease, pancreatitis concerns, delayed gastric emptying, and peri-procedural aspiration risk.</li>
              <li><strong>Boxed warning:</strong> semaglutide labeling carries a thyroid C-cell tumor warning based on rodent findings and contraindicates use in people with a personal or family history of medullary thyroid carcinoma or MEN 2.</li>
              <li><strong>Pregnancy:</strong> weight-loss treatment with semaglutide is not appropriate during pregnancy; product-specific labeling should guide discontinuation timing and other reproductive questions.</li>
              <li><strong>Compounded products:</strong> the clinical-trial evidence for branded, FDA-approved semaglutide does not establish equivalent quality, concentration accuracy, or delivery performance for a compounded preparation.</li>
            </ul>
          </div>

          <div id="bottom-line" className="scroll-mt-20">
            <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">Bottom Line</h2>
            <p className="text-muted leading-relaxed">
              Semaglutide is an FDA-approved prescription drug with strong randomized evidence in several defined populations. The more complicated question in 2026 is compounding: the injection shortage is resolved, shortage-based copy policies have ended, 503A and 503B operate under different statutory conditions, and FDA's April 2026 503B bulks-list action remains a proposal rather than a final blanket rule. Keep those regulatory questions separate from the efficacy evidence for approved products.
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
