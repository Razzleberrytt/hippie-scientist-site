'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { trackResearchSuggestion, type ResearchSuggestionParams } from '@/lib/analytics'

type SuggestionType = ResearchSuggestionParams['suggestionType']

const TERM_PATTERN = /^[A-Za-z0-9][A-Za-z0-9 .+'’()/-]{1,59}$/
const PMID_PATTERN = /^\d{6,9}$/
const DOI_PATTERN = /^10\.\d{4,9}\/[A-Za-z0-9._;()/:+-]+$/i

function normalizeTerm(value: string) {
  return value.trim().replace(/\s+/g, ' ')
}

export default function ResearchSuggestionPanel() {
  const [type, setType] = useState<SuggestionType>('ingredient')
  const [first, setFirst] = useState('')
  const [second, setSecond] = useState('')
  const [status, setStatus] = useState('')

  const reset = () => {
    setFirst('')
    setSecond('')
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus('')

    const a = normalizeTerm(first)
    const b = normalizeTerm(second)
    let value = ''

    if (type === 'ingredient') {
      if (!TERM_PATTERN.test(a)) {
        setStatus('Enter one ingredient or compound name (2–60 characters).')
        return
      }
      value = a.toLowerCase()
    } else if (type === 'comparison') {
      if (!TERM_PATTERN.test(a) || !TERM_PATTERN.test(b)) {
        setStatus('Enter two ingredient or compound names (2–60 characters each).')
        return
      }
      const pair = [a.toLowerCase(), b.toLowerCase()].sort()
      if (pair[0] === pair[1]) {
        setStatus('Choose two different ingredients or compounds.')
        return
      }
      value = pair.join(' vs ')
    } else {
      const identifier = a.replace(/^https?:\/\/(?:dx\.)?doi\.org\//i, '').replace(/^pmid\s*:?\s*/i, '')
      if (!PMID_PATTERN.test(identifier) && !DOI_PATTERN.test(identifier)) {
        setStatus('Enter a PMID (6–9 digits) or DOI beginning with 10.')
        return
      }
      value = identifier.toLowerCase()
    }

    const recorded = trackResearchSuggestion({ suggestionType: type, suggestionValue: value, pagePath: '/info/research-roadmap/' })
    if (recorded) {
      setStatus('Thanks — suggestion recorded for demand ranking.')
      reset()
    } else {
      setStatus('Analytics consent is off, so this was not recorded. You can send the research suggestion by email instead.')
    }
  }

  return (
    <section aria-labelledby="research-suggestion-title" className="card-premium p-6 sm:p-8">
      <p className="eyebrow-label">Shape the backlog</p>
      <h2 id="research-suggestion-title" className="mt-2 text-2xl font-semibold text-ink">Suggest research</h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
        Submit topic names only. Do not enter symptoms, diagnoses, medications you take, or other personal medical information. Detailed corrections belong in the public correction workflow.
      </p>

      <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Research suggestion type">
        {([
          ['ingredient', 'Ingredient'],
          ['comparison', 'Comparison'],
          ['missing_study', 'Missing study'],
        ] as const).map(([value, label]) => (
          <button
            key={value}
            type="button"
            aria-pressed={type === value}
            onClick={() => { setType(value); reset(); setStatus('') }}
            className={`min-h-11 rounded-full border px-4 py-2 text-sm font-semibold transition ${
              type === value ? 'border-brand-700/40 bg-brand-50 text-brand-900' : 'border-brand-900/15 bg-white text-ink hover:bg-brand-50/60'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <form className="mt-5 max-w-2xl space-y-4" onSubmit={submit}>
        <div>
          <label htmlFor="research-suggestion-a" className="text-sm font-bold text-ink">
            {type === 'missing_study' ? 'PMID or DOI' : type === 'comparison' ? 'First ingredient or compound' : 'Ingredient or compound name'}
          </label>
          <input
            id="research-suggestion-a"
            value={first}
            onChange={(event) => setFirst(event.target.value)}
            maxLength={type === 'missing_study' ? 100 : 60}
            placeholder={type === 'missing_study' ? 'e.g. 39123456 or 10.1000/example' : 'e.g. Ashwagandha'}
            className="mt-2 w-full rounded-xl border border-brand-900/15 bg-white px-4 py-3 text-sm text-ink"
          />
        </div>

        {type === 'comparison' ? (
          <div>
            <label htmlFor="research-suggestion-b" className="text-sm font-bold text-ink">Second ingredient or compound</label>
            <input
              id="research-suggestion-b"
              value={second}
              onChange={(event) => setSecond(event.target.value)}
              maxLength={60}
              placeholder="e.g. Magnesium"
              className="mt-2 w-full rounded-xl border border-brand-900/15 bg-white px-4 py-3 text-sm text-ink"
            />
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" className="min-h-11 rounded-full bg-brand-800 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-900">
            Add to demand signal
          </button>
          <a
            href="mailto:randolphwillie77@gmail.com?subject=Hippie%20Scientist%20research%20suggestion"
            className="text-sm font-semibold text-brand-800 underline-offset-4 hover:underline"
          >
            Email instead
          </a>
        </div>
        {status ? <p role="status" className="text-sm leading-6 text-muted">{status}</p> : null}
      </form>

      <div className="mt-6 border-t border-brand-900/10 pt-5">
        <h3 className="text-base font-bold text-ink">Found an error or missing context?</h3>
        <p className="mt-2 text-sm leading-6 text-muted">
          Use the correction workflow for a specific claim, citation, dose, safety statement, or study interpretation so the evidence can be reviewed and, when material, added to the public correction history.
        </p>
        <Link href="/info/corrections/" className="mt-3 inline-flex text-sm font-semibold text-brand-800 underline-offset-4 hover:underline">
          Submit a correction or missing study →
        </Link>
      </div>
    </section>
  )
}
