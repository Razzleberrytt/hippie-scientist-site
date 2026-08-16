import type { Metadata } from 'next'
import RecommendationSection from '@/components/RecommendationSection'
import { getRevenueProductSet } from '@/config/revenue-products'
import Link from 'next/link'
import Image from 'next/image'
import { buildPageMetadata } from '../../../../src/lib/seo'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import LegacyGuideFAQ from '@/components/LegacyGuideFAQ'
import LegacyGuideQuickAnswer from '@/components/LegacyGuideQuickAnswer'
import References from '@/components/References'
import EmailCapture from '../../../../components/EmailCapture'

export const metadata: Metadata = buildPageMetadata({
  title: 'Green Tea & EGCG: Extract Safety, Liver Risk & Evidence (2026)',
  description:
    'Evidence-first green tea and EGCG guide separating brewed tea from concentrated extracts, liver-injury evidence, weight-loss effect size, and why no universal supplemental EGCG safety threshold has been established.',
  path: '/guides/other/green-tea-egcg-guide/',
  openGraphType: 'article',
})

const FAQS = [
  {
    question: 'Is green tea extract safe for the liver?',
    answer:
      'Green tea extract has a documented liver-injury signal. EFSA found that supplemental EGCG doses at 800 mg/day or above can be associated with liver-enzyme elevations, but importantly could not identify a universally safe supplemental dose below that amount from the available evidence. NIH also notes that some green-tea extracts can cause liver damage, especially when taken on an empty stomach. A fixed internet cutoff should not be treated as a guarantee of safety.',
  },
  {
    question: 'Is brewed green tea safer than green tea extract?',
    answer:
      'Yes, the safety profile is different. EFSA concluded that catechins from green-tea infusions and similar beverages are generally safe, while concentrated supplements have the clearer liver-safety concern. Rare liver injury has still been reported with large green-tea intake, so “generally safe” is more accurate than “zero risk.”',
  },
  {
    question: 'Does green tea or EGCG cause meaningful weight loss?',
    answer:
      'The average effect is small. Recent randomized-trial meta-analyses report modest reductions in body weight and related measures, often well under 1-2 kg on average, with low or variable certainty. That is not comparable to an approved weight-loss medicine and does not create a strong reason to accept concentrated-extract risk.',
  },
  {
    question: 'Is matcha automatically safer or better than extract?',
    answer:
      'Not automatically. Matcha is a powdered tea food rather than the same thing as a concentrated extract, but catechin and caffeine content vary by product and serving. The evidence does not justify a universal “best form” ranking or a fixed EGCG-per-serving assumption for all matcha products.',
  },
  {
    question: 'What symptoms should prompt stopping a green tea extract?',
    answer:
      'Potential liver-injury symptoms such as jaundice, dark urine, persistent nausea or vomiting, unusual fatigue, or right-upper-abdominal pain warrant stopping the product and seeking medical evaluation. People with liver disease, multiple medicines, pregnancy, or other important health conditions should not treat concentrated green-tea extract as a routine wellness product without review.',
  },
] as const

const GREENTEA_REFS = [
  {
    n: 1,
    text: 'European Food Safety Authority. (2018). Safety of green tea catechins. EFSA concluded green-tea infusions are generally safe; supplemental EGCG at 800 mg/day or above may pose liver concerns, and a safe supplemental dose below that level could not be established.',
    url: 'https://www.efsa.europa.eu/en/press/news/180418',
  },
  {
    n: 2,
    text: 'NIH Office of Dietary Supplements. Dietary Supplements for Immune Function and Infectious Diseases — Green Tea safety section. Notes liver-injury reports and higher risk with some extracts, especially on an empty stomach.',
    url: 'https://ods.od.nih.gov/factsheets/ImmuneFunction-HealthProfessional/',
  },
  {
    n: 3,
    text: 'LiverTox. Green Tea. National Institute of Diabetes and Digestive and Kidney Diseases. Clinically apparent liver injury has been linked to green-tea extract and, more rarely, large green-tea intake.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/31643260/',
  },
  {
    n: 4,
    text: 'Effects of green tea supplementation on obesity indices and adipokines in adults: a GRADE-assessed systematic review and dose-response meta-analysis of randomized controlled trials. (2025).',
    url: 'https://pubmed.ncbi.nlm.nih.gov/40326418/',
  },
  {
    n: 5,
    text: 'Comparative effects of tea and coffee drinking on body weight in adults: a systematic review and network meta-analysis of randomized trials. (2024).',
    url: 'https://pubmed.ncbi.nlm.nih.gov/39497467/',
  },
]

