'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { trackProfileFeedback, type ProfileFeedbackParams } from '@/lib/analytics'

type YesNoQuestion = 'evidence_clarity' | 'research_found'
type YesNo = 'yes' | 'no'
type MissingCategory = Extract<ProfileFeedbackParams['answer'],
  'evidence_studies' | 'dose_form' | 'safety_interactions' | 'timing_practical' | 'comparison' | 'other'
>

const missingCategories: Array<{ value: MissingCategory; label: string }> = [
  { value: 'evidence_studies', label: 'Evidence / studies' },
  { value: 'dose_form', label: 'Dose / form' },
  { value: 'safety_interactions', label: 'Safety / interactions' },
  { value: 'timing_practical', label: 'Timing / practical use' },
  { value: 'comparison', label: 'Comparison' },
  { value: 'other', label: 'Something else' },
]

function ChoiceButtons({
  question,
  value,
  onChoose,
}: {
  question: YesNoQuestion
  value: YesNo | null
  onChoose: (question: YesNoQuestion, answer: YesNo) => void
}) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label={question === 'evidence_clarity' ? 'Evidence summary clarity' : 'Research task completion'}>
      {(['yes', 'no'] as const).map((answer) => (
        <button
          key={answer}
          type="button"
          aria-pressed={value === answer}
          onClick={() => onChoose(question, answer)}
          className={`min-h-11 rounded-full border px-4 py-2 text-sm font-semibold transition ${
            value === answer
              ? 'border-brand-700/40 bg-brand-50 text-brand-900 dark:bg-[var(--surface-subtle)] dark:text-[var(--text-primary)]'
              : 'border-brand-900/15 bg-[var(--surface-card-strong)] text-ink hover:bg-[var(--surface-subtle)]'
          }`}
        >
          {answer === 'yes' ? 'Yes' : 'No'}
        </button>
      ))}
    </div>
  )
}

export default function ProfileFeedback() {
  const pathname = usePathname() || '/'
  const [clarity, setClarity] = useState<YesNo | null>(null)
  const [found, setFound] = useState<YesNo | null>(null)
  const [missing, setMissing] = useState<MissingCategory | null>(null)
  const [recorded, setRecorded] = useState(false)
  const isCanonicalProfile = /^\/(?:herbs|compounds)\/[^/]+\/?$/.test(pathname)

  const submit = (question: ProfileFeedbackParams['question'], answer: ProfileFeedbackParams['answer']) => {
    const didRecord = trackProfileFeedback({ question, answer, pagePath: pathname })
    setRecorded((current) => current || didRecord)
  }

  const chooseYesNo = (question: YesNoQuestion, answer: YesNo) => {
    if (question === 'evidence_clarity') setClarity(answer)
    else setFound(answer)
    submit(question, answer)
  }

  const chooseMissing = (value: MissingCategory) => {
    setMissing(value)
    submit('missing_information', value)
  }

  if (!isCanonicalProfile) return null

  return (
    <section aria-labelledby="profile-feedback-title" className="not-prose rounded-2xl border border-brand-900/10 bg-[var(--surface-card)] p-5 shadow-sm">
      <div className="max-w-2xl">
        <p className="eyebrow-label">Help improve this profile</p>
        <h2 id="profile-feedback-title" className="mt-2 text-xl font-semibold text-ink">Was this useful for your research?</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          These controls record only the page and the structured choice you make when analytics consent is enabled. Please don’t include personal medical information in research requests.
        </p>
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <p className="text-sm font-bold text-ink">Was this evidence summary clear?</p>
          <ChoiceButtons question="evidence_clarity" value={clarity} onChoose={chooseYesNo} />
        </div>
        <div className="space-y-2">
          <p className="text-sm font-bold text-ink">Did you find what you were researching?</p>
          <ChoiceButtons question="research_found" value={found} onChoose={chooseYesNo} />
        </div>
      </div>

      {found === 'no' ? (
        <div className="mt-5 border-t border-brand-900/10 pt-4">
          <p className="text-sm font-bold text-ink">What information was missing?</p>
          <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Missing information category">
            {missingCategories.map((category) => (
              <button
                key={category.value}
                type="button"
                aria-pressed={missing === category.value}
                onClick={() => chooseMissing(category.value)}
                className={`min-h-11 rounded-full border px-3.5 py-2 text-sm font-semibold transition ${
                  missing === category.value
                    ? 'border-brand-700/40 bg-brand-50 text-brand-900 dark:bg-[var(--surface-subtle)] dark:text-[var(--text-primary)]'
                    : 'border-brand-900/15 bg-[var(--surface-card-strong)] text-ink hover:bg-[var(--surface-subtle)]'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
        {recorded ? <span role="status" className="font-semibold text-brand-800">Thanks — feedback recorded.</span> : null}
        <Link href="/info/research-roadmap/" className="font-semibold text-brand-800 underline-offset-4 hover:underline">
          Suggest an ingredient, comparison, or study →
        </Link>
      </div>
    </section>
  )
}
