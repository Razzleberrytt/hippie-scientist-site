import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import JsonLd from '@/components/seo/JsonLd'
import { ArticleLayout, TableOfContents } from '@/components/articles'
import type { Heading } from '@/components/articles'
import { AdhdInlineCta } from '@/components/articles/AdhdMonetizationWidgets'
import References from '@/components/References'
import ResponsiveTable from '@/components/ui/ResponsiveTable'
import {
  blogJsonLd,
  breadcrumbJsonLd,
  buildPageMetadata,
  faqPageJsonLd,
} from '../../../../src/lib/seo'

const SLUG = 'l-theanine-magnesium-adhd-stack'
const PATH = `/guides/adhd/${SLUG}`
const TITLE = 'L-Theanine + Magnesium for ADHD? Evidence & Safety'
const DESCRIPTION =
  'Can L-theanine and magnesium be combined for ADHD? Review the direct evidence, sleep context, dose limits, medication uncertainties, and safer one-change-at-a-time trial design.'
const DATE_PUBLISHED = '2026-06-12'
const DATE_MODIFIED = '2026-08-02'

export const metadata: Metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
  openGraphType: 'article',
})

const HEADINGS: Heading[] = [
  { id: 'quick-answer', text: 'Quick answer', level: 2 },
  { id: 'evidence', text: 'What the evidence shows', level: 2 },
  { id: 'claim-check', text: 'Stack claim check', level: 2 },
  { id: 'target', text: 'Choose the real target', level: 2 },
  { id: 'trial-design', text: 'Safer trial design', level: 2 },
  { id: 'dose-context', text: 'Dose context', level: 2 },
  { id: 'safety', text: 'Safety and medications', level: 2 },
  { id: 'faq', text: 'Frequently asked questions', level: 2 },
]

const FAQS = [
  {
    question: 'Do L-theanine and magnesium work better together for ADHD?',
    answer:
      'That has not been established. There is no direct ADHD trial comparing the combination with either ingredient alone or placebo. Mechanistic differences do not prove clinical synergy, and studies of multi-ingredient stress products cannot isolate the contribution of L-theanine plus magnesium.',
  },
  {
    question: 'Can this stack improve core ADHD symptoms?',
    answer:
      'Direct evidence is inadequate. The main ADHD-specific L-theanine trial measured sleep in boys and did not establish improvement in inattention, hyperactivity, impulsivity, or executive function. A magnesium systematic review found no well-controlled randomized double-blind trial and no magnesium-monotherapy study for ADHD.',
  },
  {
    question: 'Can L-theanine and magnesium be taken together?',
    answer:
      'No direct harmful interaction between the two has been established, but absence of a known interaction is not proof that the combination is safe for every person. Kidney function, age, pregnancy, medications, total magnesium exposure, blood pressure, sedation, and the reason for use all matter. A clinician or pharmacist should review pediatric use and medication combinations.',
  },
  {
    question: 'What dose should I use for an ADHD stack?',
    answer:
      'There is no established ADHD-specific or combination dose. The 2011 L-theanine trial used 400 mg daily in boys ages 8 to 12, but that study dose is not a general pediatric recommendation. NIH sets an adult upper limit of 350 mg daily for magnesium from supplements and medications unless a clinician directs otherwise; younger children have lower limits.',
  },
  {
    question: 'Is the combination safe with stimulant medication?',
    answer:
      'The pediatric L-theanine sleep trial stratified participants by stimulant use, but it was not designed or powered to prove interaction safety with every stimulant, dose, or patient profile. Do not treat “no established interaction” as guaranteed compatibility. Review the combination with the prescriber and do not change medication timing or dose based on supplement use.',
  },
  {
    question: 'Should both supplements be started at the same time?',
    answer:
      'Starting both together makes benefit and side effects difficult to interpret. When a clinician agrees that a trial is reasonable, define one target, introduce one change, record a baseline, set a review date, and add a second product only if there is a clear reason.',
  },
]

