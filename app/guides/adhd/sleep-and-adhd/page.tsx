import Link from 'next/link'
import { ArticleLayout, TableOfContents } from '@/components/articles'
import type { Heading } from '@/components/articles'
import StructuredData from '@/components/StructuredData'
import ResponsiveTable from '@/components/ui/ResponsiveTable'
import { SITE_URL } from '@/lib/navigation-config'
import { buildPageMetadata } from '@/lib/seo'

const PATH = '/guides/adhd/sleep-and-adhd'
const PAGE_URL = `${SITE_URL}${PATH}`
const TITLE = 'Sleep and ADHD: An Evidence Atlas for Insomnia, Circadian Delay & More'
const DESCRIPTION =
  'Evidence-first guide to sleep and ADHD: behavioral insomnia, circadian delay, stimulant-related sleep disruption, restless legs, sleep apnea, melatonin, and what objective sleep studies actually show.'

export const metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: `${PATH}/`,
  openGraphType: 'article',
})

const HEADINGS: Heading[] = [
  { id: 'verdict', text: 'Quick verdict', level: 2 },
  { id: 'phenotypes', text: 'The sleep phenotype atlas', level: 2 },
  { id: 'objective-evidence', text: 'What objective sleep studies show', level: 2 },
  { id: 'interventions', text: 'Intervention evidence', level: 2 },
  { id: 'behavioral', text: 'Behavioral sleep treatment', level: 2 },
  { id: 'circadian', text: 'Circadian delay and melatonin', level: 2 },
  { id: 'medication', text: 'ADHD medication and sleep', level: 2 },
  { id: 'lookalikes', text: 'OSA, restless legs, and symptom overlap', level: 2 },
  { id: 'adults', text: 'What changes in adults', level: 2 },
  { id: 'claim-check', text: 'Claim check', level: 2 },
  { id: 'faq', text: 'Frequently asked questions', level: 2 },
]

const PHENOTYPES = [
  {
    name: 'Behavioral / sleep-onset insomnia',
    clues: 'Bedtime resistance, long sleep onset, inconsistent routines, difficulty settling even when tired',
    evidence: 'Best direct intervention signal in pediatric ADHD is for structured behavioral sleep strategies.',
    firstQuestion: 'Is the main problem getting to sleep, and is the schedule/routine modifiable?',
  },
  {
    name: 'Circadian delay',
    clues: 'Naturally late sleep timing, eveningness, trouble waking early, sleep improves when allowed a later schedule',
    evidence: 'Systematic-review evidence links ADHD with later chronotype, delayed sleep onset, and delayed circadian phase markers.',
    firstQuestion: 'Is sleep delayed in clock time rather than simply poor in quality?',
  },
  {
    name: 'Medication-associated sleep delay',
    clues: 'Sleep worsened after a stimulant start, dose increase, formulation change, or later dosing window',
    evidence: 'Objective-trial meta-analysis found longer sleep latency, lower sleep efficiency, and shorter total sleep time on stimulants in youth.',
    firstQuestion: 'Did the sleep problem track a medication timing or formulation change?',
  },
  {
    name: 'Restless legs / limb-movement pattern',
    clues: 'Urge to move the legs, uncomfortable sensations at rest, worse in the evening, relief with movement',
    evidence: 'RLS is reported more often in ADHD cohorts, but co-occurrence does not prove that iron or another supplement treats ADHD itself.',
    firstQuestion: 'Are there classic evening leg symptoms or marked sleep fragmentation?',
  },
  {
    name: 'Sleep-disordered breathing / OSA',
    clues: 'Habitual snoring, witnessed pauses/gasping, mouth breathing, restless sleep, morning headaches, daytime sleepiness',
    evidence: 'ADHD and pediatric OSA overlap clinically; treating confirmed OSA can improve sleep and may improve behavioral symptoms.',
    firstQuestion: 'Are breathing symptoms being mistaken for “just ADHD sleep”?',
  },
  {
    name: 'Fragmented / non-restorative sleep',
    clues: 'Frequent awakenings, poor morning restoration, fatigue despite adequate time in bed',
    evidence: 'Newer objective syntheses find group-level continuity differences, but results depend on measurement method and population.',
    firstQuestion: 'Is the problem sleep continuity or restoration rather than sleep onset?',
  },
] as const

