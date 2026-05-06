type Phase = {
  title: string
  text: string
}

export default function TimelineCard({ phases = [] }: { phases?: Phase[] }) {
  const meaningfulPhases = phases.filter(
    phase => phase?.title?.trim() && phase?.text?.trim()
  )

  if (meaningfulPhases.length === 0) {
    return null
  }

  return (
    <div className="space-y-5">
      {meaningfulPhases.map((phase, index) => (
        <div key={index} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="mt-2 h-3 w-3 rounded-full bg-brand-700" />

            {index !== meaningfulPhases.length - 1 && (
              <div className="mt-2 w-px flex-1 bg-brand-900/15" />
            )}
          </div>

          <div className="pb-6">
            <div className="text-sm font-semibold tracking-tight text-ink">
              {phase.title}
            </div>

            <div className="mt-1 text-sm leading-7 text-[#46574d]">
              {phase.text}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
