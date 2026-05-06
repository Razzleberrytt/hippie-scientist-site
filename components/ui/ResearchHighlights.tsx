export default function ResearchHighlights({ sources = [] }: any) {
  if (!sources?.length) return null

  return (
    <div className="grid gap-4">
      {sources.slice(0, 3).map((source: any, i: number) => (
        <div
          key={i}
          className="surface-depth card-spacing space-y-4"
        >
          <div className="eyebrow-label">
            Research Highlight
          </div>

          <div className="text-sm leading-7 text-[#435246] break-words">
            {typeof source === 'string'
              ? source
              : JSON.stringify(source)}
          </div>
        </div>
      ))}
    </div>
  )
}