const EVIDENCE_ROWS = [
  [
    'L-theanine in ADHD',
    'One six-week randomized trial in 98 boys ages 8–12 used 400 mg/day and found better sleep percentage and sleep efficiency on actigraphy.',
    'It did not test the L-theanine + magnesium combination or establish improvement in core ADHD symptoms. Sleep latency was unchanged.',
  ],
  [
    'Magnesium in ADHD',
    'Observational meta-analyses report lower average magnesium measures in some children with ADHD.',
    'Association does not prove causation or treatment benefit. The dedicated treatment review found no well-controlled double-blind trial and no magnesium-monotherapy study.',
  ],
  [
    'L-theanine cognition',
    'A 2026 meta-analysis across healthy and clinical populations reported some acute attention and reaction-time signals.',
    'The evidence was not specific to ADHD, clinical relevance remained uncertain, and some stress findings were influenced by high-risk-of-bias studies.',
  ],
  [
    'Combination evidence',
    'A multi-ingredient product containing magnesium, B vitamins, rhodiola, and green-tea/L-theanine has been studied in stressed healthy adults.',
    'That does not isolate L-theanine plus magnesium, does not establish synergy, and does not answer an ADHD treatment question.',
  ],
] as const

const CLAIMS = [
  {
    claim: '“The two pathways are complementary, so the stack is additive.”',
    verdict: 'Mechanism is not outcome evidence',
    explanation:
      'Different proposed pathways can justify a research question, but they cannot demonstrate that the combined clinical effect is larger, safer, or more useful than either ingredient alone.',
  },
  {
    claim: '“Magnesium calms the body while L-theanine calms the mind.”',
    verdict: 'Marketing shorthand',
    explanation:
      'This framing turns broad physiological roles into predictable person-level effects. Response varies, and neither ingredient has reliable evidence for that tidy division in ADHD.',
  },
  {
    claim: '“No known interaction means stimulant compatibility.”',
    verdict: 'Too strong',
    explanation:
      'A lack of published interaction evidence is not the same as a dedicated interaction study. Medication, cardiovascular, sleep, appetite, kidney, and blood-pressure context still require review.',
  },
  {
    claim: '“A bedtime stack should work within four to six weeks.”',
    verdict: 'Unsupported timeline',
    explanation:
      'There is no validated response timeline for the combination. A trial should be judged against a defined target and stopped when benefit is absent, side effects appear, or the rationale no longer holds.',
  },
] as const

const TARGET_ROWS = [
  [
    'Core inattention, hyperactivity, or impulsivity',
    'Do not use this stack as the primary treatment plan.',
    'Evidence-based ADHD care, sleep assessment, and functional supports have stronger decision priority.',
  ],
  [
    'Sleep efficiency or nighttime restlessness',
    'L-theanine has one ADHD-specific sleep trial, but the result is narrow and not a combination result.',
    'Track objective sleep timing, awakenings, and next-day function rather than vague “calm.”',
  ],
  [
    'Low magnesium intake or deficiency concern',
    'Evaluate diet, medications, GI history, and clinical context before selecting a form or dose.',
    'Correcting a plausible gap is different from treating ADHD.',
  ],
  [
    'Constipation',
    'A magnesium form may be selected for its GI effect under appropriate guidance.',
    'That use case does not require L-theanine and should not be reframed as an ADHD stack.',
  ],
  [
    'Daytime “calm focus”',
    'L-theanine research outside ADHD is mixed and often acute or conducted with caffeine.',
    'Avoid promising a non-sedating focus effect or assuming general cognition studies transfer to ADHD.',
  ],
] as const

const TRIAL_STEPS = [
  [
    'Define one target',
    'Choose a measurable outcome such as sleep efficiency, sleep onset, constipation, or correction of low intake. “Better ADHD” is too broad to interpret.',
  ],
  [
    'Review reasons not to self-test',
    'Pause for clinician or pharmacist review when the user is a child, pregnant, has kidney disease, uses prescription medication, has low blood pressure, or already takes sedating products.',
  ],
  [
    'Change one variable',
    'Do not start L-theanine, magnesium, and a multi-ingredient sleep blend together. One change makes benefit and harm attributable.',
  ],
  [
    'Record a baseline',
    'Track the target before the trial. Without a baseline, normal variation can look like a supplement effect.',
  ],
  [
    'Set a review and stop rule',
    'Decide in advance when the trial ends, what counts as meaningful benefit, and which symptoms require stopping or medical advice.',
  ],
] as const

