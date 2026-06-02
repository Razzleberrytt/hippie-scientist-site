import Link from 'next/link'
import { cleanSummary, formatDisplayLabel, isClean } from '@/lib/display-utils'
import { goals } from '@/data/goals'
import EmailCapture from './EmailCapture'
import NewsletterCtaBlock from './NewsletterCtaBlock'

type RuntimeFeature = Record<string, unknown>
type HomepageV2Props = { featuredHerbs?: RuntimeFeature[]; featuredCompounds?: RuntimeFeature[] }
type LandingCard = { href: string; title: string; description: string; meta: string }
type SectionHeaderProps = { title: string; subtitle?: string; as?: 'h2' | 'h3' }

function getFeatureName(item: RuntimeFeature) {
  return formatDisplayLabel(item.displayName) || formatDisplayLabel(item.name) || formatDisplayLabel(item.slug)
}

function getFeatureDescription(item: RuntimeFeature, type: 'herb' | 'compound') {
  return cleanSummary(item.short_earthy_summary || item.summary || item.description, type)
}

function toFeaturedCard(item: RuntimeFeature, type: 'herb' | 'compound'): LandingCard | null {
  const title = getFeatureName(item)
  const slug = typeof item.slug === 'string' ? item.slug : ''
  if (!slug || !isClean(title)) return null
  return {
    href: `/${type === 'herb' ? 'herbs' : 'compounds'}/${slug}`,
    title,
    description: getFeatureDescription(item, type),
    meta: type === 'herb' ? 'Herb profile' : 'Compound profile',
  }
}

function interleaveFeatured(herbs: LandingCard[], compounds: LandingCard[]) {
  const mixed: LandingCard[] = []
  const maxLength = Math.max(herbs.length, compounds.length)
  for (let i = 0; i < maxLength; i++) {
    if (herbs[i]) mixed.push(herbs[i])
    if (compounds[i]) mixed.push(compounds[i])
  }
  return mixed.slice(0, 6)
}

const primaryActions = [
  { label: 'Start with your goal', href: '/goals' },
  { label: 'Take the intake quiz', href: '/start-here/quiz' },
  { label: 'Check safety first', href: '/safety-checker' },
]

const trustStrip = [
  'Evidence-weighted guidance',
  'Safety checkpoints before buying',
  'Static, privacy-friendly flow',
]

const wizardSteps = [
  'Pick a goal and the kind of support you want.',
  'Flag timing, sedation, stimulant, and experience preferences.',
  'Review conservative medication, pregnancy, and condition watch-outs.',
]

const recommendationPreview = [
  {
    goal: 'Sleep support',
    tier: 'First compare',
    option: 'Magnesium glycinate',
    href: '/goals/sleep',
    why: 'Often fits wind-down goals when the safety context is appropriate.',
  },
  {
    goal: 'Daytime calm',
    tier: 'Non-sedating path',
    option: 'L-Theanine',
    href: '/goals/anxiety',
    why: 'Useful to compare when the user wants calm without heavy sedation.',
  },
  {
    goal: 'Focus support',
    tier: 'Low-jitter option',
    option: 'Rhodiola or creatine',
    href: '/goals/focus',
    why: 'Routes users toward evidence, onset, and stimulant-sensitivity tradeoffs.',
  },
]

const comparisonPreview = [
  {
    href: '/guides/sleep-herbs-vs-melatonin',
    title: 'Sleep herbs vs melatonin',
    desc: 'Compare wind-down support with circadian timing support.',
  },
  {
    href: '/compare/l-theanine-vs-magnesium',
    title: 'L-Theanine vs magnesium',
    desc: 'Choose between daytime calm and broader relaxation support.',
  },
  {
    href: '/compare/rhodiola-vs-ashwagandha',
    title: 'Rhodiola vs ashwagandha',
    desc: 'Compare stimulating adaptogen fit with stress-recovery fit.',
  },
  {
    href: '/guides/natural-anxiolytics-beyond-ashwagandha',
    title: 'Beyond ashwagandha',
    desc: 'Compare calming herbs and anxiolytic tradeoffs without one-herb hype.',
  },
  {
    href: '/guides/psychedelic-adjacent-herbs',
    title: 'Psychedelic-adjacent herbs',
    desc: 'Review harm-reduction boundaries and interaction warnings first.',
  },
]

const credibilityPillars = [
  'Human evidence is separated from mechanism-only claims.',
  'Contraindications and medication flags appear before product-quality CTAs.',
  'Affiliate context is disclosed without changing the evidence standard.',
]

