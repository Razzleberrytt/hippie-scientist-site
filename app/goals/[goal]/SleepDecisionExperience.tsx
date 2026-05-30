import type { ReactNode } from 'react'
import Link from 'next/link'
import { getAffiliateShopLinks } from '@/lib/affiliate'
import type { Goal } from '@/data/goals'

type SleepOption = {
  option: {
    slug: string
    name: string
    bestFor: string
    speed: string
    evidence: string
    risk: string
    avoidIf: string
    whyPeopleStop: string
    form: string
  }
  compound?: Record<string, any>
  profileHref: string
  evidenceLabel: string
  safetyLabel: string
}

type SleepDecisionExperienceProps = {
  goal: Goal
  enrichedOptions: SleepOption[]
  structuredData?: ReactNode
}

const shortlistOrder = ['melatonin', 'l-theanine', 'magnesium']

const shortlistCopy: Record<string, {
  useCase: string
  timeToEffect: string
  safetySummary: string
  why: string
  bestIf: string
  tradeoff: string
}> = {
  melatonin: {
    useCase: 'Sleep-onset trouble, jet lag, or schedule-shift problems where circadian timing is the main issue.',
    timeToEffect: 'Usually 30–60 minutes for bedtime use; schedule effects depend on timing consistency.',
    safetySummary: 'Low-to-moderate risk for many adults, but review pregnancy, autoimmune conditions, morning grogginess, and sedative stacking.',
    why: 'It is the most direct fit when the decision is about sleep timing rather than general relaxation.',
    bestIf: 'Your bedtime is drifting later, travel disrupted your schedule, or you need a short-term timing cue.',
    tradeoff: 'Not the best default for chronic stress-driven insomnia or people who wake groggy from small doses.',
  },
  'l-theanine': {
    useCase: 'Racing thoughts, bedtime tension, or a calm-down ritual when you want less next-day heaviness.',
    timeToEffect: 'Often framed as a 30–90 minute pre-bed option.',
    safetySummary: 'Generally lower risk, but be cautious with sedatives, alcohol, blood-pressure medication, or very low blood pressure.',
    why: 'It gives anxious, overthinking sleepers a gentler first experiment before stronger sedating approaches.',
    bestIf: 'Your main barrier is mental noise rather than a shifted body clock.',
    tradeoff: 'May feel too subtle for severe insomnia or frequent middle-of-the-night waking.',
  },
  magnesium: {
    useCase: 'Nightly wind-down, low dietary magnesium suspicion, muscle tension, or relaxation routines.',
    timeToEffect: 'Often days to 2 weeks; not usually an instant knockout aid.',
    safetySummary: 'Low risk for many adults, but kidney disease requires clinician clearance; dose escalation can cause GI effects.',
    why: 'It is a practical, low-intensity default when sleep quality overlaps with tension or inadequate intake.',
    bestIf: 'You want a conservative routine ingredient rather than a direct hypnotic.',
    tradeoff: 'Benefits are more likely when intake is low or tension is part of the sleep problem.',
  },
}

const matrix = [
  { label: 'Best evidence', pick: 'Melatonin', note: 'Strongest fit for circadian timing and sleep-onset decisions.' },
  { label: 'Fastest acting', pick: 'Melatonin or L-Theanine', note: 'Both can be used in the 30–90 minute pre-bed window, for different problems.' },
  { label: 'Lowest risk', pick: 'Magnesium or L-Theanine', note: 'Most conservative starting points when medication and health context are uncomplicated.' },
  { label: 'Lowest cost', pick: 'Magnesium', note: 'Usually inexpensive per serving and easy to compare across brands.' },
  { label: 'Most popular', pick: 'Melatonin', note: 'Familiar and widely available, but popularity should not override fit or safety.' },
]

