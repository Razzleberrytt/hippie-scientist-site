'use client'

import { useState } from 'react'
import { EmailCaptureBox } from './EmailCaptureBox'
import type { EmailCaptureGoal } from '@/content/emailCapture'

type InterestOption = {
  label: string
  goal: Extract<EmailCaptureGoal, 'sleep' | 'stress' | 'anxiety' | 'focus' | 'default'>
  description: string
}

const INTEREST_OPTIONS: readonly InterestOption[] = [
  { label: 'Sleep', goal: 'sleep', description: 'Sleep quality, timing, forms, and next-day tradeoffs.' },
  { label: 'Stress', goal: 'stress', description: 'Calming, adaptogen-style research, and stress-related tradeoffs.' },
  { label: 'Anxiety', goal: 'anxiety', description: 'Cautious evidence and safety context for anxiety-adjacent research.' },
  { label: 'Focus', goal: 'focus', description: 'Attention, cognition, stimulation, and non-stimulant approaches.' },
  { label: 'General research', goal: 'default', description: 'The broad evidence digest rather than one topic lane.' },
]

export default function NewsletterInterestSignup() {
  const [selected, setSelected] = useState<InterestOption>(INTEREST_OPTIONS[4])

  return (
    <section id='research-interests' className='scroll-mt-24 rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8'>
      <p className='eyebrow-label'>Research interests</p>
      <h2 className='mt-2 text-3xl font-semibold tracking-tight text-ink'>What do you want to research?</h2>
      <p className='mt-3 max-w-3xl text-sm leading-7 text-muted'>
        Choose a content lane, then use your email below. Existing subscribers can enter the same address to update their research-interest tag. This records a newsletter content preference only; do not enter symptoms, diagnoses, medications, or other health information.
      </p>

      <div className='mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5' role='group' aria-label='Newsletter research interest'>
        {INTEREST_OPTIONS.map((option) => {
          const active = selected.goal === option.goal
          return (
            <button
              key={option.goal}
              type='button'
              onClick={() => setSelected(option)}
              aria-pressed={active}
              className={`rounded-2xl border p-4 text-left transition ${
                active
                  ? 'border-brand-700/30 bg-brand-50 shadow-sm'
                  : 'border-brand-900/10 bg-white hover:border-brand-700/20 hover:bg-brand-50/40'
              }`}
            >
              <span className='block text-sm font-bold text-ink'>{option.label}</span>
              <span className='mt-1 block text-xs leading-5 text-muted'>{option.description}</span>
            </button>
          )
        })}
      </div>

      <EmailCaptureBox
        key={selected.goal}
        goal={selected.goal}
        variant='wide'
        className='mt-6'
        title={`Follow ${selected.label.toLowerCase()} research`}
        description='Subscribe or update this email address so future evidence notes can be selected for this research-interest lane.'
      />
    </section>
  )
}
