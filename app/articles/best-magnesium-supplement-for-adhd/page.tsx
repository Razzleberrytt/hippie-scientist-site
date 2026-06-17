import Link from 'next/link'
import type { Metadata } from 'next'
import { buildPageMetadata, blogJsonLd, breadcrumbJsonLd, faqPageJsonLd } from '@/lib/seo'
import LastUpdatedBadge from '@/components/editorial/LastUpdatedBadge'
import ResponsiveTable from '@/components/ui/ResponsiveTable'
import SafetyNotice from '@/components/evidence/SafetyNotice'
import EmailCapture from '@/components/EmailCapture'
import NewsletterCtaBlock from '@/components/NewsletterCtaBlock'
import PathwayDiagram from '@/components/PathwayDiagram'
import EvidenceLegend from '@/components/EvidenceLegend'
import { pathwayDiagrams } from '@/lib/pathway-data'
import { AFFILIATE_TAGS } from '@/config/affiliate'

const SLUG = 'best-magnesium-supplement-for-adhd'
const TITLE = 'Best Magnesium Supplement for ADHD: Which Form, What Dose, and What to Look For'
const DESCRIPTION =
  'Practical buying guide to magnesium supplements for ADHD. Covers the best forms (glycinate, citrate, threonate), what to ignore (oxide), how to read labels, dose ranges, and what to expect.'
const DATE = '2026-06-12'
const AUTHOR = 'Will'
const READING_TIME = '9 min read'
const TAGS = ['magnesium', 'ADHD', 'buying guide', 'sleep', 'supplements']
const CATEGORY = 'Buying Guide'

export const metadata: Metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: `/articles/${SLUG}`,
  openGraphType: 'article',
})

const FAQS = [
  {
    question: 'What is the best magnesium supplement for ADHD?',
    answer:
      'Magnesium glycinate is the most recommended form for ADHD-related use. It combines good bioavailability with gentle GI tolerability and the mild calming effect of glycine — making it suitable for evening use to support sleep and reduce hyperactivation. It is more expensive than citrate but worth it as a starting point. For budget-conscious buyers, magnesium citrate is a reasonable second choice at lower doses.',
  },
  {
    question: 'How much magnesium should I take for ADHD?',
    answer:
      'Most research in ADHD populations uses 200–400 mg of elemental magnesium daily. For adults starting glycinate, 200 mg elemental magnesium before bed is a reasonable starting dose. Elemental magnesium content is not the same as the product weight on the label — a product labeled "400 mg magnesium glycinate" typically contains only 60–80 mg of elemental magnesium. Always check the "Supplement Facts" label for elemental magnesium per serving.',
  },
  {
    question: 'Should I take magnesium with food or without for ADHD?',
    answer:
      'Taking magnesium with a small meal or snack is generally recommended — this reduces the chance of nausea (which is uncommon but possible) and may improve absorption compared to a completely empty stomach. Magnesium glycinate is tolerant to be taken with or without food, unlike some other mineral supplements.',
  },
  {
    question: 'Is magnesium threonate worth the extra cost for ADHD?',
    answer:
      'Magnesium threonate has been promoted as superior for brain health due to animal studies suggesting greater brain penetration. Human ADHD-specific trials comparing threonate to glycinate are very limited. At 3–4x the cost of glycinate and with no convincing comparative ADHD evidence, threonate is not the best starting choice. Try glycinate for 4–6 weeks first. If well-tolerated but insufficient, threonate may be worth exploring.',
  },
  {
    question: 'Can my child with ADHD take magnesium?',
    answer:
      'Magnesium supplementation in children with ADHD has been studied, and several trials in pediatric populations show improvements in hyperactivity, emotional dysregulation, and sleep — particularly in children with confirmed low magnesium levels. However, pediatric dosing is different from adult dosing (typically 100–200 mg elemental depending on age and weight), and supplementation in children should be discussed with a pediatrician before starting.',
  },
  {
    question: 'How long before bed should I take magnesium for ADHD?',
    answer:
      'Taking magnesium 30–60 minutes before bed is a commonly used timing for sleep and evening calm support. This allows time for absorption before the intended sleep-support effects are most useful. Some people prefer taking it earlier in the evening as part of a wind-down routine — this is also fine for most forms including glycinate.',
  },
]

