import Link from 'next/link'
import { ArrowRight, Search } from 'lucide-react'
import '@/styles/homepage-discovery.css'
import NewsletterSignup from '@/components/NewsletterSignup'
import { getPublicSiteMetrics } from '@/lib/public-site-metrics'
import { getResearchSourceRegisterSummary } from '@/lib/research-source-register'

const firstVisitPaths = [
  {
    label: 'Find an ingredient',
    description: 'Look up a supplement and its evidence.',
    href: '/search/',
  },
  {
    label: 'Compare options',
    description: 'See study context and tradeoffs.',
    href: '/guides/compare/',
  },
  {
    label: 'Check safety concerns',
    description: 'Review interaction and caution signals.',
    href: '/safety-checker/',
  },
] as const

const wellbeingTopics = [
  { title: 'Sleep', href: '/guides/sleep/', description: 'Sleep research and supplement comparisons.' },
  { title: 'Stress', href: '/guides/stress/', description: 'Stress, adaptogens, and the evidence behind them.' },
  { title: 'Anxiety', href: '/guides/anxiety/', description: 'Research, safety, and treatment context.' },
  { title: 'Focus & attention', href: '/guides/focus/', description: 'Cognition, caffeine, and nootropic research.' },
] as const

const researchCollections = [
  { title: 'Mental health & relationships', href: '/guides/mental-health/', description: 'Emotions, attachment, personality, and recovery.' },
  { title: 'Substance use & harm reduction', href: '/guides/substance-use/', description: 'Effects, risks, dependence, and withdrawal research.' },
] as const

const readingRoom = [
  { title: 'Understanding limerence', href: '/articles/limerence-obsessive-love-evidence-review/' },
  { title: 'Limerence and BPD partners', href: '/articles/limerence-borderline-partner-evidence-review/' },
  { title: 'Loving a partner with BPD', href: '/articles/loving-a-partner-with-bpd-evidence-review/' },
] as const

