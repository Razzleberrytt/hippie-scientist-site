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
    accent: 'text-[#1a3d5c]',
    ring: 'ring-[#a8c8e0]/40',
    bgHover: 'hover:bg-[#f0f6fa]',
  },
  {
    slug: 'stress',
    title: 'Stress',
    icon: Leaf,
    prompt: 'Sort adaptogens and calming supports by fatigue pattern, timing, and safety.',
    accent: 'text-[#1e4a2c]',
    ring: 'ring-[#8dc49a]/40',
    bgHover: 'hover:bg-[#f0f7f1]',
  },
  {
    slug: 'anxiety',
    title: 'Anxiety',
    icon: Cloud,
    prompt: 'Find grounded options for calm, overthinking, and daytime tension.',
    accent: 'text-[#4a2d6e]',
    ring: 'ring-[#c4aadf]/40',
    bgHover: 'hover:bg-[#f5f1fa]',
  },
  {
    slug: 'focus',
    title: 'Focus',
    icon: Zap,
    prompt: 'Compare non-stimulant focus supports and caffeine-adjacent options.',
    accent: 'text-[#5c3f0e]',
    ring: 'ring-[#d4aa62]/40',
    bgHover: 'hover:bg-[#faf6ed]',
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
    label: 'Evidence tiered, not flattened',
    body: 'Clinical evidence is separated from mechanism-only claims so you know what actually has human trial data.',
  },
  {
    label: 'Safety before recommendations',
    body: 'Interactions, contraindications, and uncertainty are surfaced before any product comparison.',
  },
  {
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
    <div className='max-w-3xl space-y-1.5'>
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
    <div className='overflow-x-clip bg-white'>
      <div className='mx-auto max-w-6xl space-y-10 px-4 pb-12 pt-4 sm:px-6 sm:space-y-12 sm:pb-16 sm:pt-6 lg:px-8'>

        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className='relative px-4 py-10 sm:px-8 sm:py-14'>
          <div className='relative mx-auto max-w-4xl'>
            <div className='flex flex-col items-center text-center'>
              <h1 className='font-display text-[2.75rem] font-bold leading-[1.02] tracking-[-0.02em] text-ink break-words sm:text-5xl md:text-[3.75rem]'>
                Herbs & supplements,<br />actually explained.
              </h1>
              <p className='mt-5 max-w-2xl text-base leading-7 text-muted sm:text-lg sm:leading-8'>
                Evidence-based guides for sleep, stress, anxiety, and focus. 816 peer-reviewed studies, 557 compounds, zero marketing fluff.
              </p>

              <div className='mt-8 flex w-full max-w-sm flex-col'>
                <Link
                  href='#choose-a-path'
                  className='rounded-full bg-brand-700 px-8 py-4 text-base font-bold text-white shadow-[0_4px_16px_rgba(13,23,18,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-800 hover:shadow-[0_8px_24px_rgba(13,23,18,0.24)] active:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 text-center'
                >
                  Browse by Health Goal
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Comparisons and tools */}
        <section className='grid gap-4 lg:grid-cols-[1fr_0.9fr]'>
          <div className='rounded-xl bg-white p-6 shadow-[0_1px_2px_rgba(13,23,18,0.06)] sm:p-7 dark:bg-[var(--surface-card)]'>
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
                  className='rounded-lg bg-brand-50 px-4 py-3 text-sm font-bold text-brand-800 transition hover:bg-brand-100 dark:bg-[var(--surface-subtle)] dark:hover:bg-[var(--surface-code)]'
                >
                  {comparison.title} →
                </Link>
              ))}
            </div>
            <Link href='/guides/compare/' className='mt-5 inline-flex text-sm font-bold text-brand-700 transition hover:text-brand-800'>
              Browse all comparisons →
            </Link>
          </div>

          <div className='rounded-xl bg-white p-6 shadow-[0_1px_2px_rgba(13,23,18,0.06)] sm:p-7 dark:bg-[var(--surface-card)]'>
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
                  className='block rounded-lg bg-brand-50/70 p-4 transition hover:bg-brand-100 dark:bg-[var(--surface-subtle)] dark:hover:bg-[var(--surface-code)]'
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
                  className={`group flex min-h-48 flex-col justify-between rounded-xl bg-white p-5 shadow-[0_1px_2px_rgba(13,23,18,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(13,23,18,0.12)] dark:bg-[var(--surface-card)]`}
                >
                  <div>
                    <span
                      className={`mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white ${hGoal.ring} ring-1 dark:bg-[var(--surface-subtle)] dark:text-[var(--text-primary)]`}
                      aria-hidden='true'
                    >
                      <Icon className={`h-6 w-6 ${hGoal.accent}`} strokeWidth={1.75} />
                    </span>
                    <h3 className={`text-2xl font-bold tracking-tight ${hGoal.accent} dark:text-[var(--text-primary)]`}>
                      {hGoal.title}
                    </h3>
                    <p className='mt-3 text-sm leading-6 text-muted dark:text-[var(--text-secondary)]'>{hGoal.prompt}</p>
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
                  className='group flex flex-col gap-3 rounded-xl bg-white p-5 shadow-[0_1px_2px_rgba(13,23,18,0.06)] transition-all duration-200 hover:shadow-[0_8px_24px_rgba(13,23,18,0.12)] dark:bg-[var(--surface-card)]'
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
                  <h3 className='text-base font-semibold leading-snug text-ink group-hover:text-brand-700 dark:group-hover:text-[var(--text-primary)]'>
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
        <section className='rounded-xl bg-white p-6 shadow-[0_1px_2px_rgba(13,23,18,0.06)] sm:p-8 dark:bg-[var(--surface-card)]'>
          <div className='grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start'>
            <SectionHeader
              title='Why trust the guide?'
              subtitle='The site is built for cautious decisions: what has human evidence, what is only plausible, and what needs safety review before use.'
              as='h2'
            />
            <div className='grid gap-4 sm:grid-cols-3'>
              {trustItems.map((item) => (
                <div key={item.label} className='dark:text-[var(--text-secondary)]'>
                  <p className='text-sm font-semibold text-ink'>{item.label}</p>
                  <p className='mt-1.5 text-sm leading-6 text-muted'>{item.body}</p>
                </div>
              ))}
            </div>
          </div>
          <div className='mt-6 text-sm font-bold'>
            <Link href='/info/methodology/' className='text-brand-700 transition hover:text-brand-800'>
              Read the evidence methodology →
            </Link>
          </div>
        </section>

      </div>
    </div>
  )
}