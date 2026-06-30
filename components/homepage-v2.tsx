import Link from 'next/link'

const heroGoals = [
  {
    slug: 'sleep',
    title: 'Sleep',
    icon: '🌙',
    prompt: 'Fall asleep, stay asleep, and compare sleep supplements without guessing.',
    bg: 'from-[#eaf2fb] to-[#dceef8] border-[#a8c8e0]',
    accent: 'text-[#1a3d5c]',
  },
  {
    slug: 'stress',
    title: 'Stress',
    icon: '🌿',
    prompt: 'Sort adaptogens and calming supports by fatigue pattern, timing, and safety.',
    bg: 'from-[#edf6ee] to-[#ddf0df] border-[#8dc49a]',
    accent: 'text-[#1e4a2c]',
  },
  {
    slug: 'anxiety',
    title: 'Anxiety',
    icon: '☁️',
    prompt: 'Find grounded options for calm, overthinking, and daytime tension.',
    bg: 'from-[#f3eefc] to-[#ebe2f8] border-[#c4aadf]',
    accent: 'text-[#4a2d6e]',
  },
  {
    slug: 'focus',
    title: 'Focus',
    icon: '⚡',
    prompt: 'Compare non-stimulant focus supports and caffeine-adjacent options.',
    bg: 'from-[#fdf5e6] to-[#f9ecce] border-[#d4aa62]',
    accent: 'text-[#5c3f0e]',
  },
]

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
  { href: '/compare/melatonin-vs-magnesium/', title: 'Melatonin vs magnesium' },
  { href: '/compare/rhodiola-vs-ashwagandha/', title: 'Rhodiola vs ashwagandha' },
  { href: '/compare/l-theanine-vs-magnesium/', title: 'L-theanine vs magnesium' },
  { href: '/compare/berberine-vs-metformin/', title: 'Berberine vs metformin' },
]

const toolLinks = [
  {
    href: '/safety-checker/',
    title: 'Safety interaction checker',
    description: 'Screen supplement combinations for overlapping cautions before stacking.',
  },
  {
    href: '/supplement-safety-checklist/',
    title: 'Supplement safety checklist',
    description: 'Use five safety questions before comparing products or buying.',
  },
  {
    href: '/tools/',
    title: 'Decision tools',
    description: 'Open the site tools built for safety, dosing, and practical comparison.',
  },
]

