import { isClean, text } from '@/lib/display-utils'

export default function ResearchHighlights({ sources = [] }: any) {
  const visibleSources = sources
    .map((source: any) => text(source))
    .filter(isClean)
    .slice(0, 3)

  if (!visibleSources.length) return null

  return (
    <div className="grid gap-4">
      {visibleSources.map((source: string, i: number) => (
        <div
          key={i}
          className="surface-depth card-spacing space-y-4"
        >
          <div className="eyebrow-label">
            Research Highlight
          </div>

          <div className="text-sm leading-7 text-[#435246] break-words">
            {source}
          </div>
        </div>
      ))}
    </div>
  )
}
