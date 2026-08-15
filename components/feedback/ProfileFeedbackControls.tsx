'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { canTrackAnalytics } from '@/lib/consent'

const MISSING_OPTIONS = ['Evidence', 'Safety', 'Dose', 'Interactions', 'Forms', 'Comparisons'] as const

type Clarity = 'yes' | 'partly' | 'no'
type FoundAnswer = 'yes' | 'no'

function profileContext(pathname: string) {
  const match = pathname.match(/^\/(herbs|compounds)\/([^/]+)\/?$/)
  if (!match) return null
  return { type: match[1] === 'herbs' ? 'herb' : 'compound', slug: match[2] }
}

function emitFeedback(payload: Record<string, string>) {
  if (!canTrackAnalytics()) return
  try {
    const analyticsWindow = window as Window & {
      gtag?: (command: 'event', eventName: string, params: Record<string, string>) => void
      plausible?: (eventName: string, options?: { props?: Record<string, string> }) => void
    }
    analyticsWindow.gtag?.('event', 'profile_feedback', payload)
    analyticsWindow.plausible?.('profile_feedback', { props: payload })
  } catch {
    // Feedback must never interfere with reading or navigation.
  }
}

export default function ProfileFeedbackControls() {
  const pathname = usePathname() || '/'
  const context = useMemo(() => profileContext(pathname), [pathname])
  const [clarity, setClarity] = useState<Clarity | null>(null)
  const [foundAnswer, setFoundAnswer] = useState<FoundAnswer | null>(null)
  const [missing, setMissing] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  if (!context) return null

  const record = (field: string, value: string) => {
    emitFeedback({
      profile_type: context.type,
      profile_slug: context.slug,
      feedback_field: field,
      feedback_value: value,
      page_path: pathname,
    })
  }

  const chooseClarity = (value: Clarity) => {
    setClarity(value)
    record('clarity', value)
  }

  const chooseFoundAnswer = (value: FoundAnswer) => {
    setFoundAnswer(value)
    record('found_answer', value)
  }

  const chooseMissing = (value: string) => {
    setMissing(value)
    setSubmitted(true)
    record('missing_information', value.toLowerCase())
  }

  return (
    <aside
      aria-labelledby='profile-feedback-title'
      className='mx-auto my-8 max-w-4xl rounded-2xl border border-brand-900/10 bg-[var(--surface-card)] p-5 shadow-sm sm:p-6'
    >
      <div className='max-w-3xl'>
        <p className='eyebrow-label'>Help improve this profile</p>
        <h2 id='profile-feedback-title' className='mt-1 text-lg font-bold text-ink'>Was this evidence summary clear?</h2>
        <div className='mt-3 flex flex-wrap gap-2' role='group' aria-label='Rate evidence-summary clarity'>
          {(['yes', 'partly', 'no'] as const).map((value) => (
            <button
              key={value}
              type='button'
              aria-pressed={clarity === value}
              onClick={() => chooseClarity(value)}
              className={`min-h-11 rounded-full border px-4 py-2 text-sm font-semibold transition ${clarity === value ? 'border-brand-700 bg-brand-50 text-brand-900' : 'border-brand-900/15 bg-white text-ink hover:border-brand-700/40'}`}
            >
              {value === 'yes' ? 'Yes' : value === 'partly' ? 'Partly' : 'No'}
            </button>
          ))}
        </div>

        <h3 className='mt-5 text-sm font-bold text-ink'>Did you find what you were researching?</h3>
        <div className='mt-2 flex flex-wrap gap-2' role='group' aria-label='Did this profile answer your research question'>
          {(['yes', 'no'] as const).map((value) => (
            <button
              key={value}
              type='button'
              aria-pressed={foundAnswer === value}
              onClick={() => chooseFoundAnswer(value)}
              className={`min-h-11 rounded-full border px-4 py-2 text-sm font-semibold transition ${foundAnswer === value ? 'border-brand-700 bg-brand-50 text-brand-900' : 'border-brand-900/15 bg-white text-ink hover:border-brand-700/40'}`}
            >
              {value === 'yes' ? 'Yes' : 'Not yet'}
            </button>
          ))}
        </div>

        {(clarity === 'partly' || clarity === 'no' || foundAnswer === 'no') ? (
          <div className='mt-5'>
            <h3 className='text-sm font-bold text-ink'>What information was missing?</h3>
            <p className='mt-1 text-xs leading-5 text-muted'>Choose a topic only. Please do not enter symptoms, diagnoses, medications, or other personal health information.</p>
            <div className='mt-2 flex flex-wrap gap-2' role='group' aria-label='Missing information category'>
              {MISSING_OPTIONS.map((option) => (
                <button
                  key={option}
                  type='button'
                  aria-pressed={missing === option}
                  onClick={() => chooseMissing(option)}
                  className={`min-h-11 rounded-full border px-3.5 py-2 text-sm font-semibold transition ${missing === option ? 'border-brand-700 bg-brand-50 text-brand-900' : 'border-brand-900/15 bg-white text-ink hover:border-brand-700/40'}`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {submitted ? <p className='mt-4 text-sm font-semibold text-brand-800' role='status'>Thanks — that signal helps prioritize the next profile upgrades.</p> : null}

        <div className='mt-5 flex flex-wrap gap-x-4 gap-y-2 border-t border-brand-900/10 pt-4 text-sm'>
          <Link href='/roadmap/' className='font-semibold text-brand-800 hover:underline'>See the public research roadmap →</Link>
          <a href='https://github.com/Razzleberrytt/hippie-scientist-site/issues/new?template=research-intake.yml' className='font-semibold text-brand-800 hover:underline' rel='noreferrer'>Suggest an ingredient, comparison, study, or correction →</a>
        </div>
      </div>
    </aside>
  )
}
