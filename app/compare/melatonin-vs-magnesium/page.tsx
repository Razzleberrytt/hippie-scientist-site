import type { Metadata } from 'next'
import { buildPageMetadata } from '../../../src/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'Melatonin vs Magnesium for Sleep: Evidence Comparison',
  description:
    'Evidence-graded comparison of melatonin vs magnesium for sleep. Outcome-by-outcome matrix, mechanisms, dosing protocols, safety cautions, and when to use each (or both) for sleep onset, quality, and tension.',
  path: '/compare/melatonin-vs-magnesium/',
  openGraphType: 'article',
})

import Image from 'next/image'
import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import AffiliateDisclosure from '../../../components/AffiliateDisclosure'
import { EnhancedEmailCapture } from '@/components/monetization/EnhancedEmailCapture'
import { RelatedDiscoveryWidget } from '@/components/monetization/RelatedDiscoveryWidget'
import RecommendationSection from '@/components/RecommendationSection'
import { getRevenueProductSet } from '@/config/revenue-products'
import EvidenceMatrix, { type EvidenceMatrixRow } from '@/components/compare/EvidenceMatrix'

const PAGE_URL = 'https://thehippiescientist.net/compare/melatonin-vs-magnesium'
const PAGE_TITLE = 'Melatonin vs Magnesium: Complementary Tools for Sleep Support'
const PAGE_DESCRIPTION =
  'Evidence-graded comparison of melatonin vs magnesium for sleep onset, quality, maintenance, next-day function, and tension — with mechanisms, dosing protocols, safety cautions, and a conservative combination plan.'

/**
 * Evidence matrix rows — reproduced verbatim from the editorial draft
 * (Evidence Comparison by Outcome). Grades and language are intentionally
 * conservative and must not be softened or strengthened without an evidence review.
 */
const evidenceRows: EvidenceMatrixRow[] = [
  {
    outcome: 'Sleep Onset Latency',
    outcomeNote: 'time to fall asleep',
    a: {
      grade: 'Strong',
      findings:
        'Strong for circadian-related issues. Multiple meta-analyses show reductions of ~7–14 minutes vs placebo in jet lag, shift work, and delayed sleep phase. Modest or inconsistent benefit in primary/chronic insomnia without timing disruption.',
    },
    b: {
      grade: 'Limited to Moderate',
      findings:
        'Some RCTs and a 2021 meta-analysis in older adults suggest small reductions (~10–17 min in certain studies), but results are mixed and often tied to baseline magnesium status or tension. Newer 2024 pilot data in poor sleepers showed improvements in sleep efficiency and duration.',
    },
    combo:
      'Limited direct comparisons. One small trial and mechanistic rationale support additive effects when timing + tension factors coexist. Some Mg + melatonin + B-vitamin studies show benefits for insomnia scores.',
    certainty:
      'Higher certainty for melatonin in circadian contexts. Start with melatonin (low dose) if schedule drift is primary. Magnesium may help secondarily if muscle tension or low intake is also present. Track with sleep diary.',
  },
  {
    outcome: 'Sleep Quality / Efficiency / Architecture',
    outcomeNote: 'deep sleep, continuity, subjective refreshment',
    a: {
      grade: 'Moderate',
      findings:
        'Some improvement in subjective quality and efficiency in circadian or short-term use studies, but high heterogeneity. Less consistent for deep sleep architecture in healthy or primary insomnia populations.',
    },
    b: {
      grade: 'Limited to Moderate',
      findings:
        'Positive signals in recent pilot RCTs (e.g., 2024 crossover in adults with poor sleep quality) for efficiency, duration, and restorative feel. Older adult meta-analyses show small benefits, strongest when deficient or tense. Form matters—glycinate better tolerated than oxide.',
    },
    combo:
      'Emerging supportive data for combination in insomnia populations (e.g., 3-month Mg + melatonin + B-complex trial showed significant sleep score improvements). Mechanistic overlap (Mg may support endogenous melatonin pathways).',
    certainty:
      'Context-dependent for both. Magnesium often preferred when quality/tension is the main complaint. Measure via subjective scales or wearable data if available. Reassess after 2–4 weeks.',
  },
  {
    outcome: 'Sleep Maintenance & Total Sleep Time',
    a: {
      grade: 'Limited to Moderate',
      findings:
        'Modest increases in some meta-analyses (~15–20+ min total sleep time in responsive groups), but weaker as monotherapy for maintenance insomnia or early awakenings. Extended-release forms studied more for this.',
    },
    b: {
      grade: 'Limited',
      findings:
        'Some positive signals in quality-focused trials, but inconsistent for objective maintenance. Benefits may be indirect via reduced tension or better relaxation.',
    },
    combo:
      'Preliminary combo data encouraging but not definitive. Avoid high-dose stacking that risks next-day sedation.',
    certainty:
      'Neither is robust here as standalone. Address sleep environment, caffeine timing, and possible apnea first. Extended-release melatonin or magnesium glycinate may be trialed conservatively.',
  },
  {
    outcome: 'Next-Day Function, Grogginess, or Alertness',
    a: {
      grade: 'Mixed / Context-dependent',
      findings:
        'Low doses (0.5–3 mg) generally well tolerated; higher doses or sensitive individuals report vivid dreams or residual drowsiness. Timing matters—too late increases risk.',
    },
    b: {
      grade: 'Generally favorable',
      findings:
        'Most studies report neutral or positive next-day mood/energy effects when taken in evening. GI side effects (if any) usually resolve with form/dose adjustment.',
    },
    combo:
      'Combo usually well tolerated at conservative doses, but monitor for additive relaxation/sedation. Individual response varies widely.',
    certainty:
      'Test low and early. Many users do best with melatonin 30–60 min before desired bedtime and magnesium earlier in the evening wind-down.',
  },
  {
    outcome: 'Anxiety / Tension / Stress-Related Sleep Disruption',
    a: {
      grade: 'Limited',
      findings:
        'Limited for core anxiety; some secondary benefit via better sleep onset in stressed populations.',
    },
    b: {
      grade: 'Moderate',
      findings:
        'Moderate in populations with tension or stress overlay. Supports GABAergic and neuromuscular relaxation pathways. Often preferred when physical restlessness or muscle tightness is noted.',
    },
    combo:
      'Strong rationale for thoughtful combination when both timing and tension factors are present.',
    certainty:
      'Magnesium frequently fits better here. Consider it first if anxiety has a prominent somatic component. Melatonin can be added for onset if needed.',
  },
]

