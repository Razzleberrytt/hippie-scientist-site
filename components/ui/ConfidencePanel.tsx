export default function ConfidencePanel({ level = 'moderate' }: any) {
  const config: any = {
    strong: {
      title: 'Higher Confidence Evidence',
      text: 'Supported by stronger human evidence and broader consistency across studies.'
    },
    moderate: {
      title: 'Moderate Confidence Evidence',
      text: 'Some human evidence exists, but findings may still be mixed or incomplete.'
    },
    limited: {
      title: 'Limited Evidence',
      text: 'Evidence may be preliminary, mechanistic, animal-based, or inconsistent.'
    }
  }

  const item = config[level] || config.moderate

  return (
    <div className="rounded-3xl border bg-white/70 backdrop-blur p-6 space-y-3">
      <div className="text-xs uppercase tracking-wider text-neutral-400">
        Evidence Confidence
      </div>

      <div className="text-lg font-semibold">
        {item.title}
      </div>

      <p className="text-sm leading-7 text-neutral-600">
        {item.text}
      </p>
    </div>
  )
}
