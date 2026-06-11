import Link from 'next/link'
import { buildPageMetadata, blogJsonLd, breadcrumbJsonLd, faqPageJsonLd } from '@/lib/seo'
import EvidenceSummaryCard from '@/components/evidence/EvidenceSummaryCard'
import SafetyNotice from '@/components/evidence/SafetyNotice'
import EmailCapture from '@/components/EmailCapture'
import NewsletterCtaBlock from '@/components/NewsletterCtaBlock'
import LastUpdatedBadge from '@/components/editorial/LastUpdatedBadge'
import ResponsiveTable from '@/components/ui/ResponsiveTable'
import { AFFILIATE_TAGS } from '@/config/affiliate'

// ─── Article metadata ─────────────────────────────────────────────────────────

const SLUG = 'ashwagandha-for-adhd'
const TITLE = 'Ashwagandha for ADHD: Evidence on Stress, Focus, Sleep, and Emotional Regulation'
const DESCRIPTION =
  'Evidence-based review of ashwagandha for ADHD-related symptoms. Examines stress reduction, sleep quality, emotional regulation, pediatric and adult data, dosing, safety, and realistic expectations as an adjunctive support.'
const DATE = '2026-06-11'
const AUTHOR = 'Will'
const READING_TIME = '10 min read'
const TAGS = ['ashwagandha', 'adhd', 'focus', 'sleep', 'adaptogens']
const CATEGORY = 'focus'

export const metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: `/articles/${SLUG}`,
  openGraphType: 'article',
})

// ─── FAQ data (also used for JSON-LD) ────────────────────────────────────────