const safetyItems = [
  {
    title: 'Do not use supplements to mask a medical sleep problem',
    body: 'Loud snoring, witnessed apnea, severe daytime sleepiness, restless legs, chest symptoms, or insomnia lasting weeks deserves clinician evaluation before supplement experimentation.',
  },
  {
    title: 'Review medication and sedative stacking',
    body: 'Be cautious combining sleep supplements with alcohol, benzodiazepines, Z-drugs, opioids, antihistamines, antidepressants, blood-pressure medication, or other sedating products.',
  },
  {
    title: 'Pregnancy, lactation, children, and complex conditions change the decision',
    body: 'Use clinician guidance for pregnancy or nursing, pediatric use, bipolar-spectrum history, autoimmune conditions, seizure disorders, kidney disease, liver disease, or planned procedures.',
  },
  {
    title: 'Start with one variable',
    body: 'Avoid beginning with a multi-ingredient sleep stack. One option at a time makes benefit, side effects, and next-day grogginess easier to interpret.',
  },
]

const qualityGuide = [
  {
    title: 'Forms that matter',
    body: 'Magnesium glycinate is commonly chosen for evening tolerance; citrate can be more laxative; L-threonate is more cognition-positioned and often pricier. Melatonin dose and release type matter more than exotic branding.',
  },
  {
    title: 'Standardization and labeling',
    body: 'Botanical products should name the plant part and extract ratio or marker compounds. Single-ingredient labels are easier to evaluate than proprietary blends.',
  },
  {
    title: 'Marketing traps',
    body: 'Avoid “maximum strength” melatonin by default, mega-stacks with many sedatives, vague “clinically proven blend” claims, and products that hide exact ingredient amounts.',
  },
  {
    title: 'Quality indicators',
    body: 'Prefer clear dosage, lot-level testing or third-party quality seals, allergen transparency, realistic claims, and brands that publish contact and manufacturing information.',
  },
]

const comparisons = [
  {
    href: '/compare/magnesium-glycinate-vs-l-threonate-for-sleep',
    title: 'Magnesium Glycinate vs L-Threonate',
    body: 'Use this when you are choosing between a routine sleep form and a higher-cost cognition-positioned form.',
  },
  {
    href: '/compare/apigenin-vs-melatonin',
    title: 'Apigenin vs Melatonin',
    body: 'Use this when you are deciding between relaxation-positioned and circadian-timing approaches.',
  },
  {
    href: '/compare/melatonin-vs-l-theanine',
    title: 'Melatonin vs L-Theanine',
    body: 'Use this when the core question is body-clock timing versus a racing mind.',
  },
  {
    href: '/sleep-herbs-vs-melatonin',
    title: 'Melatonin vs Non-Melatonin Approaches',
    body: 'Use this broader guide when you want botanical and non-melatonin tradeoffs before buying.',
  },
]

const alternatives = [
  {
    name: 'Lemon Balm',
    href: '/compounds/lemon-balm',
    role: 'Gentle botanical alternative',
    note: 'Consider when bedtime restlessness is mild and you prefer an herb-first routine; product consistency varies.',
  },
  {
    name: 'Glycine',
    href: '/compounds/glycine',
    role: 'Non-sedating sleep-quality option',
    note: 'Consider when you want a simple amino-acid option and are not mainly trying to shift circadian timing.',
  },
  {
    name: 'Apigenin',
    href: '/compounds/apigenin',
    role: 'Relaxation-positioned alternative',
    note: 'Consider as a research option, but review sedatives, anticoagulants, and pregnancy uncertainty first.',
  },
]

function getOption(slug: string, enrichedOptions: SleepOption[], goal: Goal): SleepOption {
  const enriched = enrichedOptions.find((item) => item.option.slug === slug)
  if (enriched) return enriched

  const fallback = goal.options.find((option) => option.slug === slug)
  if (!fallback) {
    throw new Error(`Missing sleep decision option: ${slug}`)
  }

  return {
    option: fallback,
    profileHref: `/compounds/${fallback.slug}`,
    evidenceLabel: fallback.evidence,
    safetyLabel: fallback.risk,
  }
}

