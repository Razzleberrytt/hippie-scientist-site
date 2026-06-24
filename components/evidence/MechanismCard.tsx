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
    <div className="card-premium space-y-4 p-6">
      <div className="space-y-2">
        <p className="eyebrow-label">Mechanism Overview</p>

        <h3 className="text-2xl font-semibold tracking-tight text-ink">
          {title}
        </h3>
      </div>

      <p className="text-sm leading-7 text-muted">
        {description}
      </p>

      {pathway ? (
        <div className="inline-flex rounded-full border border-brand-900/10 bg-brand-50/70 px-3 py-1 text-xs font-semibold tracking-wide text-brand-800 dark:border-white/10 dark:bg-white/5 dark:text-brand-100">
          Related pathway: {pathway}
        </div>
      ) : null}
    </div>
  )
}
