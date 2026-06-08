type SemanticAuthorityNoteProps = {
  title?: string
  description?: string
}

export function SemanticAuthorityNote({
  title = 'Educational scientific context',
  description = 'These pages are designed as semantic educational hubs connecting mechanisms, pathways, evidence quality, safety interpretation, and related compounds or herbs.',
}: SemanticAuthorityNoteProps) {
  return (
    <section className="surface-subtle rounded-[1.75rem] border border-brand-900/10 p-5 sm:p-6">
      <div className="max-w-3xl space-y-3">
        <p className="eyebrow-label">Semantic Discovery</p>

        <h2 className="text-2xl font-semibold tracking-tight text-ink">
          {title}
        </h2>

        <p className="text-sm leading-7 text-[#46574d] sm:text-base">
          {description}
        </p>
      </div>
    </section>
  )
}
