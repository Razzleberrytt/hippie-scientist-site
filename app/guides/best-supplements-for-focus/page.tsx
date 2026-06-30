import type { Metadata } from 'next'
import Link from 'next/link'
import StructuredData from '@/components/StructuredData'
import { SITE_URL } from '@/lib/navigation-config'
import { ArticleLayout, TableOfContents } from '@/components/articles'
import type { Heading } from '@/components/articles'
import { getRevenueProductSet } from '@/config/revenue-products'
import RecommendationSection from '@/components/RecommendationSection'

const PAGE_URL = `${SITE_URL}/guides/best-supplements-for-focus`

export const metadata: Metadata = {
  title: 'Best Supplements for Focus — Evidence-Based Guide',
  description:
    'Evidence-graded guide to the best supplements for focus: L-theanine, citicoline, bacopa, rhodiola, creatine, and magnesium. Mechanisms, dosing, safety, and practical stacking guide.',
  alternates: { canonical: '/guides/best-supplements-for-focus/' },
  openGraph: {
    title: 'Best Supplements for Focus — Evidence-Based Guide',
    description:
      'Which supplements improve focus? L-theanine, citicoline, bacopa, rhodiola, creatine — evidence-graded with dosing, safety, and stacking recommendations.',
    url: '/guides/best-supplements-for-focus/',
    type: 'article',
    images: ['/og-default.jpg'],
  },
}

const FOCUS_SUPPLEMENTS = [
  {
    name: 'L-Theanine + Caffeine',
    mechanism: 'L-theanine modulates alpha brain waves and inhibitory neurotransmitters while caffeine promotes dopamine/noradrenaline-mediated alertness. Together: improved focus, reaction time, and accuracy with less jitteriness than caffeine alone.',
    evidence: 'B–A — one of the most replicated nootropic combinations in the literature; consistent across crossover RCTs',
    dose: 'L-Theanine 100–200 mg + Caffeine 50–100 mg (2:1 ratio); taken together 30–60 min before task',
    safety: 'Excellent; scale caffeine to tolerance',
    bestFor: 'Immediate, on-demand focus; study/work sessions; reducing caffeine side effects',
    href: '/compounds/l-theanine',
    badge: 'Strong',
  },
  {
    name: 'Citicoline (CDP-Choline)',
    mechanism: 'Precursor to both acetylcholine and phosphatidylcholine; increases brain choline availability and upregulates dopamine receptors; neuroprotective; supports neuronal membrane integrity',
    evidence: 'B — RCTs in ADHD populations and older adults; positive signals in healthy young adults; builds over weeks',
    dose: '250–500 mg once or twice daily; best taken in the morning',
    safety: 'Excellent; minor GI effects at high doses; possible insomnia late in day',
    bestFor: 'Sustained attention; choline-deficient individuals; cognitive support building over weeks',
    href: '/compounds/cdp-choline',
    badge: 'Moderate',
  },
  {
    name: 'Bacopa Monnieri',
    mechanism: 'Bacosides modulate synaptic signal transduction; reduce anxiety (anxiolytic effect that clears mental interference); increase serotonin and acetylcholine; slow-build neuroplasticity effects',
    evidence: 'B — multiple RCTs showing improvements in memory consolidation and information processing speed; requires patience (8–12 weeks)',
    dose: '300–450 mg standardized extract (55% bacosides) with fatty meal; daily for 8–12 weeks minimum',
    safety: 'Well-tolerated; GI upset (always take with food); mild sedation in early weeks',
    bestFor: 'Memory and learning; cognitive endurance; long-term study periods',
    href: '/herbs/bacopa',
    badge: 'Moderate',
  },
  {
    name: 'Rhodiola Rosea',
    mechanism: 'Salidroside and rosavins reduce stress-induced fatigue; modulate dopamine and serotonin; anti-fatigue enzymes in mitochondria; AMPK activation',
    evidence: 'B — best evidence in stressed/fatigued populations; moderate evidence in healthy adults; acute and sustained effects',
    dose: '200–400 mg (≥3% rosavins, ≥1% salidroside) in the morning',
    safety: 'Well-tolerated; activating — avoid late dosing; some GI sensitivity',
    bestFor: 'Stress-impaired focus; mental fatigue; high-demand performance periods',
    href: '/herbs/rhodiola',
    badge: 'Moderate',
  },
  {
    name: 'Creatine Monohydrate',
    mechanism: 'Replenishes phosphocreatine in the brain (not just muscle); supports ATP synthesis under cognitive load; most consistent cognitive effects in sleep-deprived or vegetarian populations',
    evidence: 'B — meta-analyses show significant cognitive benefits, particularly memory and processing speed; effects smaller in well-nourished non-vegetarians',
    dose: '3–5 g/day; no loading phase needed for cognitive benefit; effects build over 4 weeks',
    safety: 'Excellent long-term safety record; mild GI effects in some; ensure adequate hydration',
    bestFor: 'Cognitive endurance under load; sleep deprivation; vegetarians/vegans (larger benefit)',
    href: '/compounds/creatine',
    badge: 'Moderate',
  },
  {
    name: 'Magnesium L-Threonate',
    mechanism: 'Crosses the blood-brain barrier more efficiently than other magnesium forms; increases synaptic density and NMDA receptor function; reduces anxiety-driven cognitive interference',
    evidence: 'C–B — compelling animal data on synapse density; limited human RCTs specifically for cognitive focus; more evidence for anxiety reduction improving secondary focus',
    dose: '1500–2000 mg Magtein® (providing ~144 mg elemental Mg) daily, often split doses',
    safety: 'Well-tolerated; expensive relative to glycinate; use glycinate for sleep/relaxation (cheaper)',
    bestFor: 'Cognitive optimization; anxiety-impaired focus; brain-specific magnesium support',
    href: '/compounds/magnesium-threonate',
    badge: 'Emerging–Moderate',
  },
]

