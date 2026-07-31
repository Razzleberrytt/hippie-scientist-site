import Link from 'next/link'
import {
  ArrowRight,
  BookOpen,
  Cloud,
  FlaskConical,
  Leaf,
  Library,
  Moon,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react'
import articlesData from '@/data/articles/articles.json'

type SectionHeaderProps = { title: string; subtitle?: string; as?: 'h2' | 'h3' }

const heroGoals = [
  {
    slug: 'sleep',
    title: 'Sleep',
    href: '/guides/sleep/',
    icon: Moon,
    prompt: 'Compare sleep supports by timing, evidence, next-day effects, and safety.',
  },
  {
    slug: 'stress',
    title: 'Stress',
    href: '/guides/anxiety/',
    icon: Leaf,
    prompt: 'Sort calming supports and adaptogens by symptom pattern and tradeoffs.',
  },
  {
    slug: 'anxiety',
    title: 'Anxiety',
    href: '/guides/anxiety/',
    icon: Cloud,
    prompt: 'Research options for overthinking, tension, and calm without the hype.',
  },
  {
    slug: 'focus',
    title: 'Focus',
    href: '/guides/focus/',
    icon: Zap,
    prompt: 'Compare stimulant and non-stimulant approaches to attention and cognition.',
  },
]

const trustItems = [
  { label: 'Evidence-first', body: 'Human research before marketing claims', icon: FlaskConical },
  { label: 'Safety aware', body: 'Interactions and contraindications stay visible', icon: ShieldCheck },
  { label: 'Plain English', body: 'Clear conclusions with uncertainty intact', icon: BookOpen },
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
    description: 'Use five practical questions before comparing products or buying.',
  },
]

const CATEGORY_TAG_COLORS: Record<string, string> = {
  'metabolic health':
    'border-stone-300 bg-stone-100 text-stone-700 dark:border-stone-700 dark:bg-stone-800/30 dark:text-stone-200',
  'cognitive health':
    'border-emerald-300 bg-emerald-100 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-800/20 dark:text-emerald-200',
  'anxiety & sleep':
    'border-violet-300 bg-violet-100 text-violet-800 dark:border-violet-700 dark:bg-violet-800/20 dark:text-violet-200',
  general:
    'border-amber-300 bg-amber-100 text-amber-800 dark:border-amber-700 dark:bg-amber-800/20 dark:text-amber-200',
}

function categoryTagClass(category: string): string {
  return (
    CATEGORY_TAG_COLORS[category.toLowerCase()] ||
    'border-brand-200 bg-brand-50 text-brand-700 dark:bg-[var(--surface-subtle)] dark:text-[var(--text-secondary)]'
  )
}