const INTERVENTION_ROWS = [
  [
    'Fang et al., 2026',
    'Meta-analysis / network meta-analysis',
    '40 RCTs; 4,361 youth with ADHD',
    'Behavioral sleep, medications, and other sleep interventions',
    'Overall sleep disturbance improved modestly; behavioral sleep interventions had the clearest subgroup signal for sleep disturbance',
    'Different interventions and outcomes were pooled; not every sleep endpoint improved',
  ],
  [
    'Hiscock et al., 2015',
    'Randomized controlled trial',
    '244 children, ages 5–12',
    'Two behavioral sleep consultations plus follow-up call vs usual care',
    'Improved parent-rated sleep and modestly improved ADHD symptoms; actigraphy sleep-duration changes were small and imprecise',
    'Much of the sleep outcome was parent reported; objective subsample was much smaller',
  ],
  [
    'Keuppens et al., 2025',
    'Randomized controlled trial',
    '92 adolescents with ADHD',
    'SIESTA cognitive-behavioral sleep-hygiene program plus usual care vs usual care',
    'Improved sleep hygiene and perceived sleep problems, but actigraphy and sleep-diary between-group differences were not significant',
    'Important subjective-vs-objective mismatch; adolescent-specific program',
  ],
  [
    'Van der Heijden et al., 2007',
    'Randomized double-blind placebo-controlled trial',
    '105 medication-free children with ADHD and chronic sleep-onset insomnia',
    'Melatonin vs placebo for 4 weeks',
    'Advanced sleep onset and dim-light melatonin onset and increased total sleep time; no significant behavior, cognition, or quality-of-life benefit',
    'Sleep benefit should not be re-labeled as evidence that melatonin treats core ADHD symptoms',
  ],
  [
    'van der Ham et al., 2026',
    'Preliminary open-label randomized trial',
    '70 adults with ADHD screening positive for at least one sleep disorder',
    'ADHD treatment as usual, ADHD treatment plus sleep treatment, or stand-alone sleep treatment',
    'Adding sleep treatment improved sleep quality and fatigue but did not significantly improve the primary ADHD-symptom comparison',
    'Small preliminary adult trial; not directly transferable to pediatric ADHD',
  ],
] as const

const FAQS = [
  {
    question: 'Does ADHD cause insomnia?',
    answer:
      'ADHD is strongly associated with sleep problems, but “ADHD insomnia” is not one single mechanism. Behavioral insomnia, circadian delay, medication effects, restless legs, sleep-disordered breathing, and other sleep disorders can produce similar complaints. Association also does not prove that ADHD itself is the sole cause.',
  },
  {
    question: 'Can poor sleep make ADHD symptoms look worse?',
    answer:
      'Yes. Sleep loss and fragmented sleep can worsen attention, irritability, executive function, and daytime behavior. In pediatric ADHD trials, improving sleep sometimes improves daytime functioning and modestly improves parent-rated ADHD symptoms, but sleep treatment is not a proven replacement for ADHD treatment.',
  },
  {
    question: 'Do stimulants always make sleep worse?',
    answer:
      'No. A meta-analysis of randomized stimulant trials in youth found average increases in sleep latency and decreases in sleep efficiency and total sleep time, but effects varied with dose frequency, treatment duration, measurement method, and other factors. Individual responses differ.',
  },
  {
    question: 'Does melatonin treat ADHD?',
    answer:
      'Melatonin has evidence for sleep timing in selected children with ADHD and chronic sleep-onset insomnia, not for treating core ADHD symptoms. In a randomized trial it advanced sleep and circadian timing but did not significantly improve behavior, cognition, or quality of life.',
  },
  {
    question: 'Should iron be taken for ADHD sleep problems?',
    answer:
      'Not simply because someone has ADHD. Restless legs and iron status are a separate clinical question, and observational links do not establish that iron supplementation treats ADHD. Iron can be harmful in excess, so suspected deficiency or restless legs deserves appropriate evaluation rather than blind supplementation.',
  },
  {
    question: 'When should snoring or breathing symptoms be evaluated?',
    answer:
      'Habitual loud snoring, witnessed pauses or gasping, labored breathing during sleep, or marked daytime sleepiness deserve medical evaluation because sleep-disordered breathing can overlap with attention and behavior problems. This page cannot diagnose obstructive sleep apnea.',
  },
]

