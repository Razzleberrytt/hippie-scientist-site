'use client'

import { useState } from 'react'
import type { CompareItem } from '@/lib/compare'

type Goal = 'stress' | 'sleep' | 'focus' | 'athletic' | 'mood' | 'immune'
type Timing = 'morning' | 'evening' | 'flexible'
type StimSensitivity = 'yes' | 'no' | 'unsure'

interface CompareDecisionWidgetProps {
  item1: CompareItem
  item2: CompareItem
  isHarmReduction: boolean
}

interface Selections {
  goal: Goal | null
  timing: Timing | null
  stimSensitive: StimSensitivity | null
}

type ResolvedSelections = {
  goal: Goal
  timing: Timing
  stimSensitive: StimSensitivity
}

// ─── Scoring helpers ──────────────────────────────────────────────────────────

function matchesAny(haystack: string[], needles: string[]): boolean {
  const lower = haystack.map((s) => s.toLowerCase())
  return needles.some((n) => lower.some((h) => h.includes(n)))
}

function itemText(item: CompareItem): string[] {
  return [
    ...item.primaryBenefits,
    ...item.mechanisms,
    ...item.canonicalMechanisms,
    ...item.mechanismCategories,
    item.description,
    item.category ?? '',
  ]
}

function scoreForGoal(item: CompareItem, goal: Goal): number {
  const text = itemText(item)
  switch (goal) {
    case 'stress':
      return matchesAny(text, ['stress', 'adaptogen', 'cortisol', 'hpa', 'anxiety']) ? 2 : 0
    case 'sleep':
      return matchesAny(text, ['sleep', 'gaba', 'insomnia', 'sedative', 'relaxation']) ? 2 : 0
    case 'focus':
      return matchesAny(text, ['focus', 'cognitive', 'cognition', 'attention', 'memory', 'concentration', 'nootropic']) ? 2 : 0
    case 'athletic':
      return matchesAny(text, ['energy', 'performance', 'endurance', 'fatigue', 'stamina', 'athletic', 'exercise']) ? 2 : 0
    case 'mood':
      return matchesAny(text, ['mood', 'dopamine', 'serotonin', 'depression', 'well-being', 'wellbeing']) ? 2 : 0
    case 'immune':
      return matchesAny(text, ['immune', 'immunity', 'immunomodulat', 'inflammation', 'anti-inflammatory', 'nk cell']) ? 2 : 0
    default:
      return 0
  }
}

function isStimulating(item: CompareItem): boolean {
  const text = itemText(item)
  return matchesAny(text, ['stimulant', 'stimulating', 'energizing', 'norepinephrine', 'dopamine release', 'caffeine', 'ephedrine', 'amphetamine'])
}

function scoreForTiming(item: CompareItem, timing: Timing): number {
  const text = itemText(item)
  if (timing === 'morning') {
    return matchesAny(text, ['morning', 'daytime', 'energy', 'focus', 'performance', 'wake']) ? 1 : 0
  }
  if (timing === 'evening') {
    return matchesAny(text, ['evening', 'night', 'sleep', 'relaxation', 'gaba', 'sedative', 'wind down']) ? 1 : 0
  }
  return 0 // flexible — no preference
}

function chooseRecommendation(
  item1: CompareItem,
  item2: CompareItem,
  selections: ResolvedSelections
): { recommended: CompareItem; other: CompareItem; isTie: boolean } {
  let score1 = scoreForGoal(item1, selections.goal)
  let score2 = scoreForGoal(item2, selections.goal)

  score1 += scoreForTiming(item1, selections.timing)
  score2 += scoreForTiming(item2, selections.timing)

  // Stimulant sensitivity: penalise stimulating items
  if (selections.stimSensitive === 'yes') {
    if (isStimulating(item1)) score1 -= 3
    if (isStimulating(item2)) score2 -= 3
  }

  const isTie = score1 === score2

  if (score2 > score1) {
    return { recommended: item2, other: item1, isTie }
  }
  return { recommended: item1, other: item2, isTie }
}