export default function HomepageV2() {

  return (
    <div className='overflow-x-clip ps-body'>
      <div className='mx-auto max-w-6xl space-y-8 px-4 pb-12 pt-4 sm:px-6 sm:space-y-10 sm:pb-16 sm:pt-6 lg:px-8'>

        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className='ps-hero'>
          <div className='mx-auto max-w-3xl'>
            <h1 className='ps-hero-title'>
              Herbs & supplements,<br />
              <span style={{color: 'var(--ps-coral)'}}>actually</span> explained.
            </h1>
            <p className='ps-hero-subtitle'>
              Evidence-based guides for sleep, stress, anxiety, and focus — with human clinical trial data, not marketing claims.
            </p>

            <div className='mt-6 flex flex-wrap items-center justify-center gap-3 text-sm font-semibold'>
              <span className='ps-tag'>
                <span className='ps-lab-dot ps-lab-dot-coral' />
                816 studies cited
              </span>
              <span className='ps-tag'>
                <span className='ps-lab-dot ps-lab-dot-teal' />
                557 compounds profiled
              </span>
              <Link href='/methodology/' className='ps-tag hover:border-[var(--ps-ink)] transition-colors'>
                <span className='ps-lab-dot ps-lab-dot-mustard' />
                How we grade evidence
              </Link>
            </div>

            <div className='mt-8'>
              <Link href='#choose-a-path' className='ps-btn'>
                Browse by health goal
              </Link>
              <Link href='/evidence-report/' className='ps-btn ps-btn-outline ml-3'>
                Read the evidence report
              </Link>
            </div>
          </div>
          <hr className='ps-divider' />
        </section>

        {/* Comparisons and tools */}
        <section className='grid gap-4 lg:grid-cols-[1fr_0.9fr]'>
          <div className='ps-card ps-card-accent-coral p-5 sm:p-6'>
            <h2 className='ps-section-title' style={{fontSize: 'clamp(1.2rem, 3vw, 1.5rem)'}}>Compare before you choose</h2>
            <p className='mt-2 text-[var(--ps-ink-muted)] text-sm leading-6'>Side-by-side pages help answer the high-intent questions people search before buying or stacking.</p>
            <div className='mt-5 grid gap-2 sm:grid-cols-2'>
              {comparisonLinks.map((comparison) => (
                <Link
                  key={comparison.href}
                  href={comparison.href}
                  className='block rounded-lg border-2 border-[var(--ps-border)] bg-[var(--ps-surface)] px-4 py-3 text-sm font-bold text-[var(--ps-ink)] transition hover:border-[var(--ps-coral)] hover:bg-white'
                >
                  {comparison.title} →
                </Link>
              ))}
            </div>
            <Link href='/compare/' className='mt-5 inline-flex text-sm font-bold text-[var(--ps-coral)] transition hover:text-[var(--ps-ink)]'>
              Browse all comparisons →
            </Link>
          </div>

          <div className='ps-card ps-card-accent-teal p-5 sm:p-6'>
            <h2 className='ps-section-title' style={{fontSize: 'clamp(1.2rem, 3vw, 1.5rem)'}}>Use the safety tools</h2>
            <p className='mt-2 text-[var(--ps-ink-muted)] text-sm leading-6'>The fastest win is avoiding mismatched products, risky stacks, and unclear supplement forms.</p>
            <div className='mt-5 space-y-3'>
              {toolLinks.map((tool) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className='block rounded-lg border-2 border-[var(--ps-border)] bg-[var(--ps-surface)] p-4 transition hover:border-[var(--ps-teal)] hover:bg-white'
                >
                  <h3 className='text-sm font-bold text-[var(--ps-ink)]'>{tool.title}</h3>
                  <p className='mt-1 text-sm leading-6 text-[var(--ps-ink-muted)]'>{tool.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Goal Pathways */}
        <section id='choose-a-path' className='scroll-mt-24 space-y-4'>
          <div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
            <div>
              <h2 className='ps-section-title' style={{fontSize: 'clamp(1.2rem, 3vw, 1.5rem)'}}>Choose one path</h2>
              <p className='mt-1 text-sm leading-6 text-[var(--ps-ink-muted)]'>Most visitors should start here. Pick the outcome you care about, then compare options inside that guide.</p>
            </div>
            <Link href='/goals/' className='text-sm font-bold text-[var(--ps-coral)] transition hover:text-[var(--ps-ink)] shrink-0'>
              View all goals →
            </Link>
          </div>

          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            {heroGoals.map((hGoal) => (
                <Link
                  key={hGoal.slug}
                  href={`/goals/${hGoal.slug}/`}
                  className={`ps-goal-card ps-goal-card-${hGoal.slug}`}
                >
                  <div>
                    <span className='mb-3 block text-2xl' aria-hidden='true'>{hGoal.icon}</span>
                    <h3 className='text-xl font-extrabold text-[var(--ps-ink)] tracking-tight'>
                      {hGoal.title}
                    </h3>
                    <p className='mt-2 text-sm leading-6 text-[var(--ps-ink-muted)]'>{hGoal.prompt}</p>
                  </div>
                  <span className='mt-5 inline-flex items-center text-sm font-bold text-[var(--ps-coral)] transition group-hover:translate-x-1'>
                    Start with {hGoal.title} <span aria-hidden='true' className='ml-1'>→</span>
                  </span>
                </Link>
              ))}
          </div>
        </section>

        {/* Trust */}
        <section className='ps-card p-5 sm:p-6'>
          <div className='grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start'>
            <div>
              <h2 className='ps-section-title' style={{fontSize: 'clamp(1.2rem, 3vw, 1.5rem)'}}>Why trust the guide?</h2>
              <p className='mt-2 text-[var(--ps-ink-muted)] text-sm leading-6'>The site is built for cautious decisions: what has human evidence, what is only plausible, and what needs safety review before use.</p>
            </div>
            <div className='grid gap-3 sm:grid-cols-3'>
              {trustSignals.map((signal, i) => (
                <div key={signal.n} className='ps-card p-4' style={{borderLeftColor: ['var(--ps-coral)', 'var(--ps-teal)', 'var(--ps-mustard)'][i], borderLeftWidth: 4}}>
                  <span className='block font-mono text-[0.65rem] font-bold tracking-widest text-[var(--ps-ink-muted)]'>{signal.n}</span>
                  <div>
                    <p className='text-sm font-semibold text-[var(--ps-ink)]'>{signal.label}</p>
                    <p className='mt-1 text-sm leading-6 text-[var(--ps-ink-muted)]'>{signal.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className='mt-5 text-sm font-bold'>
            <Link href='/methodology/' className='text-[var(--ps-coral)] transition hover:text-[var(--ps-ink)]'>
              Read the evidence methodology →
            </Link>
          </div>
        </section>

        {/* Evidence Tools */}
        <section className='ps-card ps-card-accent-mustard p-5 sm:p-6'>
          <div className='max-w-3xl space-y-2'>
            <h2 className='ps-section-title' style={{fontSize: 'clamp(1.2rem, 3vw, 1.5rem)'}}>Explore the data behind the claims</h2>
            <p className='text-sm leading-6 text-[var(--ps-ink-muted)]'>Free tools and reports based on analysis of 816 peer-reviewed studies across 557 compounds.</p>
          </div>
          <div className='mt-5 grid gap-3 sm:grid-cols-3'>
            <Link href='/evidence-report/' className='ps-card p-4 transition hover:border-[var(--ps-mustard)]'>
              <h3 className='text-sm font-bold text-[var(--ps-ink)]'>Evidence Report 2026</h3>
              <p className='mt-1 text-sm leading-6 text-[var(--ps-ink-muted)]'>Which supplements actually have human evidence? See the state of the research.</p>
            </Link>
            <Link href='/evidence-checker/' className='ps-card p-4 transition hover:border-[var(--ps-teal)]'>
              <h3 className='text-sm font-bold text-[var(--ps-ink)]'>Evidence Lookup</h3>
              <p className='mt-1 text-sm leading-6 text-[var(--ps-ink-muted)]'>Search 557 compounds by A-F clinical evidence grade.</p>
            </Link>
            <Link href='/infographics/' className='ps-card p-4 transition hover:border-[var(--ps-coral)]'>
              <h3 className='text-sm font-bold text-[var(--ps-ink)]'>Free Infographics</h3>
              <p className='mt-1 text-sm leading-6 text-[var(--ps-ink-muted)]'>Evidence-based visuals — free to share and embed with attribution.</p>
            </Link>
          </div>
        </section>

      </div>
    </div>
  )
}
