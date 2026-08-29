import { getSafetyClassifications, type SafetyClassification } from '@/lib/safety-classification'

export type SafetyCautionTier = 'low' | 'moderate' | 'high'

type SafetyCautionLevelProps = {
  /** Qualitative caution tier derived by the profile safety policy. */
  level: SafetyCautionTier
  /** Named safety factors detected in the source record. */
  factors?: SafetyClassification[]
  className?: string
}

const TIERS: Array<{ id: SafetyCautionTier; label: string; summary: string }> = [
  {
    id: 'low',
    label: 'Standard',
    summary: 'No specific caution categories were detected in the source record.',
  },
  {
    id: 'moderate',
    label: 'Elevated',
    summary: 'One caution category applies — read it before use.',
  },
  {
    id: 'high',
    label: 'High',
    summary: 'Multiple caution categories apply, or the record uses avoid/contraindication language.',
  },
]

/**
 * Compact caution band for profile safety sections.
 *
 * Deliberately non-numeric: the underlying policy resolves three qualitative
 * tiers from named caution categories, so rendering a percentage would assert
 * precision the data does not carry. The band shows which tier applies, why,
 * and which named factors produced it.
 */
export default function SafetyCautionLevel({ level, factors = [], className = '' }: SafetyCautionLevelProps) {
  const activeIndex = TIERS.findIndex((tier) => tier.id === level)
  const active = TIERS[activeIndex] ?? TIERS[0]

  return (
    <div
      data-safety-context="true"
      data-safety-level={level}
      className={`hs-caution ${className}`.trim()}
    >
      <p className="hs-caution__label">
        <span className="hs-caution__tier">{active.label} caution</span>
      </p>

      <ol className="hs-caution__band" aria-hidden="true">
        {TIERS.map((tier, index) => (
          <li
            key={tier.id}
            className="hs-caution__step"
            data-state={index === activeIndex ? 'active' : index < activeIndex ? 'below' : 'above'}
            data-tier={tier.id}
          >
            <span>{tier.label}</span>
          </li>
        ))}
      </ol>

      <p className="hs-caution__summary">
        <span className="sr-only">Caution level: {active.label}. </span>
        {active.summary}
      </p>

      {factors.length > 0 ? (
        <ul className="hs-caution__factors">
          {factors.map((factor) => (
            <li key={factor.label}>
              <span className="hs-caution__factor-name">{factor.label}</span>
              <span className="hs-caution__factor-note">{factor.description}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

/** Convenience wrapper for callers that only hold the raw record. */
export function safetyFactorsForRecord(record: Record<string, unknown>): SafetyClassification[] {
  return getSafetyClassifications(record, 4)
}
