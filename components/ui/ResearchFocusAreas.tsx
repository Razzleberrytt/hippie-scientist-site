type ResearchFocusAreasProps = {
  areas: string[]
}

export default function ResearchFocusAreas({ areas = [] }: ResearchFocusAreasProps) {
  const visible = areas.filter(Boolean).slice(0, 6)
  if (!visible.length) return null

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {visible.map(area => (
        <div key={area} className="card-premium p-4">
          <p className="eyebrow-label">Focus area</p>
          <h3 className="mt-2 text-base font-semibold leading-6 text-ink">{area}</h3>
        </div>
      ))}
    </div>
  )
}
