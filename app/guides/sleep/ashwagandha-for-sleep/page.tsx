import Link from 'next/link'
import Image from 'next/image'
import JsonLd from '@/components/seo/JsonLd'
import { buildPageMetadata, blogJsonLd, breadcrumbJsonLd, faqPageJsonLd, compactMetaTitle } from '../../../../src/lib/seo'
import EvidenceSummaryCard from '@/components/evidence/EvidenceSummaryCard'
import SafetyNotice from '@/components/evidence/SafetyNotice'
import EmailCapture from '@/components/EmailCapture'
import { getRevenueProductSet } from '@/config/revenue-products'
import RecommendationSection from '@/components/RecommendationSection'
import NewsletterCtaBlock from '@/components/NewsletterCtaBlock'
import LastUpdatedBadge from '../../../../src/components/editorial/LastUpdatedBadge'
import ResponsiveTable from '@/components/ui/ResponsiveTable'

const SLUG = 'ashwagandha-for-sleep'
const TITLE = 'Ashwagandha for Sleep: What the Evidence Supports in 2026'
const DESCRIPTION =
  'Evidence-first review of ashwagandha for sleep, including the five-trial meta-analysis, insomnia and non-restorative-sleep trials, preparation differences, safety limits, and why trial regimens are not universal bedtime instructions.'
const DATE = '2026-06-09'
const UPDATED_DATE = '2026-08-12'
const AUTHOR = 'Will'
const READING_TIME = '10 min read'
const TAGS = ['ashwagandha', 'sleep', 'insomnia', 'adaptogens']

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
    note: 'Five randomized controlled trials / 400 adults. The pooled sleep effect was small and statistically significant, with moderate heterogeneity. Subgroup findings favored insomnia populations, higher study doses, and longer study durations, but the authors called for more long-term safety data.',
  },
  {
    label: 'Ashwagandha root extract in insomnia and anxiety (2019)',
    href: 'https://pubmed.ncbi.nlm.nih.gov/31728244/',
    note: 'Sixty participants with insomnia/anxiety were randomized 2:1 to a specific full-spectrum root extract 300 mg twice daily or placebo for 10 weeks. Actigraphy and questionnaire outcomes were assessed; the authors called for larger studies.',
  },
  {
    label: 'Ashwagandha root extract in healthy adults and insomnia patients (2021)',
    href: 'https://pubmed.ncbi.nlm.nih.gov/32818573/',
    note: 'Eighty participants—40 healthy and 40 with insomnia—were studied for 8 weeks. Sleep outcomes improved in both groups, with larger changes in the insomnia subgroup; the authors said additional trials were needed to generalize the findings.',
  },
  {
    label: 'Standardized ashwagandha extract in non-restorative sleep (2020)',
    href: 'https://pubmed.ncbi.nlm.nih.gov/32540634/',
    note: 'One hundred fifty healthy adults with non-restorative sleep received a standardized Shoden extract 120 mg once daily or placebo for 6 weeks; 144 completed. This different preparation and regimen illustrate why results should not be generalized to one universal product or dose.',
  },
  {
    label: 'NCCIH: Ashwagandha usefulness and safety',
    href: 'https://www.nccih.nih.gov/health/ashwagandha',
    note: 'NCCIH says some ashwagandha preparations may be effective for insomnia and stress, while long-term safety is not established. It also lists liver, pregnancy, thyroid, autoimmune, surgery, and medication-interaction cautions.',
  },
  {
    label: 'NCCIH: Sleep disorders and complementary health approaches',
    href: 'https://www.nccih.nih.gov/health/sleep-disorders-and-complementary-health-approaches',
    note: 'NCCIH describes CBT-I as the most strongly recommended treatment for insomnia and notes that evidence for many complementary sleep approaches is limited or inconsistent.',
  },
  {
    label: 'AASM: cognitive behavioral therapy for insomnia',
    href: 'https://aasm.org/coding-quarterly-cognitive-behavioral-therapy-for-insomnia/',
    note: 'The American Academy of Sleep Medicine describes CBT-I as the first-line, evidence-based treatment for chronic insomnia.',
  },
]

