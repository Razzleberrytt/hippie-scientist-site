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

const SLUG = 'magnesium-for-adhd'
const TITLE = 'Magnesium for ADHD: Evidence on Symptoms, Forms, and Practical Use'
const DESCRIPTION =
  'Magnesium status is often lower in people with ADHD. This evidence-first review examines meta-analyses, RCTs, different forms (glycinate, threonate, citrate), pediatric and adult data, dosing, safety, and who may benefit most.'
const DATE = '2026-06-10'
const AUTHOR = 'Will'
const READING_TIME = '11 min read'
const TAGS = ['magnesium', 'adhd', 'focus', 'sleep', 'minerals']
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
    question: 'Does magnesium help with ADHD?',
    answer:
      'Some studies show improvements in hyperactivity, conduct problems, and sleep in children with ADHD, especially when magnesium status is low. Evidence for core inattention symptoms is more limited and inconsistent.',
  },
  {
    question: 'Which form of magnesium is best for ADHD?',
    answer:
      'Magnesium glycinate is often preferred for general tolerability and calming effects. Magnesium L-threonate is sometimes chosen for potential brain penetration and cognitive support, though direct comparative ADHD trials are lacking.',
  },
  {
    question: 'How much magnesium should someone with ADHD take?',
    answer:
      'Research doses commonly range from 200–400 mg elemental magnesium per day. Individual needs vary. Clinical supervision is recommended, especially for children.',
  },
  {
    question: 'How long does it take to see benefits from magnesium for ADHD?',
    answer:
      'Some trials measured changes after 8–12 weeks of consistent use. Sleep-related effects may appear earlier in some individuals.',
  },
  {
    question: 'Can magnesium replace ADHD medication?',
    answer:
      'No. Magnesium has not demonstrated effect sizes comparable to standard treatments. It may serve as complementary support in appropriate cases.',
  },
  {
    question: 'Is magnesium safe for children with ADHD?',
    answer:
      'Several trials have used magnesium in school-age children with generally good tolerability. Use should be guided by a pediatric clinician, particularly when other treatments are in place.',
  },
  {
    question: 'Does magnesium interact with ADHD stimulant medications?',
    answer:
      'Known direct interactions are limited, but individual responses vary. Always discuss supplement use with the prescribing clinician.',
  },
  {
    question: 'What are common side effects of magnesium supplements?',
    answer:
      'Gastrointestinal effects such as loose stools or diarrhea are most common, especially with higher doses or less well-absorbed forms. Starting lower and using better-tolerated forms, such as glycinate or threonate, can reduce this risk.',
  },
  {
    question: 'Should adults with ADHD take magnesium?',
    answer:
      'Adult-specific ADHD data are limited. Some adults report benefits for sleep, stress resilience, or focus, but evidence quality is lower than in pediatric populations. Tracking response is important.',
  },
  {
    question: 'How do I know if magnesium is helping?',
    answer:
      'Track target symptoms, including sleep, focus, hyperactivity, emotional regulation, and any side effects, over 6–12 weeks. Compare periods on and off supplementation when appropriate, and discuss findings with a clinician.',
  },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MagnesiumForADHDPage() {
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
        you. We only link to magnesium forms and dose ranges consistent with the clinical protocols
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
              What Does Magnesium Actually Do for ADHD?
            </h2>
            <ul className="mt-4 space-y-2">
              <li className="flex gap-2 text-[1.01rem] leading-[1.85] text-[#46574d]">
                <span className="mt-1 flex-shrink-0 text-brand-700">▸</span>
                <span>
                  <strong>ADHD status is often lower</strong> — meta-analyses show that children and
                  adolescents with ADHD have lower serum magnesium levels on average compared to neurotypical controls.
                </span>
              </li>
              <li className="flex gap-2 text-[1.01rem] leading-[1.85] text-[#46574d]">
                <span className="mt-1 flex-shrink-0 text-brand-700">▸</span>
                <span>
                  <strong>Hyperactivity and conduct support</strong> — RCTs suggest modest improvements
                  in hyperactivity, emotional regulation, and sleep, particularly when baseline status is low.
                </span>
              </li>
              <li className="flex gap-2 text-[1.01rem] leading-[1.85] text-[#46574d]">
                <span className="mt-1 flex-shrink-0 text-brand-700">▸</span>
                <span>
                  <strong>Glycinate and Threonate preferred</strong> — glycinate is favored for calming and
                  sleep support, while threonate has preliminary backing for brain penetration. Citrate is useful
                  but can cause laxative effects.
                </span>
              </li>
              <li className="flex gap-2 text-[1.01rem] leading-[1.85] text-[#46574d]">
                <span className="mt-1 flex-shrink-0 text-brand-700">▸</span>
                <span>
                  <strong>Not a standalone treatment.</strong> Magnesium is a low-risk adjunctive mineral,
                  not a replacement for behavioral interventions or standard ADHD medications.
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

            {/* What Magnesium Is */}
            <div id="what-is-magnesium">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">
                What Magnesium Is
              </h2>
              <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                Magnesium is an essential mineral involved in hundreds of enzymatic reactions, including those related to
                energy production, neurotransmitter regulation, and nerve function. It is the fourth most abundant mineral
                in the human body. It serves as a cofactor for more than 300 enzymatic reactions, including those involved
                in ATP production, DNA and RNA synthesis, and the regulation of ion channels. In the nervous system,
                magnesium influences NMDA receptor activity, GABA function, and dopamine signaling — systems frequently
                discussed in relation to ADHD.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                Dietary sources include leafy greens, nuts, seeds, whole grains, and legumes. Many people consume less than
                the recommended daily allowance through food alone. Modern soil depletion, processed food diets, and certain
                medications can further reduce magnesium status.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                Supplemental forms differ significantly in bioavailability, tolerability, and intended effects. Common
                forms include magnesium oxide, citrate, glycinate, and L-threonate. Each has different absorption profiles
                and clinical considerations.
              </p>
            </div>

            <hr className="border-brand-900/10" />

            {/* Why Status Matters */}
            {/* TODO: Verify magnesium-status evidence, biomarker type, exact population, effect size, and evidence grade in workbook. */}
            <div id="why-magnesium-matters">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">
                Why Magnesium Status Matters in ADHD
              </h2>
              <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                Multiple observational studies and meta-analyses have reported lower serum, plasma, or hair magnesium
                levels in children and adolescents with ADHD compared to neurotypical controls. One 2019 meta-analysis
                found that individuals with ADHD had statistically significantly lower serum magnesium levels. While
                correlation does not prove causation, magnesium’s roles in neuronal excitability, attention networks,
                and sleep regulation provide a biological rationale for further investigation.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                Magnesium deficiency symptoms can overlap with ADHD features, including restlessness, difficulty
                concentrating, irritability, and sleep disturbances. Correcting deficiency, when present, may therefore
                support overall symptom management even if it does not treat the core neurodevelopmental condition itself.
              </p>
            </div>

            <hr className="border-brand-900/10" />

            {/* Meta-Analysis Evidence */}
            {/* TODO: Verify Effatpanah 2019 meta-analysis details, PMID, included studies, biomarker type, mean difference, heterogeneity, and quality assessment in workbook. */}
            <div id="meta-analyses">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">
                Meta-Analysis Evidence
              </h2>
              <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                A 2019 systematic review and meta-analysis examined the relationship between magnesium status and ADHD.
                The pooled analysis indicated that children and adolescents with ADHD had lower serum magnesium levels than
                controls. Heterogeneity across studies was high, highlighting the need for more standardized research.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                Other reviews have noted that while magnesium deficiency appears more common in ADHD populations, the
                clinical benefit of supplementation is less consistently demonstrated across all trials. Effect sizes tend
                to be modest, and many studies combine magnesium with other nutrients, such as vitamin D, or use it as an
                adjunct to stimulant medication.
              </p>
            </div>

            <hr className="border-brand-900/10" />

            {/* RCT Evidence */}
            {/* TODO: Verify RCT list, exact doses, durations, outcome scales, co-interventions, and evidence grades in workbook. */}
            <div id="rcts">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">
                Randomized Controlled Trial (RCT) Evidence
              </h2>
              <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                Randomized controlled trials of magnesium supplementation in ADHD have produced mixed but generally positive
                signals, particularly for hyperactivity, impulsivity, and conduct problems.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                Several trials have tested magnesium, often 200–400 mg elemental magnesium daily, alone or in combination with
                vitamin D or standard ADHD medication. Some studies reported improvements in parent- or teacher-rated ADHD
                symptom scales, reduced hyperactivity, and better emotional regulation after 8–12 weeks of supplementation.
                Benefits appear more pronounced in children who had documented low magnesium status at baseline.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                Not all trials have shown clear benefits, and methodological limitations — including small sample sizes,
                short duration, lack of blinding in some cases, and co-supplementation — make it difficult to isolate
                magnesium’s specific contribution. Larger, well-controlled monotherapy trials are still needed.
              </p>
            </div>

            <hr className="border-brand-900/10" />

            {/* Magnesium Forms */}
            {/* TODO: Verify form-specific absorption, tolerability, and brain-penetration claims in workbook before final publication. */}
            <div id="forms">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">
                Magnesium Glycinate vs Threonate vs Citrate vs Oxide
              </h2>
              <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                Different forms of magnesium have distinct absorption profiles and tolerability characteristics relevant to ADHD support:
              </p>
              <ul className="mt-3 ml-5 space-y-2.5 list-disc text-[1.01rem] leading-[1.85] text-[#46574d]">
                <li>
                  <strong>Magnesium Glycinate:</strong> Well-absorbed and generally well-tolerated. Often chosen for its calming
                  properties and lower likelihood of causing gastrointestinal upset. Frequently used for sleep and anxiety-related
                  symptoms that commonly co-occur with ADHD.
                </li>
                <li>
                  <strong>Magnesium L-Threonate:</strong> Designed to cross the blood-brain barrier more effectively than other forms.
                  Some preliminary human data suggest benefits for cognitive function, memory, and sleep architecture. Interest in
                  ADHD stems from its potential to raise brain magnesium levels, though large ADHD-specific trials are limited.
                </li>
                <li>
                  <strong>Magnesium Citrate:</strong> Good bioavailability and often used for general supplementation. Can have a mild
                  laxative effect at higher doses.
                </li>
                <li>
                  <strong>Magnesium Oxide:</strong> Lower bioavailability and more commonly associated with gastrointestinal side effects.
                  Less preferred for neurological or cognitive goals.
                </li>
              </ul>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                Choice of form should consider the primary goal, such as sleep versus daytime focus, individual tolerability, and
                cost. Many clinicians prefer glycinate or threonate for ADHD-related support due to better absorption and tolerability.
              </p>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Calming &amp; Sleep Support
                  </p>
                  <p className="font-semibold text-ink">Magnesium Glycinate</p>
                  <p className="mt-1 text-xs leading-5 text-[#46574d]">
                    High bioavailability and gentle on the GI tract. Best taken in the evening to support sleep architecture
                    and physical relaxation, reducing nighttime restlessness.
                  </p>
                  <a
                    href={`https://www.amazon.com/s?k=magnesium+glycinate+calm+focus&tag=${AFFILIATE_TAGS.amazon}`}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="mt-3 inline-flex items-center gap-1 rounded-full bg-brand-950 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-brand-900"
                  >
                    View on Amazon →
                  </a>
                </div>
                <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Cognitive Brain Penetration
                  </p>
                  <p className="font-semibold text-ink">Magnesium L-Threonate</p>
                  <p className="mt-1 text-xs leading-5 text-[#46574d]">
                    Specially formulated to cross the blood-brain barrier. Subject of research on brain magnesium concentration
                    and cognitive metrics. Suitable for daytime or evening use.
                  </p>
                  <a
                    href={`https://www.amazon.com/s?k=magnesium+l-threonate+focus&tag=${AFFILIATE_TAGS.amazon}`}
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
            {/* TODO: Verify pediatric trial details, exact n, age range, dose, intervention duration, and rating scales in workbook. */}
            <div id="pediatric-evidence">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">
                Pediatric ADHD Evidence
              </h2>
              <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                Most magnesium research in ADHD has been conducted in school-age children. Several RCTs and systematic reviews
                suggest that supplementation, typically 200–400 mg elemental magnesium per day for 8–12 weeks, may reduce
                hyperactivity, improve conduct, and support emotional regulation, especially in children with low baseline
                magnesium status.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                One randomized trial combining magnesium with vitamin D reported improvements in conduct problems, social
                problems, and anxiety/shy behaviors. Standalone magnesium trials have shown more modest or inconsistent effects
                on core inattention symptoms.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                Evidence quality is rated as low to moderate overall due to study size and design limitations. Magnesium is not
                considered a first-line treatment but may serve as a reasonable adjunctive option in children with confirmed
                or suspected low magnesium status. Use in children should always involve clinical oversight.
              </p>
            </div>

            <hr className="border-brand-900/10" />

            {/* Adult Evidence Gap */}
            {/* TODO: Verify whether any adult ADHD magnesium RCTs exist before implementation as final evidence. */}
            <div id="adult-evidence-gap">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">
                Adult ADHD Evidence Gap
              </h2>
              <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                Data specifically examining magnesium supplementation in adults with ADHD are limited. Most cognitive and mood
                studies of magnesium have been conducted in general adult populations or older adults rather than confirmed
                ADHD cohorts.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                Observational data suggest magnesium status can influence attention, stress resilience, and sleep in adults.
                However, without robust ADHD-specific RCTs, expectations for adults should remain cautious. Adults exploring
                magnesium for ADHD-related symptoms should track response systematically and involve a clinician, particularly
                if other medications are in use.
              </p>
            </div>

            <hr className="border-brand-900/10" />

            {/* Evidence Summary */}
            <div id="evidence-summary">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
                Evidence Summary
              </h2>

              <EvidenceSummaryCard
                title="Magnesium &amp; ADHD"
                evidenceLevel="Limited"
                humanEvidence="Observational research and a 2019 meta-analysis (Effatpanah) consistently report lower magnesium status in children with ADHD compared to controls (moderate strength for lower status). Pediatric RCTs show modest improvements in hyperactivity, impulsivity, and conduct scales, often using 200–400 mg daily over 8–12 weeks (low-to-moderate evidence). Comorbid anxiety and conduct problems showed improvement in a magnesium + vitamin D trial (Hemamy). Very limited direct clinical evidence in adult ADHD populations."
                mechanisticEvidence="Magnesium acts as an antagonist at the NMDA receptor, preventing excessive glutamate excitation, and modulates GABA-A receptors, supporting inhibitory tone. It is also required for enzymatic steps in catecholamine (dopamine/norepinephrine) synthesis and ATP production. These cellular roles are biological rationales, but human clinical translation is heavily dependent on individual baseline status."
                safetyProfile="Favorable safety profile at standard dietary and supplemental doses. The primary side effects are gastrointestinal (loose stools, abdominal cramps, diarrhea), particularly at doses exceeding 350 mg elemental magnesium or when using magnesium oxide/citrate. Excretion is renal; contraindicated in individuals with significant kidney impairment without specialist supervision. Absorption interactions exist with antibiotics and bisphosphonates."
              />

              {/* Evidence Table */}
              <div className="mt-6">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-muted">
                  Evidence Summary Table
                </p>
                <ResponsiveTable label="Magnesium ADHD evidence summary by outcome area">
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
                          Notes / TODO
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-900/5">
                      <tr className="align-top">
                        <td className="py-3 pr-4 font-medium text-ink">Serum magnesium levels</td>
                        <td className="py-3 pr-4 text-[#46574d]">Children/adolescents with ADHD</td>
                        <td className="py-3 pr-4 text-[#46574d]">Lower levels vs controls (meta-analysis)</td>
                        <td className="py-3 pr-4 text-[#46574d] font-medium">Moderate</td>
                        <td className="py-3 text-muted">
                          {/* TODO: Effatpanah 2019 meta-analysis; verify in workbook */}
                          Pending workbook verification
                        </td>
                      </tr>
                      <tr className="align-top">
                        <td className="py-3 pr-4 font-medium text-ink">Supplementation on hyperactivity</td>
                        <td className="py-3 pr-4 text-[#46574d]">Children with ADHD</td>
                        <td className="py-3 pr-4 text-[#46574d]">Improvements in several RCTs, often 8–12 weeks</td>
                        <td className="py-3 pr-4 text-[#46574d] font-medium">Low to Moderate</td>
                        <td className="py-3 text-muted">
                          {/* TODO: Multiple small RCTs, some combined supplements; verify in workbook */}
                          Pending workbook verification
                        </td>
                      </tr>
                      <tr className="align-top">
                        <td className="py-3 pr-4 font-medium text-ink">Magnesium + Vitamin D</td>
                        <td className="py-3 pr-4 text-[#46574d]">Children with ADHD</td>
                        <td className="py-3 pr-4 text-[#46574d]">Reduced conduct problems and anxiety in one RCT</td>
                        <td className="py-3 pr-4 text-[#46574d] font-medium">Low to Moderate</td>
                        <td className="py-3 text-muted">
                          {/* TODO: Hemamy 2020/2021 trials; verify in workbook */}
                          Pending workbook verification
                        </td>
                      </tr>
                      <tr className="align-top">
                        <td className="py-3 pr-4 font-medium text-ink">Different forms, glycinate vs threonate</td>
                        <td className="py-3 pr-4 text-[#46574d]">General / cognitive</td>
                        <td className="py-3 pr-4 text-[#46574d]">Threonate may have better brain penetration</td>
                        <td className="py-3 pr-4 text-[#46574d] font-medium">Preliminary</td>
                        <td className="py-3 text-muted">
                          {/* TODO: Verify form-specific absorption, brain penetration; verify in workbook */}
                          Limited direct ADHD comparisons
                        </td>
                      </tr>
                      <tr className="align-top">
                        <td className="py-3 pr-4 font-medium text-ink">Adult ADHD data</td>
                        <td className="py-3 pr-4 text-[#46574d]">Adults with ADHD</td>
                        <td className="py-3 pr-4 text-[#46574d]">Very limited specific RCTs</td>
                        <td className="py-3 pr-4 text-[#46574d] font-medium">Limited</td>
                        <td className="py-3 text-muted">
                          {/* TODO: Evidence gap in adult ADHD populations; verify in workbook */}
                          Evidence gap — pending workbook review
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </ResponsiveTable>
              </div>
            </div>

            <hr className="border-brand-900/10" />

            {/* Dosing and Timing */}
            {/* TODO: Verify all dose ranges, elemental magnesium wording, timing, tolerable upper intake limits, and pediatric/adult differences in workbook. */}
            <div id="dosing">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
                Dosing and Timing
              </h2>
              <p className="mb-4 text-[1.01rem] leading-[1.85] text-[#46574d]">
                Typical supplemental doses in ADHD research range from 200 mg to 400 mg of elemental magnesium per day, often divided into two doses. Dosing should focus on the amount of elemental magnesium, not the weight of the compound (e.g., magnesium glycinate compound weight is higher than the actual magnesium content).
              </p>

              <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-5 shadow-sm">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-muted">
                  Dosage Reference — Magnesium ADHD Studies
                </p>
                <ResponsiveTable label="Magnesium dosage reference table for ADHD">
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
                          Pediatric ADHD studies
                        </td>
                        <td className="py-3 pr-4 text-[#46574d]">200–400 mg daily (elemental)</td>
                        <td className="py-3 pr-4 text-[#46574d]">Divided (morning and evening)</td>
                        <td className="py-3 text-[#46574d]">
                          Typically evaluated over 8–12 weeks; pediatric clinician oversight required
                        </td>
                      </tr>
                      <tr className="align-top">
                        <td className="py-3 pr-4 font-medium text-ink">
                          Co-supplementation (Pediatric)
                        </td>
                        <td className="py-3 pr-4 text-[#46574d]">~250 mg Mg + Vitamin D</td>
                        <td className="py-3 pr-4 text-[#46574d]">Once or twice daily with food</td>
                        <td className="py-3 text-[#46574d]">
                          Often tested alongside Vitamin D (e.g., Hemamy trial)
                        </td>
                      </tr>
                      <tr className="align-top">
                        <td className="py-3 pr-4 font-medium text-ink">
                          General adult trials
                        </td>
                        <td className="py-3 pr-4 text-[#46574d]">300–400 mg daily (elemental)</td>
                        <td className="py-3 pr-4 text-[#46574d]">Evening or divided</td>
                        <td className="py-3 text-[#46574d]">
                          No adult ADHD-specific RCT to anchor dosing; check tolerable upper limits
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </ResponsiveTable>
                <p className="mt-3 text-xs text-muted">
                  All dose ranges require verification against workbook evidence data before publication. Dosing decisions for children must involve a clinician.
                </p>
              </div>

              <div className="mt-4 rounded-[1rem] border border-brand-900/10 bg-brand-50/60 p-4 text-sm leading-7 text-[#46574d]">
                <p className="font-semibold text-ink">Practical timing considerations:</p>
                <ul className="mt-2 ml-5 space-y-1 list-disc">
                  <li>
                    For sleep support, evening dosing is more appropriate, helping relax muscles and calm the nervous system.
                  </li>
                  <li>
                    Divided dosing (morning and evening) is commonly used in longer trials to maintain steady tissue availability and minimize GI side effects.
                  </li>
                  <li>
                    Taking magnesium with food is highly recommended to improve gastrointestinal tolerability for forms like citrate.
                  </li>
                  <li>
                    Magnesium L-threonate is sometimes used at lower elemental doses due to its specialized brain-targeting formulation.
                  </li>
                </ul>
              </div>
            </div>

            <hr className="border-brand-900/10" />

            {/* Medication Interactions */}
            {/* TODO: Verify interaction claims and safety citations in workbook. */}
            <div id="medication-interactions">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">
                Medication Interactions
              </h2>
              <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                Magnesium can interact with certain medications by binding to them or altering excretion:
              </p>
              <ul className="mt-3 ml-5 space-y-2 list-disc text-[1.01rem] leading-[1.85] text-[#46574d]">
                <li>
                  <strong>Antibiotics:</strong> Magnesium can reduce absorption of tetracyclines and quinolone antibiotics. Separate dosing by at least 2 hours before or 4–6 hours after the mineral.
                </li>
                <li>
                  <strong>Bisphosphonates:</strong> Magnesium can significantly decrease the absorption of these osteoporosis medications. Separate dosing by at least 2 hours.
                </li>
                <li>
                  <strong>Diuretics and Blood Pressure Drugs:</strong> Loop and thiazide diuretics can increase urinary magnesium loss, while potassium-sparing diuretics may conserve magnesium. Review parameters regularly.
                </li>
                <li>
                  <strong>Prescription ADHD Stimulants:</strong> Direct pharmacodynamic interactions are limited, but some individuals find evening magnesium helps smooth the comedown of daytime stimulants or support sleep. Always consult the prescriber.
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
                  Magnesium may be most relevant for individuals with ADHD who:
                </p>
                <ul className="space-y-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                  <li className="flex gap-2">
                    <span className="mt-1 flex-shrink-0 text-brand-700">▸</span>
                    <span>
                      Have documented low magnesium status via serum or other clinical testing.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1 flex-shrink-0 text-brand-700">▸</span>
                    <span>
                      Experience prominent hyperactivity, impulsivity, or co-occurring sleep difficulties.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1 flex-shrink-0 text-brand-700">▸</span>
                    <span>
                      Are seeking supportive, mineral-based adjunctive options alongside established treatments under medical guidance.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1 flex-shrink-0 text-brand-700">▸</span>
                    <span>
                      Want a compound with a well-characterized safety profile for long-term health.
                    </span>
                  </li>
                </ul>
                <p className="mt-4 text-sm text-[#46574d]">
                  It is not positioned as a standalone treatment or replacement for behavioral interventions or medication when clinically indicated.
                </p>
              </div>
            </div>

            <hr className="border-brand-900/10" />

            {/* Safety & Side Effects */}
            <div id="safety">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
                Safety, Side Effects, and Who Should Avoid It
              </h2>
              <SafetyNotice title="Safety Summary — Magnesium for ADHD">
                <ul className="ml-5 space-y-1.5 list-disc">
                  <li>
                    <strong>Gastrointestinal distress:</strong> The most common side effect of magnesium supplementation, particularly at higher elemental doses or when using oxide or citrate forms. Symptoms include loose stools, abdominal cramping, and diarrhea.
                  </li>
                  <li>
                    <strong>Kidney impairment:</strong> Individuals with significant kidney disease or renal dysfunction must avoid magnesium supplementation unless specifically directed by their physician, as excretion is reduced, creating a risk of hypermagnesemia.
                  </li>
                  <li>
                    <strong>Antibiotics spacing:</strong> Separate ingestion of magnesium from tetracycline and quinolone antibiotics by several hours to avoid impaired drug absorption.
                  </li>
                  <li>
                    <strong>Autoimmune/Neurological:</strong> Rare conditions such as myasthenia gravis can be exacerbated by magnesium; consult a specialist.
                  </li>
                  <li>
                    <strong>Pediatric use:</strong> School-age children have been studied, but dosing must be adjusted to weight and age, and clinical supervision is required.
                  </li>
                  <li>
                    <strong>Pregnancy and breastfeeding:</strong> Magnesium is frequently used during pregnancy under clinical supervision, but supplemental use should be discussed with an obstetrician.
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
                    <strong>Do not expect rapid, stimulant-like symptom resolution.</strong> Magnesium does not act rapidly on dopamine/norepinephrine transporters. Sleep benefits may appear relatively quickly, but hyperactivity and conduct changes typically require 8–12 weeks of consistent status correction.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 flex-shrink-0 text-brand-700">✕</span>
                  <span>
                    <strong>Do not expect core inattention to resolve.</strong> RCT data show the most consistent support for hyperactivity, impulsivity, and conduct problems. Standalone magnesium has not demonstrated robust effects on core focus parameters.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 flex-shrink-0 text-brand-700">✕</span>
                  <span>
                    <strong>Do not expect universal efficacy.</strong> Benefits appear most pronounced in individuals who have low magnesium status at baseline. If your levels are already optimal, supplementation is unlikely to yield noticeble ADHD symptom changes.
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
                Systematic tracking helps determine whether magnesium supplementation is providing meaningful benefit:
              </p>
              <div className="mt-4 rounded-[1rem] border border-brand-900/10 bg-brand-50/60 p-5 text-sm leading-7 text-[#46574d]">
                <p className="font-semibold text-ink">Useful tracking measures:</p>
                <ul className="mt-2 ml-5 space-y-1 list-disc">
                  <li>
                    Sleep metrics — onset latency, awakenings, total sleep time, and morning refreshment.
                  </li>
                  <li>
                    Daily ratings of focus, hyperactivity, impulsivity, and emotional regulation (e.g., 1–10 scale).
                  </li>
                  <li>
                    Side effects — changes in bowel habits, loose stools, or cramping.
                  </li>
                  <li>
                    Energy levels and overall sense of physical tension.
                  </li>
                </ul>
                <p className="mt-3">
                  Review trends after 6–12 weeks of consistent use. If no clear improvement is observed in target symptoms, continuing supplementation may not be justified. Periodic reassessment, including possible re-testing of magnesium status when clinically appropriate, supports responsible use.
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
                Current evidence has several limitations:
              </p>
              <ul className="mt-3 ml-5 space-y-1.5 list-disc text-[1.01rem] leading-[1.85] text-[#46574d]">
                <li>Many trials are small or combine magnesium with other nutrients, making it hard to isolate effects.</li>
                <li>Few large, long-term monotherapy RCTs exist in ADHD populations.</li>
                <li>Adult ADHD data are particularly sparse.</li>
                <li>Optimal dosing, duration, and specific chemical form (e.g., glycinate vs threonate) for specific ADHD symptom clusters remain incompletely defined.</li>
                <li>Heterogeneity in baseline magnesium status across studies complicates interpretation.</li>
              </ul>
            </div>

            <hr className="border-brand-900/10" />

            {/* Conclusion */}
            <div id="conclusion">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">
                Conclusion
              </h2>
              <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                Magnesium status appears lower on average in individuals with ADHD, and supplementation shows modest but promising effects on hyperactivity, conduct, and sleep in some pediatric studies. Evidence quality is moderate at best, with benefits appearing most relevant for those with low baseline status.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                Different forms offer varying absorption and tolerability profiles. Glycinate and threonate are commonly discussed for neurological and sleep-related goals. Magnesium is not a replacement for standard ADHD care but may serve as a low-risk adjunctive option worth discussing with a clinician, particularly when sleep or hyperactivity symptoms are prominent and magnesium status is suboptimal.
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
                    How magnesium affects GABA pathways, sleep efficiency, and nighttime awakenings in older adults.
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
                        Magnesium status in children and adolescents with ADHD — systematic review and meta-analysis of serum levels
                      </td>
                      <td className="py-3 pr-4 text-muted">Effatpanah et al.</td>
                      <td className="py-3 pr-4 text-muted">2019</td>
                      <td className="py-3 text-muted">
                        {/* TODO: Verify Effatpanah 2019 meta-analysis details, PMID, included studies in workbook */}
                        PMID 31082119 (pending workbook verification)
                      </td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-3 text-muted">2</td>
                      <td className="py-3 pr-4 leading-6 text-ink">
                        Magnesium and Vitamin D co-supplementation in children with ADHD — randomized, double-blind, placebo-controlled trial
                      </td>
                      <td className="py-3 pr-4 text-muted">Hemamy et al.</td>
                      <td className="py-3 pr-4 text-muted">2020 / 2021</td>
                      <td className="py-3 text-muted">
                        {/* TODO: Verify Hemamy 2020/2021 trials; verify in workbook */}
                        PMID pending workbook verification
                      </td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-3 text-muted">3</td>
                      <td className="py-3 pr-4 leading-6 text-ink">
                        Magnesium supplementation monotherapy trials in pediatric ADHD symptom clusters (hyperactivity, conduct, sleep)
                      </td>
                      <td className="py-3 pr-4 text-muted">—</td>
                      <td className="py-3 pr-4 text-muted">—</td>
                      <td className="py-3 text-muted">
                        {/* TODO: Verify RCT list, exact doses, durations, outcome scales in workbook */}
                        PMIDs pending workbook verification
                      </td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-3 text-muted">4</td>
                      <td className="py-3 pr-4 leading-6 text-ink">
                        Magnesium L-threonate and glycinate comparison studies — brain magnesium concentration, cognitive outcomes, and tolerability
                      </td>
                      <td className="py-3 pr-4 text-muted">—</td>
                      <td className="py-3 pr-4 text-muted">—</td>
                      <td className="py-3 text-muted">
                        {/* TODO: Verify form-specific claims in workbook */}
                        PMIDs pending workbook review
                      </td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-3 text-muted">5</td>
                      <td className="py-3 pr-4 leading-6 text-ink">
                        Adult ADHD evidence survey — absence of large, well-controlled magnesium monotherapy RCTs in adults with confirmed ADHD
                      </td>
                      <td className="py-3 pr-4 text-muted">—</td>
                      <td className="py-3 pr-4 text-muted">—</td>
                      <td className="py-3 text-muted">
                        {/* TODO: Verify whether any adult ADHD magnesium RCTs exist in workbook */}
                        Evidence gap — pending workbook review
                      </td>
                    </tr>
                  </tbody>
                </table>
              </ResponsiveTable>
              <p className="mt-3 text-xs text-muted">
                PMID links, author details, and n-sizes will be confirmed once the workbook
                evidence pipeline completes for Magnesium ADHD studies. See the{' '}
                <Link
                  href="/articles/adhd-stack-guide"
                  className="font-semibold text-brand-700 hover:text-brand-800 hover:underline"
                >
                  ADHD Stack Guide
                </Link>{' '}
                for related compound evidence. Sleep-specific magnesium references are shared
                with the{' '}
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
                ['#what-is-magnesium', 'What Is Magnesium?'],
                ['#why-magnesium-matters', 'Why Status Matters'],
                ['#meta-analyses', 'Meta-Analysis Evidence'],
                ['#rcts', 'RCT Evidence'],
                ['#forms', 'Magnesium Forms'],
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
                href="/articles/magnesium-for-sleep"
                className="block text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline"
              >
                Magnesium for sleep →
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
