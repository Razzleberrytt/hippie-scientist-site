import Link from 'next/link'
import { Cloud, Leaf, Moon, Zap } from 'lucide-react'
import articlesData from '@/data/articles/articles.json'

type SectionHeaderProps = { title: string; subtitle?: string; as?: 'h2' | 'h3' }

const heroGoals = [
  {
    slug: 'sleep',
    title: 'Sleep',
    icon: Moon,
    prompt: 'Fall asleep, stay asleep, and compare sleep supplements without guessing.',
    bg: 'bg-[#dceef8] border-[#a8c8e0]',
    accent: 'text-[#1a3d5c]',
  },
  {
    slug: 'stress',
    title: 'Stress',
    icon: Leaf,
    prompt: 'Sort adaptogens and calming supports by fatigue pattern, timing, and safety.',
    bg: 'bg-[#ddf0df] border-[#8dc49a]',
    accent: 'text-[#1e4a2c]',
  },
  {
    slug: 'anxiety',
    title: 'Anxiety',
    icon: Cloud,
    prompt: 'Find grounded options for calm, overthinking, and daytime tension.',
    bg: 'bg-[#ebe2f8] border-[#c4aadf]',
    accent: 'text-[#4a2d6e]',
  },
  {
    slug: 'focus',
    title: 'Focus',
    icon: Zap,
    prompt: 'Compare non-stimulant focus supports and caffeine-adjacent options.',
    bg: 'bg-[#f9ecce] border-[#d4aa62]',
    accent: 'text-[#5c3f0e]',
  },
]

const CATEGORY_TAG_COLORS: Record<string, string> = {
  'metabolic health': 'border-stone-400/30 bg-stone-200/70 text-stone-800 dark:bg-stone-300/10 dark:text-stone-100',
  'cognitive health': 'border-emerald-600/25 bg-emerald-100/70 text-emerald-900 dark:bg-emerald-300/10 dark:text-emerald-100',
  'anxiety & sleep': 'border-violet-600/25 bg-violet-100/70 text-violet-900 dark:bg-violet-300/10 dark:text-violet-100',
  general: 'border-amber-600/25 bg-amber-100/70 text-amber-900 dark:bg-amber-300/10 dark:text-amber-100',
}

function categoryTagClass(category: string): string {
  return (
    CATEGORY_TAG_COLORS[category.toLowerCase()] ||
    'border-brand-900/10 bg-brand-50 text-brand-700 dark:bg-[var(--surface-subtle)] dark:text-[var(--text-secondary)]'
  )
}

const trustSignals = [
  {
    n: '01',
    label: 'Evidence tiered, not flattened',
    body: 'Clinical evidence is separated from mechanism-only claims so you know what actually has human trial data.',
  },
  {
    n: '02',
    label: 'Safety before recommendations',
    body: 'Interactions, contraindications, and uncertainty are surfaced before any product comparison.',
  },
  {
    n: '03',
    label: 'Methodology is public',
    body: 'Every guide links to the evidence grading system so you can audit the claims yourself.',
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
    description: 'Screen supplement combinations for overlapping cautions before stacking.',
  },
  {
    href: '/info/supplement-safety-checklist/',
    title: 'Supplement safety checklist',
    description: 'Use five safety questions before comparing products or buying.',
  },
  {
    href: '/evidence/evidence-checker/',
    title: 'Decision tools',
    description: 'Open the site tools built for safety, dosing, and practical comparison.',
  },
]

function SectionHeader({ title, subtitle, as: HeadingTag = 'h2' }: SectionHeaderProps) {
  return (
    <div className='max-w-3xl space-y-2'>
      <HeadingTag className='font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl'>{title}</HeadingTag>
      {subtitle ? <p className='text-sm leading-6 text-muted sm:text-base'>{subtitle}</p> : null}
    </div>
  )
}

