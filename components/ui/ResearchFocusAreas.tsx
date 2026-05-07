export default function ResearchFocusAreas({ areas = [] }: { areas?: string[] }) {
  const visible = areas.filter(Boolean).slice(0, 6)
  if (visible.length < 2) return null

  return (
    <div className="surface-subtle rounded-2xl p-5 sm:p-6">
      <p className="eyebrow-label">Research focus</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {visible.map(area => (
          <span key={area} className="rounded-full border border-brand-900/10 bg-white/80 px-3 py-1.5 text-sm font-medium capitalize text-[#46574d]">
            {area}
          </span>
        ))}
      </div>
    </div>
  )
}
