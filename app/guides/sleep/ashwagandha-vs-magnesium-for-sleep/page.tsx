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

const SLUG = 'ashwagandha-vs-magnesium-for-sleep'
const TITLE = 'Ashwagandha vs Magnesium for Sleep: What the Evidence Supports in 2026'
const DESCRIPTION =
  'Evidence-first comparison of ashwagandha and magnesium for sleep, including direct randomized evidence, preparation limits, medication and kidney cautions, chronic-insomnia care, and why there is no universal same-night winner.'
const DATE = '2026-06-09'
const UPDATED_DATE = '2026-08-12'
const AUTHOR = 'Will'
const READING_TIME = '10 min read'

export const metadata = buildPageMetadata({
  title: compactMetaTitle(TITLE),
  description: DESCRIPTION,
  path: `/guides/sleep/${SLUG}`,
  openGraphType: 'article',
})

const SOURCES = [
  {
    label: 'Ashwagandha sleep systematic review and meta-analysis (2021)',
    href: 'https://pubmed.ncbi.nlm.nih.gov/34559859/',
    note: 'Five randomized controlled trials / 400 adults. The pooled sleep effect was small and statistically significant, with moderate heterogeneity; the authors called for more long-term safety data.',
  },
  {
    label: 'Magnesium for insomnia systematic review and meta-analysis (2021)',
    href: 'https://pubmed.ncbi.nlm.nih.gov/33865376/',
    note: 'Three randomized trials / 151 older adults. Sleep-onset latency improved in the pooled analysis, but all trials had moderate-to-high risk of bias and the certainty of evidence was low to very low.',
  },
  {
    label: 'Magnesium bisglycinate randomized placebo-controlled trial (2025)',
    href: 'https://pubmed.ncbi.nlm.nih.gov/40918053/',
    note: 'One hundred fifty-five adults with self-reported poor sleep received 250 mg elemental magnesium as bisglycinate or placebo for four weeks. The insomnia-severity difference was statistically significant but small (Cohen d=0.2); a separate sleep-quality measure was not significantly different and no objective sleep measure was used.',
  },
  {
    label: 'NCCIH: Ashwagandha usefulness and safety',
    href: 'https://www.nccih.nih.gov/health/ashwagandha',
    note: 'Some preparations may help insomnia and stress; long-term safety is not established. NCCIH lists pregnancy/breastfeeding, thyroid, autoimmune, surgery, liver, and medication-interaction cautions.',
  },
  {
    label: 'NIH ODS: Magnesium health professional fact sheet',
    href: 'https://ods.od.nih.gov/factsheets/Magnesium-HealthProfessional/',
    note: 'High supplemental magnesium can cause gastrointestinal effects; toxicity risk rises with impaired kidney function. Magnesium can reduce absorption of oral bisphosphonates and tetracycline/quinolone antibiotics.',
  },
  {
    label: 'NCCIH: Sleep disorders and complementary health approaches',
    href: 'https://www.nccih.nih.gov/health/sleep-disorders-and-complementary-health-approaches',
    note: 'NCCIH describes magnesium insomnia evidence as limited and identifies CBT-I as the most strongly recommended treatment for insomnia.',
  },
  {
    label: 'AASM: cognitive behavioral therapy for insomnia',
    href: 'https://aasm.org/coding-quarterly-cognitive-behavioral-therapy-for-insomnia/',
    note: 'The American Academy of Sleep Medicine describes CBT-I as the first-line, evidence-based treatment for chronic insomnia.',
  },
]

