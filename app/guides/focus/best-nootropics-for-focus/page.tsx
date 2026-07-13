import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import StructuredData from '@/components/StructuredData'
import { SITE_URL } from '@/lib/navigation-config'
import { ArticleLayout, TableOfContents } from '@/components/articles'
import type { Heading } from '@/components/articles'
import { getRevenueProductSet } from '@/config/revenue-products'
import RecommendationSection from '@/components/RecommendationSection'
import AffiliateDisclosure from '@/components/AffiliateDisclosure'
import EmailCapture from '@/components/EmailCapture'
import References from '@/components/References'

const PAGE_URL = `${SITE_URL}/guides/focus/best-nootropics-for-focus`

export const metadata: Metadata = {
  title: 'Best Nootropics for Focus — Evidence-Based Guide (2026)',
  description:
    'Evidence-graded guide to the best nootropics for focus: L-theanine + caffeine, citicoline, bacopa, lion\'s mane, rhodiola, and phosphatidylserine. Mechanisms, dosing, safety, and stacking notes.',
  alternates: { canonical: '/guides/focus/best-nootropics-for-focus/' },
  openGraph: {
    title: 'Best Nootropics for Focus — Evidence-Based Guide (2026)',
    description:
      'Which nootropics actually improve focus? Evidence-graded review of L-theanine + caffeine, citicoline, bacopa monnieri, lion\'s mane, rhodiola, and more.',
    url: '/guides/focus/best-nootropics-for-focus/',
    type: 'article',
    images: ['/og-default.jpg'],
  },
}

const FOCUS_NOOTROPICS = [
  {
    name: 'L-Theanine + Caffeine',
    mechanism: 'L-theanine buffers caffeine\'s jittery alpha-adrenergic stimulation while preserving dopamine/noradrenaline-mediated focus. Together they improve sustained attention, reaction time, and working memory better than either alone.',
    evidence: 'B–A — multiple crossover RCTs; one of the best-studied nootropic combinations with consistent replication',
    dose: 'L-theanine 100–200 mg + caffeine 50–100 mg; ratio ~2:1 theanine:caffeine; taken together before focus session',
    safety: 'Very safe; caffeine sensitivity varies; avoid in afternoon if sleep-sensitive',
    bestFor: 'Immediate focus boost; reducing jitteriness from caffeine; daily use without tolerance concern for theanine',
    href: '/compounds/l-theanine',
    badge: 'Strong',
    timeframe: 'Acute (30–60 min onset)',
  },
  {
    name: 'Citicoline (CDP-Choline)',
    mechanism: 'Precursor to acetylcholine and phosphatidylcholine; increases brain choline availability; upregulates dopamine receptors; neuroprotective',
    evidence: 'B — RCTs in older adults and ADHD populations; positive effects on attention and memory; emerging data in healthy adults',
    dose: '250–500 mg once or twice daily; effects build over 2–4 weeks',
    safety: 'Excellent safety profile; minor GI effects at high doses; potential insomnia if taken late',
    bestFor: 'Sustained cognitive support; choline-deficient individuals; longer-term cognitive enhancement',
    href: '/compounds/cdp-choline',
    badge: 'Moderate',
    timeframe: '2–4 weeks for full benefit',
  },
  {
    name: 'Bacopa Monnieri',
    mechanism: 'Bacosides enhance synaptic signal transduction; reduce anxiety (anxiolytic); increase serotonin and acetylcholine; adaptogenic stress buffering',
    evidence: 'B — multiple RCTs show benefits for memory consolidation and processing speed; effects emerge slowly',
    dose: '300–450 mg standardized extract (55% bacosides) with fat; effects take 8–12 weeks',
    safety: 'Well-tolerated; GI upset (take with food); reversible within washout; slight sedation early',
    bestFor: 'Memory and learning; stress + cognitive performance overlap; long-term cognitive strategy',
    href: '/herbs/bacopa',
    badge: 'Moderate',
    timeframe: '8–12 weeks',
  },
  {
    name: "Lion's Mane (Hericium erinaceus)",
    mechanism: 'Hericenones and erinacines stimulate NGF (Nerve Growth Factor) synthesis; potential neurogenesis support; reduces amyloid aggregation in preclinical models',
    evidence: 'C–B — promising but small human RCTs; most compelling data in MCI and older adults; limited data in healthy young adults',
    dose: '500–1000 mg fruiting body extract (≥30% polysaccharides) once or twice daily',
    safety: 'Very safe; rare allergic reactions in mushroom-allergic individuals',
    bestFor: 'Long-term neuroprotection and neuroplasticity; cognitive maintenance; older adults',
    href: '/herbs/hericium-erinaceus',
    badge: 'Emerging–Moderate',
    timeframe: '4–12 weeks',
  },
  {
    name: 'Rhodiola Rosea',
    mechanism: 'Salidroside and rosavins activate AMPK, modulate serotonin/dopamine; adaptogenic anti-fatigue; improves cognitive performance under stress',
    evidence: 'B — RCTs show reduced mental fatigue and improved performance under stress; effects on non-stressed populations more modest',
    dose: '200–400 mg (≥3% rosavins, ≥1% salidroside) in the morning or before cognitive tasks',
    safety: 'Well-tolerated; activating (can disrupt sleep); avoid late-day dosing',
    bestFor: 'Stress-impaired focus; fatigue-related cognitive decline; acute cognitive performance before demanding tasks',
    href: '/herbs/rhodiola',
    badge: 'Moderate',
    timeframe: 'Acute + cumulative',
  },
  {
    name: 'Phosphatidylserine (PS)',
    mechanism: 'Structural phospholipid for neuronal membranes; modulates cortisol response; supports acetylcholine synthesis and receptor density',
    evidence: 'B — FDA-qualified health claim for cognitive decline; positive RCTs in older adults; less evidence in healthy young adults',
    dose: '100–300 mg/day (from sunflower or soy lecithin source)',
    safety: 'Well-tolerated; choose sunflower-derived to avoid soy allergens',
    bestFor: 'Age-related cognitive decline; cortisol-driven cognitive impairment; older adults',
    href: '/compounds/phosphatidylserine',
    badge: 'Moderate',
    timeframe: '4–8 weeks',
  },
]

