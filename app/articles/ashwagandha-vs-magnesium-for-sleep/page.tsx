import Link from 'next/link'
import { buildPageMetadata, blogJsonLd, breadcrumbJsonLd, faqPageJsonLd } from '../../../src/lib/seo'
import EvidenceSummaryCard from '@/components/evidence/EvidenceSummaryCard'
import SafetyNotice from '@/components/evidence/SafetyNotice'
import EmailCapture from '@/components/EmailCapture'
import NewsletterCtaBlock from '@/components/NewsletterCtaBlock'
import LastUpdatedBadge from '../../../src/components/editorial/LastUpdatedBadge'
import ResponsiveTable from '@/components/ui/ResponsiveTable'
import { AFFILIATE_TAGS } from '@/config/affiliate'

// ─── Article metadata ─────────────────────────────────────────────────────────

const SLUG = 'ashwagandha-vs-magnesium-for-sleep'
const TITLE = 'Ashwagandha vs Magnesium for Sleep: Which Should You Take?'
const DESCRIPTION =
  'A practical comparison of ashwagandha and magnesium for sleep, including mechanisms, timing, evidence strength, safety, cost, and whether they can be combined.'
const DATE = '2026-06-09'
const AUTHOR = 'Will'
const READING_TIME = '12 min read'
const TAGS = ['comparison', 'sleep', 'ashwagandha', 'magnesium']
const CATEGORY = 'comparison'

export const metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: `/articles/${SLUG}`,
  openGraphType: 'article',
})

// ─── FAQ data (also used for JSON-LD) ────────────────────────────────────────

