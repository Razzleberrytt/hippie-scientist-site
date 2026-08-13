import Link from 'next/link'
import Image from 'next/image'
import JsonLd from '@/components/seo/JsonLd'
import {
  buildPageMetadata,
  blogJsonLd,
  breadcrumbJsonLd,
  faqPageJsonLd,
  compactMetaTitle,
} from '../../../../src/lib/seo'
import EvidenceSummaryCard from '@/components/evidence/EvidenceSummaryCard'
import SafetyNotice from '@/components/evidence/SafetyNotice'
import EmailCapture from '@/components/EmailCapture'
import NewsletterCtaBlock from '@/components/NewsletterCtaBlock'
import LastUpdatedBadge from '../../../../src/components/editorial/LastUpdatedBadge'
import ResponsiveTable from '@/components/ui/ResponsiveTable'

const SLUG = 'best-herbs-for-sleep'
const TITLE = 'Best Herbs for Sleep: What Human Evidence Supports in 2026'
const DESCRIPTION =
  'Evidence-first guide to ashwagandha, passionflower, valerian, chamomile, and lavender-related sleep evidence, with directness, safety limits, and chronic-insomnia guidance.'
const DATE = '2026-06-09'
const UPDATED_DATE = '2026-08-12'
const AUTHOR = 'Will'
const READING_TIME = '11 min read'

export const metadata = buildPageMetadata({
  title: compactMetaTitle(TITLE),
  description: DESCRIPTION,
  path: `/guides/sleep/${SLUG}`,
  openGraphType: 'article',
})

const SOURCES = [
  {
    label: 'NCCIH: Sleep disorders and complementary health approaches',
    href: 'https://www.nccih.nih.gov/health/sleep-disorders-and-complementary-health-approaches',
    note: 'Current overview of complementary sleep approaches. NCCIH says chamomile evidence is not conclusive, valerian trials are inconsistent and its insomnia value has not been demonstrated, and CBT-I remains the most strongly recommended treatment for insomnia.',
  },
  {
    label: 'Ashwagandha sleep systematic review and meta-analysis (2021)',
    href: 'https://pubmed.ncbi.nlm.nih.gov/34559859/',
    note: 'Five placebo-controlled randomized trials / 400 adults. The pooled sleep effect was small with moderate heterogeneity. Trials used specific standardized extracts, populations, and multi-week regimens rather than a generic as-needed herb protocol.',
  },
  {
    label: 'Valerian insomnia umbrella review (2024)',
    href: 'https://pubmed.ncbi.nlm.nih.gov/38359657/',
    note: 'Eight systematic reviews were included. The review found no evidence of efficacy for treating insomnia, although some subjective sleep-quality signals appeared; the underlying evidence was heterogeneous and low quality.',
  },
  {
    label: 'Passionflower insomnia randomized placebo-controlled trial (2020)',
    href: 'https://pubmed.ncbi.nlm.nih.gov/31714321/',
    note: 'One hundred ten adults with DSM-5 insomnia disorder received passionflower extract or placebo for two weeks. Total sleep time improved versus placebo, while sleep efficiency and wake-after-sleep-onset did not differ significantly between groups.',
  },
  {
    label: 'NCCIH: Passionflower usefulness and safety',
    href: 'https://www.nccih.nih.gov/health/passionflower',
    note: 'NCCIH describes the sleep research as small and mixed. Possible adverse effects include drowsiness, dizziness, and confusion; pregnancy and perioperative cautions apply.',
  },
  {
    label: 'Chamomile systematic review and meta-analysis (2019)',
    href: 'https://pubmed.ncbi.nlm.nih.gov/31006899/',
    note: 'Review of randomized and quasi-randomized trials across anxiety, sleep quality, and insomnia outcomes. NCCIH still concludes that clinical evidence is not conclusive for insomnia.',
  },
  {
    label: 'NCCIH: Ashwagandha usefulness and safety',
    href: 'https://www.nccih.nih.gov/health/ashwagandha',
    note: 'Some preparations may help insomnia or stress, but long-term safety is not established. Pregnancy/breastfeeding, thyroid, autoimmune, liver, surgery, and medication-interaction cautions apply.',
  },
  {
    label: 'AASM: cognitive behavioral therapy for insomnia',
    href: 'https://aasm.org/coding-quarterly-cognitive-behavioral-therapy-for-insomnia/',
    note: 'The American Academy of Sleep Medicine describes CBT-I as the first-line, evidence-based treatment for chronic insomnia.',
  },
]

