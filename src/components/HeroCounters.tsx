type Counter = { label: string; value: number }

const numberFormatter = new Intl.NumberFormat()

export default function HeroCounters({ items }: { items: Counter[] }) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-4">
      {items.map((counter, index) => (
        <div
          key={index}
          className="glass-soft flex items-center gap-2 rounded-full px-3 py-1"
        >
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/16 text-sm font-semibold tabular-nums">
            {numberFormatter.format(counter.value)}
          </span>
          <span className="text-sm text-white/80">{counter.label}</span>
        </div>
      ))}
    </div>
  )
}