export default function SleepDecisionExperience({ goal, enrichedOptions, structuredData }: SleepDecisionExperienceProps) {
  const shortlist = shortlistOrder.map((slug) => getOption(slug, enrichedOptions, goal))

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 space-y-8">
      {structuredData}

      <section className="hero-shell overflow-hidden rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <p className="eyebrow-label">Sleep decision experience</p>
            <h1 className="heading-premium mt-3 text-ink">I want better sleep. What should I actually try?</h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-muted">
              A 60–120 second decision guide for choosing a first sleep-support experiment from existing Hippie Scientist data—evidence first, safety before sourcing, and no ten-tab research spiral.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a href="#shortlist" className="inline-flex min-h-11 items-center justify-center rounded-full bg-brand-950 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-brand-900">
                Show me the shortlist
              </a>
              <a href="#safety-first" className="inline-flex min-h-11 items-center justify-center rounded-full border border-brand-900/10 bg-white/70 px-5 py-2.5 text-sm font-semibold text-brand-900 transition hover:border-brand-700/30 hover:bg-white">
                Check safety first
              </a>
            </div>
          </div>

          <div className="rounded-3xl border border-brand-900/10 bg-white/70 p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-700">Fast answer</p>
            <ol className="mt-4 space-y-3 text-sm leading-6 text-muted">
              <li><strong className="text-ink">Body clock problem?</strong> Start by researching low-dose melatonin timing.</li>
              <li><strong className="text-ink">Racing mind?</strong> Start with L-theanine before stronger sedatives.</li>
              <li><strong className="text-ink">Tension or low-intake context?</strong> Compare magnesium forms.</li>
            </ol>
          </div>
        </div>
      </section>

      <section id="shortlist" className="card-premium p-6 sm:p-8">
        <div className="max-w-3xl">
          <p className="eyebrow-label">Recommended starting options</p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">Start with one of these three—not a giant stack</h2>
          <p className="mt-3 text-sm leading-7 text-muted">
            These are not prescriptions. They are the most decision-useful first options because each answers a different sleep problem: timing, mental quieting, or routine relaxation.
          </p>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {shortlist.map(({ option, profileHref, evidenceLabel, safetyLabel }) => {
            const copy = shortlistCopy[option.slug]
            return (
              <article key={option.slug} className="rounded-3xl border border-brand-900/10 bg-white/70 p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-xl font-semibold text-ink">{option.name}</h3>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 ring-1 ring-emerald-100">{evidenceLabel}</span>
                </div>
                <dl className="mt-4 space-y-3 text-sm leading-6">
                  <div>
                    <dt className="font-semibold text-ink">Typical use case</dt>
                    <dd className="text-muted">{copy.useCase}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-ink">Time to effect</dt>
                    <dd className="text-muted">{copy.timeToEffect}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-ink">Safety summary</dt>
                    <dd className="text-muted">{copy.safetySummary}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-ink">Why it made the shortlist</dt>
                    <dd className="text-muted">{copy.why}</dd>
                  </div>
                </dl>
                <div className="mt-5 rounded-2xl bg-brand-50/50 p-4 text-xs leading-6 text-brand-950 ring-1 ring-brand-900/5">
                  <strong>Best if:</strong> {copy.bestIf}<br />
                  <strong>Main tradeoff:</strong> {copy.tradeoff}<br />
                  <strong>Risk label:</strong> {safetyLabel}
                </div>
                {profileHref ? (
                  <Link href={profileHref} className="mt-4 inline-flex text-sm font-semibold text-brand-800 hover:text-brand-700 hover:underline">
                    Read the full profile →
                  </Link>
                ) : null}
              </article>
            )
          })}
        </div>
      </section>

      <section className="card-premium p-6 sm:p-8">
        <p className="eyebrow-label">Quick decision matrix</p>
        <h2 className="mt-2 text-2xl font-semibold text-ink">Choose by the constraint that matters most tonight</h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {matrix.map((item) => (
            <article key={item.label} className="rounded-2xl border border-brand-900/10 bg-white/70 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-700">{item.label}</p>
              <h3 className="mt-2 text-base font-semibold text-ink">{item.pick}</h3>
              <p className="mt-2 text-xs leading-5 text-muted">{item.note}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="safety-first" className="rounded-[2rem] border border-rose-700/15 bg-rose-50/70 p-6 shadow-sm sm:p-8">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-rose-800">Safety first</p>
          <h2 className="mt-2 text-2xl font-semibold text-rose-950">Pause before buying if any of these apply</h2>
          <p className="mt-3 text-sm leading-7 text-rose-900">
            Sleep supplements can be reasonable experiments, but they are not appropriate for every sleep problem or every medication context.
          </p>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {safetyItems.map((item) => (
            <article key={item.title} className="rounded-2xl border border-rose-900/10 bg-white/70 p-5">
              <h3 className="text-base font-semibold text-rose-950">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-rose-900">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="card-premium p-6 sm:p-8">
        <p className="eyebrow-label">Product quality guide</p>
        <h2 className="mt-2 text-2xl font-semibold text-ink">What to check before you purchase</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {qualityGuide.map((item) => (
            <article key={item.title} className="rounded-2xl border border-brand-900/10 bg-white/70 p-5">
              <h3 className="text-base font-semibold text-ink">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="card-premium p-6 sm:p-8">
        <p className="eyebrow-label">Compare next</p>
        <h2 className="mt-2 text-2xl font-semibold text-ink">Still deciding? Compare the exact tradeoff</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {comparisons.map((comparison) => (
            <Link key={comparison.href} href={comparison.href} className="rounded-2xl border border-brand-900/10 bg-white/70 p-5 transition hover:border-brand-700/25 hover:bg-white hover:shadow-sm">
              <h3 className="text-base font-semibold text-ink">{comparison.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{comparison.body}</p>
              <span className="mt-3 inline-flex text-sm font-semibold text-brand-800">Open comparison →</span>
            </Link>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-brand-900/10 bg-brand-50/40 p-5">
          <h3 className="text-base font-semibold text-ink">Alternative options to keep on the bench</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {alternatives.map((alternative) => (
              <Link key={alternative.name} href={alternative.href} className="rounded-xl bg-white/70 p-4 text-sm ring-1 ring-brand-900/5 transition hover:bg-white hover:ring-brand-700/20">
                <span className="block font-semibold text-ink">{alternative.name}</span>
                <span className="mt-1 block text-xs font-bold uppercase tracking-[0.12em] text-brand-700">{alternative.role}</span>
                <span className="mt-2 block text-xs leading-5 text-muted">{alternative.note}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="card-premium p-6 sm:p-8">
        <p className="eyebrow-label">Sourcing</p>
        <h2 className="mt-2 text-2xl font-semibold text-ink">If you decide to shop, use the checklist above first</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
          Sourcing links come after safety and product-quality guidance by design. Use them only after you know which sleep problem you are trying to solve and which caution notes apply.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {shortlist.map(({ option, compound }) => {
            const shopLinks = getAffiliateShopLinks(compound, option.name, compound?.entityType)
            const cta = shopLinks.find((link) => link.url)
            return (
              <article key={`${option.slug}-source`} className="rounded-2xl border border-brand-900/10 bg-white/70 p-5">
                <h3 className="text-base font-semibold text-ink">{option.name}</h3>
                <p className="mt-2 text-xs leading-5 text-muted">Check dose transparency, form, testing signals, and whether a single-ingredient product is enough before considering blends.</p>
                {cta ? (
                  <a href={cta.url} target="_blank" rel="nofollow sponsored noopener noreferrer" className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-brand-950 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-brand-900">
                    {cta.label} →
                  </a>
                ) : (
                  <span className="mt-4 inline-flex text-xs font-semibold text-muted">No sourcing link available.</span>
                )}
              </article>
            )
          })}
        </div>
      </section>

      <footer className="rounded-2xl border border-brand-900/10 bg-brand-950/[0.02] p-5 text-xs leading-6 text-muted">
        Educational only. Not medical advice. Evidence varies by population, preparation, dose, timing, and study design.
        Review medications, health conditions, pregnancy status, and clinician guidance before using supplements.
      </footer>
    </main>
  )
}