export default function HomepageV2() {
  const articles = Array.isArray(articlesData) ? articlesData : (articlesData as any).articles || []
  const featuredArticles = articles
    .filter((a: any) => a.date && a.published !== false)
    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6)

  return (
    <div className='overflow-x-clip bg-[var(--bg)]'>
      <div className='mx-auto max-w-6xl space-y-8 px-4 pb-12 pt-4 sm:px-6 sm:space-y-10 sm:pb-16 sm:pt-6 lg:px-8'>

        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className='relative px-6 py-8 sm:px-10 sm:py-12'>
          <div className='relative mx-auto max-w-4xl'>
            <div className='flex flex-col items-center text-center'>
              <h1 className='font-display text-[2.75rem] font-bold leading-[1.02] tracking-[-0.02em] text-ink break-words sm:text-5xl md:text-[3.75rem]'>
                Herbs & supplements,<br />actually explained.
              </h1>
              <p className='mt-5 max-w-2xl text-sm font-medium leading-7 text-muted sm:text-base sm:leading-8'>
                Evidence-based guides for sleep, stress, anxiety, and focus. 816 peer-reviewed studies, 557 compounds, zero marketing fluff.
              </p>

              <div className='mt-8 flex w-full max-w-sm flex-col'>
                <Link
                  href='#choose-a-path'
                  className='rounded-full bg-brand-800 px-8 py-4 text-base font-bold text-white shadow-[0_6px_20px_rgba(11,29,20,0.3)] transition-all duration-200 motion-safe:hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-[0_10px_26px_rgba(11,29,20,0.35)] active:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 text-center'
                >
                  Browse by Health Goal
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Comparisons and tools */}
        <section className='grid gap-4 lg:grid-cols-[1fr_0.9fr]'>
          <div className='rounded-[1rem] border-2 border-brand-900/12 bg-white/90 p-5 shadow-md sm:p-6 dark:border-[var(--border-strong)] dark:bg-[var(--surface-card)]'>
            <SectionHeader
              title='Compare before you choose'
              subtitle='Side-by-side pages help answer the high-intent questions people search before buying or stacking.'
              as='h2'
            />
            <div className='mt-5 grid gap-2 sm:grid-cols-2'>
              {comparisonLinks.map((comparison) => (
                <Link
                  key={comparison.href}
                  href={comparison.href}
                  className='rounded-[0.75rem] border-2 border-brand-900/12 bg-brand-50/50 px-4 py-3 text-sm font-bold text-brand-800 transition hover:border-brand-700/25 hover:bg-brand-50 dark:bg-[var(--surface-subtle)]'
                >
                  {comparison.title} →
                </Link>
              ))}
            </div>
            <Link href='/guides/compare/' className='mt-5 inline-flex text-sm font-bold text-brand-700 transition hover:text-brand-800'>
              Browse all comparisons →
            </Link>
          </div>

          <div className='rounded-[1rem] border-2 border-brand-900/12 bg-white/90 p-5 shadow-md sm:p-6 dark:border-[var(--border-strong)] dark:bg-[var(--surface-card)]'>
            <SectionHeader
              title='Use the safety tools'
              subtitle='The fastest win is avoiding mismatched products, risky stacks, and unclear supplement forms.'
              as='h2'
            />
            <div className='mt-5 space-y-3'>
              {toolLinks.map((tool) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className='block rounded-[0.75rem] border-2 border-brand-900/12 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/25 hover:bg-white dark:bg-[var(--surface-subtle)]'
                >
                  <h3 className='text-sm font-bold text-ink'>{tool.title}</h3>
                  <p className='mt-1 text-sm leading-6 text-muted'>{tool.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Goal Pathways */}
        <section id='choose-a-path' className='scroll-mt-24 space-y-4'>
          <div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
            <SectionHeader
              title='Choose one path'
              subtitle='Most visitors should start here. Pick the outcome you care about, then compare options inside that guide.'
              as='h2'
            />
            <Link href='/guides/' className='text-sm font-bold text-brand-700 transition hover:text-brand-800 shrink-0'>
              View all guides →
            </Link>
          </div>

          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            {heroGoals.map((hGoal) => {
              const Icon = hGoal.icon
              return (
                <Link
                  key={hGoal.slug}
                  href={hGoal.slug === 'stress' || hGoal.slug === 'anxiety' ? '/guides/anxiety/' : `/guides/${hGoal.slug}/`}
                  className={`group flex min-h-48 flex-col justify-between rounded-[1.25rem] border-2 ${hGoal.bg} p-5 shadow-md transition-all duration-300 motion-safe:hover:-translate-y-1 hover:shadow-xl dark:border-[var(--border-strong)] dark:bg-[var(--surface-card)]`}
                >
                  <div>
                    <span
                      className={`mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/80 shadow-sm ${hGoal.accent} dark:bg-[var(--surface-subtle)] dark:text-[var(--text-primary)]`}
                      aria-hidden='true'
                    >
                      <Icon className='h-6 w-6' strokeWidth={1.75} />
                    </span>
                    <h3 className={`text-2xl font-bold tracking-tight ${hGoal.accent} dark:text-[var(--text-primary)]`}>
                      {hGoal.title}
                    </h3>
                    <p className='mt-3 text-sm font-medium leading-6 text-prose-soft dark:text-[var(--text-secondary)]'>{hGoal.prompt}</p>
                  </div>
                  <span className='mt-5 inline-flex text-sm font-bold text-brand-700 transition group-hover:translate-x-1 group-hover:text-brand-800'>
                    Start with {hGoal.title} <span aria-hidden='true' className='ml-1'>→</span>
                  </span>
                </Link>
              )
            })}
          </div>
        </section>

        {/* Featured Articles */}
        {featuredArticles.length > 0 && (
          <section className='space-y-4'>
            <div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
              <SectionHeader
                title='Latest research'
                subtitle='Evidence reviews, mechanism deep-dives, and practical guides — updated regularly.'
                as='h2'
              />
              <Link href='/guides/' className='text-sm font-bold text-brand-700 transition hover:text-brand-800 shrink-0'>
                Browse all guides →
              </Link>
            </div>
            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
              {featuredArticles.map((article: any) => (
                <Link
                  key={article.slug}
                  href={`/articles/${article.slug}/`}
                  className='group flex flex-col gap-3 rounded-[1rem] border-2 border-brand-900/12 bg-white/90 p-5 shadow-md transition-all duration-200 hover:border-brand-700/25 hover:shadow-lg dark:border-[var(--border-strong)] dark:bg-[var(--surface-card)]'
                >
                  <div className='flex items-center gap-2'>
                    {article.category && (
                      <span className={`rounded-full border px-2.5 py-0.5 text-[0.72rem] font-medium ${categoryTagClass(article.category)}`}>
                        {article.category}
                      </span>
                    )}
                    {article.readingTime && (
                      <span className='text-[0.72rem] text-muted'>{article.readingTime}</span>
                    )}
                  </div>
                  <h3 className='text-base font-semibold leading-snug text-ink group-hover:text-brand-800 dark:group-hover:text-[var(--text-primary)]'>
                    {article.title}
                  </h3>
                  {article.excerpt && (
                    <p className='line-clamp-2 text-sm leading-6 text-muted'>{article.excerpt}</p>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Trust */}
        <section className='rounded-[1rem] border-2 border-brand-900/12 bg-white/90 p-5 shadow-md sm:p-6'>
          <div className='grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start'>
            <SectionHeader
              title='Why trust the guide?'
              subtitle='The site is built for cautious decisions: what has human evidence, what is only plausible, and what needs safety review before use.'
              as='h2'
            />
            <div className='grid gap-3 sm:grid-cols-3'>
              {trustSignals.map((signal) => (
                <div key={signal.n} className='flex gap-4 rounded-[0.85rem] border-2 border-brand-900/12 bg-white/70 p-4 shadow-sm dark:bg-[var(--surface-card)] dark:text-[var(--text-secondary)]'>
                  <span className='mt-0.5 shrink-0 font-mono text-xs font-bold tracking-widest text-brand-400'>{signal.n}</span>
                  <div>
                    <p className='text-sm font-semibold text-ink'>{signal.label}</p>
                    <p className='mt-1 text-sm leading-6 text-muted'>{signal.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className='mt-5 text-sm font-bold'>
            <Link href='/info/methodology/' className='text-brand-700 transition hover:text-brand-800'>
              Read the evidence methodology →
            </Link>
          </div>
        </section>

      </div>
    </div>
  )
}
