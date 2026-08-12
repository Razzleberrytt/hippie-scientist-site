import Link from 'next/link'
import Image from 'next/image'
import JsonLd from '@/components/seo/JsonLd'
import { buildPageMetadata, blogJsonLd, breadcrumbJsonLd, faqPageJsonLd, compactMetaTitle } from '../../../../src/lib/seo'
import EvidenceSummaryCard from '@/components/evidence/EvidenceSummaryCard'
import SafetyNotice from '@/components/evidence/SafetyNotice'
import EmailCapture from '@/components/EmailCapture'
import NewsletterCtaBlock from '@/components/NewsletterCtaBlock'
import LastUpdatedBadge from '../../../../src/components/editorial/LastUpdatedBadge'
import ResponsiveTable from '@/components/ui/ResponsiveTable'

const SLUG = 'cbd-vs-ashwagandha-for-anxiety'
const TITLE = 'CBD vs Ashwagandha for Anxiety: What the Evidence Supports in 2026'
const DESCRIPTION =
  'Evidence-first comparison of CBD and ashwagandha for anxiety and stress, with trial directness, FDA regulatory context, medication interactions, and safety limits.'
const DATE = '2026-06-10'
const UPDATED_DATE = '2026-08-12'

export const metadata = buildPageMetadata({
  title: compactMetaTitle(TITLE),
  description: DESCRIPTION,
  path: `/guides/anxiety/${SLUG}`,
  openGraphType: 'article',
})

const SOURCES = [
  {
    label: 'CBD anxiety systematic review and meta-analysis (2024)',
    href: 'https://pubmed.ncbi.nlm.nih.gov/38924898/',
    note: 'Eight eligible studies / 316 participants were pooled. The meta-analysis found an anxiety signal but explicitly cautioned that the clinical sample was small.',
  },
  {
    label: 'CBD randomized-trial systematic review (2024)',
    href: 'https://pubmed.ncbi.nlm.nih.gov/39598172/',
    note: 'Review of randomized clinical trials across anxiety disorders; study designs, populations, doses, and CBD interventions were heterogeneous.',
  },
  {
    label: 'FDA: products containing cannabis or cannabis-derived compounds',
    href: 'https://www.fda.gov/consumers/consumer-updates/what-you-need-know-and-what-were-working-find-out-about-products-containing-cannabis-or-cannabis',
    note: 'FDA warns that CBD can cause liver injury, interact with medications, and increase sedation with alcohol or other CNS depressants. FDA has not approved consumer CBD products for anxiety.',
  },
  {
    label: 'NCCIH: cannabis, cannabinoids, and CBD',
    href: 'https://www.nccih.nih.gov/health/cannabis-marijuana-and-cannabinoids-what-you-need-to-know',
    note: 'NCCIH describes only a small amount of human evidence for anxiety and notes product-label variability, contamination risk, liver injury, sedation, and drug interactions.',
  },
  {
    label: 'Ashwagandha stress and anxiety meta-analysis (2024)',
    href: 'https://pubmed.ncbi.nlm.nih.gov/39348746/',
    note: 'Nine randomized controlled trials / 558 participants using specific ashwagandha formulations versus placebo; pooled stress, anxiety, and cortisol outcomes favored ashwagandha, with long-term safety still uncertain.',
  },
  {
    label: 'NCCIH: Ashwagandha usefulness and safety',
    href: 'https://www.nccih.nih.gov/health/ashwagandha',
    note: 'NCCIH says some preparations may help stress, while evidence for anxiety remains unclear; it also lists thyroid, autoimmune, pregnancy, medication-interaction, and rare liver-injury cautions.',
  },
]

const FAQS = [
  {
    question: 'Is CBD or ashwagandha better for anxiety?',
    answer:
      'Current evidence does not establish a universal winner. CBD has a small, heterogeneous anxiety-trial literature, while ashwagandha has a broader repeated-dose stress/anxiety trial base using specific preparations. Neither should be presented as a replacement for evidence-based care for an anxiety disorder.',
  },
  {
    question: 'Does CBD work quickly for anxiety?',
    answer:
      'Product absorption can begin at different speeds depending on formulation, but pharmacokinetic onset is not the same thing as proven anxiety relief. The clinical literature does not justify a universal same-hour promise for consumer CBD products.',
  },
  {
    question: 'Can CBD and ashwagandha be taken together?',
    answer:
      'The combination has not been established as more effective or safer than either ingredient alone. CBD can alter medication exposure and can add sedation with alcohol or other CNS depressants; ashwagandha also has medication and condition-specific cautions. Combining them should not be treated as an evidence-based anxiety stack.',
  },
  {
    question: 'Is over-the-counter CBD FDA approved for anxiety?',
    answer:
      'No. FDA has approved one prescription CBD drug for certain seizure disorders, not consumer CBD products for anxiety. FDA also states that CBD cannot currently be lawfully marketed as a dietary supplement under federal law.',
  },
  {
    question: 'Can CBD affect a drug test?',
    answer:
      'Yes. Consumer cannabinoid products may contain THC or be mislabeled, and full-spectrum products intentionally contain other cannabis constituents. Anyone subject to drug testing should treat THC exposure as a practical risk rather than assuming a CBD label guarantees a negative test.',
  },
]

