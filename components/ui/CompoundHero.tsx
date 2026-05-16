import EvidenceBadge from './EvidenceBadge'
import SafetyBadge from './SafetyBadge'

export default function CompoundHero({
  compound,
  evidenceLevel,
  safetyLevel
}: any) {
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="eyebrow-label">
          Compound Profile
        </div>

        <div className="flex flex-wrap gap-3 text-xs font-bold uppercase tracking-[0.12em] text-muted">
          <EvidenceBadge level={evidenceLevel} />
          <SafetyBadge level={safetyLevel} />
        </div>
      </div>

      <div className="space-y-3">
        <h1 className="heading-premium max-w-4xl text-balance">
          {compound.name}
        </h1>

        <p className="max-w-2xl text-sm leading-6 text-[#46574d] sm:text-base">
          {compound.summary || 'Evidence-informed compound profile.'}
        </p>
      </div>
    </div>
  )
}
