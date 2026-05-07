import { formatDisplayLabel } from '@/lib/display-utils'

export default function CompoundStats({ compound }: any) {
  const stats = [
    {
      label: 'Evidence',
      value: formatDisplayLabel(compound.evidence_tier || compound.evidenceLevel || 'Moderate'),
    },
    {
      label: 'Effects',
      value: Array.isArray(compound.effects) && compound.effects.length > 0
        ? compound.effects.length
        : null,
    },
    {
      label: 'Sources',
      value: Array.isArray(compound.sources) && compound.sources.length > 0
        ? compound.sources.length
        : null,
    },
  ].filter(item => item.value !== null && item.value !== undefined && item.value !== '')

  if (stats.length === 0) return null

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="surface-subtle rounded-2xl p-5"
        >
          <div className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-[#66756d]">
            {stat.label}
          </div>

          <div className="mt-2 text-xl font-semibold tracking-tight text-ink">
            {stat.value}
          </div>
        </div>
      ))}
    </div>
  )
}