/**
 * FAQ content — reproduced verbatim from the draft. Used to render both the
 * on-page accordion and the FAQPage JSON-LD (via AuthorityJsonLd) so the structured
 * data and the visible answers always stay in sync.
 */
const faqItems: { question: string; answer: string }[] = [
  {
    question: 'Is one better than the other overall?',
    answer:
      'No single “winner” exists. Melatonin has stronger and more consistent evidence for reducing sleep onset latency when the primary issue involves circadian timing, jet lag, shift work, or schedule misalignment. Magnesium shows more variable but often helpful effects on sleep quality, efficiency, and relaxation—particularly when muscle tension, physical restlessness, or suboptimal dietary intake is present. Many people’s sleep difficulties involve overlapping factors, which is why thoughtful combination use is common and appears safe for most healthy adults at standard doses. Match the tool(s) to your dominant symptoms and context rather than defaulting to one compound.',
  },
  {
    question: 'Can I take melatonin and magnesium together?',
    answer:
      'Yes, many people do so successfully. The mechanisms are largely complementary (melatonin as a timing signal; magnesium supporting relaxation and potentially endogenous melatonin pathways). Some small studies on magnesium + melatonin combinations (sometimes with B vitamins) have reported improvements in insomnia scores over 1–3 months. Start with one at a time for 7–14 days to clearly interpret effects, then add the second at conservative doses if needed. Monitor for additive relaxation or next-day grogginess and adjust timing or dose accordingly. See the dedicated Sleep Stack: Combining Magnesium and Melatonin Safely guide for more detail.',
  },
  {
    question: 'What dose should I start with?',
    answer:
      'See the detailed dosing protocols section above. General conservative starting points: Melatonin 0.5–1 mg (rarely need more than 3 mg for most adults); Magnesium (elemental) 200 mg glycinate form in the evening. Individual response varies widely—factors like age, body weight, baseline status, and sensitivity matter. Always begin at the low end and increase only if needed after tracking response.',
  },
  {
    question: 'How long does it take to notice effects?',
    answer:
      'Melatonin: Often noticeable within the first few nights for onset latency when timing is the issue (peak effect usually within 30–60 minutes of dosing). Magnesium: May take several days to 2–4 weeks of consistent evening use for quality/relaxation benefits, especially if addressing relative deficiency or tension. Some people report faster subjective calm. Track with a simple sleep diary (bedtime, time to fall asleep, number of awakenings, morning refreshment rating) rather than expecting dramatic overnight changes.',
  },
  {
    question: 'Are there side effects or risks?',
    answer:
      'Both are generally well tolerated at standard supplemental doses for healthy adults in the short-to-medium term. Common reports: Melatonin—vivid dreams, next-day drowsiness (usually dose- or timing-related), occasional headache. Magnesium (glycinate)—minimal GI upset at typical doses; higher doses or less bioavailable forms (e.g., oxide) can cause loose stools. Serious risks are rare but include additive sedation when combined with other CNS depressants, magnesium accumulation in significant kidney impairment, and theoretical concerns with long-term high-dose melatonin in certain autoimmune conditions. Review full cautions in the Melatonin and Magnesium compound profiles and consult a clinician if you have medical conditions, take medications, or are pregnant/breastfeeding.',
  },
  {
    question: 'What about long-term or daily use?',
    answer:
      'Data beyond 3–6 months are limited for both compounds in the context of sleep support. Many people use magnesium ongoing as part of an evening routine if dietary intake remains consistently low or tension persists. Melatonin is more often used situationally (travel, schedule shifts) or cycled. Tolerance or rebound is uncommon at low doses, but periodic reassessment (every 4–8 weeks) with a sleep diary or professional input is wise. Neither should become a permanent crutch without addressing underlying sleep fundamentals.',
  },
  {
    question: 'Which form is best?',
    answer:
      'Melatonin: Fast-dissolve or sublingual tablets for quicker onset when latency is the goal; extended-release versions studied more for maintenance. Choose third-party tested products with clear dosing. Magnesium: Glycinate or bisglycinate forms are preferred for sleep due to better tolerability and absorption with fewer GI side effects compared to oxide or citrate (the latter can have laxative effects). Look for clear “elemental magnesium” labeling. See current product picks and sourcing criteria in the respective compound profiles.',
  },
  {
    question: 'Does magnesium help produce melatonin or vice versa?',
    answer:
      'Mechanistic research suggests magnesium may support pathways involved in melatonin synthesis or sensitivity, and correcting low magnesium status can indirectly benefit sleep regulation. However, taking magnesium does not dramatically raise melatonin levels in most people, and supplemental melatonin does not replace magnesium’s broader roles in muscle relaxation and stress response. They work through overlapping but distinct mechanisms.',
  },
  {
    question: 'What if it doesn’t work or I feel worse?',
    answer:
      'Stop use and reassess fundamentals first: consistent sleep/wake times, morning light exposure, caffeine/alcohol timing, screen curfew, bedroom environment, and possible undiagnosed issues (sleep apnea, thyroid, mood, etc.). Supplements are tools, not solutions. If sleep problems persist, worsen, or significantly affect daytime function, consult a healthcare professional—do not self-escalate doses or add multiple compounds.',
  },
  {
    question: 'Are these safe for older adults, shift workers, or people with anxiety?',
    answer:
      'Older adults: Both can be relevant (absorption and production may decline with age), but start at lower doses, screen for kidney function/polypharmacy, and monitor closely. Shift workers / jet lag: Melatonin has clearer evidence support for circadian realignment when timed correctly alongside light/dark hygiene. Anxiety/tension overlay: Magnesium often fits better initially due to neuromuscular relaxation effects; melatonin can be added for onset if needed. Individual factors and medical history always take precedence—professional guidance is recommended for complex situations.',
  },
  {
    question: 'Can children or teens use these?',
    answer:
      'Melatonin is sometimes used under specialist care for specific circadian or neurodevelopmental sleep issues in children, but it is not appropriate for general self-use. Magnesium evidence for pediatric sleep is more limited. Always involve a pediatrician or sleep specialist; do not use adult dosing or products.',
  },
  {
    question: 'How do these compare to other options like L-theanine, glycine, or valerian?',
    answer:
      'See the broader Best Evidence-Based Supplements for Sleep guide and specific comparison pages (e.g., Magnesium vs L-Theanine). These compounds have different primary mechanisms and evidence profiles. The right choice depends on your specific sleep challenge rather than stacking everything at once.',
  },
]

