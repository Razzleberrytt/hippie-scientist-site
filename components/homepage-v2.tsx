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
    icon: Moon,
    prompt: 'Fall asleep, stay asleep, and compare sleep supplements without guessing.',
  },
  {
    slug: 'stress',
    title: 'Stress',
    icon: Leaf,
    prompt: 'Sort adaptogens and calming supports by fatigue pattern, timing, and safety.',
  },
  {
    slug: 'anxiety',
    title: 'Anxiety',
    icon: Cloud,
    prompt: 'Find grounded options for calm, overthinking, and daytime tension.',
  },
  {
    slug: 'focus',
    title: 'Focus',
    icon: Zap,
    prompt: 'Compare non-stimulant focus supports and caffeine-adjacent options.',
  },
]

const CATEGORY_TAG_COLORS: Record<string, string> = {
  'metabolic health': 'border-stone-300 bg-stone-100 text-stone-700 dark:bg-stone-800/30 dark:text-stone-200 dark:border-stone-700',
  'cognitive health': 'border-emerald-300 bg-emerald-100 text-emerald-800 dark:bg-emerald-800/20 dark:text-emerald-200 dark:border-emerald-700',
  'anxiety & sleep': 'border-violet-300 bg-violet-100 text-violet-800 dark:bg-violet-800/20 dark:text-violet-200 dark:border-violet-700',
  general: 'border-amber-300 bg-amber-100 text-amber-800 dark:bg-amber-800/20 dark:text-amber-200 dark:border-amber-700',
}

function categoryTagClass(category: string): string {
  return (
    CATEGORY_TAG_COLORS[category.toLowerCase()] ||
    'border-brand-200 bg-brand-50 text-brand-700 dark:bg-[var(--surface-subtle)] dark:text-[var(--text-secondary)]'
  )
}

const trustItems = [
  {
    label: 'Evidence-first',
    body: 'Cite and verify',
    icon: FlaskConical,
  },
  {
    label: 'Safety aware',
    body: 'Context matters',
    icon: ShieldCheck,
  },
  {
    label: 'Clear and honest',
    body: 'No marketing fluff',
    icon: BookOpen,
  },
]

const comparisonLinks = [
  { href: '/guides/compare/melatonin-vs-magnesium/', title: 'Melatonin vs magnesium' },
  { href: '/guides/compare/rhodiola-vs-ashwagandha/', title: 'Rhodiola vs ashwagandha' },
  { href: '/guides/compare/ashwagandha-vs-l-theanine-vs-magnesium/', title: 'Ashwagandha vs L-theanine vs magnesium' },
  { href: '/guides/compare/berberine-vs-metformin/', title: 'Berberine vs metformin' },
]

const toolLinks = [
  {
    href: '/safety-checker/',
    title: 'Safety interaction checker',
    description: 'Screen combinations for overlapping cautions before stacking.',
  },
  {
    href: '/info/supplement-safety-checklist/',
    title: 'Supplement safety checklist',
    description: 'Use five practical questions before comparing products or buying.',
  },
  {
    href: '/evidence/evidence-checker/',
    title: 'Evidence decision tools',
    description: 'Check evidence strength, dosing context, and uncertainty.',
  },
]

const popularProfiles = [
  { href: '/herbs/ashwagandha/', label: 'Ashwagandha', type: 'Herb' },
  { href: '/herbs/rhodiola/', label: 'Rhodiola', type: 'Herb' },
  { href: '/compounds/magnesium/', label: 'Magnesium', type: 'Compound' },
  { href: '/compounds/l-theanine/', label: 'L-theanine', type: 'Compound' },
  { href: '/compounds/melatonin/', label: 'Melatonin', type: 'Compound' },
]

