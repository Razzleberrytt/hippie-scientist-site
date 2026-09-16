import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL, buildTwitterMetadata } from '@/lib/seo'

import References from '@/components/References'
import SchemaGraphScript from '@/components/seo/SchemaGraphScript'
import { HubSectionHeading } from '@/components/guides/HubSectionHeading'
import { DecisionRouter, type IntentRoute } from '@/components/guides/DecisionRouter'
import { GuideCardGrid, type GuideCard } from '@/components/guides/GuideCardGrid'
import { buildGuideHubSchemaGraph } from '../../../lib/schema-graph'

export const metadata: Metadata = {
  title: 'ADHD Supplements: Evidence, Sleep, Deficiencies & Safety',
  description: 'Review human evidence for ADHD supplements, nutrient deficiencies, sleep problems, and medication context. Separate promising signals from uncertain claims and know when testing or clinical evaluation matters.',
  alternates: { canonical: `${SITE_URL}/guides/adhd/` },
  openGraph: {
    title: 'ADHD Supplement Guides & Research',
    description: 'Human evidence for ADHD supplements, nutrient deficiencies, sleep problems, and medication safety — with clear limits on what the research can show.',
    url: `${SITE_URL}/guides/adhd/`,
    type: 'website',
    images: ['/og-default.jpg'],
  },
  twitter: buildTwitterMetadata({
    title: 'ADHD Supplement Guides & Research',
    description: 'Human evidence for ADHD supplements, nutrient deficiencies, sleep problems, and medication safety — with clear limits on what the research can show.',
  }),
}

const GUIDES = [
  { slug: 'best-supplements-for-adhd', title: 'Best Supplements for ADHD', desc: 'Evidence-graded review of supplements studied for ADHD-related outcomes, including where evidence is limited or indirect.' },
  { slug: 'adhd-stack-guide', title: 'ADHD Stack Guide', desc: 'A safety-first framework for combining supplements, with timing, overlap, and uncertainty made explicit.' },
  { slug: 'best-magnesium-supplement-for-adhd', title: 'Best Magnesium for ADHD', desc: 'Compare magnesium forms by practical use, tolerability, and the limits of ADHD-specific evidence.' },
  { slug: 'adhd-supplements', title: 'ADHD Supplements Overview', desc: 'A broad map of supplements studied for attention, executive function, sleep, or common nutrient gaps.' },
  { slug: 'magnesium-for-adhd', title: 'Magnesium for ADHD', desc: 'What human research does — and does not — show about magnesium status, supplementation, and ADHD.' },
  { slug: 'omega-3-and-adhd', title: 'Omega-3 and ADHD', desc: 'EPA and DHA evidence for ADHD symptoms, including effect-size and formulation considerations.' },
  { slug: 'l-theanine-for-adhd', title: 'L-Theanine for ADHD', desc: 'ADHD-specific and adjacent evidence for attention, stress, and sleep without presenting it as established treatment.' },
  { slug: 'saffron-for-adhd', title: 'Saffron for ADHD', desc: 'What the small clinical literature supports — and what it does not establish — for ADHD symptoms.' },
  { slug: 'iron-ferritin-and-adhd', title: 'Iron, Ferritin, and ADHD', desc: 'How low iron stores can overlap with ADHD-related concerns, when testing matters, and why blind supplementation is risky.' },
  { slug: 'zinc-and-adhd', title: 'Zinc and ADHD', desc: 'Human evidence on zinc status and ADHD, with emphasis on deficiency context rather than universal supplementation.' },
  { slug: 'vitamin-d-and-adhd', title: 'Vitamin D and ADHD', desc: 'Associations, intervention evidence, deficiency context, and the difference between correlation and treatment effect.' },
  { slug: 'citicoline-for-adhd', title: 'Citicoline for ADHD', desc: 'Evidence for attention and cognition, separated from claims that it treats ADHD itself.' },
  { slug: 'alpha-gpc-and-adhd', title: 'Alpha-GPC and ADHD', desc: 'What is known about Alpha-GPC for cognition, and how little ADHD-specific evidence currently exists.' },
  { slug: 'citicoline-vs-alpha-gpc', title: 'Citicoline vs Alpha-GPC', desc: 'Compare two choline sources by evidence base, practical differences, and uncertainty rather than assuming one is superior.' },
  { slug: 'ashwagandha-for-adhd', title: 'Ashwagandha for ADHD', desc: 'Stress and sleep evidence reviewed separately from direct ADHD-treatment claims, with safety considerations.' },
  { slug: 'l-tyrosine-and-adhd', title: 'L-Tyrosine and ADHD', desc: 'Mechanistic rationale and human evidence for tyrosine under cognitive demand, without equating dopamine biology with proven ADHD benefit.' },
  { slug: 'rhodiola-rosea-and-adhd', title: 'Rhodiola Rosea and ADHD', desc: 'Evidence for fatigue and stress resilience, clearly separated from ADHD-specific efficacy.' },
  { slug: 'nutrient-deficiencies-and-adhd', title: 'Nutrient Deficiencies and ADHD', desc: 'Which nutrient abnormalities are reported more often in ADHD research, and when targeted testing may be more useful than guessing.' },
  { slug: 'l-theanine-magnesium-adhd-stack', title: 'L-Theanine + Magnesium ADHD Stack', desc: 'What is known about using these together for calm or sleep, with ADHD-specific evidence kept distinct from adjacent evidence.' },
  { slug: 'magnesium-glycinate-vs-citrate-for-adhd', title: 'Magnesium Glycinate vs Citrate for ADHD', desc: 'Compare magnesium forms by tolerability and use case; ADHD-specific superiority has not been established.' },
  { slug: 'adhd-blood-tests', title: 'ADHD Blood Tests', desc: 'Which labs may be relevant when symptoms, diet, medications, or clinical history suggest a specific deficiency or alternative explanation.' },
  { slug: 'melatonin-for-adhd-sleep', title: 'Melatonin for ADHD Sleep', desc: 'Melatonin evidence for sleep-onset problems in ADHD, kept separate from claims about core ADHD symptom treatment.' },
  { slug: 'sleep-and-adhd', title: 'Sleep and ADHD', desc: 'How insomnia, circadian delay, sleep-disordered breathing, restless sleep, and ADHD symptoms can overlap and influence one another.' },
]

