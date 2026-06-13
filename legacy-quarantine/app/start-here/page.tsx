import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Start Here',
  description:
    'A calm, evidence-first onboarding guide for learning how to evaluate supplement claims, compare tradeoffs, and choose where to begin.',
  alternates: { canonical: '/start-here' },
  openGraph: {
    title: 'Start Here',
    description:
      'A calm, evidence-first onboarding guide for learning how to evaluate supplement claims, compare tradeoffs, and choose where to begin.',
    url: '/start-here',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Start Here',
    description: 'An evidence-first onboarding guide for evaluating supplement claims and tradeoffs.',
  },
}

const siteWorksCards = [
  {
    title: 'Compare evidence',
    body: 'Use side-by-side pages to separate stronger human evidence from early or uncertain signals.',
  },
  {
    title: 'Check safety first',
    body: 'Review interactions, tolerability constraints, and personal context before focusing on upside.',
  },
  {
    title: 'Understand tradeoffs',
    body: 'Most options involve benefits, limitations, and unknowns. We emphasize realistic expectations over shortcuts.',
  },
  {
    title: 'Start simple',
    body: 'Begin with one clear goal and a narrow scope so your next steps stay practical and easier to evaluate.',
  },
]

const goalPaths = [
  {
    title: 'Better sleep',
    description: 'Explore educational sleep support comparisons with evidence context, timing differences, and common tradeoffs.',
    href: '/goals/sleep',
  },
  {
    title: 'Stress & anxiety',
    description: 'Review calm-focused options with attention to uncertainty, expected effect size, and safety considerations.',
    href: '/goals/sleep',
  },
  {
    title: 'Focus & productivity',
    description: 'Compare focus-oriented compounds and herbs without hype framing or one-size-fits-all assumptions.',
    href: '/goals/focus',
  },
  {
    title: 'Energy & fatigue',
    description: 'Assess categories used for daytime energy and fatigue support, including practical limitations in current evidence.',
    href: '/goals/focus',
  },
  {
    title: 'Recovery & performance',
    description: 'Understand performance and recovery tradeoffs by comparing mechanisms, consistency, and tolerance profiles.',
    href: '/compare',
  },
  {
    title: 'General wellness',
    description: 'Start broad, compare categories, and narrow options based on your context, constraints, and priorities.',
    href: '/goals',
  },
]

export default function StartHerePage() {
  return (
    <div className='space-y-12'>
      <section className='overflow-hidden rounded-[2rem] border border-brand-900/10 bg-white/90 p-0 shadow-sm'>
        <div className='relative w-full h-[180px] sm:h-[260px] md:h-[320px]'>
          <Image
            src='/start-here-banner.jpg'
            alt='The Onboarding Discovery Pathway'
            fill
            priority
            className='object-cover'
          />
          <div className='absolute inset-0 bg-gradient-to-t from-white/90 via-white/20 to-transparent' />
        </div>

        <div className='p-6 sm:p-8 pt-4 sm:pt-6'>
          <p className='eyebrow-label'>Start here</p>
          <h1 className='mt-3 text-4xl font-bold tracking-tight text-ink sm:text-5xl'>
            Learn how to explore supplements without the hype.
          </h1>
          <div className='mt-4 max-w-4xl space-y-4 text-base leading-7 text-muted sm:text-lg'>
            <p>
              The Hippie Scientist helps you compare evidence strength, tradeoffs, safety concerns, and realistic
              expectations before deciding what is worth researching further.
            </p>
            <p>
              This content is educational only, not medical advice, and individual response can vary substantially.
            </p>
          </div>
          <div className='mt-6 flex flex-wrap gap-3'>
            <Link href='/goals' className='rounded-full border border-brand-900/10 bg-white/90 px-4 py-2 text-sm font-medium text-ink transition hover:bg-white'>
              Explore goals
            </Link>
            <Link href='/compare' className='rounded-full border border-brand-900/10 bg-white/90 px-4 py-2 text-sm font-medium text-ink transition hover:bg-white'>
              Compare supplements
            </Link>
            <Link href='/herbs' className='rounded-full border border-brand-900/10 bg-white/90 px-4 py-2 text-sm font-medium text-ink transition hover:bg-white'>
              Browse herbs
            </Link>
            <Link href='/guides' className='rounded-full border border-brand-900/10 bg-white/90 px-4 py-2 text-sm font-medium text-ink transition hover:bg-white'>
              Browse guides
            </Link>
          </div>
        </div>
      </section>

      <section className='space-y-4'>
        <h2 className='text-2xl font-semibold tracking-tight text-ink sm:text-3xl'>How this site works</h2>
        <div className='grid gap-4 md:grid-cols-2'>
          {siteWorksCards.map((card) => (
            <article key={card.title} className='rounded-2xl border border-brand-900/10 bg-white/90 p-5 shadow-sm'>
              <h3 className='text-lg font-semibold text-ink'>{card.title}</h3>
              <p className='mt-2 text-sm leading-6 text-muted'>{card.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className='space-y-4'>
        <h2 className='text-2xl font-semibold tracking-tight text-ink sm:text-3xl'>Choose your path</h2>
        <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
          {goalPaths.map((path) => (
            <Link key={path.title} href={path.href} className='group rounded-2xl border border-brand-900/10 bg-white/90 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:bg-white hover:border-brand-700/30 cursor-pointer'>
              <h3 className='text-lg font-semibold text-ink'>{path.title}</h3>
              <p className='mt-2 text-sm leading-6 text-muted'>{path.description}</p>
              <p className='mt-4 text-sm font-semibold text-brand-700 group-hover:text-brand-800 transition flex items-center gap-1.5'>
                Open guide <span className='group-hover:translate-x-0.5 transition'>→</span>
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className='rounded-2xl border border-brand-900/10 bg-white/90 p-6 shadow-sm'>
        <h2 className='text-2xl font-semibold tracking-tight text-ink'>New to supplements?</h2>
        <ul className='mt-4 space-y-2 text-sm leading-6 text-muted'>
          <li>• Start conservatively and avoid changing many variables at once.</li>
          <li>• Avoid giant stacks initially unless each item has a clear purpose.</li>
          <li>• Evaluate one variable at a time so outcomes are easier to interpret.</li>
          <li>• Keep expectations realistic, especially when evidence is early or mixed.</li>
        </ul>
      </section>

      <section className='rounded-2xl border border-brand-900/10 bg-white/90 p-6 shadow-sm'>
        <h2 className='text-2xl font-semibold tracking-tight text-ink'>How to evaluate claims</h2>
        <ul className='mt-4 space-y-2 text-sm leading-6 text-muted'>
          <li>• Human evidence usually carries more decision value than animal-only findings.</li>
          <li>• Evidence strength matters: study quality, sample size, and replication all affect confidence.</li>
          <li>• Marketing often overstates certainty compared with what studies actually show.</li>
          <li>• Individual variation is common, even when a product helps some people.</li>
          <li>• Long-term evidence is often limited, so uncertainty should be part of the decision.</li>
        </ul>
      </section>

      <footer className='rounded-2xl border border-brand-900/10 bg-white/90 p-6 text-sm leading-6 text-muted shadow-sm'>
        Educational content only. This site does not provide diagnosis or treatment. If you have medical
        conditions, take medications, are pregnant, or have safety concerns, consult a qualified healthcare
        professional before making supplement decisions.
      </footer>
    </div>
  )
}
