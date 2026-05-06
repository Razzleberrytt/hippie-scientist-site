export default function MechanismGrid({ mechanisms = [] }: any) {
  if (!mechanisms?.length) return null

  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {mechanisms.slice(0, 6).map((m: any, i: number) => (
        <div
          key={i}
          className="rounded-2xl border bg-white/60 backdrop-blur p-4"
        >
          <div className="text-xs uppercase tracking-wide text-neutral-400 mb-2">
            Mechanism
          </div>

          <div className="text-sm leading-6 text-neutral-700">
            {typeof m === 'string' ? m : JSON.stringify(m)}
          </div>
        </div>
      ))}
    </div>
  )
}
