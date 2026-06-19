import Link from 'next/link'
import { focusAdhdArticles } from '@/lib/focus-adhd-articles'
import { getHomepageFreshness } from '@/lib/freshness'

type SectionHeaderProps = { title: string; subtitle?: string; as?: 'h2' | 'h3' }

const focusAdhdGuideCards = focusAdhdArticles.slice(0, 3).map((article) => ({
  href: `/articles/${article.slug}`,
  title: article.title.split(':')[0],
  description: article.description,
  category: article.category,
  readingTime: article.readingTime,
}))

const featuredArticles = [
  {
    href: '/articles/sleep-best-supplements',
    label: 'Sleep Guide',
    title: 'Best Supplements for Sleep: Evidence-Based Guide',
    description: 'Magnesium, melatonin, valerian, and L-theanine compared by sleep problem, evidence quality, timing, and safety cautions.',
    readingTime: '13 min read',
  },
  {
    href: '/articles/lions-mane',
    label: 'Deep Dive',
    title: "Lion's Mane: Mechanisms, Clinical Evidence & Dosage",
    description: "NGF and BDNF pathways, three randomized trials in MCI and mild Alzheimer's, and practical dosing guidance with extract selection criteria.",
    readingTime: '12 min read',
  },
  {
    href: '/articles/rhodiola-vs-ashwagandha',
    label: 'Comparison',
    title: 'Rhodiola vs. Ashwagandha: Matching Adaptogens to Your Needs',
    description: "Cortisol timing, fatigue profiles, and when stimulating adaptogens outperform sedating ones — and vice versa.",
    readingTime: '5 min read',
  },
]

const heroGoals = [
  { slug: 'sleep', title: '😴 Sleep Support', bg: 'bg-gradient-to-br from-[#fffdf7] to-[#f4f1e8] border-[#cbd8c0]', desc: 'Quieting bedtime worry & support for natural onset.' },
  { slug: 'stress', title: '😌 Stress & Fatigue', bg: 'bg-gradient-to-br from-[#fffdf7] to-[#f3f5ee] border-[#c6d0bd]', desc: 'Adaptogens for cortisol regulation & mental burnout.' },
  { slug: 'anxiety', title: '😟 Anxiety & Calm', bg: 'bg-gradient-to-br from-[#fffdf7] to-[#eef2e8] border-[#c3d0bc]', desc: 'Promoting daytime peace without heavy daytime sedation.' },
  { slug: 'focus', title: '🧠 Focus & Alertness', bg: 'bg-gradient-to-br from-[#fffdf7] to-[#f1f3ed] border-[#c7d0c2]', desc: 'Alertness support & smoothing stimulant jitters.' },
]

function SectionHeader({ title, subtitle, as: HeadingTag = 'h2' }: SectionHeaderProps) {
  return (
    <div className='max-w-3xl space-y-2'>
      <HeadingTag className='text-xl font-semibold tracking-tight text-ink sm:text-2xl'>{title}</HeadingTag>
      {subtitle ? <p className='text-sm leading-6 text-muted sm:text-base'>{subtitle}</p> : null}
    </div>
  )
}

function ActionCue({ children }: { children: React.ReactNode }) {
  return (
    <span className='inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 transition group-hover:translate-x-1 group-hover:text-brand-800'>
      {children} <span aria-hidden='true'>→</span>
    </span>
  )
}