const HEADINGS: Heading[] = [
  { id: 'root-cause', text: 'Choose by root cause', level: 2 },
  { id: 'profiles', text: 'Supplement profiles', level: 2 },
]

export default function BestSupplementsForFocusPage() {
  const lTheanineProducts = getRevenueProductSet('l-theanine')
  const toc = <TableOfContents headings={HEADINGS} />
  return (
    <>
      <StructuredData
        pageUrl={PAGE_URL}
        headline="Best Supplements for Focus — Evidence-Based Guide"
        description="Evidence-graded guide to the best supplements for focus including L-theanine+caffeine, citicoline, bacopa, rhodiola, creatine, and magnesium L-threonate. Mechanisms, dosing, safety, and stacking."
        datePublished="2026-06-16"
        dateModified="2026-06-16"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Guides', href: '/guides' },
          { label: 'Best Supplements for Focus', href: '/guides/best-supplements-for-focus' },
        ]}
      />

      <ArticleLayout toc={toc} zone="supplement">
      <div className="space-y-14">

        <section className="rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-10">
          <p className="eyebrow-label">Focus supplements guide</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Best Supplements for Focus
          </h1>
          <p className="mt-4 text-sm leading-7 text-muted sm:text-base">
            There is a meaningful difference between supplements that improve focus by reducing
            anxiety-driven interference (L-theanine, rhodiola, bacopa), and those that directly
            enhance neurotransmitter systems involved in attention (citicoline, caffeine). Understanding
            which category you need determines which supplement will actually help.
          </p>
        </section>

        {/* Fastest useful choice */}
        <section className="rounded-[1.65rem] border border-brand-700/20 bg-brand-50/60 p-6 shadow-sm">
          <p className="eyebrow-label">Fastest useful choice</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-ink">If you only try one thing: L-theanine + caffeine</h2>
          <p className="mt-3 text-sm leading-7 text-muted sm:text-base">
            <strong>The fastest useful choice for most people is L-theanine 100–200 mg paired with caffeine 50–100 mg (2:1 ratio)</strong>,
            taken 30–60 minutes before a focus session. L-theanine is the most consistently studied
            nootropic for reducing anxiety-driven mental noise without sedation; caffeine provides
            direct alerting. Together they blunt the jitters of caffeine alone. See the{' '}
            <Link href="/articles/l-theanine" className="font-semibold text-brand-700 hover:underline">
              full L-theanine guide
            </Link>{' '}
            for dosing, mechanisms, and stacking notes.
          </p>
        </section>

        {/* Decision table */}
        <section id="root-cause" className="scroll-mt-20 space-y-4">
          <p className="eyebrow-label">What's blocking your focus?</p>
          <h2 className="text-2xl font-semibold tracking-tight text-ink">Choose by root cause</h2>
          <div className="overflow-x-auto rounded-[1.65rem] border border-brand-900/10 bg-white shadow-sm">
            <table className="min-w-[600px] w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-brand-900/10 bg-brand-50/50">
                  <th className="text-left p-4 font-semibold text-ink">Root cause</th>
                  <th className="text-left p-4 font-semibold text-ink">Best supplement(s)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-900/10">
                {[
                  { cause: 'Need focus now, quickly', supp: 'L-Theanine + Caffeine (30–60 min onset)' },
                  { cause: 'Stress / anxiety clouding thinking', supp: 'L-Theanine, Rhodiola, Bacopa (long-term)' },
                  { cause: 'Mental fatigue / brain fog', supp: 'Rhodiola, Creatine, Citicoline' },
                  { cause: 'Memory + learning support', supp: 'Bacopa (8–12 weeks minimum)' },
                  { cause: 'Vegetarian/vegan cognitive gap', supp: 'Creatine + Citicoline (choline source)' },
                  { cause: 'Anxiety-impaired focus', supp: 'Magnesium L-Threonate + L-Theanine' },
                ].map((row) => (
                  <tr key={row.cause}>
                    <td className="p-4 font-medium text-ink">{row.cause}</td>
                    <td className="p-4 text-brand-700 font-medium">{row.supp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Profiles */}
        <section id="profiles" className="scroll-mt-20 space-y-6">
          <div>
            <p className="eyebrow-label">Evidence profiles</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-ink">Supplement profiles</h2>
          </div>
          <div className="space-y-5">
            {FOCUS_SUPPLEMENTS.map((s) => (
              <div key={s.name} className="rounded-[1.65rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <Link href={s.href} className="text-xl font-semibold text-brand-800 hover:underline">{s.name}</Link>
                  <span className="rounded-full bg-brand-50 px-3 py-0.5 text-xs font-semibold text-brand-800">{s.badge}</span>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 text-sm">
                  <div><p className="font-semibold text-ink">Mechanism</p><p className="mt-0.5 text-muted">{s.mechanism}</p></div>
                  <div><p className="font-semibold text-ink">Best for</p><p className="mt-0.5 text-muted">{s.bestFor}</p></div>
                  <div><p className="font-semibold text-ink">Evidence</p><p className="mt-0.5 text-muted">{s.evidence}</p></div>
                  <div><p className="font-semibold text-ink">Typical dose</p><p className="mt-0.5 text-muted">{s.dose}</p></div>
                  <div className="sm:col-span-2"><p className="font-semibold text-ink">Safety</p><p className="mt-0.5 text-muted">{s.safety}</p></div>
                </div>
                <Link href={s.href} className="mt-4 inline-block text-xs font-semibold text-brand-700 hover:underline">Full profile →</Link>
              </div>
            ))}
          </div>
        </section>

        {/* Safety */}
        <section className="rounded-[1.65rem] border border-amber-200 bg-amber-50/70 p-6 shadow-sm">
          <p className="eyebrow-label">Safety &amp; medication notes</p>
          <h2 className="mt-2 text-xl font-semibold text-amber-900">Before you start</h2>
          <ul className="mt-3 space-y-2 text-sm text-amber-900">
            <li>• <strong>Pregnancy &amp; breastfeeding:</strong> safety data is limited for most nootropics — bacopa, rhodiola, and high-dose magnesium L-threonate are best avoided without clinician guidance.</li>
            <li>• <strong>Medications:</strong> rhodiola may interact with antidepressants (SSRIs/MAOIs) and can trigger agitation in bipolar disorder; clear stimulant or caffeine combinations with your prescriber.</li>
            <li>• <strong>Kidney disease:</strong> the kidneys clear magnesium — confirm dosing with a clinician before supplementing.</li>
            <li>• Introduce one supplement at a time so you can tell what is working. These support focus; they are not a substitute for sleep, ADHD evaluation, or medical care.</li>
          </ul>
        </section>

        {lTheanineProducts && (
          <RecommendationSection products={lTheanineProducts.products} />
        )}

        {/* Related */}
        <nav className="flex flex-wrap gap-4 text-sm font-semibold text-brand-700">
          <Link href="/guides/best-nootropics-for-focus" className="hover:text-brand-800">Best Nootropics for Focus →</Link>
          <Link href="/guides/focus-without-caffeine-crash" className="hover:text-brand-800">Focus Without the Caffeine Crash →</Link>
          <Link href="/guides/supplements-for-brain-fog-and-fatigue" className="hover:text-brand-800">Brain Fog & Fatigue →</Link>
          <Link href="/compare/caffeine-vs-l-theanine-vs-bacopa-for-focus" className="hover:text-brand-800">Caffeine vs L-Theanine vs Bacopa →</Link>
          <Link href="/articles/ashwagandha" className="hover:text-brand-800">Ashwagandha Article →</Link>
          <Link href="/articles/l-theanine" className="hover:text-brand-800">L-Theanine Article →</Link>
          <Link href="/goals/focus" className="hover:text-brand-800">Focus Goal Hub →</Link>
          <Link href="/guides/" className="hover:text-brand-800">All Guides →</Link>
        </nav>
      </div>
      </ArticleLayout>
    </>
  )
}
