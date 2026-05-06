export default function TimelineCard() {
  const phases = [
    {
      title: 'Acute Effects',
      text: 'Short-term effects may occur within hours depending on dosage and individual response.'
    },
    {
      title: 'Adaptation',
      text: 'Consistent use over days or weeks may influence long-term pathways and perceived benefits.'
    },
    {
      title: 'Long-Term',
      text: 'Long-term outcomes depend on dosage, consistency, genetics, lifestyle, and stack interactions.'
    }
  ]

  return (
    <div className="space-y-4">
      {phases.map((p, i) => (
        <div key={i} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="w-3 h-3 rounded-full bg-black mt-2" />
            {i !== phases.length - 1 && (
              <div className="w-px flex-1 bg-neutral-300 mt-2" />
            )}
          </div>

          <div className="pb-6">
            <div className="font-semibold text-sm">{p.title}</div>
            <div className="text-sm leading-6 text-neutral-600 mt-1">
              {p.text}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