const REFERENCES = [
  {
    n: 1,
    text: 'Lyon MR, et al. L-theanine and objective sleep quality in boys with ADHD: randomized double-blind placebo-controlled trial. 2011. PMID: 22214254.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/22214254/',
  },
  {
    n: 2,
    text: 'Ghanizadeh A. A systematic review of magnesium therapy for treating ADHD. 2013. PMID: 23808779.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/23808779/',
  },
  {
    n: 3,
    text: 'Huang YH, et al. Magnesium levels in children with ADHD: systematic review and meta-analysis. 2019. PMID: 30496768.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/30496768/',
  },
  {
    n: 4,
    text: 'Gerolymos C, et al. Cognitive and affective effects of L-theanine: systematic review and meta-analysis of 31 randomized trials. 2026. PMID: 42410082.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/42410082/',
  },
  {
    n: 5,
    text: 'Payne ER, et al. Tea, L-theanine, and L-theanine plus caffeine for cognition, sleep, and mood: systematic review and meta-analysis. 2025. PMID: 40314930.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/40314930/',
  },
  {
    n: 6,
    text: 'Noah L, et al. Magnesium, B vitamins, rhodiola, and green tea/L-theanine in chronically stressed healthy adults: randomized placebo-controlled study. 2022. PMID: 35565828.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/35565828/',
  },
  {
    n: 7,
    text: 'NIH Office of Dietary Supplements. Magnesium: Fact Sheet for Health Professionals.',
    url: 'https://ods.od.nih.gov/factsheets/Magnesium-HealthProfessional/',
  },
  {
    n: 8,
    text: 'Moshfeghinia R, et al. L-theanine supplementation in mental disorders: systematic review. 2024. PMID: 39633316.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/39633316/',
  },
] as const

