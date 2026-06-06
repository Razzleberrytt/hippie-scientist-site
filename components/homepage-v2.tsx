import Link from 'next/link'
import Image from 'next/image'
import { cleanSummary, formatDisplayLabel, isClean } from '@/lib/display-utils'
import { goals } from '@/data/goals'
import { getRevenueProductSet } from '@/config/revenue-products'
import NewsletterCtaBlock from './NewsletterCtaBlock'
import SafetyChecklistPromo from '@/components/monetization/SafetyChecklistPromo'
import StickyChecklistBar from '@/components/monetization/StickyChecklistBar'

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

const trustStrip = [
  'Human trials separated from mechanism-only claims',
  'Safety & drug interactions surfaced first',
  '295 herbs · 600+ compounds reviewed',
]

const wizardSteps = [
  'Pick a goal and the kind of support you want.',
  'Flag timing, sedation, stimulant, and experience preferences.',
  'Review conservative medication, pregnancy, and condition watch-outs.',
]

const credibilityPillars = [
  'Human clinical trial evidence is separated from petri dish mechanistic plausibility.',
  'Contraindications and medication flags appear before product-quality CTAs.',
  'Affiliate context is disclosed without changing the evidence standard.',
]

const featuredArticles = [
  {
    href: '/articles/lions-mane',
    label: 'Deep Dive',
    title: "Lion's Mane: Mechanisms, Clinical Evidence & Dosage",
    description: "NGF and BDNF pathways, three randomized trials in MCI and mild Alzheimer's, and practical dosing guidance with extract selection criteria.",
    readingTime: '12 min read',
  },
  {
    href: '/blog/rhodiola-vs-ashwagandha',
    label: 'Comparison',
    title: 'Rhodiola vs. Ashwagandha: Matching Adaptogens to Your Needs',
    description: "Cortisol timing, fatigue profiles, and when stimulating adaptogens outperform sedating ones — and vice versa.",
    readingTime: '5 min read',
  },
  {
    href: '/blog/reishi-sleep-immunity',
    label: 'Research Note',
    title: 'Reishi for Sleep and Immunity: What the Studies Say',
    description: 'Triterpenes, beta-glucans, and the evidence behind Reishi\'s dual reputation as an adaptogen and immune modulator.',
    readingTime: '4 min read',
  },
]

