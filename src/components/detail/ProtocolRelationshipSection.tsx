import Link from 'next/link'

import { buildProtocolOrchestration } from '../../lib/protocol-orchestration'

function formatLabel(value: string) {
  return value
    .split('-')
    .map(
      (part) => part.charAt(0).toUpperCase() + part.slice(1),
    )
    .join(' ')
}

type ProtocolRelationshipSectionProps = {
  source: any
  candidates: any[]
}

export function ProtocolRelationshipSection({
  source,
  candidates,
}: ProtocolRelationshipSectionProps) {
  const protocols = buildProtocolOrchestration(
    source,
    candidates,
  )
    .filter(
      (item) =>
        item.orchestrationTier !== 'suppressed' &&
        item.protocolWeight >= 55,
    )
    .slice(0, 6)

  if (protocols.length === 0) {
    return null
  }

  return (
    <section className="space-y-6 rounded-3xl border border-teal-100 bg-gradient-to-br from-teal-50/70 to-white p-6 shadow-sm">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-700">
          Protocol Relationships
        </p>

        <h2 className="text-2xl font-semibold tracking-tight text-ink">
          Explore connected educational protocol systems
        </h2>

        <p className="max-w-3xl text-sm leading-7 text-muted">
          Discover continuity-aware protocol relationships,
          adaptive educational combinations, and semantic synergy
          exploration systems.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {protocols.map((protocol) => (
          <Link
            key={protocol.slug}
            href={`/explore/${protocol.slug}`}
            className="group rounded-2xl border border-teal-100 bg-white/80 p-5 transition hover:-translate-y-1 hover:border-teal-300 hover:shadow-md"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-700">
                  {protocol.orchestrationTier.replace('-', ' ')}
                </span>

                <span className="rounded-full bg-teal-100 px-3 py-1 text-[11px] font-medium text-teal-800">
                  protocol {protocol.protocolWeight}
                </span>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-ink transition group-hover:text-teal-900">
                  {formatLabel(protocol.slug)}
                </h3>

                <p className="mt-2 text-sm leading-6 text-muted">
                  Explore educational combinations, adaptive
                  protocol relationships, and continuity-aware
                  semantic synergy systems.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 border-t border-teal-100 pt-4">
                <span className="rounded-full bg-neutral-100 px-3 py-1 text-[11px] text-neutral-700">
                  stack {protocol.stackCompatibility}
                </span>

                <span className="rounded-full bg-neutral-100 px-3 py-1 text-[11px] text-neutral-700">
                  recovery {protocol.recoveryCompatibility}
                </span>

                <span className="rounded-full bg-neutral-100 px-3 py-1 text-[11px] text-neutral-700">
                  balance {protocol.stimulationBalance}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
