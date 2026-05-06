export default function SectionBlock({ title, children }: any) {
  return (
    <section className="surface-subtle section-spacing card-spacing">
      <div className="space-y-3 border-b border-brand-900/8 pb-4">
        <div className="eyebrow-label">
          Research Section
        </div>

        <h2 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          {title}
        </h2>
      </div>

      <div className="content-prose muted-readable max-w-none">
        {children}
      </div>
    </section>
  )
}