const STACKS = [
  {
    goal: 'Immediate focus + no jitters',
    combo: 'L-Theanine 200 mg + Caffeine 100 mg',
    note: 'The gold standard acute stack. Well-studied, fast-acting, and adaptable to individual caffeine tolerance.',
  },
  {
    goal: 'Stress-impaired focus',
    combo: 'Rhodiola 300 mg (AM) + Bacopa 300 mg (with meal)',
    note: 'Rhodiola buffers acute stress; bacopa builds sustained memory and processing over weeks. Allow 8+ weeks for Bacopa.',
  },
  {
    goal: 'Long-term cognitive support',
    combo: "Citicoline 300 mg + Lion's Mane 500 mg + Bacopa 300 mg",
    note: 'Mechanistically diverse stack targeting acetylcholine, NGF, and synaptic efficiency. Slow-build — commit 12 weeks.',
  },
  {
    goal: 'Focus + memory (daily driver)',
    combo: 'L-Theanine 200 mg + Citicoline 250 mg + Bacopa 300 mg',
    note: 'Practical daily stack: theanine for calm focus, citicoline for choline, bacopa for long-term memory consolidation.',
  },
]

const HEADINGS: Heading[] = [
  { id: 'acute-vs-long-term', text: 'Acute vs long-term nootropics', level: 2 },
  { id: 'profiles', text: 'Nootropic-by-nootropic review', level: 2 },
  { id: 'stacking', text: 'Evidence-informed stacking guide', level: 2 },
]

const BEST_NOOTROPICS_FOR_FOCUS_REFS = [
  { n: 1, text: 'Pase MP, et al. (2012). Bacopa monnieri for cognition. J Altern Complement Med, 18(7): 647-652.', url: 'https://pubmed.ncbi.nlm.nih.gov/22747190/' },
  { n: 2, text: 'Haskell CF, et al. (2008). L-theanine and cognition. Biol Psychol, 77(2): 113-122.', url: 'https://pubmed.ncbi.nlm.nih.gov/18006208/' },
]

