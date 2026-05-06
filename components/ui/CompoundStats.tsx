export default function CompoundStats({ compound }: any) {
  const stats = [
    {
      label: 'Evidence',
      value: compound.evidence_tier || 'Moderate'
    },
    {
      label: 'Effects',
      value: Array.isArray(compound.effects)
        ? compound.effects.length
        : 0
    },
    {
      label: 'Sources',
      value: Array.isArray(compound.sources)
        ? compound.sources.length
        : 0
    }
  ]

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map((s) => (
        <div
          key={s.label}
          className="border rounded-2xl p-4 bg-white/70 backdrop-blur"
        >
          <div className="text-xs text-neutral-500">{s.label}</div>
          <div className="text-lg font-semibold mt-1">{s.value}</div>
        </div>
      ))}
    </div>
  )
}
