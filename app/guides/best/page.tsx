import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '@/src/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'Best Supplement Guides by Goal',
  description:
    'Browse evidence-informed best supplement guides for ADHD, stress, blood pressure, fat loss, gut health, and joint support.',
  path: '/guides/best/',
})

const bestGuides = [
  {
    title: 'Best Magnesium Supplements for ADHD',
    href: '/guides/best/magnesium-supplements-for-adhd/',
    description: 'Compare magnesium forms by ADHD fit, tolerability, sleep context, and practical dosing.',
  },
  {
    title: 'Best Supplements for Stress',
    href: '/guides/best/supplements-for-stress/',
    description: 'Separate calmer, adaptogen, and nervous-system support options with safety context visible.',
  },
  {
    title: 'Best Supplements for Blood Pressure',
    href: '/guides/best/supplements-for-blood-pressure/',
    description: 'Review cardiovascular-support options with medication and monitoring cautions kept upfront.',
  },
  {
    title: 'Best Supplements for Fat Loss',
    href: '/guides/best/supplements-for-fat-loss/',
    description: 'Compare realistic weight-support options without proprietary-blend or stimulant hype.',
  },
  {
    title: 'Best Supplements for Gut Health',
    href: '/guides/best/supplements-for-gut-health/',
    description: 'Scan fiber, digestive, and gut-support options by tolerance, timing, and evidence strength.',
  },
  {
    title: 'Best Supplements for Joint Support',
    href: '/guides/best/supplements-for-joint-support/',
    description: 'Compare joint and mobility support options by evidence signal, safety, and practical fit.',
  },
]

export default function BestSupplementGuidesHub() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 pb-24 pt-8 sm:pt-10">
      <header className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-700 dark:text-brand-200">
          Curated supplement guides
        </p>
        <h1 className="mt-3 text-3xl font-bold text-ink sm:text-4xl">Best Supplement Guides</h1>
        <p className="mt-4 text-base leading-7 text-muted sm:text-lg">
          Start with a focused best-of guide when you already know the outcome you care about. Each guide keeps evidence strength, safety context, and practical product-fit tradeoffs visible.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Best supplement guide categories">
        {bestGuides.map((guide) => (
          <Link
            key={guide.href}
            href={guide.href}
            className="block rounded-2xl border border-brand-900/10 bg-white/90 p-5 shadow-sm transition hover:border-brand-300 hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
          >
            <h2 className="text-lg font-semibold leading-snug text-ink">{guide.title}</h2>
            <p className="mt-3 text-sm leading-6 text-muted">{guide.description}</p>
            <span className="mt-4 inline-flex text-sm font-semibold text-brand-800 dark:text-brand-100">
              Read guide -&gt;
            </span>
          </Link>
        ))}
      </section>

      <section className="rounded-2xl border border-brand-900/10 bg-brand-50/60 p-5 dark:border-white/10 dark:bg-white/5">
        <h2 className="text-xl font-semibold text-ink">Need a broader starting point?</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
          Use the full guide index to compare ADHD, sleep, anxiety, focus, herb, and comparison clusters before narrowing to a best-of page.
        </p>
        <Link
          href="/guides/"
          className="mt-4 inline-flex min-h-[44px] items-center rounded-full bg-brand-700 px-5 text-sm font-semibold text-white transition hover:bg-brand-800"
        >
          Browse all guides
        </Link>
      </section>
    </div>
  )
}