// ─── Reason builder ───────────────────────────────────────────────────────────

const GOAL_LABELS: Record<Goal, string> = {
  stress: 'Stress Relief',
  sleep: 'Better Sleep',
  focus: 'Energy / Focus',
  athletic: 'Athletic Performance',
  mood: 'Mood Support',
  immune: 'Immune Health',
}

function buildReason(
  recommended: CompareItem,
  other: CompareItem,
  selections: ResolvedSelections,
  isTie: boolean
): string {
  const goalLabel = GOAL_LABELS[selections.goal]

  if (isTie) {
    const both = [recommended.name, other.name].join(' and ')
    return `Both ${both} have overlapping evidence for ${goalLabel} — your timing preference and individual response will be the deciding factor. Either is a reasonable starting point.`
  }

  const benefits = recommended.primaryBenefits.slice(0, 2)
  const benefitPhrase = benefits.length > 0 ? benefits.join(' and ') : goalLabel

  let reason = `${recommended.name} is a stronger match for ${goalLabel} based on its documented support for ${benefitPhrase}.`

  if (selections.stimSensitive === 'yes' && isStimulating(other)) {
    reason += ` ${other.name} is more stimulating and may not suit stimulant-sensitive individuals.`
  } else if (selections.timing === 'evening' && isStimulating(other)) {
    reason += ` ${other.name} tends to be more energizing and is generally better suited to morning use.`
  }

  return reason
}

function buildStackSuggestion(
  item1: CompareItem,
  item2: CompareItem,
  selections: ResolvedSelections
): string {
  const stim1 = isStimulating(item1)
  const stim2 = isStimulating(item2)

  if (stim1 && !stim2) {
    return `Take ${item1.name} in the morning and ${item2.name} in the evening for a complementary rhythm.`
  }
  if (stim2 && !stim1) {
    return `Take ${item2.name} in the morning and ${item1.name} in the evening for a complementary rhythm.`
  }
  if (selections.timing === 'evening') {
    return `If stacking, take ${item1.name} in the morning and ${item2.name} in the evening, or consult a practitioner for guidance on combined dosing.`
  }
  return `If stacking, spread doses through the day and monitor how your body responds — start with one before adding the other.`
}

// ─── UI sub-components ────────────────────────────────────────────────────────

interface OptionButtonProps {
  label: string
  selected: boolean
  onClick: () => void
}

function OptionButton({ label, selected, onClick }: OptionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={[
        'rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors duration-150 text-left',
        selected
          ? 'border-brand-700 bg-brand-800 text-white shadow-sm'
          : 'border-brand-900/15 bg-white text-ink hover:border-brand-700/40 hover:bg-brand-50/80 shadow-sm',
      ].join(' ')}
    >
      <span className="flex items-center gap-2">
        <span aria-hidden="true" className={selected ? 'text-white/80' : 'opacity-0'}>✓</span>
        {label}
      </span>
    </button>
  )
}

interface QuestionBlockProps {
  step: number
  question: string
  children: React.ReactNode
}

