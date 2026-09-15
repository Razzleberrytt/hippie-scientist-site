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
import { getPublicSiteMetrics } from '@/lib/public-site-metrics'

const goalDetails = {
  sleep: {
    icon: Moon,
    label: 'Sleep',
    href: '/guides/sleep/',
    blurb: 'Timing, sleep quality, and next-day effects.',
  },
  anxiety: {
    icon: Cloud,
    label: 'Anxiety',
    href: '/guides/anxiety/',
    blurb: 'Calm, tension, and overthinking without the hype.',
  },
  stress: {
    icon: Leaf,
    label: 'Stress',
    href: '/guides/stress/',
    blurb: 'Adaptogens, fatigue, and resilience in context.',
  },
  focus: {
    icon: Zap,
    label: 'Focus',
    href: '/guides/focus/',
    blurb: 'Attention, energy, and cognitive tradeoffs.',
  },
} as const

const goalOrder = ['sleep', 'anxiety', 'stress', 'focus'] as const

const goals = goalOrder.map((slug) => ({
  ...coreGoals.find((goal) => goal.slug === slug)!,
  ...goalDetails[slug],
}))

const evidenceSignals = [
  {
    index: '01',
    icon: FlaskConical,
    label: 'Human evidence',
    detail: 'Clinical outcomes lead; mechanisms stay in their lane.',
  },
  {
    index: '02',
    icon: ShieldCheck,
    label: 'Safety context',
    detail: 'Interactions, contraindications, and dose context stay visible.',
  },
  {
    index: '03',
    icon: Search,
    label: 'Decision clarity',
    detail: 'Useful takeaways without pretending uncertainty disappeared.',
  },
] as const

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

export default async function HomepageV2() {
  const metrics = await getPublicSiteMetrics()
  const stats = [
    { value: metrics.publishedHerbs, label: 'Published herbs' },
    { value: metrics.publishedCompounds, label: 'Published compounds' },
    { value: metrics.structuredStudies, label: 'Structured studies' },
  ]

  return (
    <div className='hs-home'>
      <div className='hs-home-shell'>
        <section className='hs-index-hero' aria-labelledby='home-title'>
          <div className='hs-hero-main'>
            <div className='hs-hero-copy'>
              <p className='hs-home-eyebrow'>Evidence-based supplement guidance</p>
              <h1 id='home-title' className='hs-home-title'>
                Better answers start with better <em>evidence.</em>
              </h1>
              <p className='hs-home-lede'>
                Evidence, safety, dose, and context for herbs and supplements — with uncertainty left intact.
              </p>

              <form className='hs-home-search' action='/search/' method='get' role='search'>
                <Search aria-hidden='true' strokeWidth={1.75} />
                <label className='sr-only' htmlFor='homepage-search'>
                  Search herbs, compounds, or topics
                </label>
                <input
                  id='homepage-search'
                  name='q'
                  type='search'
                  autoComplete='off'
                  autoCapitalize='none'
                  autoCorrect='off'
                  spellCheck={false}
                  enterKeyHint='search'
                  placeholder='Search herbs, compounds, topics'
                />
                <button type='submit' aria-label='Search the research library'>
                  <ArrowRight aria-hidden='true' />
                </button>
              </form>

              <a className='hs-home-browse-link hs-hero-primary-link' href='#browse-by-goal'>
                Browse health goals <ArrowRight aria-hidden='true' />
              </a>
            </div>

            <aside className='hs-evidence-panel' aria-label='How The Hippie Scientist evaluates evidence'>
              <div className='hs-evidence-panel-heading'>
                <span className='hs-evidence-seal' aria-hidden='true'>
                  <FlaskConical strokeWidth={1.45} />
                </span>
                <div>
                  <p>Research lens</p>
                  <h2>Evidence, safety, context.</h2>
                </div>
              </div>

              <p className='hs-evidence-panel-intro'>
                Every profile is filtered through the same decision framework before a conclusion
                earns visual emphasis.
              </p>

              <div className='hs-evidence-signals'>
                {evidenceSignals.map((signal) => {
                  const Icon = signal.icon

                  return (
                    <div key={signal.index} className='hs-evidence-signal'>
                      <span className='hs-evidence-signal-index' aria-hidden='true'>
                        {signal.index}
                      </span>
                      <span className='hs-evidence-signal-icon' aria-hidden='true'>
                        <Icon strokeWidth={1.55} />
                      </span>
                      <span>
                        <strong>{signal.label}</strong>
                        <small>{signal.detail}</small>
                      </span>
                    </div>
                  )
                })}
              </div>

              <Link href='/info/methodology/' className='hs-evidence-panel-link'>
                Read the methodology <ArrowRight aria-hidden='true' />
              </Link>
            </aside>
          </div>

          <div id='browse-by-goal' className='hs-goal-block'>
            <div className='hs-goal-block-heading'>
              <div>
                <p className='hs-home-eyebrow'>Browse by goal</p>
                <h2>Start with what you want to improve.</h2>
              </div>
              <Link href='/goals/' className='hs-text-link'>
                All health goals <ArrowRight aria-hidden='true' />
              </Link>
            </div>

            <nav className='hs-goal-nav' aria-label='Browse by health goal'>
              {goals.map((goal) => {
                const Icon = goal.icon

                return (
                  <Link key={goal.slug} href={goal.href} className='hs-goal-link'>
                    <span className='hs-goal-link-top'>
                      <span className='hs-goal-icon'>
                        <Icon aria-hidden='true' strokeWidth={1.6} />
                      </span>
                      <ArrowRight className='hs-goal-arrow' aria-hidden='true' />
                    </span>
                    <span className='hs-goal-copy'>
                      <strong>{goal.label}</strong>
                      <small>{goal.blurb}</small>
                    </span>
                  </Link>
                )
              })}
            </nav>
          </div>

          <dl className='hs-home-stats' aria-label='Research library size'>
            {stats.map((stat) => (
              <div key={stat.label}>
                <dd>{stat.value}</dd>
                <dt>{stat.label}</dt>
              </div>
            ))}
          </dl>
        </section>

        <section className='hs-decision-section' aria-labelledby='decision-title'>
          <div className='hs-section-intro'>
            <p className='hs-home-eyebrow'>Make a decision</p>
            <h2 id='decision-title'>Compare before you choose.</h2>
            <p>
              Side-by-side guides turn a crowded supplement shelf into a clearer set of tradeoffs.
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
                <span className='hs-comparison-action' aria-hidden='true'>
                  <ArrowRight />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className='hs-method-section' aria-labelledby='method-title'>
          <div className='hs-method-intro'>
            <p className='hs-home-eyebrow'>The research standard</p>
            <h2 id='method-title'>Evidence first. Safety always.</h2>
            <p>
              Every profile follows the same evidence hierarchy, so the strength of a claim is clear
              before the conclusion asks for your attention.
            </p>
            <div className='hs-method-actions'>
              <Link href='/info/methodology/' className='hs-text-link'>
                Read the methodology <ArrowRight aria-hidden='true' />
              </Link>
              <Link href='/safety-checker/' className='hs-text-link'>
                Check interactions <ArrowRight aria-hidden='true' />
              </Link>
              <Link href='/info/supplement-safety-checklist/' className='hs-text-link'>
                Safety checklist <ArrowRight aria-hidden='true' />
              </Link>
            </div>
          </div>

          <div className='hs-principles'>
            {principles.map((principle) => {
              const Icon = principle.icon

              return (
                <article key={principle.title}>
                  <span className='hs-principle-icon'>
                    <Icon aria-hidden='true' strokeWidth={1.55} />
                  </span>
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
