import EvidenceBadge from './EvidenceBadge'
import SafetyBadge from './SafetyBadge'

export default function CompoundHero({
  compound,
  evidenceLevel,
  safetyLevel
}: any) {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="eyebrow-label">
          Compound Profile
        </div>

        <div className="flex flex-wrap gap-2">
          <EvidenceBadge level={evidenceLevel} />
          <SafetyBadge level={safetyLevel} />
        </div>
      </div>

      <div className="space-y-4">
        <h1 className="heading-premium max-w-4xl text-balance">
          {compound.name}
        </h1>

        <p className="text-reading max-w-3xl text-base leading-7 text-[#46574d] sm:text-lg">
          {compound.summary || 'Evidence-informed compound profile.'}
        </p>
      </div>
    </div>
  )
}