const REFERENCES = [
  {
    label: 'Fang Y, et al. The influence of existing interventions on sleep of youth with ADHD: a meta-analysis of randomized controlled trials. Sleep Med Rev. 2026;88:102303. PMID: 42096966.',
    href: 'https://pubmed.ncbi.nlm.nih.gov/42096966/',
  },
  {
    label: 'Hiscock H, et al. Impact of a behavioural sleep intervention on symptoms and sleep in children with ADHD: randomised controlled trial. BMJ. 2015;350:h68. PMID: 25646809.',
    href: 'https://pubmed.ncbi.nlm.nih.gov/25646809/',
  },
  {
    label: 'Sciberras E, et al. Sustained impact of a sleep intervention for children with ADHD. Psychol Med. 2020;50(2):210-219. PMID: 30654852.',
    href: 'https://pubmed.ncbi.nlm.nih.gov/30654852/',
  },
  {
    label: 'Keuppens L, et al. Cognitive-behavioral sleep hygiene intervention for adolescents with ADHD: randomized controlled trial. Eur Child Adolesc Psychiatry. 2025. PMID: 40423708.',
    href: 'https://pubmed.ncbi.nlm.nih.gov/40423708/',
  },
  {
    label: 'Coogan AN, McGowan NM. Circadian function, chronotype and chronotherapy in ADHD: systematic review. Atten Defic Hyperact Disord. 2017;9(3):129-147. PMID: 28064405.',
    href: 'https://pubmed.ncbi.nlm.nih.gov/28064405/',
  },
  {
    label: 'Kidwell KM, et al. Stimulant Medications and Sleep for Youth With ADHD: A Meta-analysis. Pediatrics. 2015;136(6):1144-1153. PMID: 26598454.',
    href: 'https://pubmed.ncbi.nlm.nih.gov/26598454/',
  },
  {
    label: 'Van der Heijden KB, et al. Effect of melatonin on sleep, behavior, and cognition in ADHD and chronic sleep-onset insomnia. J Am Acad Child Adolesc Psychiatry. 2007;46(2):233-241. PMID: 17242627.',
    href: 'https://pubmed.ncbi.nlm.nih.gov/17242627/',
  },
  {
    label: 'Liang X, et al. Objectively measured sleep continuity in children and adolescents with ADHD: systematic review and meta-analysis. Psychiatry Res. 2023;328:115447. PMID: 37657199.',
    href: 'https://pubmed.ncbi.nlm.nih.gov/37657199/',
  },
  {
    label: 'Xian P, et al. Sleep dysregulation in ADHD children: a systematic review and meta-analysis. Psychol Med. 2025. PMID: 41147210.',
    href: 'https://pubmed.ncbi.nlm.nih.gov/41147210/',
  },
  {
    label: 'Ghayad T, et al. Prevalence and Clinical Impact of Restless Legs Syndrome in Pediatric Populations with ADHD: A Systematic Review. Clocks Sleep. 2025;7(3):50. PMID: 40981213.',
    href: 'https://pubmed.ncbi.nlm.nih.gov/40981213/',
  },
  {
    label: 'Leow BHW, et al. Association between ADHD and Obstructive Sleep Apnea in Children: systematic review and meta-analysis. J Atten Disord. 2026;30(6):822-832. PMID: 41910119.',
    href: 'https://pubmed.ncbi.nlm.nih.gov/41910119/',
  },
  {
    label: 'van der Ham M, et al. Effects of Sleep Treatment on Symptoms of ADHD, Sleep Quality, Fatigue, and Depressive Symptoms in Adults. J Atten Disord. 2026;30(3):354-369. PMID: 41140200.',
    href: 'https://pubmed.ncbi.nlm.nih.gov/41140200/',
  },
] as const

