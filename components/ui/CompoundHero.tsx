import EvidenceBadge from './EvidenceBadge'
import SafetyBadge from './SafetyBadge'

export default function CompoundHero({
  compound,
  evidenceLevel,
  safetyLevel
}: any) {
  return (
    <div className="rounded-3xl border bg-gradient-to-br from-white via-neutral-50 to-neutral-100 p-8 shadow-sm">
      <div className="space-y-4">

        <div className="flex flex-wrap gap-2">
          <EvidenceBadge level={evidenceLevel} />
          <SafetyBadge level={safetyLevel} />
        </div>

        <div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
            {compound.name}
          </h1>

          <p className="mt-4 text-sm md:text-base leading-7 text-neutral-600 max-w-3xl">
            {compound.summary || 'Evidence-informed compound profile.'}
          </p>
        </div>

      </div>
    </div>
  )
}
