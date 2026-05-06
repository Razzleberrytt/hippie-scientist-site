export default function EvidenceMeter({ level='moderate' }: any) {
  const widths: any = {
    strong: 'w-full',
    moderate: 'w-2/3',
    limited: 'w-1/3'
  }

  const tones:any = {
    strong: 'bg-emerald-700',
    moderate: 'bg-blue-700',
    limited: 'bg-amber-600'
  }

  return (
    <div className="surface-subtle card-spacing space-y-4">
      <div className="flex items-start justify-between gap-4 text-sm">
        <div className="space-y-2">
          <div className="eyebrow-label">
            Evidence Strength
          </div>

          <p className="max-w-md text-sm leading-7 text-muted-soft">
            Confidence estimate based on available human and mechanistic evidence.
          </p>
        </div>

        <span className="chip-readable capitalize">
          {level}
        </span>
      </div>

      <div className="h-2.5 overflow-hidden rounded-full bg-neutral-200/80">
        <div className={`h-full rounded-full transition-all duration-700 ${tones[level] || tones.moderate} ${widths[level] || widths.moderate}`} />
      </div>
    </div>
  )
}