const FAQS = [
  {
    question: 'Does ashwagandha help sleep?',
    answer:
      'A five-trial meta-analysis in 400 adults found a small overall sleep benefit, and NCCIH says some preparations may help insomnia. The evidence is promising but preparation-specific and not strong enough to support a universal product, dose, or timing rule.',
  },
  {
    question: 'How long does ashwagandha take to work for sleep?',
    answer:
      'Trials generally studied repeated use over several weeks, but study duration is not the same as a guaranteed personal onset. The evidence does not establish that everyone needs a fixed six- or eight-week course or that benefits begin on a predictable day.',
  },
  {
    question: 'Should ashwagandha be taken at night for sleep?',
    answer:
      'There is no universal evidence-based bedtime timing rule. Studies used different schedules and preparations. A trial schedule describes how that study was run; it is not proof that evening dosing is superior for every product or person.',
  },
  {
    question: 'What is the best ashwagandha extract for sleep?',
    answer:
      'No extract has been established as a universal winner. Positive sleep trials used different preparations and regimens, including a full-spectrum root extract and a lower-milligram standardized Shoden extract. Results belong to the studied preparation and population.',
  },
  {
    question: 'Can ashwagandha replace CBT-I for chronic insomnia?',
    answer:
      'No. CBT-I is the first-line evidence-based treatment for chronic insomnia. A supplement trial should not delay evaluation of persistent insomnia, sleep apnea symptoms, restless legs, medication effects, mood disorders, substance-related sleep problems, or other causes of poor sleep.',
  },
  {
    question: 'Can ashwagandha be combined with melatonin or L-theanine?',
    answer:
      'Separate ingredient studies do not prove that a combination is more effective or safer. Combining products also makes benefit and side effects harder to attribute. Medication use and sedative effects can materially change the safety picture.',
  },
]

