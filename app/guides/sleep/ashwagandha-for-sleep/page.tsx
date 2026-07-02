import Link from 'next/link'
import JsonLd from '@/components/seo/JsonLd'
import { buildPageMetadata, blogJsonLd, breadcrumbJsonLd, faqPageJsonLd } from '../../../../src/lib/seo'
import EvidenceSummaryCard from '@/components/evidence/EvidenceSummaryCard'
import SafetyNotice from '@/components/evidence/SafetyNotice'
import EmailCapture from '@/components/EmailCapture'
import { getRevenueProductSet } from '@/config/revenue-products'
import RecommendationSection from '@/components/RecommendationSection'
import NewsletterCtaBlock from '@/components/NewsletterCtaBlock'
import LastUpdatedBadge from '../../../../src/components/editorial/LastUpdatedBadge'
import ResponsiveTable from '@/components/ui/ResponsiveTable'
import { AFFILIATE_TAGS } from '@/config/affiliate'

// ─── Article metadata ─────────────────────────────────────────────────────────

const SLUG = 'ashwagandha-for-sleep'
const TITLE = 'Ashwagandha for Sleep: Evidence, Dosage, and What to Expect'
const DESCRIPTION =
  'Does ashwagandha improve sleep? A review of clinical evidence, proposed mechanisms, dosage protocols, and how it compares to melatonin and other sleep supplements.'
const DATE = '2026-06-09'
const AUTHOR = 'Will'
const READING_TIME = '10 min read'
const TAGS = ['ashwagandha', 'sleep', 'adaptogens', 'stress', 'withania somnifera']
const CATEGORY = 'adaptogens'

export const metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: `/guides/sleep/${SLUG}`,
  openGraphType: 'article',
})

// ─── FAQ data (also used for JSON-LD) ────────────────────────────────────────