export default function LTheanineMagnesiumAdhdStackPage() {
  const articleLd = blogJsonLd(
    {
      title: TITLE,
      slug: SLUG,
      date: DATE_PUBLISHED,
      updated: DATE_MODIFIED,
      description: DESCRIPTION,
    },
    `${PATH}/`,
  )
  const breadcrumbLd = breadcrumbJsonLd([
    { name: 'Guides', url: 'https://thehippiescientist.net/guides/' },
    { name: 'ADHD Guides', url: 'https://thehippiescientist.net/guides/adhd/' },
    { name: TITLE, url: `https://thehippiescientist.net${PATH}/` },
  ])
  const faqLd = faqPageJsonLd({ pagePath: `${PATH}/`, questions: FAQS })
  const toc = <TableOfContents headings={HEADINGS} />

  return (
    <ArticleLayout toc={toc} zone="supplement">
      <JsonLd schema={articleLd} />
      <JsonLd schema={breadcrumbLd} />
      {faqLd && <JsonLd schema={faqLd} />}

      <div className="space-y-12">
        <section className="rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-10">
          <p className="eyebrow-label">Combination evidence review</p>
          <h1 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-ink sm:text-5xl">
            L-Theanine + Magnesium for ADHD?
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
            No direct ADHD trial shows that this two-ingredient stack is synergistic, improves core symptoms, or
            has a validated dose. The most defensible use is narrower: evaluate each ingredient against a
            separate target, then avoid combining them unless both have a clear role.
          </p>
          <div className="mt-5 flex flex-wrap gap-3 text-xs font-semibold">
            <Link href="/guides/adhd/l-theanine-for-adhd/" className="text-brand-700 hover:underline">
              L-theanine evidence →
            </Link>
            <Link href="/guides/adhd/best-magnesium-supplement-for-adhd/" className="text-brand-700 hover:underline">
              Magnesium decision guide →
            </Link>
            <Link href="/guides/adhd/adhd-stack-guide/" className="text-brand-700 hover:underline">
              Safer stack framework →
            </Link>
          </div>

          <figure className="mt-7">
            <div className="overflow-hidden rounded-2xl border border-brand-900/10 bg-white shadow-sm">
              <Image
                src="/images/guides/l-theanine-magnesium-adhd-stack.jpg"
                alt="L-theanine and magnesium supplements evaluated as separate parts of an ADHD-related sleep decision"
                width={1536}
                height={1024}
                priority
                className="h-auto w-full"
              />
            </div>
            <figcaption className="mt-3 text-center text-sm text-muted">
              Two plausible ingredients do not automatically create a proven stack.
            </figcaption>
          </figure>
        </section>

        <section id="quick-answer" className="scroll-mt-20 rounded-[1.65rem] border border-brand-200 bg-brand-50/60 p-6 shadow-sm sm:p-8">
          <p className="eyebrow-label">Quick answer</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
            The combination is untested for ADHD outcomes
          </h2>
          <p className="mt-3 text-sm leading-7 text-muted sm:text-base">
            L-theanine has one ADHD-specific pediatric trial supporting a narrow sleep-efficiency outcome.
            Magnesium has observational status findings but inadequate treatment evidence. No trial establishes
            that taking them together improves attention, hyperactivity, impulsivity, executive function, or
            sleep more than either ingredient alone.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              ['Best evidence boundary', 'Do not present this as an ADHD treatment or established synergy.'],
              ['Best practical rule', 'Start with the target and test one ingredient at a time.'],
              ['Best safety rule', 'Medication compatibility and pediatric dosing require clinical review.'],
            ].map(([title, copy]) => (
              <div key={title} className="rounded-xl border border-brand-900/10 bg-white/80 p-4">
                <h3 className="text-sm font-semibold text-ink">{title}</h3>
                <p className="mt-2 text-xs leading-6 text-muted">{copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="evidence" className="scroll-mt-20 space-y-5">
          <div className="max-w-3xl">
            <p className="eyebrow-label">Evidence map</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
              What each study can—and cannot—support
            </h2>
          </div>
          <ResponsiveTable label="Evidence for L-theanine and magnesium in ADHD-related decisions">
            <table className="min-w-[900px] w-full text-left text-sm">
              <thead className="bg-brand-50/80">
                <tr className="border-b border-brand-900/10">
                  {['Evidence area', 'What was observed', 'Boundary'].map((heading) => (
                    <th key={heading} className="px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-brand-900">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-900/10 bg-white">
                {EVIDENCE_ROWS.map(([area, observed, boundary]) => (
                  <tr key={area} className="align-top">
                    <td className="px-4 py-4 font-semibold text-ink">{area}</td>
                    <td className="px-4 py-4 text-muted">{observed}</td>
                    <td className="px-4 py-4 text-muted">{boundary}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ResponsiveTable>
        </section>

        <section id="claim-check" className="scroll-mt-20 space-y-5">
          <div>
            <p className="eyebrow-label">Claim check</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
              Four shortcuts the evidence does not support
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {CLAIMS.map((item) => (
              <div key={item.claim} className="rounded-2xl border border-brand-900/10 bg-white/90 p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand-700">{item.verdict}</p>
                <h3 className="mt-2 text-base font-semibold text-ink">{item.claim}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{item.explanation}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="target" className="scroll-mt-20 rounded-[1.65rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8">
          <p className="eyebrow-label">Decision framework</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
            Choose the real target before considering a stack
          </h2>
          <div className="mt-5">
            <ResponsiveTable label="Targets for an L-theanine or magnesium trial">
              <table className="min-w-[900px] w-full text-left text-sm">
                <thead className="bg-brand-50/80">
                  <tr className="border-b border-brand-900/10">
                    {['Target', 'Evidence-calibrated decision', 'Tracking rule'].map((heading) => (
                      <th key={heading} className="px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-brand-900">
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-900/10 bg-white">
                  {TARGET_ROWS.map(([target, decision, tracking]) => (
                    <tr key={target} className="align-top">
                      <td className="px-4 py-4 font-semibold text-ink">{target}</td>
                      <td className="px-4 py-4 text-muted">{decision}</td>
                      <td className="px-4 py-4 text-muted">{tracking}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ResponsiveTable>
          </div>
        </section>

        <AdhdInlineCta type="stack" />

        <section id="trial-design" className="scroll-mt-20 space-y-5">
          <div className="max-w-3xl">
            <p className="eyebrow-label">N-of-1 design</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
              Make a trial interpretable before making it complicated
            </h2>
          </div>
          <ol className="space-y-4">
            {TRIAL_STEPS.map(([title, copy], index) => (
              <li key={title} className="rounded-2xl border border-brand-900/10 bg-white/90 p-5 shadow-sm">
                <div className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-800">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="font-semibold text-ink">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted">{copy}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section id="dose-context" className="scroll-mt-20 rounded-[1.65rem] border border-amber-900/15 bg-amber-50/70 p-6 shadow-sm sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-800">Study context—not a protocol</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-amber-950">
            There is no validated combination dose
          </h2>
          <div className="mt-4 space-y-4 text-sm leading-7 text-amber-950/90">
            <p>
              The pediatric L-theanine trial used 400 mg daily, split between breakfast and after school, for six
              weeks. That dose belongs in the study description; it should not be converted into a universal
              bedtime recommendation or copied for a child without clinical guidance.
            </p>
            <p>
              Magnesium labels report elemental magnesium, not total compound weight. NIH sets a 350 mg/day
              upper limit from supplements and medications for adults and ages 9–18 unless a clinician directs
              otherwise. Limits are 65 mg/day for ages 1–3 and 110 mg/day for ages 4–8. Food magnesium is not
              included in those limits.
            </p>
            <p>
              A “200–300 mg magnesium + 100–200 mg L-theanine” stack may look ordinary online, but it is not an
              evidence-based ADHD protocol and can exceed age-specific magnesium limits. Product serving size,
              other supplements, antacids, and laxatives must be counted.
            </p>
          </div>
        </section>

        <section id="safety" className="scroll-mt-20 rounded-[1.65rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8">
          <p className="eyebrow-label">Safety and medications</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
            “No known interaction” is not a safety certificate
          </h2>
          <ul className="mt-5 space-y-3 text-sm leading-7 text-muted">
            <li>
              <strong>ADHD medication:</strong> The L-theanine sleep trial included stimulant and non-stimulant
              users through stratified randomization, but it was not a dedicated interaction study. Review the
              combination with the prescriber.
            </li>
            <li>
              <strong>Kidney impairment:</strong> Reduced magnesium clearance raises the risk of accumulation and
              toxicity. Do not self-supplement without medical guidance.
            </li>
            <li>
              <strong>Medication absorption:</strong> Magnesium can interfere with oral bisphosphonates and bind
              tetracycline or quinolone antibiotics. Follow the medicine label or pharmacist’s spacing advice.
            </li>
            <li>
              <strong>Blood pressure and sedation:</strong> L-theanine data are limited across medication
              combinations. Review use with blood-pressure drugs, sedatives, sleep medicines, alcohol, or other
              calming supplements rather than assuming additive effects are harmless.
            </li>
            <li>
              <strong>Children, pregnancy, and breastfeeding:</strong> Do not copy adult internet protocols.
              Product quality, dose, indication, and medication context require clinician review.
            </li>
            <li>
              <strong>Stop signals:</strong> Persistent diarrhea, vomiting, unusual weakness, dizziness, fainting,
              breathing difficulty, marked sedation, worsening mood, or a concerning medication change require
              stopping and appropriate medical advice.
            </li>
          </ul>
          <div className="mt-5 flex flex-wrap gap-4 text-sm font-semibold">
            <Link href="/safety-checker/" className="text-brand-700 hover:underline">
              Check interaction pathways →
            </Link>
            <Link href="/guides/other/supplement-stacking-safety/" className="text-brand-700 hover:underline">
              General stacking safety guide →
            </Link>
          </div>
        </section>

        <AdhdInlineCta type="safety" />

        <section className="rounded-[1.65rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-ink">Continue with the narrower decision</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Link href="/guides/adhd/l-theanine-for-adhd/" className="rounded-xl border border-brand-900/10 p-4 text-sm font-semibold text-brand-700 hover:underline">
              Review L-theanine alone →
            </Link>
            <Link href="/guides/adhd/best-magnesium-supplement-for-adhd/" className="rounded-xl border border-brand-900/10 p-4 text-sm font-semibold text-brand-700 hover:underline">
              Choose magnesium by role and label →
            </Link>
            <Link href="/guides/adhd/sleep-and-adhd/" className="rounded-xl border border-brand-900/10 p-4 text-sm font-semibold text-brand-700 hover:underline">
              Separate sleep problems from ADHD →
            </Link>
            <Link href="/guides/adhd/adhd-supplements/" className="rounded-xl border border-brand-900/10 p-4 text-sm font-semibold text-brand-700 hover:underline">
              Return to the evidence hub →
            </Link>
          </div>
        </section>

        <section id="faq" className="scroll-mt-20 rounded-[1.65rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-semibold tracking-tight text-ink">Frequently asked questions</h2>
          <div className="mt-5 divide-y divide-brand-900/10">
            {FAQS.map((faq) => (
              <div key={faq.question} className="py-5 first:pt-0 last:pb-0">
                <h3 className="font-semibold text-ink">{faq.question}</h3>
                <p className="mt-2 text-sm leading-7 text-muted">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <References refs={[...REFERENCES]} />

        <p className="text-xs leading-6 text-muted">
          This guide is educational. It does not diagnose ADHD, magnesium deficiency, or a sleep disorder and
          does not prescribe a supplement stack. Discuss pediatric use, pregnancy, kidney disease, persistent
          sleep problems, low blood pressure, and medication combinations with a qualified clinician or
          pharmacist.
        </p>
      </div>
    </ArticleLayout>
  )
}