const FAQS = [
  {
    question: 'Is ashwagandha or magnesium better for sleep?',
    answer:
      'There is no universal winner. Ashwagandha has a more direct sleep-specific randomized/meta-analytic evidence base, but the pooled effect is small and preparation-specific. Magnesium evidence is thinner; a 2025 bisglycinate trial found a small insomnia-severity benefit, while older pooled evidence was low to very low certainty.',
  },
  {
    question: 'Should I try magnesium glycinate first tonight?',
    answer:
      'The evidence does not support a universal same-night magnesium-first rule. The 2025 bisglycinate trial studied daily use for four weeks, not an as-needed bedtime rescue effect, and it did not establish magnesium glycinate as the best sleep form for everyone.',
  },
  {
    question: 'How quickly does ashwagandha work for sleep?',
    answer:
      'Relevant trials generally studied repeated use over several weeks. Study duration is not a guaranteed personal onset, and the evidence does not establish that everyone needs a fixed course or a particular bedtime timing schedule.',
  },
  {
    question: 'Can ashwagandha and magnesium be taken together?',
    answer:
      'Direct sleep trials of the combination are lacking, so separate ingredient studies do not establish that the combination is more effective or safer. Medication use, kidney function, thyroid or autoimmune conditions, pregnancy status, and sedating products can materially change the risk picture.',
  },
  {
    question: 'Is magnesium glycinate the best magnesium form for sleep?',
    answer:
      'No form has been established as a universal sleep winner. A 2025 trial provides direct evidence for magnesium bisglycinate, but the effect was small and the trial does not prove superiority over other forms or establish an acute bedtime effect.',
  },
  {
    question: 'What is first-line treatment for chronic insomnia?',
    answer:
      'CBT-I is the first-line evidence-based treatment for chronic insomnia. Persistent insomnia also warrants evaluation for sleep apnea, restless legs, circadian problems, medication effects, mood disorders, substance use, pain, or other causes.',
  },
]