function SectionHeader({ title, subtitle, as: HeadingTag = 'h2' }: SectionHeaderProps) {
  return (
    <div className='max-w-3xl space-y-2'>
      <HeadingTag className='editorial-display text-[2rem] sm:text-[2.65rem]'>{title}</HeadingTag>
      {subtitle ? <p className='max-w-2xl text-sm leading-6 text-muted sm:text-base sm:leading-7'>{subtitle}</p> : null}
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
    <div className='editorial-site-shell'>
      <div className='relative mx-auto max-w-6xl space-y-6 px-4 pb-16 pt-4 sm:space-y-12 sm:px-6 sm:pb-20 sm:pt-8 lg:px-8'>
        <section className='editorial-hero px-5 pb-0 pt-8 sm:px-10 sm:pt-12 lg:px-14 lg:pt-16'>
          <div className='editorial-botanical-orbit' aria-hidden='true'>
            <span />
            <span />
            <span />
            <span />
          </div>

          <div className='relative max-w-3xl pb-10 sm:pb-12 lg:pb-14'>
            <p className='editorial-eyebrow'>Evidence-based guidance for better decisions</p>
            <h1 className='editorial-display mt-4 max-w-[12ch] text-[2.55rem] sm:text-[4.6rem] lg:text-[5.6rem]'>
              Feel better without guessing.
            </h1>
            <p className='mt-5 max-w-xl text-base leading-7 text-[#33433c] sm:mt-6 sm:text-lg sm:leading-8 dark:text-[var(--text-secondary)]'>
              Compare natural options for sleep, stress, anxiety, and focus with evidence, safety context, and clear next steps.
            </p>

            <div className='mt-7 flex flex-col gap-3 sm:mt-9 sm:flex-row sm:items-center'>
              <Link
                href='#choose-a-path'
                className='editorial-cta inline-flex min-h-14 w-full max-w-md items-center justify-between rounded-full px-5 py-4 text-base font-bold transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b88a42] focus-visible:ring-offset-2 sm:w-auto sm:px-7'
              >
                <span className='inline-flex items-center gap-3'>
                  <Leaf className='h-5 w-5 text-[#dec69b]' aria-hidden='true' strokeWidth={1.8} />
                  Choose your goal
                </span>
                <ArrowRight className='h-5 w-5 text-[#dec69b]' aria-hidden='true' />
              </Link>
              <Link
                href='/safety-checker/'
                className='inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full border border-[#123c2f]/15 bg-[#fffdf8]/80 px-5 py-3.5 text-base font-bold text-[#123c2f] shadow-sm transition hover:border-[#b88a42]/35 hover:bg-[#f5efe2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b88a42] focus-visible:ring-offset-2 dark:border-[var(--border-strong)] dark:bg-[var(--surface-card)] dark:text-[var(--text-primary)] dark:hover:bg-[var(--surface-subtle)] sm:w-auto'
              >
                <ShieldCheck className='h-5 w-5' aria-hidden='true' strokeWidth={1.8} />
                Check interactions
              </Link>
            </div>
          </div>

          <div className='editorial-trust-strip -mx-5 grid grid-cols-1 gap-2 px-5 py-4 sm:-mx-10 sm:grid-cols-3 sm:px-10 lg:-mx-14 lg:px-14'>
            {trustItems.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.label} className='flex items-center gap-3 py-1'>
                  <span className='editorial-icon-disc h-10 w-10 shrink-0'>
                    <Icon className='h-5 w-5' aria-hidden='true' strokeWidth={1.8} />
                  </span>
                  <div>
                    <p className='text-sm font-bold text-[#123c2f] dark:text-[var(--text-primary)]'>{item.label}</p>
                    <p className='text-xs text-muted'>{item.body}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <section id='choose-a-path' className='editorial-card rounded-[2rem] p-5 scroll-mt-24 sm:p-8'>
          <div className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
            <SectionHeader
              title='Choose one path'
              subtitle='Begin with the outcome you care about. Each hub narrows the options before sending you into individual profiles.'
            />
            <Link
              href='/guides/'
              className='inline-flex shrink-0 items-center gap-2 text-sm font-bold text-[#315f50] transition hover:text-[#123c2f] dark:text-[var(--accent-teal)]'
            >
              Browse all guides <ArrowRight className='h-4 w-4' aria-hidden='true' />
            </Link>
          </div>

          <div className='mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4'>
            {heroGoals.map((goal) => {
              const Icon = goal.icon
              return (
                <Link
                  key={goal.slug}
                  href={goal.href}
                  className='editorial-link-tile group flex min-h-44 flex-col justify-between rounded-[1.4rem] p-4 transition duration-200 sm:min-h-52 sm:p-5'
                >
                  <div>
                    <span className='editorial-icon-disc mb-3 h-11 w-11 sm:h-12 sm:w-12'>
                      <Icon className='h-5 w-5 sm:h-6 sm:w-6' aria-hidden='true' strokeWidth={1.7} />
                    </span>
                    <h3 className='font-display text-xl font-semibold text-[#123c2f] dark:text-[var(--text-primary)] sm:text-2xl'>
                      {goal.title}
                    </h3>
                    <p className='mt-2 text-[0.8rem] leading-5 text-muted sm:text-sm sm:leading-6'>{goal.prompt}</p>
                  </div>
                  <span className='mt-4 inline-flex items-center gap-1.5 text-[0.8rem] font-bold text-[#315f50] transition group-hover:gap-2.5 dark:text-[var(--accent-teal)] sm:text-sm'>
                    Start here <ArrowRight className='h-3.5 w-3.5' aria-hidden='true' />
                  </span>
                </Link>
              )
            })}
          </div>
        </section>

        <section className='editorial-card rounded-[2rem] p-5 sm:p-8'>
          <div className='flex items-start justify-between gap-4'>
            <div>
              <p className='editorial-eyebrow'>Popular starting points</p>
              <SectionHeader
                title='Research a familiar supplement'
                subtitle='These are common first searches, not endorsements. Open a profile for evidence, dosing context, mechanisms, and safety.'
              />
            </div>
            <span className='editorial-icon-disc hidden h-14 w-14 shrink-0 sm:inline-flex'>
              <Library className='h-6 w-6' aria-hidden='true' strokeWidth={1.7} />
            </span>
          </div>

          <div className='mt-6 flex flex-wrap gap-2.5'>
            {popularProfiles.map((profile) => (
              <Link
                key={profile.href}
                href={profile.href}
                className='editorial-link-tile group inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold text-[#123c2f] transition dark:text-[var(--text-primary)]'
              >
                <span>{profile.label}</span>
                <span className='text-[0.65rem] font-semibold uppercase tracking-wider text-muted'>{profile.type}</span>
                <ArrowRight className='h-3.5 w-3.5 transition group-hover:translate-x-0.5' aria-hidden='true' />
              </Link>
            ))}
          </div>

          <div className='mt-6 flex flex-wrap gap-x-5 gap-y-3'>
            <Link
              href='/herbs/'
              className='inline-flex items-center gap-2 text-sm font-bold text-[#315f50] hover:text-[#123c2f] dark:text-[var(--accent-teal)]'
            >
              Browse all herbs <ArrowRight className='h-4 w-4' aria-hidden='true' />
            </Link>
            <Link
              href='/compounds/'
              className='inline-flex items-center gap-2 text-sm font-bold text-[#315f50] hover:text-[#123c2f] dark:text-[var(--accent-teal)]'
            >
              Browse all compounds <ArrowRight className='h-4 w-4' aria-hidden='true' />
            </Link>
          </div>
        </section>

        <section className='grid gap-5 lg:grid-cols-2'>
          <div className='editorial-card-strong rounded-[2rem] p-5 sm:p-8'>
            <p className='editorial-eyebrow'>Make a decision</p>
            <div className='mt-3 flex items-start justify-between gap-4'>
              <SectionHeader
                title='Compare before you choose'
                subtitle='Use side-by-side guides when the real question is which option fits your situation better.'
              />
              <span className='editorial-icon-disc hidden h-14 w-14 shrink-0 sm:inline-flex'>
                <Sparkles className='h-6 w-6' aria-hidden='true' strokeWidth={1.6} />
              </span>
            </div>
            <div className='mt-6 space-y-3'>
              {comparisonLinks.map((comparison) => (
                <Link
                  key={comparison.href}
                  href={comparison.href}
                  className='editorial-link-tile group flex items-center justify-between rounded-2xl px-4 py-3.5 text-sm font-bold text-[#123c2f] transition duration-200 dark:text-[var(--text-primary)]'
                >
                  <span>{comparison.title}</span>
                  <ArrowRight className='h-4 w-4 shrink-0 transition group-hover:translate-x-1' aria-hidden='true' />
                </Link>
              ))}
            </div>
            <Link
              href='/guides/compare/'
              className='mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#315f50] transition hover:text-[#123c2f] dark:text-[var(--accent-teal)]'
            >
              Browse all comparisons <ArrowRight className='h-4 w-4' aria-hidden='true' />
            </Link>
          </div>

          <div className='editorial-card rounded-[2rem] p-5 sm:p-8'>
            <p className='editorial-eyebrow'>Check the downside</p>
            <SectionHeader
              title='Use the safety tools'
              subtitle='Check interactions, evidence strength, and buying basics before combining or purchasing supplements.'
            />
            <div className='mt-6 space-y-3'>
              {toolLinks.map((tool) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className='editorial-link-tile group block rounded-2xl p-4 transition duration-200'
                >
                  <div className='flex items-start justify-between gap-3'>
                    <div>
                      <h3 className='text-sm font-bold text-[#123c2f] dark:text-[var(--text-primary)]'>{tool.title}</h3>
                      <p className='mt-1 text-sm leading-6 text-muted'>{tool.description}</p>
                    </div>
                    <ArrowRight
                      className='mt-1 h-4 w-4 shrink-0 text-[#315f50] transition group-hover:translate-x-1 dark:text-[var(--accent-teal)]'
                      aria-hidden='true'
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {latestArticles.length > 0 && (
          <section className='space-y-5'>
            <div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
              <SectionHeader
                title='Latest guides & research'
                subtitle='A small, fresh set of practical explainers and evidence reviews — not another endless homepage feed.'
              />
              <Link
                href='/guides/'
                className='inline-flex shrink-0 items-center gap-2 text-sm font-bold text-[#315f50] transition hover:text-[#123c2f] dark:text-[var(--accent-teal)]'
              >
                Browse the library <ArrowRight className='h-4 w-4' aria-hidden='true' />
              </Link>
            </div>

            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
              {latestArticles.map((article: any) => (
                <Link
                  key={article.slug}
                  href={`/articles/${article.slug}/`}
                  className='editorial-card group flex flex-col gap-3 rounded-[1.4rem] p-5 transition duration-200 hover:-translate-y-1 hover:border-[#b88a42]/30'
                >
                  <div className='flex items-center gap-2'>
                    {article.category ? (
                      <span className={`rounded-full border px-2.5 py-0.5 text-[0.72rem] font-medium ${categoryTagClass(article.category)}`}>
                        {article.category}
                      </span>
                    ) : null}
                    {article.readingTime ? <span className='text-[0.72rem] text-muted'>{article.readingTime}</span> : null}
                  </div>
                  <h3 className='font-display text-lg font-semibold leading-snug text-[#123c2f] transition group-hover:text-[#315f50] dark:text-[var(--text-primary)]'>
                    {article.title}
                  </h3>
                  {article.excerpt ? <p className='line-clamp-2 text-sm leading-6 text-muted'>{article.excerpt}</p> : null}
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className='editorial-card-strong relative overflow-hidden rounded-[2rem] p-6 sm:p-9'>
          <div className='editorial-botanical-orbit !-bottom-20 !-right-20 !opacity-40' aria-hidden='true'>
            <span />
            <span />
            <span />
            <span />
          </div>
          <div className='relative grid gap-7 lg:grid-cols-[0.9fr_1.1fr] lg:items-center'>
            <div>
              <p className='editorial-eyebrow'>How the site works</p>
              <h2 className='editorial-display mt-3 text-[2.25rem] sm:text-[3rem]'>Evidence, safety, then a conclusion.</h2>
              <p className='mt-4 max-w-lg text-sm leading-7 text-muted sm:text-base'>
                Profiles separate human evidence, biological plausibility, dosing context, and safety so a promising mechanism never masquerades as a proven benefit.
              </p>
              <Link
                href='/info/methodology/'
                className='mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#315f50] transition hover:text-[#123c2f] dark:text-[var(--accent-teal)]'
              >
                Read the evidence methodology <ArrowRight className='h-4 w-4' aria-hidden='true' />
              </Link>
            </div>

            <div className='grid gap-3 sm:grid-cols-3'>
              {trustItems.map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.label} className='editorial-link-tile rounded-[1.3rem] p-4'>
                    <span className='editorial-icon-disc h-10 w-10'>
                      <Icon className='h-5 w-5' aria-hidden='true' strokeWidth={1.8} />
                    </span>
                    <p className='mt-3 text-sm font-bold text-[#123c2f] dark:text-[var(--text-primary)]'>{item.label}</p>
                    <p className='mt-1 text-xs leading-5 text-muted'>{item.body}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}