const FAQS = [
  {
    question: 'Is ashwagandha better than magnesium for sleep?',
    answer:
      'Neither is universally better — they suit different situations. Ashwagandha is more consistently studied for sleep quality improvements in adults with elevated stress. Magnesium may be more helpful when muscle tension, restlessness, or low mineral status is the primary issue. Your sleep problem type matters more than which supplement is "stronger."',
  },
  {
    question: 'Can I take ashwagandha and magnesium together?',
    answer:
      'Generally yes, for many healthy adults. They work through different mechanisms and no significant adverse interaction between them is established. However, direct combination trials are limited, so the evidence base for the combo is thinner than for either supplement alone. Start one first, assess it for 1–2 weeks, then add the second if needed.',
  },
  {
    question: 'Which should I try first?',
    answer:
      'If your main issue is stress, racing thoughts, or anxiety that keeps you awake, start with ashwagandha (KSM-66 or Sensoril). If your main issue is physical tension, restlessness, or general sleep quality without a strong stress component, start with magnesium glycinate. If budget is tight, magnesium glycinate is typically less expensive and a reasonable first step for most people.',
  },
  {
    question: 'Should I take them at night?',
    answer:
      'Evening or nighttime dosing is standard for both when targeting sleep. For magnesium, 30–60 minutes before bed is commonly studied. For ashwagandha, 1–2 hours before bed is a common protocol, though some trials use split morning/evening dosing. Taking with a light meal or snack may reduce GI sensitivity.',
  },
  {
    question: 'Is magnesium safer than ashwagandha?',
    answer:
      'Magnesium has a broader safety dataset as an essential mineral and is generally well-tolerated in healthy adults at typical supplemental doses. The main caution is kidney disease. Ashwagandha has a shorter modern track record, rare liver injury reports, and more contraindications (pregnancy, thyroid disease, autoimmune conditions). For most healthy adults without those conditions, both have acceptable safety profiles at normal doses.',
  },
  {
    question: 'Can either replace melatonin?',
    answer:
      'Neither is a melatonin substitute. Melatonin directly signals the circadian system and is the intervention of choice for sleep timing problems (jet lag, shift work, circadian disruption). Ashwagandha and magnesium work on stress/relaxation pathways, not circadian timing. They can be used alongside melatonin but serve a different function.',
  },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AshwagandhaVsMagnesiumForSleepPage() {
  const pageBreadcrumb = breadcrumbJsonLd([
    { name: 'Articles', url: 'https://thehippiescientist.net/articles' },
    { name: TITLE, url: `https://thehippiescientist.net/articles/${SLUG}` },
  ])

  const articleLd = blogJsonLd(
    { title: TITLE, slug: SLUG, date: DATE, description: DESCRIPTION },
    `/articles/${SLUG}`,
  )

  const faqLd = faqPageJsonLd({ pagePath: `/articles/${SLUG}`, questions: FAQS })

  return (
    <article className="mx-auto max-w-5xl space-y-0 px-4 pb-20 pt-6 sm:px-6 lg:px-8">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageBreadcrumb) }}
      />
      {faqLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      )}

      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted">
        <Link href="/articles" className="transition hover:text-ink">
          Articles
        </Link>
        <span>/</span>
        <span className="text-ink line-clamp-1">{TITLE}</span>
      </nav>

      {/* Hero */}
      <section className="rounded-[1.5rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8 lg:p-10">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full border border-brand-900/10 bg-brand-50 px-2.5 py-0.5 font-bold uppercase tracking-wider text-brand-800">
            Comparison
          </span>
          <span className="rounded-full border border-brand-900/10 bg-white px-2.5 py-0.5 font-semibold text-muted capitalize">
            {CATEGORY}
          </span>
          {TAGS.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-brand-900/10 bg-white px-2.5 py-0.5 font-semibold text-muted capitalize"
            >
              {tag}
            </span>
          ))}
          <span className="text-muted">June 9, 2026</span>
          <span className="text-muted">·</span>
          <span className="text-muted">{READING_TIME}</span>
        </div>

        <h1 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl lg:text-5xl">
          {TITLE}
        </h1>

        <p className="mt-2 text-sm text-muted">
          By{' '}
          <Link href="/about" rel="author" className="font-medium text-ink hover:underline">
            {AUTHOR}
          </Link>
        </p>

        <div className="mt-3">
          <LastUpdatedBadge date={DATE} label="Last updated" />
        </div>

        <p className="mt-4 max-w-3xl text-base leading-7 text-[#46574d]">{DESCRIPTION}</p>
      </section>

      {/* Affiliate disclosure */}
      <div className="mt-4 rounded-[1rem] border border-brand-900/10 bg-brand-50/60 px-5 py-3 text-xs leading-6 text-muted">
        <strong className="text-ink">Affiliate disclosure:</strong> This article contains affiliate
        links. If you purchase through these links, we may earn a commission at no additional cost to
        you. We only link to extract forms and dose ranges consistent with the clinical protocols
        reviewed on this page.
      </div>

      {/* Body + sidebar */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_240px]">
        {/* Main content */}
        <div className="space-y-6">

          {/* Quick Verdict */}
          <section className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8">
            <p className="eyebrow-label">Quick Verdict</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
              Ashwagandha vs Magnesium: The Short Answer
            </h2>
            <ul className="mt-4 space-y-2">
              <li className="flex gap-2 text-[1.01rem] leading-[1.85] text-[#46574d]">
                <span className="mt-1 flex-shrink-0 text-brand-700">▸</span>
                <span>
                  <strong>Choose magnesium</strong> if you want the simplest first sleep supplement
                  — particularly magnesium glycinate for muscle tension, restlessness, or general
                  sleep quality.
                </span>
              </li>
              <li className="flex gap-2 text-[1.01rem] leading-[1.85] text-[#46574d]">
                <span className="mt-1 flex-shrink-0 text-brand-700">▸</span>
                <span>
                  <strong>Choose ashwagandha</strong> if stress is the main reason you cannot sleep
                  — it has more direct evidence for sleep quality improvements in stressed
                  populations.
                </span>
              </li>
              <li className="flex gap-2 text-[1.01rem] leading-[1.85] text-[#46574d]">
                <span className="mt-1 flex-shrink-0 text-brand-700">▸</span>
                <span>
                  <strong>Consider both</strong> if stress and physical tension overlap — they work
                  through different mechanisms and the combination is generally reasonable for
                  healthy adults.
                </span>
              </li>
              <li className="flex gap-2 text-[1.01rem] leading-[1.85] text-[#46574d]">
                <span className="mt-1 flex-shrink-0 text-brand-700">▸</span>
                <span>
                  <strong>Do not start both on the same night</strong> if you want to know what
                  works — introduce one at a time over 1–2 weeks to identify the effect.
                </span>
              </li>
            </ul>
          </section>

          {/* Main article body */}
          <section className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8 space-y-8">

            {/* Side-by-Side Comparison Table */}
            <div id="comparison-table">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
                Side-by-Side Comparison
              </h2>
              <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-5 shadow-sm">
                <ResponsiveTable label="Ashwagandha vs magnesium for sleep — full comparison table">
                  <table className="min-w-[680px] w-full text-sm">
                    <thead>
                      <tr className="border-b border-brand-900/10">
                        <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                          Feature
                        </th>
                        <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                          Ashwagandha
                        </th>
                        <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                          Magnesium
                        </th>
                        <th className="pb-2 text-left text-xs font-bold uppercase tracking-wider text-muted">
                          Winner / Best Fit
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-900/5">
                      <tr className="align-top">
                        <td className="py-3 pr-4 font-medium text-ink">Best for</td>
                        <td className="py-3 pr-4 text-[#46574d]">Stress-driven poor sleep</td>
                        <td className="py-3 pr-4 text-[#46574d]">Tension, restlessness, deficiency</td>
                        <td className="py-3 text-[#46574d]">Depends on your situation</td>
                      </tr>
                      <tr className="align-top">
                        <td className="py-3 pr-4 font-medium text-ink">Main mechanism</td>
                        <td className="py-3 pr-4 text-[#46574d]">HPA axis, cortisol, GABA-A</td>
                        <td className="py-3 pr-4 text-[#46574d]">NMDA antagonism, GABA support, melatonin pathway</td>
                        <td className="py-3 text-[#46574d]">Different — complementary</td>
                      </tr>
                      <tr className="align-top">
                        <td className="py-3 pr-4 font-medium text-ink">Speed of effect</td>
                        <td className="py-3 pr-4 text-[#46574d]">6–8 weeks (most trials)</td>
                        <td className="py-3 pr-4 text-[#46574d]">1–4 weeks (some notice sooner)</td>
                        <td className="py-3 text-[#46574d]">Magnesium (early onset possible)</td>
                      </tr>
                      <tr className="align-top">
                        <td className="py-3 pr-4 font-medium text-ink">Evidence strength</td>
                        <td className="py-3 pr-4 text-[#46574d]">Moderate (multiple RCTs in stressed adults)</td>
                        <td className="py-3 pr-4 text-[#46574d]">Limited–Moderate (smaller RCTs, older adults)</td>
                        <td className="py-3 text-[#46574d]">Ashwagandha (for direct sleep outcomes)</td>
                      </tr>
                      <tr className="align-top">
                        <td className="py-3 pr-4 font-medium text-ink">Safety profile</td>
                        <td className="py-3 pr-4 text-[#46574d]">Good; rare hepatotoxicity, thyroid concerns</td>
                        <td className="py-3 pr-4 text-[#46574d]">Good; kidney disease caution, GI upset</td>
                        <td className="py-3 text-[#46574d]">Magnesium (fewer contraindications)</td>
                      </tr>
                      <tr className="align-top">
                        <td className="py-3 pr-4 font-medium text-ink">Cost</td>
                        <td className="py-3 pr-4 text-[#46574d]">Moderate</td>
                        <td className="py-3 pr-4 text-[#46574d]">Lower</td>
                        <td className="py-3 text-[#46574d]">Magnesium (typically cheaper)</td>
                      </tr>
                      <tr className="align-top">
                        <td className="py-3 pr-4 font-medium text-ink">Best user</td>
                        <td className="py-3 pr-4 text-[#46574d]">Stressed adult with racing thoughts at night</td>
                        <td className="py-3 pr-4 text-[#46574d]">Anyone; especially with tension or deficiency</td>
                        <td className="py-3 text-[#46574d]">Depends on root cause</td>
                      </tr>
                      <tr className="align-top">
                        <td className="py-3 pr-4 font-medium text-ink">Main drawback</td>
                        <td className="py-3 pr-4 text-[#46574d]">Slow onset; thyroid, pregnancy contraindications</td>
                        <td className="py-3 pr-4 text-[#46574d]">GI upset at higher doses; kidney caution</td>
                        <td className="py-3 text-[#46574d]">Manageable for most healthy adults</td>
                      </tr>
                      <tr className="align-top">
                        <td className="py-3 pr-4 font-medium text-ink">Can combine?</td>
                        <td className="py-3 pr-4 text-[#46574d]">Yes, with magnesium</td>
                        <td className="py-3 pr-4 text-[#46574d]">Yes, with ashwagandha</td>
                        <td className="py-3 text-[#46574d]">Yes — start one, then add second</td>
                      </tr>
                    </tbody>
                  </table>
                </ResponsiveTable>
              </div>
            </div>

            <hr className="border-brand-900/10" />

            {/* How Ashwagandha Works for Sleep */}
            <div id="ashwagandha-mechanisms">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">
                How Ashwagandha Works for Sleep
              </h2>
              <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                Ashwagandha (<em>Withania somnifera</em>) is an adaptogenic herb with a specific
                epithet — <em>somnifera</em> — that means &ldquo;sleep-inducing&rdquo; in Latin.
                Despite this name, it does not act as a direct sedative. Its sleep benefit is
                indirect, working primarily through stress adaptation pathways.
              </p>

              <h3 className="mt-5 mb-1 text-xl font-semibold tracking-tight text-ink">
                Stress Adaptation and HPA Axis Modulation
              </h3>
              <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                Ashwagandha is most consistently documented to reduce perceived stress and, in many
                trials, morning serum cortisol. Elevated cortisol at night is a primary driver of
                hyperarousal-type insomnia — the kind where the mind stays activated and sleep onset
                is delayed despite physical tiredness. By modulating the HPA axis stress response,
                ashwagandha may reduce the physiological barrier to sleep onset and maintenance.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                This mechanism makes ashwagandha most useful for people whose sleep is disrupted by
                stress and cognitive arousal, rather than for people with primary insomnia unrelated
                to stress.
              </p>

              <h3 className="mt-5 mb-1 text-xl font-semibold tracking-tight text-ink">
                Relaxation Without Sedation
              </h3>
              <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                Withanolides — the primary active constituents — have demonstrated GABA-A receptor
                binding activity in preclinical studies. This may contribute to a mild relaxation
                effect, though the magnitude at standard human doses is uncertain. Ashwagandha is
                not a sedative in the pharmacological sense; it does not reliably induce drowsiness
                the way benzodiazepines or antihistamines do.
              </p>

              <p className="mt-4 text-sm text-muted">
                For the full clinical evidence review, mechanisms, and dosage protocols for
                ashwagandha as a sleep supplement, see the{' '}
                <Link
                  href="/articles/ashwagandha-for-sleep"
                  className="font-semibold text-brand-700 hover:text-brand-800 hover:underline"
                >
                  Ashwagandha for Sleep article
                </Link>
                .
              </p>
            </div>

            <hr className="border-brand-900/10" />

            {/* How Magnesium Works for Sleep */}
            <div id="magnesium-mechanisms">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">
                How Magnesium Works for Sleep
              </h2>
              <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                Magnesium is an essential mineral involved in over 300 enzymatic reactions. It
                supports sleep through several neurological pathways, particularly by reducing
                excitatory signaling and supporting the inhibitory systems that allow the nervous
                system to quiet at night.
              </p>

              <h3 className="mt-5 mb-1 text-xl font-semibold tracking-tight text-ink">
                Nervous System Relaxation
              </h3>
              <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                Magnesium ions block NMDA glutamate receptors, reducing excitatory
                neurotransmission. It also supports GABA-A receptor activity — the same inhibitory
                pathway targeted by common sleep medications. Together, these effects may lower
                cortical excitability and ease the transition from wakefulness into sleep.
              </p>

              <h3 className="mt-5 mb-1 text-xl font-semibold tracking-tight text-ink">
                Muscle Tension and Restlessness
              </h3>
              <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                Magnesium plays a role in muscle relaxation by competing with calcium at
                neuromuscular junctions. Muscle tension, cramps, or restless sensations at night
                are frequently reported by people with suboptimal magnesium status. Supplementation
                may reduce these physical barriers to sleep.
              </p>

              <h3 className="mt-5 mb-1 text-xl font-semibold tracking-tight text-ink">
                Form Matters
              </h3>
              <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                Magnesium glycinate is the most recommended form for sleep applications because the
                glycine co-carrier has its own independent calming and sleep-promoting properties.
                Magnesium L-threonate is used for its proposed CNS penetration, and magnesium
                citrate is a lower-cost option. Magnesium oxide — the most common cheap form — has
                poor bioavailability and is not preferred for sleep.
              </p>

              <p className="mt-4 text-sm text-muted">
                For a full breakdown of each magnesium form and dosage protocols, see the{' '}
                <Link
                  href="/articles/magnesium-for-sleep"
                  className="font-semibold text-brand-700 hover:text-brand-800 hover:underline"
                >
                  Magnesium for Sleep article
                </Link>{' '}
                and the{' '}
                <Link
                  href="/articles/magnesium-types-for-sleep"
                  className="font-semibold text-brand-700 hover:text-brand-800 hover:underline"
                >
                  Magnesium Types for Sleep guide
                </Link>
                .
              </p>
            </div>

            <hr className="border-brand-900/10" />

            {/* Which Works Faster */}
            <div id="speed">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">
                Which Works Faster?
              </h2>
              <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                Speed of onset differs meaningfully between the two supplements, though individual
                responses vary and neither should be evaluated on a single night.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                <strong>Magnesium</strong> may feel more immediate for some people — particularly
                in the form of reduced physical tension or restlessness during the first days to
                weeks of use. This is especially likely if low magnesium status is a contributing
                factor. That said, consistent improvements in overall sleep quality are more
                commonly reported after several weeks of daily use.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                <strong>Ashwagandha</strong> is typically evaluated over longer timeframes. Most
                clinical trials measuring sleep outcomes report effects at 6–8 weeks, and some
                only at 8–12 weeks. Expecting a notable effect in the first few nights is
                unlikely. Adaptogens generally require sustained use before their regulatory
                effects become apparent.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                Both supplements should be judged over consistent use rather than isolated nights.
                Placebo responses and night-to-night sleep variability make single-night
                assessments unreliable for any supplement.
              </p>
            </div>

            <hr className="border-brand-900/10" />

            {/* Which Has Better Evidence */}
            <div id="evidence">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
                Which Has Better Evidence?
              </h2>

              <div className="space-y-4">
                <EvidenceSummaryCard
                  title="Ashwagandha — Sleep Evidence"
                  evidenceLevel="Moderate"
                  humanEvidence="Multiple randomized controlled trials (n=50–150 per study) show improvements in sleep quality scores (PSQI, ISI), sleep onset latency, and total sleep time over 6–10 weeks in adults with elevated stress. Consistent direction of effect across independent trials. Effect sizes moderate (Cohen's d approximately 0.5–0.8 in available trials). Most studied population: adults with perceived stress or subclinical insomnia."
                  mechanisticEvidence="HPA axis modulation and cortisol reduction are well-documented in human trials. GABA-A binding demonstrated in vitro. Triethylene glycol-mediated non-REM induction in animal models. Human mechanistic data is still developing."
                  safetyProfile="Generally well-tolerated at 300–600 mg/day for 8–12 weeks. Rare hepatotoxicity reports in post-market data. Contraindicated in pregnancy. Potential thyroid interactions."
                />

                <EvidenceSummaryCard
                  title="Magnesium — Sleep Evidence"
                  evidenceLevel="Limited"
                  humanEvidence="Some RCTs and observational studies show improvements in sleep quality, efficiency, and early morning awakening. Evidence is most consistent in older adults and those with suboptimal dietary magnesium intake. Trial sizes are smaller and study populations more heterogeneous than ashwagandha sleep trials. Evidence in magnesium-replete healthy younger adults is limited."
                  mechanisticEvidence="NMDA antagonism, GABA-A potentiation, and melatonin synthesis support are biologically plausible and supported by preclinical data. Human mechanistic evidence is mainly indirect, from deficiency correction rather than pharmacological dose effects."
                  safetyProfile="Well-tolerated at 200–400 mg elemental per day in healthy adults. GI upset (especially with oxide/citrate forms at higher doses) is the main side effect. Kidney disease requires caution due to impaired excretion."
                />
              </div>

              <p className="mt-4 text-sm text-muted">
                Evidence grades above reflect current editorial assessments. They are updated as new trials are published.
              </p>
            </div>

            <hr className="border-brand-900/10" />

            {/* Safety Comparison */}
            <div id="safety">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
                Safety Comparison
              </h2>
              <SafetyNotice title="Safety Summary — Ashwagandha vs Magnesium">
                <p className="mb-3 font-semibold text-ink">Magnesium</p>
                <ul className="ml-5 space-y-1.5 list-disc">
                  <li>
                    <strong>Kidney disease:</strong> Magnesium excretion depends on kidney
                    function. Supplementation in people with reduced kidney function (CKD stage
                    3+) can cause hypermagnesemia. Consult a physician before supplementing.
                  </li>
                  <li>
                    <strong>GI upset:</strong> Diarrhea, loose stools, and cramping are the
                    most common side effects, especially with oxide and citrate forms at higher
                    doses. Starting low and taking with food reduces incidence.
                  </li>
                  <li>
                    <strong>Medication spacing:</strong> May interfere with absorption of
                    bisphosphonates, fluoroquinolone and tetracycline antibiotics, and some
                    blood pressure medications. Separate doses by at least 2 hours.
                  </li>
                </ul>

                <p className="mt-4 mb-3 font-semibold text-ink">Ashwagandha</p>
                <ul className="ml-5 space-y-1.5 list-disc">
                  <li>
                    <strong>Pregnancy:</strong> Avoid. Animal studies show uterotonic effects;
                    human safety data is absent.
                  </li>
                  <li>
                    <strong>Thyroid conditions:</strong> Ashwagandha may increase T3/T4 levels.
                    Use with caution if you have hyperthyroidism or take thyroid medication.
                  </li>
                  <li>
                    <strong>Autoimmune disease:</strong> May stimulate immune function; use with
                    caution in autoimmune conditions or on immunosuppressants.
                  </li>
                  <li>
                    <strong>Rare hepatotoxicity:</strong> Multiple case reports of liver injury
                    have been published, most resolving on discontinuation. Avoid with liver
                    disease or hepatotoxic medications.
                  </li>
                  <li>
                    <strong>Sedative medications:</strong> Ashwagandha may potentiate the effects
                    of prescription sedatives and anxiolytics.
                  </li>
                </ul>

                <p className="mt-4 mb-3 font-semibold text-ink">Both supplements</p>
                <ul className="ml-5 space-y-1.5 list-disc">
                  <li>Start at the lowest effective dose and assess tolerance before increasing.</li>
                  <li>
                    Avoid stacking either supplement with prescription sedatives (benzodiazepines,
                    z-drugs, barbiturates) without medical guidance.
                  </li>
                  <li>
                    &ldquo;Natural&rdquo; does not mean risk-free. Both can interact with
                    medications and medical conditions.
                  </li>
                </ul>
              </SafetyNotice>
            </div>

            <hr className="border-brand-900/10" />

            {/* Combining Ashwagandha and Magnesium */}
            <div id="combining">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">
                Can You Take Ashwagandha and Magnesium Together?
              </h2>
              <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                For most healthy adults, combining ashwagandha and magnesium is generally
                considered reasonable. They work through distinct primary mechanisms — ashwagandha
                primarily through the HPA axis and stress-cortisol pathways, magnesium through
                NMDA antagonism, GABA support, and mineral repletion. No significant adverse
                interaction between the two is established in the literature.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                However, direct combination trials are limited. The evidence base for the specific
                combination is thinner than for either supplement studied alone. Claims about
                additive or synergistic sleep effects from taking both together are not
                well-supported by clinical data at this time.
              </p>
              <div className="mt-4 rounded-[1rem] border border-brand-900/10 bg-brand-50/60 p-4 text-sm leading-7 text-[#46574d]">
                <p className="font-semibold text-ink">Practical approach for combining:</p>
                <ul className="mt-2 ml-5 space-y-1 list-disc">
                  <li>
                    Start with one supplement first. Assess your response over 1–2 weeks before
                    adding the second.
                  </li>
                  <li>
                    Starting both simultaneously makes it impossible to attribute effects or side
                    effects to either supplement.
                  </li>
                  <li>
                    If you take prescription sedatives, anxiolytics, or thyroid medications,
                    consult a clinician before adding either supplement — let alone both.
                  </li>
                  <li>
                    You do not need to take both at once. Magnesium 30–60 minutes before bed,
                    ashwagandha 1–2 hours before bed, is a common approach when combining.
                  </li>
                </ul>
              </div>
            </div>

            <hr className="border-brand-900/10" />

            {/* Cost and Buying Guide */}
            <div id="buying-guide">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">
                Cost and Buying Guide
              </h2>
              <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                These products represent the extract forms and dose ranges most relevant to the
                evidence reviewed in this article. Affiliate links support this site at no
                additional cost to you.
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Ashwagandha — Most Studied for Sleep
                  </p>
                  <p className="font-semibold text-ink">KSM-66 Ashwagandha Extract</p>
                  <p className="mt-1 text-xs leading-5 text-[#46574d]">
                    Patented full-spectrum root extract. The most-studied form for sleep quality
                    outcomes. Look for ≥300 mg per capsule, standardized to ≥5% withanolides.
                  </p>
                  <a
                    href={`https://www.amazon.com/s?k=KSM-66+ashwagandha&tag=${AFFILIATE_TAGS.amazon}`}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="mt-3 inline-flex items-center gap-1 rounded-full bg-brand-950 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-brand-900"
                  >
                    View on Amazon →
                  </a>
                </div>
                <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Ashwagandha — Lower Dose / Sensitive Users
                  </p>
                  <p className="font-semibold text-ink">Sensoril Ashwagandha Extract</p>
                  <p className="mt-1 text-xs leading-5 text-[#46574d]">
                    Root and leaf extract with strong clinical backing at lower mg doses. Well-suited
                    for sensitive individuals or when stacking with magnesium.
                  </p>
                  <a
                    href={`https://www.amazon.com/s?k=Sensoril+ashwagandha&tag=${AFFILIATE_TAGS.amazon}`}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="mt-3 inline-flex items-center gap-1 rounded-full bg-brand-950 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-brand-900"
                  >
                    View on Amazon →
                  </a>
                </div>
                <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Magnesium — Best for Sleep
                  </p>
                  <p className="font-semibold text-ink">Magnesium Glycinate</p>
                  <p className="mt-1 text-xs leading-5 text-[#46574d]">
                    High bioavailability, gentle on the stomach, with glycine co-carrier that has
                    independent calming properties. Look for 200–400 mg elemental magnesium per
                    serving.
                  </p>
                  <a
                    href={`https://www.amazon.com/s?k=magnesium+glycinate+sleep&tag=${AFFILIATE_TAGS.amazon}`}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="mt-3 inline-flex items-center gap-1 rounded-full bg-brand-950 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-brand-900"
                  >
                    View on Amazon →
                  </a>
                </div>
                <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Magnesium — Sleep + Cognitive
                  </p>
                  <p className="font-semibold text-ink">Magnesium L-Threonate</p>
                  <p className="mt-1 text-xs leading-5 text-[#46574d]">
                    CNS-targeted delivery, proposed to cross the blood-brain barrier more readily.
                    Higher price point than glycinate. Useful when cognitive benefits alongside
                    sleep are a goal.
                  </p>
                  <a
                    href={`https://www.amazon.com/s?k=magnesium+l-threonate+magtein&tag=${AFFILIATE_TAGS.amazon}`}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="mt-3 inline-flex items-center gap-1 rounded-full bg-brand-950 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-brand-900"
                  >
                    View on Amazon →
                  </a>
                </div>
              </div>
            </div>

            <hr className="border-brand-900/10" />

            {/* Decision Framework */}
            <div id="decision-framework">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
                Decision Framework
              </h2>
              <div className="rounded-[1rem] border border-brand-900/10 bg-brand-50/60 p-5">
                <ul className="space-y-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 font-bold text-ink">If budget is tight:</span>
                    <span>
                      Start with magnesium glycinate — it is typically less expensive and a
                      reasonable first step for most adults.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 font-bold text-ink">If stress is high:</span>
                    <span>
                      Start with ashwagandha (KSM-66 or Sensoril). The evidence for sleep
                      improvement in stressed populations is more direct.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 font-bold text-ink">If body tension or restlessness is the main problem:</span>
                    <span>
                      Start with magnesium glycinate. It addresses the physical tension component
                      more directly.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 font-bold text-ink">If racing thoughts and stress overlap:</span>
                    <span>
                      Start with ashwagandha first, then consider adding magnesium after 1–2 weeks
                      if physical tension is also present.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 font-bold text-ink">If you want one simple start:</span>
                    <span>
                      Magnesium glycinate — lower cost, fewer contraindications, and reasonable
                      evidence for sleep support.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 font-bold text-ink">If sleep problems are severe or chronic:</span>
                    <span>
                      Neither supplement replaces a medical evaluation. Chronic insomnia, sleep
                      apnea symptoms, or significant daytime impairment warrant clinical assessment
                      before or alongside any supplementation.
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            <hr className="border-brand-900/10" />

            {/* What Not To Do */}
            <div id="what-not-to-do">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
                What Not To Do
              </h2>
              <ul className="space-y-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                <li className="flex gap-2">
                  <span className="mt-1 flex-shrink-0 text-brand-700">✕</span>
                  <span>
                    <strong>Do not start five sleep supplements at once.</strong> You will have no
                    idea what is working, and you increase the risk of interaction effects.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 flex-shrink-0 text-brand-700">✕</span>
                  <span>
                    <strong>Do not megadose either supplement</strong> in the hope of accelerating
                    results. Evidence does not support dose escalation beyond studied ranges, and
                    higher doses increase adverse effect risk.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 flex-shrink-0 text-brand-700">✕</span>
                  <span>
                    <strong>Do not assume natural means risk-free.</strong> Both supplements have
                    contraindications, drug interactions, and population-specific cautions.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 flex-shrink-0 text-brand-700">✕</span>
                  <span>
                    <strong>Do not ignore sleep apnea symptoms</strong> (loud snoring,
                    witnessed breathing pauses, gasping, excessive daytime sleepiness). No
                    supplement addresses obstructive sleep apnea and the condition is
                    underdiagnosed.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 flex-shrink-0 text-brand-700">✕</span>
                  <span>
                    <strong>Do not use supplements to cover up severe insomnia</strong> without
                    evaluation. Persistent insomnia has treatable causes and effective
                    non-pharmacological interventions (CBT-I) that supplements do not replicate.
                  </span>
                </li>
              </ul>
            </div>

            <hr className="border-brand-900/10" />

            {/* FAQ */}
            <div id="faq">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
                Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                {FAQS.map((faq, i) => (
                  <div
                    key={i}
                    className="rounded-[0.75rem] border border-brand-900/10 bg-brand-50/40 p-4"
                  >
                    <h3 className="font-semibold text-ink">{faq.question}</h3>
                    <p className="mt-2 text-sm leading-7 text-[#46574d]">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>

            <hr className="border-brand-900/10" />

            {/* Related Articles */}
            <div id="related-articles">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
                Related Articles
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <Link
                  href="/articles/ashwagandha-for-sleep"
                  className="group rounded-[0.75rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/30"
                >
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Sleep Cluster
                  </p>
                  <p className="font-semibold text-ink transition group-hover:text-brand-700">
                    Ashwagandha for Sleep
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Full clinical evidence review: mechanisms, dosage, extract types, and safety
                    for ashwagandha as a sleep supplement.
                  </p>
                </Link>
                <Link
                  href="/articles/magnesium-for-sleep"
                  className="group rounded-[0.75rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/30"
                >
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Sleep Cluster
                  </p>
                  <p className="font-semibold text-ink transition group-hover:text-brand-700">
                    Magnesium for Sleep
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Evidence, magnesium types, dosage protocols, and safety for magnesium
                    as a sleep supplement.
                  </p>
                </Link>
                <Link
                  href="/articles/magnesium-types-for-sleep"
                  className="group rounded-[0.75rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/30"
                >
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Sleep Cluster
                  </p>
                  <p className="font-semibold text-ink transition group-hover:text-brand-700">
                    Magnesium Types for Sleep
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Deep dive: glycinate vs threonate vs citrate vs oxide — which form to
                    choose for sleep.
                  </p>
                </Link>
                <Link
                  href="/articles/best-herbs-for-sleep"
                  className="group rounded-[0.75rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/30"
                >
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Sleep Cluster Hub
                  </p>
                  <p className="font-semibold text-ink transition group-hover:text-brand-700">
                    Best Herbs for Sleep
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Evidence-ranked guide to magnesium, ashwagandha, L-theanine, valerian,
                    passionflower, and more.
                  </p>
                </Link>
                <Link
                  href="/articles/l-theanine-for-sleep"
                  className="group rounded-[0.75rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/30"
                >
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Sleep Cluster
                  </p>
                  <p className="font-semibold text-ink transition group-hover:text-brand-700">
                    L-Theanine for Sleep
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Evidence for L-theanine as a relaxation and sleep-quality supplement,
                    and how it compares to ashwagandha and magnesium.
                  </p>
                </Link>
                <Link
                  href="/articles/sleep-stack-guide"
                  className="group rounded-[0.75rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/30"
                >
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Sleep Cluster
                  </p>
                  <p className="font-semibold text-ink transition group-hover:text-brand-700">
                    Sleep Stack Guide
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    How to combine ashwagandha, magnesium, and other sleep supplements safely
                    and effectively.
                  </p>
                </Link>
              </div>
            </div>

            <hr className="border-brand-900/10" />

            {/* Sources */}
            <div id="sources">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">Sources</h2>
              <ResponsiveTable label="Article references">
                <table className="min-w-[600px] w-full text-sm">
                  <thead>
                    <tr className="border-b border-brand-900/10">
                      <th className="pb-2 pr-3 text-left text-xs font-bold uppercase tracking-wider text-muted">
                        #
                      </th>
                      <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                        Study
                      </th>
                      <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                        Authors
                      </th>
                      <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                        Year
                      </th>
                      <th className="pb-2 text-left text-xs font-bold uppercase tracking-wider text-muted">
                        Link
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-900/5">
                    <tr className="align-top">
                      <td className="py-3 pr-3 text-muted">1</td>
                      <td className="py-3 pr-4 leading-6 text-ink">
                        Efficacy and Safety of Ashwagandha (Withania somnifera) Root Extract in
                        Insomnia and Anxiety: A Double-blind, Randomized, Placebo-controlled Study
                      </td>
                      <td className="py-3 pr-4 text-muted">
                        Langade D, Kanchi S, Salve J, Debnath K, Ambegaokar D
                      </td>
                      <td className="py-3 pr-4 text-muted">2019</td>
                      <td className="py-3">
                        <a
                          href="https://pubmed.ncbi.nlm.nih.gov/31564735/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-brand-700 hover:text-brand-800 hover:underline"
                        >
                          PMID 31564735
                        </a>
                      </td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-3 text-muted">2</td>
                      <td className="py-3 pr-4 leading-6 text-ink">
                        A Randomized, Double Blind, Placebo Controlled, Cross-over Study to Evaluate
                        the Efficacy and Safety of Ashwagandha (Withania somnifera) Extract on Sleep
                        Quality in Healthy Adults
                      </td>
                      <td className="py-3 pr-4 text-muted">
                        Cheah KL, Norhayati MN, Husniati Yaacob L, Abdul Rahman R
                      </td>
                      <td className="py-3 pr-4 text-muted">2021</td>
                      <td className="py-3">
                        <a
                          href="https://pubmed.ncbi.nlm.nih.gov/34559859/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-brand-700 hover:text-brand-800 hover:underline"
                        >
                          PMID 34559859
                        </a>
                      </td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-3 text-muted">3</td>
                      <td className="py-3 pr-4 leading-6 text-ink">
                        The effect of magnesium supplementation on primary insomnia in elderly:
                        A double-blind placebo-controlled clinical trial
                      </td>
                      <td className="py-3 pr-4 text-muted">
                        Abbasi B, Kimiagar M, Sadeghniiat K, Shirazi MM, Hedayati M, Rashidkhani B
                      </td>
                      <td className="py-3 pr-4 text-muted">2012</td>
                      <td className="py-3">
                        <a
                          href="https://pubmed.ncbi.nlm.nih.gov/23853635/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-brand-700 hover:text-brand-800 hover:underline"
                        >
                          PMID 23853635
                        </a>
                      </td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-3 text-muted">4</td>
                      <td className="py-3 pr-4 leading-6 text-ink">
                        Oral Mg(2+) supplementation reverses age-related neuroendocrine and sleep
                        EEG changes in humans
                      </td>
                      <td className="py-3 pr-4 text-muted">
                        Held K, Antonijevic IA, Künzel H, Uhr M, Wetter TC, Golly IC, Steiger A,
                        Murck H
                      </td>
                      <td className="py-3 pr-4 text-muted">2002</td>
                      <td className="py-3 text-muted">
                        PMID 12163983
                      </td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-3 text-muted">5</td>
                      <td className="py-3 pr-4 leading-6 text-ink">
                        Magnesium deprivation disrupts sleep in rats: behavioral and EEG findings
                      </td>
                      <td className="py-3 pr-4 text-muted">Nielsen FH, Johnson LK, Zeng H</td>
                      <td className="py-3 pr-4 text-muted">2010</td>
                      <td className="py-3 text-muted">
                        Animal study
                      </td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-3 text-muted">6</td>
                      <td className="py-3 pr-4 leading-6 text-ink">
                        Direct combination evidence (ashwagandha + magnesium co-administration)
                      </td>
                      <td className="py-3 pr-4 text-muted">—</td>
                      <td className="py-3 pr-4 text-muted">—</td>
                      <td className="py-3 text-muted">
                        No combination trial identified in source registry
                      </td>
                    </tr>
                  </tbody>
                </table>
              </ResponsiveTable>
              <p className="mt-3 text-xs text-muted">
                Ashwagandha safety references are shared
                with the{' '}
                <Link
                  href="/articles/ashwagandha-for-sleep"
                  className="font-semibold text-brand-700 hover:text-brand-800 hover:underline"
                >
                  Ashwagandha for Sleep article
                </Link>
                . Magnesium safety references are shared with the{' '}
                <Link
                  href="/articles/magnesium-for-sleep"
                  className="font-semibold text-brand-700 hover:text-brand-800 hover:underline"
                >
                  Magnesium for Sleep article
                </Link>
                .
              </p>
            </div>

          </section>

          {/* Email capture */}
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

        {/* Sidebar */}
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          {/* Table of contents */}
          <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
              In this article
            </p>
            <nav className="mt-3 space-y-1.5" aria-label="Article sections">
              {[
                ['#comparison-table', 'Side-by-Side Table'],
                ['#ashwagandha-mechanisms', 'How Ashwagandha Works'],
                ['#magnesium-mechanisms', 'How Magnesium Works'],
                ['#speed', 'Which Works Faster?'],
                ['#evidence', 'Evidence Comparison'],
                ['#safety', 'Safety Comparison'],
                ['#combining', 'Taking Both Together'],
                ['#buying-guide', 'Cost &amp; Buying Guide'],
                ['#decision-framework', 'Decision Framework'],
                ['#what-not-to-do', 'What Not To Do'],
                ['#faq', 'FAQ'],
                ['#sources', 'Sources'],
              ].map(([href, label]) => (
                <a
                  key={href}
                  href={href}
                  className="block text-sm text-brand-700 hover:text-brand-800 hover:underline"
                  dangerouslySetInnerHTML={{ __html: label }}
                />
              ))}
            </nav>
          </div>

          {/* Related profiles */}
          <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
              Explore more
            </p>
            <div className="mt-3 space-y-2">
              <Link
                href="/articles/ashwagandha-for-sleep"
                className="block text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline"
              >
                Ashwagandha for sleep →
              </Link>
              <Link
                href="/articles/magnesium-for-sleep"
                className="block text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline"
              >
                Magnesium for sleep →
              </Link>
              <Link
                href="/articles/magnesium-types-for-sleep"
                className="block text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline"
              >
                Magnesium types for sleep →
              </Link>
              <Link
                href="/articles/best-herbs-for-sleep"
                className="block text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline"
              >
                Best herbs for sleep →
              </Link>
              <Link
                href="/guides/sleep-herbs-vs-melatonin"
                className="block text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline"
              >
                Sleep herbs vs melatonin →
              </Link>
              <Link
                href="/articles"
                className="block text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline"
              >
                All articles →
              </Link>
            </div>
          </div>
        </aside>
      </div>

      <div className="mt-8">
        <Link href="/articles" className="text-sm font-semibold text-brand-700 hover:text-brand-800">
          ← Back to Articles
        </Link>
      </div>
    </article>
  )
}