const ADHD_REFS = [
  { n: 1, text: 'Bloch MH, et al. (2015). Nutritional supplements for ADHD. Child Adolesc Psychiatr Clin N Am, 23(4): 883-897.', url: 'https://pubmed.ncbi.nlm.nih.gov/25220094/' },
  { n: 2, text: 'Rucklidge JJ, et al. (2014). Vitamin-mineral treatment of ADHD. Br J Psychiatry, 204(4): 306-315.', url: 'https://pubmed.ncbi.nlm.nih.gov/24434087/' },
]

// Decision-first routing: match the reader's question to the most useful evidence review.
const START_HERE: IntentRoute[] = [
  {
    problem: 'Sleep is making attention or daytime function worse',
    why: 'Insomnia, circadian delay, sleep-disordered breathing, and restless sleep can overlap with ADHD symptoms and may need different next steps.',
    cta: 'Sleep and ADHD',
    href: '/guides/adhd/sleep-and-adhd/',
  },
  {
    problem: 'Not sure where to start',
    why: 'Begin with an evidence-graded overview that separates stronger human evidence from preliminary or indirect findings.',
    cta: 'Best Supplements for ADHD',
    href: '/guides/adhd/best-supplements-for-adhd/',
  },
  {
    problem: 'A nutrient deficiency is plausible',
    why: 'Iron, vitamin D, zinc, and magnesium findings are context-dependent; testing is more useful when symptoms, diet, or history make a deficiency plausible.',
    cta: 'Nutrient Deficiencies and ADHD',
    href: '/guides/adhd/nutrient-deficiencies-and-adhd/',
  },
  {
    problem: 'Wondering what labs are actually worth discussing',
    why: 'Review which tests may be relevant when there is a specific clinical reason to look for deficiency or another contributor.',
    cta: 'ADHD Blood Tests',
    href: '/guides/adhd/adhd-blood-tests/',
  },
  {
    problem: 'You are considering multiple supplements',
    why: 'Start with overlap, interaction risk, timing, and evidence quality before adding several products at once.',
    cta: 'ADHD Stack Guide',
    href: '/guides/adhd/adhd-stack-guide/',
  },
  {
    problem: 'You are considering L-theanine for calm, focus, or sleep',
    why: 'There is some ADHD-specific evidence, but it is limited and does not establish L-theanine as a substitute for standard ADHD treatment.',
    cta: 'L-Theanine for ADHD',
    href: '/guides/adhd/l-theanine-for-adhd/',
  },
  {
    problem: 'Sleep onset is the main problem',
    why: 'Melatonin has ADHD-specific sleep evidence, especially for sleep onset, but that is different from treating core ADHD symptoms.',
    cta: 'Melatonin for ADHD Sleep',
    href: '/guides/adhd/melatonin-for-adhd-sleep/',
  },
  {
    problem: 'Considering ashwagandha alongside ADHD treatment',
    why: 'Stress or sleep effects should not be interpreted as proof of direct ADHD benefit, and medication or medical context can change the safety picture.',
    cta: 'Ashwagandha for ADHD',
    href: '/guides/adhd/ashwagandha-for-adhd/',
  },
]

