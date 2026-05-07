type RelatedPathwaysProps = {
  pathways: string[]
}

export default function RelatedPathways({ pathways = [] }: RelatedPathwaysProps) {
  const visible = pathways.filter(Boolean).slice(0, 6)
  if (!visible.length) return null

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {visible.map(pathway => (
        <div key={pathway} className="surface-subtle rounded-2xl border border-brand-900/10 p-4">
          <p className="text-sm font-semibold leading-6 text-ink">{pathway}</p>
          <p className="mt-2 text-xs leading-5 text-muted-readable">Related pathway context from listed mechanisms.</p>
        </div>
      ))}
    </div>
  )
}
