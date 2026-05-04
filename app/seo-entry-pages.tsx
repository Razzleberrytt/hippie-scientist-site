import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { goalConfigs } from '@/data/goals'

type SeoEntryConfig = {
  route: string
  goalSlug: string
  title: string
  h1: string
  intro: string
  searchIntent: string
  bullets: string[]
}

type FaqItem = {
  question: string
  answer: string
}

export const seoEntryPages: SeoEntryConfig[] = [
  {
    route: 'best-supplements-for-sleep',
    goalSlug: 'sleep',
    title: 'Best Supplements for Sleep | Evidence-Aware Guide',
    h1: 'Best Supplements for Sleep',
    intro: 'Start with sleep-support options that are easier to compare by timing, evidence, and safety instead of hype.',
    searchIntent: 'sleep supplements, nighttime stack, sleep onset support',
    bullets: ['Compare calming compounds without assuming they work the same way.', 'Use the goal guide to review ranked picks, safety notes, and related stacks.', 'Check compound pages before combining sleep aids with sedatives or medication.'],
  },
  {
    route: 'best-supplements-for-stress',
    goalSlug: 'stress',
    title: 'Best Supplements for Stress | Calm and Adaptogen Guide',
    h1: 'Best Supplements for Stress',
    intro: 'A practical starting point for calming compounds and adaptogen-style options, with safety context kept visible.',
    searchIntent: 'stress supplements, calming supplements, adaptogen comparison',
    bullets: ['Separate acute calming support from longer-term adaptogen routines.', 'Review interactions and cautions before stacking multiple calming products.', 'Use the full goal page for ranked compounds and comparisons.'],
  },
  {
    route: 'best-supplements-for-focus',
    goalSlug: 'focus',
    title: 'Best Supplements for Focus | Cleaner Energy Guide',
    h1: 'Best Supplements for Focus',
    intro: 'Compare focus and energy supplements by evidence, stimulation level, and practical use-case instead of chasing hype.',
    searchIntent: 'focus supplements, nootropic stack, clean energy supplements',
    bullets: ['Balance stimulation with sleep, anxiety, and blood-pressure context.', 'Compare caffeine-adjacent options with non-stimulant support.', 'Use the goal decision page for ranked picks and compound profiles.'],
  },
  {
    route: 'best-supplements-for-fat-loss',
    goalSlug: 'fat-loss',
    title: 'Best Supplements for Fat Loss | Evidence-Aware Support',
    h1: 'Best Supplements for Fat Loss',
    intro: 'A grounded guide for fat-loss support that avoids proprietary-blend hype and keeps stimulant safety in view.',
    searchIntent: 'fat loss supplements, thermogenic supplement stack, appetite support',
    bullets: ['Prioritize modest evidence-aware support over miracle claims.', 'Watch stimulant load, blood pressure, anxiety, and medication interactions.', 'Use the goal guide to compare stacks, compounds, and related evidence.'],
  },
  {
    route: 'best-supplements-for-blood-pressure',
    goalSlug: 'blood-pressure',
    title: 'Best Supplements for Blood Pressure Support | Safety-First Guide',
    h1: 'Best Supplements for Blood Pressure Support',
    intro: 'A safety-first starting point for cardiovascular-support compounds where medication context matters.',
    searchIntent: 'blood pressure supplements, cardiovascular support supplements',
    bullets: ['Treat supplements as support, not replacement blood-pressure care.', 'Review medication interactions and monitoring needs before acting.', 'Use the goal page for ranked compounds and comparison links.'],
  },
  {
    route: 'best-supplements-for-gut-health',
    goalSlug: 'gut-health',
    title: 'Best Supplements for Gut Health | Fiber and Digestion Guide',
    h1: 'Best Supplements for Gut Health',
    intro: 'Compare gut-health support options with practical attention to fiber, digestion, and medication timing.',
    searchIntent: 'gut health supplements, fiber supplements, digestion support',
    bullets: ['Consider fiber and gut-active compounds by tolerance and timing.', 'Separate medication timing when absorption may be affected.', 'Use the goal page for top related compounds and safety context.'],
  },
  {
    route: 'best-supplements-for-joint-support',
    goalSlug: 'joint-support',
    title: 'Best Supplements for Joint Support | Mobility Guide',
    h1: 'Best Supplements for Joint Support',
    intro: 'A practical entry point for comparing joint-support supplements without treating every mobility claim equally.',
    searchIntent: 'joint support supplements, glucosamine chondroitin comparison',
    bullets: ['Compare options by evidence strength and safety context.', 'Review allergy, blood thinner, diabetes, and surgery cautions where relevant.', 'Use the full goal guide for ranked picks and comparison pages.'],
  },
  {
    route: 'natural-testosterone-boosters',
    goalSlug: 'testosterone-support',
    title: 'Natural Testosterone Boosters | Evidence-Aware Supplement Guide',
    h1: 'Natural Testosterone Boosters',
    intro: 'A skeptical guide for testosterone-support supplements that separates cautious evidence from aggressive marketing.',
    searchIntent: 'natural testosterone boosters, testosterone support supplements',
    bullets: ['Be careful with hormone claims and proprietary booster blends.', 'Look for deficiency, sleep, training, and safety context before buying.', 'Use the goal decision page for ranked compounds and related comparisons.'],
  },
  {
    route: 'best-herbs-for-anxiety',
    goalSlug: 'stress',
    title: 'Best Herbs for Anxiety | Safety-First Herbal Guide',
    h1: 'Best Herbs for Anxiety',
    intro: 'A cautious guide to anxiety-related herbs and calming compounds that keeps evidence limits and interaction risks visible.',
    searchIntent: 'best herbs for anxiety, natural anxiolytics, calming herbs',
    bullets: ['Separate traditional calming herbs from compounds with stronger human data.', 'Check sedative, medication, pregnancy, bipolar, thyroid, and liver-safety concerns before use.', 'Use the stress guide for ranked options, comparisons, and safer starting points.'],
  },
  {
    route: 'herbs-for-sleep',
    goalSlug: 'sleep',
    title: 'Herbs for Sleep | Evidence-Aware Nighttime Guide',
    h1: 'Herbs for Sleep',
    intro: 'A practical guide to sleep herbs and nighttime support options, organized by timing, safety, and real-world fit.',
    searchIntent: 'herbs for sleep, natural sleep aids, calming herbs for sleep',
    bullets: ['Compare onset support, nighttime relaxation, and next-day grogginess risk.', 'Avoid stacking sedative herbs without checking interaction and medication context.', 'Use the sleep guide to move from broad herb ideas into specific compound profiles.'],
  },
  {
    route: 'best-nootropics-for-focus',
    goalSlug: 'focus',
    title: 'Best Nootropics for Focus | Evidence-Aware Focus Guide',
    h1: 'Best Nootropics for Focus',
    intro: 'A cleaner entry point for focus nootropics that separates stimulation, attention support, and overhyped claims.',
    searchIntent: 'best nootropics for focus, focus supplements, nootropic stack',
    bullets: ['Compare stimulant and non-stimulant options before building a stack.', 'Watch anxiety, sleep, blood-pressure, and stimulant-load tradeoffs.', 'Use the focus guide to review ranked compounds and full safety profiles.'],
  },
  {
    route: 'best-adaptogens-for-stress',
    goalSlug: 'stress',
    title: 'Best Adaptogens for Stress | Evidence-Aware Guide',
    h1: 'Best Adaptogens for Stress',
    intro: 'A grounded adaptogen guide that separates long-term stress support from vague wellness marketing.',
    searchIntent: 'best adaptogens for stress, adaptogen supplements, stress herbs',
    bullets: ['Compare adaptogens by use-case, evidence strength, and safety profile.', 'Avoid assuming adaptogens are interchangeable or risk-free.', 'Use the stress guide for ranked options and safety-first decision support.'],
  },
]

