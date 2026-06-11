'use client'

import { useState } from 'react'
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
              href={`/articles/${link.slug}`}
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
        <Link href="/compare" className="flex flex-col justify-between rounded-lg border border-brand-900/10 bg-white/50 p-4 transition hover:border-brand-700/20 hover:bg-brand-50/10">
          <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-wider text-brand-700">Database</p>
            <h4 className="mt-1 text-sm font-bold text-ink">Compare Options</h4>
            <p className="mt-1 text-xs text-muted">Contrast herbs and compounds side-by-side on evidence metrics.</p>
          </div>
          <span className="mt-3 text-xs font-semibold text-brand-700 inline-flex items-center gap-1">Go to Compare tool →</span>
        </Link>
        
        {currentSlug !== 'adhd-stack-guide' ? (
          <Link href="/articles/adhd-stack-guide" className="flex flex-col justify-between rounded-lg border border-brand-900/10 bg-white/50 p-4 transition hover:border-brand-700/20 hover:bg-brand-50/10">
            <div>
              <p className="text-[0.68rem] font-bold uppercase tracking-wider text-brand-700">Formulation</p>
              <h4 className="mt-1 text-sm font-bold text-ink">Read the Stack Guide</h4>
              <p className="mt-1 text-xs text-muted">Learn about safety, synergistic stacking, and dosing guidelines.</p>
            </div>
            <span className="mt-3 text-xs font-semibold text-brand-700 inline-flex items-center gap-1">View Stack Guide →</span>
          </Link>
        ) : (
          <Link href="/articles/best-supplements-for-adhd" className="flex flex-col justify-between rounded-lg border border-brand-900/10 bg-white/50 p-4 transition hover:border-brand-700/20 hover:bg-brand-50/10">
            <div>
              <p className="text-[0.68rem] font-bold uppercase tracking-wider text-brand-700">Directory</p>
              <h4 className="mt-1 text-sm font-bold text-ink">Best Supplements</h4>
              <p className="mt-1 text-xs text-muted">Read our core comparison of ADHD-related supplements.</p>
            </div>
            <span className="mt-3 text-xs font-semibold text-brand-700 inline-flex items-center gap-1">View Directory →</span>
          </Link>
        )}

        <Link href="/safety-checker" className="flex flex-col justify-between rounded-lg border border-brand-900/10 bg-white/50 p-4 transition hover:border-brand-700/20 hover:bg-brand-50/10">
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

export function EmailCaptureForm() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) {
      setSubscribed(true)
      setEmail('')
    }
  }

  return (
    <div id="join-updates" className="mt-8 rounded-xl border border-brand-900/10 bg-brand-50/60 p-6 shadow-sm scroll-mt-20">
      <div className="max-w-2xl">
        <h3 className="font-display text-lg font-bold text-ink">Join the Hippie Scientist Research List</h3>
        <p className="mt-2 text-sm text-muted">
          Subscribe for clinical research updates, evidence breakdowns, and new compound profiles. No spam, no product selling. Just clean, evidence-based botanical and nutritional science.
        </p>
        
        {subscribed ? (
          <div className="mt-4 rounded-lg border border-emerald-900/10 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
            ✓ Thank you for subscribing! We will send you new evidence updates directly to your inbox.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2 sm:flex-row">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              className="flex-1 rounded-full border border-brand-900/15 bg-white px-4 py-2 text-sm text-ink placeholder:text-muted/60 focus:border-brand-700 focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-full bg-brand-800 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700 shadow-sm"
            >
              Join Updates
            </button>
          </form>
        )}
        
        <p className="mt-2.5 text-[0.7rem] text-muted/80">
          By signing up, you agree to receive research updates. We value your privacy and you can unsubscribe at any time.
        </p>
      </div>
    </div>
  )
}

