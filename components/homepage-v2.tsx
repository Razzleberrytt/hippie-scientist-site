import Link from 'next/link'
import {
  ArrowRight,
  BookOpen,
  Cloud,
  FlaskConical,
  Moon,
  Leaf,
  Search,
  ShieldCheck,
  Zap,
} from 'lucide-react'
import articlesData from '@/data/articles/articles.json'
import buildReport from '@/public/data/build-report.json'

const heroGoals = [
  {
    slug: 'sleep',
    tone: 'sleep',
    title: 'Sleep',
    href: '/guides/sleep/',
    icon: Moon,
    prompt: 'Compare sleep supports by timing, evidence, and next-day effects.',
  },
  {
    slug: 'stress',
    tone: 'stress',
    title: 'Stress',
    href: '/guides/anxiety/',
    icon: Leaf,
    prompt: 'Sort calming supports and adaptogens by symptom pattern.',
  },
  {
    slug: 'anxiety',
    tone: 'anxiety',
    title: 'Anxiety',
    href: '/guides/anxiety/',
    icon: Cloud,
    prompt: 'Research options for overthinking, tension, and calm — without hype.',
  },
  {
    slug: 'focus',
    tone: 'focus',
    title: 'Focus',
    href: '/guides/focus/',
    icon: Zap,
    prompt: 'Weigh stimulant and non-stimulant approaches to attention.',
  },
]

const trustItems = [
  { label: 'Evidence-first', body: 'Human research before marketing claims', icon: FlaskConical },
  { label: 'Safety aware', body: 'Interactions and contraindications stay visible', icon: ShieldCheck },
  { label: 'Plain English', body: 'Clear conclusions with the uncertainty intact', icon: BookOpen },
]

const popularProfiles = [
  { href: '/herbs/ashwagandha/', label: 'Ashwagandha', type: 'Herb' },
  { href: '/herbs/rhodiola/', label: 'Rhodiola', type: 'Herb' },
  { href: '/compounds/magnesium/', label: 'Magnesium', type: 'Compound' },
  { href: '/compounds/l-theanine/', label: 'L-theanine', type: 'Compound' },
  { href: '/compounds/melatonin/', label: 'Melatonin', type: 'Compound' },
]

const comparisonLinks = [
  { href: '/guides/compare/melatonin-vs-magnesium/', title: 'Melatonin vs magnesium' },
  { href: '/guides/compare/rhodiola-vs-ashwagandha/', title: 'Rhodiola vs ashwagandha' },
  {
    href: '/guides/compare/ashwagandha-vs-l-theanine-vs-magnesium/',
    title: 'Ashwagandha vs L-theanine vs magnesium',
  },
]

const toolLinks = [
  {
    href: '/safety-checker/',
    title: 'Safety interaction checker',
    description: 'Screen combinations for overlapping cautions before stacking.',
  },
  {
    href: '/evidence/evidence-checker/',
    title: 'Evidence lookup',
    description: 'Filter compounds by clinical evidence strength and research context.',
  },
  {
    href: '/info/supplement-safety-checklist/',
    title: 'Supplement safety checklist',
    description: 'Five practical questions to ask before comparing products or buying.',
  },
]

const methodSteps = [
  {
    num: '01',
    title: 'Human evidence first',
    body: 'Clinical trials in people lead. Cell and animal work is labelled as what it is — a hypothesis, not a result.',
  },
  {
    num: '02',
    title: 'Mechanism kept separate',
    body: 'Biological plausibility gets its own section so a promising pathway never masquerades as a proven benefit.',
  },
  {
    num: '03',
    title: 'Safety before the verdict',
    body: 'Interactions, contraindications, and dosing context appear before any conclusion about whether something is worth trying.',
  },
]

const counts = buildReport.counts

const heroStats = [
  { value: `${counts.herbs}`, label: 'herb profiles' },
  { value: `${counts.compounds}`, label: 'compound profiles' },
  { value: `${counts.claims}`, label: 'sourced claims' },
]

type SectionHeaderProps = {
  eyebrow?: string
  title: React.ReactNode
  subtitle?: string
  action?: { href: string; label: string }
  size?: 'md' | 'lg'
}