const MAGNESIUM_EVIDENCE_ROWS = [
  ['Glycinate / bisglycinate', 'Best first choice', 'Well tolerated; useful when sleep tension or low intake is part of the picture', '100-300 mg elemental magnesium, often evening', 'Separate from some antibiotics and thyroid medication; avoid unsupervised use with kidney disease'],
  ['Citrate', 'Budget alternative', 'Reasonable absorption and cost, but more laxative at higher doses', '100-200 mg elemental to start', 'Loose stools are the main limiting factor'],
  ['L-threonate', 'Premium / not first-line', 'Interesting brain-bioavailability marketing, but limited ADHD-specific comparative evidence', 'Use label dosing; elemental magnesium is usually lower', 'High cost and limited direct evidence'],
  ['Malate', 'Daytime option', 'Sometimes used when fatigue is prominent; less calming than glycinate', '100-300 mg elemental, often earlier in the day', 'Can feel less sleep-oriented for sensitive users'],
  ['Oxide', 'Not recommended for ADHD goals', 'High elemental percentage but poor practical absorption and more laxative effect', 'Do not use as the primary form for ADHD sleep/calm goals', 'Often appears in cheap formulas'],
] as const

const MAGNESIUM_REFERENCES = [
  ['Nutrition in ADHD review', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10444659/'],
  ['Mineral status in ADHD review', 'https://www.mdpi.com/1420-3049/25/19/4440'],
  ['Iron and zinc ADHD systematic review context', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8618748/'],
] as const

export default function BestMagnesiumForAdhdPage() {
  const breadcrumbLd = breadcrumbJsonLd([
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      {faqLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />}

      <nav className="mb-6 flex items-center gap-2 text-sm text-muted">
        <Link href="/articles" className="transition hover:text-ink">Articles</Link>
        <span>/</span>
        <span className="text-ink line-clamp-1">{TITLE}</span>
      </nav>

      <section className="rounded-[1.5rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8 lg:p-10">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full border border-brand-900/10 bg-brand-50 px-2.5 py-0.5 font-bold uppercase tracking-wider text-brand-800">
            {CATEGORY}
          </span>
          {TAGS.slice(0, 3).map((tag) => (
            <span key={tag} className="rounded-full border border-brand-900/10 bg-white px-2.5 py-0.5 font-semibold text-muted capitalize">
              {tag}
            </span>
          ))}
          <span className="text-muted">June 12, 2026</span>
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

      <div className="mt-4 rounded-[1rem] border border-brand-900/10 bg-brand-50/60 px-5 py-3 text-xs leading-6 text-muted">
        <strong className="text-ink">Affiliate disclosure:</strong> This article contains affiliate
        links. Purchases may earn us a commission at no additional cost to you. All recommendations
        are based on evidence and dose ranges reviewed on this page.
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_240px]">
        <div className="space-y-6">

          {/* Top Pick Box */}
          <section className="rounded-[1rem] border border-emerald-200 bg-emerald-50/60 p-6 shadow-sm sm:p-8">
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Top Pick for ADHD</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
              Magnesium Glycinate — The Best First Choice
            </h2>
            <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
              For most adults and children with ADHD, <strong>magnesium glycinate</strong> is the best
              starting point. It has high bioavailability, excellent GI tolerability, and the glycine
              component adds mild calming support that aligns well with ADHD-related sleep difficulty and
              evening hyperactivation.
            </p>
            <ul className="mt-3 ml-5 space-y-1 list-disc text-[1.01rem] leading-[1.85] text-[#46574d]">
              <li><strong>Target dose:</strong> 200–300 mg elemental magnesium before bed</li>
              <li><strong>When to take it:</strong> 30–60 minutes before sleep</li>
              <li><strong>What to look for on the label:</strong> &ldquo;Magnesium glycinate&rdquo; or &ldquo;magnesium bisglycinate&rdquo;; elemental magnesium listed in Supplement Facts</li>
              <li><strong>What to avoid:</strong> Magnesium oxide — poor absorption (~4% bioavailability)</li>
            </ul>
            <a
              href={`https://www.amazon.com/s?k=magnesium+glycinate+adhd+sleep&tag=${AFFILIATE_TAGS.amazon}`}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-700 px-5 py-2 text-sm font-bold text-white transition hover:bg-emerald-800"
            >
              Find Magnesium Glycinate on Amazon →
            </a>
          </section>

          <section className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8 space-y-8">

            <div id="how-magnesium-works">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
                Why Magnesium for ADHD?
              </h2>
              <PathwayDiagram data={pathwayDiagrams['magnesium-adhd']} />
              <p className="mt-4 text-[1.01rem] leading-[1.85] text-[#46574d]">
                Magnesium plays a key role in regulating neural excitability via NMDA receptor blockade.
                In ADHD, neural over-excitation contributes to hyperactivity, impulsivity, and difficulty
                with emotional regulation. Magnesium deficiency — more common in ADHD than the general
                population — may exacerbate these symptoms. Correcting it is one of the more
                evidence-backed reasons to use magnesium in ADHD.
              </p>
              <EvidenceLegend highlightTier="moderate" className="mt-4" />
            </div>

            <hr className="border-brand-900/10" />

            <div id="evidence-synthesis">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
                Magnesium + ADHD Evidence: What This Buying Guide Assumes
              </h2>
              <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                Magnesium makes the most sense when there is low intake, a documented low level, sleep disruption,
                muscle tension, or evening hyperarousal. It should not be framed as a standalone ADHD treatment.
                Human ADHD research is mixed and often confounded by baseline nutrient status, so product choice
                matters less than choosing a tolerable form, checking elemental dose, and avoiding broad claims.
              </p>
              <ResponsiveTable label="Magnesium form evidence and safety comparison" className="mt-4">
                <table className="min-w-[760px] w-full text-sm">
                  <thead>
                    <tr className="border-b border-brand-900/10">
                      {['Form', 'Verdict', 'Best fit', 'Dose range', 'Safety note'].map((h) => (
                        <th key={h} className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-900/5">
                    {MAGNESIUM_EVIDENCE_ROWS.map(([form, verdict, fit, dose, safety]) => (
                      <tr key={form} className="align-top">
                        <td className="py-3 pr-4 font-semibold text-ink">{form}</td>
                        <td className="py-3 pr-4 text-[#46574d]">{verdict}</td>
                        <td className="py-3 pr-4 text-[#46574d]">{fit}</td>
                        <td className="py-3 pr-4 text-[#46574d]">{dose}</td>
                        <td className="py-3 text-[#46574d]">{safety}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ResponsiveTable>
            </div>

            <hr className="border-brand-900/10" />

            <div id="deficiency-and-dosing">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
                Deficiency Clues, Age Context, and Timing
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1rem] border border-brand-900/10 bg-brand-50/50 p-5">
                  <h3 className="font-semibold text-ink">Signs to discuss with a clinician</h3>
                  <ul className="mt-2 ml-5 list-disc space-y-1.5 text-sm leading-6 text-[#46574d]">
                    <li>Low dietary magnesium intake, restrictive diet, or frequent GI losses.</li>
                    <li>Muscle cramps, restless sleep, or tension that overlaps with low intake.</li>
                    <li>Medication, kidney, or GI history that changes mineral handling.</li>
                  </ul>
                </div>
                <div className="rounded-[1rem] border border-amber-900/10 bg-amber-50/70 p-5">
                  <h3 className="font-semibold text-amber-950">Children and teens</h3>
                  <p className="mt-2 text-sm leading-6 text-amber-900/90">
                    Pediatric magnesium dosing should be individualized by a pediatrician. Do not copy adult
                    doses for children, and do not use magnesium to replace behavioral care, school support,
                    sleep evaluation, or prescribed ADHD treatment.
                  </p>
                </div>
              </div>
            </div>

            <hr className="border-brand-900/10" />

            {/* Form Rankings */}
            <div id="form-rankings">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
                Magnesium Forms Ranked for ADHD
              </h2>
              <div className="space-y-3">
                {[
                  {
                    rank: '1',
                    name: 'Magnesium Glycinate (Bisglycinate)',
                    verdict: 'Best Choice',
                    verdictClass: 'bg-emerald-50 border-emerald-200 text-emerald-800',
                    desc: 'High absorption, gentle GI profile, glycine adds calming co-benefit. Best for sleep and evening calm support in ADHD.',
                    query: 'magnesium+glycinate+bisglycinate+sleep',
                  },
                  {
                    rank: '2',
                    name: 'Magnesium Citrate',
                    verdict: 'Good Alternative',
                    verdictClass: 'bg-blue-50 border-blue-200 text-blue-800',
                    desc: 'Good absorption, widely available, lower cost. Laxative effect at higher doses — start at 150–200 mg elemental.',
                    query: 'magnesium+citrate+supplement+sleep',
                  },
                  {
                    rank: '3',
                    name: 'Magnesium L-Threonate',
                    verdict: 'Premium / Unproven for ADHD',
                    verdictClass: 'bg-amber-50 border-amber-200 text-amber-800',
                    desc: 'Marketed for brain penetration. Animal data is interesting but human ADHD trials vs glycinate are limited. 3–4x the cost. Try glycinate first.',
                    query: 'magnesium+threonate+cognitive',
                  },
                  {
                    rank: '4',
                    name: 'Magnesium Malate',
                    verdict: 'Decent Option',
                    verdictClass: 'bg-slate-50 border-slate-200 text-slate-700',
                    desc: 'Good tolerance, reasonable absorption. Often used for energy and fatigue. Less calming co-benefit than glycinate. Valid choice if glycinate is unavailable.',
                    query: 'magnesium+malate+supplement',
                  },
                  {
                    rank: '✕',
                    name: 'Magnesium Oxide',
                    verdict: 'Avoid',
                    verdictClass: 'bg-red-50 border-red-200 text-red-800',
                    desc: '~4% bioavailability. Almost entirely passes through as a laxative. Very common in cheap supplements — check your label and avoid this form for ADHD use.',
                    query: 'magnesium+glycinate+not+oxide',
                  },
                ].map(({ rank, name, verdict, verdictClass, desc, query }) => (
                  <div key={name} className="flex gap-4 rounded-[1rem] border border-brand-900/10 bg-brand-50/20 p-4">
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-900 text-xs font-bold text-white">
                      {rank}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-ink">{name}</p>
                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${verdictClass}`}>
                          {verdict}
                        </span>
                      </div>
                      <p className="mt-1 text-sm leading-6 text-[#46574d]">{desc}</p>
                      {rank !== '✕' && (
                        <a
                          href={`https://www.amazon.com/s?k=${query}&tag=${AFFILIATE_TAGS.amazon}`}
                          target="_blank"
                          rel="noopener noreferrer sponsored"
                          className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-800 hover:underline"
                        >
                          View on Amazon →
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <hr className="border-brand-900/10" />

            {/* Label Reading Guide */}
            <div id="label-guide">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
                How to Read a Magnesium Label
              </h2>
              <div className="rounded-[1rem] border border-brand-900/10 bg-brand-50/60 p-5">
                <p className="font-semibold text-ink">The most common labeling confusion:</p>
                <p className="mt-2 text-sm leading-6 text-[#46574d]">
                  A product labeled &ldquo;Magnesium Glycinate 400mg&rdquo; does NOT mean you are getting
                  400mg of elemental magnesium. The 400mg is the weight of the entire compound (magnesium
                  + glycine). The actual elemental magnesium is typically <strong>60–80mg per tablet</strong>.
                </p>
                <p className="mt-3 text-sm leading-6 text-[#46574d]">
                  Always look at the <strong>Supplement Facts panel</strong> for the line that reads:
                  &ldquo;Magnesium [as magnesium glycinate] — Xmg&rdquo;. That &ldquo;Xmg&rdquo; is the
                  elemental dose. If you want 200mg elemental magnesium per day, you may need 3–4 tablets
                  of a standard glycinate product.
                </p>
              </div>
              <ResponsiveTable label="Magnesium form comparison by elemental content" className="mt-4">
                <table className="min-w-[520px] w-full text-sm">
                  <thead>
                    <tr className="border-b border-brand-900/10">
                      {['Form', 'Typical Elemental %', 'Dose to Hit 200mg Elemental', 'GI Risk'].map((h) => (
                        <th key={h} className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-900/5">
                    {[
                      ['Glycinate', '~14–18%', '2–4 standard capsules', 'Very low'],
                      ['Citrate', '~16%', '2–3 capsules', 'Moderate at high doses'],
                      ['Threonate', '~8%', '3–4 capsules', 'Low'],
                      ['Oxide', '~60%', '1 capsule (but ~4% absorbed)', 'High laxative effect'],
                    ].map(([form, pct, dose, gi]) => (
                      <tr key={form as string} className="align-top">
                        <td className="py-3 pr-4 font-medium text-ink">{form}</td>
                        <td className="py-3 pr-4 text-[#46574d]">{pct}</td>
                        <td className="py-3 pr-4 text-[#46574d]">{dose}</td>
                        <td className="py-3 text-[#46574d]">{gi}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ResponsiveTable>
            </div>

            <hr className="border-brand-900/10" />

            {/* Products */}
            <div id="products">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">Recommended Products</h2>
              <p className="mb-4 text-[1.01rem] leading-[1.85] text-[#46574d]">
                These searches reflect the forms and dose ranges most consistent with the ADHD evidence
                reviewed on this page. Prices and availability vary.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  {
                    eyebrow: '#1 Pick — Sleep + Calm',
                    name: 'Magnesium Glycinate (200–400mg elemental)',
                    desc: 'Best first purchase. Look for products listing 100–200mg elemental magnesium per serving in the Supplement Facts panel.',
                    query: 'magnesium+glycinate+200mg+elemental+adhd+sleep',
                    cta: 'Find on Amazon →',
                  },
                  {
                    eyebrow: 'Budget Pick',
                    name: 'Magnesium Citrate',
                    desc: 'Solid absorption at lower cost. Stay at 150–200mg elemental per dose to minimize loose-stool effect.',
                    query: 'magnesium+citrate+150mg+200mg+sleep',
                    cta: 'Find on Amazon →',
                  },
                  {
                    eyebrow: 'For Combining',
                    name: 'L-Theanine + Magnesium Stack',
                    desc: 'For adults who want both mental and physical calm support. Verify dose amounts on the label.',
                    query: 'l-theanine+magnesium+glycinate+sleep+calm+adhd',
                    cta: 'View combo options →',
                  },
                  {
                    eyebrow: 'Kids ADHD (consult doctor first)',
                    name: 'Magnesium Glycinate — Pediatric Dose',
                    desc: 'Lower-dose options for children. Pediatric dosing should be guided by a clinician — do not use adult doses in children.',
                    query: 'magnesium+glycinate+kids+children+100mg',
                    cta: 'View options →',
                  },
                ].map(({ eyebrow, name, desc, query, cta }) => (
                  <div key={name} className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm">
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">{eyebrow}</p>
                    <p className="font-semibold text-ink">{name}</p>
                    <p className="mt-1 text-xs leading-5 text-[#46574d]">{desc}</p>
                    <a
                      href={`https://www.amazon.com/s?k=${query}&tag=${AFFILIATE_TAGS.amazon}`}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      className="mt-3 inline-flex items-center gap-1 rounded-full bg-brand-950 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-brand-900"
                    >
                      {cta}
                    </a>
                  </div>
                ))}
              </div>
            </div>

            <hr className="border-brand-900/10" />

            <div id="safety">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">Safety Checklist</h2>
              <SafetyNotice title="Magnesium Safety — ADHD Use">
                <ul className="ml-5 space-y-1.5 list-disc">
                  {[
                    ['Upper limit for supplements: 350 mg/day elemental', 'This applies to supplemental magnesium only. Food-derived magnesium is not counted. Do not routinely exceed 350 mg supplemental without medical advice.'],
                    ['Kidney disease: Do not supplement without guidance', 'Magnesium is cleared by the kidneys. Impaired clearance can lead to toxicity. Always consult your nephrologist or GP first.'],
                    ['ADHD medications: No established interaction', 'No known interaction with methylphenidate, amphetamine salts, or atomoxetine. Inform your prescriber you are supplementing.'],
                    ['Children: Get pediatric dosing advice', 'Research in children exists, but adult doses are not appropriate for children. Discuss with a pediatrician before supplementing.'],
                    ['Do not use oxide', 'Magnesium oxide is mainly a laxative and delivers very little bioavailable magnesium. Check your labels carefully.'],
                    ['Drug interactions', 'Magnesium can reduce absorption of some antibiotics, bisphosphonates, and may interact with blood pressure medications. Take 2+ hours apart from these.'],
                  ].map(([bold, text]) => (
                    <li key={bold as string}><strong>{bold as string}.</strong> {text as string}</li>
                  ))}
                </ul>
              </SafetyNotice>
            </div>

            <hr className="border-brand-900/10" />

            <div id="references">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">References</h2>
              <ul className="space-y-2 text-sm leading-6">
                {MAGNESIUM_REFERENCES.map(([label, href]) => (
                  <li key={href}>
                    <a href={href} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-700 hover:underline">
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <hr className="border-brand-900/10" />

            <div id="faq">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {FAQS.map((faq, i) => (
                  <div key={i} className="rounded-[0.75rem] border border-brand-900/10 bg-brand-50/40 p-4">
                    <h3 className="font-semibold text-ink">{faq.question}</h3>
                    <p className="mt-2 text-sm leading-7 text-[#46574d]">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>

            <hr className="border-brand-900/10" />

            <div id="related">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">Related Articles</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ['/articles/magnesium-for-adhd', 'ADHD Cluster', 'Magnesium for ADHD', 'Full evidence review.'],
                  ['/articles/best-supplements-for-adhd', 'Cornerstone', 'Best Supplements for ADHD', 'Evidence-ranked guide.'],
                  ['/articles/magnesium-glycinate-vs-citrate-for-adhd', 'ADHD Cluster', 'Glycinate vs Citrate for ADHD', 'Form comparison.'],
                  ['/articles/l-theanine-magnesium-adhd-stack', 'Stack Guide', 'L-Theanine + Magnesium Stack', 'How to combine the two.'],
                  ['/articles/sleep-and-adhd', 'Sleep + ADHD', 'Sleep and ADHD', 'Why sleep is critical in ADHD.'],
                  ['/articles/adhd-stack-guide', 'ADHD Cluster', 'ADHD Stack Guide', 'Full supplement stacking guide.'],
                ].map(([href, eyebrow, label, desc]) => (
                  <Link key={href as string} href={href as string}
                    className="group rounded-[0.75rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/30">
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">{eyebrow}</p>
                    <p className="font-semibold text-ink transition group-hover:text-brand-700">{label}</p>
                    <p className="mt-1 text-xs text-muted">{desc}</p>
                  </Link>
                ))}
              </div>
            </div>

          </section>

          <EmailCapture
            headline="Get the ADHD supplement checklist"
            description="Evidence-first supplement updates, buying guides, and ADHD research notes."
            ctaLabel="Get Checklist"
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
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">In this article</p>
            <nav className="mt-3 space-y-1.5" aria-label="Article sections">
              {[
                ['#how-magnesium-works', 'Why Magnesium?'],
                ['#form-rankings', 'Form Rankings'],
                ['#label-guide', 'Reading Labels'],
                ['#products', 'Product Picks'],
                ['#safety', 'Safety Checklist'],
                ['#faq', 'FAQ'],
              ].map(([href, label]) => (
                <a key={href} href={href as string}
                  className="block text-sm text-brand-700 hover:text-brand-800 hover:underline">
                  {label}
                </a>
              ))}
            </nav>
          </div>
          <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">ADHD cluster</p>
            <div className="mt-3 space-y-2">
              {[
                ['/articles/best-supplements-for-adhd', 'Best supplements for ADHD →'],
                ['/articles/magnesium-for-adhd', 'Magnesium for ADHD →'],
                ['/articles/l-theanine-magnesium-adhd-stack', 'L-Theanine + Magnesium Stack →'],
                ['/articles/adhd-stack-guide', 'ADHD stack guide →'],
                ['/goals/focus', 'Focus goal hub →'],
              ].map(([href, label]) => (
                <Link key={href as string} href={href as string}
                  className="block text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline">
                  {label}
                </Link>
              ))}
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
