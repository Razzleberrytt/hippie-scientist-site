import Link from 'next/link'
import Image from 'next/image'
import JsonLd from '@/components/seo/JsonLd'
import { buildPageMetadata, blogJsonLd, breadcrumbJsonLd, faqPageJsonLd, compactMetaTitle } from '../../../../lib/seo'
import EvidenceSummaryCard from '@/components/evidence/EvidenceSummaryCard'
import SafetyNotice from '@/components/evidence/SafetyNotice'
import EmailCapture from '@/components/EmailCapture'
import { getRevenueProductSet } from '@/config/revenue-products'
import RecommendationSection from '@/components/RecommendationSection'
import NewsletterCtaBlock from '@/components/NewsletterCtaBlock'
import LastUpdatedBadge from '../../../../components/editorial/LastUpdatedBadge'
import ResponsiveTable from '@/components/ui/ResponsiveTable'

const SLUG = 'ashwagandha-for-sleep'
const TITLE = 'Ashwagandha for Sleep: What the Evidence Supports in 2026'
const DESCRIPTION =
  'Evidence-first review of ashwagandha for sleep, with an extract-by-extract fingerprint covering insomnia, non-restorative sleep, newer 2025–26 trials, bioavailability limits, direct melatonin-combination evidence, safety, and why trial regimens are not universal bedtime instructions.'
