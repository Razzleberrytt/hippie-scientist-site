import Link from 'next/link'

export type ProtocolPhase = {
  name: string
  description: string
  herbs?: string[]
  compounds?: string[]
}

export type ProtocolOverviewCardProps = {
  protocolName: string
  goal: string
  duration: string
  phases: ProtocolPhase[]
  disclaimer?: string
  href?: string
  className?: string
}

export function ProtocolOverviewCard({
  protocolName,
  goal,
  duration,
  phases,
  disclaimer = 'Protocols are educational frameworks. Work with a clinician before starting any supplement regimen.',
  href,
  className = '',
}: ProtocolOverviewCardProps) {
  return (
    <article className={`rounded-[1.25rem] border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-50/50 p-6 ${className}`}>
      {/* Header */}
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Protocol Overview</p>
        <h3 className="mt-2 text-2xl font-semibold text-ink">{protocolName}</h3>
        <p className="mt-2 text-sm text-muted">{goal}</p>
      </div>

      {/* Duration */}
      <div className="mt-4 inline-block rounded-full bg-white/70 border border-blue-200 px-4 py-2">
        <p className="text-xs font-semibold text-blue-700">Duration: {duration}</p>
      </div>

      {/* Phases */}
      <div className="mt-6 space-y-4">
        {phases.map((phase, idx) => (
          <div key={`phase-${idx}`} className="rounded-lg bg-white/60 border border-blue-100 p-4">
            <h4 className="font-semibold text-ink">
              Phase {idx + 1}: {phase.name}
            </h4>
            <p className="mt-2 text-sm leading-6 text-muted">{phase.description}</p>

            {(phase.herbs || phase.compounds) && (
              <div className="mt-3 flex flex-wrap gap-2">
                {phase.herbs?.map((herb) => (
                  <span key={`herb-${herb}`} className="rounded-full bg-amber-100/50 px-3 py-1 text-xs text-amber-800">
                    {herb}
                  </span>
                ))}
                {phase.compounds?.map((compound) => (
                  <span
                    key={`compound-${compound}`}
                    className="rounded-full bg-purple-100/50 px-3 py-1 text-xs text-purple-800"
                  >
                    {compound}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      {disclaimer && (
        <div className="mt-5 rounded-lg bg-blue-100/40 border border-blue-200 p-4">
          <p className="text-xs leading-5 text-blue-900">{disclaimer}</p>
        </div>
      )}

      {/* CTA */}
      {href && (
        <div className="mt-5">
          <Link href={href} className="text-sm font-medium text-blue-700 hover:underline">
            See full protocol →
          </Link>
        </div>
      )}
    </article>
  )
}