// Fallbacks / curated popular starting points
const featuredFallbacks: LandingCard[] = [
  {
    href: '/herbs/ashwagandha',
    title: 'Ashwagandha',
    description: 'Stress support, recovery context, and realistic evidence interpretation.',
    meta: 'Herb profile',
  },
  {
    href: '/herbs/turmeric',
    title: 'Turmeric',
    description: 'Inflammation context and evidence-aware botanical research notes.',
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
  {
    href: '/compounds/melatonin',
    title: 'Melatonin',
    description: 'Sleep-onset support with evidence and safety context.',
    meta: 'Compound profile',
  },
  {
    href: '/herbs/rhodiola',
    title: 'Rhodiola',
    description: 'Adaptogenic fatigue resistance and mental performance under stress.',
    meta: 'Herb profile',
  },
]

const heroGoals = [
  { slug: 'sleep', title: 'Sleep Support', bg: 'bg-gradient-to-br from-[hsl(220,60%,97%)] to-[hsl(240,60%,94%)] border-[hsl(220,50%,85%)]', text: 'text-[hsl(220,60%,35%)]', desc: 'Quieting bedtime worry & support for natural onset.' },
  { slug: 'stress', title: 'Stress & Fatigue', bg: 'bg-gradient-to-br from-[hsl(30,70%,97%)] to-[hsl(15,70%,95%)] border-[hsl(30,50%,85%)]', text: 'text-[hsl(30,70%,35%)]', desc: 'Adaptogens for cortisol regulation & mental burnout.' },
  { slug: 'anxiety', title: 'Anxiety & Calm', bg: 'bg-gradient-to-br from-[hsl(160,50%,96%)] to-[hsl(180,50%,94%)] border-[hsl(160,40%,85%)]', text: 'text-[hsl(160,60%,30%)]', desc: 'Promoting daytime peace without heavy daytime sedation.' },
  { slug: 'focus', title: 'Focus & Alertness', bg: 'bg-gradient-to-br from-[hsl(280,50%,97%)] to-[hsl(260,50%,94%)] border-[hsl(280,40%,85%)]', text: 'text-[hsl(280,60%,35%)]', desc: 'Alertness support & smoothing stimulant jitters.' },
  { slug: 'gut-health', title: 'Gut Health', bg: 'bg-gradient-to-br from-[hsl(100,40%,96%)] to-[hsl(120,40%,94%)] border-[hsl(100,30%,85%)]', text: 'text-[hsl(100,50%,30%)]', desc: 'Evaluating enzymes, prebiotic fibers, & regularity aids.' },
  { slug: 'pain', title: 'Pain Support', bg: 'bg-gradient-to-br from-[hsl(45,60%,96%)] to-[hsl(35,60%,94%)] border-[hsl(45,50%,85%)]', text: 'text-[hsl(45,60%,30%)]', desc: 'Addressing joint stiffness & chronic inflammatory pain.' },
  { slug: 'longevity', title: 'Longevity & Cellular', bg: 'bg-gradient-to-br from-[hsl(140,40%,96%)] to-[hsl(150,40%,94%)] border-[hsl(140,30%,85%)]', text: 'text-[hsl(140,50%,30%)]', desc: 'NAD+ synthesis precursors & mitochondrial health.' },
  { slug: 'joint-support', title: 'Joint & Mobility', bg: 'bg-gradient-to-br from-[hsl(200,60%,96%)] to-[hsl(190,60%,94%)] border-[hsl(200,40%,85%)]', text: 'text-[hsl(200,60%,35%)]', desc: 'Cartilage support & systemic joint integrity.' },
  { slug: 'recovery', title: 'Exercise Recovery', bg: 'bg-gradient-to-br from-[hsl(310,40%,97%)] to-[hsl(290,40%,94%)] border-[hsl(310,30%,85%)]', text: 'text-[hsl(310,50%,35%)]', desc: 'Energy buffering, soreness reduction, & cell recovery.' },
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

  return (
    <div className='overflow-x-clip bg-site-bg'>
      <StickyChecklistBar storageKey='homepage-sticky-checklist' />
      <div className='mx-auto max-w-6xl space-y-8 px-4 pb-12 pt-4 sm:px-6 sm:space-y-10 sm:pb-16 sm:pt-6 lg:px-8'>

        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className='rounded-[1.25rem] border border-brand-900/10 bg-white/90 px-6 py-8 shadow-sm sm:px-10 sm:py-12'>
          <div className='grid gap-8 lg:grid-cols-[1.14fr_0.86fr] lg:items-center'>
            <div className='flex flex-col items-center text-center lg:items-start lg:text-left'>
              <p role='doc-subtitle' className='mb-3 inline-flex text-[0.7rem] font-bold uppercase tracking-[0.2em] text-brand-700'>
                Evidence-first supplement decisions
              </p>
              <h1 className='font-display text-[2.5rem] font-bold leading-[1.05] tracking-[-0.04em] text-ink break-words sm:text-5xl md:text-6xl'>
                Supplement Science Without the&nbsp;Hype
              </h1>
              <p className='mt-5 max-w-2xl text-sm font-medium leading-7 text-muted sm:text-base sm:leading-8'>
                295 herb profiles and 600+ compound reviews — each one separating what the clinical trials actually show from mechanism-only marketing claims.
              </p>
              <div className='mt-6 grid w-full max-w-lg gap-2.5 sm:grid-cols-2'>
                <Link
                  href='/start-here/quiz'
                  className='rounded-full border border-brand-900/15 bg-brand-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-brand-800 focus:outline-none text-center'
                >
                  Find What Fits You
                </Link>
                <Link
                  href='/goals'
                  className='rounded-full border border-brand-900/10 bg-white px-5 py-3 text-sm font-bold text-ink shadow-sm transition hover:-translate-y-0.5 hover:border-brand-900/20 hover:bg-brand-50/70 focus:outline-none text-center'
                >
                  Browse by Health Goal
                </Link>
              </div>
              <div className='mt-6 flex flex-wrap justify-center lg:justify-start gap-2' aria-label='Trust signals'>
                {trustStrip.map((item) => (
                  <span key={item} className='rounded-full border border-brand-900/10 bg-brand-50 px-3.5 py-1 text-xs font-semibold text-brand-800'>
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Hero image */}
            <div className='relative overflow-hidden rounded-2xl border border-brand-900/10 bg-white shadow-md transition-all duration-500 hover:shadow-xl hover:scale-[1.01]'>
              <div className='relative w-full h-[200px] sm:h-[240px] lg:h-[380px]'>
                <Image
                  src='/hero-illustration.jpg'
                  alt='The Hippie Scientist Botanical Research Lab'
                  fill
                  priority
                  className='object-cover'
                />
                <div className='absolute inset-0 bg-gradient-to-t from-black/10 to-transparent' />
              </div>
            </div>
          </div>
        </section>

        {/* ── Evidence Reviews: Goal Pathways ──────────────────── */}
        <section className='space-y-4'>
          <div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
            <SectionHeader
              title='Select a Health Pathway to Compare'
              subtitle='Each guide compares candidate compounds, evidence grade, standard onset time, and safety boundaries side-by-side.'
              as='h2'
            />
            <Link href='/goals' className='text-sm font-bold text-brand-700 transition hover:text-brand-800 shrink-0'>
              View all 15 →
            </Link>
          </div>

          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            {heroGoals.map((hGoal) => {
              const fullGoal = goals.find((g) => g.slug === hGoal.slug)
              const quickPicks = fullGoal?.quickPicks.slice(0, 3) || []

              return (
                <div
                  key={hGoal.slug}
                  className={`flex flex-col justify-between rounded-[1rem] border ${hGoal.bg} p-4 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.01]`}
                >
                  <div>
                    <div className='flex items-center justify-between'>
                      <span className='text-[10px] font-bold uppercase tracking-wider text-muted'>Evidence Review</span>
                      <span className='h-2 w-2 rounded-full bg-brand-700' />
                    </div>
                    <Link href={`/goals/${hGoal.slug}`} className='group mt-2 block'>
                      <h3 className={`text-lg font-bold text-ink transition group-hover:text-brand-700`}>
                        {hGoal.title}
                      </h3>
                      <p className='mt-1 text-xs leading-relaxed text-muted'>{hGoal.desc}</p>
                    </Link>
                  </div>

                  <div className='mt-4 border-t border-brand-900/10 pt-3 space-y-2.5'>
                    <p className='text-[10px] font-bold uppercase tracking-wider text-muted'>Top Sourcing Picks</p>
                    <div className='space-y-1.5'>
                      {quickPicks.map((pick) => {
                        const productSet = getRevenueProductSet(pick.slug)
                        const overallProduct = productSet?.products.find((p) => p.slot === 'overall')
                        return (
                          <div key={pick.slug} className='flex items-baseline justify-between gap-2 text-xs min-w-0'>
                            <span className='text-muted shrink-0 max-w-[120px] truncate'>{pick.need}:</span>
                            {overallProduct ? (
                              <a
                                href={overallProduct.affiliateUrl}
                                target='_blank'
                                rel='nofollow sponsored noopener noreferrer'
                                className='font-bold text-brand-700 hover:text-brand-800 hover:underline text-right break-words min-w-0'
                              >
                                {overallProduct.brand} {(overallProduct.title || '').replace(/^[^a-zA-Z]+/g, '').split(' ').slice(1, 3).join(' ')} →
                              </a>
                            ) : (
                              <span className='font-bold text-brand-700 text-right break-words min-w-0'>{pick.option}</span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className='mt-4 pt-2 border-t border-brand-900/5'>
                    <Link href={`/goals/${hGoal.slug}`} className='group block'>
                      <ActionCue>Compare all candidates</ActionCue>
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* ── Research Highlights ───────────────────────────────── */}
        <section className='space-y-4'>
          <div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
            <SectionHeader
              title='From the Research Notes'
              subtitle='Deep dives and evidence reviews — mechanisms, clinical data, and safety context in one place.'
              as='h2'
            />
            <Link href='/blog' className='text-sm font-bold text-brand-700 transition hover:text-brand-800 shrink-0'>
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

        {/* ── Intake Wizard ─────────────────────────────────────── */}
        <section className='grid gap-6 rounded-[1.25rem] border border-brand-900/10 bg-white/90 p-5 shadow-sm lg:grid-cols-[1fr_0.9fr] lg:p-6'>
          <div>
            <SectionHeader
              title='Run the Safety Check &amp; Intake Wizard'
              subtitle='Answer questions on safety profiles, timing, stimulant limits, and medical watch-outs. Our intake wizard helps narrow 15 pathways down to what fits your body.'
              as='h2'
            />
            <div className='mt-6 flex flex-wrap gap-2.5'>
              <Link href='/start-here/quiz' className='rounded-full bg-brand-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-800'>
                Start safety intake →
              </Link>
              <Link href='/start-here' className='rounded-full border border-brand-900/10 bg-white px-5 py-3 text-sm font-bold text-ink transition hover:bg-brand-50'>
                Intake Guidelines
              </Link>
            </div>
          </div>
          <ol className='space-y-2.5 text-sm leading-6 text-muted'>
            {wizardSteps.map((step, index) => (
              <li key={step} className='flex gap-3.5 rounded-[0.85rem] bg-brand-50/70 p-4'>
                <span className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-brand-800'>{index + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* ── Ingredient Library ────────────────────────────────── */}
        <section className='space-y-4'>
          <div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
            <SectionHeader
              title='Or Browse by Ingredient'
              subtitle='Research profiles on standalone adaptogens, biological compounds, and minerals.'
              as='h2'
            />
            <div className='flex flex-wrap gap-4 text-sm font-bold'>
              <Link href='/herbs' className='text-brand-700 transition hover:text-brand-800'>Herbs <span aria-hidden='true'>→</span></Link>
              <Link href='/compounds' className='text-brand-700 transition hover:text-brand-800'>Compounds <span aria-hidden='true'>→</span></Link>
            </div>
          </div>
          <div className='grid gap-3 md:grid-cols-2 lg:grid-cols-3'>
            {visibleFeatured.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-label={`View ${item.meta} for ${item.title}`}
                className='group rounded-[0.85rem] border border-brand-900/10 bg-white/90 p-4 transition hover:border-brand-900/20 hover:bg-white'
              >
                <div className='relative'>
                  <span className='inline-flex text-[10px] font-bold uppercase tracking-[0.15em] text-brand-700'>{item.meta}</span>
                  <h3 className='mt-1.5 text-base font-bold tracking-tight text-ink sm:text-lg group-hover:text-brand-700'>{item.title}</h3>
                  <p className='mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted'>{item.description}</p>
                  <div className='mt-2.5'><ActionCue>Open Profile</ActionCue></div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Evidence & Safety Methodology ────────────────────── */}
        <section className='grid gap-4 lg:grid-cols-2'>
          <div className='rounded-[1.25rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm sm:p-5'>
            <SectionHeader
              title='How We Grade the Evidence'
              subtitle='Our catalog separates human clinical trial evidence from petri dish mechanistic plausibility.'
              as='h2'
            />
            <ul className='mt-4 space-y-2.5 text-sm leading-6 text-muted'>
              {credibilityPillars.map((pillar) => (
                <li key={pillar} className='flex gap-3'>
                  <span className='mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-700' />
                  <span>{pillar}</span>
                </li>
              ))}
            </ul>
            <Link href='/education/research-methodology' className='mt-4 inline-flex text-sm font-bold text-brand-700 hover:text-brand-800'>
              Research Methodology →
            </Link>
          </div>
          <div className='rounded-[1.25rem] border border-amber-200/80 bg-amber-50/50 p-4 shadow-sm sm:p-5'>
            <SectionHeader
              title='Safety First: Contraindications'
              subtitle='Natural ingredients carry biological activity. Contraindications and stack compatibility matter.'
              as='h2'
            />
            <div className='mt-4 grid gap-2.5 text-sm leading-6 text-amber-950/85'>
              <p className='rounded-[0.85rem] bg-white/60 p-4'>Pregnancy, chronic diseases, planned surgeries, or prescription medications require physician safety clearance.</p>
              <p className='rounded-[0.85rem] bg-white/60 p-4'>Affiliate recommendation modules are dynamically suppressed for ingredients with cautions or high toxicity margins.</p>
            </div>
            <Link href='/safety-checker' className='mt-4 inline-flex text-sm font-bold text-amber-900 hover:text-amber-950'>
              Check stack compatibility →
            </Link>
          </div>
        </section>

        <SafetyChecklistPromo goal='default' variant='hero' />

        <NewsletterCtaBlock
          title='Browse evidence-first newsletter notes'
          description='Use the archive for concise supplement safety and sourcing updates.'
          location='homepage-newsletter'
        />

        {/* ── Disclaimer ───────────────────────────────────────── */}
        <section className='rounded-[0.85rem] border border-amber-200/80 bg-amber-50/50 p-4'>
          <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
            <p className='max-w-4xl text-sm leading-relaxed text-amber-950/85'>
              <strong>Important Notice:</strong> This website is for informational comparison only. Natural compounds carry real risks, side effects, and interaction profiles. Always consult a physician before starting any routine.
            </p>
            <Link
              href='/disclaimer'
              className='shrink-0 whitespace-nowrap text-sm font-bold text-amber-900/90 transition hover:text-amber-950'
            >
              Medical Disclaimer →
            </Link>
          </div>
        </section>

      </div>
    </div>
  )
}
