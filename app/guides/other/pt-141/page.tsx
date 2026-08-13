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
  title: 'Bremelanotide (PT-141/Vyleesi): Evidence, Safety, and FDA Status (2026)',
  description: 'Evidence-first overview of bremelanotide (PT-141), including the FDA-approved Vyleesi indication, RECONNECT trial evidence, cardiovascular precautions, and gray-market product limitations.',
  path: '/guides/other/pt-141/',
})

const HEADINGS: Heading[] = [
  { id: 'understanding', text: 'What Is Bremelanotide?', level: 2 },
  { id: 'mechanism', text: 'Mechanism of Action', level: 2 },
  { id: 'evidence', text: 'What the Evidence Shows', level: 2 },
  { id: 'legal', text: 'FDA & Product Status', level: 2 },
  { id: 'safety', text: 'Safety Considerations', level: 2 },
  { id: 'bottom-line', text: 'Bottom Line', level: 2 },
]

const PT_141_REFS = [
  { n: 1, text: 'Kingsberg SA, et al. Bremelanotide for the treatment of hypoactive sexual desire disorder: two randomized phase 3 trials. Obstet Gynecol. 2019;134:899-908.', url: 'https://pubmed.ncbi.nlm.nih.gov/31599840/' },
  { n: 2, text: 'DailyMed. Vyleesi (bremelanotide injection) current prescribing information.', url: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=f1d0c1b5-2f39-4bad-a6a4-0066e3ad5dcf' },
  { n: 3, text: 'Diamond LE, et al. Double-blind, placebo-controlled evaluation of intranasal PT-141 in men with erectile dysfunction. Int J Impot Res. 2004;16:51-59.', url: 'https://pubmed.ncbi.nlm.nih.gov/14963472/' },
]

export default function Page() {
  const toc = <TableOfContents headings={HEADINGS} />

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Guides', href: '/guides' },
    { label: 'Bremelanotide (PT-141/Vyleesi): Evidence, Safety, and FDA Status' },
  ]

  return (
    <ArticleLayout toc={toc} zone="harm-reduction">
      <div className="space-y-8">
        <AuthorityBreadcrumbs items={breadcrumbs} />

        <section className="hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8">
          <p className="eyebrow-label">Prescription Drug &amp; Gray-Market Context</p>
          <h1 className="mt-2 text-3xl font-semibold text-ink sm:text-4xl">Bremelanotide (PT-141/Vyleesi): Evidence, Safety, and FDA Status</h1>
          <p className="detail-reading mt-4 text-muted">
            Bremelanotide is unusual among compounds marketed as “peptides”: an FDA-approved prescription product exists, but its evidence and labeling apply to a specific indication and product—not automatically to gray-market PT-141 sold online.
          </p>

          <figure className="mt-6">
            <div className="overflow-hidden rounded-2xl border border-brand-900/10 shadow-sm bg-white">
              <Image
                src="/images/guides/pt-141.jpg"
                alt="A peptide vial on a clinical laboratory surface"
                width={1536}
                height={1024}
                priority
                className="w-full h-auto"
              />
            </div>
            <figcaption className="mt-3 text-center text-sm text-muted">
              Bremelanotide — distinguish FDA-reviewed Vyleesi from unapproved products marketed as PT-141.
            </figcaption>
          </figure>
        </section>

        <section className="rounded-2xl border border-rose-900/15 bg-rose-50/80 p-5 text-sm leading-6 text-rose-950">
          <p className="font-semibold">Approved product vs. gray-market product</p>
          <p className="mt-2">
            Vyleesi is an FDA-approved prescription bremelanotide product. A vial or powder sold online as “PT-141,” including one labeled for research use, is not thereby Vyleesi and has not inherited the approved product's FDA review for identity, manufacturing quality, safety, or effectiveness.
          </p>
        </section>

        <AffiliateDisclosure />

        <section className="prose-section space-y-6">
          <div className="card-premium p-6">
            <p className="text-sm font-semibold text-brand-700 uppercase tracking-wide">Review status</p>
            <p className="mt-3 text-sm text-muted">Clinical and labeling language reviewed August 12, 2026 against current Vyleesi prescribing information and the phase 3 RECONNECT publication.</p>
          </div>

          <div id="understanding" className="scroll-mt-20">
            <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">What Is Bremelanotide?</h2>
            <p className="text-muted leading-relaxed">
              Bremelanotide is a melanocortin receptor agonist. “PT-141” is the development name still commonly used in research and gray-market advertising. The FDA-approved product, Vyleesi, is indicated for <strong>acquired, generalized hypoactive sexual desire disorder (HSDD) in premenopausal women</strong> when the low desire causes marked distress or interpersonal difficulty and is not due to another medical or psychiatric condition, relationship problems, or the effects of a medication or drug substance.
            </p>
            <p className="text-muted leading-relaxed">
              The current label specifically says Vyleesi is not indicated for HSDD in postmenopausal women or in men and is not indicated to enhance sexual performance.
            </p>
          </div>

          <div id="mechanism" className="scroll-mt-20">
            <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">Mechanism of Action</h2>
            <ul className="list-disc pl-5 space-y-2 text-muted leading-relaxed">
              <li><strong>Melanocortin receptor agonism:</strong> bremelanotide activates melanocortin receptors, including MC4R, in pathways involved in sexual desire and arousal.</li>
              <li><strong>Central rather than PDE5-style vascular action:</strong> its pharmacology differs from sildenafil and other PDE5 inhibitors; that mechanistic difference does not make it an established substitute for erectile-dysfunction therapy.</li>
              <li><strong>Mechanism is not the indication:</strong> activity in sexual-arousal pathways does not establish efficacy for every libido, erectile-function, or performance claim used in online marketing.</li>
            </ul>
          </div>

          <div id="evidence" className="scroll-mt-20">
            <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">What the Evidence Shows</h2>
            <ul className="list-disc pl-5 space-y-2 text-muted leading-relaxed">
              <li><span className="font-semibold text-ink">Approved HSDD indication:</span> the two randomized, double-blind, placebo-controlled phase 3 RECONNECT trials enrolled premenopausal women with HSDD and found statistically significant improvements in sexual desire and reductions in distress related to low desire.</li>
              <li><span className="font-semibold text-ink">Magnitude and endpoint matter:</span> the registration evidence supports a defined HSDD treatment effect; it should not be translated into a blanket “libido enhancer” or sexual-performance claim.</li>
              <li><span className="font-semibold text-ink">Men / erectile dysfunction:</span> earlier studies explored PT-141 in men, but Vyleesi is not FDA-approved for men or for erectile dysfunction. Those exploratory data are a different evidence base from the phase 3 HSDD program.</li>
            </ul>
            <p className="text-muted leading-relaxed">
              <strong>Evidence quality: strong for the FDA-reviewed indication and substantially weaker for the broader uses commonly attached to “PT-141” marketing.</strong>
            </p>
          </div>

          <div id="legal" className="scroll-mt-20">
            <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">FDA &amp; Product Status</h2>
            <ul className="list-disc pl-5 space-y-2 text-muted leading-relaxed">
              <li><strong>Vyleesi:</strong> FDA-approved, prescription-only bremelanotide for the specific HSDD indication described above.</li>
              <li><strong>Gray-market “PT-141”:</strong> a seller's research-use label does not convert an unapproved product into the FDA-approved drug and does not establish equivalent identity, sterility, concentration accuracy, or manufacturing quality.</li>
              <li><strong>Off-label prescribing:</strong> lawful clinician prescribing questions are different from the status of an unapproved product sold directly to consumers. Do not treat the words “off label,” “research use,” and “FDA approved” as interchangeable.</li>
            </ul>
          </div>

          <div id="safety" className="scroll-mt-20">
            <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">Safety Considerations</h2>
            <ul className="list-disc pl-5 space-y-2 text-muted leading-relaxed">
              <li><strong>Cardiovascular contraindications:</strong> current Vyleesi labeling contraindicates use in people with uncontrolled hypertension or known cardiovascular disease.</li>
              <li><strong>Blood pressure and heart rate:</strong> the approved label warns that blood pressure can rise transiently and heart rate can decrease after a dose, generally returning toward baseline within about 12 hours.</li>
              <li><strong>Nausea:</strong> nausea was common in the clinical program and is one of the most important tolerability limitations.</li>
              <li><strong>Focal hyperpigmentation:</strong> the label warns about focal skin and mucosal pigmentation; resolution was not confirmed in every affected patient after discontinuation.</li>
              <li><strong>Product-quality uncertainty:</strong> these label data describe FDA-reviewed Vyleesi. They do not validate the purity, dose accuracy, sterility, or safety of a gray-market vial sold as PT-141.</li>
            </ul>
          </div>

          <div id="bottom-line" className="scroll-mt-20">
            <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">Bottom Line</h2>
            <p className="text-muted leading-relaxed">
              Bremelanotide has real phase 3 evidence and an FDA-approved product, but only for a defined HSDD population. The existence of Vyleesi is not evidence that every PT-141 product or marketed use is FDA-reviewed. For this compound, the most important distinction is not “peptide vs. drug”; it is <strong>approved product and indication vs. unapproved product or unsupported use</strong>.
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