const FAQS = [
  {
    question: 'What is the best herb for sleep?',
    answer:
      'Current evidence does not support one universal winner. Ashwagandha has a small multi-trial sleep signal from specific standardized extracts. Passionflower has a preliminary two-week insomnia trial. Valerian and chamomile should not be presented as established insomnia treatments, and lavender aromatherapy evidence does not establish that oral lavender products treat insomnia.',
  },
  {
    question: 'Which sleep herb works fastest?',
    answer:
      'The evidence reviewed here does not establish a reliable same-night winner. Ashwagandha trials generally used repeated dosing over weeks, the passionflower insomnia trial lasted two weeks, and valerian/chamomile evidence is too inconsistent to support a dependable onset promise.',
  },
  {
    question: 'Does valerian work for insomnia?',
    answer:
      'A 2024 umbrella review found no evidence of efficacy for treating insomnia, despite some subjective sleep-quality signals. The underlying studies were heterogeneous and generally low quality.',
  },
  {
    question: 'Does passionflower help insomnia?',
    answer:
      'One 110-person randomized placebo-controlled trial in adults with DSM-5 insomnia found a greater increase in total sleep time after two weeks, while several other sleep outcomes did not differ between groups. That is a preliminary signal, not proof of broad insomnia efficacy.',
  },
  {
    question: 'Can sleep herbs be combined?',
    answer:
      'Separate ingredient studies do not prove that a combination is more effective or safer. Combining sedating products can also make side effects and interactions harder to predict and makes it difficult to identify which ingredient caused benefit or harm.',
  },
  {
    question: 'What should I do if insomnia is chronic?',
    answer:
      'CBT-I is the first-line evidence-based treatment for chronic insomnia. Persistent sleep problems also warrant evaluation for causes such as sleep apnea, restless legs, circadian disorders, medication effects, mood disorders, substance use, pain, or insufficient sleep opportunity.',
  },
]

