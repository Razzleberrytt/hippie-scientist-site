import * as React from 'react'

export interface EvidenceGradeRationaleProps {
  grade: 'A' | 'B' | 'C' | 'D' | 'F' | string
  designMatch: string
  riskOfBias: 'Low' | 'Medium' | 'High' | string
  consistency: 'Consistent' | 'Mixed' | 'Inconsistent' | string
  children: React.ReactNode
}

export default function EvidenceGradeRationale({
  grade,
  designMatch,
  riskOfBias,
  consistency,
  children,
}: EvidenceGradeRationaleProps) {
  // Map grades to colors and labels
  const gradeConfig: Record<string, { bg: string; text: string; border: string; label: string }> = {
    A: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-800',
      border: 'border-emerald-200',
      label: 'Grade A: Strong Evidence',
    },
    B: {
      bg: 'bg-blue-50',
      text: 'text-blue-800',
      border: 'border-blue-200',
      label: 'Grade B: Moderate Evidence',
    },
    C: {
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-200',
      label: 'Grade C: Limited Evidence',
    },
    D: {
      bg: 'bg-slate-50',
      text: 'text-slate-700',
      border: 'border-slate-200',
      label: 'Grade D: Theoretical Evidence',
    },
    F: {
      bg: 'bg-rose-50',
      text: 'text-rose-800',
      border: 'border-rose-200',
      label: 'Grade F: Insufficient or Contraindicated',
    },
  }

  // Fallback config if custom grade passed
  const config = gradeConfig[grade] || {
    bg: 'bg-slate-50',
    text: 'text-slate-700',
    border: 'border-slate-200',
    label: `Grade ${grade}`,
  }

  // Risk of bias styling
  const biasColors: Record<string, string> = {
    Low: 'text-emerald-700 font-semibold',
    Medium: 'text-amber-700 font-semibold',
    High: 'text-rose-700 font-semibold',
  }
  const biasColor = biasColors[riskOfBias] || 'text-[#46574d]'

  // Consistency styling
  const consistencyColors: Record<string, string> = {
    Consistent: 'text-emerald-700 font-semibold',
    Mixed: 'text-amber-700 font-semibold',
    Inconsistent: 'text-rose-700 font-semibold',
  }
  const consistencyColor = consistencyColors[consistency] || 'text-[#46574d]'
  const headingId = `evidence-grade-${String(grade).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`

  return (
    <section 
      className={`my-6 rounded-[1.25rem] border p-6 shadow-sm bg-white/95 border-brand-900/10`}
      aria-labelledby={headingId}
    >
      <div className="grid gap-6 md:grid-cols-[120px_1fr] items-start">
        {/* Large Grade Circle Bubble */}
        <div className="flex flex-col items-center justify-center text-center">
          <div 
            className={`w-20 h-20 rounded-full flex items-center justify-center border-2 text-3xl font-bold font-display shadow-inner ${config.bg} ${config.text} ${config.border}`}
            aria-hidden="true"
          >
            {grade}
          </div>
          <span className="text-[0.65rem] font-bold uppercase tracking-wider text-muted mt-2 block">
            Evidence Grade
          </span>
        </div>

        {/* Details and Description */}
        <div className="space-y-4">
          <div>
            <h3 id={headingId} className="text-lg font-semibold text-ink font-display">
              {config.label}
            </h3>
            <p className="text-xs text-muted mt-0.5">
              Evaluation of methodological rigor, population reach, and evidence alignment.
            </p>
          </div>

          {/* Metadata Grid */}
          <dl className="grid gap-3 sm:grid-cols-3 bg-brand-50/10 border border-brand-900/5 rounded-xl p-3.5 text-xs">
            <div>
              <dt className="text-muted block font-medium mb-0.5">Design Match</dt>
              <dd className="text-ink font-semibold">{designMatch}</dd>
            </div>
            <div>
              <dt className="text-muted block font-medium mb-0.5">Risk of Bias</dt>
              <dd className={biasColor}>{riskOfBias}</dd>
            </div>
            <div>
              <dt className="text-muted block font-medium mb-0.5">Consistency</dt>
              <dd className={consistencyColor}>{consistency}</dd>
            </div>
          </dl>

          {/* Rationale explanation text */}
          <div className="text-sm leading-6 text-[#46574d] bg-white rounded-lg p-1.5">
            {children}
          </div>
        </div>
      </div>
    </section>
  )
}