const BEST_FIRST: GuideCard[] = [
  {
    href: '/guides/adhd/sleep-and-adhd/',
    title: 'Sleep and ADHD',
    desc: 'Start here when sleep quality, timing, snoring, restless sleep, or daytime sleepiness may be amplifying attention problems.',
  },
  {
    href: '/guides/adhd/best-supplements-for-adhd/',
    title: 'Best Supplements for ADHD',
    desc: 'An evidence-graded overview that makes the uncertainty visible instead of treating every supplement as equally supported.',
  },
  {
    href: '/guides/adhd/nutrient-deficiencies-and-adhd/',
    title: 'Nutrient Deficiencies and ADHD',
    desc: 'A test-first look at nutrient findings that may matter for some people but should not be assumed from an ADHD diagnosis alone.',
  },
  {
    href: '/guides/adhd/adhd-supplements/',
    title: 'ADHD Supplements Overview',
    desc: 'The broader landscape of options studied for attention, executive function, sleep, and common nutrient gaps.',
  },
]

const COMPARISONS: GuideCard[] = [
  {
    href: '/guides/adhd/citicoline-vs-alpha-gpc/',
    title: 'Citicoline vs Alpha-GPC',
    desc: 'Compare evidence strength, practical differences, and uncertainty rather than assuming one choline source is best for ADHD.',
  },
  {
    href: '/guides/adhd/magnesium-glycinate-vs-citrate-for-adhd/',
    title: 'Magnesium Glycinate vs Citrate',
    desc: 'Compare tolerability and use case; current evidence does not establish one form as superior for ADHD symptoms.',
  },
]

const DEPTH_LINKS = [
  { href: '/compounds/l-theanine/', title: 'L-Theanine', kind: 'Compound profile' },
  { href: '/compounds/magnesium-glycinate/', title: 'Magnesium Glycinate', kind: 'Compound profile' },
  { href: '/compounds/zinc/', title: 'Zinc', kind: 'Compound profile' },
  { href: '/compounds/iron/', title: 'Iron', kind: 'Compound profile' },
  { href: '/compounds/omega-3/', title: 'Omega-3', kind: 'Compound profile' },
  { href: '/compounds/vitamin-d/', title: 'Vitamin D', kind: 'Compound profile' },
  { href: '/compounds/alpha-gpc/', title: 'Alpha-GPC', kind: 'Compound profile' },
  { href: '/compounds/l-tyrosine/', title: 'L-Tyrosine', kind: 'Compound profile' },
  { href: '/herbs/rhodiola/', title: 'Rhodiola Rosea', kind: 'Herb profile' },
  { href: '/herbs/ashwagandha/', title: 'Ashwagandha', kind: 'Herb profile' },
  { href: '/compounds/cdp-choline/', title: 'Citicoline / CDP-Choline', kind: 'Compound profile' },
]

