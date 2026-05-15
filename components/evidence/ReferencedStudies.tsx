interface ReferencedStudy {
  title: string
  href: string
  source?: string
}

export default function ReferencedStudies({
  studies,
}: {
  studies: ReferencedStudy[]
}) {
  return (
    <section className="card-premium p-6 space-y-5">
      <div className="space-y-2">
        <p className="eyebrow-label">Referenced Research</p>

        <h2 className="text-3xl font-semibold tracking-tight text-ink">
          Research references
        </h2>
      </div>

      <div className="space-y-4">
        {studies.map((study) => (
          <a
            key={study.href}
            href={study.href}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-2xl border border-[#d8d3c4] bg-white px-5 py-4 transition hover:-translate-y-0.5"
          >
            <div className="space-y-2">
              <p className="text-base font-semibold leading-7 text-ink">
                {study.title}
              </p>

              {study.source ? (
                <p className="text-xs tracking-wide text-[#5c6b63] uppercase">
                  {study.source}
                </p>
              ) : null}
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}
