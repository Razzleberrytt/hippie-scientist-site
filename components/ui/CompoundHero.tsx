import EvidenceBadge from './EvidenceBadge'
import SafetyBadge from './SafetyBadge'

export default function CompoundHero({
  compound,
  evidenceLevel,
  safetyLevel
}: any) {
  return (
    <div className="rounded-3xl border border-brand-900/10 bg-gradient-to-br from-white via-neutral-50 to-paper-100 p-6 shadow-card sm:p-8">
      <div className="space-y-5">
        <div className="eyebrow text-brand-700">
          Compound profile
        </div>

        <div className="flex flex-wrap gap-2">
          <EvidenceBadge level={evidenceLevel} />
          <SafetyBadge level={safetyLevel} />
        </div>

        <div>
          <h1 className="heading-premium max-w-4xl">
            {compound.name}
          </h1>

          <p className="text-reading mt-5 max-w-3xl text-muted-soft">
            {compound.summary || 'Evidence-informed compound profile.'}
          </p>
        </div>

      </div>
    </div>
  )
}