const DATE = '2026-06-09'
const UPDATED_DATE = '2026-09-14'
const AUTHOR = 'Will'
const READING_TIME = '12 min read'
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
    label: 'KSM-66 root extract in healthy adults and insomnia patients (2021)',
    href: 'https://pubmed.ncbi.nlm.nih.gov/32818573/',
    note: 'Eighty participants—40 healthy and 40 with insomnia—were studied for 8 weeks using KSM-66 root extract 300 mg twice daily. Sleep onset latency, total sleep time, wake after sleep onset, time in bed, sleep efficiency, PSQI, alertness, and sleep quality were assessed; improvements were larger in the insomnia subgroup.',
  },
  {
    label: 'Standardized Shoden extract in non-restorative sleep (2020)',
    href: 'https://pubmed.ncbi.nlm.nih.gov/32540634/',
    note: 'One hundred fifty healthy adults with non-restorative sleep received standardized Shoden extract 120 mg once daily or placebo for 6 weeks; 144 completed. Restorative Sleep Questionnaire and WHOQOL were paired with actigraphy measuring sleep latency, efficiency, total sleep time, and wake after sleep onset.',
  },
  {
    label: 'KSM-66 versus melatonin, combination, and placebo for sleep disturbance (2026)',
    href: 'https://pubmed.ncbi.nlm.nih.gov/42029558/',
    note: 'Two hundred adults were randomized across four groups for 8 weeks: KSM-66 root extract 300 mg twice daily, melatonin 3 mg/day, the combination, or placebo. Actigraphy-measured sleep-onset latency was the primary outcome; the combination produced the largest overall sleep improvements. The paper reports no external funding or declared conflicts and acknowledges Ixoreal BioMed for supplying KSM-66.',
  },
  {
    label: 'Zenroot 1.5% in adults with mild-to-moderate non-chronic stress (2025)',
    href: 'https://pubmed.ncbi.nlm.nih.gov/40875185/',
    note: 'Ninety adults completed an 84-day placebo-controlled trial of Zenroot 125 mg/day. Pittsburgh Sleep Quality Index scores improved versus placebo on days 28, 56, and 84. PSQI is a subjective sleep-quality outcome, and the study population was selected for stress rather than insomnia. The study was funded by OmniActive Health Technologies; multiple authors were employees of OmniActive or the contract research organization.',
  },
  {
    label: 'AshwaSR sustained-release root extract in stressed adults (2026)',
    href: 'https://pubmed.ncbi.nlm.nih.gov/41824889/',
    note: 'A three-arm randomized trial assigned 135 healthy stressed adults to sustained-release root extract 150 mg/day, 300 mg/day, or placebo for 60 days; 126 completed. Both active groups reported better sleep quality than placebo at day 60. Several authors disclosed employment with companies involved in the formulation or research.',
  },
  {
    label: 'Zenroot comparative oral bioavailability study (2025)',
    href: 'https://pubmed.ncbi.nlm.nih.gov/40748423/',
    note: 'Twenty healthy adults completed a single-dose crossover pharmacokinetic study comparing Zenroot 1.5% 125 mg with higher-milligram reference extracts. It measured plasma withanolide exposure—not sleep efficacy—and should not be used to rank clinical sleep benefit.',
  },
  {
    label: 'Ashwa.30 low-dose stress trial (2026)',
    href: 'https://pubmed.ncbi.nlm.nih.gov/42593642/',
    note: 'Sixty stressed adults received Ashwa.30 30 mg/day or placebo for 28 days. The trial studied stress, mood, fatigue, stress reactivity, and cortisol—not sleep. It is useful formulation context only. Natural Remedies funded the study and several authors were employees.',
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

const EXTRACT_ROWS = [
  {
    study: '2019 insomnia + anxiety RCT',
    formulation: 'Specific full-spectrum root extract',
    population: '60 adults with insomnia and anxiety',
    regimen: '300 mg twice daily for 10 weeks',
    sleepMeasure: 'Actigraphy + sleep questionnaires',
    signal: 'Direct insomnia trial with improvements across several sleep outcomes.',
    disclosure: 'Use the paper-specific extract and design as the unit of evidence; this was not an extract-comparison trial.',
  },
  {
    study: '2021 healthy + insomnia RCT',
    formulation: 'KSM-66 aqueous root extract, >5% withanolides',
    population: '80 adults: 40 healthy, 40 with insomnia',
    regimen: '300 mg twice daily (600 mg/day) for 8 weeks',
    sleepMeasure: 'Objective sleep parameters + PSQI and validated sleep/alertness scales',
    signal: 'Sleep parameters improved in both strata, with larger changes in participants with insomnia.',
    disclosure: 'Mixed healthy/insomnia strata limit direct transfer to chronic insomnia; this was not a head-to-head extract trial.',
  },
  {
    study: '2020 non-restorative-sleep RCT',
    formulation: 'Shoden standardized root-and-leaf extract',
    population: '150 healthy adults with non-restorative sleep; 144 completed',
    regimen: '120 mg once daily for 6 weeks',
    sleepMeasure: 'Restorative Sleep Questionnaire + actigraphy',
    signal: 'Self-reported restorative sleep and actigraphy-measured efficiency, total sleep time, latency, and WASO improved versus placebo.',
    disclosure: 'Shows why milligrams are not interchangeable across extracts; does not prove Shoden is universally superior.',
  },
  {
    study: '2026 KSM-66 vs melatonin RCT',
    formulation: 'KSM-66 root-only extract (>5% withanolides); combination arm also received melatonin',
    population: '200 adults ages 18–50 with sleep disturbance; 50 per arm',
    regimen: 'KSM-66 300 mg twice daily, melatonin 3 mg/day, both, or placebo for 8 weeks',
    sleepMeasure: 'Actigraphy primary SOL; actigraphy TST/WASO/efficiency + PSQI',
    signal: 'The combination showed the greatest overall improvement; KSM-66 and melatonin monotherapy produced moderate, broadly comparable benefits.',
    disclosure: 'Single specific-product trial. No external funding or declared conflicts; Ixoreal supplied KSM-66. Does not establish universal stack synergy or long-term combination safety.',
  },
  {
    study: '2025 Zenroot RCT',
    formulation: 'Zenroot 1.5% total withanolides; plant part not stated in the PubMed abstract',
    population: '90 adults with mild-to-moderate non-chronic stress',
    regimen: '125 mg once daily for 84 days',
    sleepMeasure: 'Pittsburgh Sleep Quality Index (subjective)',
    signal: 'PSQI improved versus placebo on days 28, 56, and 84.',
    disclosure: 'Stress-selected population, not an insomnia trial. Industry-funded; company and contract-research employees were authors.',
  },
  {
    study: '2026 AshwaSR RCT',
    formulation: 'AshwaSR sustained-release root extract',
    population: '135 healthy stressed adults randomized; 126 completed',
    regimen: '150 mg/day or 300 mg/day for 60 days',
    sleepMeasure: 'Sleep-quality outcome reported in the trial',
    signal: 'Both active groups reported better sleep quality than placebo at day 60.',
    disclosure: 'Stress-selected population, not primary insomnia. Multiple authors disclosed employment with formulation/research companies.',
  },
] as const

const FAQS = [
  {
    question: 'Does ashwagandha help sleep?',
    answer:
      'A five-trial meta-analysis in 400 adults found a small overall sleep benefit, and newer trials add formulation-specific sleep signals. The evidence is promising but heterogeneous and not strong enough to support a universal product, dose, or timing rule.',
  },
  {
    question: 'How long does ashwagandha take to work for sleep?',
    answer:
      'Trials generally studied repeated use over several weeks, but study duration is not the same as a guaranteed personal onset. The evidence does not establish that everyone needs a fixed six-, eight-, or twelve-week course or that benefits begin on a predictable day.',
  },
  {
    question: 'Should ashwagandha be taken at night for sleep?',
    answer:
      'There is no universal evidence-based bedtime timing rule. Studies used different schedules and preparations. A trial schedule describes how that study was run; it is not proof that evening dosing is superior for every product or person.',
  },
  {
    question: 'What is the best ashwagandha extract for sleep?',
    answer:
      'No extract has been established as a universal winner. Positive sleep signals span different preparations and very different milligram amounts, including KSM-66, Shoden, Zenroot, and AshwaSR. Those differences strengthen the case for extract-specific interpretation, not a brand ranking.',
  },
  {
    question: 'Can ashwagandha replace CBT-I for chronic insomnia?',
    answer:
      'No. CBT-I is the first-line evidence-based treatment for chronic insomnia. A supplement trial should not delay evaluation of persistent insomnia, sleep apnea symptoms, restless legs, medication effects, mood disorders, substance-related sleep problems, or other causes of poor sleep.',
  },
  {
    question: 'Can ashwagandha be combined with melatonin or L-theanine?',
    answer:
      'A 2026 randomized trial directly tested one specific KSM-66 plus melatonin regimen and reported larger sleep improvements with the combination than with either monotherapy. That is meaningful direct evidence for that protocol, but one trial does not establish universal stack synergy, long-term combination safety, or evidence for combining ashwagandha with L-theanine, magnesium, or other sleep supplements.',
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
                Newer 2025–26 trials broaden the formulation picture, including a 2026 direct comparison of KSM-66, melatonin, their combination, and placebo. The newer evidence makes extract and measurement context more important—not less—and still does not establish a universal “ashwagandha dose for sleep.”
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight text-ink">Evidence directness</h2>
            <EvidenceSummaryCard
              title="Ashwagandha for sleep"
              evidenceLevel="Limited"
              humanEvidence="The 2021 meta-analysis included five randomized placebo-controlled trials / 400 adults and found a small significant overall sleep effect with moderate heterogeneity. Newer formulation-specific trials add subjective and objective sleep signals, including a direct KSM-66 versus melatonin comparison, but populations, extracts, endpoints, and schedules remain heterogeneous."
              mechanisticEvidence="Cortisol, GABA-related, autonomic, and preclinical sleep mechanisms are hypotheses that may help explain results. They do not prove that stress-driven insomnia is caused by a cortisol problem or that a particular mechanism determines who will respond."
              safetyProfile="No serious adverse events were reported in the pooled sleep trials, but the review said serious-adverse-event data were limited and more long-term safety data were needed. NCCIH also lists rare liver injury and several condition/medication cautions."
            />
          </section>

          <section className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8">
            <p className="eyebrow-label">Extract fingerprint</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">The evidence belongs to the studied formulation—not to “ashwagandha” as one interchangeable product</h2>
            <p className="mt-3 text-sm leading-7 text-muted">
              The table keeps preparation, population, dose, duration, measurement, and disclosure context attached to each result. That prevents a positive outcome from one proprietary extract being silently transferred to a different extract with a different plant part, standardization, delivery system, or milligram amount.
            </p>
            <ResponsiveTable label="Ashwagandha extract fingerprint by formulation, population, regimen, sleep measurement, signal, and evidence limit">
              <table className="mt-5 min-w-[1220px] w-full text-sm">
                <thead>
                  <tr className="border-b border-brand-900/10">
                    {['Study / formulation', 'Population', 'Regimen', 'Sleep measurement', 'Sleep signal', 'Funding / transferability context'].map((heading) => (
                      <th key={heading} className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-900/5">
                  {EXTRACT_ROWS.map((row) => (
                    <tr key={row.study} className="align-top">
                      <td className="py-3 pr-4 font-medium text-ink">
                        <span className="block">{row.study}</span>
                        <span className="mt-1 block font-normal text-muted">{row.formulation}</span>
                      </td>
                      <td className="py-3 pr-4 text-muted">{row.population}</td>
                      <td className="py-3 pr-4 text-muted">{row.regimen}</td>
                      <td className="py-3 pr-4 text-muted">{row.sleepMeasure}</td>
                      <td className="py-3 pr-4 text-muted">{row.signal}</td>
                      <td className="py-3 text-muted">{row.disclosure}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ResponsiveTable>
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[1rem] border border-sky-200 bg-sky-50/70 p-5">
              <h2 className="text-lg font-semibold text-sky-950">Bioavailability is not sleep efficacy</h2>
              <p className="mt-2 text-sm leading-7 text-sky-950">
                The 2025 Zenroot pharmacokinetic crossover found higher plasma withanolide exposure from 125 mg of the 1.5% formulation than from two higher-milligram reference extracts. That is useful evidence that milligrams do not travel cleanly across formulations. It does <strong>not</strong> prove superior sleep benefit, because the study measured blood exposure after a single dose rather than clinical sleep outcomes.
              </p>
            </div>
            <div className="rounded-[1rem] border border-violet-200 bg-violet-50/70 p-5">
              <h2 className="text-lg font-semibold text-violet-950">A 30 mg stress trial is not a 30 mg sleep trial</h2>
              <p className="mt-2 text-sm leading-7 text-violet-950">
                The 2026 Ashwa.30 trial used 30 mg/day for 28 days and reported a narrow self-reported stress signal plus cortisol-reactivity findings. Sleep was not an outcome. Its value here is methodological: a low milligram number can describe a distinct extract, but it cannot be imported into a “30 mg for sleep” recommendation.
              </p>
            </div>
          </section>

          <section className="rounded-[1rem] border border-amber-200 bg-amber-50/70 p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-semibold text-amber-950">Why the meta-analysis subgroup is not a dosage protocol</h2>
            <div className="mt-3 space-y-3 text-sm leading-7 text-amber-950">
              <p>
                The pooled review found larger sleep effects in the subgroup of insomnia participants, studies using at least 600 mg/day, and studies lasting at least eight weeks. Those are <strong>between-study subgroup observations</strong>, not randomized head-to-head proof that 600 mg is better than lower doses or that eight weeks is an optimal course.
              </p>
              <p>
                The 120 mg/day Shoden trial, 125 mg/day Zenroot trial, and 150/300 mg/day AshwaSR trial reinforce the same point: milligrams are not interchangeable across extracts. Extraction ratio, plant part, standardization, release profile, and formulation can change what a milligram represents.
              </p>
            </div>
          </section>

          <section className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8">
            <h2 className="text-2xl font-semibold tracking-tight text-ink">No established “best time” or “best extract”</h2>
            <div className="mt-3 space-y-3 text-[1.01rem] leading-[1.85] text-muted">
              <p>
                Sleep trials used different extracts, schedules, and durations. The literature does not establish that evening dosing is universally superior to morning or split dosing, and it does not establish KSM-66, Sensoril, Shoden, Zenroot, AshwaSR, raw powder, or another preparation as the universal best sleep form.
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
            <h2 className="text-2xl font-semibold tracking-tight text-ink">Combination evidence: one direct ashwagandha + melatonin RCT now exists</h2>
            <div className="mt-3 space-y-3 text-[1.01rem] leading-[1.85] text-muted">
              <p>
                A 2026 randomized, double-blind trial directly compared KSM-66 600 mg/day, melatonin 3 mg/day, the same two interventions combined, and placebo for eight weeks in 200 adults with sleep disturbance. The combination arm showed the largest improvements across actigraphy-based sleep onset latency, total sleep time, wake after sleep onset, sleep efficiency, and subjective sleep quality.
              </p>
              <p>
                That changes the evidence from “no direct combination trial” to “one direct specific-protocol trial.” It still does not establish that every ashwagandha extract combines synergistically with melatonin, that the trial regimen is an appropriate personal protocol, or that combining ashwagandha with L-theanine, magnesium, or other sleep supplements has comparable evidence. Longer-term combination safety also remains uncertain.
              </p>
            </div>
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
              If a supplement trial is appropriate, look for a product that clearly states plant part, extract form, and standardization. Independent quality testing can help with identity and contamination, but it does not prove sleep efficacy. A trademark, high withanolide percentage, sustained-release claim, bioavailability claim, or large milligram number is not evidence that the product is “best for sleep.”
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
