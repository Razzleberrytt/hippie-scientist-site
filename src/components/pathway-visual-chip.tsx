import { getPathwayVisual } from '../lib/pathway-visuals'

type PathwayVisualChipProps = {
  pathway: string
}

export default function PathwayVisualChip({
  pathway,
}: PathwayVisualChipProps) {
  const visual = getPathwayVisual(pathway)

  return (
    <div
      className="inline-flex items-center gap-2 rounded-full border border-brand-900/10 px-3 py-1.5 shadow-sm"
      style={{
        background: visual.background,
      }}
    >
      <span
        className="text-sm font-semibold leading-none"
        style={{ color: visual.accent }}
        aria-hidden="true"
      >
        {visual.glyph}
      </span>

      <span
        className="text-xs font-semibold tracking-tight"
        style={{ color: visual.accent }}
      >
        {pathway}
      </span>
    </div>
  )
}