const siteUrl = 'https://thehippiescientist.net'

const sentence = (text: string) => text.endsWith('.') ? text : `${text}.`

function buildFaqs(page: SeoEntryConfig, goalTitle: string): FaqItem[] {
  const plainGoal = goalTitle.toLowerCase()
  return [
    {
      question: `Do ${plainGoal} supplements actually work?`,
      answer: `Some supplements may help with ${plainGoal}, but results depend on the compound, dose, timing, baseline status, and individual response. The ranked guide separates stronger evidence from weaker claims.`,
    },
    {
      question: `How long do ${plainGoal} supplements take to work?`,
      answer: 'Some supplements are felt the same day, while others require consistent use for days or weeks. Use the compound profiles and stack pages to check timing before buying or combining products.',
    },
    {
      question: `Can I combine multiple ${plainGoal} supplements?`,
      answer: 'Combining supplements can increase side effects and interaction risk. Start with one clear goal, review safety notes, and be careful with medications, pregnancy, medical conditions, or stimulant-heavy stacks.',
    },
    {
      question: `What is the safest way to choose from this ${page.h1.toLowerCase()} guide?`,
      answer: 'Use the page as a starting point, then open the full goal decision guide for ranked picks, evidence context, safety notes, related stacks, and compound-level detail.',
    },
  ]
}

function faqSchema(page: SeoEntryConfig, faqs: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

function breadcrumbSchema(page: SeoEntryConfig) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Supplement Guides',
        item: `${siteUrl}/goals`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: page.h1,
        item: `${siteUrl}/${page.route}`,
      },
    ],
  }
}

export function generateSeoEntryMetadata(route: string): Metadata {
  const page = seoEntryPages.find((item) => item.route === route)
  if (!page) return { title: 'Supplement Guide | The Hippie Scientist' }

  return {
    title: page.title,
    description: page.intro,
    alternates: {
      canonical: `/${page.route}`,
    },
    openGraph: {
      title: page.title,
      description: page.intro,
      url: `/${page.route}`,
      type: 'article',
    },
  }
}