// Fallbacks expanded to 6 curated picks instead of alphabetical accidents
const featuredFallbacks: LandingCard[] = [
  {
    href: '/herbs/ashwagandha',
    title: 'Ashwagandha',
    description: 'Stress support, recovery context, and realistic evidence interpretation.',
    meta: 'Herb profile',
  },
  {
    href: '/compounds/l-theanine',
    title: 'L-Theanine',
    description: 'Calm focus, relaxation pathways, and non-sedating support context.',
    meta: 'Compound profile',
  },
  {
    href: '/compounds/creatine',
    title: 'Creatine',
    description: 'Performance, recovery, energy buffering, and cognitive support research.',
    meta: 'Compound profile',
  },
  {
    href: '/herbs/rhodiola-rosea',
    title: 'Rhodiola Rosea',
    description: 'Adaptogenic fatigue resistance and mental performance under stress.',
    meta: 'Herb profile',
  },
  {
    href: '/herbs/lions-mane',
    title: "Lion's Mane",
    description: 'NGF stimulation, cognitive support, and neuroprotective research.',
    meta: 'Herb profile',
  },
  {
    href: '/compounds/magnesium-glycinate',
    title: 'Magnesium Glycinate',
    description: 'Sleep quality, muscle relaxation, and nervous system regulation.',
    meta: 'Compound profile',
  },
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
    <span className='inline-flex items-center gap-2 text-sm font-semibold text-brand-700 transition group-hover:translate-x-1 group-hover:text-brand-800'>
      {children} <span aria-hidden='true'>→</span>
    </span>
  )
}