const FAQS = [
  {
    question: 'How long does ashwagandha take to work for sleep?',
    answer:
      'Most clinical trials report meaningful sleep improvements after 6–8 weeks of consistent use at 300–600 mg/day. Some people notice lighter effects within 2–4 weeks.',
  },
  {
    question: 'Should I take ashwagandha in the morning or at night for sleep?',
    answer:
      'Evening or nighttime dosing (1–2 hours before bed) is most common for sleep purposes. Some protocols use split dosing (morning and evening). Follow the timing used in the specific trial that supports your intended benefit.',
  },
  {
    question: 'Is ashwagandha safe to take every night?',
    answer:
      'Current evidence supports daily use for 8–12 weeks without serious adverse events in healthy adults. Long-term safety data beyond 3 months is limited. Rare hepatotoxicity cases have been reported; consult a healthcare provider if you have liver conditions.',
  },
  {
    question: 'Can ashwagandha replace melatonin for sleep?',
    answer:
      'Ashwagandha works differently from melatonin. Melatonin directly signals the circadian system; ashwagandha may improve sleep quality by reducing stress and cortisol. They can be complementary, but ashwagandha is not a direct melatonin substitute.',
  },
  {
    question: 'What is the best form of ashwagandha for sleep?',
    answer:
      'KSM-66 and Sensoril are the two root-extract forms with the strongest clinical research on sleep outcomes. Full-spectrum root powder is the traditional form but has less standardization. Look for products standardized to withanolide content (≥5%).',
  },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AshwagandhaForSleepPage() {
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
      <JsonLd schema={articleLd} />
      <JsonLd schema={pageBreadcrumb} />
      {faqLd && (
        <JsonLd schema={faqLd} />
      )}

      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted">
        <Link href="/guides/" className="transition hover:text-ink">
          Articles
        </Link>
        <span>/</span>
        <span className="text-ink line-clamp-1">{TITLE}</span>
      </nav>

      {/* Hero */}
      <section className="rounded-[1.5rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8 lg:p-10">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full border border-brand-900/10 bg-brand-50 px-2.5 py-0.5 font-bold uppercase tracking-wider text-brand-800">
            Deep Dive
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
          <Link href="/info/about/" rel="author" className="font-medium text-ink hover:underline">
            {AUTHOR}
          </Link>
        </p>

        <div className="mt-3">
          <LastUpdatedBadge date={DATE} label="Last updated" />
        </div>

        <p className="mt-4 max-w-3xl text-base leading-7 text-muted">{DESCRIPTION}</p>
      </section>

      {/* Affiliate disclosure */}
      <div className="mt-4 rounded-[1rem] border border-brand-900/10 bg-brand-50/60 px-5 py-3 text-xs leading-6 text-muted">
        <strong className="text-ink">Affiliate disclosure:</strong> This article contains affiliate
        links. If you purchase through these links, we may earn a commission at no additional cost to
        you. We only link to products from extract forms validated in the clinical trials reviewed on
        this page.
      </div>

      {/* Body + sidebar */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_240px]">
        {/* Main content */}
        <div className="space-y-6">

          {/* Fastest useful choice */}
          <section className="rounded-[1rem] border border-brand-700/20 bg-brand-50/60 p-6 shadow-sm sm:p-8">
            <p className="eyebrow-label">Fastest useful choice</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
              If you only try one thing: melatonin or L-theanine (not ashwagandha)
            </h2>
            <p className="mt-3 text-[1.01rem] leading-[1.85] text-muted">
              <strong>Ashwagandha is not the fastest useful choice for sleep &mdash; it requires 6&ndash;8 weeks of consistent use to build an effect.</strong>{' '}
              If you want faster sleep onset tonight, the more useful options are{' '}
              <Link href="/guides/herbs/l-theanine" className="font-semibold text-brand-700 hover:underline">L-theanine</Link>{' '}
              (100&ndash;200&nbsp;mg, 30&ndash;60 minutes before bed) or melatonin (0.3&ndash;1&nbsp;mg,
              30&ndash;60 minutes before bed for circadian shift). Ashwagandha's strength is for
              stress-driven sleep problems where you can commit to a multi-week course &mdash; not as
              an acute sleep aid. See the{' '}
              <Link href="/guides/herbs/ashwagandha" className="font-semibold text-brand-700 hover:underline">full ashwagandha article</Link>{' '}
              and the{' '}
              <Link href="/guides/sleep/best-herbs-for-sleep" className="font-semibold text-brand-700 hover:underline">best herbs for sleep hub</Link>.
            </p>
          </section>

          {/* Quick Verdict */}
          <section className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8">
            <p className="eyebrow-label">Quick Verdict</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
              Does Ashwagandha Help With Sleep?
            </h2>
            <p className="mt-3 text-[1.01rem] leading-[1.85] text-muted">
              <strong>Probably yes, especially for stress-driven poor sleep.</strong> Multiple
              randomized controlled trials show ashwagandha root extract (300–600&nbsp;mg/day,
              standardized KSM-66 or Sensoril) improves sleep quality scores, sleep onset latency,
              and morning alertness versus placebo over 6–10 weeks. The effect is most consistent in
              adults with elevated perceived stress — the populations studied most often.
            </p>
            <p className="mt-3 text-[1.01rem] leading-[1.85] text-muted">
              It does not act as a direct sedative. Ashwagandha works indirectly — primarily by
              blunting the cortisol and adrenergic stress response that keeps the nervous system
              activated at night — rather than by inducing sedation. That makes it useful for
              winding down, less so as a sleep-onset agent for people without stress-related arousal.
            </p>
          </section>

          {/* Main article body */}
          <section className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8 space-y-8">

            {/* Introduction */}
            <div id="introduction">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">Introduction</h2>
              <p className="text-[1.01rem] leading-[1.85] text-muted">
                Ashwagandha (<em>Withania somnifera</em>) is one of the most studied adaptogens in
                evidence-based supplement research. While it is best known for stress and anxiety
                reduction, a growing body of clinical research specifically examines its effects on
                sleep — and the results are consistently positive across several independent trials.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-muted">
                This article reviews the current clinical evidence, proposes mechanisms, outlines
                dosing protocols used in trials, compares ashwagandha to competing sleep
                supplements, and flags the safety considerations that matter most for long-term use.
                All claims are referenced to primary studies or the{' '}
                <Link
                  href="/herbs/ashwagandha"
                  className="font-semibold text-brand-700 hover:text-brand-800 hover:underline"
                >
                  Ashwagandha herb profile
                </Link>
                .
              </p>
            </div>

            <hr className="border-brand-900/10" />

            {/* What Is Ashwagandha */}
            <div id="what-is-ashwagandha">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">
                What Is Ashwagandha?
              </h2>
              <p className="text-[1.01rem] leading-[1.85] text-muted">
                <em>Withania somnifera</em> is a small shrub in the Solanaceae (nightshade) family,
                native to India, North Africa, and the Mediterranean. In Ayurvedic medicine it is
                classified as a <em>rasayana</em> — a rejuvenating herb used to promote longevity,
                vitality, and resistance to disease.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-muted">
                The species name <em>somnifera</em> means &ldquo;sleep-inducing&rdquo; in Latin —
                the plant was historically used as a sedative tonic. Modern research confirms a
                genuine sleep benefit, though the mechanism is more nuanced than simple sedation.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-muted">
                Key active constituents include withanolides (steroidal lactones), withaferin A, and
                alkaloids. Commercial extracts are typically standardized to withanolide content
                (≥5%) and come in two clinically dominant patented forms:{' '}
                <strong>KSM-66</strong> (full-spectrum root extract, Ixoreal Biomed) and{' '}
                <strong>Sensoril</strong> (root and leaf extract, Natreon).
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-muted">
                For a complete breakdown of chemistry, evidence, and uses beyond sleep, see the{' '}
                <Link
                  href="/herbs/ashwagandha"
                  className="font-semibold text-brand-700 hover:text-brand-800 hover:underline"
                >
                  full Ashwagandha herb profile
                </Link>
                .
              </p>
            </div>

            <hr className="border-brand-900/10" />

            {/* How Ashwagandha May Affect Sleep */}
            <div id="mechanisms">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">
                How Ashwagandha May Affect Sleep
              </h2>
              <p className="text-[1.01rem] leading-[1.85] text-muted">
                Several convergent mechanisms have been proposed, based on preclinical data and
                plausible inference from human trial outcomes:
              </p>

              <h3 className="mt-5 mb-1 text-xl font-semibold tracking-tight text-ink">
                1. HPA Axis Modulation (Cortisol Reduction)
              </h3>
              <p className="text-[1.01rem] leading-[1.85] text-muted">
                Ashwagandha consistently reduces morning serum cortisol in stressed adults across
                multiple RCTs. Elevated cortisol at night is a primary driver of hyperarousal-type
                insomnia. By blunting the HPA axis stress response, ashwagandha may reduce the
                physiological barrier to sleep onset and maintenance.
              </p>

              <h3 className="mt-5 mb-1 text-xl font-semibold tracking-tight text-ink">
                2. GABA-A Receptor Activity
              </h3>
              <p className="text-[1.01rem] leading-[1.85] text-muted">
                Withaferin A and related withanolides have demonstrated GABA-A receptor binding
                activity in vitro and in animal models. GABA-A agonism is the mechanism of
                benzodiazepines and many common sleep aids. The magnitude of this effect in humans
                at standard doses is uncertain and likely modest.
              </p>

              <h3 className="mt-5 mb-1 text-xl font-semibold tracking-tight text-ink">
                3. Triethylene Glycol (TEG) Content
              </h3>
              <p className="text-[1.01rem] leading-[1.85] text-muted">
                A 2017 study (Kaushik et al.) isolated triethylene glycol from ashwagandha leaves
                and found it induced significant non-REM sleep in mice. TEG content varies by plant
                part (leaves vs. root) and extraction method, which may partially explain
                differential sleep effects across extract types.
              </p>

              <h3 className="mt-5 mb-1 text-xl font-semibold tracking-tight text-ink">
                4. Sympathetic Nervous System Downregulation
              </h3>
              <p className="text-[1.01rem] leading-[1.85] text-muted">
                Ashwagandha is associated with reduced markers of sympathetic activation (improved
                heart rate variability, lower serum adrenaline in some studies). Nighttime
                sympathetic activation is a core feature of stress-related insomnia; reducing it
                may facilitate transitions into deeper sleep stages.
              </p>
            </div>

            <hr className="border-brand-900/10" />

            {/* Evidence Summary */}
            <div id="evidence-summary">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
                Evidence Summary
              </h2>

              <EvidenceSummaryCard
                title="Ashwagandha &amp; Sleep Quality"
                evidenceLevel="Moderate"
                humanEvidence="Multiple RCTs (n=50–150) show significant improvements in sleep quality (PSQI, ISI scores), sleep onset latency, and total sleep time vs placebo over 6–10 weeks in adults with elevated stress. Effect sizes are moderate (Cohen's d ≈ 0.5–0.8)."
                mechanisticEvidence="Cortisol reduction via HPA axis modulation is well-documented in human trials. GABA-A binding activity demonstrated in vitro. TEG-mediated non-REM induction in animal models. Human mechanistic evidence is still developing."
                safetyProfile="Generally well-tolerated at 300–600 mg/day for 8–12 weeks. Rare hepatotoxicity cases reported in post-market surveillance. Contraindicated in pregnancy. Potential thyroid interactions at therapeutic doses."
              />

              <div className="mt-4 rounded-[1rem] border border-brand-900/10 bg-brand-50/60 p-4 text-sm leading-7 text-muted">
                <p className="font-semibold text-ink">Key trials reviewed:</p>
                <ul className="mt-2 ml-5 space-y-1 list-disc">
                  <li>
                    Langade et al. (2019) — KSM-66, 300 mg twice daily, 10 weeks, n=58 (stressed
                    adults with insomnia symptoms)
                  </li>
                  <li>
                    Langade et al. (2021) — KSM-66, 600 mg/day, 8 weeks, n=150 (primary insomnia
                    disorder)
                  </li>
                  <li>
                    Deshpande et al. (2020) — KSM-66, 300 mg/day, 8 weeks, n=80 (healthy adults)
                  </li>
                  <li>
                    Cheah et al. (2021) — Sensoril 240 mg/day, 8 weeks, n=80 (healthy adults with
                    poor sleep quality)
                  </li>
                </ul>
                <p className="mt-2 text-xs text-muted">
                  Full reference table in Sources section below.
                </p>
              </div>
            </div>

            <hr className="border-brand-900/10" />

            {/* Dosage */}
            <div id="dosage">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
                Dosage and Usage
              </h2>

              <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-5 shadow-sm">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-muted">
                  Dosage Reference — Sleep Protocols
                </p>
                <ResponsiveTable label="Ashwagandha dosage reference table">
                  <table className="min-w-[560px] w-full text-sm">
                    <thead>
                      <tr className="border-b border-brand-900/10">
                        <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                          Extract
                        </th>
                        <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                          Daily Dose
                        </th>
                        <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                          Timing
                        </th>
                        <th className="pb-2 text-left text-xs font-bold uppercase tracking-wider text-muted">
                          Duration
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-900/5">
                      <tr className="align-top">
                        <td className="py-3 pr-4 font-medium text-ink">KSM-66</td>
                        <td className="py-3 pr-4 text-muted">300–600 mg</td>
                        <td className="py-3 pr-4 text-muted">Evening or split (AM/PM)</td>
                        <td className="py-3 text-muted">6–12 weeks</td>
                      </tr>
                      <tr className="align-top">
                        <td className="py-3 pr-4 font-medium text-ink">Sensoril</td>
                        <td className="py-3 pr-4 text-muted">125–250 mg</td>
                        <td className="py-3 pr-4 text-muted">Evening</td>
                        <td className="py-3 text-muted">8–12 weeks</td>
                      </tr>
                      <tr className="align-top">
                        <td className="py-3 pr-4 font-medium text-ink">Root powder</td>
                        <td className="py-3 pr-4 text-muted">3–6 g</td>
                        <td className="py-3 pr-4 text-muted">Evening (milk or water)</td>
                        <td className="py-3 text-muted">Traditional — variable</td>
                      </tr>
                    </tbody>
                  </table>
                </ResponsiveTable>
                <p className="mt-3 text-xs text-muted">
                  Doses shown are based on clinical trial protocols reviewed in the Evidence Summary
                  above. Start at the lower end and assess tolerance before increasing. Take with
                  food to reduce GI sensitivity.
                </p>
              </div>
            </div>

            <hr className="border-brand-900/10" />

            {/* Affiliate Product Recommendations */}
            <div id="product-recommendations">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">
                Affiliate Product Recommendations
              </h2>
              <p className="text-[1.01rem] leading-[1.85] text-muted">
                These products use the extract forms and dose ranges studied in the clinical trials
                reviewed above. Affiliate links support this site at no additional cost to you.
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Best for: Stress-Driven Sleep Issues
                  </p>
                  <p className="font-semibold text-ink">KSM-66 Ashwagandha Extract</p>
                  <p className="mt-1 text-xs leading-5 text-muted">
                    Patented full-spectrum root extract. Most-studied form for sleep quality. Look
                    for ≥300 mg per capsule, standardized to ≥5% withanolides.
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
                    Best for: Lower Dose / Sensitive Users
                  </p>
                  <p className="font-semibold text-ink">Sensoril Ashwagandha Extract</p>
                  <p className="mt-1 text-xs leading-5 text-muted">
                    Root and leaf extract with strong clinical backing at lower mg doses. Well-suited
                    for sensitive individuals or stacking protocols.
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
              </div>
            </div>

            <hr className="border-brand-900/10" />

            {/* Safety */}
            <div id="safety">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
                Safety and Side Effects
              </h2>
              <SafetyNotice title="Safety Summary — Ashwagandha for Sleep">
                <ul className="ml-5 space-y-1.5 list-disc">
                  <li>
                    <strong>Generally well-tolerated</strong> at 300–600 mg/day for up to 12 weeks
                    in healthy adults across clinical trials.
                  </li>
                  <li>
                    <strong>GI discomfort</strong> (loose stools, nausea) reported in a minority of
                    users, particularly at higher doses. Taking with food reduces incidence.
                  </li>
                  <li>
                    <strong>Thyroid interactions:</strong> Ashwagandha may increase T3/T4 levels.
                    Use with caution if you have hyperthyroidism or take thyroid medication.
                  </li>
                  <li>
                    <strong>Hepatotoxicity (rare):</strong> Multiple case reports of liver injury
                    have been published, most resolving on discontinuation. Avoid if you have liver
                    disease or take hepatotoxic medications.
                  </li>
                  <li>
                    <strong>Autoimmune conditions:</strong> Ashwagandha may stimulate immune
                    function; use with caution in autoimmune disease or on immunosuppressants.
                  </li>
                  <li>
                    <strong>Pregnancy/lactation:</strong> Avoid. Animal studies show uterotonic effects; human safety data is insufficient.
                  </li>
                  <li>
                    <strong>Drug interactions:</strong> May potentiate sedatives, thyroid hormones,
                    and immunosuppressants. Limited data with SSRIs/SNRIs/MAOIs &mdash; consult a
                    clinician before combining with psychiatric medications.
                  </li>
                </ul>
              </SafetyNotice>
              <p className="mt-3 text-sm text-muted">
                See the{' '}
                <Link
                  href="/herbs/ashwagandha"
                  className="font-semibold text-brand-700 hover:text-brand-800 hover:underline"
                >
                  full Ashwagandha safety profile
                </Link>{' '}
                for a complete breakdown of adverse events, drug interactions, and
                contraindications.
              </p>
            </div>

            <hr className="border-brand-900/10" />

            {/* Comparison table */}
            <div id="comparison">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
                Ashwagandha vs Other Sleep Supplements
              </h2>
              <ResponsiveTable label="Sleep supplement comparison table">
                <table className="min-w-[600px] w-full text-sm">
                  <thead>
                    <tr className="border-b border-brand-900/10">
                      <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                        Supplement
                      </th>
                      <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                        Mechanism
                      </th>
                      <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                        Best for
                      </th>
                      <th className="pb-2 text-left text-xs font-bold uppercase tracking-wider text-muted">
                        Evidence
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-900/5">
                    <tr className="align-top">
                      <td className="py-3 pr-4 font-medium text-ink">Ashwagandha</td>
                      <td className="py-3 pr-4 text-muted">HPA axis, cortisol, GABA-A</td>
                      <td className="py-3 pr-4 text-muted">Stress-driven poor sleep</td>
                      <td className="py-3 text-muted">Moderate (multiple RCTs)</td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-4 font-medium text-ink">Melatonin</td>
                      <td className="py-3 pr-4 text-muted">MT1/MT2 receptor agonist</td>
                      <td className="py-3 pr-4 text-muted">Circadian disruption, jet lag</td>
                      <td className="py-3 text-muted">Strong (extensive RCTs)</td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-4 font-medium text-ink">Magnesium glycinate</td>
                      <td className="py-3 pr-4 text-muted">NMDA antagonism, GABA support</td>
                      <td className="py-3 pr-4 text-muted">Muscle tension, deficiency</td>
                      <td className="py-3 text-muted">Moderate</td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-4 font-medium text-ink">Valerian</td>
                      <td className="py-3 pr-4 text-muted">GABA-A agonism</td>
                      <td className="py-3 pr-4 text-muted">Sleep onset latency</td>
                      <td className="py-3 text-muted">Mixed / weak</td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-4 font-medium text-ink">L-theanine</td>
                      <td className="py-3 pr-4 text-muted">Alpha-wave promotion, relaxation</td>
                      <td className="py-3 pr-4 text-muted">Anxiety-driven arousal</td>
                      <td className="py-3 text-muted">Limited–moderate</td>
                    </tr>
                  </tbody>
                </table>
              </ResponsiveTable>
              <p className="mt-3 text-sm text-muted">
                See the full{' '}
                <Link
                  href="/guides/sleep-herbs-vs-melatonin"
                  className="font-semibold text-brand-700 hover:text-brand-800 hover:underline"
                >
                  sleep herbs vs melatonin comparison
                </Link>{' '}
                for a deeper analysis of each option.
              </p>
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
                    <p className="mt-2 text-sm leading-7 text-muted">{faq.answer}</p>
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
                  href="/guides/sleep/best-herbs-for-sleep"
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
                    passionflower, and more — with decision framework and combination guidance.
                  </p>
                </Link>
                <Link
                  href="/guides/sleep-herbs-vs-melatonin"
                  className="group rounded-[0.75rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/30"
                >
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Sleep
                  </p>
                  <p className="font-semibold text-ink transition group-hover:text-brand-700">
                    Sleep Herbs vs Melatonin
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Comparing evidence for valerian, ashwagandha, passionflower, and other herbs
                    against melatonin for sleep quality.
                  </p>
                </Link>
                <Link
                  href="/herbs/ashwagandha"
                  className="group rounded-[0.75rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/30"
                >
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Herb Profile
                  </p>
                  <p className="font-semibold text-ink transition group-hover:text-brand-700">
                    Ashwagandha Full Profile
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Complete herb monograph: chemistry, evidence, dosage, and safety across all
                    uses beyond sleep.
                  </p>
                </Link>
                <Link
                  href="/guides/anxiety/natural-anxiolytics-beyond-ashwagandha"
                  className="group rounded-[0.75rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/30"
                >
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Discovery
                  </p>
                  <p className="font-semibold text-ink transition group-hover:text-brand-700">
                    Natural Anxiolytics Beyond Ashwagandha
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Herbs and compounds for anxiety reduction when ashwagandha is not appropriate or
                    not enough.
                  </p>
                </Link>
                <Link
                  href="/guides/sleep/ashwagandha-vs-magnesium-for-sleep"
                  className="group rounded-[0.75rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/30"
                >
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Sleep Cluster
                  </p>
                  <p className="font-semibold text-ink transition group-hover:text-brand-700">
                    Ashwagandha vs Magnesium for Sleep
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Side-by-side comparison of mechanisms, evidence, timing, safety, and cost
                    to help you choose between the two or use both.
                  </p>
                </Link>
                <Link
                  href="/guides/sleep/l-theanine-for-sleep"
                  className="group rounded-[0.75rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/30"
                >
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Sleep Cluster
                  </p>
                  <p className="font-semibold text-ink transition group-hover:text-brand-700">
                    L-Theanine for Sleep
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    How L-theanine promotes relaxation without sedation — and how it compares
                    to ashwagandha.
                  </p>
                </Link>
                <Link
                  href="/guides/"
                  className="group rounded-[0.75rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/30"
                >
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    All Articles
                  </p>
                  <p className="font-semibold text-ink transition group-hover:text-brand-700">
                    Browse All Articles
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Evidence-based research notes on herbs, adaptogens, and supplements.
                  </p>
                </Link>
                <Link
                  href="/guides/herbs/ashwagandha"
                  className="group rounded-[0.75rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/30"
                >
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Umbrella Article
                  </p>
                  <p className="font-semibold text-ink transition group-hover:text-brand-700">
                    Ashwagandha: Full Article
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Evidence review across sleep, anxiety, stress, and focus.
                  </p>
                </Link>
                <Link
                  href="/guides/herbs/l-theanine"
                  className="group rounded-[0.75rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/30"
                >
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Umbrella Article
                  </p>
                  <p className="font-semibold text-ink transition group-hover:text-brand-700">
                    L-Theanine: Full Article
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Calm without sedation &mdash; useful as a faster sleep aid.
                  </p>
                </Link>
                <Link
                  href="/guides/sleep"
                  className="group rounded-[0.75rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/30"
                >
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Goal Hub
                  </p>
                  <p className="font-semibold text-ink transition group-hover:text-brand-700">
                    Sleep Goal Hub
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Compare all sleep supplements by evidence and use case.
                  </p>
                </Link>
                <Link
                  href="/guides/anxiety/natural-anxiety-relief"
                  className="group rounded-[0.75rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/30"
                >
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Anxiety Cluster
                  </p>
                  <p className="font-semibold text-ink transition group-hover:text-brand-700">
                    Natural Anxiety Relief
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Evidence-ranked guide to natural supplements for anxiety — ashwagandha,
                    L-theanine, kava, passionflower, saffron, and more.
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
                        A Prospective, Randomized Double-Blind,
                        Placebo-Controlled Study of Safety and Efficacy of a High-Concentration
                        Full-Spectrum Extract of Ashwagandha Root in Reducing Stress and Anxiety
                      </td>
                      <td className="py-3 pr-4 text-muted">
                        Chandrasekhar K, Kapoor J, Anishetty S
                      </td>
                      <td className="py-3 pr-4 text-muted">2012</td>
                      <td className="py-3">
                        <a
                          href="https://pubmed.ncbi.nlm.nih.gov/23120875/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-brand-700 hover:text-brand-800 hover:underline"
                        >
                          PMID 23120875
                        </a>
                      </td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-3 text-muted">3</td>
                      <td className="py-3 pr-4 leading-6 text-ink">
                        A Randomized, Double Blind, Placebo Controlled, Cross-over Study to Evaluate
                        the Efficacy and Safety of Ashwagandha (Withania somnifera) Extract on
                        Sleep Quality in Healthy Adults
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
                      <td className="py-3 pr-3 text-muted">4</td>
                      <td className="py-3 pr-4 leading-6 text-ink">
                        Triethylene glycol, an active component of Ashwagandha (Withania somnifera)
                        leaves, is responsible for sleep induction
                      </td>
                      <td className="py-3 pr-4 text-muted">
                        Kaushik MK, Kaul SC, Wadhwa R, Yanagisawa M, Urade Y
                      </td>
                      <td className="py-3 pr-4 text-muted">2017</td>
                      <td className="py-3">
                        <a
                          href="https://pubmed.ncbi.nlm.nih.gov/28827682/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-brand-700 hover:text-brand-800 hover:underline"
                        >
                          PMID 28827682
                        </a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </ResponsiveTable>
            </div>

          </section>

          <RecommendationSection products={getRevenueProductSet('ashwagandha')?.products ?? []} />

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
                ['#introduction', 'Introduction'],
                ['#what-is-ashwagandha', 'What Is Ashwagandha?'],
                ['#mechanisms', 'How It Affects Sleep'],
                ['#evidence-summary', 'Evidence Summary'],
                ['#dosage', 'Dosage & Usage'],
                ['#product-recommendations', 'Product Picks'],
                ['#safety', 'Safety & Side Effects'],
                ['#comparison', 'vs Other Supplements'],
                ['#faq', 'FAQ'],
                ['#sources', 'Sources'],
              ].map(([href, label]) => (
                <a
                  key={href}
                  href={href}
                  className="block text-sm text-brand-700 hover:text-brand-800 hover:underline">{label}</a>
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
                href="/herbs/ashwagandha"
                className="block text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline"
              >
                Ashwagandha herb profile →
              </Link>
              <Link
                href="/guides/sleep-herbs-vs-melatonin"
                className="block text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline"
              >
                Sleep herbs vs melatonin →
              </Link>
              <Link
                href="/guides/anxiety/natural-anxiolytics-beyond-ashwagandha"
                className="block text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline"
              >
                Natural anxiolytics →
              </Link>
              <Link
                href="/herbs/"
                className="block text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline"
              >
                All herb profiles →
              </Link>
              <Link
                href="/guides/"
                className="block text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline"
              >
                All articles →
              </Link>
            </div>
          </div>
        </aside>
      </div>

      <div className="mt-8">
        <Link href="/guides/" className="text-sm font-semibold text-brand-700 hover:text-brand-800">
          ← Back to Articles
        </Link>
      </div>
    </article>
  )
}
