import {
  buildDecisionVisualProfile,
  type DecisionVisualProfile,
  type StimulationProfile,
  type TimelineProfile,
} from '@/lib/decision-visuals'
import { formatDisplayLabel } from '@/lib/display-utils'

type DecisionVisualGridProps = {
  record: any
  title?: string
  compact?: boolean
}

const stimulationOrder: StimulationProfile[] = ['calming', 'balanced', 'activating']
const timelineOrder: TimelineProfile[] = ['acute', 'mixed', 'cumulative']

function position<T extends string>(order: T[], value: T) {
  const index = Math.max(0, order.indexOf(value))
  return `${(index / Math.max(1, order.length - 1)) * 100}%`
}

function toneClass(value: string) {
  if (value.includes('calming') || value.includes('beginner') || value.includes('recovery') || value.includes('sleep')) {
    return 'border-emerald-700/15 bg-emerald-50/70 text-emerald-950'
  }

  if (value.includes('activating') || value.includes('aggressive') || value.includes('advanced')) {
    return 'border-amber-700/20 bg-amber-50/80 text-amber-950'
  }

  return 'border-brand-900/10 bg-white/75 text-[#33443a]'
}

function SpectrumBar({
  label,
  value,
  order,
}: {
  label: string
  value: StimulationProfile | TimelineProfile
  order: StimulationProfile[] | TimelineProfile[]
}) {
  return (
    <div className="rounded-2xl border border-brand-900/10 bg-white/75 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-brand-900/55">{label}</p>
        <p className="text-xs font-semibold text-[#33443a]">{formatDisplayLabel(value)}</p>
      </div>

      <div className="relative mt-4 h-2 rounded-full bg-brand-900/10">
        <span
          className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-brand-700 shadow-sm"
          style={{ left: position(order as any, value as any) }}
        />
      </div>

      <div className="mt-3 flex justify-between text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-brand-900/45">
        {order.map((item) => (
          <span key={item}>{item.split('-')[0]}</span>
        ))}
      </div>
    </div>
  )
}

function SignalCard({ label, value }: { label: string; value: string }) {
  return (
    <div className={`rounded-2xl border p-4 ${toneClass(value)}`}>
      <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] opacity-65">{label}</p>
      <p className="mt-2 text-sm font-semibold leading-6">{formatDisplayLabel(value)}</p>
    </div>
  )
}

export default function DecisionVisualGrid({ record, title = 'Visual decision intelligence', compact = false }: DecisionVisualGridProps) {
  const profile: DecisionVisualProfile = buildDecisionVisualProfile(record)

  return (
    <section className={`card-premium space-y-5 ${compact ? 'p-5 sm:p-6' : 'p-5 sm:p-7 lg:p-8'}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="eyebrow-label">Decision Visuals</p>
          <h2 className="max-w-2xl text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            {title}
          </h2>
        </div>
        <p className="max-w-md text-sm leading-7 text-[#46574d]">
          Compact semantic signals for comparing fit, timeline, and experimentation complexity without implying medical precision.
        </p>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <SpectrumBar label="Stimulation" value={profile.stimulation} order={stimulationOrder} />
        <SpectrumBar label="Timeline" value={profile.timeline} order={timelineOrder} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SignalCard label="Beginner Difficulty" value={profile.difficulty} />
        <SignalCard label="Stack Complexity" value={profile.stackComplexity} />
        <SignalCard label="Responder Variability" value={profile.responderVariability} />
        <SignalCard label="Orientation" value={profile.recoveryOrientation} />
      </div>

      <div className="flex flex-wrap gap-2">
        {profile.tags.map((tag) => (
          <span key={tag} className="rounded-full border border-brand-900/10 bg-paper-50/80 px-3 py-1.5 text-xs font-semibold text-[#46574d]">
            {formatDisplayLabel(tag)}
          </span>
        ))}
      </div>
    </section>
  )
}
