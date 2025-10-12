type Counter = { label: string; value: number }

const numberFormatter = new Intl.NumberFormat()

export default function HeroCounters({ items }: { items: Counter[] }) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-4">
      {items.map((counter, index) => (
        <div
          key={index}
          className="flex items-center gap-2 rounded-full bg-white/6 px-3 py-1 ring-1 ring-white/15 text-white/90 shadow-[0_10px_40px_-10px_rgba(0,0,0,.6)] backdrop-blur-xl"
        >
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/6 text-sm font-semibold text-white/90 ring-1 ring-white/15 tabular-nums">
            {numberFormatter.format(counter.value)}
          </span>
          <span className="text-sm text-white/90">{counter.label}</span>
        </div>
      ))}
    </div>
  )
}
