import Link from 'next/link'
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

const SLUG = 'ashwagandha'
const TITLE = 'Ashwagandha: The Evidence-Based Guide (Stress, Anxiety, Sleep, and Focus)'
const DESCRIPTION =
  'A comprehensive evidence-based review of ashwagandha (Withania somnifera): mechanisms, clinical research, dosage, safety, what it works for, what it does not, and how it compares with L-theanine, magnesium, and other adaptogens.'
const DATE = '2026-06-26'
const AUTHOR = 'Will'
const READING_TIME = '14 min read'
const TAGS = ['ashwagandha', 'adaptogens', 'stress', 'anxiety', 'sleep', 'withania somnifera']
const CATEGORY = 'adaptogens'

export const metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: `/articles/${SLUG}`,
  openGraphType: 'article',
})

// ─── FAQ data (also used for JSON-LD) ────────────────────────────────────────

const FAQS = [
  {
    question: 'What is ashwagandha best for?',
    answer:
      'Ashwagandha has the strongest evidence for reducing perceived stress and cortisol in chronically stressed adults (multiple RCTs of KSM-66 or Sensoril at 300–600 mg/day over 4–8 weeks). Secondary evidence supports sleep quality improvement in stress-driven insomnia, and modest effects on anxiety symptoms. Evidence for focus, testosterone, and athletic performance is positive but more limited.',
  },
  {
    question: 'How long does ashwagandha take to work?',
    answer:
      'Most studies report meaningful effects after 4–8 weeks of consistent daily use at 300–600 mg/day of a standardized extract. Some people notice lighter subjective effects within 2 weeks. Ashwagandha is not a same-day or acute supplement; it works by modulating the HPA axis over time.',
  },
  {
    question: 'Is ashwagandha safe to take every day?',
    answer:
      'Short- to medium-term daily use (8–12 weeks) at standard doses (300–600 mg/day of KSM-66 or Sensoril) is well-tolerated in healthy adults across most clinical trials. Long-term safety data beyond 3 months is more limited. Rare hepatotoxicity cases have been reported in post-market surveillance. Avoid in pregnancy, autoimmune disease, hyperthyroidism, and with sedatives or immunosuppressants unless a clinician supervises.',
  },
  {
    question: 'Is ashwagandha the same as L-theanine?',
    answer:
      'No — they work very differently. Ashwagandha is an adaptogen that lowers cortisol over weeks (slow, foundational). L-theanine is an amino acid that raises calming alpha-wave activity within 30–60 minutes (fast, acute). For racing thoughts at bedtime, L-theanine is the faster tool. For chronic stress load, ashwagandha is the better long-term answer. Many people stack them.',
  },
  {
    question: 'Which form of ashwagandha is best?',
    answer:
      'KSM-66 (full-spectrum root extract, ≥5% withanolides) and Sensoril (root and leaf extract) are the two patented extracts with the strongest clinical research. KSM-66 has more anxiety and stress trials; Sensoril has more insomnia and cortisol data. Generic "ashwagandha root powder" is traditional but less standardized. Always look for a clearly labeled extract and withanolide percentage.',
  },
  {
    question: 'Can I take ashwagandha with magnesium?',
    answer:
      'Yes — they are commonly stacked because they address different aspects of stress. Ashwagandha modulates the HPA axis and cortisol over weeks; magnesium supports nervous-system regulation acutely and is often taken in the evening. There are no major documented interactions. Introduce them one at a time so you can isolate effects.',
  },
  {
    question: 'Does ashwagandha cause liver damage?',
    answer:
      'Rare case reports of liver injury have been published, most resolving on discontinuation. The absolute risk appears low at standard doses of well-characterized extracts, but it is real. If you have pre-existing liver disease, take hepatotoxic medications, or develop symptoms (jaundice, dark urine, severe fatigue, right-sided abdominal pain), stop and seek medical attention.',
  },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AshwagandhaArticlePage() {
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
        <Link href="/articles/" className="transition hover:text-ink">
          Articles
        </Link>
        <span>/</span>
        <span className="text-ink line-clamp-1">{TITLE}</span>
      </nav>

      {/* Hero */}
      <section className="rounded-[1.5rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8 lg:p-10">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full border border-brand-900/10 bg-brand-50 px-2.5 py-0.5 font-bold uppercase tracking-wider text-brand-800">
            Umbrella Hub
          </span>
          <span className="rounded-full border border-brand-900/10 bg-white px-2.5 py-0.5 font-semibold text-muted capitalize">
            {CATEGORY}
          </span>
          {TAGS.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-brand-900/10 bg-white px-2.5 py-0.5 font-semibold text-muted capitalize"
            >
              {tag}
            </span>
          ))}
          <span className="text-muted">{new Date(DATE).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          <span className="text-muted">·</span>
          <span className="text-muted">{READING_TIME}</span>
        </div>

        <h1 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl lg:text-5xl">
          {TITLE}
        </h1>

        <p className="mt-2 text-sm text-muted">
          By{' '}
          <Link href="/info/info/about/" rel="author" className="font-medium text-ink hover:underline">
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
              When ashwagandha is the right choice (and when it is not)
            </h2>
            <p className="mt-3 text-[1.01rem] leading-[1.85] text-muted">
              <strong>Ashwagandha is the right choice for chronic, stress-driven symptoms</strong> —
              when stress has been elevated for weeks or months, when cortisol rhythms feel dysregulated,
              and when you can commit to a 6–8 week course of consistent daily use. It is <strong>not</strong>
              the right choice for fast relief: if you need help tonight, L-theanine (100–200 mg) is faster
              for racing thoughts; melatonin (0.3–1 mg) is faster for sleep onset; a behavioral breathwork
              protocol is faster than any supplement for an acute cortisol spike.
            </p>
            <p className="mt-3 text-[1.01rem] leading-[1.85] text-muted">
              Match the tool to the timeframe: ashwagandha for the baseline; faster tools for acute moments.
              See the{' '}
              <Link href="/guides/herbs/l-theanine" className="font-semibold text-brand-700 hover:text-brand-800 hover:underline">
                full L-theanine article
              </Link>{' '}
              for the acute-relief counterpart.
            </p>
          </section>

          {/* Quick Verdict */}
          <section className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8">
            <p className="eyebrow-label">Quick Verdict</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
              Does Ashwagandha Work?
            </h2>
            <p className="mt-3 text-[1.01rem] leading-[1.85] text-muted">
              <strong>Yes, for the use cases the evidence actually supports.</strong> Multiple
              randomized trials in chronically stressed adults show standardized ashwagandha extracts
              (300–600 mg/day of KSM-66 or Sensoril) meaningfully reduce perceived stress, lower
              serum cortisol, and improve sleep quality over 4–8 weeks. The effect sizes are
              moderate, not dramatic. For anxiety symptoms, the evidence is positive but smaller;
              for athletic performance and testosterone, modest. For acute anxiety or immediate
              calm, it does not work — that is not what adaptogens do.
            </p>
            <p className="mt-3 text-[1.01rem] leading-[1.85] text-muted">
              The honest summary: ashwagandha is a foundational, multi-week tool for chronic stress,
              not a rescue remedy. Use it when the goal is to lower the baseline, not silence a
              moment.
            </p>
          </section>

          {/* Main article body */}
          <section className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8 space-y-8">

            {/* Introduction */}
            <div id="introduction">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">Introduction</h2>
              <p className="text-[1.01rem] leading-[1.85] text-muted">
                Ashwagandha (<em>Withania somnifera</em>) is the most clinically studied adaptogen in
                modern supplement research. It is best known for stress and anxiety reduction, with
                growing evidence for sleep, cognition, and metabolic health. This article is the
                umbrella guide — covering everything you need to know in one place, with deep-dive
                links to each condition-specific article.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-muted">
                Whether you are considering ashwagandha for stress, anxiety, sleep, focus, or general
                resilience, this hub will help you decide if it is right for you, what dose and form
                to use, and what to expect over time. All claims are tied to primary studies or the{' '}
                <Link href="/herbs/ashwagandha" className="font-semibold text-brand-700 hover:text-brand-800 hover:underline">
                  Ashwagandha herb profile
                </Link>
                .
              </p>
            </div>

            <hr className="border-brand-900/10" />

            {/* What is ashwagandha */}
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
                The species name <em>somnifera</em> means &ldquo;sleep-inducing&rdquo; in Latin — the
                plant was historically used as a sedative tonic. Modern research confirms a genuine
                sleep benefit, though the mechanism is more nuanced than simple sedation.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-muted">
                Key active constituents include withanolides (steroidal lactones), withaferin A, and
                alkaloids. Commercial extracts are typically standardized to withanolide content (≥5%)
                and come in two clinically dominant patented forms: <strong>KSM-66</strong> (full-spectrum
                root extract, Ixoreal Biomed) and <strong>Sensoril</strong> (root and leaf extract,
                Natreon). Generic root powder has a long traditional history but is less standardized
                and has fewer modern trials.
              </p>
            </div>

            <hr className="border-brand-900/10" />

            {/* What ashwagandha is used for */}
            <div id="uses">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">
                What Ashwagandha Is Used For
              </h2>
              <p className="text-[1.01rem] leading-[1.85] text-muted">
                Ashwagandha has been studied across a wide range of outcomes. The strength of evidence
                varies considerably. Use this section to see whether ashwagandha is right for your
                specific goal.
              </p>

              {/* Decision table by use case */}
              <div className="mt-4 overflow-x-auto rounded-[1rem] border border-brand-900/10 bg-white shadow-sm">
                <table className="min-w-[640px] w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-brand-900/10 bg-brand-50/50">
                      <th className="text-left p-4 font-semibold text-ink">Use case</th>
                      <th className="text-left p-4 font-semibold text-ink">Evidence strength</th>
                      <th className="text-left p-4 font-semibold text-ink">Time to effect</th>
                      <th className="text-left p-4 font-semibold text-ink">Deep-dive</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-900/10">
                    <tr>
                      <td className="p-4 font-medium text-ink">Chronic stress &amp; cortisol</td>
                      <td className="p-4 text-brand-700 font-medium">Strong</td>
                      <td className="p-4 text-muted">4–8 weeks</td>
                      <td className="p-4">
                        <Link href="/guides/how-to-lower-cortisol-naturally" className="text-brand-700 hover:underline font-medium">
                          Cortisol guide →
                        </Link>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 font-medium text-ink">Anxiety symptoms</td>
                      <td className="p-4 text-brand-700 font-medium">Moderate</td>
                      <td className="p-4 text-muted">6–8 weeks</td>
                      <td className="p-4">
                        <Link href="/guides/herbs/ashwagandha" className="text-brand-700 hover:underline font-medium">
                          Ashwagandha for anxiety →
                        </Link>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 font-medium text-ink">Sleep quality</td>
                      <td className="p-4 text-brand-700 font-medium">Moderate</td>
                      <td className="p-4 text-muted">6–10 weeks</td>
                      <td className="p-4">
                        <Link href="/guides/sleep/ashwagandha-for-sleep" className="text-brand-700 hover:underline font-medium">
                          Ashwagandha for sleep →
                        </Link>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 font-medium text-ink">Focus &amp; cognition</td>
                      <td className="p-4 text-muted">Emerging–Moderate</td>
                      <td className="p-4 text-muted">4–8 weeks</td>
                      <td className="p-4">
                        <Link href="/guides/adhd/ashwagandha-for-adhd" className="text-brand-700 hover:underline font-medium">
                          Ashwagandha for ADHD/focus →
                        </Link>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 font-medium text-ink">Athletic performance &amp; testosterone</td>
                      <td className="p-4 text-muted">Emerging</td>
                      <td className="p-4 text-muted">8–12 weeks</td>
                      <td className="p-4">
                        <span className="text-muted text-xs">No dedicated deep-dive yet</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="mt-4 text-[1.01rem] leading-[1.85] text-muted">
                For most readers, the right entry point is the chronic stress / cortisol evidence —
                that is the strongest and most consistent body of research, and it underlies the
                benefits seen in anxiety and sleep. If your primary goal is sleep, see the{' '}
                <Link href="/guides/sleep/ashwagandha-for-sleep" className="font-semibold text-brand-700 hover:underline">
                  dedicated sleep article
                </Link>
                . If anxiety is primary, see the{' '}
                <Link href="/guides/herbs/ashwagandha" className="font-semibold text-brand-700 hover:underline">
                  anxiety article
                </Link>
                . If you want a head-to-head with magnesium, see{' '}
                <Link href="/guides/sleep/ashwagandha-vs-magnesium-for-sleep" className="font-semibold text-brand-700 hover:underline">
                  ashwagandha vs magnesium for sleep
                </Link>
                . If you want the herb-level monograph, see{' '}
                <Link href="/herbs/ashwagandha" className="font-semibold text-brand-700 hover:underline">
                  the full Ashwagandha herb profile
                </Link>
                .
              </p>
            </div>

            <hr className="border-brand-900/10" />

            {/* How ashwagandha works */}
            <div id="mechanisms">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">
                How Ashwagandha Works
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
                multiple RCTs. Elevated cortisol is a primary driver of stress-related anxiety, sleep
                disruption, and immune dysregulation. By blunting the HPA axis stress response,
                ashwagandha lowers the physiological baseline of stress reactivity.
              </p>

              <h3 className="mt-5 mb-1 text-xl font-semibold tracking-tight text-ink">
                2. GABA-A Receptor Activity
              </h3>
              <p className="text-[1.01rem] leading-[1.85] text-muted">
                Withaferin A and related withanolides have demonstrated GABA-A receptor binding
                activity in vitro and in animal models. GABA-A agonism is the mechanism of
                benzodiazepines and many common anxiolytics. The magnitude of this effect in humans
                at standard doses is uncertain and likely modest.
              </p>

              <h3 className="mt-5 mb-1 text-xl font-semibold tracking-tight text-ink">
                3. Thyroid Modulation
              </h3>
              <p className="text-[1.01rem] leading-[1.85] text-muted">
                Ashwagandha may modestly increase T3 and T4 thyroid hormone levels. This is part of
                why some users report improved energy, and part of why it is contraindicated in
                hyperthyroidism. People on thyroid medication should monitor levels carefully with
                their clinician.
              </p>

              <h3 className="mt-5 mb-1 text-xl font-semibold tracking-tight text-ink">
                4. Anti-Inflammatory and Antioxidant Effects
              </h3>
              <p className="text-[1.01rem] leading-[1.85] text-muted">
                Withanolides modulate NF-κB and other inflammatory signaling pathways. Chronic stress
                is associated with low-grade inflammation; ashwagandha&rsquo;s anti-inflammatory
                activity may be part of the mechanism behind subjective well-being improvements.
              </p>
            </div>

            <hr className="border-brand-900/10" />

            {/* Evidence Summary */}
            <div id="evidence-summary">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
                Evidence Summary
              </h2>

              <EvidenceSummaryCard
                title="Ashwagandha &amp; Stress / Cortisol"
                evidenceLevel="Strong"
                humanEvidence="Multiple randomized controlled trials (n=50–150) in chronically stressed adults show significant reductions in perceived stress (PSS), serum cortisol, and anxiety scores (HAM-A, GAD-7) over 4–8 weeks. Effect sizes are moderate (Cohen's d ≈ 0.5–1.0). KSM-66 and Sensoril extracts are most studied."
                mechanisticEvidence="HPA axis modulation and cortisol reduction are well-documented in human trials. GABA-A binding activity demonstrated in vitro. Thyroid and anti-inflammatory pathways have supporting preclinical evidence."
                safetyProfile="Generally well-tolerated at 300–600 mg/day for 8–12 weeks. Rare hepatotoxicity cases reported. Contraindicated in pregnancy. Potential thyroid interactions at therapeutic doses. Caution with autoimmune disease and immunosuppressants."
              />

              <div className="mt-4 rounded-[1rem] border border-brand-900/10 bg-brand-50/60 p-4 text-sm leading-7 text-muted">
                <p className="font-semibold text-ink">Key trials reviewed:</p>
                <ul className="mt-2 ml-5 space-y-1 list-disc">
                  <li>Chandrasekhar et al. (2012) — KSM-66, 600 mg/day, 8 weeks, n=64 (stress and anxiety)</li>
                  <li>Langade et al. (2019) — KSM-66, 300 mg twice daily, 10 weeks, n=58 (insomnia with anxiety)</li>
                  <li>Langade et al. (2021) — KSM-66, 600 mg/day, 8 weeks, n=150 (primary insomnia)</li>
                  <li>Cheah et al. (2021) — Sensoril 240 mg/day, 8 weeks, n=80 (sleep quality)</li>
                  <li>Salve et al. (2019) — Adaptogenic/resting safety evaluation, n=80</li>
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
                  Dosage Reference — Standardized Extract Protocols
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
                  Doses shown are based on clinical trial protocols. Start at the lower end and assess
                  tolerance before increasing. Take with food to reduce GI sensitivity. Most trials use
                  consistent daily dosing for 6–8 weeks minimum.
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
                    Best for: Stress &amp; Anxiety
                  </p>
                  <p className="font-semibold text-ink">KSM-66 Ashwagandha Extract</p>
                  <p className="mt-1 text-xs leading-5 text-muted">
                    Patented full-spectrum root extract. Most-studied form for stress and anxiety.
                    Look for ≥300 mg per capsule, standardized to ≥5% withanolides.
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
                    Best for: Sleep &amp; Lower Dose
                  </p>
                  <p className="font-semibold text-ink">Sensoril Ashwagandha Extract</p>
                  <p className="mt-1 text-xs leading-5 text-muted">
                    Root and leaf extract with strong clinical backing at lower mg doses. Well-suited
                    for sensitive individuals or sleep-specific protocols.
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
              <SafetyNotice title="Safety Summary — Ashwagandha">
                <ul className="ml-5 space-y-1.5 list-disc">
                  <li>
                    <strong>Generally well-tolerated</strong> at 300–600 mg/day for up to 12 weeks
                    in healthy adults across clinical trials.
                  </li>
                  <li>
                    <strong>Pregnancy / lactation:</strong> Avoid. Animal studies show uterotonic
                    effects; human safety data is insufficient.
                  </li>
                  <li>
                    <strong>Autoimmune disease:</strong> Ashwagandha may stimulate immune function;
                    use with caution or avoid in lupus, rheumatoid arthritis, MS, or on immunosuppressants.
                  </li>
                  <li>
                    <strong>Thyroid disorders:</strong> Ashwagandha may increase T3/T4 levels. Use
                    with caution if you have hyperthyroidism or take thyroid medication (monitor TSH).
                  </li>
                  <li>
                    <strong>Hepatotoxicity (rare):</strong> Multiple case reports of liver injury
                    have been published, most resolving on discontinuation. Avoid if you have liver
                    disease or take hepatotoxic medications. Discontinue and seek medical attention
                    if symptoms appear (jaundice, dark urine, severe fatigue, abdominal pain).
                  </li>
                  <li>
                    <strong>Sedative medications:</strong> May potentiate effects of benzodiazepines,
                    sleep aids, alcohol, and other CNS depressants.
                  </li>
                  <li>
                    <strong>Psychiatric medications (SSRIs, SNRIs, MAOIs):</strong> Limited interaction
                    data; possible additive sedative or serotonergic effects. Consult a clinician before
                    combining.
                  </li>
                  <li>
                    <strong>GI discomfort:</strong> Loose stools, nausea reported in a minority of
                    users, particularly at higher doses. Taking with food reduces incidence.
                  </li>
                </ul>
              </SafetyNotice>
              <p className="mt-3 text-sm text-muted">
                For a complete breakdown of adverse events, drug interactions, and contraindications,
                see the{' '}
                <Link href="/herbs/ashwagandha" className="font-semibold text-brand-700 hover:text-brand-800 hover:underline">
                  full Ashwagandha safety profile
                </Link>
                .
              </p>
            </div>

            <hr className="border-brand-900/10" />

            {/* Stacking */}
            <div id="stacking">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
                Stacking Ashwagandha With Other Supplements
              </h2>
              <p className="text-[1.01rem] leading-[1.85] text-muted">
                Ashwagandha pairs well with several other supplements because it works on the
                baseline (HPA axis, cortisol over weeks) while they cover the acute side (racing
                thoughts, sleep onset, muscle tension). Common stacks:
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm">
                  <p className="font-semibold text-ink">Ashwagandha + L-theanine</p>
                  <p className="mt-1 text-xs leading-5 text-muted">
                    Foundational stress reduction (ashwagandha, weeks) plus acute calm focus
                    (L-theanine, 30–60 min). See{' '}
                    <Link href="/guides/herbs/l-theanine" className="font-semibold text-brand-700 hover:underline">
                      the L-theanine article
                    </Link>
                    .
                  </p>
                </div>
                <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm">
                  <p className="font-semibold text-ink">Ashwagandha + Magnesium glycinate</p>
                  <p className="mt-1 text-xs leading-5 text-muted">
                    Stress baseline (ashwagandha) plus evening relaxation and muscle tension
                    support (magnesium). Compare in{' '}
                    <Link href="/guides/sleep/ashwagandha-vs-magnesium-for-sleep" className="font-semibold text-brand-700 hover:underline">
                      ashwagandha vs magnesium for sleep
                    </Link>
                    .
                  </p>
                </div>
                <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm">
                  <p className="font-semibold text-ink">Ashwagandha + Rhodiola</p>
                  <p className="mt-1 text-xs leading-5 text-muted">
                    HPA axis regulation (ashwagandha) plus acute stress resilience and
                    anti-fatigue (rhodiola). Best for high-demand performance periods.
                  </p>
                </div>
                <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm">
                  <p className="font-semibold text-ink">Ashwagandha + Melatonin</p>
                  <p className="mt-1 text-xs leading-5 text-muted">
                    For sleep: ashwagandha addresses stress-driven insomnia over weeks; melatonin
                    signals circadian onset acutely. Different mechanisms — complementary.
                  </p>
                </div>
              </div>
              <p className="mt-4 text-[1.01rem] leading-[1.85] text-muted">
                Introduce one supplement at a time so you can isolate what is helping (or causing
                side effects). Allow 1–2 weeks between additions.
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
                  href="/guides/herbs/ashwagandha"
                  className="group rounded-[0.75rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/30"
                >
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Deep Dive
                  </p>
                  <p className="font-semibold text-ink transition group-hover:text-brand-700">
                    Ashwagandha for Anxiety
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Mechanisms, RCT evidence, dosage, and how ashwagandha compares with L-theanine,
                    magnesium, and CBD for anxiety symptoms.
                  </p>
                </Link>
                <Link
                  href="/guides/sleep/ashwagandha-for-sleep"
                  className="group rounded-[0.75rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/30"
                >
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Deep Dive
                  </p>
                  <p className="font-semibold text-ink transition group-hover:text-brand-700">
                    Ashwagandha for Sleep
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Sleep-specific evidence, KSM-66 vs Sensoril for insomnia, dosage table, and
                    comparison with melatonin and magnesium.
                  </p>
                </Link>
                <Link
                  href="/guides/adhd/ashwagandha-for-adhd"
                  className="group rounded-[0.75rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/30"
                >
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Deep Dive
                  </p>
                  <p className="font-semibold text-ink transition group-hover:text-brand-700">
                    Ashwagandha for ADHD / Focus
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Cognitive effects, focus-related evidence, and how ashwagandha compares with
                    L-theanine and citicoline.
                  </p>
                </Link>
                <Link
                  href="/guides/sleep/ashwagandha-vs-magnesium-for-sleep"
                  className="group rounded-[0.75rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/30"
                >
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Comparison
                  </p>
                  <p className="font-semibold text-ink transition group-hover:text-brand-700">
                    Ashwagandha vs Magnesium for Sleep
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Side-by-side comparison of mechanisms, evidence, timing, safety, and cost.
                  </p>
                </Link>
                <Link
                  href="/guides/anxiety/cbd-vs-ashwagandha-for-anxiety"
                  className="group rounded-[0.75rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/30"
                >
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Comparison
                  </p>
                  <p className="font-semibold text-ink transition group-hover:text-brand-700">
                    CBD vs Ashwagandha for Anxiety
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Regulatory status, evidence, and practical considerations for choosing between
                    (or stacking) the two.
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
                    Ashwagandha Herb Profile
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Complete monograph: chemistry, evidence, dosage, and safety across all uses.
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
                        A Prospective, Randomized Double-Blind, Placebo-Controlled Study of Safety
                        and Efficacy of a High-Concentration Full-Spectrum Extract of Ashwagandha Root
                        in Reducing Stress and Anxiety
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
                      <td className="py-3 pr-3 text-muted">2</td>
                      <td className="py-3 pr-4 leading-6 text-ink">
                        Efficacy and Safety of Ashwagandha (Withania somnifera) Root Extract in
                        Insomnia and Anxiety
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
                      <td className="py-3 pr-3 text-muted">3</td>
                      <td className="py-3 pr-4 leading-6 text-ink">
                        A Randomized, Double Blind, Placebo Controlled, Cross-over Study to Evaluate
                        the Efficacy and Safety of Ashwagandha Extract on Sleep Quality in Healthy Adults
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
                        Efficacy and Tolerability of Ashwagandha Root Extract in Subthreshold Sleep
                        Difficulties
                      </td>
                      <td className="py-3 pr-4 text-muted">Langade D, Thakare V, Dambhare S</td>
                      <td className="py-3 pr-4 text-muted">2021</td>
                      <td className="py-3">
                        <a
                          href="https://pubmed.ncbi.nlm.nih.gov/33582027/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-brand-700 hover:text-brand-800 hover:underline"
                        >
                          PMID 33582027
                        </a>
                      </td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-3 text-muted">5</td>
                      <td className="py-3 pr-4 leading-6 text-ink">
                        Adaptogenic and Anxiolytic Effects of Ashwagandha Root Extract
                      </td>
                      <td className="py-3 pr-4 text-muted">Salve J, Pate S, Debnath K, Langade D</td>
                      <td className="py-3 pr-4 text-muted">2019</td>
                      <td className="py-3">
                        <a
                          href="https://pubmed.ncbi.nlm.nih.gov/32021735/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-brand-700 hover:text-brand-800 hover:underline"
                        >
                          PMID 32021735
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
          <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
              In this article
            </p>
            <nav className="mt-3 space-y-1.5" aria-label="Article sections">
              {[
                ['#introduction', 'Introduction'],
                ['#what-is-ashwagandha', 'What Is Ashwagandha?'],
                ['#uses', 'What It Is Used For'],
                ['#mechanisms', 'How It Works'],
                ['#evidence-summary', 'Evidence Summary'],
                ['#dosage', 'Dosage &amp; Usage'],
                ['#product-recommendations', 'Product Picks'],
                ['#safety', 'Safety &amp; Side Effects'],
                ['#stacking', 'Stacking'],
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

          <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
              Explore more
            </p>
            <div className="mt-3 space-y-2">
              <Link
                href="/guides/herbs/ashwagandha"
                className="block text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline"
              >
                Ashwagandha for anxiety →
              </Link>
              <Link
                href="/guides/sleep/ashwagandha-for-sleep"
                className="block text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline"
              >
                Ashwagandha for sleep →
              </Link>
              <Link
                href="/guides/herbs/l-theanine"
                className="block text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline"
              >
                L-theanine article →
              </Link>
              <Link
                href="/herbs/ashwagandha"
                className="block text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline"
              >
                Ashwagandha herb profile →
              </Link>
              <Link
                href="/guides/anxiety"
                className="block text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline"
              >
                Stress goal hub →
              </Link>
              <Link
                href="/articles/"
                className="block text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline"
              >
                All articles →
              </Link>
            </div>
          </div>
        </aside>
      </div>

      <div className="mt-8">
        <Link href="/articles/" className="text-sm font-semibold text-brand-700 hover:text-brand-800">
          ← Back to Articles
        </Link>
      </div>
    </article>
  )
}