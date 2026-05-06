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
    <div className="surface-subtle card-spacing section-spacing">
      <div className="space-y-3">
        <div className="eyebrow-label">
          Evidence Confidence
        </div>

        <div className="text-2xl font-semibold tracking-tight text-ink">
          {item.title}
        </div>
      </div>

      <p className="max-w-2xl text-sm leading-7 text-muted-soft">
        {item.text}
      </p>
    </div>
  )
}