export default function MelatoninVsMagnesiumPage() {
  const melatoninProducts = getRevenueProductSet('melatonin')?.products ?? []
  const magnesiumProducts = getRevenueProductSet('magnesium')?.products ?? []
  const allProducts = [...melatoninProducts, ...magnesiumProducts]

  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd
        title={PAGE_TITLE}
        description={PAGE_DESCRIPTION}
        url={PAGE_URL}
        type="MedicalWebPage"
        breadcrumbs={[
          { name: 'Home', url: 'https://thehippiescientist.net/' },
          { name: 'Compare', url: 'https://thehippiescientist.net/compare/' },
          { name: 'Melatonin vs Magnesium', url: `${PAGE_URL}/` },
        ]}
        faqItems={faqItems}
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Compare', href: '/compare' },
          { label: 'Melatonin vs Magnesium' },
        ]}
      />

      {/* ───────────────────────── Hero / Lead ───────────────────────── */}
      <section className="space-y-5 max-w-4xl">
        <p className="eyebrow-label">Educational Comparison · Sleep Cluster</p>
        <h1 className="text-5xl font-bold tracking-tight text-ink">
          Melatonin vs Magnesium: Complementary Tools for Sleep Support
        </h1>
        <p className="text-lg leading-8 text-[#46574d]">
          <strong className="text-ink">These are different tools with overlapping but distinct roles.</strong>{' '}
          Melatonin primarily acts as a circadian timing and sleep-onset signal. Magnesium more often
          supports relaxation, muscle ease, and sleep <em>quality</em>—especially when dietary intake is
          suboptimal or tension is present. Many people benefit from using them together thoughtfully, but
          neither replaces sleep hygiene, consistent schedules, or addressing underlying issues such as
          sleep apnea or high stress load.
        </p>

        <div className="flex flex-wrap gap-3 pt-1">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 border border-green-200 px-3 py-1 text-xs font-semibold text-green-800 dark:bg-green-500/15 dark:text-green-200 dark:border-green-500/30">
            Melatonin — strongest for circadian / onset timing
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 border border-green-200 px-3 py-1 text-xs font-semibold text-green-800 dark:bg-green-500/15 dark:text-green-200 dark:border-green-500/30">
            Magnesium — relaxation, quality &amp; tension support
          </span>
        </div>
      </section>

      {/* Quick decision guide */}
      <section className="card-premium p-6 space-y-4 max-w-4xl">
        <p className="eyebrow-label">Quick Decision Guide</p>
        <ul className="space-y-3 text-sm leading-7 text-[#46574d]">
          <li>
            <strong className="text-ink">Circadian misalignment, jet lag, shift work, or delayed sleep phase</strong>{' '}
            — Melatonin usually has the stronger evidence signal for reducing time to fall asleep.
          </li>
          <li>
            <strong className="text-ink">Muscle tension, racing mind tied to physical restlessness, or possible low magnesium status</strong>{' '}
            — Magnesium (particularly glycinate forms) often fits better as a nightly wind-down support.
          </li>
          <li>
            <strong className="text-ink">Both factors present</strong> — A conservative combination
            (magnesium in the evening + low-dose melatonin 30–60 min before bed) is common in practice and
            has preliminary supportive data, though high-quality head-to-head trials are limited.
          </li>
          <li>
            <strong className="text-ink">Chronic primary insomnia without clear timing or tension component</strong>{' '}
            — Neither is typically first-line; prioritize CBT-I, sleep hygiene, and professional evaluation.
          </li>
        </ul>
        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-sm leading-7 text-amber-900 dark:bg-amber-500/10 dark:text-amber-100 dark:border-amber-500/30">
          <strong>Important:</strong> Effects are modest for most people and highly individual. Baseline
          magnesium status, age, chronotype, and concurrent medications matter more than marketing claims.
          Always start low, track response for 1–2 weeks, and consult a clinician if you have medical
          conditions, take medications, or are pregnant/breastfeeding.
        </div>
      </section>

      {/* Who this guide is for / who should be careful */}
      <section className="grid gap-6 lg:grid-cols-2 max-w-5xl">
        <div className="card-premium p-6 space-y-3">
          <p className="eyebrow-label">Who This Guide Is For</p>
          <ul className="list-disc pl-5 space-y-2 text-sm leading-7 text-[#46574d]">
            <li>People comparing natural sleep aids before buying or stacking.</li>
            <li>People wanting clear context on timing vs relaxation support, dose, and grogginess risk.</li>
            <li>
              People trying to avoid random multi-ingredient sleep blends and instead make targeted,
              evidence-informed choices.
            </li>
          </ul>
        </div>
        <div className="card-premium p-6 space-y-3 border-l-4 border-rose-400">
          <p className="eyebrow-label text-rose-700">Who Should Be Careful</p>
          <ul className="list-disc pl-5 space-y-2 text-sm leading-7 text-[#46574d]">
            <li>People using sedatives, hypnotics, or other CNS depressants.</li>
            <li>Pregnant or breastfeeding individuals.</li>
            <li>Anyone with kidney impairment, autoimmune conditions, or complex medical/medication histories.</li>
            <li>
              Those with persistent sleep issues that may require professional evaluation (e.g., suspected
              sleep apnea, mood disorders, thyroid issues).
            </li>
          </ul>
        </div>
      </section>

      {/* ───────────────── Key Differences & Practical Matching ───────────────── */}
      <section className="space-y-5 max-w-4xl">
        <p className="eyebrow-label">Key Differences</p>
        <h2 className="text-3xl font-semibold tracking-tight text-ink">Key Differences &amp; Practical Matching</h2>
        <p className="text-sm leading-7 text-[#46574d]">
          Melatonin is a hormone that signals darkness and helps align the sleep-wake cycle. Its strongest
          evidence is for situations where the <em>timing</em> of sleep is the main challenge.
        </p>
        <p className="text-sm leading-7 text-[#46574d]">
          Magnesium is an essential mineral involved in hundreds of enzymatic reactions, including those
          supporting muscle relaxation, neurotransmitter balance, and stress response. Evidence for sleep is
          more variable and often clearest when intake is low or physical/mental tension is prominent.
        </p>
        <p className="text-sm leading-7 text-[#46574d]">
          <strong className="text-ink">They are not interchangeable.</strong> Using melatonin when the
          primary issue is muscle tension or low magnesium status is unlikely to fully address the problem.
          Using magnesium alone when circadian misalignment is dominant may produce only partial benefit.
        </p>

        <figure className="overflow-hidden rounded-2xl border border-brand-900/10 shadow-sm bg-white">
          <Image
            src="/images/guides/magnesium-melatonin-decision.jpg"
            alt="Decision flowchart for choosing between melatonin and magnesium based on sleep challenge type"
            width={784}
            height={1168}
            className="w-full h-auto"
          />
          <figcaption className="px-4 py-3 text-center text-sm text-muted">
            Match the tool to your dominant sleep challenge: timing (melatonin) vs tension/quality (magnesium) vs both.
          </figcaption>
        </figure>

        <div className="card-premium p-6 space-y-3">
          <h3 className="text-xl font-semibold text-ink">Common real-world scenarios</h3>
          <ul className="space-y-2 text-sm leading-7 text-[#46574d]">
            <li>
              <strong className="text-ink">Night-shift worker or frequent traveler with jet lag</strong> →
              Prioritize melatonin timing support + strong light hygiene.
            </li>
            <li>
              <strong className="text-ink">Evening tension, racing physical restlessness, or known low dietary magnesium</strong>{' '}
              (common in older adults or high-stress diets) → Magnesium glycinate as evening routine anchor.
            </li>
            <li>
              <strong className="text-ink">Both timing drift and tension</strong> → Many people do well with
              magnesium earlier in the evening + low-dose melatonin closer to bed.
            </li>
            <li>
              <strong className="text-ink">Primary insomnia without clear timing or tension component</strong> →
              Supplements are secondary. Focus on CBT-I, consistent schedule, and medical screening.
            </li>
          </ul>
        </div>

        <div className="rounded-2xl bg-stone-50 border border-stone-200 p-5 text-sm leading-7 text-[#46574d] dark:bg-white/5 dark:border-white/10">
          <p className="font-semibold text-ink">Edge considerations</p>
          <p className="mt-2">
            Older adults may have reduced magnesium absorption and lower melatonin production—both compounds
            can be relevant but start at lower ends of dosing ranges and monitor. Athletes or highly active
            individuals sometimes notice magnesium benefits for recovery-related sleep quality. People with
            autoimmune conditions should review melatonin use with a clinician.
          </p>
        </div>
      </section>

      {/* ───────────────── Evidence Comparison by Outcome ───────────────── */}
      <section className="space-y-5">
        <div className="max-w-4xl space-y-4">
          <p className="eyebrow-label">Evidence</p>
          <h2 className="text-3xl font-semibold tracking-tight text-ink">Evidence Comparison by Outcome</h2>
          <p className="text-sm leading-7 text-[#46574d]">
            Evidence grades reflect strength and consistency of <em>human</em> data (primarily RCTs and
            meta-analyses) as of mid-2026. Grades consider study count, design quality, effect size,
            consistency across populations, and recency. “Limited” or “Mixed” does not mean “no
            effect”—it means current data are insufficient for strong, generalizable conclusions. Many
            studies are small or heterogeneous in dose, form, population, and duration.
          </p>
          <p className="text-sm leading-7 text-[#46574d]">
            <strong className="text-ink">Key limitations across both compounds:</strong> Few direct
            head-to-head trials exist. Benefits are often modest and context-dependent (e.g., clearer when
            baseline status or circadian disruption is present). Long-term data (&gt;3–6 months) are sparse.
            Neither compound is a substitute for treating underlying sleep disorders.
          </p>
        </div>

        {/* Reusable, accessible, responsive evidence matrix (client component) */}
        <EvidenceMatrix
          caption="Evidence comparison of melatonin versus magnesium across five sleep outcomes, with grades, key findings, combination notes, and practical implications."
          entityA="Melatonin"
          entityB="Magnesium"
          rows={evidenceRows}
        />

        <figure className="max-w-4xl overflow-hidden rounded-2xl border border-brand-900/10 shadow-sm bg-white">
          <Image
            src="/images/guides/melatonin-vs-magnesium-evidence-grading.jpg"
            alt="Visual guide to evidence grading levels: Strong, Moderate, Limited to Moderate, Limited, Mixed"
            width={1168}
            height={784}
            className="w-full h-auto"
          />
          <figcaption className="px-4 py-3 text-center text-sm text-muted">
            Evidence grades are conservative and reflect the strength and consistency of available human data, not marketing claims.
          </figcaption>
        </figure>

        {/* "How to read this matrix" callout — verbatim */}
        <div className="max-w-4xl rounded-2xl border-l-4 border-brand-500 bg-brand-50/60 p-5 text-sm leading-7 text-[#46574d] dark:bg-brand-500/10 dark:border-brand-400">
          <p className="font-semibold text-ink">How to read this matrix</p>
          <p className="mt-2">
            “Strong” evidence still means <em>modest average effects</em> for most users and does not
            guarantee results for any individual. Always layer with sleep hygiene fundamentals. If you have
            kidney disease, are pregnant, or take medications (especially sedatives, CNS depressants, or
            certain antibiotics/bisphosphonates), review with a clinician before use. Evidence grades are
            conservative and will be updated as new high-quality trials emerge.
          </p>
        </div>
      </section>

      {/* ───────────────── Mechanisms ───────────────── */}
      <section className="space-y-5 max-w-4xl">
        <p className="eyebrow-label">Mechanism</p>
        <h2 className="text-3xl font-semibold tracking-tight text-ink">How They Work (Mechanisms Overview)</h2>

        <figure className="overflow-hidden rounded-2xl border border-brand-900/10 shadow-sm bg-white">
          <Image
            src="/images/guides/melatonin-vs-magnesium-mechanisms-v2.jpg"
            alt="Side-by-side diagram comparing melatonin and magnesium mechanisms: circadian signaling vs GABA support and neuromuscular relaxation"
            width={1168}
            height={784}
            className="w-full h-auto"
          />
          <figcaption className="px-4 py-3 text-center text-sm text-muted">
            Melatonin acts via MT1/MT2 receptors to reinforce circadian timing. Magnesium supports GABAergic pathways and neuromuscular relaxation — largely distinct, often complementary.
          </figcaption>
        </figure>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="card-premium p-6 space-y-3">
            <h3 className="text-xl font-semibold text-ink">Melatonin</h3>
            <p className="text-sm leading-7 text-[#46574d]">
              Endogenous melatonin rises in the evening as part of the circadian system. Supplemental
              melatonin primarily helps <em>advance or reinforce</em> sleep timing signals via MT1/MT2
              receptors in the suprachiasmatic nucleus and other areas. It has antioxidant and mild
              thermoregulatory effects that can support sleep onset. Preclinical data also suggest
              immune-modulating roles, which is why caution is advised in certain autoimmune contexts.
            </p>
          </div>
          <div className="card-premium p-6 space-y-3">
            <h3 className="text-xl font-semibold text-ink">Magnesium</h3>
            <p className="text-sm leading-7 text-[#46574d]">
              Magnesium acts as a cofactor in neurotransmitter synthesis and regulation (including GABA
              support), helps maintain neuromuscular relaxation, and may reduce oxidative stress and support
              vascular function. Some mechanistic research suggests it can influence melatonin synthesis or
              sensitivity. Deficiency or suboptimal status is linked to poorer sleep quality in observational
              data; supplementation effects are clearest when correcting a relative shortfall or reducing
              tension.
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-stone-50 border border-stone-200 p-5 text-sm leading-7 text-[#46574d] dark:bg-white/5 dark:border-white/10">
          <p className="font-semibold text-ink">Complementarity</p>
          <p className="mt-2">
            The pathways are largely distinct and can be additive for people whose sleep difficulty has both
            a timing component and a relaxation/tension or nutrient-status component. This is why
            conservative stacking is common and appears safe for most healthy adults at standard doses.
          </p>
        </div>
      </section>

      {/* ───────────────── Safety ───────────────── */}
      <section className="card-premium p-6 space-y-5 max-w-4xl border-l-4 border-rose-500">
        <p className="text-xs font-bold uppercase tracking-wider text-rose-900 dark:text-rose-200">
          Safety, Side Effects &amp; Cautions
        </p>
        <h2 className="text-2xl font-bold tracking-tight text-ink">What to know before using each</h2>
        <p className="text-sm leading-7 text-[#46574d]">
          Both compounds have good short-term safety profiles at standard supplemental doses for healthy
          adults, but individual tolerance varies and certain populations require extra caution or clinician
          oversight.
        </p>

        <div className="space-y-4 text-sm leading-7 text-[#46574d]">
          <div>
            <h3 className="text-lg font-semibold text-ink">Common side effects</h3>
            <ul className="mt-2 list-disc pl-5 space-y-1.5">
              <li>
                <strong className="text-ink">Melatonin:</strong> Vivid dreams, next-day drowsiness (dose- or
                timing-dependent), headache (less common at low doses).
              </li>
              <li>
                <strong className="text-ink">Magnesium</strong> (especially glycinate): Generally well
                tolerated; loose stools possible at higher doses. Oxide forms are more likely to cause GI
                upset.
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-ink">Key cautions &amp; interactions (review before use)</h3>
            <ul className="mt-2 list-disc pl-5 space-y-1.5">
              <li>Kidney impairment (magnesium accumulation risk)</li>
              <li>Pregnancy or breastfeeding (both compounds—clinician guidance recommended)</li>
              <li>Concurrent sedative, hypnotic, or CNS-depressant medications (additive effects)</li>
              <li>Autoimmune conditions (melatonin review advised)</li>
              <li>Certain antibiotics, bisphosphonates, or diuretics (magnesium absorption/interaction potential)</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-ink">Long-term use considerations</h3>
            <p className="mt-2">
              Data beyond 3–6 months are limited for both. Many people cycle or use situationally (e.g.,
              melatonin for travel, magnesium as ongoing evening support if diet is consistently low).
              Reassess periodically with a sleep diary or professional input.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-ink">Special populations</h3>
            <ul className="mt-2 list-disc pl-5 space-y-1.5">
              <li>
                <strong className="text-ink">Older adults:</strong> Both can be appropriate but start low;
                renal function and polypharmacy screening important.
              </li>
              <li>
                <strong className="text-ink">Children/adolescents:</strong> Melatonin sometimes used under
                specialist care for specific circadian issues; magnesium less studied for sleep—professional
                guidance required.
              </li>
              <li>
                <strong className="text-ink">Athletes or high physical demand:</strong> Magnesium may support
                recovery sleep quality; monitor total intake.
              </li>
            </ul>
          </div>
        </div>

        <p className="text-sm leading-7 text-[#46574d]">
          See the full{' '}
          <Link href="/compounds/melatonin" className="font-semibold text-brand-800 underline underline-offset-4">
            Melatonin compound profile
          </Link>{' '}
          and{' '}
          <Link href="/compounds/magnesium" className="font-semibold text-brand-800 underline underline-offset-4">
            Magnesium compound profile
          </Link>{' '}
          for detailed safety checklists.
        </p>
      </section>

      {/* ───────────────── Common Mistakes ───────────────── */}
      <section className="card-premium p-6 space-y-4 max-w-4xl">
        <p className="eyebrow-label">Common Mistakes</p>
        <h2 className="text-3xl font-semibold tracking-tight text-ink">Common Mistakes to Avoid</h2>
        <ul className="list-disc pl-5 space-y-2 text-sm leading-7 text-[#46574d]">
          <li>
            Assuming one is universally “better” instead of matching to specific symptoms (timing vs
            quality/tension).
          </li>
          <li>
            Starting with high doses or stacking multiple relaxing compounds at once without testing
            individually.
          </li>
          <li>
            Ignoring sleep hygiene, light exposure, caffeine timing, or possible underlying conditions
            (apnea, etc.).
          </li>
          <li>
            Using melatonin too late in the evening or magnesium oxide form expecting sleep benefits (GI
            issues common).
          </li>
          <li>
            Expecting dramatic results without consistent tracking or realistic trial periods (1–4 weeks
            minimum for assessment).
          </li>
          <li>Continuing long-term without periodic reassessment or professional input when issues persist.</li>
        </ul>
      </section>

      {/* ───────────────── Dosing & Protocols ───────────────── */}
      <section className="space-y-6 max-w-4xl">
        <div className="space-y-3">
          <p className="eyebrow-label">Dosing &amp; Protocols</p>
          <h2 className="text-3xl font-semibold tracking-tight text-ink">
            Dosing, Timing, Forms &amp; Practical Protocols
          </h2>
          <p className="text-sm leading-7 text-[#46574d]">
            <strong className="text-ink">Core principles (apply to both compounds):</strong> Start low and
            assess response before increasing. Use for a defined trial period (typically 1–4 weeks) while
            tracking sleep metrics. Prioritize consistency in timing and pairing with wind-down routines.
            Reassess periodically. These are conservative ranges drawn from studied doses and clinical
            practice; individual needs vary. Not medical advice—adjust under professional guidance when
            relevant.
          </p>
        </div>

        <figure className="overflow-hidden rounded-2xl border border-brand-900/10 shadow-sm bg-white">
          <Image
            src="/images/guides/melatonin-vs-magnesium-dosing-timeline.jpg"
            alt="Evening dosing timeline: magnesium glycinate 1-2 hours before bed, melatonin 30-60 minutes before bed"
            width={1168}
            height={784}
            className="w-full h-auto"
          />
          <figcaption className="px-4 py-3 text-center text-sm text-muted">
            Stagger timing: magnesium earlier in the evening wind-down, melatonin closer to desired bedtime.
          </figcaption>
        </figure>

        <div className="card-premium p-6 space-y-3">
          <h3 className="text-2xl font-semibold text-ink">Melatonin Dosing &amp; Timing</h3>
          <ul className="list-disc pl-5 space-y-2 text-sm leading-7 text-[#46574d]">
            <li>
              <strong className="text-ink">Typical studied range:</strong> 0.5–5 mg taken 30–60 minutes
              before desired bedtime or strategically for circadian shifts (e.g., earlier for eastward
              travel/jet lag).
            </li>
            <li>
              <strong className="text-ink">Conservative starting protocol:</strong> Begin with 0.5–1 mg (many
              people respond well to lower doses; higher doses do not reliably produce stronger effects and
              may increase next-day drowsiness risk in sensitive individuals).
            </li>
            <li>
              <strong className="text-ink">Titration:</strong> If no improvement after 3–5 nights, consider
              increasing by 0.5–1 mg increments up to 3 mg. Rarely beneficial to exceed 5 mg for sleep
              support in healthy adults.
            </li>
            <li>
              <strong className="text-ink">Timing nuance:</strong> For pure sleep <em>onset</em> support,
              dose closer to bedtime. For circadian realignment (jet lag, shift work), timing may need to be
              earlier or follow specific phase-shift protocols—consult a sleep specialist for complex cases.
            </li>
            <li>
              <strong className="text-ink">Form considerations:</strong> Fast-dissolve or sublingual for
              quicker absorption/onset. Extended-release versions may better support maintenance in some
              users. Avoid taking too late if next-day alertness is critical.
            </li>
            <li>
              <strong className="text-ink">Duration &amp; cycling:</strong> Often used situationally (travel,
              schedule disruption) or for short courses (2–4 weeks) while building better habits. Some use
              nightly at low doses during high-stress or irregular periods. Limited long-term data; periodic
              breaks or reassessment recommended.
            </li>
            <li>
              <strong className="text-ink">What to track:</strong> Time to fall asleep, number of awakenings,
              total sleep time estimate, morning refreshment (1–10 scale), and any vivid dreams or residual
              grogginess. Use a simple notebook or app for 7–14 days.
            </li>
          </ul>
          <p className="rounded-xl bg-stone-50 border border-stone-200 p-3 text-xs leading-6 text-[#5c6b63] dark:bg-white/5 dark:border-white/10">
            <strong className="text-ink">Existing product alignment example:</strong> Natrol Melatonin 5 mg
            Fast Dissolve (budget/fast-onset option) or lower-dose Thorne/NOW options. Always verify
            third-party testing.
          </p>
        </div>

        <div className="card-premium p-6 space-y-3">
          <h3 className="text-2xl font-semibold text-ink">
            Magnesium Dosing &amp; Timing{' '}
            <span className="text-base font-normal text-[#5c6b63]">(Focus on Sleep/Relaxation Use)</span>
          </h3>
          <ul className="list-disc pl-5 space-y-2 text-sm leading-7 text-[#46574d]">
            <li>
              <strong className="text-ink">Typical studied range (elemental magnesium):</strong> 200–400 mg
              elemental magnesium in the evening. Higher amounts (up to 500+ mg) studied but increase GI risk
              without proportional sleep benefit for most.
            </li>
            <li>
              <strong className="text-ink">Conservative starting protocol:</strong> 200 mg elemental
              magnesium (as glycinate or bisglycinate) taken 1–2 hours before bed or with evening wind-down
              routine. Split dose (e.g., 100–200 mg twice) if GI sensitivity occurs.
            </li>
            <li>
              <strong className="text-ink">Titration:</strong> Increase by 100 mg increments after 5–7 days
              if tolerated and response is partial. Most sleep/relaxation benefits appear within 200–350 mg
              elemental range for adults.
            </li>
            <li>
              <strong className="text-ink">Form is critical:</strong> Prioritize glycinate/bisglycinate for
              best absorption and minimal laxative effect. Avoid or limit oxide forms unless laxative effect
              is specifically desired. Citrate can be useful but may cause looser stools.
            </li>
            <li>
              <strong className="text-ink">Timing nuance:</strong> Earlier in the evening (with dinner or
              post-dinner routine) often supports relaxation without interfering with natural wind-down. Can
              be paired with other non-sedating evening habits (reading, light stretching, magnesium-rich
              foods earlier in day).
            </li>
            <li>
              <strong className="text-ink">Duration &amp; cycling:</strong> Suitable for ongoing daily use as
              part of a routine if dietary intake remains low or tension persists. Many users cycle 4–6 weeks
              on / 1–2 weeks off or reassess every 1–2 months. Benefits may be more noticeable when
              correcting a relative shortfall.
            </li>
            <li>
              <strong className="text-ink">What to track:</strong> Same sleep metrics as above + subjective
              muscle tension, evening calm, and any GI changes. Consider dietary magnesium intake assessment
              (leafy greens, nuts, seeds, whole grains) as a foundation.
            </li>
          </ul>
          <p className="rounded-xl bg-stone-50 border border-stone-200 p-3 text-xs leading-6 text-[#5c6b63] dark:bg-white/5 dark:border-white/10">
            <strong className="text-ink">Existing product alignment example:</strong> Pure Encapsulations
            Magnesium Glycinate or Thorne Magnesium Bisglycinate (clean, well-tolerated options with clear
            elemental labeling). Doctor’s Best High Absorption as a more budget chelated alternative.
          </p>
        </div>

        <div className="card-premium p-6 space-y-3 border-l-4 border-brand-500">
          <h3 className="text-2xl font-semibold text-ink">Combination Protocol Example</h3>
          <p className="text-sm leading-7 text-[#46574d]">
            (Conservative Starting Point) When both timing and relaxation/tension factors are present:
          </p>
          <ol className="list-decimal pl-5 space-y-2 text-sm leading-7 text-[#46574d]">
            <li>
              Establish magnesium glycinate (200 mg elemental) as part of the evening routine (e.g., 1–2
              hours before bed).
            </li>
            <li>
              After 5–7 days of stable magnesium use, add low-dose melatonin (0.5–1 mg) 30–60 minutes before
              desired bedtime.
            </li>
            <li>
              Monitor for 7–14 days total. Adjust timing (move magnesium earlier if needed) or doses based on
              response.
            </li>
            <li>
              Avoid stacking additional sedating compounds (e.g., high-dose theanine, valerian, or alcohol)
              without guidance.
            </li>
            <li>Reassess after 2–4 weeks: Continue, adjust, or pause one compound to isolate effects.</li>
          </ol>
        </div>

        <div className="card-premium p-6 space-y-3">
          <h3 className="text-xl font-semibold text-ink">Special population adjustments</h3>
          <ul className="list-disc pl-5 space-y-2 text-sm leading-7 text-[#46574d]">
            <li>
              <strong className="text-ink">Older adults or sensitive individuals:</strong> Start at 50–75% of
              standard starting doses; extend assessment periods.
            </li>
            <li>
              <strong className="text-ink">Kidney impairment:</strong> Magnesium requires medical
              supervision—do not self-dose.
            </li>
            <li>
              <strong className="text-ink">Pregnancy/breastfeeding:</strong> Both compounds generally require
              clinician oversight; do not initiate without guidance.
            </li>
            <li>
              <strong className="text-ink">Medications:</strong> Review interactions (e.g., magnesium with
              certain antibiotics or bisphosphonates; melatonin with sedatives or anticoagulants in some
              contexts).
            </li>
          </ul>
          <p className="text-sm leading-7 text-[#46574d]">
            <strong className="text-ink">When to pause or seek professional input:</strong> No improvement
            after 2–4 weeks of consistent appropriate use + good hygiene; worsening sleep or new symptoms;
            significant next-day impairment; or any concerns about interactions/underlying conditions.
          </p>
          <p className="text-sm leading-7 text-[#46574d]">
            Full safety checklists and sourcing criteria live in the individual compound profiles.
          </p>
        </div>
      </section>

      {/* ───────────────── Decision Framework ───────────────── */}
      <section className="card-premium p-6 space-y-4 max-w-4xl">
        <p className="eyebrow-label">Decision Framework</p>
        <h2 className="text-3xl font-semibold tracking-tight text-ink">
          Decision Framework &amp; Self-Assessment Questions
        </h2>
        <p className="text-sm leading-7 text-[#46574d]">Before choosing or combining:</p>
        <ul className="list-disc pl-5 space-y-2 text-sm leading-7 text-[#46574d]">
          <li>Is the main issue <em>falling asleep on time</em> or <em>staying asleep / feeling unrested</em>?</li>
          <li>
            Do I have signs of circadian disruption (irregular schedule, jet lag, shift work) or more
            tension/muscle restlessness?
          </li>
          <li>What is my approximate dietary magnesium intake and overall stress/tension level?</li>
          <li>Have I optimized sleep hygiene and consistent timing first?</li>
          <li>Am I willing to track response for 1–2 weeks and adjust or stop if needed?</li>
        </ul>
        <div className="space-y-2 text-sm leading-7 text-[#46574d]">
          <p>
            <strong className="text-ink">If timing/circadian factors dominate</strong> → Trial low-dose
            melatonin first (see dosing section).
          </p>
          <p>
            <strong className="text-ink">If tension, muscle, or possible low intake factors dominate</strong>{' '}
            → Trial magnesium glycinate first.
          </p>
          <p>
            <strong className="text-ink">If both are present</strong> → Consider the conservative combination
            protocol above after testing one.
          </p>
        </div>
      </section>

      {/* ───────────────── Buying Guide ───────────────── */}
      <section className="space-y-4 max-w-4xl">
        <p className="eyebrow-label">Buying Guide</p>
        <h2 className="text-3xl font-semibold tracking-tight text-ink">Buying Guide &amp; Product Criteria</h2>
        <p className="text-sm leading-7 text-[#46574d]">
          Focus on third-party tested products (USP, NSF, ConsumerLab, or equivalent) with clear labeling of
          active content. Prioritize bioavailability and tolerability:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm leading-7 text-[#46574d]">
          <li>
            <strong className="text-ink">Melatonin:</strong> Fast-dissolve for onset or extended-release when
            maintenance is the goal. Lower doses (0.5–3 mg) are often sufficient.
          </li>
          <li>
            <strong className="text-ink">Magnesium:</strong> Glycinate or bisglycinate forms for
            sleep/relaxation use. Confirm “elemental magnesium” amount on the label.
          </li>
        </ul>
        <p className="text-sm leading-7 text-[#46574d]">
          Current aligned picks and full sourcing criteria appear in the{' '}
          <Link href="/compounds/melatonin" className="font-semibold text-brand-800 underline underline-offset-4">
            Melatonin compound profile
          </Link>{' '}
          and{' '}
          <Link href="/compounds/magnesium" className="font-semibold text-brand-800 underline underline-offset-4">
            Magnesium compound profile
          </Link>
          . Affiliate disclosure: we may earn a commission from qualifying links at no extra cost to you.
        </p>
      </section>

      {/* ───────────────── FAQ (native accordion, no JS) ───────────────── */}
      <section className="card-premium p-6 space-y-4 max-w-4xl" aria-labelledby="faq-heading">
        <p className="eyebrow-label">FAQ</p>
        <h2 id="faq-heading" className="text-3xl font-semibold tracking-tight text-ink">
          Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          {faqItems.map((item) => (
            <details key={item.question} className="accordion-readable group">
              <summary className="cursor-pointer">
                <span>{item.question}</span>
                <span aria-hidden="true" className="ml-2 text-brand-700 transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-7 text-[#46574d]">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ───────────────── References ───────────────── */}
      <section className="space-y-4 max-w-4xl">
        <p className="eyebrow-label">References</p>
        <h2 className="text-3xl font-semibold tracking-tight text-ink">References &amp; Further Reading</h2>
        <p className="text-sm leading-7 text-[#46574d]">
          This comparison draws on human clinical evidence (RCTs, meta-analyses, systematic reviews) and
          mechanistic research available as of mid-2026. Evidence grades in the matrix above reflect study
          design quality, consistency, effect sizes, populations studied, and recency. Full methodology and
          evidence-grading criteria are detailed on the{' '}
          <Link href="/methodology" className="font-semibold text-brand-800 underline underline-offset-4">
            Methodology
          </Link>{' '}
          page. All supplement use should be considered alongside—not instead of—sleep hygiene, CBT-I where
          appropriate, and professional medical evaluation for persistent issues.
        </p>
        <p className="text-sm font-semibold text-ink">
          Selected key sources (not exhaustive; focused on high-relevance human data and reviews):
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm leading-7 text-[#46574d]">
          <li>
            Buscemi N, et al. (2006). Efficacy and safety of exogenous melatonin for secondary sleep
            disorders and sleep disorders accompanying sleep restriction: meta-analysis. <em>BMJ</em>.
          </li>
          <li>
            Ferracioli-Oda E, et al. (2013). Meta-analysis: melatonin for the treatment of primary sleep
            disorders. <em>PLoS One</em>.
          </li>
          <li>
            Mah J, et al. (2021). Oral magnesium supplementation for insomnia in older adults: a systematic
            review and meta-analysis. <em>BMC Complementary Medicine and Therapies</em>. (With 2024
            correction noted.)
          </li>
          <li>
            Breus MJ, et al. (2024). Effectiveness of magnesium supplementation on sleep quality and mood for
            adults with poor sleep quality: a randomized double-blind placebo-controlled crossover pilot
            trial.
          </li>
          <li>
            Djokic G, et al. (2019). The effects of magnesium–melatonin–vit B complex supplementation in the
            treatment of insomnia. <em>Open Access Macedonian Journal of Medical Sciences</em>.
          </li>
          <li>He C, et al. (2025). The mechanisms of magnesium in sleep disorders. <em>PMC / NIH</em>.</li>
          <li>
            Recent reviews and summaries on magnesium for sleep quality (2024–2025) highlighting mixed but
            promising results, form-dependence, and baseline status importance.
          </li>
          <li>
            Clinical trial registrations and emerging data on direct melatonin vs magnesium comparisons in
            primary insomnia populations (ongoing as of 2026).
          </li>
        </ul>
        <p className="text-sm leading-7 text-[#46574d]">
          Additional context drawn from site compound profiles and evidence summaries for melatonin and
          magnesium (last reviewed June 2026) and broader sleep supplement evidence syntheses on the{' '}
          <Link href="/goals/sleep" className="font-semibold text-brand-800 underline underline-offset-4">
            Best Evidence-Based Supplements for Sleep
          </Link>{' '}
          page.
        </p>
        <p className="text-sm leading-7 text-[#46574d]">
          For the most current high-quality evidence, search PubMed or systematic review databases. Always
          cross-reference with a healthcare provider for personalized interpretation.
        </p>
      </section>

      {/* ───────────────── Disclaimer ───────────────── */}
      <section className="rounded-2xl border border-stone-200 bg-stone-50 p-5 max-w-4xl text-sm leading-7 text-[#46574d] dark:bg-white/5 dark:border-white/10">
        <p>
          <strong className="text-ink">Disclaimer:</strong> This article is for educational purposes only and
          is not medical advice. Supplement effects vary. Consult a qualified healthcare professional before
          starting, changing, or combining any supplements, particularly if you have health conditions, are
          pregnant, breastfeeding, or taking medications.
        </p>
        <p className="mt-3">
          <strong className="text-ink">Last reviewed:</strong> June 2026
        </p>
        <p className="mt-1">
          <strong className="text-ink">Evidence freshness note:</strong> Grades and practical guidance will
          be updated as new high-quality human trials emerge. See{' '}
          <Link href="/methodology" className="font-semibold text-brand-800 underline underline-offset-4">
            Methodology
          </Link>{' '}
          for full evidence standards and update process.
        </p>
      </section>

      {/* ───────────────── Conversion / discovery ───────────────── */}
      <EnhancedEmailCapture
        headline="Sleep support research — evidence, not hype"
        description="Get evidence-graded analysis of melatonin, magnesium, and conservative sleep stacking — including circadian timing context, dosing protocols, and what the meta-analyses actually show."
        benefit1="Melatonin vs magnesium: matching the tool to timing vs tension"
        benefit2="Conservative combination protocol: dosing, timing, and what to track"
        benefit3="Evidence grades by outcome: onset, quality, maintenance, and next-day function"
        ctaLabel="Join the list"
        location="compare-melatonin-vs-magnesium"
      />

      <RelatedDiscoveryWidget
        heading="Explore sleep support in depth"
        subheading="Compound profiles, stack guides, and comparisons across the sleep cluster."
        items={[
          {
            type: 'compound',
            label: 'Compound',
            title: 'Melatonin Profile',
            description: 'Mechanisms, dosing, forms, and the full safety checklist for melatonin.',
            href: '/compounds/melatonin',
          },
          {
            type: 'compound',
            label: 'Compound',
            title: 'Magnesium Profile',
            description: 'Forms, elemental dosing, tolerability, and safety detail for magnesium.',
            href: '/compounds/magnesium',
          },
          {
            type: 'guide',
            label: 'Stack Guide',
            title: 'Sleep Stack: Magnesium + Melatonin',
            description: 'How to combine magnesium and melatonin safely — timing, doses, and what to track.',
            href: '/articles/sleep-stack-magnesium-melatonin',
          },
          {
            type: 'guide',
            label: 'Goal Guide',
            title: 'Best Supplements for Sleep',
            description: 'Map your sleep issue to the right evidence-based support — onset, depth, or tension.',
            href: '/goals/sleep',
          },
          {
            type: 'guide',
            label: 'Comparison',
            title: 'L-Theanine vs Magnesium',
            description: 'Calm focus vs systemic relaxation — overlapping GABA pathways and how to stack.',
            href: '/compare/l-theanine-vs-magnesium',
          },
          {
            type: 'guide',
            label: 'Methodology',
            title: 'How We Grade Evidence',
            description: 'The standards behind every evidence grade and how we update them over time.',
            href: '/methodology',
          },
        ]}
      />

      <div className="space-y-3">
        <AffiliateDisclosure />
        <RecommendationSection
          title="Melatonin and Magnesium product picks"
          description="Affiliate recommendations for both compounds. Review safety, form (glycinate for magnesium; low-dose fast-dissolve for melatonin), dose, and timing before buying."
          products={allProducts}
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/compounds/melatonin" className="chip-readable">Melatonin Profile</Link>
        <Link href="/compounds/magnesium" className="chip-readable">Magnesium Profile</Link>
        <Link href="/articles/sleep-stack-magnesium-melatonin" className="chip-readable">Sleep Stack Guide</Link>
        <Link href="/goals/sleep" className="chip-readable">Sleep Goals</Link>
        <Link href="/compare/l-theanine-vs-magnesium" className="chip-readable">L-Theanine vs Magnesium</Link>
        <Link href="/compare" className="chip-readable">All Comparisons</Link>
      </div>
    </div>
  )
}