export default function BestHerbsForSleepPage() {
  const pageBreadcrumb = breadcrumbJsonLd([
    { name: 'Guides', url: 'https://thehippiescientist.net/guides/' },
    { name: 'Sleep', url: 'https://thehippiescientist.net/guides/sleep/' },
    { name: TITLE, url: `https://thehippiescientist.net/guides/sleep/${SLUG}/` },
  ])

  const articleLd = blogJsonLd(
    { title: TITLE, slug: SLUG, date: DATE, updated: UPDATED_DATE, description: DESCRIPTION },
    `/guides/sleep/${SLUG}/`,
  )

  const faqLd = faqPageJsonLd({ pagePath: `/guides/sleep/${SLUG}/`, questions: FAQS })

  return (
    <article className="mx-auto max-w-5xl space-y-0 px-4 pb-20 pt-6 sm:px-6 lg:px-8">
      <JsonLd schema={articleLd} />
      <JsonLd schema={pageBreadcrumb} />
      {faqLd ? <JsonLd schema={faqLd} /> : null}

      <nav className="mb-6 flex items-center gap-2 text-sm text-muted" aria-label="Breadcrumb">
        <Link href="/guides/" className="transition hover:text-ink">Guides</Link>
        <span>/</span>
        <Link href="/guides/sleep/" className="transition hover:text-ink">Sleep</Link>
        <span>/</span>
        <span className="line-clamp-1 text-ink">Best herbs for sleep</span>
      </nav>

      <section className="rounded-[1.5rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8 lg:p-10">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full border border-brand-900/10 bg-brand-50 px-2.5 py-0.5 font-bold uppercase tracking-wider text-brand-800">Sleep evidence guide</span>
          <span className="text-muted">{READING_TIME}</span>
        </div>

        <h1 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl lg:text-5xl">{TITLE}</h1>
        <p className="mt-2 text-sm text-muted">By <Link href="/info/about/" rel="author" className="font-medium text-ink hover:underline">{AUTHOR}</Link></p>
        <div className="mt-3"><LastUpdatedBadge date={UPDATED_DATE} label="Last evidence review" /></div>
        <p className="mt-4 max-w-3xl text-base leading-7 text-muted">{DESCRIPTION}</p>

        <figure className="mt-6">
          <div className="overflow-hidden rounded-2xl border border-brand-900/10 bg-white shadow-sm">
            <Image
              src="/images/guides/best-herbs-for-sleep.jpg"
              alt="Herbs commonly marketed for sleep arranged for an evidence comparison"
              width={1536}
              height={1024}
              priority
              className="h-auto w-full"
            />
          </div>
          <figcaption className="mt-3 text-center text-sm text-muted">
            Traditional use, plausible mechanisms, and retail popularity are not substitutes for direct insomnia evidence.
          </figcaption>
        </figure>
      </section>

      <div className="mt-6 space-y-6">
        <section className="rounded-[1rem] border border-brand-700/20 bg-brand-50/60 p-6 shadow-sm sm:p-8">
          <p className="eyebrow-label">Bottom line</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">There is no evidence-based “first herb” for every sleep problem</h2>
          <div className="mt-3 space-y-3 text-[1.01rem] leading-[1.85] text-muted">
            <p>
              <strong>Ashwagandha</strong> has a small pooled sleep signal from five placebo-controlled trials, but the evidence is preparation-specific and multi-week. <strong>Passionflower</strong> has one useful but preliminary insomnia trial. Those findings are more direct than tradition alone, but neither supports a same-night winner rule.
            </p>
            <p>
              <strong>Valerian</strong> and <strong>chamomile</strong> remain weaker than their popularity suggests. A 2024 valerian umbrella review found no evidence of efficacy for treating insomnia, and NCCIH says chamomile evidence is not conclusive. Lavender-related aromatherapy research is a different intervention from taking an oral lavender supplement.
            </p>
          </div>
        </section>

        <section>
          <ResponsiveTable label="Sleep herb evidence comparison">
            <table className="min-w-[900px] w-full text-sm">
              <thead>
                <tr className="border-b border-brand-900/10">
                  <th className="pb-3 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">Option</th>
                  <th className="pb-3 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">Direct human sleep evidence</th>
                  <th className="pb-3 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">Main limit</th>
                  <th className="pb-3 text-left text-xs font-bold uppercase tracking-wider text-muted">Interpretation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-900/5">
                <tr className="align-top">
                  <td className="py-4 pr-4 font-semibold text-ink">Ashwagandha</td>
                  <td className="py-4 pr-4 text-muted">2021 meta-analysis: 5 placebo-controlled RCTs / 400 adults using specific standardized extracts over repeated multi-week regimens.</td>
                  <td className="py-4 pr-4 text-muted">Small pooled effect, moderate heterogeneity, preparation-specific evidence, and limited long-term safety data.</td>
                  <td className="py-4 text-muted">Limited sleep signal.</td>
                </tr>
                <tr className="align-top">
                  <td className="py-4 pr-4 font-semibold text-ink">Passionflower</td>
                  <td className="py-4 pr-4 text-muted">110 adults with DSM-5 insomnia, passionflower extract vs placebo for 2 weeks; total sleep time improved between groups.</td>
                  <td className="py-4 pr-4 text-muted">Several other sleep outcomes did not differ between groups; one short trial cannot establish broad efficacy.</td>
                  <td className="py-4 text-muted">Preliminary.</td>
                </tr>
                <tr className="align-top">
                  <td className="py-4 pr-4 font-semibold text-ink">Valerian</td>
                  <td className="py-4 pr-4 text-muted">2024 umbrella review included 8 systematic reviews and found some subjective sleep-quality signals.</td>
                  <td className="py-4 pr-4 text-muted">No evidence of efficacy for treating insomnia; primary studies were heterogeneous and generally low quality.</td>
                  <td className="py-4 text-muted">Not established for insomnia.</td>
                </tr>
                <tr className="align-top">
                  <td className="py-4 pr-4 font-semibold text-ink">Chamomile</td>
                  <td className="py-4 pr-4 text-muted">Human trials and reviews exist across sleep quality and insomnia-related outcomes.</td>
                  <td className="py-4 pr-4 text-muted">NCCIH says there is no conclusive clinical-trial evidence that chamomile helps insomnia.</td>
                  <td className="py-4 text-muted">Inconclusive.</td>
                </tr>
                <tr className="align-top">
                  <td className="py-4 pr-4 font-semibold text-ink">Lavender / aromatherapy</td>
                  <td className="py-4 pr-4 text-muted">Aromatherapy reviews report possible sleep-quality improvements across heterogeneous essential-oil studies.</td>
                  <td className="py-4 pr-4 text-muted">Aromatherapy evidence does not establish that oral lavender products treat insomnia; interventions and populations vary.</td>
                  <td className="py-4 text-muted">Indirect for an oral-herb claim.</td>
                </tr>
              </tbody>
            </table>
          </ResponsiveTable>
        </section>

        <section className="space-y-5">
          <EvidenceSummaryCard
            title="Ashwagandha"
            evidenceLevel="Limited"
            humanEvidence="Five placebo-controlled randomized trials / 400 adults were pooled in the 2021 sleep meta-analysis. Trials used defined standardized extracts and repeated dosing over weeks rather than an as-needed bedtime rescue strategy."
            mechanisticEvidence="Stress and neuroendocrine hypotheses may help explain research questions, but symptoms do not diagnose a cortisol problem or identify who should use ashwagandha."
            safetyProfile="NCCIH notes uncertain long-term safety, rare liver injury, pregnancy/breastfeeding avoidance, thyroid and autoimmune cautions, surgery concerns, and medication interactions."
          />
          <EvidenceSummaryCard
            title="Passionflower"
            evidenceLevel="Limited"
            humanEvidence="A 110-person randomized placebo-controlled trial in adults with DSM-5 insomnia studied passionflower extract for two weeks. Total sleep time improved versus placebo, while several other sleep outcomes did not differ between groups."
            mechanisticEvidence="Sedative or GABA-related mechanisms are hypotheses; they do not establish clinical insomnia efficacy or justify combining passionflower with other sedating products."
            safetyProfile="NCCIH lists drowsiness, dizziness, and confusion; pregnancy and perioperative cautions apply because of uterine and nervous-system concerns."
          />
          <EvidenceSummaryCard
            title="Valerian"
            evidenceLevel="Limited"
            humanEvidence="The 2024 umbrella review found no evidence of efficacy for treating insomnia, despite some subjective sleep-quality signals across prior reviews."
            mechanisticEvidence="Traditional sedative use and proposed GABA-related effects do not overcome heterogeneous, low-quality clinical evidence."
            safetyProfile="Long-term safety remains uncertain. Adding valerian to alcohol, sedatives, or multiple calming products can increase complexity and potential sedation risk."
          />
          <EvidenceSummaryCard
            title="Chamomile"
            evidenceLevel="Limited"
            humanEvidence="Trials and pooled reviews exist, but NCCIH still describes the clinical evidence for insomnia as inconclusive."
            mechanisticEvidence="Apigenin-related receptor hypotheses are not equivalent to demonstrated insomnia treatment efficacy."
            safetyProfile="Chamomile can trigger allergic reactions, especially in people sensitive to ragweed or related plants. Product form and dose also vary substantially."
          />
        </section>

        <section className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-semibold tracking-tight text-ink">Why magnesium and L-theanine are not ranked as “herbs” here</h2>
          <p className="mt-3 text-sm leading-7 text-muted">
            Magnesium is a mineral and L-theanine is an amino acid. Both belong in the broader sleep-supplement comparison, where their evidence can be judged without making a botanical ranking look stronger by mixing unlike categories.
          </p>
          <Link href="/guides/sleep/best-supplements-for-sleep/" className="mt-3 inline-block text-sm font-semibold text-brand-700 hover:underline">Best sleep supplements evidence guide →</Link>
        </section>

        <section className="rounded-[1rem] border border-amber-200 bg-amber-50/70 p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-semibold text-amber-950">Separate herb studies do not validate a sleep stack</h2>
          <p className="mt-3 text-sm leading-7 text-amber-950">
            Evidence for individual ingredients does not prove that valerian + passionflower, magnesium + ashwagandha, or any other combination is synergistic, faster, or safer. Combining several sedating products also makes benefit, side effects, and interactions harder to attribute.
          </p>
          <Link href="/guides/sleep/sleep-stack-guide/" className="mt-3 inline-block text-sm font-semibold text-amber-950 hover:underline">Sleep stack evidence guide →</Link>
        </section>

        <section>
          <SafetyNotice title="Safety and stop rules">
            <ul className="ml-5 list-disc space-y-2">
              <li><strong>Ashwagandha:</strong> avoid during pregnancy/breastfeeding and review thyroid, autoimmune, liver, surgery, and medication issues before use.</li>
              <li><strong>Passionflower:</strong> may cause drowsiness, dizziness, or confusion; avoid during pregnancy and discuss perioperative use because of anesthesia interactions.</li>
              <li><strong>Chamomile:</strong> allergy risk is higher in people sensitive to ragweed or related plants.</li>
              <li><strong>Valerian and other sedating herbs:</strong> long-term safety is uncertain; stacking sedating products increases complexity and may increase impairment.</li>
              <li><strong>Persistent symptoms:</strong> loud snoring/gasping, dangerous daytime sleepiness, restless-legs symptoms, severe mood symptoms, or chronic insomnia warrant evaluation rather than escalating herbs.</li>
            </ul>
          </SafetyNotice>
        </section>

        <section className="rounded-[1rem] border border-red-100 bg-red-50/70 p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-semibold tracking-tight text-red-950">Chronic insomnia has a stronger first-line treatment</h2>
          <div className="mt-3 space-y-3 text-sm leading-7 text-red-900">
            <p>
              AASM describes cognitive behavioral therapy for insomnia (CBT-I) as the first-line, evidence-based treatment for chronic insomnia. A botanical comparison should not make supplements look equivalent to that evidence base.
            </p>
            <p>
              Persistent poor sleep can also reflect sleep apnea, restless legs, circadian disorders, medication effects, mood disorders, substance use, pain, or insufficient sleep opportunity.
            </p>
          </div>
        </section>

        <section className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-semibold tracking-tight text-ink">Product sourcing note</h2>
          <p className="mt-3 text-sm leading-7 text-muted">
            This broad guide intentionally does not rank affiliate products. Study extracts, teas, essential oils, and retail capsules are not automatically interchangeable. Ingredient-specific evidence pages are the better place to evaluate plant part, extract, preparation, standardization, and independent quality testing.
          </p>
        </section>

        <section className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-semibold tracking-tight text-ink">Frequently asked questions</h2>
          <div className="mt-5 space-y-5">
            {FAQS.map((faq) => (
              <div key={faq.question} className="border-l-4 border-brand-600 pl-4">
                <h3 className="font-semibold text-ink">{faq.question}</h3>
                <p className="mt-2 text-sm leading-7 text-muted">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-semibold tracking-tight text-ink">Sources and directness notes</h2>
          <ol className="mt-4 space-y-4">
            {SOURCES.map((source, index) => (
              <li key={source.href} className="text-sm leading-7 text-muted">
                <span className="font-semibold text-ink">{index + 1}. </span>
                <a href={source.href} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-700 hover:underline">{source.label}</a>
                <span> — {source.note}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="grid gap-3 sm:grid-cols-2">
          <Link href="/guides/sleep/ashwagandha-for-sleep/" className="rounded-xl border border-brand-900/10 bg-white p-4 text-sm font-semibold text-brand-700 hover:underline">Ashwagandha for sleep →</Link>
          <Link href="/guides/compare/sleep-herbs-vs-melatonin/" className="rounded-xl border border-brand-900/10 bg-white p-4 text-sm font-semibold text-brand-700 hover:underline">Sleep herbs vs melatonin →</Link>
          <Link href="/guides/sleep/best-supplements-for-sleep/" className="rounded-xl border border-brand-900/10 bg-white p-4 text-sm font-semibold text-brand-700 hover:underline">Best sleep supplements →</Link>
          <Link href="/guides/sleep/" className="rounded-xl border border-brand-900/10 bg-white p-4 text-sm font-semibold text-brand-700 hover:underline">Sleep goal hub →</Link>
        </section>

        <EmailCapture
          headline="Get future sleep research notes by email"
          description="Evidence-first supplement updates, safety context, and new guide announcements. No universal herb rankings or bedtime protocols."
          location={`article-${SLUG}`}
        />
        <NewsletterCtaBlock
          title="Continue with the newsletter archive"
          description="Short notes built for cautious supplement decisions."
          location={`article-${SLUG}-newsletter`}
        />
      </div>
    </article>
  )
}