export default function HomepageV2() {
  const { lastReviewed, citationCount } = getHomepageFreshness()
  const formattedDate = new Date(lastReviewed).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className='overflow-x-clip bg-site-bg'>
      <div className='mx-auto max-w-6xl space-y-8 px-4 pb-12 pt-4 sm:px-6 sm:space-y-10 sm:pb-16 sm:pt-6 lg:px-8'>

        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className='rounded-[1.25rem] border border-brand-900/10 bg-white/90 px-6 py-8 shadow-sm sm:px-10 sm:py-12'>
          <div className='mx-auto max-w-4xl'>
            <div className='flex flex-col items-center text-center'>
              <p role='doc-subtitle' className='mb-3 inline-flex text-[0.7rem] font-bold uppercase tracking-[0.2em] text-brand-700'>
                Evidence-first supplement decisions
              </p>
              <h1 className='font-display text-[2.5rem] font-bold leading-[1.05] tracking-[-0.04em] text-ink break-words sm:text-5xl md:text-6xl'>
                Supplement Science Without the&nbsp;Hype
              </h1>
              <p className='mt-5 max-w-2xl text-sm font-medium leading-7 text-muted sm:text-base sm:leading-8'>
                Evidence-based herbs and supplements for <strong className='text-ink'>sleep, stress, anxiety, and focus</strong>, with clinical trial findings separated from mechanism-only marketing claims.
              </p>
              
              <div className='mt-4 flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-brand-800' aria-label={`Last reviewed: ${formattedDate}. ${citationCount} peer-reviewed studies cited. Evidence methodology available.`}>
                <span className='rounded-full border border-brand-900/10 bg-brand-50/50 px-3.5 py-1'>✓ Last reviewed: {formattedDate}</span>
                <span className='rounded-full border border-brand-900/10 bg-brand-50/50 px-3.5 py-1'>✓ {citationCount} peer-reviewed studies</span>
                <Link href='/methodology' className='rounded-full border border-brand-900/10 bg-brand-50/50 px-3.5 py-1 transition hover:bg-brand-50 hover:text-brand-900'>
                  ✓ Evidence methodology
                </Link>
              </div>
              <div className='mt-6 grid w-full max-w-lg gap-2.5 sm:grid-cols-2'>
                <Link
                  href='/goals'
                  className='rounded-full border border-brand-900/15 bg-brand-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-brand-800 focus:outline-none text-center'
                >
                  Browse by Health Goal
                </Link>
                <Link
                  href='/articles'
                  className='rounded-full border border-brand-900/10 bg-white px-5 py-3 text-sm font-bold text-ink shadow-sm transition hover:-translate-y-0.5 hover:border-brand-900/20 hover:bg-brand-50/70 focus:outline-none text-center'
                >
                  Explore Evidence Guides
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Evidence Reviews: Goal Pathways ──────────────────── */}
        <section className='space-y-4'>
          <div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
            <SectionHeader
              title='Featured Goals'
              subtitle='Choose the health goal that best matches what you want to solve first.'
              as='h2'
            />
            <Link href='/goals' className='text-sm font-bold text-brand-700 transition hover:text-brand-800 shrink-0'>
              View all goals →
            </Link>
          </div>

          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            {heroGoals.map((hGoal) => (
                <Link
                  key={hGoal.slug}
                  href={`/goals/${hGoal.slug}`}
                  className={`group flex flex-col justify-between rounded-[1rem] border ${hGoal.bg} p-4 shadow-sm transition-all duration-300 hover:scale-[1.01] hover:shadow-md dark:border-[var(--border-strong)] dark:from-[var(--surface-card-strong)] dark:to-[var(--surface-card)]`}
                >
                  <h3 className='text-lg font-bold tracking-tight text-[#111a16] transition group-hover:text-brand-900 dark:text-[var(--text-primary)] dark:group-hover:text-brand-800'>
                    {hGoal.title}
                  </h3>
                  <p className='mt-1.5 text-sm font-medium leading-relaxed text-[#405047] dark:text-[var(--text-secondary)]'>{hGoal.desc}</p>
                </Link>
              ))}
          </div>
        </section>

        {/* ── Focus Evidence Guides ────────────────────────────── */}
        <section className='space-y-4'>
          <div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
            <SectionHeader
              title='Evidence Guides'
              subtitle='Conservative guides on focus, sleep, nutrient status, and adjunctive supplement evidence.'
              as='h2'
            />
            <Link href='/articles?category=nootropics' className='text-sm font-bold text-brand-700 transition hover:text-brand-800 shrink-0'>
              Focus articles →
            </Link>
          </div>

          <div className='grid gap-4 md:grid-cols-3'>
            {focusAdhdGuideCards.map((article) => (
              <Link
                key={article.href}
                href={article.href}
                className='group flex flex-col rounded-[0.85rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-900/20 hover:shadow-md'
              >
                <div className='flex items-center justify-between gap-3'>
                  <span className='inline-flex text-[10px] font-bold uppercase tracking-[0.15em] text-brand-700'>
                    {article.category}
                  </span>
                  <span className='text-[11px] text-muted'>{article.readingTime}</span>
                </div>
                <h3 className='mt-2 text-base font-bold tracking-tight text-ink group-hover:text-brand-700 leading-snug'>
                  {article.title}
                </h3>
                <p className='mt-2 line-clamp-3 text-xs leading-relaxed text-muted flex-1'>
                  {article.description}
                </p>
                <div className='mt-3'><ActionCue>Read guide</ActionCue></div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Articles ──────────────────────────────────────────── */}
        <section className='space-y-4'>
          <div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
            <SectionHeader
              title='Articles'
              subtitle='Practical guides, evidence comparisons, safety discussions, and compound deep dives.'
              as='h2'
            />
            <Link href='/articles' className='text-sm font-bold text-brand-700 transition hover:text-brand-800 shrink-0'>
              All articles →
            </Link>
          </div>

          <div className='grid gap-4 md:grid-cols-3'>
            {featuredArticles.map((article) => (
              <Link
                key={article.href}
                href={article.href}
                className='group flex flex-col rounded-[1rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-900/20 hover:shadow-md'
              >
                <span className='inline-flex text-[10px] font-bold uppercase tracking-[0.15em] text-brand-700'>
                  {article.label}
                </span>
                <h3 className='mt-2 text-base font-bold tracking-tight text-ink group-hover:text-brand-700 leading-snug'>
                  {article.title}
                </h3>
                <p className='mt-2 line-clamp-3 text-xs leading-relaxed text-muted flex-1'>
                  {article.description}
                </p>
                <div className='mt-3 flex items-center justify-between'>
                  <span className='text-[11px] text-muted'>{article.readingTime}</span>
                  <ActionCue>Read</ActionCue>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
