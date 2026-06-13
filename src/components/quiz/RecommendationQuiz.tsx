'use client'

import { useState } from 'react'
import Link from 'next/link'

interface BotanicalItem {
  slug: string
  name: string
  displayName?: string
  description?: string
  mechanism?: string
  mechanisms?: string[]
  effects?: string[] | string
  safety?: string
  evidence?: string
  [key: string]: any
}

interface QuizProps {
  herbs: any[]
  compounds: any[]
}

type QuizStep = 'goal' | 'stimulants' | 'evidence' | 'safety' | 'results'

const STEP_LABELS: Record<QuizStep, string> = {
  goal: 'Step 1 of 4: primary objective',
  stimulants: 'Step 2 of 4: stimulant preference',
  evidence: 'Step 3 of 4: evidence threshold',
  safety: 'Step 4 of 4: safety threshold',
  results: 'Recommendations generated',
}

export default function RecommendationQuiz({ herbs, compounds }: QuizProps) {
  const [step, setStep] = useState<QuizStep>('goal')
  const [goal, setGoal] = useState<'focus' | 'sleep' | 'stress' | null>(null)
  const [nonStimulant, setNonStimulant] = useState<boolean | null>(null)
  const [highEvidenceOnly, setHighEvidenceOnly] = useState<boolean | null>(null)
  const [maxSafetyOnly, setMaxSafetyOnly] = useState<boolean | null>(null)

  const allItems = [...herbs, ...compounds]

  const handleRestart = () => {
    setGoal(null)
    setNonStimulant(null)
    setHighEvidenceOnly(null)
    setMaxSafetyOnly(null)
    setStep('goal')
  }

  // Calculate matching recommendations
  const getRecommendations = () => {
    let list = [...allItems]

    // 1. Goal filtering
    if (goal === 'focus') {
      list = list.filter(item => {
        const text = `${item.name} ${item.description || ''} ${item.mechanism || ''} ${Array.isArray(item.effects) ? item.effects.join(' ') : ''}`.toLowerCase()
        return text.includes('focus') || text.includes('cognition') || text.includes('memory') || text.includes('attention') || text.includes('nootropic') || text.includes('dopamine')
      })
    } else if (goal === 'sleep') {
      list = list.filter(item => {
        const text = `${item.name} ${item.description || ''} ${item.mechanism || ''} ${Array.isArray(item.effects) ? item.effects.join(' ') : ''}`.toLowerCase()
        return text.includes('sleep') || text.includes('calm') || text.includes('gaba') || text.includes('sedat') || text.includes('relaxation')
      })
    } else if (goal === 'stress') {
      list = list.filter(item => {
        const text = `${item.name} ${item.description || ''} ${item.mechanism || ''} ${Array.isArray(item.effects) ? item.effects.join(' ') : ''}`.toLowerCase()
        return text.includes('stress') || text.includes('anxiety') || text.includes('adaptogen') || text.includes('cortisol') || text.includes('anxiolytic')
      })
    }

    // 2. Stimulant filtering
    if (nonStimulant) {
      list = list.filter(item => {
        const text = `${item.name} ${item.description || ''} ${item.mechanism || ''}`.toLowerCase()
        return !text.includes('stimulant') && !text.includes('caffeine') && !text.includes('stimulation') && !text.includes('jitter')
      })
    }

    // 3. Evidence filtering
    if (highEvidenceOnly) {
      list = list.filter(item => {
        const ev = (item.evidence || '').toLowerCase()
        return ev.includes('strong') || ev.includes('moderate') || ev.includes('tier a') || ev.includes('tier b')
      })
    }

    // 4. Safety filtering
    if (maxSafetyOnly) {
      list = list.filter(item => {
        const safetyStr = (item.safety || '').toLowerCase()
        return safetyStr.includes('well tolerated') || safetyStr.includes('low concern') || (!safetyStr.includes('caution') && !safetyStr.includes('avoid') && !safetyStr.includes('warning') && !safetyStr.includes('interaction'))
      })
    }

    // Calculate match percentage for displaying relevance
    return list
      .map(item => {
        let score = 85 // baseline match score
        const ev = (item.evidence || '').toLowerCase()
        if (ev.includes('strong')) score += 10
        if (ev.includes('moderate')) score += 5
        const safetyStr = (item.safety || '').toLowerCase()
        if (safetyStr.includes('well tolerated')) score += 5
        return { ...item, matchScore: Math.min(score, 99) }
      })
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 3)
  }

  const recommendations = getRecommendations()

  return (
    <section
      className='mx-auto max-w-xl rounded-3xl border border-brand-900/10 bg-white/90 p-6 shadow-md sm:p-8'
      aria-labelledby="recommendation-quiz-heading"
      aria-describedby="recommendation-quiz-status"
    >
      <p id="recommendation-quiz-status" className="sr-only" aria-live="polite">
        {STEP_LABELS[step]}
      </p>
      {step === 'goal' && (
        <div className='space-y-6'>
          <div className='text-center space-y-1.5'>
            <p className='text-xs font-bold uppercase tracking-wider text-emerald-700'>Step 1 of 4</p>
            <h2 id="recommendation-quiz-heading" className='text-xl font-bold text-slate-800'>What is your primary neurochemical objective?</h2>
          </div>
          <div className='grid gap-3' role="group" aria-labelledby="recommendation-quiz-heading">
            <button
              onClick={() => {
                setGoal('focus')
                setStep('stimulants')
              }}
              type='button'
              className='flex w-full flex-col rounded-2xl border border-slate-200 p-4 text-left hover:border-emerald-500 hover:bg-emerald-50/10 transition-all'
            >
              <span className='font-bold text-slate-800'>⚡ Focus & Cognition</span>
              <span className='mt-1 text-xs text-slate-500'>Support concentration, memory recall, and productivity drive.</span>
            </button>
            <button
              onClick={() => {
                setGoal('sleep')
                setStep('stimulants')
              }}
              type='button'
              className='flex w-full flex-col rounded-2xl border border-slate-200 p-4 text-left hover:border-emerald-500 hover:bg-emerald-50/10 transition-all'
            >
              <span className='font-bold text-slate-800'>🌙 Sleep & Wind-down</span>
              <span className='mt-1 text-xs text-slate-500'>Improve evening onset speed, rest quality, and biological recovery.</span>
            </button>
            <button
              onClick={() => {
                setGoal('stress')
                setStep('stimulants')
              }}
              type='button'
              className='flex w-full flex-col rounded-2xl border border-slate-200 p-4 text-left hover:border-emerald-500 hover:bg-emerald-50/10 transition-all'
            >
              <span className='font-bold text-slate-800'>🧘 Stress & Anxiety Resilience</span>
              <span className='mt-1 text-xs text-slate-500'>Balance cortisol response, calm overactivity, and build adaptability.</span>
            </button>
          </div>
        </div>
      )}

      {step === 'stimulants' && (
        <div className='space-y-6'>
          <div className='text-center space-y-1.5'>
            <p className='text-xs font-bold uppercase tracking-wider text-emerald-700'>Step 2 of 4</p>
            <h2 id="recommendation-quiz-heading" className='text-xl font-bold text-slate-800'>Do you want to avoid central nervous system stimulants?</h2>
          </div>
          <div className='grid gap-3 sm:grid-cols-2' role="group" aria-labelledby="recommendation-quiz-heading">
            <button
              onClick={() => {
                setNonStimulant(true)
                setStep('evidence')
              }}
              type='button'
              className='flex flex-col items-center justify-center rounded-2xl border border-slate-200 p-5 text-center hover:border-emerald-500 hover:bg-emerald-50/10 transition-all'
            >
              <span className='text-2xl'>☕🚫</span>
              <span className='mt-2 font-bold text-slate-800'>Yes, Non-Stimulant Only</span>
              <span className='mt-1 text-[11px] text-slate-500'>Avoid caffeine-like jitters or sleep disruption.</span>
            </button>
            <button
              onClick={() => {
                setNonStimulant(false)
                setStep('evidence')
              }}
              type='button'
              className='flex flex-col items-center justify-center rounded-2xl border border-slate-200 p-5 text-center hover:border-emerald-500 hover:bg-emerald-50/10 transition-all'
            >
              <span className='text-2xl'>⚡☕</span>
              <span className='mt-2 font-bold text-slate-800'>No, Stimulants are OK</span>
              <span className='mt-1 text-[11px] text-slate-500'>Include energy support compounds.</span>
            </button>
          </div>
          <button
            onClick={() => setStep('goal')}
            type='button'
            className='block w-full text-center text-xs font-semibold text-slate-500 hover:underline'
          >
            ← Back
          </button>
        </div>
      )}

      {step === 'evidence' && (
        <div className='space-y-6'>
          <div className='text-center space-y-1.5'>
            <p className='text-xs font-bold uppercase tracking-wider text-emerald-700'>Step 3 of 4</p>
            <h2 id="recommendation-quiz-heading" className='text-xl font-bold text-slate-800'>What level of scientific evidence do you require?</h2>
          </div>
          <div className='grid gap-3 sm:grid-cols-2' role="group" aria-labelledby="recommendation-quiz-heading">
            <button
              onClick={() => {
                setHighEvidenceOnly(true)
                setStep('safety')
              }}
              type='button'
              className='flex flex-col items-center justify-center rounded-2xl border border-slate-200 p-5 text-center hover:border-emerald-500 hover:bg-emerald-50/10 transition-all'
            >
              <span className='text-2xl'>🔬</span>
              <span className='mt-2 font-bold text-slate-800'>High / Clinical Only</span>
              <span className='mt-1 text-[11px] text-slate-500'>Limit to human RCTs and strong clinical consensus.</span>
            </button>
            <button
              onClick={() => {
                setHighEvidenceOnly(false)
                setStep('safety')
              }}
              type='button'
              className='flex flex-col items-center justify-center rounded-2xl border border-slate-200 p-5 text-center hover:border-emerald-500 hover:bg-emerald-50/10 transition-all'
            >
              <span className='text-2xl'>🌱</span>
              <span className='mt-2 font-bold text-slate-800'>Include Preliminary & Traditional</span>
              <span className='mt-1 text-[11px] text-slate-500'>Explore ethnobotanical and preclinical mechanisms.</span>
            </button>
          </div>
          <button
            onClick={() => setStep('stimulants')}
            type='button'
            className='block w-full text-center text-xs font-semibold text-slate-500 hover:underline'
          >
            ← Back
          </button>
        </div>
      )}

      {step === 'safety' && (
        <div className='space-y-6'>
          <div className='text-center space-y-1.5'>
            <p className='text-xs font-bold uppercase tracking-wider text-emerald-700'>Step 4 of 4</p>
            <h2 id="recommendation-quiz-heading" className='text-xl font-bold text-slate-800'>How strict is your safety requirement?</h2>
          </div>
          <div className='grid gap-3 sm:grid-cols-2' role="group" aria-labelledby="recommendation-quiz-heading">
            <button
              onClick={() => {
                setMaxSafetyOnly(true)
                setStep('results')
              }}
              type='button'
              className='flex flex-col items-center justify-center rounded-2xl border border-slate-200 p-5 text-center hover:border-emerald-500 hover:bg-emerald-50/10 transition-all'
            >
              <span className='text-2xl'>🛡️</span>
              <span className='mt-2 font-bold text-slate-800'>Highly Conservative</span>
              <span className='mt-1 text-[11px] text-slate-500'>Only display well-tolerated options with minimal alerts.</span>
            </button>
            <button
              onClick={() => {
                setMaxSafetyOnly(false)
                setStep('results')
              }}
              type='button'
              className='flex flex-col items-center justify-center rounded-2xl border border-slate-200 p-5 text-center hover:border-emerald-500 hover:bg-emerald-50/10 transition-all'
            >
              <span className='text-2xl'>⚙️</span>
              <span className='mt-2 font-bold text-slate-800'>Moderate Cautions OK</span>
              <span className='mt-1 text-[11px] text-slate-500'>Include items that have minor warnings or interactions.</span>
            </button>
          </div>
          <button
            onClick={() => setStep('evidence')}
            type='button'
            className='block w-full text-center text-xs font-semibold text-slate-500 hover:underline'
          >
            ← Back
          </button>
        </div>
      )}

      {step === 'results' && (
        <div className='space-y-6'>
          <div className='text-center space-y-1.5'>
            <p className='text-xs font-bold uppercase tracking-wider text-emerald-700'>Recommendations Generated</p>
            <h2 id="recommendation-quiz-heading" className='text-2xl font-bold text-slate-800'>Your Top Matches</h2>
            <p className='text-xs text-slate-500'>Based on your neurochemical preferences and safety criteria.</p>
          </div>

          <div className='space-y-4'>
            {recommendations.length === 0 ? (
              <div className='py-8 text-center text-slate-400 text-sm border border-dashed border-slate-200 rounded-2xl'>
                No exact matches met all strict safety and evidence criteria. Try restarting with broader settings.
              </div>
            ) : (
              recommendations.map(item => (
                <div
                  key={item.slug}
                  className='rounded-2xl border border-slate-100 bg-slate-50/50 p-4 space-y-3 shadow-sm hover:shadow transition-shadow'
                >
                  <div className='flex items-start justify-between gap-2'>
                    <div>
                      <h3 className='font-bold text-slate-900'>{item.name}</h3>
                      <span className='inline-flex mt-0.5 rounded bg-emerald-50 text-emerald-700 px-2 py-0.5 text-[9px] font-bold uppercase border border-emerald-200/50'>
                        {item.matchScore}% MATCH
                      </span>
                    </div>
                    <Link
                      href={item.safety ? `/compounds/${item.slug}` : `/herbs/${item.slug}`}
                      className='rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition'
                    >
                      View Profile
                    </Link>
                  </div>
                  {item.description && (
                    <p className='text-xs leading-relaxed text-slate-600 line-clamp-2'>
                      {item.description}
                    </p>
                  )}
                  {item.mechanism && (
                    <p className='text-[10px] text-slate-500 border-t border-slate-200/50 pt-2 leading-relaxed'>
                      <span className='font-bold text-slate-600'>Primary Mechanism:</span> {item.mechanism}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>

          <button
            onClick={handleRestart}
            type='button'
            className='block w-full rounded-2xl bg-slate-100 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition text-center'
          >
            Restart Quiz
          </button>
        </div>
      )}
    </section>
  )
}