const FAQS = [
  {
    question: 'Does ashwagandha help with ADHD?',
    answer:
      'Some randomized trials in children show improvements in ADHD symptom scores, hyperactivity, anxiety, and sleep. Evidence is promising but still preliminary and not sufficient to recommend it as a primary treatment.',
  },
  {
    question: 'Which form of ashwagandha is best studied for ADHD?',
    answer:
      'KSM-66, a standardized full-spectrum root extract, has been used in several relevant studies. Sensoril, a root and leaf extract, has also been researched but less specifically in ADHD populations.',
  },
  {
    question: 'How much ashwagandha should I take for ADHD support?',
    answer:
      'Studied doses typically range from 300–600 mg per day of standardized root extract. Individual needs vary. Clinical guidance is recommended for children.',
  },
  {
    question: 'How long does it take for ashwagandha to work?',
    answer:
      'Stress and sleep effects are often measured after 6–8 weeks of consistent use in research. Some individuals report earlier changes in relaxation or sleep onset.',
  },
  {
    question: 'Can ashwagandha replace ADHD medication?',
    answer:
      'No. Ashwagandha has not demonstrated comparable effect sizes to standard treatments for core ADHD symptoms. It may serve as complementary support for stress or sleep in appropriate cases.',
  },
  {
    question: 'Is ashwagandha safe for children with ADHD?',
    answer:
      'Several trials have used it in school-age children with generally good tolerability. Use should be supervised by a qualified clinician.',
  },
  {
    question: 'Does ashwagandha interact with ADHD medications?',
    answer:
      'Known interactions appear limited, but additive sedative effects are possible with certain medications. Always consult the prescribing clinician.',
  },
  {
    question: 'What are common side effects of ashwagandha?',
    answer:
      'Most people tolerate it well. Reported side effects can include gastrointestinal discomfort, drowsiness, or rarely changes in thyroid function or hormone levels.',
  },
  {
    question: 'Should adults with ADHD take ashwagandha?',
    answer:
      'Adult-specific ADHD trials are limited. General evidence supports benefits for stress and sleep in adults, which may be relevant for some with ADHD. Tracking response is important.',
  },
  {
    question: 'How do I know if ashwagandha is helping?',
    answer:
      'Track stress, anxiety, focus, emotional regulation, and sleep metrics over 6–8 weeks. Compare periods with and without the supplement when appropriate and discuss results with a clinician.',
  },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AshwagandhaForADHDPage() {
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
          <span className="text-muted">June 10, 2026</span>
          <span className="text-muted">·</span>
          <span className="text-muted">{READING_TIME}</span>
        </div>

        <h1 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl lg:text-5xl">
          {TITLE}
        </h1>

        <p className="mt-2 text-sm text-muted">
          By{' '}
          <a href="/about" rel="author" className="font-medium text-ink hover:underline">
            {AUTHOR}
          </a>
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
        you. We only link to ashwagandha forms and dose ranges consistent with the clinical protocols
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
              What Does Ashwagandha Actually Do for ADHD?
            </h2>
            <ul className="mt-4 space-y-2">
              <li className="flex gap-2 text-[1.01rem] leading-[1.85] text-[#46574d]">
                <span className="mt-1 flex-shrink-0 text-brand-700">▸</span>
                <span>
                  <strong>Indirect support via stress-axis</strong> — ashwagandha is an adaptogen
                  supporting HPA axis function. It lowers perceived stress and cortisol, which can
                  secondarily improve focus and emotional dysregulation.
                </span>
              </li>
              <li className="flex gap-2 text-[1.01rem] leading-[1.85] text-[#46574d]">
                <span className="mt-1 flex-shrink-0 text-brand-700">▸</span>
                <span>
                  <strong>Promising pediatric data</strong> — preliminary trials in school-age children
                  show signals for overall ADHD rating scale improvements, reduced hyperactivity, and lower comorbid anxiety.
                </span>
              </li>
              <li className="flex gap-2 text-[1.01rem] leading-[1.85] text-[#46574d]">
                <span className="mt-1 flex-shrink-0 text-brand-700">▸</span>
                <span>
                  <strong>Standardized root extract preferred</strong> — KSM-66 standard root extract is
                  the most widely studied form for cognitive metrics, sleep, and stress reduction.
                </span>
              </li>
              <li className="flex gap-2 text-[1.01rem] leading-[1.85] text-[#46574d]">
                <span className="mt-1 flex-shrink-0 text-brand-700">▸</span>
                <span>
                  <strong>Requires 6–8 weeks for cumulative effects.</strong> It is not a rapid-acting stimulant
                  replacement; expectations should remain modest.
                </span>
              </li>
            </ul>
            <div className="mt-4 rounded-[0.75rem] border border-amber-300/60 bg-amber-50/60 px-4 py-3 text-sm leading-6 text-[#46574d]">
              <strong className="text-ink">Important:</strong> No supplement diagnoses, treats,
              cures, or prevents ADHD. Consult a qualified healthcare professional before starting
              any supplement, especially in children or if prescription medications are in use.
            </div>
          </section>

          {/* Main article body */}
          <section className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8 space-y-8">

            {/* What Ashwagandha Is */}
            <div id="what-is-ashwagandha">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">
                What Ashwagandha Is
              </h2>
              <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                Ashwagandha (<em>Withania somnifera</em>) is a traditional Ayurvedic herb classified as an adaptogen.
                It is a small shrub native to India and parts of Africa and the Middle East. The root is the most commonly
                used part in supplements. It contains withanolides, a group of steroidal lactones believed to contribute
                to its adaptogenic and anti-inflammatory properties.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                Commercial extracts are typically standardized to withanolide content. Two widely studied extracts are KSM-66,
                a full-spectrum root extract, and Sensoril, a root and leaf extract. These differ in composition and have
                been tested in different populations and outcomes.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                Ashwagandha has a long history of use in traditional medicine for promoting vitality, reducing stress, and
                supporting sleep. Modern research has focused on its effects on the hypothalamic-pituitary-adrenal (HPA)
                axis, cortisol levels, and inflammatory markers.
              </p>
            </div>

            <hr className="border-brand-900/10" />

            {/* Why Ashwagandha Matters */}
            <div id="why-ashwagandha-matters">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">
                Why Ashwagandha Matters in ADHD
              </h2>
              <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                ADHD is frequently accompanied by elevated stress, anxiety, sleep disturbances, and emotional dysregulation.
                Chronic stress can exacerbate inattention, impulsivity, and executive function difficulties. Ashwagandha’s
                primary researched effects — lowering perceived stress and cortisol, improving sleep quality, and supporting
                emotional regulation — align with common challenges in ADHD.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                While ashwagandha does not directly target core dopaminergic or noradrenergic pathways like stimulant
                medications, its indirect effects on stress physiology and sleep may provide meaningful adjunctive support
                for some individuals.
              </p>
            </div>

            <hr className="border-brand-900/10" />

            {/* Meta-Analyses */}
            <div id="meta-analyses">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">
                Meta-Analysis and Systematic Review Evidence
              </h2>
              <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                A 2024 systematic review examined clinical studies of <em>Withania somnifera</em> for ADHD. It identified a
                small but growing body of research, primarily in pediatric populations, showing signals for improvements in
                ADHD symptoms, anxiety, and sleep. The review noted methodological limitations across studies, including small
                sample sizes and varying extract types and durations.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                Broader meta-analyses on ashwagandha for stress and anxiety, not limited to ADHD, have generally found
                significant reductions in perceived stress and anxiety scores compared with placebo. These findings provide
                context for why ashwagandha may be relevant for ADHD populations, where stress amplification is common.
              </p>
            </div>

            <hr className="border-brand-900/10" />

            {/* RCT Evidence */}
            <div id="rcts">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">
                RCT Evidence in ADHD Populations
              </h2>
              <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                Several randomized controlled trials have evaluated ashwagandha in children with ADHD or attention-related concerns.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                One prospective, double-blind, randomized, placebo-controlled study in children aged 5–12 years with mild
                ADHD found that ashwagandha root extract significantly improved ADHD rating scale scores compared with placebo
                after 56 days. Reductions were observed in both inattention and hyperactivity domains.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                Another trial in children with ADHD and comorbid anxiety symptoms reported reductions in physiological anxiety,
                social concerns, and overall anxiety scores with ashwagandha root extract.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                A study in healthy children aged 6–12 years with parent-reported attention and memory concerns found
                improvements in information processing speed, memory tasks, and parent-reported sleep quality after eight
                weeks of a standardized ashwagandha root extract.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                Results across these trials are promising but preliminary. Most studies are relatively small, and larger
                confirmatory trials are needed. Benefits appear more consistent for stress, anxiety, and sleep-related
                outcomes than for core inattention in all cases.
              </p>
            </div>

            <hr className="border-brand-900/10" />

            {/* Forms */}
            <div id="forms">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">
                Ashwagandha Forms and Extracts
              </h2>
              <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                The two most researched commercial extracts of ashwagandha are:
              </p>
              <ul className="mt-3 ml-5 space-y-2.5 list-disc text-[1.01rem] leading-[1.85] text-[#46574d]">
                <li>
                  <strong>KSM-66:</strong> A full-spectrum root extract standardized to withanolides (usually 5%). It has been
                  studied for stress reduction, cognitive support, and sleep. Several ADHD-related trials have used or
                  referenced this extract.
                </li>
                <li>
                  <strong>Sensoril:</strong> A root-and-leaf extract with a different standardization profile (typically 10%
                  withanolides). It has shown benefits for stress and cognitive function in various populations.
                </li>
              </ul>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                Other products may use generic ashwagandha root powder or different standardization levels. Root-only extracts
                are generally preferred in research over leaf-only or combined preparations for consistency.
              </p>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Full Spectrum Root
                  </p>
                  <p className="font-semibold text-ink">KSM-66 Ashwagandha</p>
                  <p className="mt-1 text-xs leading-5 text-[#46574d]">
                    Standardized root-only extract. Represents the majority of published clinical trials on sleep, stress,
                    and pediatric attention metrics. Standard dose is typically 300 mg twice daily.
                  </p>
                  <a
                    href={`https://www.amazon.com/s?k=KSM-66+ashwagandha+root+extract+standardized&tag=${AFFILIATE_TAGS.amazon}`}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="mt-3 inline-flex items-center gap-1 rounded-full bg-brand-950 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-brand-900"
                  >
                    View on Amazon →
                  </a>
                </div>
                <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Root &amp; Leaf Extract
                  </p>
                  <p className="font-semibold text-ink">Sensoril Ashwagandha</p>
                  <p className="mt-1 text-xs leading-5 text-[#46574d]">
                    Higher percentage standardization. Researched for cortisol control and relaxation. Useful if stress-induced
                    anxiety is a dominant daytime challenge. Standard dose is 125–250 mg.
                  </p>
                  <a
                    href={`https://www.amazon.com/s?k=Sensoril+ashwagandha+standardized&tag=${AFFILIATE_TAGS.amazon}`}
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

            {/* Pediatric Evidence */}
            <div id="pediatric-evidence">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">
                Pediatric Evidence
              </h2>
              <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                Most direct ADHD research on ashwagandha has been conducted in school-age children. Available RCTs suggest
                potential benefits for reducing hyperactivity, improving attention scores in some contexts, lowering comorbid
                anxiety, and supporting sleep quality.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                One study specifically in children with mild ADHD reported statistically significant improvements in overall
                ADHD symptoms after approximately eight weeks. Another focused on anxiety symptoms within an ADHD population
                showed reductions in multiple anxiety domains.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                Evidence quality is currently rated as low to moderate due to study size, duration, and occasional use of
                co-interventions. Ashwagandha is not a first-line treatment for pediatric ADHD but may offer adjunctive
                value for stress, anxiety, and sleep when clinically appropriate. Dosing decisions for children must be guided
                by a pediatric clinician.
              </p>
            </div>

            <hr className="border-brand-900/10" />

            {/* Adult Evidence Gap */}
            <div id="adult-evidence-gap">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">
                Adult ADHD Evidence Gap
              </h2>
              <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                Specific randomized controlled trials of ashwagandha in adults diagnosed with ADHD are limited. Most cognitive and
                stress-reduction studies have been conducted in healthy adults, stressed populations, or individuals with
                anxiety or insomnia rather than confirmed ADHD cohorts.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                General findings in adults show consistent reductions in stress and anxiety scores and improvements in sleep
                quality with standardized extracts, typically 300–600 mg/day. These effects may be relevant for adults with
                ADHD who experience prominent stress reactivity or sleep disruption, but direct extrapolation to ADHD symptom
                management requires caution.
              </p>
            </div>

            <hr className="border-brand-900/10" />

            {/* Evidence Summary */}
            <div id="evidence-summary">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
                Evidence Summary
              </h2>

              <EvidenceSummaryCard
                title="Ashwagandha &amp; ADHD"
                evidenceLevel="Limited"
                humanEvidence="A small prospective RCT in children aged 5–12 with mild ADHD reported significant improvements in ADHD Rating Scale scores (both inattention and hyperactivity) over 56 days (low-to-moderate evidence). Comorbid anxiety in children with ADHD showed reductions in another trial. Cognitive processing speed and sleep quality improved in healthy children with attention complaints. Replicated trials in adults with confirmed ADHD are absent; evidence for stress and sleep in healthy/anxious adults is moderate."
                mechanisticEvidence="Ashwagandha modulates HPA axis activity, lowering salivary and serum cortisol levels under stress. Standardized extracts display GABA-mimetic activity, supporting inhibitory tone, and have demonstrated anti-inflammatory and antioxidant properties in the central nervous system. These adaptogenic properties influence the physiological stress response, secondarily aiding cognitive network efficiency."
                safetyProfile="Generally well tolerated at recommended doses in pediatric and adult studies. Most common side effects are mild gastrointestinal upset (nausea, loose stools). Contraindicated in pregnant individuals due to spasmolytic activity (risk of miscarriage) and in those with hyperthyroidism (may raise thyroid hormone levels). Theoretical additive sedative effects with GABAergic drugs and immunomodulating warnings for autoimmune conditions."
              />

              {/* Evidence Table */}
              <div className="mt-6">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-muted">
                  Evidence Summary Table
                </p>
                <ResponsiveTable label="Ashwagandha ADHD evidence summary by outcome area">
                  <table className="min-w-[700px] w-full text-sm">
                    <thead>
                      <tr className="border-b border-brand-900/10">
                        <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                          Area
                        </th>
                        <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                          Population
                        </th>
                        <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                          Key Findings
                        </th>
                        <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                          Evidence Strength
                        </th>
                        <th className="pb-2 text-left text-xs font-bold uppercase tracking-wider text-muted">
                          Notes / Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-900/5">
                      <tr className="align-top">
                        <td className="py-3 pr-4 font-medium text-ink">ADHD symptom scores</td>
                        <td className="py-3 pr-4 text-[#46574d]">Children with mild ADHD</td>
                        <td className="py-3 pr-4 text-[#46574d]">Significant improvement vs placebo in one RCT</td>
                        <td className="py-3 pr-4 text-[#46574d] font-medium">Low to Moderate</td>
                        <td className="py-3 text-muted">
                          Double-blind RCT in children aged 5–12 with mild ADHD
                        </td>
                      </tr>
                      <tr className="align-top">
                        <td className="py-3 pr-4 font-medium text-ink">Anxiety symptoms in ADHD</td>
                        <td className="py-3 pr-4 text-[#46574d]">Children with ADHD</td>
                        <td className="py-3 pr-4 text-[#46574d]">Reductions in physiological anxiety and social concerns</td>
                        <td className="py-3 pr-4 text-[#46574d] font-medium">Low to Moderate</td>
                        <td className="py-3 text-muted">
                          RCT in children with ADHD and comorbid anxiety
                        </td>
                      </tr>
                      <tr className="align-top">
                        <td className="py-3 pr-4 font-medium text-ink">Cognitive performance and sleep</td>
                        <td className="py-3 pr-4 text-[#46574d]">Children with attention concerns</td>
                        <td className="py-3 pr-4 text-[#46574d]">Improvements in processing speed, memory, and sleep</td>
                        <td className="py-3 pr-4 text-[#46574d] font-medium">Low to Moderate</td>
                        <td className="py-3 text-muted">
                          RCT in healthy children aged 6–12 with parent-reported attention concerns
                        </td>
                      </tr>
                      <tr className="align-top">
                        <td className="py-3 pr-4 font-medium text-ink">Stress and anxiety, general</td>
                        <td className="py-3 pr-4 text-[#46574d]">Adults</td>
                        <td className="py-3 pr-4 text-[#46574d]">Consistent reductions in validated scales</td>
                        <td className="py-3 pr-4 text-[#46574d] font-medium">Moderate</td>
                        <td className="py-3 text-muted">
                          Non-ADHD populations; provides mechanistic context
                        </td>
                      </tr>
                      <tr className="align-top">
                        <td className="py-3 pr-4 font-medium text-ink">Adult ADHD data</td>
                        <td className="py-3 pr-4 text-[#46574d]">Adults with ADHD</td>
                        <td className="py-3 pr-4 text-[#46574d]">Very limited direct RCTs</td>
                        <td className="py-3 pr-4 text-[#46574d] font-medium">Limited</td>
                        <td className="py-3 text-muted">
                          Direct adult ADHD trials are currently absent
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </ResponsiveTable>
              </div>
            </div>

            <hr className="border-brand-900/10" />

            {/* Dosing and Timing */}
            <div id="dosing">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
                Dosing and Timing
              </h2>
              <p className="mb-4 text-[1.01rem] leading-[1.85] text-[#46574d]">
                Doses in published research commonly range from 300 mg to 600 mg per day of standardized root extract, often divided into one or two doses.
              </p>

              <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-5 shadow-sm">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-muted">
                  Dosage Reference — Ashwagandha ADHD Protocols
                </p>
                <ResponsiveTable label="Ashwagandha dosage reference table for ADHD">
                  <table className="min-w-[540px] w-full text-sm">
                    <thead>
                      <tr className="border-b border-brand-900/10">
                        <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                          Use Case
                        </th>
                        <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                          Dose (Research)
                        </th>
                        <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                          Timing
                        </th>
                        <th className="pb-2 text-left text-xs font-bold uppercase tracking-wider text-muted">
                          Notes
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-900/5">
                      <tr className="align-top">
                        <td className="py-3 pr-4 font-medium text-ink">
                          Pediatric ADHD trial
                        </td>
                        <td className="py-3 pr-4 text-[#46574d]">300–600 mg daily (standardized root)</td>
                        <td className="py-3 pr-4 text-[#46574d]">Once daily or split morning/night</td>
                        <td className="py-3 text-[#46574d]">
                          Typically evaluated over 8 weeks; clinician supervision required
                        </td>
                      </tr>
                      <tr className="align-top">
                        <td className="py-3 pr-4 font-medium text-ink">
                          General adult stress/sleep
                        </td>
                        <td className="py-3 pr-4 text-[#46574d]">300–600 mg daily (e.g., KSM-66)</td>
                        <td className="py-3 pr-4 text-[#46574d]">Split (morning and evening)</td>
                        <td className="py-3 text-[#46574d]">
                          Standard range in adult trials; requires 6–8 weeks for full adaptogenic baseline
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </ResponsiveTable>
                <p className="mt-3 text-xs text-muted">
                  Dosing decisions for children must involve a qualified clinician.
                </p>
              </div>

              <div className="mt-4 rounded-[1rem] border border-brand-900/10 bg-brand-50/60 p-4 text-sm leading-7 text-[#46574d]">
                <p className="font-semibold text-ink">Practical timing considerations:</p>
                <ul className="mt-2 ml-5 space-y-1 list-disc">
                  <li>
                    For sleep support, evening or split dosing is most appropriate to help reduce nighttime cortisol.
                  </li>
                  <li>
                    For daytime stress and focus support, morning dosing is typical.
                  </li>
                  <li>
                    Effects on stress and sleep build cumulatively and are usually measured after 6–8 weeks of consistent daily use in research.
                  </li>
                  <li>
                    Starting at the lower end of the studied range and monitoring tolerability is recommended.
                  </li>
                </ul>
              </div>
            </div>

            <hr className="border-brand-900/10" />

            {/* Medication Interactions */}
            <div id="medication-interactions">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">
                Medication Interactions
              </h2>
              <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                Ashwagandha may interact with several drug classes due to its physiological actions:
              </p>
              <ul className="mt-3 ml-5 space-y-2 list-disc text-[1.01rem] leading-[1.85] text-[#46574d]">
                <li>
                  <strong>Sedatives &amp; CNS Depressants:</strong> Additive effects are possible with benzodiazepines, barbiturates, antihistamines, sleep aids, or alcohol due to ashwagandha’s mild GABAergic activity. Monitor for excessive drowsiness.
                </li>
                <li>
                  <strong>Thyroid Hormones:</strong> Ashwagandha may increase thyroid hormone production. Use with caution or avoid if you have hyperthyroidism or take thyroid medications.
                </li>
                <li>
                  <strong>Immunosuppressants:</strong> Theoretical counteraction of immunosuppressant drugs due to ashwagandha’s immune-modulating properties.
                </li>
                <li>
                  <strong>Prescription ADHD Medications:</strong> No direct interactions have been documented in studies, but adaptogenic stress-buffering may help manage jitteriness in some individuals. Always consult the prescriber.
                </li>
              </ul>
              <p className="mt-3 text-sm text-muted">
                For a broader look at supplement interactions relevant to ADHD, see the{' '}
                <Link
                  href="/articles/adhd-stack-guide"
                  className="font-semibold text-brand-700 hover:text-brand-800 hover:underline"
                >
                  ADHD Stack Guide
                </Link>
                .
              </p>
            </div>

            <hr className="border-brand-900/10" />

            {/* Who May Benefit Most */}
            <div id="who-benefits">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
                Who May Benefit Most
              </h2>
              <div className="rounded-[1rem] border border-brand-900/10 bg-brand-50/60 p-5">
                <p className="mb-3 text-sm font-semibold text-ink">
                  Ashwagandha may be most relevant for individuals with ADHD who:
                </p>
                <ul className="space-y-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                  <li className="flex gap-2">
                    <span className="mt-1 flex-shrink-0 text-brand-700">▸</span>
                    <span>
                      Experience significant stress, anxiety, or emotional dysregulation that worsens core symptoms.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1 flex-shrink-0 text-brand-700">▸</span>
                    <span>
                      Have prominent sleep difficulties.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1 flex-shrink-0 text-brand-700">▸</span>
                    <span>
                      Are seeking adaptogenic, herbal support as an adjunct to established ADHD treatments under clinical guidance.
                    </span>
                  </li>
                </ul>
                <p className="mt-4 text-sm text-[#46574d]">
                  It is not positioned as a replacement for behavioral interventions or medication when clinically indicated.
                </p>
              </div>
            </div>

            <hr className="border-brand-900/10" />

            {/* Safety & Side Effects */}
            <div id="safety">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
                Safety, Side Effects, and Who Should Avoid It
              </h2>
              <SafetyNotice title="Safety Summary — Ashwagandha for ADHD">
                <ul className="ml-5 space-y-1.5 list-disc">
                  <li>
                    <strong>Pregnancy:</strong> Avoid. Ashwagandha possesses spasmolytic and abortifacient activities that can increase the risk of miscarriage or premature contractions.
                  </li>
                  <li>
                    <strong>Thyroid disorders:</strong> Avoid or use extra caution if you have hyperthyroidism or are on thyroid hormone medications, as ashwagandha can increase T4 levels.
                  </li>
                  <li>
                    <strong>Autoimmune conditions:</strong> Avoid. Theoretical immune stimulation could exacerbate conditions such as multiple sclerosis, lupus, or rheumatoid arthritis.
                  </li>
                  <li>
                    <strong>Sedative medications:</strong> Risk of additive sedation if combined with GABA-modulating prescription drugs or other sleep aids.
                  </li>
                  <li>
                    <strong>Liver health:</strong> Rare cases of liver injury have been reported in literature; avoid if significant liver impairment exists.
                  </li>
                  <li>
                    <strong>Young children:</strong> Direct ADHD evidence is limited to school-age children (ages 5–12). Safety below school age is not established.
                  </li>
                </ul>
              </SafetyNotice>
            </div>

            <hr className="border-brand-900/10" />

            {/* What Not to Expect */}
            <div id="realistic-expectations">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
                What Not to Expect
              </h2>
              <ul className="space-y-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                <li className="flex gap-2">
                  <span className="mt-1 flex-shrink-0 text-brand-700">✕</span>
                  <span>
                    <strong>Do not expect rapid focus support.</strong> Ashwagandha is not a stimulant. It does not provide acute, hour-to-hour attention enhancement. Its cognitive benefits are indirect and accrue over 6–8 weeks of stress-axis modulation.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 flex-shrink-0 text-brand-700">✕</span>
                  <span>
                    <strong>Do not expect it to replace first-line ADHD care.</strong> Standalone ashwagandha has not demonstrated effect sizes comparable to standard stimulants or non-stimulants for core inattention or hyperactivity symptoms.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 flex-shrink-0 text-brand-700">✕</span>
                  <span>
                    <strong>Do not expect universal results.</strong> Stress-driven ADHD presentations may notice more secondary benefits; those with dominant executive function challenges without anxiety may see very little change.
                  </span>
                </li>
              </ul>
            </div>

            <hr className="border-brand-900/10" />

            {/* Tracking Response */}
            <div id="tracking">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">
                Tracking Your Response
              </h2>
              <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                Systematic self-tracking is important to evaluate adaptogenic response:
              </p>
              <div className="mt-4 rounded-[1rem] border border-brand-900/10 bg-brand-50/60 p-5 text-sm leading-7 text-[#46574d]">
                <p className="font-semibold text-ink">Useful tracking measures:</p>
                <ul className="mt-2 ml-5 space-y-1 list-disc">
                  <li>
                    Daily ratings of subjective stress levels, physical anxiety, and emotional regulation (1–10 scale).
                  </li>
                  <li>
                    Sleep metrics — time to fall asleep, sleep duration, and morning fatigue.
                  </li>
                  <li>
                    Daytime focus and task completion rates.
                  </li>
                  <li>
                    Any side effects — gastrointestinal changes, excessive drowsiness.
                  </li>
                </ul>
                <p className="mt-3">
                  Review trends after 6–8 weeks of consistent use. If target symptoms show meaningful improvement, continued use may be reasonable with periodic reassessment. If no clear benefit is observed, discontinuation is appropriate.
                </p>
              </div>
            </div>

            <hr className="border-brand-900/10" />

            {/* Research Gaps */}
            <div id="research-gaps">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">
                Research Gaps
              </h2>
              <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                Current evidence has important limitations:
              </p>
              <ul className="mt-3 ml-5 space-y-1.5 list-disc text-[1.01rem] leading-[1.85] text-[#46574d]">
                <li>Most ADHD-specific trials are small and relatively short.</li>
                <li>Few large, long-term monotherapy studies exist.</li>
                <li>Adult ADHD data are particularly sparse.</li>
                <li>Direct head-to-head comparisons of different extracts (e.g., KSM-66 vs Sensoril) in ADHD populations are lacking.</li>
                <li>Optimal dosing and duration for specific symptom clusters remain incompletely defined.</li>
              </ul>
            </div>

            <hr className="border-brand-900/10" />

            {/* Conclusion */}
            <div id="conclusion">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">
                Conclusion
              </h2>
              <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                Ashwagandha shows promising signals for reducing stress, anxiety, and sleep difficulties in children with ADHD, with some studies also reporting improvements in overall symptom scores. Evidence quality is currently low to moderate, and benefits appear most relevant as adjunctive support rather than primary treatment.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                Standardized root extracts, particularly KSM-66, have the most published data. Ashwagandha is generally well tolerated at studied doses but is not suitable for everyone. Clinical supervision is recommended, especially for children or when other medications are in use.
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
                  href="/articles/adhd-stack-guide"
                  className="group rounded-[0.75rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/30"
                >
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Focus Cluster Hub
                  </p>
                  <p className="font-semibold text-ink transition group-hover:text-brand-700">
                    ADHD Stack Guide
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Evidence-based framework for supplement combinations in ADHD — tiers,
                    medication interactions, and monitoring strategies.
                  </p>
                </Link>
                <Link
                  href="/articles/ashwagandha-for-anxiety"
                  className="group rounded-[0.75rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/30"
                >
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Anxiety Cluster
                  </p>
                  <p className="font-semibold text-ink transition group-hover:text-brand-700">
                    Ashwagandha for Anxiety
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    How ashwagandha reduces cortisol levels and physical anxiety in adults.
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
                    How to combine L-theanine, magnesium, ashwagandha, and other sleep
                    supplements safely and effectively.
                  </p>
                </Link>
                <Link
                  href="/articles/anxiety-stack-guide"
                  className="group rounded-[0.75rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/30"
                >
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Anxiety Cluster
                  </p>
                  <p className="font-semibold text-ink transition group-hover:text-brand-700">
                    Anxiety Stack Guide
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Stacking frameworks for co-occurring anxiety — ashwagandha, L-theanine, and
                    magnesium combinations.
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
                        Systematic review of Withania somnifera (Ashwagandha) clinical trials for ADHD symptoms and common comorbidities
                      </td>
                      <td className="py-3 pr-4 text-muted">—</td>
                      <td className="py-3 pr-4 text-muted">2024</td>
                      <td className="py-3 text-muted">—</td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-3 text-muted">2</td>
                      <td className="py-3 pr-4 leading-6 text-ink">
                        Standardized ashwagandha root extract in children with mild ADHD — double-blind, randomized, placebo-controlled trial
                      </td>
                      <td className="py-3 pr-4 text-muted">—</td>
                      <td className="py-3 pr-4 text-muted">—</td>
                      <td className="py-3 text-muted">—</td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-3 text-muted">3</td>
                      <td className="py-3 pr-4 leading-6 text-ink">
                        Ashwagandha root extract in children with ADHD and comorbid anxiety symptoms — randomized controlled trial
                      </td>
                      <td className="py-3 pr-4 text-muted">—</td>
                      <td className="py-3 pr-4 text-muted">—</td>
                      <td className="py-3 text-muted">—</td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-3 text-muted">4</td>
                      <td className="py-3 pr-4 leading-6 text-ink">
                        Ashwagandha standardized root extract in healthy children with parent-reported attention and memory complaints — randomized controlled trial
                      </td>
                      <td className="py-3 pr-4 text-muted">—</td>
                      <td className="py-3 pr-4 text-muted">—</td>
                      <td className="py-3 text-muted">—</td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-3 text-muted">5</td>
                      <td className="py-3 pr-4 leading-6 text-ink">
                        Broader systematic reviews and meta-analyses of standardized ashwagandha extracts for stress, anxiety, and cortisol modulation in adults
                      </td>
                      <td className="py-3 pr-4 text-muted">—</td>
                      <td className="py-3 pr-4 text-muted">—</td>
                      <td className="py-3 text-muted">—</td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-3 text-muted">6</td>
                      <td className="py-3 pr-4 leading-6 text-ink">
                        Adult ADHD evidence gap — absence of large, well-designed ashwagandha monotherapy RCTs in adults with confirmed ADHD diagnosis
                      </td>
                      <td className="py-3 pr-4 text-muted">—</td>
                      <td className="py-3 pr-4 text-muted">—</td>
                      <td className="py-3 text-muted">—</td>
                    </tr>
                  </tbody>
                </table>
              </ResponsiveTable>
              <p className="mt-3 text-xs text-muted">
                Full citation details including PMIDs and sample sizes are referenced in the
                research database. See the{' '}
                <Link
                  href="/articles/adhd-stack-guide"
                  className="font-semibold text-brand-700 hover:text-brand-800 hover:underline"
                >
                  ADHD Stack Guide
                </Link>{' '}
                for related compound evidence. General anxiety-specific ashwagandha references are shared
                with the{' '}
                <Link
                  href="/articles/ashwagandha-for-anxiety"
                  className="font-semibold text-brand-700 hover:text-brand-800 hover:underline"
                >
                  Ashwagandha for Anxiety article
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
                ['#what-is-ashwagandha', 'What Is Ashwagandha?'],
                ['#why-ashwagandha-matters', 'Why Status Matters'],
                ['#meta-analyses', 'Meta-Analysis Evidence'],
                ['#rcts', 'RCT Evidence'],
                ['#forms', 'Forms &amp; Extracts'],
                ['#pediatric-evidence', 'Pediatric Evidence'],
                ['#adult-evidence-gap', 'Adult Evidence Gap'],
                ['#evidence-summary', 'Evidence Summary'],
                ['#dosing', 'Dosing &amp; Timing'],
                ['#medication-interactions', 'Medication Interactions'],
                ['#who-benefits', 'Who Might Benefit'],
                ['#safety', 'Safety &amp; Side Effects'],
                ['#realistic-expectations', 'Realistic Expectations'],
                ['#tracking', 'Tracking Response'],
                ['#research-gaps', 'Research Gaps'],
                ['#conclusion', 'Conclusion'],
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
                href="/articles/adhd-stack-guide"
                className="block text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline"
              >
                ADHD stack guide →
              </Link>
              <Link
                href="/articles/ashwagandha-for-anxiety"
                className="block text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline"
              >
                Ashwagandha for anxiety →
              </Link>
              <Link
                href="/articles/sleep-stack-guide"
                className="block text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline"
              >
                Sleep stack guide →
              </Link>
              <Link
                href="/articles/anxiety-stack-guide"
                className="block text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline"
              >
                Anxiety stack guide →
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