export default function SleepAndAdhdPage() {
  const toc = <TableOfContents headings={HEADINGS} />

  return (
    <ArticleLayout toc={toc}>
      <StructuredData
        pageUrl={PAGE_URL}
        headline={TITLE}
        description={DESCRIPTION}
        datePublished="2026-06-10"
        dateModified="2026-09-14"
        faqs={FAQS}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'ADHD Guides', href: '/guides/adhd/' },
          { label: 'Sleep and ADHD', href: PATH },
        ]}
        zone="monetized"
      />

      <div className="space-y-12">
        <section className="rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-10">
          <p className="eyebrow-label">ADHD sleep evidence atlas</p>
          <h1 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-ink sm:text-5xl">
            Sleep and ADHD: Stop Treating Every Sleep Problem as the Same Problem
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
            “ADHD sleep problems” can mean several different things: behavioral insomnia, a delayed body clock,
            stimulant-related sleep delay, restless legs, sleep-disordered breathing, or fragmented sleep. Those
            patterns have different evidence and different next questions. This atlas separates them before it
            talks about interventions.
          </p>
          <div className="mt-5 flex flex-wrap gap-3 text-xs font-semibold">
            <Link href="/guides/adhd/melatonin-for-adhd-sleep/" className="text-brand-700 hover:underline">
              Melatonin for ADHD sleep →
            </Link>
            <Link href="/guides/adhd/iron-ferritin-and-adhd/" className="text-brand-700 hover:underline">
              Iron, ferritin, and ADHD →
            </Link>
            <Link href="/guides/adhd/best-supplements-for-adhd/" className="text-brand-700 hover:underline">
              ADHD supplement evidence →
            </Link>
          </div>
        </section>

        <section id="verdict" className="scroll-mt-20 rounded-[1.65rem] border border-brand-200 bg-brand-50/60 p-6 shadow-sm sm:p-8">
          <p className="eyebrow-label">Quick verdict</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
            Sleep is a meaningful ADHD treatment target—but not a single diagnosis and not a substitute for ADHD care
          </h2>
          <p className="mt-3 text-sm leading-7 text-muted sm:text-base">
            The strongest recent synthesis included 40 randomized trials and 4,361 young people with ADHD. Across
            interventions, sleep disturbance improved modestly; behavioral sleep interventions showed the clearest
            subgroup signal for overall sleep disturbance. But sleep efficiency, sleep duration, persistent-sleep
            latency, and daytime sleepiness did not all improve consistently. The premium takeaway is precision:
            identify the sleep phenotype first, then match the evidence to it.
          </p>
          <div className="mt-5 grid gap-3 md:grid-cols-4">
            {[
              ['Best-supported pediatric strategy', 'Behavioral sleep intervention for overall sleep disturbance'],
              ['Circadian signal', 'Later chronotype and delayed phase are repeatedly reported'],
              ['Medication effect', 'Stimulants worsen some objective sleep metrics on average, not in everyone'],
              ['Core caution', 'Better sleep does not automatically mean core ADHD is treated'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-brand-900/10 bg-white/80 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand-700">{label}</p>
                <p className="mt-2 text-sm leading-6 text-ink">{value}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="phenotypes" className="scroll-mt-20 space-y-5">
          <div>
            <p className="eyebrow-label">Phenotype first</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Six sleep patterns that should not be collapsed into one “ADHD insomnia” bucket</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-muted sm:text-base">
              These are educational pattern categories, not self-diagnoses. Their job is to show why the same
              intervention should not be expected to solve every sleep complaint in ADHD.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {PHENOTYPES.map((item) => (
              <article key={item.name} className="rounded-2xl border border-brand-900/10 bg-white p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-ink">{item.name}</h3>
                <p className="mt-2 text-sm leading-6 text-muted"><strong className="text-ink">Clues:</strong> {item.clues}</p>
                <p className="mt-2 text-sm leading-6 text-muted"><strong className="text-ink">Evidence:</strong> {item.evidence}</p>
                <p className="mt-3 text-sm font-medium leading-6 text-brand-800">First question: {item.firstQuestion}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="objective-evidence" className="scroll-mt-20 space-y-4">
          <p className="eyebrow-label">Measurement matters</p>
          <h2 className="text-2xl font-semibold tracking-tight text-ink">Subjective sleep complaints are real—but objective measures do not always tell the same story</h2>
          <p className="text-sm leading-7 text-muted sm:text-base">
            A 2023 meta-analysis of 45 articles found higher actigraphy-measured sleep latency and lower sleep
            efficiency in ADHD youth, while pooled polysomnography differences were not significant. A newer 2025
            multimodal synthesis reported broader group-level continuity differences across sleep measures. The
            apparent disagreement is useful: study population, medication status, comorbidity, measurement method,
            and the number of recorded nights can materially change the result.
          </p>
          <div className="rounded-2xl border border-amber-300/60 bg-amber-50/60 p-5">
            <p className="text-sm leading-7 text-ink">
              <strong>Evidence rule:</strong> a parent or patient can have a meaningful sleep problem even when a
              single laboratory metric is normal. The reverse is also possible. A premium evidence review should
              label whether an outcome came from a questionnaire, sleep diary, actigraphy, polysomnography, or a
              circadian biomarker instead of blending them together.
            </p>
          </div>
        </section>

        <section id="interventions" className="scroll-mt-20 space-y-5">
          <div>
            <p className="eyebrow-label">Study-level evidence</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">The intervention signal depends on the outcome you ask about</h2>
          </div>
          <ResponsiveTable label="ADHD sleep intervention evidence by design, population, intervention, result, and limitation">
            <table className="min-w-[1180px] w-full text-left text-sm">
              <caption className="sr-only">ADHD sleep intervention evidence by design, population, intervention, result, and limitation</caption>
              <thead className="bg-brand-50/80">
                <tr className="border-b border-brand-900/10">
                  {['Study', 'Design', 'Population', 'Intervention', 'Main signal', 'Important limit'].map((heading) => (
                    <th key={heading} scope="col" className="px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-brand-900">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-900/10 bg-white">
                {INTERVENTION_ROWS.map((row) => (
                  <tr key={row[0]} className="align-top">
                    {row.map((cell, index) => (
                      <td key={`${row[0]}-${index}`} className={`px-4 py-4 leading-6 ${index === 0 ? 'font-semibold text-ink' : 'text-muted'}`}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </ResponsiveTable>
        </section>

        <section id="behavioral" className="scroll-mt-20 space-y-4">
          <p className="eyebrow-label">Behavioral treatment</p>
          <h2 className="text-2xl font-semibold tracking-tight text-ink">The clearest pediatric evidence is not a supplement</h2>
          <p className="text-sm leading-7 text-muted sm:text-base">
            In the 2015 Australian RCT, 244 children received a brief program built around sleep hygiene and
            standardized behavioral strategies. Parent-rated ADHD symptoms improved modestly at three and six months,
            and moderate-to-severe sleep problems were less common after treatment. At 12 months, benefits remained
            small but detectable for parent-rated sleep, ADHD symptoms, quality of life, daily functioning, and behavior.
          </p>
          <p className="text-sm leading-7 text-muted sm:text-base">
            That does not prove every child with ADHD should receive the same behavioral protocol. It does show why a
            “best sleep supplement for ADHD” framing misses the strongest direct evidence base.
          </p>
        </section>

        <section id="circadian" className="scroll-mt-20 space-y-4">
          <p className="eyebrow-label">Timing phenotype</p>
          <h2 className="text-2xl font-semibold tracking-tight text-ink">Circadian delay is more specific than “I cannot sleep”</h2>
          <p className="text-sm leading-7 text-muted sm:text-base">
            A systematic review of 62 studies involving 4,462 people with ADHD found consistent evidence for more
            eveningness/later chronotype, delayed sleep onset, and delayed circadian phase markers such as dim-light
            melatonin onset. That makes clock timing a plausible phenotype—not proof that every person with ADHD has a
            delayed circadian rhythm.
          </p>
          <div className="rounded-2xl border border-brand-900/10 bg-white p-5">
            <h3 className="font-semibold text-ink">What the classic melatonin trial actually established</h3>
            <p className="mt-2 text-sm leading-7 text-muted">
              In 105 medication-free children with ADHD and chronic sleep-onset insomnia, a four-week randomized trial
              found that melatonin advanced sleep onset and dim-light melatonin onset and increased total sleep time.
              It did <strong className="text-ink">not</strong> significantly improve behavior, cognition, or quality of
              life. The study’s 3- or 6-mg protocol describes that trial; it is not a personalized dosing recommendation.
            </p>
          </div>
        </section>

        <section id="medication" className="scroll-mt-20 space-y-4">
          <p className="eyebrow-label">Medication context</p>
          <h2 className="text-2xl font-semibold tracking-tight text-ink">Stimulants can worsen sleep on average without making the effect universal</h2>
          <p className="text-sm leading-7 text-muted sm:text-base">
            A meta-analysis of nine randomized studies with objective sleep measurement found longer sleep latency,
            lower sleep efficiency, and shorter total sleep time with stimulant medication in youth. The size of those
            effects varied with factors including dose frequency, treatment duration, measurement method, and sex.
            The correct translation is “monitor sleep and individualize medication context,” not “stimulants always
            cause insomnia.”
          </p>
          <p className="text-sm leading-7 text-muted sm:text-base">
            If sleep clearly worsens after a medication or formulation change, that pattern belongs in a medication
            review with the prescriber rather than being automatically patched with another supplement.
          </p>
        </section>

        <section id="lookalikes" className="scroll-mt-20 space-y-5">
          <p className="eyebrow-label">Do not miss the look-alikes</p>
          <h2 className="text-2xl font-semibold tracking-tight text-ink">OSA and restless legs can overlap with attention and behavior problems</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <article className="rounded-2xl border border-brand-900/10 bg-white p-5">
              <h3 className="font-semibold text-ink">Sleep-disordered breathing / OSA</h3>
              <p className="mt-2 text-sm leading-7 text-muted">
                A 2026 review of 11 studies and 903 children found substantial ADHD–OSA overlap and reported behavioral
                improvement after adenotonsillectomy in descriptive studies. The pooled prevalence estimate was highly
                heterogeneous, so it should not be treated as a precise “X% of ADHD has OSA” rule. Habitual loud snoring,
                gasping, witnessed pauses, or marked daytime sleepiness deserve evaluation rather than supplement guessing.
              </p>
            </article>
            <article className="rounded-2xl border border-brand-900/10 bg-white p-5">
              <h3 className="font-semibold text-ink">Restless legs / iron context</h3>
              <p className="mt-2 text-sm leading-7 text-muted">
                A 2025 pediatric systematic review found RLS prevalence estimates ranging widely across ADHD samples.
                That supports screening for a recognizable RLS pattern; it does not establish that low iron causes ADHD
                or that iron supplementation treats core ADHD symptoms. Status evidence and intervention evidence are
                different questions.
              </p>
            </article>
          </div>
        </section>

        <section id="adults" className="scroll-mt-20 space-y-4">
          <p className="eyebrow-label">Adults are not simply large children</p>
          <h2 className="text-2xl font-semibold tracking-tight text-ink">Adult evidence is thinner and the daytime payoff is less certain</h2>
          <p className="text-sm leading-7 text-muted sm:text-base">
            In a preliminary 2026 randomized adult study, adding sleep treatment to usual ADHD treatment improved
            subjective sleep quality and fatigue, but it did not significantly improve the primary comparison for ADHD
            symptoms. That is a useful restraint on overclaiming: improving sleep can be worthwhile even when it does not
            produce a large measurable change in core ADHD symptoms.
          </p>
        </section>

        <section id="claim-check" className="scroll-mt-20 space-y-4">
          <p className="eyebrow-label">Claims we refuse to blur</p>
          <h2 className="text-2xl font-semibold tracking-tight text-ink">Five distinctions that keep the evidence honest</h2>
          <ul className="space-y-3 text-sm leading-7 text-muted sm:text-base">
            <li><strong className="text-ink">Association ≠ cause:</strong> ADHD and a sleep disorder occurring together does not prove one caused the other.</li>
            <li><strong className="text-ink">Sleep benefit ≠ ADHD treatment:</strong> an intervention can improve sleep without significantly changing core ADHD symptoms.</li>
            <li><strong className="text-ink">Subjective ≠ objective:</strong> questionnaire improvement and actigraphy/PSG improvement are different outcomes.</li>
            <li><strong className="text-ink">Deficiency association ≠ supplement efficacy:</strong> lower ferritin or another nutrient marker does not by itself prove supplementation treats ADHD.</li>
            <li><strong className="text-ink">Pediatric ≠ adult:</strong> the strongest ADHD-sleep trials are pediatric; adult transferability should be labeled, not assumed.</li>
          </ul>
        </section>

        <section id="faq" className="scroll-mt-20 space-y-5">
          <p className="eyebrow-label">FAQ</p>
          <h2 className="text-2xl font-semibold tracking-tight text-ink">Common questions about ADHD and sleep</h2>
          <div className="space-y-4">
            {FAQS.map((faq) => (
              <details key={faq.question} className="group rounded-2xl border border-brand-900/10 bg-white p-5">
                <summary className="cursor-pointer list-none font-semibold text-ink">{faq.question}</summary>
                <p className="mt-3 text-sm leading-7 text-muted">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="space-y-4 border-t border-brand-900/10 pt-8">
          <p className="eyebrow-label">Primary sources and systematic reviews</p>
          <h2 className="text-2xl font-semibold tracking-tight text-ink">References</h2>
          <ol className="space-y-3 text-sm leading-6 text-muted">
            {REFERENCES.map((ref, index) => (
              <li key={ref.href}>
                <span className="mr-2 font-semibold text-ink">{index + 1}.</span>
                <a href={ref.href} target="_blank" rel="noreferrer" className="text-brand-700 underline decoration-brand-300 underline-offset-2 hover:text-brand-900">
                  {ref.label}
                </a>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </ArticleLayout>
  )
}
