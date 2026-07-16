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
  title: 'Best Nootropics for Focus: Choose by Attention, Fatigue or Memory',
  description:
    'Compare nootropics by the problem you actually want to solve: immediate attention, stress-related fatigue, or longer-term memory support. Evidence, safety, doses, and buying guidance.',
  alternates: { canonical: '/guides/focus/best-nootropics-for-focus/' },
  openGraph: {
    title: 'Best Nootropics for Focus: Choose by Attention, Fatigue or Memory',
    description:
      'A practical evidence-based guide to choosing nootropics for immediate attention, stress-related fatigue, or longer-term memory support.',
    url: '/guides/focus/best-nootropics-for-focus/',
    type: 'article',
    images: ['/og-default.jpg'],
  },
}

const FOCUS_NOOTROPICS = [
  {
    name: 'L-Theanine + Caffeine',
    mechanism: 'Caffeine increases alertness while L-theanine may reduce some caffeine-related tension and support attention during demanding tasks.',
    evidence: 'Moderate — several small crossover trials support short-term attention and reaction-time benefits, but results and doses vary',
    dose: 'A conservative starting point is L-theanine 100–200 mg with caffeine 25–50 mg; adjust only after assessing sensitivity',
    safety: 'Caffeine can worsen anxiety, palpitations, blood pressure, and sleep. Avoid treating the combination as automatically safe because it is widely sold.',
    bestFor: 'Short-term alertness and attention when caffeine is already tolerated',
    href: '/compounds/l-theanine',
    badge: 'Best acute evidence',
    timeframe: 'Acute (about 30–60 minutes)',
  },
  {
    name: 'Citicoline (CDP-Choline)',
    mechanism: 'Provides choline used in phospholipid and acetylcholine pathways; human evidence is stronger in older or clinically studied populations than in healthy young adults.',
    evidence: 'Limited–moderate — some attention and memory findings, but broad “cognitive enhancement” claims outrun the healthy-adult evidence',
    dose: 'Common supplemental doses are 250–500 mg daily; use the lowest practical dose and reassess rather than automatically escalating',
    safety: 'Usually well tolerated, but headache, GI symptoms, restlessness, and insomnia can occur. Medication interactions still deserve review.',
    bestFor: 'A cautious trial when longer-term attention or memory support is the goal—not an immediate stimulant-like effect',
    href: '/compounds/cdp-choline',
    badge: 'Conditional',
    timeframe: 'Days to weeks',
  },
  {
    name: 'Bacopa Monnieri',
    mechanism: 'Bacopa is studied mainly for memory acquisition and recall over repeated use, not as a same-day focus booster.',
    evidence: 'Moderate for selected memory outcomes after sustained use; much weaker as a direct treatment for everyday inattention',
    dose: 'Use a standardized extract that states bacoside content; trial doses vary, and benefits are generally assessed over 8–12 weeks',
    safety: 'GI upset is common enough to matter, and some people report fatigue or sedation. Review thyroid, cholinergic, and medication concerns before use.',
    bestFor: 'Longer-term memory and learning goals when delayed onset is acceptable',
    href: '/herbs/bacopa',
    badge: 'Memory—not acute focus',
    timeframe: 'Usually 8–12 weeks',
  },
  {
    name: "Lion's Mane (Hericium erinaceus)",
    mechanism: 'Preclinical work is interesting, but human studies are small and mostly address mood or cognition in selected populations.',
    evidence: 'Emerging — not enough evidence to rank it as a reliable focus enhancer for healthy adults',
    dose: 'Products vary widely by fruiting body, mycelium, extraction method, and beta-glucan testing, so label quality matters more than a universal dose',
    safety: 'Avoid with mushroom allergy; stop for allergic symptoms or unexpected respiratory or skin reactions. Long-term extract data remain limited.',
    bestFor: 'People comfortable with an experimental, slow-build option rather than a proven attention aid',
    href: '/herbs/hericium-erinaceus',
    badge: 'Emerging',
    timeframe: 'Weeks, if any benefit occurs',
  },
  {
    name: 'Rhodiola Rosea',
    mechanism: 'Rhodiola may reduce perceived fatigue and support performance under stress, which can indirectly improve concentration.',
    evidence: 'Limited–moderate — more convincing for stress-related fatigue than for improving baseline attention in rested adults',
    dose: 'Trials commonly use standardized extracts in the morning; product standardization and individual stimulation response matter',
    safety: 'Can feel activating and may worsen agitation or sleep. Review psychiatric medications and bipolar-spectrum risk with a clinician.',
    bestFor: 'Focus that breaks down mainly during fatigue, burnout, or acute stress',
    href: '/herbs/rhodiola',
    badge: 'Best for fatigue pattern',
    timeframe: 'Hours to weeks',
  },
  {
    name: 'Phosphatidylserine (PS)',
    mechanism: 'A membrane phospholipid studied mainly in age-related cognitive concerns and stress-response research.',
    evidence: 'Limited–moderate in selected older-adult or stress contexts; sparse evidence for noticeable focus gains in healthy young adults',
    dose: 'Common research doses fall around 100–300 mg daily, but product source and indication should guide any trial',
    safety: 'Usually tolerated; GI effects and insomnia can occur. Check source allergens and medication compatibility.',
    bestFor: 'Older adults or stress-related cognitive complaints—not a first-line acute focus supplement',
    href: '/compounds/phosphatidylserine',
    badge: 'Population-specific',
    timeframe: 'Several weeks',
  },
]