export default function AshwagandhaVsMagnesiumForSleepPage() {
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
        <span className="line-clamp-1 text-ink">Ashwagandha vs magnesium</span>
      </nav>

      <section className="rounded-[1.5rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8 lg:p-10">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full border border-brand-900/10 bg-brand-50 px-2.5 py-0.5 font-bold uppercase tracking-wider text-brand-800">Sleep comparison</span>
          <span className="text-muted">{READING_TIME}</span>
        </div>
        <h1 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl lg:text-5xl">{TITLE}</h1>
        <p className="mt-2 text-sm text-muted">By <Link href="/info/about/" rel="author" className="font-medium text-ink hover:underline">{AUTHOR}</Link></p>
        <div className="mt-3"><LastUpdatedBadge date={UPDATED_DATE} label="Last evidence review" /></div>
        <p className="mt-4 max-w-3xl text-base leading-7 text-muted">{DESCRIPTION}</p>

        <figure className="mt-6">
          <div className="overflow-hidden rounded-2xl border border-brand-900/10 bg-white shadow-sm">
            <Image
              src="/images/guides/ashwagandha-vs-magnesium-for-sleep.jpg"
              alt="Ashwagandha root and magnesium capsules compared for sleep evidence"
              width={1536}
              height={1024}
              priority
              className="h-auto w-full"
            />
          </div>
          <figcaption className="mt-3 text-center text-sm text-muted">
            Different evidence bases, preparations, and safety constraints make a same-night “winner” ranking misleading.
          </figcaption>
        </figure>
      </section>

      <div className="mt-6 space-y-6">
        <section className="rounded-[1rem] border border-brand-700/20 bg-brand-50/60 p-6 shadow-sm sm:p-8">
          <p className="eyebrow-label">Bottom line</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Ashwagandha has the broader direct sleep signal; magnesium evidence remains smaller and lower-certainty</h2>
          <div className="mt-3 space-y-3 text-[1.01rem] leading-[1.85] text-muted">
            <p>
              Ashwagandha’s 2021 sleep meta-analysis pooled <strong>five randomized trials / 400 adults</strong> and found a small overall sleep benefit with moderate heterogeneity. That supports a cautious sleep signal, not a universal extract, dose, bedtime, or onset promise.
            </p>
            <p>
              Magnesium’s older insomnia review pooled only <strong>three randomized trials / 151 older adults</strong> and rated the evidence low to very low certainty. A newer 2025 magnesium-bisglycinate trial in <strong>155 adults</strong> found a statistically significant but small insomnia-severity effect (<strong>Cohen d=0.2</strong>) after four weeks; its separate sleep-quality measure was not significantly different and objective sleep was not measured.
            </p>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-2">
          <EvidenceSummaryCard
            title="Ashwagandha for sleep"
            evidenceLevel="Limited"
            humanEvidence="Five randomized trials / 400 adults were pooled in the 2021 meta-analysis, with a small significant overall sleep effect and moderate heterogeneity. Direct trials used different extracts, populations, schedules, and durations."
            mechanisticEvidence="Stress and cortisol pathways may be relevant hypotheses, but symptoms do not diagnose a cortisol problem and do not identify who should receive ashwagandha."
            safetyProfile="NCCIH notes short-term tolerability for many users but uncertain long-term safety, rare liver injury, pregnancy/breastfeeding avoidance, thyroid/autoimmune cautions, surgery concerns, and medication interactions."
          />
          <EvidenceSummaryCard
            title="Magnesium for sleep"
            evidenceLevel="Limited"
            humanEvidence="The 2021 review found only three randomized trials / 151 older adults and low-to-very-low certainty. A 2025 trial in 155 adults found a small four-week insomnia-severity benefit with magnesium bisglycinate, without a significant separate sleep-quality difference or objective sleep measurement."
            mechanisticEvidence="Magnesium is physiologically essential, but plausible roles in neurotransmission or deficiency do not establish that magnesium treats insomnia in people without a demonstrated deficiency."
            safetyProfile="Supplemental magnesium can cause gastrointestinal effects, and toxicity risk rises when kidney function is impaired. It can also interfere with absorption of oral bisphosphonates and tetracycline/quinolone antibiotics."
          />
        </section>

        <section className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-semibold tracking-tight text-ink">What was actually studied?</h2>
          <ResponsiveTable label="Ashwagandha vs magnesium sleep evidence comparison">
            <table className="mt-5 min-w-[820px] w-full text-sm">
              <thead>
                <tr className="border-b border-brand-900/10">
                  <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">Evidence question</th>
                  <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">Ashwagandha</th>
                  <th className="pb-2 text-left text-xs font-bold uppercase tracking-wider text-muted">Magnesium</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-900/5">
                <tr className="align-top">
                  <td className="py-3 pr-4 font-semibold text-ink">Pooled sleep evidence</td>
                  <td className="py-3 pr-4 text-muted">5 RCTs / 400 adults; small significant pooled sleep effect, moderate heterogeneity.</td>
                  <td className="py-3 text-muted">3 older-adult RCTs / 151 participants; possible sleep-onset-latency benefit, but low-to-very-low certainty.</td>
                </tr>
                <tr className="align-top">
                  <td className="py-3 pr-4 font-semibold text-ink">Newer direct trial</td>
                  <td className="py-3 pr-4 text-muted">Multiple preparation-specific sleep trials already contribute to the meta-analysis.</td>
                  <td className="py-3 text-muted">2025 magnesium-bisglycinate RCT: 155 adults, 4 weeks, small insomnia-severity effect (d=0.2); separate sleep-quality measure not significant.</td>
                </tr>
                <tr className="align-top">
                  <td className="py-3 pr-4 font-semibold text-ink">Same-night effect?</td>
                  <td className="py-3 pr-4 text-muted">Not established; relevant trials generally studied repeated use over weeks.</td>
                  <td className="py-3 text-muted">Not established; the newer bisglycinate trial studied daily use for four weeks, not an as-needed bedtime rescue dose.</td>
                </tr>
                <tr className="align-top">
                  <td className="py-3 pr-4 font-semibold text-ink">Best form?</td>
                  <td className="py-3 pr-4 text-muted">No universal winner across KSM-66, Sensoril, Shoden, raw powder, or other preparations.</td>
                  <td className="py-3 text-muted">Bisglycinate now has one direct RCT, but that does not prove superiority over glycinate/citrate/other forms or establish a universal sleep form.</td>
                </tr>
              </tbody>
            </table>
          </ResponsiveTable>
        </section>

        <section className="rounded-[1rem] border border-amber-200 bg-amber-50/70 p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-semibold text-amber-950">Why “try magnesium tonight” overreaches the evidence</h2>
          <div className="mt-3 space-y-3 text-sm leading-7 text-amber-950">
            <p>
              The 2025 magnesium-bisglycinate trial is useful because it directly studies a popular form, but it was a <strong>four-week daily intervention</strong> with a small effect size—not a trial of one bedtime dose. It therefore cannot establish a same-night rescue effect or a universal “magnesium first” sequence.
            </p>
            <p>
              Likewise, ashwagandha trials do not prove that people with “stress-driven” insomnia should automatically choose ashwagandha. Clinical populations overlap, mechanisms are indirect, and persistent sleep trouble needs a broader assessment than a symptom-matching supplement flowchart.
            </p>
          </div>
        </section>

        <section className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-semibold tracking-tight text-ink">No direct evidence establishes the combination as better</h2>
          <p className="mt-3 text-[1.01rem] leading-[1.85] text-muted">
            Separate ashwagandha and magnesium trials do not prove that combining them improves sleep more, works faster, or is safer. A combination is a different intervention with its own interaction and attribution problems. This page therefore does not recommend starting one and automatically adding the other after a fixed number of days or weeks.
          </p>
          <Link href="/guides/sleep/sleep-stack-guide/" className="mt-3 inline-block text-sm font-semibold text-brand-700 hover:underline">Sleep stack evidence guide →</Link>
        </section>

        <section>
          <SafetyNotice title="Safety and medication boundaries">
            <ul className="ml-5 space-y-2 list-disc">
              <li><strong>Ashwagandha:</strong> NCCIH lists rare liver injury, pregnancy/breastfeeding avoidance, thyroid and autoimmune cautions, surgery concerns, and possible interactions with diabetes, blood-pressure, immunosuppressant, sedative, anticonvulsant, and thyroid medicines.</li>
              <li><strong>Magnesium:</strong> supplemental magnesium can cause diarrhea, nausea, and cramping; toxicity risk rises with impaired kidney function.</li>
              <li><strong>Magnesium + medicines:</strong> magnesium can reduce absorption of oral bisphosphonates and tetracycline/quinolone antibiotics, so medication timing should be reviewed with a pharmacist or prescriber rather than guessed.</li>
              <li><strong>Persistent insomnia:</strong> loud snoring/gasping, dangerous daytime sleepiness, restless-legs symptoms, severe mood symptoms, or chronic insomnia are reasons to seek assessment rather than escalating supplements.</li>
            </ul>
          </SafetyNotice>
        </section>

        <section className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-semibold tracking-tight text-ink">Chronic insomnia has a stronger first-line treatment</h2>
          <p className="mt-3 text-[1.01rem] leading-[1.85] text-muted">
            AASM describes cognitive behavioral therapy for insomnia (CBT-I) as the first-line, evidence-based treatment for chronic insomnia. Persistent poor sleep can also reflect sleep apnea, restless legs, circadian disorders, medication effects, mood disorders, substance use, pain, or insufficient sleep opportunity. A supplement comparison should not obscure those possibilities.
          </p>
        </section>

        <section className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-semibold tracking-tight text-ink">Product sourcing note</h2>
          <p className="mt-3 text-sm leading-7 text-muted">
            This broad comparison intentionally does not rank affiliate products. Study preparations are not automatically interchangeable with commercial products, and one magnesium-bisglycinate or ashwagandha-extract trial does not establish a retail winner. Ingredient-specific pages are the better place to evaluate preparation matching and quality signals.
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
          <Link href="/compounds/magnesium/" className="rounded-xl border border-brand-900/10 bg-white p-4 text-sm font-semibold text-brand-700 hover:underline">Magnesium profile →</Link>
          <Link href="/guides/compare/sleep-herbs-vs-melatonin/" className="rounded-xl border border-brand-900/10 bg-white p-4 text-sm font-semibold text-brand-700 hover:underline">Sleep supplements vs melatonin →</Link>
          <Link href="/guides/sleep/" className="rounded-xl border border-brand-900/10 bg-white p-4 text-sm font-semibold text-brand-700 hover:underline">Sleep goal hub →</Link>
        </section>

        <EmailCapture
          headline="Get future research notes by email"
          description="Evidence-first supplement updates, safety context, and new guide announcements. No diagnosis, treatment, or personal medical advice."
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