function SectionHeader({ eyebrow, title, subtitle, action, size = 'md' }: SectionHeaderProps) {
  return (
    <div className='flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between'>
      <div className='max-w-2xl'>
        {eyebrow ? <p className='hs-eyebrow'>{eyebrow}</p> : null}
        <h2
          className={`hs-display mt-4 ${
            size === 'lg' ? 'text-[2.4rem] sm:text-[3.4rem]' : 'text-[2rem] sm:text-[2.6rem]'
          }`}
        >
          {title}
        </h2>
        {subtitle ? <p className='hs-lede mt-4 text-[0.95rem] leading-7 sm:text-base'>{subtitle}</p> : null}
      </div>
      {action ? (
        <Link href={action.href} className='hs-link shrink-0 text-sm'>
          {action.label} <ArrowRight className='h-4 w-4' aria-hidden='true' />
        </Link>
      ) : null}
    </div>
  )
}

export default function HomepageV2() {
  const articles = Array.isArray(articlesData) ? articlesData : (articlesData as any).articles || []
  const latestArticles = articles
    .filter((article: any) => article.date && article.published !== false)
    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3)

  return (
    <div className='hs-home'>
      <div className='mx-auto max-w-6xl px-5 sm:px-8 lg:px-10'>
        {/* ---------------- Hero ---------------- */}
        <section className='hs-hero pb-14 pt-12 sm:pb-20 sm:pt-16 lg:pt-20'>
          <div className='grid items-center gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:gap-10'>
            <div>
              <p className='hs-eyebrow'>Evidence-based supplement guidance</p>

              <h1 className='hs-display mt-7 max-w-[15ch] text-[3rem] leading-[0.98] sm:text-[4.4rem] lg:text-[5.1rem]'>
                Herbs &amp; supplements, <span className='hs-accent'>actually explained.</span>
              </h1>

              <p className='hs-lede mt-7 max-w-xl text-lg leading-8 sm:text-xl sm:leading-9'>
                Start with your goal. Compare the human evidence, the mechanism, the dose, and the safety —
                without the marketing.
              </p>

              <div className='mt-9 flex flex-col gap-3 sm:flex-row sm:items-center'>
                <Link
                  href='#choose-a-path'
                  className='hs-btn-primary inline-flex min-h-14 items-center justify-center gap-3 rounded-full px-7 py-4 text-base font-bold transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--hs-gold)] focus-visible:ring-offset-2'
                >
                  <Leaf className='h-5 w-5 text-[#e2cba3]' aria-hidden='true' strokeWidth={1.8} />
                  Choose a health goal
                  <ArrowRight className='h-5 w-5 text-[#e2cba3]' aria-hidden='true' />
                </Link>
                <Link
                  href='/search/'
                  className='hs-btn-ghost inline-flex min-h-14 items-center justify-center gap-2.5 rounded-full px-7 py-4 text-base font-bold transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--hs-gold)] focus-visible:ring-offset-2'
                >
                  <Search className='h-5 w-5' aria-hidden='true' strokeWidth={1.8} />
                  Search by name
                </Link>
              </div>
            </div>

            <div className='hs-dial' aria-hidden='true'>
              <div className='hs-dial-ring hs-dial-ring--outer' />
              <div className='hs-dial-ring hs-dial-ring--mid' />
              <div className='hs-dial-ring hs-dial-ring--inner' />
              <div className='hs-dial-core'>
                <Leaf className='h-14 w-14' strokeWidth={1.25} />
              </div>
              <span className='hs-dial-chip'>Human evidence</span>
              <span className='hs-dial-chip'>Safety context</span>
              <span className='hs-dial-chip'>Dose ranges</span>
              <span className='hs-dial-chip'>Honest limits</span>
            </div>
          </div>

          {/* Real counts from the generated build report — credibility without a card. */}
          <dl className='mt-12 flex flex-wrap items-baseline gap-x-8 gap-y-3'>
            {heroStats.map((stat) => (
              <div key={stat.label} className='flex items-baseline gap-2'>
                <dt className='sr-only'>{stat.label}</dt>
                <dd className='flex items-baseline gap-2'>
                  <span className='hs-stat-num text-2xl sm:text-[1.75rem]'>{stat.value}</span>
                  <span className='text-sm text-[color:var(--hs-body)]'>{stat.label}</span>
                </dd>
              </div>
            ))}
          </dl>

          <dl className='hs-rail mt-10 grid grid-cols-1 gap-0 sm:grid-cols-3'>
            {trustItems.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.label} className='flex items-start gap-3 px-0 py-4 sm:px-6 sm:py-5 sm:first:pl-0'>
                  <Icon
                    className='mt-0.5 h-4 w-4 shrink-0 text-[color:var(--hs-gold)]'
                    aria-hidden='true'
                    strokeWidth={2}
                  />
                  <div>
                    <dt className='text-sm font-bold'>{item.label}</dt>
                    <dd className='mt-1 text-[0.8rem] leading-5 text-[color:var(--hs-body)]'>{item.body}</dd>
                  </div>
                </div>
              )
            })}
          </dl>
        </section>

        {/* ---------------- Goal paths — the colour anchor ---------------- */}
        <section id='choose-a-path' className='scroll-mt-24 py-14 sm:py-20'>
          <SectionHeader
            eyebrow='Start here'
            title={
              <>
                Choose one <span className='hs-accent'>path</span>
              </>
            }
            subtitle='Begin with the outcome you care about. Each hub narrows the field before sending you into individual profiles.'
            action={{ href: '/guides/', label: 'Browse all guides' }}
            size='lg'
          />

          <div className='mt-10 grid grid-cols-2 gap-3.5 sm:gap-5 lg:grid-cols-4'>
            {heroGoals.map((goal) => {
              const Icon = goal.icon
              return (
                <Link
                  key={goal.slug}
                  href={goal.href}
                  data-tone={goal.tone}
                  className='hs-goal group flex min-h-[12.5rem] flex-col justify-between p-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tone)] focus-visible:ring-offset-2 sm:min-h-[15rem] sm:p-6'
                >
                  <div>
                    <span className='hs-goal-icon h-11 w-11 sm:h-12 sm:w-12'>
                      <Icon className='h-[1.2rem] w-[1.2rem] sm:h-[1.35rem] sm:w-[1.35rem]' aria-hidden='true' strokeWidth={1.8} />
                    </span>
                    <h3 className='hs-goal-title mt-4 text-xl sm:mt-5 sm:text-[1.75rem]'>{goal.title}</h3>
                    <p className='mt-2 text-[0.78rem] leading-[1.45] text-[color:var(--hs-body)] sm:mt-2.5 sm:text-[0.85rem] sm:leading-6'>
                      {goal.prompt}
                    </p>
                  </div>
                  <span className='hs-goal-go mt-5 inline-flex items-center gap-2 text-[0.75rem] font-bold sm:mt-6 sm:text-[0.8rem]'>
                    Start here <ArrowRight className='h-3.5 w-3.5' aria-hidden='true' />
                  </span>
                </Link>
              )
            })}
          </div>
        </section>

        <hr className='hs-divider' />

        {/* ---------------- Popular starting points ---------------- */}
        <section className='py-14 sm:py-20'>
          <SectionHeader
            eyebrow='Popular starting points'
            title='Look up a familiar name'
            subtitle='These are the most common first searches — not endorsements. Each profile opens with evidence, mechanism, dosing context, and safety.'
          />

          <div className='mt-9 flex flex-wrap gap-3'>
            {popularProfiles.map((profile) => (
              <Link
                key={profile.href}
                href={profile.href}
                className='hs-chip group inline-flex items-center gap-2.5 px-5 py-3 text-sm font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--hs-gold)] focus-visible:ring-offset-2'
              >
                <span>{profile.label}</span>
                <span className='text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-[color:var(--hs-body)]'>
                  {profile.type}
                </span>
                <ArrowRight
                  className='h-3.5 w-3.5 transition group-hover:translate-x-0.5'
                  aria-hidden='true'
                />
              </Link>
            ))}
          </div>

          <div className='mt-8 flex flex-wrap gap-x-8 gap-y-3'>
            <Link href='/herbs/' className='hs-link text-sm'>
              Browse all {counts.herbs} herbs <ArrowRight className='h-4 w-4' aria-hidden='true' />
            </Link>
            <Link href='/compounds/' className='hs-link text-sm'>
              Browse all {counts.compounds} compounds <ArrowRight className='h-4 w-4' aria-hidden='true' />
            </Link>
          </div>
        </section>

        <hr className='hs-divider' />

        {/* ---------------- Decide / check — hairline lists, no nested tiles ---------------- */}
        <section className='grid gap-12 py-14 sm:py-20 lg:grid-cols-2 lg:gap-16'>
          <div>
            <p className='hs-eyebrow'>Make a decision</p>
            <h2 className='hs-display mt-4 text-[1.9rem] sm:text-[2.35rem]'>Compare before you choose</h2>
            <p className='hs-lede mt-4 text-[0.95rem] leading-7'>
              Side-by-side guides for when the real question is which option fits your situation.
            </p>

            <div className='hs-rows mt-7'>
              {comparisonLinks.map((comparison) => (
                <Link
                  key={comparison.href}
                  href={comparison.href}
                  className='hs-row py-4 text-[0.95rem] font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--hs-gold)]'
                >
                  <span>{comparison.title}</span>
                  <ArrowRight className='h-4 w-4 shrink-0' aria-hidden='true' />
                </Link>
              ))}
            </div>

            <Link href='/guides/compare/' className='hs-link mt-7 text-sm'>
              Browse all comparisons <ArrowRight className='h-4 w-4' aria-hidden='true' />
            </Link>
          </div>

          <div>
            <p className='hs-eyebrow'>Check the downside</p>
            <h2 className='hs-display mt-4 text-[1.9rem] sm:text-[2.35rem]'>Use the safety tools</h2>
            <p className='hs-lede mt-4 text-[0.95rem] leading-7'>
              Check interactions, evidence strength, and buying basics before combining or purchasing anything.
            </p>

            <div className='hs-rows mt-7'>
              {toolLinks.map((tool) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className='hs-row py-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--hs-gold)]'
                >
                  <span>
                    <span className='block text-[0.95rem] font-bold'>{tool.title}</span>
                    <span className='hs-row-sub mt-1 block text-[0.82rem] leading-5'>{tool.description}</span>
                  </span>
                  <ArrowRight className='h-4 w-4 shrink-0' aria-hidden='true' />
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- Latest ---------------- */}
        {latestArticles.length > 0 && (
          <>
            <hr className='hs-divider' />
            <section className='py-14 sm:py-20'>
              <SectionHeader
                eyebrow='Fresh from the library'
                title='Latest guides & research'
                subtitle='A short, current set of practical explainers and evidence reviews — not an endless feed.'
                action={{ href: '/guides/', label: 'Browse the library' }}
              />

              <div className='mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3'>
                {latestArticles.map((article: any) => (
                  <Link
                    key={article.slug}
                    href={`/articles/${article.slug}/`}
                    className='hs-article group flex flex-col gap-3.5 p-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--hs-gold)] focus-visible:ring-offset-2'
                  >
                    <div className='flex flex-wrap items-center gap-2'>
                      {article.category ? (
                        <span className='hs-tag px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.1em]'>
                          {article.category}
                        </span>
                      ) : null}
                      {article.readingTime ? (
                        <span className='text-[0.72rem] text-[color:var(--hs-body)]'>{article.readingTime}</span>
                      ) : null}
                    </div>
                    <h3 className='hs-article-title text-[1.2rem] leading-snug'>{article.title}</h3>
                    {article.excerpt ? (
                      <p className='line-clamp-3 text-[0.85rem] leading-6 text-[color:var(--hs-body)]'>
                        {article.excerpt}
                      </p>
                    ) : null}
                    <span className='hs-link mt-auto pt-1 text-[0.8rem]'>
                      Read <ArrowRight className='h-3.5 w-3.5' aria-hidden='true' />
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          </>
        )}
      </div>

      {/* ---------------- Full-bleed methodology band — the page's closing moment ---------------- */}
      <section className='hs-method mt-6 py-16 sm:py-24'>
        <div className='mx-auto grid max-w-6xl gap-12 px-5 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20 lg:px-10'>
          <div>
            <p className='hs-eyebrow'>How the site works</p>
            <h2 className='hs-display mt-5 text-[2.2rem] sm:text-[2.9rem]'>
              Evidence, safety, <span className='hs-accent'>then a conclusion.</span>
            </h2>
            <p className='mt-5 max-w-md text-[0.95rem] leading-7 text-[#c3d2c7]'>
              Every profile follows the same order, so you always know how much weight a claim actually carries.
            </p>
            <Link href='/info/methodology/' className='hs-method-link mt-7 inline-flex items-center gap-2 text-sm font-bold'>
              Read the evidence methodology <ArrowRight className='h-4 w-4' aria-hidden='true' />
            </Link>
          </div>

          <ol className='space-y-0'>
            {methodSteps.map((step) => (
              <li key={step.num} className='hs-step flex gap-6 py-6 sm:gap-8'>
                <span className='hs-step-num shrink-0 text-[1.6rem] sm:text-[2rem]'>{step.num}</span>
                <div>
                  <h3 className='text-base font-bold text-[#fffdf8] sm:text-lg'>{step.title}</h3>
                  <p className='mt-2 text-[0.88rem] leading-6 text-[#b8c9bd]'>{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  )
}