export default function CbdVsAshwagandhaForAnxietyPage() {
  const pageBreadcrumb = breadcrumbJsonLd([
    { name: 'Home', url: 'https://thehippiescientist.net' },
    { name: 'Anxiety', url: 'https://thehippiescientist.net/guides/anxiety/' },
    { name: TITLE, url: `https://thehippiescientist.net/guides/anxiety/${SLUG}/` },
  ])

  const articleLd = blogJsonLd(
    { title: TITLE, slug: SLUG, date: DATE, updated: UPDATED_DATE, description: DESCRIPTION },
    `/guides/anxiety/${SLUG}/`,
  )

  const faqLd = faqPageJsonLd({ pagePath: `/guides/anxiety/${SLUG}/`, questions: FAQS })

  return (
    <>
      <JsonLd schema={articleLd} />
      <JsonLd schema={pageBreadcrumb} />
      {faqLd && <JsonLd schema={faqLd} />}

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <LastUpdatedBadge date={UPDATED_DATE} />
          <h1 className="text-4xl font-bold tracking-tight mt-4 mb-4">{TITLE}</h1>
          <p className="text-xl text-muted-foreground">{DESCRIPTION}</p>

          <figure className="mt-6">
            <div className="overflow-hidden rounded-2xl border border-brand-900/10 shadow-sm bg-white">
              <Image
                src="/images/guides/cbd-vs-ashwagandha-for-anxiety.jpg"
                alt="CBD oil beside ashwagandha root and powder for an evidence comparison"
                width={1536}
                height={1024}
                priority
                className="w-full h-auto"
              />
            </div>
            <figcaption className="mt-3 text-center text-sm text-muted">
              A product category and a botanical extract should be compared by what was actually studied—not by marketing claims about calm or speed.
            </figcaption>
          </figure>
        </div>

        <section className="mb-10 rounded-xl border border-brand-900/10 bg-brand-50/50 p-6">
          <h2 className="text-2xl font-semibold mb-4">Bottom line</h2>
          <div className="space-y-3 text-muted-foreground">
            <p>
              <strong>CBD:</strong> human anxiety research is promising enough to study further, but the direct clinical base is still small and heterogeneous. A 2024 meta-analysis pooled only eight studies / 316 participants. Consumer CBD products are not FDA-approved anxiety treatments.
            </p>
            <p>
              <strong>Ashwagandha:</strong> the 2024 meta-analysis pooled nine randomized trials / 558 participants and found stress/anxiety signals with specific formulations. NCCIH still describes the evidence for anxiety as unclear, and the result should not be generalized to every powder, tea, gummy, or extract.
            </p>
            <p>
              The most important difference is not “which works faster.” CBD carries a distinct regulatory, liver, sedation, medication-interaction, THC-exposure, and product-quality burden that has to be weighed alongside efficacy evidence.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">What the comparison can—and cannot—tell you</h2>
          <ResponsiveTable label="CBD vs ashwagandha evidence and safety comparison">
            <table className="min-w-[700px] w-full text-sm">
              <thead>
                <tr className="border-b border-brand-900/10">
                  <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">Question</th>
                  <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">CBD</th>
                  <th className="pb-2 text-left text-xs font-bold uppercase tracking-wider text-muted">Ashwagandha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-900/5">
                <tr className="align-top">
                  <td className="py-3 pr-4 font-medium text-ink">Direct anxiety/stress evidence</td>
                  <td className="py-3 pr-4 text-muted">Small, heterogeneous clinical literature; 2024 meta-analysis pooled 8 studies / 316 participants.</td>
                  <td className="py-3 text-muted">Broader repeated-dose stress/anxiety literature; 2024 meta-analysis pooled 9 RCTs / 558 participants using specific formulations.</td>
                </tr>
                <tr className="align-top">
                  <td className="py-3 pr-4 font-medium text-ink">Same-hour relief?</td>
                  <td className="py-3 pr-4 text-muted">Not established as a universal clinical anxiety effect. Absorption speed is not efficacy.</td>
                  <td className="py-3 text-muted">Not established. Most relevant trials used repeated dosing over weeks.</td>
                </tr>
                <tr className="align-top">
                  <td className="py-3 pr-4 font-medium text-ink">FDA status in the U.S.</td>
                  <td className="py-3 pr-4 text-muted">One prescription CBD drug is FDA-approved for certain seizure disorders; consumer CBD is not FDA-approved for anxiety and cannot currently be lawfully marketed as a dietary supplement under federal law.</td>
                  <td className="py-3 text-muted">Sold under the dietary-supplement framework; supplements are not FDA-approved for efficacy before sale.</td>
                </tr>
                <tr className="align-top">
                  <td className="py-3 pr-4 font-medium text-ink">Medication risk</td>
                  <td className="py-3 pr-4 text-muted">Meaningful interaction potential; FDA warns CBD can alter how other medicines work and can add sedation with alcohol or CNS depressants.</td>
                  <td className="py-3 text-muted">NCCIH lists possible interactions with diabetes, blood-pressure, immunosuppressant, sedative, anticonvulsant, and thyroid medicines.</td>
                </tr>
                <tr className="align-top">
                  <td className="py-3 pr-4 font-medium text-ink">Product-transfer problem</td>
                  <td className="py-3 pr-4 text-muted">Trial CBD does not validate every oil, gummy, vape, or mixed-cannabinoid product; labeling and THC contamination can vary.</td>
                  <td className="py-3 text-muted">Trial results belong to the studied preparations and exposure periods, not every root powder or branded extract.</td>
                </tr>
              </tbody>
            </table>
          </ResponsiveTable>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Evidence directness</h2>
          <div className="space-y-6">
            <EvidenceSummaryCard
              title="CBD for anxiety"
              evidenceLevel="Limited"
              humanEvidence="A 2024 systematic review/meta-analysis pooled eight eligible studies with 316 participants and reported an anxiety signal, while explicitly cautioning that the clinical sample was small. Another 2024 randomized-trial review found a heterogeneous literature across anxiety diagnoses, interventions, and study designs."
              mechanisticEvidence="CBD has plausible central nervous system and endocannabinoid-related mechanisms, but mechanism plausibility does not establish that a consumer CBD product treats an anxiety disorder."
              safetyProfile="FDA and NCCIH flag liver injury, medication interactions, sedation/alertness effects, THC or contaminant exposure in consumer products, and substantial uncertainty outside the approved prescription-CBD setting."
            />

            <EvidenceSummaryCard
              title="Ashwagandha for stress and anxiety"
              evidenceLevel="Limited"
              humanEvidence="The 2024 meta-analysis included nine randomized controlled trials / 558 participants using specific ashwagandha formulations versus placebo and reported pooled improvements in perceived stress, Hamilton anxiety scores, and serum cortisol. For an anxiety-specific comparison, directness remains limited because populations, preparations, durations, and outcomes vary and NCCIH considers anxiety evidence unclear."
              mechanisticEvidence="Cortisol and stress-pathway findings can help explain research hypotheses, but they do not make 'lower cortisol' a treatment target or prove a class effect for every ashwagandha product."
              safetyProfile="NCCIH notes short-term tolerability in many users but limited long-term safety data, rare liver injury, pregnancy/breastfeeding avoidance, thyroid and autoimmune cautions, and several medication-interaction categories."
            />
          </div>
        </section>

        <section className="mb-12 rounded-xl border border-amber-200 bg-amber-50/70 p-6">
          <h2 className="text-2xl font-semibold text-amber-950 mb-4">Why CBD product form does not answer the anxiety question</h2>
          <div className="space-y-3 text-amber-950">
            <p>
              Sublingual, oral, inhaled, and other CBD products can differ in absorption. That pharmacokinetic fact does not show that one format delivers reliable anxiety relief within a specific number of minutes.
            </p>
            <p>
              Likewise, a milligram amount used in a clinical study describes that study. It is not a universal consumer dose, especially when trials differ in diagnosis, formulation, purity, route, exposure, and concomitant medication use.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">CBD regulation and product quality</h2>
          <div className="prose prose-lg max-w-none">
            <p>
              In the United States, the FDA has approved one prescription CBD drug for specified seizure disorders. That approval does not extend to over-the-counter CBD oils, gummies, beverages, vapes, or products marketed for anxiety.
            </p>
            <p>
              FDA states that CBD cannot currently be lawfully marketed as a dietary supplement under federal law. State rules for cannabis- and hemp-derived products can differ, so a broad statement that “CBD is legal” is not precise enough for a health guide.
            </p>
            <p>
              NCCIH also notes that nonprescription CBD products may contain more or less CBD than the label states and may contain THC or other contaminants. A certificate of analysis can provide useful product information, but it does not convert an unapproved consumer product into an FDA-evaluated anxiety treatment.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Safety differences that matter more than a ranking</h2>
          <SafetyNotice title="Medication, liver, pregnancy, sedation, and stop-rule boundaries">
            <ul className="ml-5 space-y-2 list-disc">
              <li><strong>CBD:</strong> FDA warns about potential liver injury and clinically meaningful drug interactions. Medication review matters before use, especially when a person already takes prescription medicines.</li>
              <li><strong>CBD + sedatives/alcohol:</strong> FDA warns that combining CBD with alcohol or other drugs that slow brain activity can increase sedation and drowsiness.</li>
              <li><strong>Driving/alertness:</strong> CBD can cause sleepiness or changes in alertness; do not treat a “non-intoxicating” label as proof that driving performance is unaffected.</li>
              <li><strong>Pregnancy/breastfeeding:</strong> FDA advises against CBD use because of unresolved fetal/infant and contamination concerns. NCCIH says ashwagandha should be avoided during pregnancy and not used while breastfeeding.</li>
              <li><strong>Ashwagandha:</strong> NCCIH lists thyroid and autoimmune conditions, surgery, several medication categories, and rare liver injury as important cautions.</li>
              <li><strong>Severe or worsening anxiety:</strong> supplements should not delay evaluation when symptoms are persistent, disabling, associated with panic, major sleep disruption, substance-related problems, or thoughts of self-harm.</li>
            </ul>
          </SafetyNotice>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">What this page does not recommend</h2>
          <ul className="space-y-3 text-muted-foreground">
            <li>• It does not rank CBD or ashwagandha as a replacement for psychotherapy or prescribed treatment.</li>
            <li>• It does not convert CBD absorption speed into a promise of rapid anxiety relief.</li>
            <li>• It does not provide a universal CBD milligram range or tell readers to titrate consumer CBD on their own.</li>
            <li>• It does not recommend a CBD + ashwagandha stack; separate ingredient studies do not validate the combination.</li>
            <li>• It does not treat one branded ashwagandha extract as interchangeable with every ashwagandha product.</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Frequently asked questions</h2>
          <div className="space-y-6">
            {FAQS.map((faq) => (
              <div key={faq.question} className="border-l-4 border-primary pl-4">
                <h3 className="font-semibold text-lg mb-2">{faq.question}</h3>
                <p className="text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Sources and directness notes</h2>
          <ol className="space-y-4">
            {SOURCES.map((source, index) => (
              <li key={source.href} className="text-sm leading-7 text-muted-foreground">
                <span className="font-semibold text-foreground">{index + 1}. </span>
                <a href={source.href} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary underline">
                  {source.label}
                </a>
                <span> — {source.note}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="mb-12 rounded-xl border border-brand-900/10 bg-muted/40 p-6">
          <h2 className="text-xl font-semibold mb-3">Product sourcing note</h2>
          <p className="text-sm leading-7 text-muted-foreground">
            This broad comparison intentionally does not rank or affiliate-link CBD or ashwagandha products. The evidence is preparation-specific, CBD has additional regulatory and contamination concerns, and a comparison page should not make one monetized product category look clinically preferred.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Related evidence guides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/guides/anxiety/natural-anxiety-relief/" className="block p-4 border rounded-lg hover:bg-muted transition-colors">
              Natural anxiety relief: evidence and safety
            </Link>
            <Link href="/guides/herbs/ashwagandha/" className="block p-4 border rounded-lg hover:bg-muted transition-colors">
              Ashwagandha evidence guide
            </Link>
            <Link href="/guides/anxiety/best-herbs-for-anxiety/" className="block p-4 border rounded-lg hover:bg-muted transition-colors">
              Anxiety herbs by evidence directness
            </Link>
            <Link href="/guides/anxiety/anxiety-stack-guide/" className="block p-4 border rounded-lg hover:bg-muted transition-colors">
              Why anxiety stacks need combination evidence
            </Link>
          </div>
        </section>

        <div className="my-12">
          <NewsletterCtaBlock />
          <div className="mt-6">
            <EmailCapture />
          </div>
        </div>
      </div>
    </>
  )
}