export function SeoEntryPage({ route }: { route: string }) {
  const page = seoEntryPages.find((item) => item.route === route)
  if (!page) return notFound()

  const goal = goalConfigs.find((item) => item.slug === page.goalSlug)
  if (!goal) return notFound()

  const faqs = buildFaqs(page, goal.title)
  const relatedGuides = seoEntryPages.filter((item) => item.route !== page.route).slice(0, 4)

  return (
    <main className="space-y-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(page, faqs)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(page)) }}
      />

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">Supplement guide</p>
        <h1 className="mt-3 text-4xl font-black text-white">{page.h1}</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-white/75">{page.intro}</p>
        <p className="mt-3 text-xs text-white/45">Search intent: {page.searchIntent}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href={`/goals/${goal.slug}`} className="rounded-full bg-emerald-300 px-4 py-2 text-sm font-bold text-black hover:bg-emerald-200">
            View ranked picks
          </Link>
          <Link href="/compounds" className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white/75 hover:bg-white/10">
            Browse compounds
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {page.bullets.map((bullet) => (
          <div key={bullet} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm leading-6 text-white/70">
            {bullet}
          </div>
        ))}
      </section>

      <section className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="text-2xl font-bold text-white">How to choose supplements for {goal.title.toLowerCase()}</h2>
        <p className="max-w-3xl leading-7 text-white/75">
          Not all supplements targeting {goal.title.toLowerCase()} work the same way. Some are designed for short-term support, some require consistent use, and some only make sense for specific situations or populations. The goal is not to buy the most aggressive product. The goal is to match the compound, timing, and safety profile to the problem you are actually trying to solve.
        </p>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-white/70">
          <li>Check whether the expected effect is acute, gradual, or dependent on baseline deficiency.</li>
          <li>Compare stimulant, calming, fiber, adaptogen, or nutrient-style approaches before stacking products.</li>
          <li>Look at interaction risks, medical context, and safety notes before combining multiple compounds.</li>
        </ul>
      </section>

      <section className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="text-2xl font-bold text-white">What actually works for {goal.title.toLowerCase()}?</h2>
        <p className="max-w-3xl leading-7 text-white/75">
          Evidence varies widely across the supplement market. Some compounds have stronger human evidence and clearer use-cases, while others rely on indirect mechanisms, small studies, or marketing language. The Hippie Scientist goal pages rank options by evidence and practical relevance so you can compare options without treating every claim as equal.
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 p-4 text-sm text-white/70">
            <strong className="text-white">Evidence strength:</strong> human data and consistency matter more than hype.
          </div>
          <div className="rounded-2xl border border-white/10 p-4 text-sm text-white/70">
            <strong className="text-white">Practical fit:</strong> timing, dose, and use-case decide whether an option makes sense.
          </div>
          <div className="rounded-2xl border border-white/10 p-4 text-sm text-white/70">
            <strong className="text-white">Safety profile:</strong> interactions, side effects, and medical context stay visible.
          </div>
        </div>
        <Link href={`/goals/${goal.slug}`} className="inline-block text-sm font-semibold text-emerald-300">
          View the ranked {goal.title.toLowerCase()} decision guide →
        </Link>
      </section>

      <section className="rounded-3xl border border-amber-300/20 bg-amber-300/[0.06] p-5">
        <h2 className="font-bold text-amber-100">Safety considerations</h2>
        <p className="mt-2 text-sm leading-6 text-white/75">
          {sentence(goal.safetyNote)} Supplements are not risk-free, especially when combined with medications, medical conditions, pregnancy, surgery, sedatives, stimulants, or blood-pressure concerns.
        </p>
        <Link href={`/goals/${goal.slug}`} className="mt-4 inline-block text-sm font-semibold text-emerald-300">
          Review full safety guidance →
        </Link>
      </section>

      <section className="rounded-3xl border border-emerald-300/20 bg-emerald-300/[0.06] p-5">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-200/75">Buying checkpoint</p>
        <h2 className="mt-2 text-2xl font-bold text-white">Before you buy anything</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-white/75">
          Use the ranked guide first, then open the individual compound profile. Product links should only come after the evidence, dose, timing, and safety context match your situation.
        </p>
        <Link href={`/goals/${goal.slug}`} className="mt-4 inline-block rounded-full bg-emerald-300 px-4 py-2 text-sm font-bold text-black hover:bg-emerald-200">
          Check ranked picks before buying
        </Link>
      </section>

      <section className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="text-2xl font-bold text-white">Frequently asked questions</h2>
        <div className="space-y-4">
          {faqs.map((faq) => (
            <div key={faq.question} className="rounded-2xl border border-white/10 p-4">
              <h3 className="font-semibold text-white">{faq.question}</h3>
              <p className="mt-2 text-sm leading-6 text-white/70">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white">Related supplement guides</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {relatedGuides.map((guide) => (
            <Link key={guide.route} href={`/${guide.route}`} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:border-emerald-300/40">
              <h3 className="font-bold text-white">{guide.h1}</h3>
              <p className="mt-2 line-clamp-3 text-sm text-white/65">{guide.intro}</p>
              <span className="mt-3 inline-block text-sm font-semibold text-emerald-300">Read guide →</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