function QuestionBlock({ step, question, children }: QuestionBlockProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-800 text-xs font-bold text-white">
          {step}
        </span>
        <p className="text-sm font-semibold text-ink">{question}</p>
      </div>
      <div className="flex flex-wrap gap-2 pl-8" role="group" aria-label={question}>
        {children}
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function CompareDecisionWidget({
  item1,
  item2,
  isHarmReduction,
}: CompareDecisionWidgetProps) {
  const [selections, setSelections] = useState<Selections>({
    goal: null,
    timing: null,
    stimSensitive: null,
  })

  const allAnswered =
    selections.goal !== null &&
    selections.timing !== null &&
    selections.stimSensitive !== null

  function reset() {
    setSelections({ goal: null, timing: null, stimSensitive: null })
  }

  const goals: { value: Goal; label: string }[] = [
    { value: 'stress',   label: 'Stress Relief' },
    { value: 'sleep',    label: 'Better Sleep' },
    { value: 'focus',    label: 'Energy / Focus' },
    { value: 'athletic', label: 'Athletic Performance' },
    { value: 'mood',     label: 'Mood Support' },
    { value: 'immune',   label: 'Immune Health' },
  ]

  const timings: { value: Timing; label: string }[] = [
    { value: 'morning',  label: 'Morning' },
    { value: 'evening',  label: 'Evening' },
    { value: 'flexible', label: 'Flexible' },
  ]

  const stimOptions: { value: StimSensitivity; label: string }[] = [
    { value: 'yes',    label: 'Yes' },
    { value: 'no',     label: 'No' },
    { value: 'unsure', label: 'Not sure' },
  ]

  return (
    <section className="card-premium p-6 space-y-7 max-w-2xl">
      {/* Header */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-brand-700">
          Interactive Guide
        </p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-ink">
          Which one is right for you?
        </h2>
        <p className="mt-1 text-sm text-muted">
          Answer 3 questions to get a personalised suggestion from {item1.name} or {item2.name}.
        </p>
      </div>

      {/* Harm reduction notice */}
      {isHarmReduction && (
        <div className="rounded-xl border border-amber-600/20 bg-amber-50/80 px-4 py-3 text-xs leading-relaxed text-amber-900">
          <strong>Harm reduction context:</strong> one or both items on this page carry elevated risk profiles. Consult a qualified healthcare professional before use.
        </div>
      )}

      {/* Question 1: Goal */}
      <QuestionBlock step={1} question="What is your primary goal?">
        {goals.map(({ value, label }) => (
          <OptionButton
            key={value}
            label={label}
            selected={selections.goal === value}
            onClick={() => setSelections((s) => ({ ...s, goal: value }))}
          />
        ))}
      </QuestionBlock>

      {/* Question 2: Timing */}
      <QuestionBlock step={2} question="When do you prefer to supplement?">
        {timings.map(({ value, label }) => (
          <OptionButton
            key={value}
            label={label}
            selected={selections.timing === value}
            onClick={() => setSelections((s) => ({ ...s, timing: value }))}
          />
        ))}
      </QuestionBlock>

      {/* Question 3: Stimulant sensitivity */}
      <QuestionBlock step={3} question="Are you sensitive to stimulants?">
        {stimOptions.map(({ value, label }) => (
          <OptionButton
            key={value}
            label={label}
            selected={selections.stimSensitive === value}
            onClick={() => setSelections((s) => ({ ...s, stimSensitive: value }))}
          />
        ))}
      </QuestionBlock>

      {/* Result */}
      {allAnswered && (() => {
        const { recommended, other, isTie } = chooseRecommendation(
          item1,
          item2,
          selections as ResolvedSelections
        )
        const reason = buildReason(
          recommended,
          other,
          selections as ResolvedSelections,
          isTie
        )
        const stackSuggestion = buildStackSuggestion(
          item1,
          item2,
          selections as ResolvedSelections
        )

        return (
          <div className="rounded-2xl border border-brand-200 bg-brand-50 px-5 py-5 space-y-4">
            {/* Recommendation headline */}
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-widest text-brand-700">
                {isTie ? 'Both are a good match' : 'Our suggestion'}
              </p>
              {!isTie && (
                <p className="text-2xl font-display font-semibold text-ink">
                  {recommended.name}
                </p>
              )}
            </div>

            {/* Reason */}
            <p className="text-sm leading-relaxed text-ink">
              {reason}
            </p>

            {/* Stack suggestion */}
            <div className="border-t border-brand-900/10 pt-4 space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-brand-700">
                Or take both:
              </p>
              <p className="text-xs leading-relaxed text-muted">
                {stackSuggestion}
              </p>
            </div>

            {/* Disclaimer */}
            <p className="text-xs text-muted">
              This suggestion is derived from available evidence data and your stated preferences. It is not medical advice. Consult a healthcare professional before starting any supplement regimen.
            </p>

            {/* Reset */}
            <button
              type="button"
              onClick={reset}
              className="button-secondary text-xs px-3 py-1.5"
            >
              ← Start over
            </button>
          </div>
        )
      })()}
    </section>
  )
}