export default function AdhdGuideIndex() {
  const schemaGraph = buildGuideHubSchemaGraph({
    path: '/guides/adhd/',
    title: 'ADHD Supplement Guides & Research',
    description:
      'Evidence-based guides on ADHD supplements, nutrient deficiencies, sleep problems, and medication context. Separate promising findings from uncertain or indirect claims.',
    breadcrumbs: [
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'Guides', url: `${SITE_URL}/guides/` },
      { name: 'ADHD', url: `${SITE_URL}/guides/adhd/` },
    ],
    itemListName: 'ADHD Supplement Guides',
    items: GUIDES.map((g) => ({ name: g.title, url: `/guides/adhd/${g.slug}/` })),
  })

  return (
    <div className="mx-auto max-w-4xl px-4 pb-24 pt-8">
      <SchemaGraphScript graph={schemaGraph} />
      <nav className="text-xs text-muted mb-4">
        <Link href="/guides/" className="hover:text-ink">Guides</Link>
        <span className="mx-1.5">/</span>
        <span className="text-ink font-medium">ADHD</span>
      </nav>

      <header className="mb-10">
        <h1 className="text-3xl font-bold text-ink sm:text-4xl">ADHD Supplement Guides</h1>
        <p className="mt-3 text-lg text-muted max-w-2xl">
          ADHD symptoms can overlap with sleep problems, medication effects, nutrient deficiencies,
          and other health factors. These guides separate direct ADHD evidence from adjacent research
          so you can see what is promising, what is uncertain, and what may be worth discussing or testing.
        </p>
      </header>

      <aside className="mb-8 rounded-2xl border border-brand-900/12 bg-brand-50/70 p-5 dark:border-white/10 dark:bg-[var(--surface-subtle)] sm:p-6">
        <p className="eyebrow-label">High-value first check</p>
        <div className="mt-2 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <h2 className="font-display text-xl font-semibold tracking-tight text-ink">Do not skip the sleep question</h2>
            <p className="mt-2 text-sm leading-7 text-muted">
              Trouble falling asleep is only one pattern. Snoring, breathing pauses, delayed sleep timing,
              restless sleep, and daytime sleepiness can all complicate attention and behavior. The Sleep + ADHD
              guide helps separate those pathways before you assume another supplement is the answer.
            </p>
          </div>
          <Link
            href="/guides/adhd/sleep-and-adhd/"
            className="button-secondary inline-flex min-h-11 items-center justify-center px-5 py-3 text-center text-sm sm:whitespace-nowrap"
          >
            Check sleep first
          </Link>
        </div>
      </aside>

      <aside className="mb-12 overflow-hidden rounded-2xl border border-brand-900/12 bg-gradient-to-br from-brand-50 to-white p-5 shadow-sm dark:border-white/10 dark:from-[var(--surface-card)] dark:to-[var(--surface-subtle)] sm:p-7">
        <div className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <p className="eyebrow-label">Free printable tool</p>
            <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink">
              Plan one careful change at a time
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-muted">
              Use the ADHD Supplement Starter Checklist to record your baseline, review safety
              questions, and track one change across four weeks. No signup is required to preview
              or print it.
            </p>
          </div>
          <Link
            href="/lead-magnets/adhd-supplement-starter-checklist/"
            className="button-primary inline-flex min-h-11 items-center justify-center px-5 py-3 text-center text-sm sm:whitespace-nowrap"
          >
            Open the checklist
          </Link>
        </div>
      </aside>

      {/* Start Here — decision routing */}
      <section className="mb-12">
        <HubSectionHeading
          eyebrow="Start here"
          title="What's your situation?"
          sub="Choose the question closest to yours. The goal is to route you to the most relevant evidence review, not to assume a supplement is the answer."
        />
        <DecisionRouter items={START_HERE} />
      </section>

      {/* Best first pages */}
      <section className="mb-12">
        <HubSectionHeading eyebrow="Best first reads" title="Highest-value places to start" />
        <GuideCardGrid cards={BEST_FIRST} />
      </section>

      {/* Comparison guides */}
      <section className="mb-12">
        <HubSectionHeading
          eyebrow="Comparisons"
          title="Deciding between two options?"
          sub="Compare evidence, tradeoffs, and uncertainty without pretending the research supports a universal winner."
        />
        <GuideCardGrid cards={COMPARISONS} />
      </section>

      {/* Editorial note */}
      <section className="mb-12 rounded-xl border-l-4 border-brand-700/40 bg-brand-50/60 p-5 dark:bg-[var(--surface-subtle)]">
        <p className="text-sm leading-7 text-ink dark:text-[var(--text-secondary)]">
          <span className="font-bold">How to read this ADHD library.</span> Most supplement evidence is
          adjunctive, mixed, or specific to a subgroup, such as people with a documented deficiency or a sleep
          problem. Association does not prove that correcting a biomarker will improve ADHD, and a plausible
          mechanism does not establish clinical benefit. Supplements should not replace diagnosis, behavioral
          strategies, sleep evaluation, or prescribed treatment. Iron and other nutrients can be harmful when
          used unnecessarily, and supplements can interact with medications or medical conditions.
        </p>
      </section>

      <section className="mb-12">
        <HubSectionHeading
          eyebrow="Research deeper"
          title="ADHD-relevant ingredient profiles"
          sub="Use these monographs after choosing a guide to check safety notes, evidence context, and related compounds."
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {DEPTH_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-xl border border-brand-900/12 bg-white p-4 transition hover:border-brand-700/30 hover:bg-brand-50 dark:border-white/10 dark:bg-[var(--surface-card)] dark:hover:bg-white/10"
            >
              <span className="block text-[11px] font-bold uppercase tracking-widest text-muted">{link.kind}</span>
              <span className="mt-1 block text-sm font-semibold text-brand-800 dark:text-[var(--text-primary)]">
                {link.title} →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* All guides — secondary */}
      <section className="mb-12">
        <HubSectionHeading eyebrow="Full library" title="All ADHD guides" />
        <div className="grid gap-4 sm:grid-cols-2">
          {GUIDES.map((guide) => (
            <Link
              key={guide.slug}
              href={`/guides/adhd/${guide.slug}/`}
              className="rounded-xl border border-brand-900/10 bg-white p-5 transition hover:border-brand-700/30 hover:shadow-sm dark:border-white/10 dark:bg-[var(--surface-card)]"
            >
              <h3 className="font-semibold text-ink">{guide.title}</h3>
              <p className="mt-1.5 text-sm text-muted leading-relaxed">{guide.desc}</p>
            </Link>
          ))}
        </div>
      </section>
      <References refs={ADHD_REFS} />
    </div>
  )
}
