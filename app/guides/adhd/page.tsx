import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL } from '@/src/lib/seo'
import References from '@/components/References'
import SchemaGraphScript from '@/components/seo/SchemaGraphScript'
import { HubSectionHeading } from '@/components/guides/HubSectionHeading'
import { DecisionRouter, type IntentRoute } from '@/components/guides/DecisionRouter'
import { GuideCardGrid, type GuideCard } from '@/components/guides/GuideCardGrid'
import { buildGuideHubSchemaGraph } from '../../../src/lib/schema-graph'

export const metadata: Metadata = {
  title: 'ADHD Supplement Guides & Research',
  description: 'Evidence-based guides on ADHD supplements, nutrient deficiencies, and medication context. Magnesium, omega-3, L-theanine, iron, zinc, and more.',
  alternates: { canonical: `${SITE_URL}/guides/adhd/` },
  openGraph: {
    title: 'ADHD Supplement Guides & Research',
    description: 'Evidence-based guides on ADHD supplements, nutrient deficiencies, and medication context.',
    url: `${SITE_URL}/guides/adhd/`,
    type: 'website',
    images: ['/og-default.jpg'],
  },
}

const GUIDES = [
  { slug: 'best-supplements-for-adhd', title: 'Best Supplements for ADHD', desc: 'Evidence-graded review of the top supplements studied for ADHD symptom support.' },
  { slug: 'adhd-stack-guide', title: 'ADHD Stack Guide', desc: 'How to combine supplements for ADHD — timing, synergies, and safety.' },
  { slug: 'best-magnesium-supplement-for-adhd', title: 'Best Magnesium for ADHD', desc: 'Comparing magnesium glycinate, citrate, and threonate for ADHD support.' },
  { slug: 'adhd-supplements', title: 'ADHD Supplements Overview', desc: 'Complete overview of supplements studied for attention and executive function.' },
  { slug: 'magnesium-for-adhd', title: 'Magnesium for ADHD', desc: 'How magnesium affects dopamine, focus, and hyperactivity.' },
  { slug: 'omega-3-and-adhd', title: 'Omega-3 and ADHD', desc: 'EPA and DHA fatty acids for attention and impulse control.' },
  { slug: 'l-theanine-for-adhd', title: 'L-Theanine for ADHD', desc: 'Calm focus without sedation — L-theanine\'s role in ADHD.' },
  { slug: 'iron-ferritin-and-adhd', title: 'Iron, Ferritin, and ADHD', desc: 'The link between low iron and ADHD symptoms — when to test and supplement.' },
  { slug: 'zinc-and-adhd', title: 'Zinc and ADHD', desc: 'Zinc\'s role in dopamine regulation and ADHD symptom management.' },
  { slug: 'vitamin-d-and-adhd', title: 'Vitamin D and ADHD', desc: 'Vitamin D deficiency and its relationship to attention and mood.' },
  { slug: 'citicoline-for-adhd', title: 'Citicoline for ADHD', desc: 'Citicoline as a cognitive enhancer for attention and working memory.' },
  { slug: 'alpha-gpc-and-adhd', title: 'Alpha-GPC and ADHD', desc: 'Choline source studied for focus and cognitive processing speed.' },
  { slug: 'citicoline-vs-alpha-gpc', title: 'Citicoline vs Alpha-GPC', desc: 'Head-to-head comparison of two leading choline supplements for ADHD.' },
  { slug: 'ashwagandha-for-adhd', title: 'Ashwagandha for ADHD', desc: 'Can ashwagandha\'s stress-reducing effects help with ADHD symptoms?' },
  { slug: 'l-tyrosine-and-adhd', title: 'L-Tyrosine and ADHD', desc: 'Dopamine precursor studied for focus and cognitive demand.' },
  { slug: 'rhodiola-rosea-and-adhd', title: 'Rhodiola Rosea and ADHD', desc: 'Adaptogenic support for mental fatigue and attention.' },
  { slug: 'nutrient-deficiencies-and-adhd', title: 'Nutrient Deficiencies and ADHD', desc: 'Which deficiencies are most common in ADHD and what to test.' },
  { slug: 'l-theanine-magnesium-adhd-stack', title: 'L-Theanine + Magnesium ADHD Stack', desc: 'Combining these two for synergistic calm-focus support.' },
  { slug: 'magnesium-glycinate-vs-citrate-for-adhd', title: 'Magnesium Glycinate vs Citrate for ADHD', desc: 'Which magnesium form is better for ADHD symptoms?' },
  { slug: 'adhd-blood-tests', title: 'ADHD Blood Tests', desc: 'What lab work to consider when evaluating ADHD — nutrients, hormones, and markers.' },
  { slug: 'melatonin-for-adhd-sleep', title: 'Melatonin for ADHD Sleep', desc: 'Melatonin for ADHD-related sleep onset difficulties.' },
  { slug: 'sleep-and-adhd', title: 'Sleep and ADHD', desc: 'The bidirectional relationship between sleep quality and ADHD symptoms.' },
]

const ADHD_REFS = [
  { n: 1, text: 'Bloch MH, et al. (2015). Nutritional supplements for ADHD. Child Adolesc Psychiatr Clin N Am, 23(4): 883-897.', url: 'https://pubmed.ncbi.nlm.nih.gov/25220094/' },
  { n: 2, text: 'Rucklidge JJ, et al. (2014). Vitamin-mineral treatment of ADHD. Br J Psychiatry, 204(4): 306-315.', url: 'https://pubmed.ncbi.nlm.nih.gov/24434087/' },
]

