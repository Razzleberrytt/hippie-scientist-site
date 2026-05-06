export default function ResearchHighlights({ sources = [] }: any) {
  if (!sources?.length) return null

  return (
    <div className="grid gap-3">
      {sources.slice(0, 3).map((source: any, i: number) => (
        <div
          key={i}
          className="rounded-2xl border p-4 bg-gradient-to-br from-white to-neutral-50"
        >
          <div className="text-[10px] uppercase tracking-wider text-neutral-400 mb-2">
            Research Highlight
          </div>

          <div className="text-sm leading-6 text-neutral-700 break-words">
            {typeof source === 'string'
              ? source
              : JSON.stringify(source)}
          </div>
        </div>
      ))}
    </div>
  )
}
