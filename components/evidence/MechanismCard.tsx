interface MechanismCardProps {
  title: string
  description: string
  pathway?: string
}

export default function MechanismCard({
  title,
  description,
  pathway,
}: MechanismCardProps) {
  return (
    <div className="card-premium p-6 space-y-4">
      <div className="space-y-2">
        <p className="eyebrow-label">Mechanism Overview</p>

        <h3 className="text-2xl font-semibold tracking-tight text-ink">
          {title}
        </h3>
      </div>

      <p className="text-sm leading-7 text-[#46574d]">
        {description}
      </p>

      {pathway ? (
        <div className="inline-flex rounded-full bg-[#f5f3ec] px-3 py-1 text-xs font-semibold tracking-wide text-[#5c6b63]">
          Related pathway: {pathway}
        </div>
      ) : null}
    </div>
  )
}