export function AdhdComparisonCard({ slug }: { slug: string }) {
  let cardTitle = ''
  let cardDesc = ''
  let items: { label: string; text: string }[] = []
  let compareLink = ''

  if (slug === 'best-supplements-for-adhd' || slug === 'adhd-stack-guide' || slug === 'magnesium-for-adhd' || slug === 'l-theanine-for-adhd') {
    cardTitle = 'Comparison: Magnesium vs. L-Theanine'
    cardDesc = 'Both support relaxation, but via entirely different mechanisms. Many adults combine them to address different aspects of cognitive fatigue.'
    items = [
      { label: 'Primary Mechanism', text: 'Magnesium acts as an NMDA receptor antagonist (calming glutamate excitability); L-Theanine increases alpha brain wave activity and supports GABA synthesis.' },
      { label: 'Key Symptom Target', text: 'Magnesium targets muscle tension, sleep quality, and physical stress; L-Theanine targets cognitive calm, racing thoughts, and mental focus.' },
      { label: 'Medication Context', text: 'Both are generally low-risk with stimulants, but blood-pressure monitoring is warranted as both can mildly reduce blood pressure.' },
    ]
    compareLink = '/compare/magnesium-vs-l-theanine'
  } else if (slug === 'sleep-and-adhd' || slug === 'melatonin-for-adhd-sleep') {
    cardTitle = 'Comparison: Melatonin vs. Magnesium'
    cardDesc = 'Addressing sleep issues in ADHD requires distinguishing between falling asleep (circadian timing) and staying asleep (sleep quality).'
    items = [
      { label: 'Circadian Regulation', text: 'Melatonin signals the brain that it is night, directly shifting circadian phase. Best for delayed sleep onset.' },
      { label: 'Neuromuscular Calm', text: 'Magnesium supports neurotransmitters like GABA and relaxes muscles. Best for sleep architecture, restlessness, and staying asleep.' },
      { label: 'Dosing Cautions', text: 'Melatonin works in microdoses (0.3mg to 1mg) taken 2 hours before bed; Magnesium is taken as 200-400mg elemental glycinate/threonate 1 hour before bed.' },
    ]
    compareLink = '/compare/melatonin-vs-magnesium'
  } else if (slug === 'citicoline-vs-alpha-gpc') {
    cardTitle = 'Comparison: Citicoline vs. Alpha-GPC'
    cardDesc = 'These are the two most popular brain-active choline sources, but they differ in chemical structure and secondary metabolic pathways.'
    items = [
      { label: 'Citicoline (CDP-Choline)', text: 'Provides both choline and cytidine (which converts to uridine). Highly focused on dopamine receptor density and membrane synthesis.' },
      { label: 'Alpha-GPC', text: 'Provides glycerophosphate alongside choline. Increases acetylcholine output directly and crosses the blood-brain barrier very rapidly.' },
      { label: 'Cognitive Efficacy', text: 'Citicoline is preferred in clinical trials for sustained attention and mental energy; Alpha-GPC is preferred for power output and rapid memory support.' },
    ]
    compareLink = '/compare/citicoline-vs-alpha-gpc'
  } else if (slug === 'omega-3-and-adhd' || slug === 'nutrient-deficiencies-and-adhd') {
    cardTitle = 'Comparison: Omega-3 vs. General Nutrient Deficiencies'
    cardDesc = 'Correcting essential fatty acid levels addresses membrane structure, whereas mineral or vitamin correction addresses metabolic enzymes.'
    items = [
      { label: 'Omega-3 (EPA/DHA)', text: 'Builds cell membranes and supports dopamine transport over months. Has a modest, cumulative effect on attention.' },
      { label: 'Minerals (Iron, Zinc, Mg)', text: 'Direct co-factors for dopamine and norepinephrine synthesis. Crucial to test baseline levels rather than supplementing blindly.' },
      { label: 'Decision Logic', text: 'Omega-3s can be supplemented conservatively based on dietary gap; minerals like iron and zinc should be verified via blood labs first.' },
    ]
    compareLink = '/compare/omega-3-vs-zinc'
  } else {
    return null
  }

  return (
    <div className="mt-8 rounded-xl border border-brand-900/10 bg-[#fffdf7] p-5 shadow-sm">
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
