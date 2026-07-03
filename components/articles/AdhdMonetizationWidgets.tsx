import Link from 'next/link'

export function StartHereBox({ currentSlug }: { currentSlug: string }) {
  const links = [
    { slug: 'best-supplements-for-adhd', label: 'Best Supplements for ADHD' },
    { slug: 'adhd-stack-guide', label: 'ADHD Stack Guide' },
    { slug: 'sleep-and-adhd', label: 'Sleep & ADHD' },
    { slug: 'nutrient-deficiencies-and-adhd', label: 'Nutrient Deficiencies' },
  ]

  return (
    <div className="mt-6 rounded-xl border border-brand-900/10 bg-brand-50/50 p-4 sm:p-5">
      <p className="text-xs font-bold uppercase tracking-[0.15em] text-brand-800">Start Here: ADHD Focus Cluster</p>
      <div className="mt-3 grid gap-2 grid-cols-2 sm:grid-cols-4">
        {links.map((link) => {
          const isCurrent = link.slug === currentSlug
          return (
            <Link
              key={link.slug}
              href={`/guides/adhd/${link.slug}`}
              className={`flex items-center justify-between rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                isCurrent
                  ? 'border-brand-700 bg-brand-100 text-brand-900 cursor-default pointer-events-none'
                  : 'border-brand-900/10 bg-white text-brand-800 hover:border-brand-900/20 hover:bg-brand-50/20'
              }`}
            >
              <span>{link.label}</span>
              {!isCurrent && <span className="text-brand-500 font-bold ml-1">→</span>}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export function AdhdCtaDashboard({ currentSlug }: { currentSlug: string }) {
  return (
    <div className="mt-8 rounded-xl border border-brand-900/10 bg-white/80 p-5 shadow-sm">
      <h3 className="text-base font-bold text-ink">Next Steps &amp; Practical Resources</h3>
      <p className="mt-1 text-sm text-muted">Review these guides to translate evidence into safe, personalized actions.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/guides/compare/" className="flex flex-col justify-between rounded-lg border border-brand-900/10 bg-white/50 p-4 transition hover:border-brand-700/20 hover:bg-brand-50/10">
          <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-wider text-brand-700">Database</p>
            <h4 className="mt-1 text-sm font-bold text-ink">Compare Options</h4>
            <p className="mt-1 text-xs text-muted">Contrast herbs and compounds side-by-side on evidence metrics.</p>
          </div>
          <span className="mt-3 text-xs font-semibold text-brand-700 inline-flex items-center gap-1">Go to Compare tool →</span>
        </Link>
        
        {currentSlug !== 'adhd-stack-guide' ? (
          <Link href="/guides/adhd/adhd-stack-guide/" className="flex flex-col justify-between rounded-lg border border-brand-900/10 bg-white/50 p-4 transition hover:border-brand-700/20 hover:bg-brand-50/10">
            <div>
              <p className="text-[0.68rem] font-bold uppercase tracking-wider text-brand-700">Formulation</p>
              <h4 className="mt-1 text-sm font-bold text-ink">Read the Stack Guide</h4>
              <p className="mt-1 text-xs text-muted">Learn about safety, synergistic stacking, and dosing guidelines.</p>
            </div>
            <span className="mt-3 text-xs font-semibold text-brand-700 inline-flex items-center gap-1">View Stack Guide →</span>
          </Link>
        ) : (
          <Link href="/guides/adhd/best-supplements-for-adhd/" className="flex flex-col justify-between rounded-lg border border-brand-900/10 bg-white/50 p-4 transition hover:border-brand-700/20 hover:bg-brand-50/10">
            <div>
              <p className="text-[0.68rem] font-bold uppercase tracking-wider text-brand-700">Directory</p>
              <h4 className="mt-1 text-sm font-bold text-ink">Best Supplements</h4>
              <p className="mt-1 text-xs text-muted">Read our core comparison of ADHD-related supplements.</p>
            </div>
            <span className="mt-3 text-xs font-semibold text-brand-700 inline-flex items-center gap-1">View Directory →</span>
          </Link>
        )}

        <Link href="/safety-checker/" className="flex flex-col justify-between rounded-lg border border-brand-900/10 bg-white/50 p-4 transition hover:border-brand-700/20 hover:bg-brand-50/10">
          <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-wider text-brand-700">Safety First</p>
            <h4 className="mt-1 text-sm font-bold text-ink">Check Safety Notes</h4>
            <p className="mt-1 text-xs text-muted">Scan interactions, side effects, and warning tags for ADHD.</p>
          </div>
          <span className="mt-3 text-xs font-semibold text-brand-700 inline-flex items-center gap-1">Check safety profiles →</span>
        </Link>

        <a href="#join-updates" className="flex flex-col justify-between rounded-lg border border-brand-900/10 bg-white/50 p-4 transition hover:border-brand-700/20 hover:bg-brand-50/10">
          <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-wider text-brand-700">Research List</p>
            <h4 className="mt-1 text-sm font-bold text-ink">Join Updates</h4>
            <p className="mt-1 text-xs text-muted">Receive evidence summaries and new botanical analyses directly.</p>
          </div>
          <span className="mt-3 text-xs font-semibold text-brand-700 inline-flex items-center gap-1">Sign up below ↓</span>
        </a>
      </div>
    </div>
  )
}


export function AdhdComparisonCard({ slug }: { slug: string }) {
  let cardTitle = ''
  let cardDesc = ''
  let items: { label: string; text: string }[] = []
  let compareLink = ''

  if (slug === 'best-supplements-for-adhd' || slug === 'adhd-stack-guide' || slug === 'magnesium-for-adhd' || slug === 'l-theanine-for-adhd' || slug === 'ashwagandha-for-adhd') {
    cardTitle = 'Comparison: Magnesium vs. L-Theanine'
    cardDesc = 'Both support relaxation, but via entirely different mechanisms. Many adults combine them to address different aspects of cognitive fatigue.'
    items = [
      { label: 'Primary Mechanism', text: 'Magnesium acts as an NMDA receptor antagonist (calming glutamate excitability); L-Theanine increases alpha brain wave activity and supports GABA synthesis.' },
      { label: 'Key Symptom Target', text: 'Magnesium targets muscle tension, sleep quality, and physical stress; L-Theanine targets cognitive calm, racing thoughts, and mental focus.' },
      { label: 'Medication Context', text: 'Both are generally low-risk with stimulants, but blood-pressure monitoring is warranted as both can mildly reduce blood pressure.' },
    ]
    compareLink = '/guides/compare/ashwagandha-vs-l-theanine-vs-magnesium'
  } else if (slug === 'sleep-and-adhd' || slug === 'melatonin-for-adhd-sleep') {
    cardTitle = 'Comparison: Melatonin vs. Magnesium'
    cardDesc = 'Addressing sleep issues in ADHD requires distinguishing between falling asleep (circadian timing) and staying asleep (sleep quality).'
    items = [
      { label: 'Circadian Regulation', text: 'Melatonin signals the brain that it is night, directly shifting circadian phase. Best for delayed sleep onset.' },
      { label: 'Neuromuscular Calm', text: 'Magnesium supports neurotransmitters like GABA and relaxes muscles. Best for sleep architecture, restlessness, and staying asleep.' },
      { label: 'Dosing Cautions', text: 'Melatonin works in microdoses (0.3mg to 1mg) taken 2 hours before bed; Magnesium is taken as 200-400mg elemental glycinate/threonate 1 hour before bed.' },
    ]
    compareLink = '/guides/compare/melatonin-vs-magnesium'
  } else if (slug === 'citicoline-vs-alpha-gpc') {
    cardTitle = 'Comparison: Citicoline vs. Alpha-GPC'
    cardDesc = 'These are the two most popular brain-active choline sources, but they differ in chemical structure and secondary metabolic pathways.'
    items = [
      { label: 'Citicoline (CDP-Choline)', text: 'Provides both choline and cytidine (which converts to uridine). Highly focused on dopamine receptor density and membrane synthesis.' },
      { label: 'Alpha-GPC', text: 'Provides glycerophosphate alongside choline. Increases acetylcholine output directly and crosses the blood-brain barrier very rapidly.' },
      { label: 'Cognitive Efficacy', text: 'Citicoline is preferred in clinical trials for sustained attention and mental energy; Alpha-GPC is preferred for power output and rapid memory support.' },
    ]
    compareLink = '/guides/adhd/citicoline-vs-alpha-gpc/'
  } else if (slug === 'omega-3-and-adhd' || slug === 'nutrient-deficiencies-and-adhd') {
    cardTitle = 'Comparison: Omega-3 vs. General Nutrient Deficiencies'
    cardDesc = 'Correcting essential fatty acid levels addresses membrane structure, whereas mineral or vitamin correction addresses metabolic enzymes.'
    items = [
      { label: 'Omega-3 (EPA/DHA)', text: 'Builds cell membranes and supports dopamine transport over months. Has a modest, cumulative effect on attention.' },
      { label: 'Minerals (Iron, Zinc, Mg)', text: 'Direct co-factors for dopamine and norepinephrine synthesis. Crucial to test baseline levels rather than supplementing blindly.' },
      { label: 'Decision Logic', text: 'Omega-3s can be supplemented conservatively based on dietary gap; minerals like iron and zinc should be verified via blood labs first.' },
    ]
    compareLink = '/guides/adhd/best-supplements-for-adhd/'
  } else if (slug === 'l-theanine-vs-caffeine-for-focus') {
    cardTitle = 'Comparison: Caffeine vs. L-Theanine'
    cardDesc = 'Caffeine provides rapid, direct stimulation, while L-Theanine supports calm alpha-wave activity to smooth out neurotransmitter spikes.'
    items = [
      { label: 'Alertness vs. Calm', text: 'Caffeine blocks adenosine receptors to keep you awake; L-Theanine modulates GABA and glutamate to quiet excessive mental noise.' },
      { label: 'Synergistic Ratio', text: 'Clinical trials often pair them in a 2:1 ratio (200mg L-Theanine to 100mg Caffeine) to maximize attention while reducing jitteriness.' },
      { label: 'Sleep & Timing', text: 'Caffeine has a 3-7 hour half-life and can disrupt sleep if taken late; L-Theanine is non-sedating and safe to take closer to bedtime.' },
    ]
    compareLink = '/guides/compare/caffeine-vs-l-theanine-vs-bacopa-for-focus'
  } else {
    return null
  }

  return (
    <div className="mt-8 rounded-xl bg-white p-5 shadow-[0_1px_2px_rgba(13,23,18,0.06)]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base font-bold text-ink">{cardTitle}</h3>
        <span className="rounded-full border border-brand-900/10 bg-brand-50 px-2 py-0.5 text-xs font-bold text-brand-800">Quick Comparison</span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-muted">{cardDesc}</p>
      
      <div className="mt-4 space-y-3">
        {items.map((item, index) => (
          <div key={index} className="text-sm">
            <strong className="text-ink">{item.label}:</strong>{' '}
            <span className="text-muted leading-relaxed">{item.text}</span>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-3 border-t border-brand-900/5">
        <Link href={compareLink} className="text-xs font-semibold text-brand-700 hover:text-brand-800 hover:underline">
          View full comparison analysis →
        </Link>
      </div>
    </div>
  )
}

export function getAdhdCtasForSlug(slug: string) {
  let top: 'start-here' | 'stack' | 'checklist' = 'start-here'
  let mid: 'checklist' | 'safety' = 'checklist'
  let bottom: 'stack' | 'checklist' | 'start-here' = 'stack'

  if (slug === 'best-supplements-for-adhd') {
    top = 'start-here'
    mid = 'checklist'
    bottom = 'stack'
  } else if (slug === 'adhd-stack-guide') {
    top = 'start-here'
    mid = 'checklist'
    bottom = 'checklist'
  } else if (slug === 'adhd-blood-tests') {
    top = 'start-here'
    mid = 'safety'
    bottom = 'stack'
  } else if (slug === 'adhd-supplements') {
    top = 'checklist'
    mid = 'safety'
    bottom = 'stack'
  } else {
    top = 'start-here'
    mid = 'checklist'
    bottom = 'stack'
  }

  return { top, mid, bottom }
}

export function AdhdInlineCta({ type }: { type: 'start-here' | 'checklist' | 'stack' | 'safety' }) {
  if (type === 'safety') {
    return (
      <div className="my-8 rounded-xl border border-amber-900/15 bg-amber-50/50 p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="text-xl leading-none">⚠️</span>
          <div>
            <h4 className="text-sm font-bold text-amber-900">Safety &amp; Testing First</h4>
            <p className="mt-1.5 text-sm leading-relaxed text-amber-800/95">
              Supplements do not treat or cure ADHD. Nutrients like iron, zinc, and vitamin D are best approached through testing and professional guidance.
            </p>
          </div>
        </div>
      </div>
    )
  }

  let title = ''
  let text = ''
  let href = ''
  let buttonText = ''
  let badgeText = ''

  if (type === 'start-here') {
    title = 'Start Here'
    text = 'New to ADHD supplements? Start with the evidence-first guide before building a stack.'
    href = '/guides/adhd/adhd-supplements'
    buttonText = 'Read Guide'
    badgeText = 'Evidence-First Guide'
  } else if (type === 'checklist') {
    title = 'ADHD Supplement Checklist'
    text = 'Want a safer supplement checklist? Review what to test first before adding iron, zinc, vitamin D, or magnesium.'
    href = '/guides/adhd/adhd-blood-tests'
    buttonText = 'View Checklist'
    badgeText = 'Testing Checklist'
  } else if (type === 'stack') {
    title = 'ADHD Stack Guide'
    text = 'Building a supplement stack? Read the ADHD Stack Guide to avoid overlapping ingredients and unrealistic expectations.'
    href = '/guides/adhd/adhd-stack-guide'
    buttonText = 'Read Stack Guide'
    badgeText = 'Safer Stacking'
  }

  return (
    <div className="my-8 rounded-xl border border-brand-900/10 bg-brand-50/30 p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="rounded bg-brand-100 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-brand-800">
              {badgeText}
            </span>
          </div>
          <h4 className="mt-2 text-base font-bold text-ink">{title}</h4>
          <p className="mt-1 text-sm leading-relaxed text-muted">{text}</p>
        </div>
        <div className="flex shrink-0 items-center">
          <Link
            href={href}
            className="w-full sm:w-auto text-center rounded-full bg-brand-800 px-5 py-2 text-xs font-bold text-white transition hover:bg-brand-700 shadow-sm"
          >
            {buttonText} →
          </Link>
        </div>
      </div>
    </div>
  )
}
