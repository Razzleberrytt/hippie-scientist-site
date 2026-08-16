export default function EvidenceMeter({ level = 'moderate' }: { level?: string }) {
  const normalized = String(level).trim().toLowerCase()

  const widths: Record<string, string> = {
    'strong evidence': 'w-full',
    'strong': 'w-full',
    'moderate evidence': 'w-[75%]',
    'moderate': 'w-[75%]',
    'limited evidence': 'w-[50%]',
    'limited': 'w-[50%]',
    'mixed evidence': 'w-[50%]',
    'mixed': 'w-[50%]',
    'preliminary evidence': 'w-[33%]',
    'preliminary': 'w-[33%]',
    'traditional use': 'w-[25%]',
    'traditional': 'w-[25%]',
    'insufficient evidence': 'w-[10%]',
    'insufficient': 'w-[10%]',
    'needs review': 'w-[10%]',
    'review': 'w-[10%]',
  }

  const tones: Record<string, string> = {
    'strong evidence': 'bg-[var(--color-evidence-strong)]',
    'strong': 'bg-[var(--color-evidence-strong)]',
    'moderate evidence': 'bg-[var(--color-evidence-moderate)]/80',
    'moderate': 'bg-[var(--color-evidence-moderate)]/80',
    'limited evidence': 'bg-[var(--color-evidence-limited)]',
    'limited': 'bg-[var(--color-evidence-limited)]',
    'mixed evidence': 'bg-[var(--color-evidence-limited)]',
    'mixed': 'bg-[var(--color-evidence-limited)]',
    'preliminary evidence': 'bg-[var(--color-evidence-limited)]/70',
    'preliminary': 'bg-[var(--color-evidence-limited)]/70',
    'traditional use': 'bg-[var(--color-evidence-theoretical)]',
    'traditional': 'bg-[var(--color-evidence-theoretical)]',
    'insufficient evidence': 'bg-[var(--color-evidence-theoretical)]/60',
    'insufficient': 'bg-[var(--color-evidence-theoretical)]/60',
    'needs review': 'bg-[var(--color-evidence-theoretical)]/60',
    'review': 'bg-[var(--color-evidence-theoretical)]/60',
  }

  const displayLevel = normalized.includes('evidence') || normalized.includes('use') || normalized.includes('review')
    ? level
    : (level.charAt(0).toUpperCase() + level.slice(1))

  return (
    <section className="space-y-3 border-y border-[color:var(--hs-hairline-strong)] py-4">
      <div className="flex flex-col items-start gap-3 text-xs sm:flex-row sm:justify-between sm:gap-4">
        <div className="space-y-1.5">
          <div className="eyebrow-label">Evidence Strength</div>
          <p className="max-w-md text-xs leading-relaxed text-[color:var(--hs-body)]">
            Confidence estimate based on the design quality and consistency of published clinical trials.
          </p>
        </div>
        <span className="shrink-0 whitespace-nowrap rounded-full border border-[color:var(--hs-hairline)] bg-[color:var(--hs-surface-2)] px-2.5 py-1 text-[11px] font-semibold text-[color:var(--tone-ink)]">
          {displayLevel}
        </span>
      </div>

      <div
        className="h-2 overflow-hidden rounded-full bg-neutral-100 dark:bg-white/10"
        role="meter"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={normalized.includes('strong') ? 100 : normalized.includes('moderate') ? 75 : normalized.includes('limited') || normalized.includes('mixed') ? 50 : normalized.includes('preliminary') ? 33 : normalized.includes('traditional') ? 25 : 10}
        aria-label={`Evidence strength: ${displayLevel}`}
      >
        <div
          className={`h-full rounded-full transition-all duration-700 ${tones[normalized] || tones.moderate} ${widths[normalized] || widths.moderate}`}
        />
      </div>
    </section>
  )
}