export default function AshwagandhaForSleepPage() {
  const breadcrumb = breadcrumbJsonLd([
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
      <JsonLd schema={breadcrumb} />
      {faqLd ? <JsonLd schema={faqLd} /> : null}

      <nav className="mb-6 flex items-center gap-2 text-sm text-muted" aria-label="Breadcrumb">
        <Link href="/guides/" className="transition hover:text-ink">Guides</Link>
        <span>/</span>
        <Link href="/guides/sleep/" className="transition hover:text-ink">Sleep</Link>
        <span>/</span>
        <span className="line-clamp-1 text-ink">Ashwagandha</span>
      </nav>

      <section className="rounded-[1.5rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8 lg:p-10">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full border border-brand-900/10 bg-brand-50 px-2.5 py-0.5 font-bold uppercase tracking-wider text-brand-800">Sleep evidence guide</span>
          {TAGS.slice(0, 3).map((tag) => (
            <span key={tag} className="rounded-full border border-brand-900/10 bg-white px-2.5 py-0.5 font-semibold capitalize text-muted">{tag}</span>
          ))}
          <span className="text-muted">{READING_TIME}</span>
        </div>

        <h1 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl lg:text-5xl">{TITLE}</h1>
        <p className="mt-2 text-sm text-muted">By <Link href="/info/about/" rel="author" className="font-medium text-ink hover:underline">{AUTHOR}</Link></p>
        <div className="mt-3"><LastUpdatedBadge date={UPDATED_DATE} label="Last evidence review" /></div>
        <p className="mt-4 max-w-3xl text-base leading-7 text-muted">{DESCRIPTION}</p>

        <figure className="mt-6">
          <div className="overflow-hidden rounded-2xl border border-brand-900/10 bg-white shadow-sm">
            <Image
              src="/images/guides/ashwagandha-for-sleep.jpg"
              alt="Ashwagandha root and powder beside a nighttime sleep setting"
              width={1536}
              height={1024}
              priority
              className="h-auto w-full"
            />
          </div>
          <figcaption className="mt-3 text-center text-sm text-muted">
            Sleep trials used different ashwagandha preparations, populations, schedules, and durations; one positive regimen is not a universal bedtime protocol.
          </figcaption>
        </figure>
      </section>

      <div className="mt-4 rounded-[1rem] border border-brand-900/10 bg-brand-50/60 px-5 py-3 text-xs leading-6 text-muted">
        <strong className="text-ink">Affiliate disclosure:</strong> This page contains optional product-sourcing links. They are not evidence that a commercial product will reproduce a sleep trial. We may earn a commission at no added cost to you.
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_240px]">
        <div className="space-y-6">
          <section className="rounded-[1rem] border border-brand-700/20 bg-brand-50/60 p-6 shadow-sm sm:p-8">
            <p className="eyebrow-label">Bottom line</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">A small sleep signal is real; a universal bedtime recipe is not</h2>
            <div className="mt-3 space-y-3 text-[1.01rem] leading-[1.85] text-muted">
              <p>
                The 2021 systematic review pooled <strong>five randomized trials / 400 adults</strong> and found a small overall improvement in sleep with ashwagandha extract versus placebo. The studies were heterogeneous, and NCCIH’s current summary is appropriately cautious: <strong>some preparations may help insomnia</strong>.
              </p>
              <p>
                That evidence does not justify saying that everyone should take a specific branded extract, a fixed milligram amount, or an evening dose for six to eight weeks. It also does not make ashwagandha a same-night rescue treatment.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight text-ink">Evidence directness</h2>
            <EvidenceSummaryCard
              title="Ashwagandha for sleep"
              evidenceLevel="Limited"
              humanEvidence="The 2021 meta-analysis included five randomized placebo-controlled trials / 400 adults and found a small significant overall sleep effect with moderate heterogeneity. Subgroup signals were stronger in people with insomnia and in certain study-dose and duration categories, but those subgroup findings do not establish a universal regimen."
              mechanisticEvidence="Cortisol, GABA-related, autonomic, and preclinical sleep mechanisms are hypotheses that may help explain results. They do not prove that stress-driven insomnia is caused by a cortisol problem or that a particular mechanism determines who will respond."
              safetyProfile="No serious adverse events were reported in the pooled sleep trials, but the review said serious-adverse-event data were limited and more long-term safety data were needed. NCCIH also lists rare liver injury and several condition/medication cautions."
            />
          </section>

          <section className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8">
            <h2 className="text-2xl font-semibold tracking-tight text-ink">What was actually studied?</h2>
            <ResponsiveTable label="Ashwagandha sleep trial directness table">
              <table className="mt-5 min-w-[760px] w-full text-sm">
                <thead>
                  <tr className="border-b border-brand-900/10">
                    <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">Population</th>
                    <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">Study intervention</th>
                    <th className="pb-2 text-left text-xs font-bold uppercase tracking-wider text-muted">What it tells us</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-900/5">
                  <tr className="align-top">
                    <td className="py-3 pr-4 font-medium text-ink">60 people with insomnia and anxiety</td>
                    <td className="py-3 pr-4 text-muted">Specific full-spectrum root extract, 300 mg twice daily vs placebo for 10 weeks.</td>
                    <td className="py-3 text-muted">Direct insomnia trial with actigraphy and questionnaires; useful evidence for that preparation and context, not a universal personal dose.</td>
                  </tr>
                  <tr className="align-top">
                    <td className="py-3 pr-4 font-medium text-ink">80 healthy adults and adults with insomnia</td>
                    <td className="py-3 pr-4 text-muted">Root extract vs placebo for 8 weeks.</td>
                    <td className="py-3 text-muted">Sleep improvements were larger in the insomnia subgroup, while the authors said more trials were needed before generalizing the findings.</td>
                  </tr>
                  <tr className="align-top">
                    <td className="py-3 pr-4 font-medium text-ink">150 healthy adults with non-restorative sleep</td>
                    <td className="py-3 pr-4 text-muted">Standardized Shoden extract, 120 mg once daily vs placebo for 6 weeks; 144 completed.</td>
                    <td className="py-3 text-muted">A different preparation and much lower milligram regimen also produced a sleep signal—evidence against treating one brand or dose range as universally validated.</td>
                  </tr>
                </tbody>
              </table>
            </ResponsiveTable>
          </section>

          <section className="rounded-[1rem] border border-amber-200 bg-amber-50/70 p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-semibold text-amber-950">Why the meta-analysis subgroup is not a dosage protocol</h2>
            <div className="mt-3 space-y-3 text-sm leading-7 text-amber-950">
              <p>
                The pooled review found larger sleep effects in the subgroup of insomnia participants, studies using at least 600 mg/day, and studies lasting at least eight weeks. Those are <strong>between-study subgroup observations</strong>, not randomized head-to-head proof that 600 mg is better than lower doses or that eight weeks is an optimal course.
              </p>
              <p>
                The 120 mg/day Shoden trial is a useful reminder that milligrams are not interchangeable across extracts. Extraction ratio, plant part, standardization, and formulation can change what a milligram represents.
              </p>
            </div>
          </section>

          <section className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8">
            <h2 className="text-2xl font-semibold tracking-tight text-ink">No established “best time” or “best extract”</h2>
            <div className="mt-3 space-y-3 text-[1.01rem] leading-[1.85] text-muted">
              <p>
                Sleep trials used different extracts, schedules, and durations. The literature does not establish that evening dosing is universally superior to morning or split dosing, and it does not establish KSM-66, Sensoril, Shoden, raw powder, or another preparation as the universal best sleep form.
              </p>
              <p>
                Study schedules are research context. They should not be converted into “take this much 30–60 minutes before bed” instructions unless direct evidence actually tests and supports that timing question.
              </p>
            </div>
          </section>

          <section className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8">
            <h2 className="text-2xl font-semibold tracking-tight text-ink">Chronic insomnia has a stronger first-line treatment</h2>
            <div className="mt-3 space-y-3 text-[1.01rem] leading-[1.85] text-muted">
              <p>
                The American Academy of Sleep Medicine describes <strong>cognitive behavioral therapy for insomnia (CBT-I)</strong> as the first-line, evidence-based treatment for chronic insomnia. NCCIH likewise calls CBT-I the most strongly recommended insomnia treatment.
              </p>
              <p>
                Persistent sleep trouble can also reflect sleep apnea, restless legs, circadian problems, medication effects, mood disorders, substance use, pain, or other conditions that a supplement will not diagnose. Ashwagandha should not become a reason to delay that evaluation.
              </p>
            </div>
          </section>

          <section className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8">
            <h2 className="text-2xl font-semibold tracking-tight text-ink">Combination evidence: do not turn separate trials into a sleep stack</h2>
            <p className="mt-3 text-[1.01rem] leading-[1.85] text-muted">
              Separate studies of ashwagandha, melatonin, L-theanine, or magnesium do not prove that combining them improves sleep more or is safer. A multi-ingredient regimen is a different intervention with its own interaction and attribution problems. If supplementation is appropriate, changing one variable at a time is easier to interpret than copying a stack assembled from unrelated trials.
            </p>
            <Link href="/guides/sleep/sleep-stack-guide/" className="mt-3 inline-block text-sm font-semibold text-brand-700 hover:underline">Sleep stack evidence guide →</Link>
          </section>

          <section>
            <SafetyNotice title="Safety and stop rules">
              <ul className="ml-5 space-y-2 list-disc">
                <li><strong>Short term vs long term:</strong> NCCIH says ashwagandha may be safe in the short term, up to about three months, but long-term safety is not established.</li>
                <li><strong>Side effects:</strong> drowsiness, stomach upset, diarrhea, and vomiting can occur.</li>
                <li><strong>Liver:</strong> rare cases of liver injury have been linked to ashwagandha supplements. Stop and seek medical advice for jaundice, dark urine, or other concerning liver symptoms.</li>
                <li><strong>Pregnancy and breastfeeding:</strong> NCCIH says to avoid it during pregnancy and not use it while breastfeeding.</li>
                <li><strong>Conditions:</strong> NCCIH does not recommend it around surgery or for people with autoimmune or thyroid disorders without appropriate medical guidance.</li>
                <li><strong>Medication interactions:</strong> possible interaction categories include diabetes and blood-pressure medicines, immunosuppressants, sedatives, anticonvulsants, and thyroid hormone medicines.</li>
                <li><strong>Sleep-specific stop rule:</strong> loud snoring/gasping, dangerous daytime sleepiness, persistent insomnia, severe mood symptoms, or rapidly worsening sleep warrant assessment rather than escalating supplements.</li>
              </ul>
            </SafetyNotice>
          </section>

          <section className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8">
            <h2 className="text-2xl font-semibold tracking-tight text-ink">Product sourcing: match the studied preparation, not a marketing winner</h2>
            <p className="mt-3 text-sm leading-7 text-muted">
              If a supplement trial is appropriate, look for a product that clearly states plant part, extract form, and standardization. Independent quality testing can help with identity and contamination, but it does not prove sleep efficacy. A trademark, high withanolide percentage, or large milligram number is not evidence that the product is “best for sleep.”
            </p>
            <div className="mt-5"><RecommendationSection products={getRevenueProductSet('ashwagandha')?.products ?? []} /></div>
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

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Related evidence</p>
            <nav className="mt-3 space-y-2 text-sm font-medium text-brand-700">
              <Link href="/guides/herbs/ashwagandha/" className="block hover:underline">Ashwagandha umbrella guide →</Link>
              <Link href="/guides/sleep/sleep-stack-guide/" className="block hover:underline">Sleep stack evidence →</Link>
              <Link href="/guides/sleep/best-herbs-for-sleep/" className="block hover:underline">Best herbs for sleep →</Link>
              <Link href="/guides/sleep/" className="block hover:underline">Sleep goal hub →</Link>
            </nav>
          </div>
          <div className="rounded-[1rem] border border-brand-900/10 bg-brand-50/60 p-4 text-xs leading-6 text-muted">
            <strong className="text-ink">Interpretation rule:</strong> a trial regimen tells you what researchers tested. It does not automatically become a personal dose, bedtime, duration, or product recommendation.
          </div>
        </aside>
      </div>
    </article>
  )
}