export default function BestNootropicsForFocusPage() {
  const toc = <TableOfContents headings={HEADINGS} />
  const lTheanineProducts = getRevenueProductSet('l-theanine')

  return (
    <ArticleLayout toc={toc} zone="supplement">
      <StructuredData
        pageUrl={PAGE_URL}
        headline="Best Nootropics for Focus — Evidence-Based Guide"
        description="Evidence-graded guide to the best nootropics for focus including L-theanine + caffeine, citicoline, bacopa, lion's mane, rhodiola, and phosphatidylserine. Covers mechanisms, dosing, safety, and stacking."
        datePublished="2026-06-16"
        dateModified="2026-06-16"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Guides', href: '/guides' },
          { label: 'Best Nootropics for Focus', href: '/guides/focus/best-nootropics-for-focus' },
        ]}
      />

      <div className="space-y-14">
        <AffiliateDisclosure variant="compact" className="mb-6" />

        {/* Hero */}
        <section className="rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-10">
          <p className="eyebrow-label">Focus nootropics guide</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Best Nootropics for Focus
          </h1>
          <p className="mt-4 text-sm leading-7 text-muted sm:text-base">
            The nootropics market is flooded with overclaimed compounds and proprietary blends. Most
            are either unstudied or studied in populations that don't reflect typical healthy adults.
            This guide covers six nootropics with the strongest evidence basis for focus and cognition
            — with honest assessments of what they do and don't do.
          </p>
          <div className="mt-5 rounded-xl border border-brand-100 bg-brand-50/60 p-4 text-sm text-brand-900">
            <strong>Key principle:</strong> "Nootropic" timescale matters. L-theanine + caffeine works
            in 30 minutes. Bacopa takes 12 weeks. Mixing expectations for different compounds leads
            to perceived failures.
          </div>

        <figure className="mt-6">
          <div className="overflow-hidden rounded-2xl border border-brand-900/10 shadow-sm bg-white">
            <Image
              src="/images/guides/best-nootropics-for-focus.jpg"
              alt="Nootropics for focus including capsules, lion's mane mushroom, and green tea"
              width={1536}
              height={1024}
              priority
              className="w-full h-auto"
            />
          </div>
          <figcaption className="mt-3 text-center text-sm text-muted">
            The best-supported nootropics for focus and attention.
          </figcaption>
        </figure>
        </section>

        {/* Timescale comparison */}
        <section id="acute-vs-long-term" className="scroll-mt-20 space-y-4">
          <p className="eyebrow-label">Timescale matters</p>
          <h2 className="text-2xl font-semibold tracking-tight text-ink">
            Acute vs long-term nootropics
          </h2>
          <div className="overflow-x-auto rounded-[1.65rem] border border-brand-900/10 bg-white shadow-sm">
            <table className="min-w-[500px] w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-brand-900/10 bg-brand-50/50">
                  <th className="text-left p-4 font-semibold text-ink">Nootropic</th>
                  <th className="text-left p-4 font-semibold text-ink">Evidence</th>
                  <th className="text-left p-4 font-semibold text-ink">When effects appear</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-900/10">
                {FOCUS_NOOTROPICS.map((n) => (
                  <tr key={n.name}>
                    <td className="p-4 font-medium text-ink">{n.name}</td>
                    <td className="p-4"><span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-800">{n.badge}</span></td>
                    <td className="p-4 text-muted">{n.timeframe}</td>
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
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-ink">
              Nootropic-by-nootropic review
            </h2>
          </div>
          <div className="space-y-5">
            {FOCUS_NOOTROPICS.map((n) => (
              <div key={n.name} className="rounded-[1.65rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <Link href={n.href} className="text-xl font-semibold text-brand-800 hover:underline">
                    {n.name}
                  </Link>
                  <span className="rounded-full bg-brand-50 px-3 py-0.5 text-xs font-semibold text-brand-800">
                    {n.badge}
                  </span>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 text-sm">
                  <div>
                    <p className="font-semibold text-ink">Mechanism</p>
                    <p className="mt-0.5 text-muted">{n.mechanism}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-ink">Best for</p>
                    <p className="mt-0.5 text-muted">{n.bestFor}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-ink">Evidence</p>
                    <p className="mt-0.5 text-muted">{n.evidence}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-ink">Typical dose</p>
                    <p className="mt-0.5 text-muted">{n.dose}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="font-semibold text-ink">Safety</p>
                    <p className="mt-0.5 text-muted">{n.safety}</p>
                  </div>
                </div>
                <Link href={n.href} className="mt-4 inline-block text-xs font-semibold text-brand-700 hover:underline">
                  Full profile →
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Stacking */}
        <section id="stacking" className="scroll-mt-20 space-y-5">
          <div>
            <p className="eyebrow-label">Combinations</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-ink">
              Evidence-informed stacking guide
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {STACKS.map((s) => (
              <div key={s.goal} className="rounded-2xl border border-brand-900/10 bg-white/90 p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-brand-700">{s.goal}</p>
                <p className="mt-2 text-sm font-semibold text-ink">{s.combo}</p>
                <p className="mt-2 text-xs leading-relaxed text-muted">{s.note}</p>
              </div>
            ))}
          </div>
        </section>

        {lTheanineProducts && (
        <>
          <References refs={BEST_NOOTROPICS_FOR_FOCUS_REFS} />
            <RecommendationSection products={lTheanineProducts.products} />
        </>
        )}

        <EmailCapture location="guides-best-nootropics-for-focus" className="mt-6" />

        {/* Related */}
        <nav className="flex flex-wrap gap-4 text-sm font-semibold text-brand-700">
          <Link href="/guides/focus/" className="hover:text-brand-800">Focus goal hub →</Link>
          <Link href="/guides/focus-without-caffeine-crash/" className="hover:text-brand-800">Focus Without the Caffeine Crash →</Link>
          <Link href="/guides/adhd/adhd-supplements/" className="hover:text-brand-800">ADHD Supplements Hub →</Link>
          <Link href="/guides/supplements-for-brain-fog-and-fatigue/" className="hover:text-brand-800">Brain Fog & Fatigue →</Link>
          <Link href="/guides/compare/caffeine-vs-l-theanine-vs-bacopa-for-focus/" className="hover:text-brand-800">Caffeine vs L-Theanine vs Bacopa →</Link>
          <Link href="/guides/" className="hover:text-brand-800">All Guides →</Link>
        </nav>
      </div>
    </ArticleLayout>
  )
}
