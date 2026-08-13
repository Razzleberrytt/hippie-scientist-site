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
  title: 'Tirzepatide (Mounjaro/Zepbound): Evidence, Safety, and FDA Status (2026)',
  description: 'Evidence-first overview of tirzepatide, including dual GIP/GLP-1 pharmacology, SURMOUNT and cardiovascular outcome data, safety, and current FDA compounding status.',
  path: '/guides/other/tirzepatide/',
})

const HEADINGS: Heading[] = [
  { id: 'understanding', text: 'What Is Tirzepatide?', level: 2 },
  { id: 'mechanism', text: 'Mechanism of Action', level: 2 },
  { id: 'evidence', text: 'What the Evidence Shows', level: 2 },
  { id: 'legal', text: 'FDA & Compounding Status', level: 2 },
  { id: 'safety', text: 'Safety Considerations', level: 2 },
  { id: 'bottom-line', text: 'Bottom Line', level: 2 },
]

const TIRZEPATIDE_REFS = [
  { n: 1, text: 'Jastreboff AM, et al. Tirzepatide once weekly for the treatment of obesity. N Engl J Med. 2022;387:205-216.', url: 'https://pubmed.ncbi.nlm.nih.gov/35658024/' },
  { n: 2, text: 'Frías JP, et al. Tirzepatide versus semaglutide once weekly in patients with type 2 diabetes. N Engl J Med. 2021;385:503-515.', url: 'https://pubmed.ncbi.nlm.nih.gov/34170647/' },
  { n: 3, text: 'Aronne LJ, et al. Tirzepatide as compared with semaglutide for the treatment of obesity. N Engl J Med. 2025;393:26-36.', url: 'https://pubmed.ncbi.nlm.nih.gov/40353578/' },
  { n: 4, text: 'Nicholls SJ, et al. Cardiovascular outcomes with tirzepatide versus dulaglutide in type 2 diabetes. N Engl J Med. 2025;393:2409-2420.', url: 'https://pubmed.ncbi.nlm.nih.gov/41406444/' },
  { n: 5, text: 'FDA. FDA approves first medication for obstructive sleep apnea. December 20, 2024.', url: 'https://www.fda.gov/news-events/press-announcements/fda-approves-first-medication-obstructive-sleep-apnea' },
  { n: 6, text: 'FDA. FDA clarifies policies for compounders as national GLP-1 supply begins to stabilize. Updated April 1, 2026.', url: 'https://www.fda.gov/drugs/drug-alerts-and-statements/fda-clarifies-policies-compounders-national-glp-1-supply-begins-stabilize' },
  { n: 7, text: 'FDA. FDA proposes to exclude semaglutide, tirzepatide, and liraglutide on 503B Bulks List. April 30, 2026.', url: 'https://www.fda.gov/news-events/press-announcements/fda-proposes-exclude-semaglutide-tirzepatide-and-liraglutide-503b-bulks-list' },
]

