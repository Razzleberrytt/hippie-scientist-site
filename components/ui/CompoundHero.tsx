import EvidenceBadge from './EvidenceBadge'
import SafetyBadge from './SafetyBadge'

export default function CompoundHero({
  compound,
  evidenceLevel,
  safetyLevel
}: any) {
  return (
    <div className="hero-shell overflow-hidden rounded-[2rem] border border-brand-900/10 p-7 shadow-[0_18px_55px_rgba(16,32,24,0.08)] sm:p-9">
      <div className="section-spacing">

        <div className="flex flex-wrap items-center gap-3">
          <div className="eyebrow-label">
            Compound Profile
          </div>

          <div className="flex flex-wrap gap-2">
            <EvidenceBadge level={evidenceLevel} />
            <SafetyBadge level={safetyLevel} />
          </div>
        </div>

        <div className="space-y-6">
          <h1 className="heading-premium max-w-4xl text-balance">
            {compound.name}
          </h1>

          <p className="text-reading max-w-3xl text-lg leading-relaxed text-muted-soft sm:text-[1.08rem]">
            {compound.summary || 'Evidence-informed compound profile.'}
          </p>
        </div>

      </div>
    </div>
  )
}