export default async function HomepageV2() {
  const metrics = await getPublicSiteMetrics()
  const researchSourceRegister = getResearchSourceRegisterSummary()
  const stats = [
    { value: metrics.publishedArticles, label: 'Published articles' },
    { value: metrics.publishedHerbs, label: 'Published herbs' },
    { value: metrics.totalCompounds, label: 'Compounds tracked' },
    { value: metrics.structuredStudies, label: 'Structured studies' },
  ]

  return (
    <div className='hs-home'>
      <div className='mx-auto max-w-7xl space-y-8 px-4 pb-20 pt-5 sm:px-6 sm:pt-6 lg:px-8'>
        <section className='home-discovery-intro' aria-labelledby='home-title'>
          <div className='home-discovery-lead'>
            <div>
              <p className='eyebrow-label'>The Hippie Scientist · An evidence-first field guide</p>
              <h1 id='home-title' className='mt-3 max-w-5xl font-display text-4xl font-bold tracking-tight text-ink sm:text-6xl'>
                Understand the evidence. Make clearer choices.
              </h1>
              <p className='mt-4 max-w-3xl text-base leading-7 text-muted sm:text-lg sm:leading-8'>
                Explore supplements, the mind, and the research behind them. See what human studies found, where the evidence falls short, and which risks deserve a closer look.
              </p>

              <form className='mt-6 flex max-w-3xl items-center gap-2 rounded-2xl border border-brand-900/10 bg-white p-2.5 shadow-sm sm:gap-3 sm:p-3' action='/search/' method='get' role='search'>
                <Search className='ml-1 h-5 w-5 shrink-0 text-brand-700' aria-hidden='true' />
                <label className='sr-only' htmlFor='homepage-search'>Search herbs, compounds, or questions</label>
                <input
                  id='homepage-search'
                  name='q'
                  type='search'
                  autoComplete='off'
                  autoCapitalize='none'
                  autoCorrect='off'
                  spellCheck={false}
                  enterKeyHint='search'
                  placeholder='Search herbs, compounds, or questions'
                  className='min-w-0 flex-1 bg-transparent px-1 py-2 text-base text-ink outline-none placeholder:text-muted sm:px-2'
                />
                <button type='submit' className='inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--text-primary)] px-4 text-sm font-bold !text-[var(--surface-elevated)] transition hover:opacity-90 sm:px-5'>
                  Search
                </button>
              </form>

              <nav className='mt-5' aria-label='Choose your first step'>
                <p className='mb-3 text-sm font-semibold text-ink'>What would you like to do?</p>
                <div className='grid gap-2 sm:grid-cols-3'>
                  {firstVisitPaths.map((path) => (
                    <Link
                      key={path.href}
                      href={path.href}
                      className='group flex min-h-12 flex-col justify-center rounded-2xl border border-brand-900/10 bg-[var(--surface-elevated)] px-4 py-3 text-left shadow-sm transition hover:border-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700'
                    >
                      <span className='flex items-center justify-between gap-2 text-sm font-bold text-[var(--text-primary)]'>
                        {path.label} <ArrowRight className='h-4 w-4 shrink-0 text-brand-700 transition group-hover:translate-x-0.5' aria-hidden='true' />
                      </span>
                      <span className='mt-1 text-xs leading-5 text-muted'>{path.description}</span>
                    </Link>
                  ))}
                </div>
              </nav>
            </div>
          </div>
        </section>

        <section className='home-topic-section' aria-labelledby='home-topics-heading'>
          <div className='home-topic-heading'>
            <div>
              <p className='eyebrow-label'>Follow your question</p>
              <h2 id='home-topics-heading'>Browse by topic.</h2>
            </div>
            <Link href='/explore/'>Explore all sections <ArrowRight aria-hidden='true' /></Link>
          </div>
          <nav className='home-topic-groups' aria-label='Browse research by topic'>
            <section aria-labelledby='home-wellbeing-heading'>
              <div className='home-group-heading'>
                <h3 id='home-wellbeing-heading'>Everyday wellbeing</h3>
                <p>Start with the question you want to understand.</p>
              </div>
              <div className='home-topic-grid home-wellbeing-grid'>
                {wellbeingTopics.map((topic) => (
                  <Link key={topic.href} href={topic.href} className='home-topic-link'>
                    <span><strong>{topic.title}</strong><span>{topic.description}</span></span>
                    <ArrowRight aria-hidden='true' />
                  </Link>
                ))}
              </div>
            </section>
            <section aria-labelledby='home-collections-heading'>
              <div className='home-group-heading'>
                <h3 id='home-collections-heading'>Research collections</h3>
                <p>Explore a broader subject through related guides and reviews.</p>
              </div>
              <div className='home-topic-grid home-collection-grid'>
                {researchCollections.map((topic) => (
                  <Link key={topic.href} href={topic.href} className='home-topic-link'>
                    <span><strong>{topic.title}</strong><span>{topic.description}</span></span>
                    <ArrowRight aria-hidden='true' />
                  </Link>
                ))}
              </div>
            </section>
          </nav>
          <p className='mt-4 text-sm text-muted'>
            Have a specific name in mind? Browse <Link href='/herbs/' className='font-semibold text-brand-700 hover:underline'>herbs</Link> or <Link href='/compounds/' className='font-semibold text-brand-700 hover:underline'>compounds</Link>, or open the <Link href='/library/' className='font-semibold text-brand-700 hover:underline'>complete library</Link>.
          </p>
        </section>

        <section className='home-reading-room' aria-labelledby='home-reading-heading'>
          <p className='eyebrow-label'>Featured reading</p>
          <h2 id='home-reading-heading'>Attachment & relationships</h2>
          <p>Explore the research on intense attachment and difficult relationships.</p>
          <ul>
            {readingRoom.map((article) => (
              <li key={article.href}>
                <Link href={article.href}>{article.title}<ArrowRight aria-hidden='true' /></Link>
              </li>
            ))}
          </ul>
          <Link href='/guides/mental-health/' className='home-reading-all'>All mental-health reviews <ArrowRight aria-hidden='true' /></Link>
        </section>

        <section className='rounded-[2rem] border border-brand-900/10 bg-white p-6 shadow-sm sm:p-8' aria-labelledby='home-trust-heading'>
          <div className='grid gap-7 lg:grid-cols-[1fr_auto] lg:items-end'>
            <div>
              <p className='eyebrow-label'>Evidence stays visible</p>
              <h2 id='home-trust-heading' className='mt-2 text-2xl font-semibold tracking-tight text-ink'>
                Human evidence, safety context, and uncertainty remain part of the answer.
              </h2>
              <p className='mt-3 max-w-3xl text-sm leading-7 text-muted'>
                Clinical outcomes stay separate from mechanisms, while interaction context and uncertainty remain visible instead of being flattened into a recommendation.
              </p>
              <Link href='/info/methodology/' className='mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:underline'>
                Read the methodology <ArrowRight className='h-4 w-4' aria-hidden='true' />
              </Link>
            </div>

            <dl className='grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3' aria-label='Research library size'>
              {stats.map((stat) => (
                <div key={stat.label} className='min-w-0 rounded-xl bg-brand-50/60 p-3 text-center sm:p-4'>
                  <dd className='text-2xl font-bold text-ink'>{stat.value}</dd>
                  <dt className='mt-1 text-[11px] leading-4 text-muted'>{stat.label}</dt>
                </div>
              ))}
            </dl>
          </div>
          <p className='mt-4 max-w-4xl text-xs leading-6 text-muted'>
            <strong className='text-ink'>What these counts include:</strong> Published articles and herbs are public content or profile counts. Compounds tracked includes canonical research records that may not have a published profile. Structured studies counts deduplicated study/source records, not independently confirmed clinical trials. These populations differ from the indexable ingredient profiles counted in the <Link href='/evidence/evidence-report/' className='font-semibold text-brand-700 hover:underline'>evidence report</Link>.
          </p>
          <p className='mt-5 max-w-4xl border-t border-brand-900/10 pt-4 text-sm leading-6 text-muted'>
            Beyond the published evidence dataset, our source register tracks <strong className='text-ink'>{researchSourceRegister.totalIndexedPmids.toLocaleString()} unique PubMed references</strong> for further editorial review. Those are research-only identities, not an additional count of graded clinical studies. <Link href='/research/source-register/' className='font-semibold text-brand-700 hover:underline'>Explore the source trail →</Link>
          </p>
        </section>

        <section aria-label='Email signup' className='mx-auto w-full max-w-4xl'>
          <NewsletterSignup location='homepage' variant='card' />
        </section>
      </div>
    </div>
  )
}

