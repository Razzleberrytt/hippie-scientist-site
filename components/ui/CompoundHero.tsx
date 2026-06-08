import EvidenceBadge from './EvidenceBadge'
import SafetyBadge from './SafetyBadge'

export default function CompoundHero({
  compound,
  evidenceLevel,
  safetyLevel
}: { compound?: { name?: string; summary?: string }; evidenceLevel?: string; safetyLevel?: string }) {
  return (
    <div className="space-y-2">
      <div className="space-y-2">
        <div className="eyebrow-label">
          Compound brief
        </div>

        <div className="flex flex-wrap gap-2 text-xs font-bold uppercase tracking-[0.12em] text-muted">
          <EvidenceBadge level={evidenceLevel} />
          <SafetyBadge level={safetyLevel} />
        </div>
      </div>

      <div className="space-y-3">
        <h1 className="font-display text-2xl font-semibold leading-tight tracking-tight text-ink sm:text-3xl">
          {compound.name}
        </h1>

        <p className="max-w-2xl text-sm leading-6 text-[#46574d]">
          {compound.summary || 'Evidence-informed compound profile.'}
        </p>
      </div>
    </div>
  )
}
