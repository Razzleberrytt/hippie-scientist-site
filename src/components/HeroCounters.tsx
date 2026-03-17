type Counter = { label: string; value: number }

const numberFormatter = new Intl.NumberFormat()

export default function HeroCounters({ items }: { items: Counter[] }) {
  return (
    <div className='mt-3.5 flex flex-wrap items-center gap-2.5'>
      {items.map((counter, index) => (
        <div
          key={index}
          className='bg-white/6 flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-white/90 shadow-[0_10px_40px_-10px_rgba(0,0,0,.6)] ring-1 ring-white/15 backdrop-blur-xl'
        >
          <span className='bg-white/6 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold tabular-nums text-white/90 ring-1 ring-white/15'>
            {numberFormatter.format(counter.value)}
          </span>
          <span className='text-xs text-white/90 sm:text-sm'>{counter.label}</span>
        </div>
      ))}
    </div>
  )
}
