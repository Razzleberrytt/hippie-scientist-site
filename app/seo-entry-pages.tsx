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
]

export function generateSeoEntryMetadata(route: string): Metadata {
  const page = seoEntryPages.find((item) => item.route === route)
  if (!page) return { title: 'Supplement Guide | The Hippie Scientist' }

  return {
    title: page.title,
    description: page.intro,
    alternates: {
      canonical: `/${page.route}`,
    },
  }
}

export function SeoEntryPage({ route }: { route: string }) {
  const page = seoEntryPages.find((item) => item.route === route)
  if (!page) return notFound()

  const goal = goalConfigs.find((item) => item.slug === page.goalSlug)
  if (!goal) return notFound()

  return (
    <main className="space-y-10">
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

      <section className="rounded-3xl border border-amber-300/20 bg-amber-300/[0.06] p-5">
        <h2 className="font-bold text-amber-100">Safety-first shortcut</h2>
        <p className="mt-2 text-sm leading-6 text-white/75">{goal.safetyNote}</p>
        <Link href={`/goals/${goal.slug}`} className="mt-4 inline-block text-sm font-semibold text-emerald-300">
          Open the full {goal.title.toLowerCase()} decision guide →
        </Link>
      </section>
    </main>
  )
}