// 'use client' removed — no hooks/state/handlers here. Enables SSR for the homepage.
// Outer <main> replaced with <div> — the single <main id="main-content"> lives only in app/layout.tsx.
export default function HomepageV2({ featuredHerbs = [], featuredCompounds = [] }: HomepageV2Props) {
  const herbCards = featuredHerbs
    .map(i => toFeaturedCard(i, 'herb'))
    .filter((i): i is LandingCard => Boolean(i))
    .slice(0, 3)
  const compoundCards = featuredCompounds
    .map(i => toFeaturedCard(i, 'compound'))
    .filter((i): i is LandingCard => Boolean(i))
    .slice(0, 3)
  const featured = interleaveFeatured(herbCards, compoundCards)
  const visibleFeatured = featured.length > 0 ? featured : featuredFallbacks
  const goalHighlights = goals.slice(0, 8)

  return (
    <div className='overflow-x-clip bg-site-bg'>
      <div className='mx-auto max-w-6xl space-y-5 px-4 pb-5 pt-4 sm:px-6 sm:space-y-6 sm:pb-6 sm:pt-6 lg:px-8'>

        {/* Hero */}
        <section className='rounded-[1.25rem] border border-brand-900/10 bg-white/90 px-4 py-5 shadow-sm sm:px-6 sm:py-7'>
          <div className='mx-auto flex max-w-4xl flex-col items-center text-center'>
            <p role='doc-subtitle' className='mb-2 inline-flex text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-brand-700'>
              Evidence-first supplement decisions
            </p>
            <h1 className='font-display text-[2.25rem] font-semibold leading-[1] tracking-[-0.04em] text-ink break-words sm:text-5xl md:text-6xl'>
              Find the right supplement path before you buy.
            </h1>
            <p className='mt-4 max-w-2xl text-sm font-medium leading-6 text-muted sm:text-base sm:leading-7'>
              Start with your goal, compare evidence and safety tradeoffs, then use product-quality criteria instead of hype-driven supplement lists.
            </p>
            <div className='mt-5 grid w-full max-w-2xl gap-2 sm:grid-cols-3'>
              {primaryActions.map((action, index) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className={
                    index === 0
                      ? 'rounded-full border border-brand-900/15 bg-brand-700 px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-brand-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-700/40 focus-visible:ring-offset-2 focus-visible:ring-offset-site-bg'
                      : 'rounded-full border border-brand-900/10 bg-white/90 px-3 py-2.5 text-sm font-semibold text-ink transition hover:-translate-y-0.5 hover:border-brand-900/20 hover:bg-brand-50/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-700/40 focus-visible:ring-offset-2 focus-visible:ring-offset-site-bg'
                  }
                >
                  {action.label}
                </Link>
              ))}
            </div>
            <div className='mt-5 flex flex-wrap justify-center gap-2' aria-label='Trust signals'>
              {trustStrip.map((item) => (
                <span key={item} className='rounded-full border border-brand-900/10 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800'>
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Goal Guides */}
        <section className='space-y-3'>
          <div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
            <SectionHeader
              title='Choose a goal decision path'
              subtitle='Compare evidence, safety, onset, and product-form tradeoffs before narrowing to an ingredient.'
              as='h2'
            />
            <Link href='/goals' className='text-sm font-semibold text-brand-700 transition hover:text-brand-800'>
              View all goals →
            </Link>
          </div>
          <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
            {goalHighlights.map((goal) => (
              <Link
                key={goal.slug}
                href={`/goals/${goal.slug}`}
                className='group flex flex-col justify-between rounded-[0.85rem] border border-brand-900/10 bg-white/90 p-3 shadow-sm transition hover:border-brand-900/20 hover:bg-white'
              >
                <div>
                  <span className='text-[10px] font-bold uppercase tracking-wider text-brand-700'>{goal.eyebrow}</span>
                  <h3 className='mt-1 text-base font-bold text-ink transition group-hover:text-brand-700'>{goal.title}</h3>
                  <p className='mt-1 line-clamp-2 text-xs leading-relaxed text-muted'>{goal.description}</p>
                </div>
                <div className='mt-3 border-t border-brand-900/5 pt-2'>
                  <p className='text-[10px] font-bold uppercase tracking-wider text-brand-700'>Quick compare</p>
                  <p className='mt-1 text-xs leading-5 text-muted'>
                    {goal.quickPicks.slice(0, 2).map((pick) => pick.option).join(' · ')}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Intake Wizard Entry */}
        <section className='grid gap-4 rounded-[1rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm lg:grid-cols-[1fr_0.9fr] lg:p-5'>
          <div>
            <SectionHeader
              title='Not sure where to start? Use the intake wizard.'
              subtitle='The quiz is a static, privacy-friendly decision aid that narrows goals and highlights conservative safety watch-outs.'
              as='h2'
            />
            <div className='mt-4 flex flex-wrap gap-2'>
              <Link href='/start-here/quiz' className='rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-800'>
                Start quiz →
              </Link>
              <Link href='/start-here' className='rounded-full border border-brand-900/10 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-brand-50'>
                Read start guide
              </Link>
            </div>
          </div>
          <ol className='space-y-2 text-sm leading-6 text-muted'>
            {wizardSteps.map((step, index) => (
              <li key={step} className='flex gap-3 rounded-[0.85rem] bg-brand-50/70 p-3'>
                <span className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-brand-800'>{index + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* Recommendation Preview */}
        <section className='space-y-3'>
          <SectionHeader
            title='Preview the recommendation logic'
            subtitle='Recommendations should explain fit first, then safety, then product-quality next steps.'
            as='h2'
          />
          <div className='grid gap-3 md:grid-cols-3'>
            {recommendationPreview.map((item) => (
              <Link key={item.option} href={item.href} className='group rounded-[0.85rem] border border-brand-900/10 bg-white/90 p-3 shadow-sm transition hover:border-brand-900/20 hover:bg-white'>
                <span className='text-[10px] font-bold uppercase tracking-wider text-brand-700'>{item.goal} · {item.tier}</span>
                <h3 className='mt-1 text-base font-semibold text-ink transition group-hover:text-brand-700'>{item.option}</h3>
                <p className='mt-1 text-xs leading-5 text-muted'>{item.why}</p>
                <div className='mt-2'><ActionCue>Open goal guide</ActionCue></div>
              </Link>
            ))}
          </div>
        </section>

        {/* Comparison Preview */}
        <section className='space-y-3'>
          <SectionHeader
            title='Compare before committing'
            subtitle='Use comparison paths when two options sound similar but differ in onset, use case, or safety profile.'
            as='h2'
          />
          <div className='grid gap-2 sm:grid-cols-3'>
            {comparisonPreview.map((comparison) => (
              <Link
                key={comparison.href}
                href={comparison.href}
                className='group flex flex-col justify-between rounded-[0.85rem] border border-brand-900/10 bg-white/90 p-3 shadow-sm transition hover:border-brand-900/20 hover:bg-white'
              >
                <div>
                  <span className='text-[10px] font-bold uppercase tracking-wider text-brand-700'>Decision bridge</span>
                  <h3 className='mt-1 text-base font-bold text-ink transition group-hover:text-brand-700'>{comparison.title}</h3>
                  <p className='mt-1 text-xs leading-relaxed text-muted'>{comparison.desc}</p>
                </div>
                <span className='mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand-700'>
                  Open comparison <span className='transition group-hover:translate-x-1'>→</span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Evidence + Safety */}
        <section className='grid gap-4 lg:grid-cols-2'>
          <div className='rounded-[1rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm'>
            <SectionHeader
              title='Evidence labels stay conservative'
              subtitle='The site separates stronger human evidence from mechanistic plausibility and popularity signals.'
              as='h2'
            />
            <ul className='mt-4 space-y-2 text-sm leading-6 text-muted'>
              {credibilityPillars.map((pillar) => (
                <li key={pillar} className='flex gap-2'>
                  <span className='mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-700' />
                  <span>{pillar}</span>
                </li>
              ))}
            </ul>
            <Link href='/education/research-methodology' className='mt-4 inline-flex text-sm font-semibold text-brand-700 hover:text-brand-800'>
              Read the methodology →
            </Link>
          </div>
          <div className='rounded-[1rem] border border-amber-200/80 bg-amber-50/60 p-4 shadow-sm'>
            <SectionHeader
              title='Safety comes before product links'
              subtitle='Natural does not automatically mean safe. Check contraindications before choosing any supplement.'
              as='h2'
            />
            <div className='mt-4 grid gap-2 text-sm leading-6 text-amber-950/85'>
              <p className='rounded-[0.85rem] bg-white/60 p-3'>Medication use, pregnancy or breastfeeding, complex conditions, and planned procedures should trigger clinician guidance.</p>
              <p className='rounded-[0.85rem] bg-white/60 p-3'>Recommendation and affiliate modules should be suppressed when safety context is incomplete or high-risk.</p>
            </div>
            <Link href='/safety-checker' className='mt-4 inline-flex text-sm font-semibold text-amber-900 hover:text-amber-950'>
              Open safety checker →
            </Link>
          </div>
        </section>

        {/* Product Quality CTA */}
        <section className='rounded-[1rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm sm:p-5'>
          <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
            <div>
              <p className='text-[10px] font-bold uppercase tracking-[0.18em] text-brand-700'>Affiliate-disclosure-aware next step</p>
              <h2 className='mt-2 text-xl font-semibold tracking-tight text-ink sm:text-2xl'>Learn what a quality supplement label should show.</h2>
              <p className='mt-2 max-w-3xl text-sm leading-6 text-muted'>
                Before any product click, compare third-party testing, form, standardization, dose transparency, contaminants, and return-policy signals.
              </p>
              <p className='mt-2 text-xs leading-5 text-muted'>This site may earn from qualifying affiliate links, but product-quality criteria should remain independent from commissions.</p>
            </div>
            <Link href='/buy-guide' className='inline-flex shrink-0 justify-center rounded-full bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-800'>
              Open buy guide →
            </Link>
          </div>
        </section>

        <EmailCapture
          headline='Get the supplement safety checklist'
          description='Join the list for safety-first supplement notes and the checklist landing page before you compare products.'
          ctaLabel='Get the checklist'
          location='homepage'
        />

        <NewsletterCtaBlock
          title='Browse evidence-first newsletter notes'
          description='Use the archive for concise supplement safety and sourcing updates.'
          location='homepage-newsletter'
        />

        {/* Popular Profiles */}
        <section className='space-y-2.5 sm:space-y-3'>
          <div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
            <SectionHeader
              title='Ingredient research starting points'
              subtitle='Use profiles after choosing a goal path or comparison question.'
              as='h2'
            />
            <div className='flex flex-wrap gap-3 text-sm font-semibold'>
              <Link href='/herbs' className='text-brand-700 transition hover:text-brand-800'>Herb library <span aria-hidden='true'>→</span></Link>
              <Link href='/compounds' className='text-brand-700 transition hover:text-brand-800'>Compound library <span aria-hidden='true'>→</span></Link>
            </div>
          </div>
          <div className='grid gap-2 md:grid-cols-2 lg:grid-cols-3'>
            {visibleFeatured.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-label={`View ${item.meta} for ${item.title}`}
                className='group rounded-[0.85rem] border border-brand-900/10 bg-white/90 p-3 transition hover:border-brand-900/20 hover:bg-white'
              >
                <div className='relative'>
                  <span className='inline-flex text-xs font-semibold uppercase tracking-[0.16em] text-brand-700'>{item.meta}</span>
                  <h3 className='mt-1.5 text-base font-semibold tracking-tight text-ink sm:text-lg'>{item.title}</h3>
                  <p className='mt-1 line-clamp-2 text-sm leading-5 text-muted'>{item.description}</p>
                  <div className='mt-1.5'><ActionCue>Open profile</ActionCue></div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Disclaimer */}
        <section className='rounded-[0.85rem] border border-amber-200/80 bg-amber-50/60 p-3'>
          <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
            <p className='max-w-4xl text-sm leading-6 text-amber-950/85'>
              <strong>Important Notice:</strong> Natural does not automatically mean safe or effective. Use this for comparison only. Review contraindications and ask a clinician before starting supplements.
            </p>
            <Link
              href='/disclaimer'
              className='shrink-0 whitespace-nowrap text-sm font-semibold text-amber-900/90 transition hover:text-amber-950'
            >
              Read disclaimer →
            </Link>
          </div>
        </section>

      </div>
    </div>
  )
}