const HEADINGS: Heading[] = [
  { id: 'choose-by-problem', text: 'Choose by the real problem', level: 2 },
  { id: 'profiles', text: 'Nootropic-by-nootropic review', level: 2 },
  { id: 'trial-one-at-a-time', text: 'How to test one safely', level: 2 },
  { id: 'buyer-checklist', text: 'Buyer checklist', level: 2 },
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
        headline="Best Nootropics for Focus: Choose by Attention, Fatigue or Memory"
        description="Evidence-based guide to choosing nootropics for immediate attention, stress-related fatigue, or longer-term memory support, with safety and buying guidance."
        datePublished="2026-06-16"
        dateModified="2026-07-16"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Guides', href: '/guides' },
          { label: 'Best Nootropics for Focus', href: '/guides/focus/best-nootropics-for-focus' },
        ]}
      />

      <div className="space-y-14">
        <AffiliateDisclosure variant="compact" className="mb-6" />

        <section className="rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-10">
          <p className="eyebrow-label">Focus nootropics guide</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Best Nootropics for Focus
          </h1>
          <p className="mt-4 text-sm leading-7 text-muted sm:text-base">
            The best option depends on what “focus” means in your case. Short-term alertness, stress-related
            mental fatigue, and long-term memory are different targets, and no supplement reliably fixes all
            three. Start by identifying the bottleneck, then test one ingredient at a time.
          </p>
          <div className="mt-5 rounded-xl border border-brand-100 bg-brand-50/60 p-4 text-sm text-brand-900">
            <strong>Quick answer:</strong> L-theanine with a small, already-tolerated caffeine dose has the
            clearest short-term attention evidence. Rhodiola is more relevant when stress and fatigue are the
            main problem. Bacopa is a slow memory option—not a same-day focus booster. Lion&apos;s mane,
            citicoline, and phosphatidylserine are more conditional than marketing usually suggests.
          </div>

          <figure className="mt-6">
            <div className="overflow-hidden rounded-2xl border border-brand-900/10 bg-white shadow-sm">
              <Image
                src="/images/guides/best-nootropics-for-focus.jpg"
                alt="Nootropics for focus including capsules, lion's mane mushroom, and green tea"
                width={1536}
                height={1024}
                priority
                className="h-auto w-full"
              />
            </div>
            <figcaption className="mt-3 text-center text-sm text-muted">
              Match the ingredient to the actual attention, fatigue, or memory problem.
            </figcaption>
          </figure>
        </section>

        <section id="choose-by-problem" className="scroll-mt-20 space-y-4">
          <p className="eyebrow-label">Decision framework</p>
          <h2 className="text-2xl font-semibold tracking-tight text-ink">Choose by the real problem</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                problem: 'I need short-term alertness',
                answer: 'Consider a low caffeine dose, optionally paired with L-theanine, only if caffeine is already well tolerated.',
              },
              {
                problem: 'Stress or fatigue destroys my concentration',
                answer: 'Rhodiola may be more relevant than memory-oriented supplements, but sleep debt and burnout still come first.',
              },
              {
                problem: 'I want better memory over months',
                answer: 'Bacopa is the clearest slow-build candidate here, with GI and sedation tradeoffs.',
              },
              {
                problem: 'My focus problems are persistent or severe',
                answer: 'Do not use a supplement stack to delay assessment for sleep disorders, anxiety, depression, ADHD, medication effects, or medical causes.',
              },
            ].map((item) => (
              <div key={item.problem} className="rounded-2xl border border-brand-900/10 bg-white/90 p-5 shadow-sm">
                <p className="text-sm font-semibold text-ink">{item.problem}</p>
                <p className="mt-2 text-sm leading-6 text-muted">{item.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="profiles" className="scroll-mt-20 space-y-6">
          <div>
            <p className="eyebrow-label">Evidence profiles</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-ink">
              Nootropic-by-nootropic review
            </h2>
          </div>

          <div className="overflow-x-auto rounded-[1.65rem] border border-brand-900/10 bg-white shadow-sm">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-brand-900/10 bg-brand-50/50">
                  <th className="p-4 text-left font-semibold text-ink">Nootropic</th>
                  <th className="p-4 text-left font-semibold text-ink">Best-fit target</th>
                  <th className="p-4 text-left font-semibold text-ink">Expected timescale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-900/10">
                {FOCUS_NOOTROPICS.map((n) => (
                  <tr key={n.name}>
                    <td className="p-4 font-medium text-ink">{n.name}</td>
                    <td className="p-4 text-muted">{n.badge}</td>
                    <td className="p-4 text-muted">{n.timeframe}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
                <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  <div><p className="font-semibold text-ink">What it may do</p><p className="mt-0.5 text-muted">{n.mechanism}</p></div>
                  <div><p className="font-semibold text-ink">Best for</p><p className="mt-0.5 text-muted">{n.bestFor}</p></div>
                  <div><p className="font-semibold text-ink">Evidence</p><p className="mt-0.5 text-muted">{n.evidence}</p></div>
                  <div><p className="font-semibold text-ink">Typical trial approach</p><p className="mt-0.5 text-muted">{n.dose}</p></div>
                  <div className="sm:col-span-2"><p className="font-semibold text-ink">Safety</p><p className="mt-0.5 text-muted">{n.safety}</p></div>
                </div>
                <Link href={n.href} className="mt-4 inline-block text-xs font-semibold text-brand-700 hover:underline">
                  Full profile →
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section id="trial-one-at-a-time" className="scroll-mt-20 space-y-4">
          <p className="eyebrow-label">Avoid stack confusion</p>
          <h2 className="text-2xl font-semibold tracking-tight text-ink">How to test one safely</h2>
          <div className="rounded-[1.65rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm">
            <ol className="space-y-3 text-sm leading-6 text-muted">
              <li><strong className="text-ink">1. Define one outcome.</strong> Pick attention span, fatigue, or memory—not a vague goal of “better cognition.”</li>
              <li><strong className="text-ink">2. Start with one ingredient.</strong> Multi-product stacks make benefits, side effects, and interactions impossible to attribute.</li>
              <li><strong className="text-ink">3. Use a realistic timeframe.</strong> Do not judge bacopa after three days or keep taking an acute stimulant combination for months without reassessment.</li>
              <li><strong className="text-ink">4. Track sleep and anxiety.</strong> A product that improves alertness while damaging sleep can worsen overall focus.</li>
              <li><strong className="text-ink">5. Stop for adverse effects.</strong> Palpitations, agitation, allergic symptoms, severe GI effects, or meaningful mood changes are not signs to “push through.”</li>
            </ol>
          </div>
        </section>

        <section id="buyer-checklist" className="scroll-mt-20 space-y-4">
          <p className="eyebrow-label">Before product picks</p>
          <h2 className="text-2xl font-semibold tracking-tight text-ink">Buyer checklist</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              'Prefer a clearly disclosed single-ingredient dose over a proprietary blend.',
              'Look for independent identity and contaminant testing—not only “made in a GMP facility.”',
              'Check the active standardization that matches the research, such as bacosides for bacopa.',
              'Avoid products that combine stimulants, herbs, and choline sources before you know how each affects you.',
              'Compare serving size and active amount; a large capsule count does not equal a meaningful dose.',
              'Review medications, pregnancy, cardiovascular risk, mood history, and sleep problems before buying.',
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-brand-900/10 bg-white/90 p-5 text-sm leading-6 text-muted shadow-sm">
                {item}
              </div>
            ))}
          </div>
        </section>

        <References refs={BEST_NOOTROPICS_FOR_FOCUS_REFS} />

        {lTheanineProducts && (
          <RecommendationSection products={lTheanineProducts.products} />
        )}

        <EmailCapture location="guides-best-nootropics-for-focus" className="mt-6" />

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