// Decision-first routing: match the reader's actual question to the right first guide.
const START_HERE: IntentRoute[] = [
  {
    problem: 'Not sure where to start',
    why: 'An evidence-graded overview of every supplement studied for ADHD symptoms.',
    cta: 'Best Supplements for ADHD',
    href: '/guides/adhd/best-supplements-for-adhd/',
  },
  {
    problem: 'You want to build a full routine',
    why: 'How to combine supplements safely — timing, dosing, and what not to stack.',
    cta: 'ADHD Stack Guide',
    href: '/guides/adhd/adhd-stack-guide/',
  },
  {
    problem: 'Suspect a nutrient deficiency is involved',
    why: 'Iron, zinc, magnesium, and vitamin D deficiencies are common in ADHD and often go unchecked.',
    cta: 'Nutrient Deficiencies and ADHD',
    href: '/guides/adhd/nutrient-deficiencies-and-adhd/',
  },
  {
    problem: 'Wondering what labs to actually ask for',
    why: 'Ferritin, zinc, vitamin D, and other markers worth testing before supplementing.',
    cta: 'ADHD Blood Tests',
    href: '/guides/adhd/adhd-blood-tests/',
  },
  {
    problem: 'Choosing between choline sources',
    why: 'Citicoline and Alpha-GPC are not interchangeable for attention and processing speed.',
    cta: 'Citicoline vs Alpha-GPC',
    href: '/guides/adhd/citicoline-vs-alpha-gpc/',
  },
  {
    problem: 'Racing mind or stimulant jitters',
    why: 'A calming amino acid that takes the edge off without sedation.',
    cta: 'L-Theanine for ADHD',
    href: '/guides/adhd/l-theanine-for-adhd/',
  },
  {
    problem: 'Stimulant medication is disrupting sleep',
    why: 'Timing melatonin around a stimulant dose is different from a typical sleep routine.',
    cta: 'Melatonin for ADHD Sleep',
    href: '/guides/adhd/melatonin-for-adhd-sleep/',
  },
  {
    problem: 'Considering ashwagandha alongside medication',
    why: 'Its stress-lowering effects are not the same thing as treating ADHD symptoms directly.',
    cta: 'Ashwagandha for ADHD',
    href: '/guides/adhd/ashwagandha-for-adhd/',
  },
]

const BEST_FIRST: GuideCard[] = [
  {
    href: '/guides/adhd/best-supplements-for-adhd/',
    title: 'Best Supplements for ADHD',
    desc: 'Start here if you are not sure what you need — evidence graded across the full list.',
  },
  {
    href: '/guides/adhd/adhd-supplements/',
    title: 'ADHD Supplements Overview',
    desc: 'The full landscape of options studied for attention and executive function.',
  },
  {
    href: '/guides/adhd/adhd-stack-guide/',
    title: 'ADHD Stack Guide',
    desc: 'Combining supplements safely — what pairs well and what to avoid stacking.',
  },
  {
    href: '/guides/adhd/nutrient-deficiencies-and-adhd/',
    title: 'Nutrient Deficiencies and ADHD',
    desc: 'The deficiencies most often mistaken for — or compounding — ADHD symptoms.',
  },
]

const COMPARISONS: GuideCard[] = [
  {
    href: '/guides/adhd/citicoline-vs-alpha-gpc/',
    title: 'Citicoline vs Alpha-GPC',
    desc: 'Two leading choline sources compared head-to-head for focus and processing speed.',
  },
  {
    href: '/guides/adhd/magnesium-glycinate-vs-citrate-for-adhd/',
    title: 'Magnesium Glycinate vs Citrate',
    desc: 'Which magnesium form fits ADHD-related sleep and irritability better.',
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
  { href: '/herbs/citicoline/', title: 'Citicoline', kind: 'Herb profile' },
]

export default function AdhdGuideIndex() {
  const schemaGraph = buildGuideHubSchemaGraph({
    path: '/guides/adhd/',
    title: 'ADHD Supplement Guides & Research',
    description:
      'Evidence-based guides on ADHD supplements, nutrient deficiencies, and medication context. Magnesium, omega-3, L-theanine, iron, zinc, and more.',
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
          Supplements are most useful when matched to what is actually driving your symptoms —
          a nutrient gap, a dopamine-related deficit, or medication timing. Tell us what you are
          dealing with and we will point you to the most relevant guide first.
        </p>
      </header>

      {/* Start Here — decision routing */}
      <section className="mb-12">
        <HubSectionHeading
          eyebrow="Start here"
          title="What's your situation?"
          sub="Pick the description that fits best — each routes you to the most relevant guide."
        />
        <DecisionRouter items={START_HERE} />
      </section>

      {/* Best first pages */}
      <section className="mb-12">
        <HubSectionHeading eyebrow="Best first reads" title="If you only read a few" />
        <GuideCardGrid cards={BEST_FIRST} />
      </section>

      {/* Comparison guides */}
      <section className="mb-12">
        <HubSectionHeading
          eyebrow="Comparisons"
          title="Deciding between two options?"
          sub="These make a clear call instead of saying “either could work.”"
        />
        <GuideCardGrid cards={COMPARISONS} />
      </section>

      {/* Editorial note */}
      <section className="mb-12 rounded-xl border-l-4 border-brand-700/40 bg-brand-50/60 p-5 dark:bg-[var(--surface-subtle)]">
        <p className="text-sm leading-7 text-ink dark:text-[var(--text-secondary)]">
          <span className="font-bold">A note on supplements and ADHD.</span> Nutrient repletion
          (iron, zinc, magnesium, vitamin D) and cognitive-support compounds (choline sources,
          L-theanine, omega-3s) are adjuncts, not substitutes for a diagnosis, behavioral
          strategies, or prescribed medication. Several — especially iron and stimulant-adjacent
          compounds like L-tyrosine — carry real interaction and dosing risks. Test before you
          supplement where a guide recommends it, and check with a clinician if you take ADHD
          medication.
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
