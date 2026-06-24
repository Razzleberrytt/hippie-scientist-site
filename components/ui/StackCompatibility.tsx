export default function StackCompatibility({ related = [] }: { related?: Record<string, unknown>[] }) {
  if (!related?.length) return null

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {related.slice(0, 4).map((item: Record<string, unknown>, i: number) => (
        <div
          key={i}
          className="rounded-2xl border border-brand-900/10 bg-white/70 p-4 backdrop-blur dark:border-white/10 dark:bg-white/5"
        >
          <div className="mb-2 text-xs uppercase tracking-wide text-muted">
            Potential Stack Pairing
          </div>

          <div className="text-sm font-semibold text-ink">
            {String(item.name ?? '')}
          </div>

          <div className="mt-2 text-xs leading-5 text-muted">
            May complement related mechanisms, goals, or wellness contexts.
          </div>
        </div>
      ))}
    </div>
  )
}