const formRows = [
  {
    form: 'Brewed green tea',
    evidence: 'EFSA considers catechins from green-tea infusions generally safe [1].',
    limitation: 'Catechin and caffeine content vary; rare liver injury has been reported with very large intake [3].',
    interpretation: 'Food/beverage context with the strongest safety margin of the forms compared here.',
  },
  {
    form: 'Matcha / powdered tea',
    evidence: 'Whole powdered tea rather than a standardized extract.',
    limitation: 'Serving composition varies; no universal EGCG-per-serving number or “best form” status applies.',
    interpretation: 'Judge the actual product and serving rather than assuming equivalence to either brewed tea or extract.',
  },
  {
    form: 'Concentrated green-tea extract',
    evidence: 'Clearer liver-safety signal in supplements; ≥800 mg/day EGCG has produced liver-enzyme elevations in trials [1,2].',
    limitation: 'EFSA could not establish a universally safe supplemental dose below 800 mg/day [1].',
    interpretation: 'Do not convert a lower number into a guaranteed-safe threshold.',
  },
]

export default function GreenTeaEGCGPage() {
  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd
        title="Green Tea and EGCG: Extract Safety, Liver Risk and Evidence"
        description="Evidence review separating brewed green tea from concentrated EGCG extracts, with liver-safety and weight-effect boundaries."
        url="https://thehippiescientist.net/guides/other/green-tea-egcg-guide"
        type="MedicalWebPage"
        citationUrls={GREENTEA_REFS.map((ref) => ref.url)}
      />
      <AuthorityBreadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Guides', href: '/guides/' }, { label: 'Green Tea & EGCG' }]} />

      <section className="space-y-5 max-w-4xl">
        <p className="eyebrow-label">Evidence Review · Beverage vs extract matters</p>
        <h1 className="text-5xl font-bold tracking-tight text-ink">Green Tea and EGCG: Concentration Changes the Risk</h1>
        <p className="text-lg leading-8 text-muted">
          Brewed green tea, matcha, and concentrated green-tea extracts are often treated as interchangeable because they share catechins such as EGCG. They are not interchangeable exposures. The strongest safety concern belongs to concentrated extracts, where liver injury has been documented and no universal “safe below this dose” threshold has been established.
        </p>
        <figure className="mt-6">
          <div className="overflow-hidden rounded-2xl border border-brand-900/10 shadow-sm bg-white">
            <Image src="/images/guides/green-tea-egcg-guide.jpg" alt="Green tea leaves, matcha, brewed tea, and extract capsules compared" width={1536} height={1024} priority className="w-full h-auto" />
          </div>
          <figcaption className="mt-3 text-center text-sm text-muted">A tea beverage and a concentrated extract can contain the same catechin family while carrying very different exposure and safety questions.</figcaption>
        </figure>
      </section>

      <LegacyGuideQuickAnswer referencesHref="#references">
        <p>
          <strong>Brewed green tea is generally safe; concentrated green-tea extract has a documented liver-injury signal.</strong> EFSA found liver-enzyme concerns at supplemental EGCG intakes of 800 mg/day or above, but could not identify a universally safe supplemental dose below that level [1]. NIH likewise notes that some extracts can cause liver damage, particularly when taken on an empty stomach [2]. Weight-loss effects in randomized-trial meta-analyses are small on average [4,5], so concentrated extract should not be treated like a high-value weight-loss intervention.
        </p>
      </LegacyGuideQuickAnswer>

      <section id="green-tea-form-evidence" data-answer-engine-table="true" className="card-premium scroll-mt-24 p-6 space-y-4 max-w-5xl">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Tea, matcha, and extract are different exposure categories</h2>
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-left text-sm">
            <caption className="sr-only">Green tea forms compared by safety evidence, limitations, and practical interpretation</caption>
            <thead>
              <tr className="border-b border-brand-900/10 text-ink">
                <th scope="col" className="py-3 pr-4">Form</th>
                <th scope="col" className="py-3 pr-4">What evidence supports</th>
                <th scope="col" className="py-3 pr-4">Main limitation</th>
                <th scope="col" className="py-3">Practical interpretation</th>
              </tr>
            </thead>
            <tbody className="text-muted">
              {formRows.map((row) => (
                <tr key={row.form} className="border-b border-brand-900/5 last:border-0 align-top">
                  <th scope="row" className="py-3 pr-4 text-left font-semibold text-ink">{row.form}</th>
                  <td className="py-3 pr-4">{row.evidence}</td>
                  <td className="py-3 pr-4">{row.limitation}</td>
                  <td className="py-3">{row.interpretation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card-premium p-6 space-y-4 max-w-4xl">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Why 800 mg is not a safety target—and 400 mg is not a proven safe line</h2>
        <p className="text-sm leading-7 text-muted">
          EFSA reviewed human evidence linking supplemental green-tea catechins to liver effects. At 800 mg/day EGCG, some trials showed initial signs of liver injury, but the agency also emphasized that the available data did <strong>not</strong> allow a safe supplemental dose below 800 mg/day to be identified [1]. That distinction matters: an observed problem threshold is not the same thing as a validated safe ceiling.
        </p>
        <p className="text-sm leading-7 text-muted">
          NIH notes that liver damage has been reported with green-tea extracts and that risk may be higher when extracts are taken on an empty stomach [2]. Taking a product with food may change exposure, but it does not turn an arbitrary dose cutoff into a guarantee of safety.
        </p>
      </section>

      <section className="card-premium p-6 space-y-4 max-w-4xl">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Weight loss: statistically detectable does not mean clinically large</h2>
        <p className="text-sm leading-7 text-muted">
          Recent randomized-trial syntheses generally find small average changes in body weight or body-composition measures with green-tea interventions [4,5]. One 2025 meta-analysis reported an average body-weight difference of less than 1 kg, while a 2024 network meta-analysis found small weight effects with low to very-low certainty [4,5]. Different preparations, caffeine content, populations, and trial designs make a single “EGCG burns X% more fat” claim misleading.
        </p>
        <p className="text-sm leading-7 text-muted">
          That effect size is important for the risk-benefit decision: a concentrated extract with a liver-injury signal should not be sold as though it offers drug-like weight-loss benefit.
        </p>
      </section>

      <section className="rounded-2xl border border-amber-900/15 bg-amber-50/70 p-6 text-amber-950 dark:border-amber-200/20 dark:bg-amber-950/20 dark:text-amber-50">
        <p className="text-xs font-bold uppercase tracking-[0.16em]">Liver-safety boundary</p>
        <h2 className="mt-2 text-2xl font-semibold">Concentrated extract deserves more caution than a tea beverage</h2>
        <p className="mt-3 text-sm leading-7">
          LiverTox documents clinically apparent acute liver injury from green-tea extract and rare reports after very large green-tea intake [3]. Jaundice, dark urine, persistent nausea or vomiting, unusual fatigue, or right-upper-abdominal pain after starting an extract are reasons to stop the product and seek medical evaluation. Existing liver disease, pregnancy, or complex medication use also changes the decision.
        </p>
        <Link href="/safety-checker/" className="mt-5 inline-flex rounded-full bg-amber-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-950 dark:bg-amber-100 dark:text-amber-950">
          Check supplement interactions
        </Link>
      </section>

      <References refs={GREENTEA_REFS} />
      <LegacyGuideFAQ pagePath="/guides/other/green-tea-egcg-guide/" questions={[...FAQS]} />

      <div className="max-w-4xl">
        <RecommendationSection
          title="Green-tea extract sourcing examples"
          description="Product links are sourcing examples, not a claim that concentrated extract is necessary or that any fixed EGCG dose is universally safe. Compare exact catechin content, other ingredients, testing, medication context, and liver-safety warnings before considering a product."
          products={getRevenueProductSet('green-tea-extract')?.products ?? []}
        />
      </div>

      <EmailCapture headline="Get evidence reviews like this" description="Green tea, EGCG, and liver-safety evidence without invented safe-dose rules." ctaLabel="Get the evidence" location="guide-green-tea" />
      <div className="pt-4 border-t border-brand-900/10 flex items-center justify-between">
        <Link href="/guides/" className="inline-flex rounded-full border border-brand-900/10 bg-[var(--surface-card)] px-4 py-2 text-sm font-bold text-ink transition hover:bg-brand-50">← Back to guides</Link>
        <Link href="/info/supplement-safety-checklist/" className="text-sm font-bold text-brand-800 hover:underline">Safety checklist →</Link>
      </div>
    </div>
  )
}