const evidenceSteps = [
  {
    label: 'Strong',
    tone: 'bg-emerald-700 dark:bg-emerald-400',
    description: 'Consistent human clinical evidence',
  },
  {
    label: 'Moderate',
    tone: 'bg-amber-600 dark:bg-amber-400',
    description: 'Useful human evidence with limitations',
  },
  {
    label: 'Limited',
    tone: 'bg-stone-500 dark:bg-stone-400',
    description: 'Early, mixed, or indirect evidence',
  },
]

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
  const featuredArticles = articles
    .filter((article: any) => article.date && article.published !== false)
    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6)

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
            <p className='editorial-eyebrow'>Evidence-based supplement guidance</p>
            <h1 className='editorial-display mt-4 max-w-[12ch] text-[2.55rem] sm:text-[4.6rem] lg:text-[5.6rem]'>
              Herbs &amp; supplements, actually explained.
            </h1>
            <p className='mt-5 max-w-xl text-base leading-7 text-[#33433c] sm:mt-6 sm:text-lg sm:leading-8 dark:text-[var(--text-secondary)]'>
              Evidence-based guides for sleep, stress, anxiety, and focus — mechanisms, safety context, and practical comparisons without marketing fluff.
            </p>

            <div className='mt-7 sm:mt-9'>
              <Link
                href='#choose-a-path'
                className='editorial-cta inline-flex w-full max-w-md items-center justify-between rounded-full px-5 py-4 text-base font-bold transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b88a42] focus-visible:ring-offset-2 sm:px-7'
              >
                <span className='inline-flex items-center gap-3'>
                  <Leaf className='h-5 w-5 text-[#dec69b]' aria-hidden='true' strokeWidth={1.8} />
                  Browse by Health Goal
                </span>
                <ArrowRight className='h-5 w-5 text-[#dec69b]' aria-hidden='true' />
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

        <section className='grid gap-5 lg:grid-cols-[1.15fr_0.85fr]'>
          <div className='editorial-card-strong rounded-[2rem] p-5 sm:p-8'>
            <p className='editorial-eyebrow'>Smarter choices</p>
            <div className='mt-3 flex items-start justify-between gap-4'>
              <SectionHeader
                title='Compare before you choose'
                subtitle='Side-by-side guides answer the questions people ask before buying, combining, or switching products.'
              />
              <span className='editorial-icon-disc hidden h-16 w-16 shrink-0 sm:inline-flex'>
                <Sparkles className='h-7 w-7' aria-hidden='true' strokeWidth={1.6} />
              </span>
            </div>
            <div className='mt-6 grid gap-3 sm:grid-cols-2'>
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
            <Link href='/guides/compare/' className='mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#315f50] transition hover:text-[#123c2f] dark:text-[var(--accent-teal)]'>
              Browse all comparisons <ArrowRight className='h-4 w-4' aria-hidden='true' />
            </Link>
          </div>

          <div className='editorial-card rounded-[2rem] p-5 sm:p-8'>
            <p className='editorial-eyebrow'>Safety first</p>
            <SectionHeader
              title='Use the safety tools'
              subtitle='Avoid mismatched products, risky stacks, and unclear supplement forms before they become expensive mistakes.'
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
                    <ArrowRight className='mt-1 h-4 w-4 shrink-0 text-[#315f50] transition group-hover:translate-x-1 dark:text-[var(--accent-teal)]' aria-hidden='true' />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section id='choose-a-path' className='editorial-card rounded-[2rem] p-5 scroll-mt-24 sm:p-8'>
          <div className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
            <SectionHeader
              title='Choose one path'
              subtitle='Start with the outcome you care about, then compare evidence and safety inside that guide.'
            />
            <Link href='/guides/' className='inline-flex shrink-0 items-center gap-2 text-sm font-bold text-[#315f50] transition hover:text-[#123c2f] dark:text-[var(--accent-teal)]'>
              View all guides <ArrowRight className='h-4 w-4' aria-hidden='true' />
            </Link>
          </div>

          <div className='mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4'>
            {heroGoals.map((goal) => {
              const Icon = goal.icon
              return (
                <Link
                  key={goal.slug}
                  href={goal.slug === 'stress' || goal.slug === 'anxiety' ? '/guides/anxiety/' : `/guides/${goal.slug}/`}
                  className='editorial-link-tile group flex min-h-44 flex-col justify-between rounded-[1.4rem] p-4 transition duration-200 sm:min-h-52 sm:p-5'
                >
                  <div>
                    <span className='editorial-icon-disc mb-3 h-11 w-11 sm:h-12 sm:w-12'>
                      <Icon className='h-5 w-5 sm:h-6 sm:w-6' aria-hidden='true' strokeWidth={1.7} />
                    </span>
                    <h3 className='font-display text-xl font-semibold text-[#123c2f] dark:text-[var(--text-primary)] sm:text-2xl'>{goal.title}</h3>
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

        <section className='grid gap-5 lg:grid-cols-[1.1fr_0.9fr]'>
          <div className='editorial-card rounded-[2rem] p-5 sm:p-8'>
            <div className='flex items-start justify-between gap-4'>
              <div>
                <p className='editorial-eyebrow'>Depth library</p>
                <SectionHeader
                  title='Look up a specific supplement'
                  subtitle='Go beyond a quick recommendation with a profile covering evidence, mechanisms, dosing context, and safety.'
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
              <Link href='/herbs/' className='inline-flex items-center gap-2 text-sm font-bold text-[#315f50] hover:text-[#123c2f] dark:text-[var(--accent-teal)]'>
                Browse all herbs <ArrowRight className='h-4 w-4' aria-hidden='true' />
              </Link>
              <Link href='/compounds/' className='inline-flex items-center gap-2 text-sm font-bold text-[#315f50] hover:text-[#123c2f] dark:text-[var(--accent-teal)]'>
                Browse all compounds <ArrowRight className='h-4 w-4' aria-hidden='true' />
              </Link>
            </div>
          </div>

          <div className='editorial-card-strong rounded-[2rem] p-5 sm:p-8'>
            <p className='editorial-eyebrow'>Read the signal</p>
            <SectionHeader
              title='Evidence strength, in plain English'
              subtitle='A mechanism can be plausible without proving a real-world benefit. Our labels prioritize human research.'
            />
            <div className='mt-6 space-y-4'>
              {evidenceSteps.map((step) => (
                <div key={step.label} className='grid grid-cols-[0.7rem_1fr] gap-3'>
                  <span className={`mt-1 h-3 w-3 rounded-full ${step.tone}`} aria-hidden='true' />
                  <div>
                    <p className='text-sm font-bold text-[#123c2f] dark:text-[var(--text-primary)]'>{step.label}</p>
                    <p className='mt-0.5 text-sm leading-6 text-muted'>{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link href='/learn/evidence-levels/' className='mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#315f50] hover:text-[#123c2f] dark:text-[var(--accent-teal)]'>
              How we grade evidence <ArrowRight className='h-4 w-4' aria-hidden='true' />
            </Link>
          </div>
        </section>

        {featuredArticles.length > 0 && (
          <section className='space-y-5'>
            <div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
              <SectionHeader
                title='Latest research'
                subtitle='Evidence reviews, mechanism deep-dives, and practical guides — updated regularly.'
              />
              <Link href='/guides/' className='inline-flex shrink-0 items-center gap-2 text-sm font-bold text-[#315f50] transition hover:text-[#123c2f] dark:text-[var(--accent-teal)]'>
                Browse all guides <ArrowRight className='h-4 w-4' aria-hidden='true' />
              </Link>
            </div>
            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
              {featuredArticles.map((article: any) => (
                <Link
                  key={article.slug}
                  href={`/articles/${article.slug}/`}
                  className='editorial-card group flex flex-col gap-3 rounded-[1.4rem] p-5 transition duration-200 hover:-translate-y-1 hover:border-[#b88a42]/30'
                >
                  <div className='flex items-center gap-2'>
                    {article.category && (
                      <span className={`rounded-full border px-2.5 py-0.5 text-[0.72rem] font-medium ${categoryTagClass(article.category)}`}>
                        {article.category}
                      </span>
                    )}
                    {article.readingTime && <span className='text-[0.72rem] text-muted'>{article.readingTime}</span>}
                  </div>
                  <h3 className='font-display text-lg font-semibold leading-snug text-[#123c2f] transition group-hover:text-[#315f50] dark:text-[var(--text-primary)]'>
                    {article.title}
                  </h3>
                  {article.excerpt && <p className='line-clamp-2 text-sm leading-6 text-muted'>{article.excerpt}</p>}
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className='editorial-card-strong relative overflow-hidden rounded-[2rem] p-6 sm:p-9'>
          <div className='editorial-botanical-orbit !-right-20 !-bottom-20 !opacity-40' aria-hidden='true'>
            <span />
            <span />
            <span />
            <span />
          </div>
          <div className='relative grid gap-7 lg:grid-cols-[0.8fr_1.2fr] lg:items-start'>
            <div>
              <span className='editorial-icon-disc mb-4 h-14 w-14'>
                <Leaf className='h-7 w-7' aria-hidden='true' strokeWidth={1.7} />
              </span>
              <h2 className='editorial-display text-[2.25rem] sm:text-[3rem]'>Built on evidence, not trends.</h2>
              <p className='mt-4 max-w-lg text-sm leading-7 text-muted sm:text-base'>
                We evaluate the research so you do not have to. Transparent source notes help you understand the “why” behind every claim.
              </p>
              <Link href='/info/methodology/' className='mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#315f50] transition hover:text-[#123c2f] dark:text-[var(--accent-teal)]'>
                Read the evidence methodology <ArrowRight className='h-4 w-4' aria-hidden='true' />
              </Link>
            </div>
            <div className='grid gap-4 sm:grid-cols-3'>
              {trustItems.map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.label} className='editorial-link-tile flex items-center gap-3.5 rounded-[1.3rem] p-4 sm:block'>
                    <span className='editorial-icon-disc h-10 w-10 shrink-0'>
                      <Icon className='h-5 w-5' aria-hidden='true' strokeWidth={1.8} />
                    </span>
                    <div>
                      <p className='text-sm font-bold text-[#123c2f] sm:mt-3 dark:text-[var(--text-primary)]'>{item.label}</p>
                      <p className='mt-0.5 text-xs leading-5 text-muted sm:mt-1'>{item.body}</p>
                    </div>
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
