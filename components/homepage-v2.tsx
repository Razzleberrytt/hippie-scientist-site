import Link from 'next/link'
import {
  ArrowRight,
  Cloud,
  FlaskConical,
  Leaf,
  Moon,
  Search,
  ShieldCheck,
  Zap,
} from 'lucide-react'
import { coreGoals } from '@/lib/core-goals'
import buildReport from '@/public/data/build-report.json'

const goalDetails = {
  sleep: { icon: Moon, label: 'Sleep', href: '/guides/sleep/' },
  anxiety: { icon: Cloud, label: 'Anxiety', href: '/guides/anxiety/' },
  stress: { icon: Leaf, label: 'Stress', href: '/guides/stress/' },
  focus: { icon: Zap, label: 'Focus', href: '/guides/focus/' },
} as const

const goalOrder = ['sleep', 'anxiety', 'stress', 'focus'] as const

const goals = goalOrder.map((slug) => ({
  ...coreGoals.find((goal) => goal.slug === slug)!,
  ...goalDetails[slug],
}))

const comparisons = [
  {
    href: '/guides/compare/melatonin-vs-magnesium/',
    label: 'Melatonin vs. magnesium',
    context: 'Compare sleep timing, next-day effects, and safety context.',
  },
  {
    href: '/guides/compare/rhodiola-vs-ashwagandha/',
    label: 'Rhodiola vs. ashwagandha',
    context: 'Compare stimulating and calming adaptogen tradeoffs.',
  },
  {
    href: '/guides/compare/ashwagandha-vs-l-theanine-vs-magnesium/',
    label: 'Calming supplements compared',
    context: 'Separate evidence for stress, anxiety, and sleep outcomes.',
  },
]

const principles = [
  {
    icon: FlaskConical,
    title: 'Human studies lead',
    body: 'Mechanism and animal research stay clearly separated from clinical results.',
  },
  {
    icon: ShieldCheck,
    title: 'Safety stays visible',
    body: 'Interactions, contraindications, and dose context appear before the verdict.',
  },
]

const counts = buildReport.counts

const stats = [
  { value: counts.herbs, label: 'Herbs' },
  { value: counts.compounds, label: 'Compounds' },
  { value: counts.claims, label: 'Sourced claims' },
]

export default function HomepageV2() {
  return (
    <div className='hs-home'>
      <div className='hs-home-shell'>
        <section className='hs-index-hero' aria-labelledby='home-title'>
          <p className='hs-home-eyebrow'>Evidence-based supplement guidance</p>
          <h1 id='home-title' className='hs-home-title'>
            Better answers start with better <em>evidence.</em>
          </h1>

          <form className='hs-home-search' action='/search/' method='get' role='search'>
            <Search aria-hidden='true' strokeWidth={1.75} />
            <label className='sr-only' htmlFor='homepage-search'>
              Search herbs, compounds, or questions
            </label>
            <input
              id='homepage-search'
              name='q'
              type='search'
              autoComplete='off'
              placeholder='Search by name'
            />
            <button type='submit' aria-label='Submit search'>
              <ArrowRight aria-hidden='true' />
            </button>
          </form>

          <a className='hs-home-browse-link' href='#browse-by-goal'>
            Or browse by health goal
          </a>

          <nav id='browse-by-goal' className='hs-goal-nav' aria-label='Browse by health goal'>
            {goals.map((goal) => {
              const Icon = goal.icon

              return (
                <Link key={goal.slug} href={goal.href} className='hs-goal-link'>
                  <span className='hs-goal-icon'>
                    <Icon aria-hidden='true' strokeWidth={1.65} />
                  </span>
                  <span>{goal.label}</span>
                </Link>
              )
            })}
          </nav>

          <dl className='hs-home-stats' aria-label='Research library size'>
            {stats.map((stat) => (
              <div key={stat.label}>
                <dt>{stat.label}</dt>
                <dd>{stat.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className='hs-decision-section' aria-labelledby='decision-title'>
          <div className='hs-section-intro'>
            <p className='hs-home-eyebrow'>Make a decision</p>
            <h2 id='decision-title'>Compare before you choose.</h2>
            <p>
              Side-by-side guides for when the real question is which option fits your situation.
            </p>
            <Link href='/guides/compare/' className='hs-text-link'>
              Explore comparison guides <ArrowRight aria-hidden='true' />
            </Link>
          </div>

          <div className='hs-comparison-list'>
            {comparisons.map((comparison, index) => (
              <Link key={comparison.href} href={comparison.href} className='hs-comparison-row'>
                <span className='hs-comparison-index' aria-hidden='true'>
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className='hs-comparison-copy'>
                  <strong>{comparison.label}</strong>
                  <small>{comparison.context}</small>
                </span>
                <ArrowRight aria-hidden='true' />
              </Link>
            ))}
          </div>
        </section>

        <section className='hs-method-section' aria-labelledby='method-title'>
          <div className='hs-method-intro'>
            <p className='hs-home-eyebrow'>How the site works</p>
            <h2 id='method-title'>Evidence first. Safety always.</h2>
            <p>
              Every profile follows the same evidence hierarchy, so you can see how much weight a
              claim actually carries before making a decision.
            </p>
            <div className='hs-method-actions'>
              <Link href='/info/methodology/' className='hs-text-link'>
                Read the methodology <ArrowRight aria-hidden='true' />
              </Link>
              <Link href='/safety-checker/' className='hs-text-link'>
                Check interactions <ArrowRight aria-hidden='true' />
              </Link>
              <Link href='/info/supplement-safety-checklist/' className='hs-text-link'>
                Get the safety checklist <ArrowRight aria-hidden='true' />
              </Link>
            </div>
          </div>

          <div className='hs-principles'>
            {principles.map((principle) => {
              const Icon = principle.icon

              return (
                <article key={principle.title}>
                  <Icon aria-hidden='true' strokeWidth={1.6} />
                  <div>
                    <h3>{principle.title}</h3>
                    <p>{principle.body}</p>
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}
