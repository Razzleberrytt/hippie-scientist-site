import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Start Here | The Hippie Scientist',
  description:
    'A calm, evidence-first onboarding guide for learning how to evaluate supplement claims, compare tradeoffs, and choose where to begin.',
}

const siteWorksCards = [
  {
    title: 'Compare evidence',
    body: 'Use side-by-side pages to separate strong human evidence from early or uncertain signals.',
  },
  {
    title: 'Check safety first',
    body: 'Review interactions, sensitivities, and context before focusing on potential upside.',
  },
  {
    title: 'Understand tradeoffs',
    body: 'Most options involve pros, cons, and unknowns. We frame realistic expectations, not shortcuts.',
  },
  {
    title: 'Start simple',
    body: 'Begin with a clear goal and a narrow scope so decisions stay practical and easier to evaluate.',
  },
]

const goalPaths = [
  {
    title: 'Better sleep',
    description: 'Explore educational comparisons for sleep-related support options and their tradeoffs.',
    href: '/goals/sleep',
  },
  {
    title: 'Stress & anxiety',
    description: 'Review calm-focused pathways with attention to evidence strength, uncertainty, and safety context.',
    href: '/stress-supplements',
  },
  {
    title: 'Focus & productivity',
    description: 'Compare focus-oriented herbs and compounds with practical context rather than hype language.',
    href: '/goals/focus',
  },
  {
    title: 'Energy & fatigue',
    description: 'Assess energy support categories and limits in current evidence before trying anything new.',
    href: '/top/best-supplements-for-fatigue',
  },
  {
    title: 'Recovery & performance',
    description: 'Learn how recovery-oriented options may differ by mechanism, tolerance profile, and evidence depth.',
    href: '/best-for',
  },
  {
    title: 'General wellness',
    description: 'Start broad, compare categories, and narrow choices based on your context and priorities.',
    href: '/goals',
  },
]

export default function StartHerePage() {
  return (
    <div className='space-y-12'>
      <section className='rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8'>
        <p className='eyebrow-label'>Start here</p>
        <h1 className='mt-3 text-4xl font-bold tracking-tight text-ink sm:text-5xl'>
          Learn how to explore supplements without the hype.
        </h1>
        <div className='mt-4 max-w-4xl space-y-4 text-base leading-7 text-muted sm:text-lg'>
          <p>
            The Hippie Scientist is designed to help you compare evidence strength, tradeoffs, safety concerns,
            and realistic expectations before deciding what is worth researching further.
          </p>
          <p>
            This content is educational only, not medical advice, and outcomes can vary substantially between
            individuals.
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
          <Link href='/learn' className='rounded-full border border-brand-900/10 bg-white/90 px-4 py-2 text-sm font-medium text-ink transition hover:bg-white'>
            Learn the basics
          </Link>
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
            <Link key={path.title} href={path.href} className='rounded-2xl border border-brand-900/10 bg-white/90 p-5 shadow-sm transition hover:-translate-y-0.5 hover:bg-white'>
              <h3 className='text-lg font-semibold text-ink'>{path.title}</h3>
              <p className='mt-2 text-sm leading-6 text-muted'>{path.description}</p>
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