export default function Page() {
  const toc = <TableOfContents headings={HEADINGS} />

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Guides', href: '/guides' },
    { label: 'Tirzepatide: Evidence, Safety, and FDA Status' },
  ]

  return (
    <ArticleLayout toc={toc}>
      <div className="space-y-8">
        <AuthorityBreadcrumbs items={breadcrumbs} />

        <section className="hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8">
          <p className="eyebrow-label">Prescription GIP/GLP-1 Guide</p>
          <h1 className="mt-2 text-3xl font-semibold text-ink sm:text-4xl">Tirzepatide: Evidence, Safety, and FDA Status</h1>
          <p className="detail-reading mt-4 text-muted">
            Tirzepatide has a large randomized-trial evidence base for diabetes and obesity, direct obesity head-to-head data against semaglutide, and a completed cardiovascular outcomes trial. Those approved-drug data should remain separate from the regulatory status of compounded products.
          </p>

          <figure className="mt-6">
            <div className="overflow-hidden rounded-2xl border border-brand-900/10 shadow-sm bg-white">
              <Image
                src="/images/guides/tirzepatide.jpg"
                alt="A dual GIP and GLP-1 medication injection pen on a clinical surface"
                width={1536}
                height={1024}
                priority
                className="w-full h-auto"
              />
            </div>
            <figcaption className="mt-3 text-center text-sm text-muted">
              Tirzepatide — approved-drug outcomes and compounded-product rules are separate evidence questions.
            </figcaption>
          </figure>
        </section>

        <section className="rounded-2xl border border-rose-900/15 bg-rose-50/80 p-5 text-sm leading-6 text-rose-950">
          <p className="font-semibold">Prescription-drug notice</p>
          <p className="mt-2">
            FDA-approved tirzepatide products are prescription medicines. Compounded tirzepatide is not FDA-approved and does not undergo FDA premarket review for safety, effectiveness, or manufacturing quality.
          </p>
        </section>

        <AffiliateDisclosure />

        <section className="prose-section space-y-6">
          <div className="card-premium p-6">
            <p className="text-sm font-semibold text-brand-700 uppercase tracking-wide">Review status</p>
            <p className="mt-3 text-sm text-muted">Evidence and regulatory wording reviewed August 12, 2026 against current trial publications and FDA compounding material.</p>
          </div>

          <div id="understanding" className="scroll-mt-20">
            <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">What Is Tirzepatide?</h2>
            <p className="text-muted leading-relaxed">
              Tirzepatide is a dual glucose-dependent insulinotropic polypeptide (GIP) and GLP-1 receptor agonist used in FDA-approved prescription products including Mounjaro and Zepbound. Zepbound is approved for chronic weight management and, in adults with obesity, moderate-to-severe obstructive sleep apnea; Mounjaro is used for type 2 diabetes.
            </p>
          </div>

          <div id="mechanism" className="scroll-mt-20">
            <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">Mechanism of Action</h2>
            <ul className="list-disc pl-5 space-y-2 text-muted leading-relaxed">
              <li><strong>Dual receptor agonism:</strong> activates both GIP and GLP-1 receptors rather than GLP-1 alone.</li>
              <li><strong>Glucose-dependent insulin secretion:</strong> supports insulin release when glucose is elevated.</li>
              <li><strong>Appetite and energy intake:</strong> central and gastrointestinal signaling contributes to lower energy intake and weight loss.</li>
              <li><strong>Mechanistic uncertainty remains:</strong> the clinical effect of the combined molecule is well demonstrated, but the exact contribution of GIP signaling to each downstream outcome is still an active research question.</li>
            </ul>
          </div>

          <div id="evidence" className="scroll-mt-20">
            <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">What the Evidence Shows</h2>
            <ul className="list-disc pl-5 space-y-2 text-muted leading-relaxed">
              <li><span className="font-semibold text-ink">Obesity:</span> in SURMOUNT-1, mean body-weight change at 72 weeks was about −20.9% with the 15 mg dose under the treatment-regimen estimand, versus −3.1% with placebo.</li>
              <li><span className="font-semibold text-ink">Type 2 diabetes:</span> the SURPASS program demonstrated substantial glycemic and weight effects; SURPASS-2 directly compared tirzepatide with semaglutide 1 mg in people with type 2 diabetes.</li>
              <li><span className="font-semibold text-ink">Direct obesity comparison:</span> SURMOUNT-5, published in 2025, found greater mean weight reduction with maximum tolerated tirzepatide than with maximum tolerated semaglutide after 72 weeks in adults with obesity without diabetes.</li>
              <li><span className="font-semibold text-ink">Obstructive sleep apnea:</span> FDA approved Zepbound in December 2024 for moderate-to-severe OSA in adults with obesity, alongside reduced-calorie diet and increased physical activity.</li>
              <li><span className="font-semibold text-ink">Cardiovascular outcomes:</span> SURPASS-CVOT is no longer an ongoing evidence gap. Published results found tirzepatide noninferior to dulaglutide for cardiovascular death, myocardial infarction, or stroke in people with type 2 diabetes and atherosclerotic cardiovascular disease; superiority over dulaglutide was not established for the primary endpoint.</li>
            </ul>
            <p className="text-muted leading-relaxed">
              <strong>Evidence quality: strong for studied indications and populations.</strong> Direct trials now support several claims that previously rested on indirect or emerging data, but those results should still be described with their actual comparator, population, dose, and endpoint.
            </p>
          </div>

          <div id="legal" className="scroll-mt-20">
            <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">FDA &amp; Compounding Status (August 2026)</h2>
            <p className="text-muted leading-relaxed">
              FDA determined the tirzepatide injection shortage was resolved in December 2024. Shortage-related enforcement discretion that had allowed broader production of essentially copies has ended.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-muted leading-relaxed">
              <li><strong>Section 503A pharmacies and physicians:</strong> patient-specific compounding can qualify for statutory exemptions when all 503A conditions are met, including restrictions against regularly or in inordinate amounts making products that are essentially copies of commercially available drugs.</li>
              <li><strong>Section 503B outsourcing facilities:</strong> FDA states that tirzepatide is not currently on the 503B bulks list and is not on the drug-shortage list, so outsourcing facilities cannot rely on shortage status as a basis for routine bulk compounding.</li>
              <li><strong>503B bulks-list proposal:</strong> FDA proposed on April 30, 2026 to exclude tirzepatide, semaglutide, and liraglutide from the 503B bulks list after finding no clinical need for outsourcing-facility bulk compounding. FDA described this as a proposal and said public comments would be considered before a final determination.</li>
            </ul>
            <p className="text-muted leading-relaxed">
              <strong>Practical reading:</strong> the rules are more specific than saying all compounded tirzepatide simply requires a generic physician letter of “clinical necessity.” The statutory pathway, whether a product is essentially a copy, the source of the bulk drug substance, and the applicable 503A or 503B conditions matter.
            </p>
          </div>

          <div id="safety" className="scroll-mt-20">
            <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">Safety Considerations</h2>
            <ul className="list-disc pl-5 space-y-2 text-muted leading-relaxed">
              <li><strong>Common adverse effects:</strong> nausea, diarrhea, vomiting, constipation, and other gastrointestinal symptoms are common, particularly during dose escalation.</li>
              <li><strong>Important warnings:</strong> FDA labeling addresses pancreatitis, gallbladder disease, hypoglycemia in relevant drug combinations, kidney injury related to volume depletion, and pulmonary aspiration during general anesthesia or deep sedation.</li>
              <li><strong>Boxed warning:</strong> thyroid C-cell tumors occurred in rats; use is contraindicated in people with a personal or family history of medullary thyroid carcinoma or MEN 2.</li>
              <li><strong>Pregnancy:</strong> weight-loss treatment is not appropriate during pregnancy; product-specific labeling should guide reproductive questions.</li>
              <li><strong>Compounded products:</strong> efficacy and safety data for FDA-approved tirzepatide products do not establish equivalent identity, concentration accuracy, sterility, delivery performance, or quality for compounded preparations.</li>
            </ul>
          </div>

          <div id="bottom-line" className="scroll-mt-20">
            <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">Bottom Line</h2>
            <p className="text-muted leading-relaxed">
              Tirzepatide has strong randomized evidence for diabetes and obesity, direct obesity comparison data against semaglutide, an FDA-approved OSA indication for Zepbound, and a completed cardiovascular outcomes trial. In 2026, the main wording trap is regulatory: shortage resolution, 503A patient-specific compounding, 503B bulk-compounding restrictions, and FDA approval are different concepts and should not be collapsed into one blanket statement about compounded access.
            </p>
          </div>
        </section>

        <div className="mt-8 flex gap-4 flex-wrap">
          <Link href="/guides/" className="text-sm font-medium text-emerald-700 hover:underline">Back to guides &rarr;</Link>
          <Link href="/compounds/tirzepatide/" className="text-sm font-medium text-emerald-700 hover:underline">View Tirzepatide compound profile &rarr;</Link>
          <Link href="/guides/other/semaglutide/" className="text-sm font-medium text-emerald-700 hover:underline">Read the Semaglutide guide &rarr;</Link>
        </div>
      </div>
      <References refs={TIRZEPATIDE_REFS} />
    </ArticleLayout>
  )
}
