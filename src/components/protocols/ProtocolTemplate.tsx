import Link from 'next/link'

export default function ProtocolTemplate({
  title,
  summary,
  records = [],
}: any) {
  return (
    <div className="container-page py-12 space-y-10">
      <section className="hero-shell rounded-[2rem] p-8 shadow-card">
        <div className="max-w-4xl space-y-5">
          <p className="eyebrow-label">Protocol System</p>

          <h1>{title}</h1>

          <p className="detail-reading text-lg">
            {summary}
          </p>
        </div>
      </section>

      <section className="space-y-5">
        <div className="space-y-2">
          <p className="eyebrow-label">Suggested Components</p>
          <h2>Evidence-informed protocol profiles</h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {records.map((record: any) => (
            <article
              key={record.slug}
              className="card-premium p-5"
            >
              <div className="space-y-4">
                <h3 className="text-xl font-semibold tracking-tight">
                  {record.name}
                </h3>

                <p className="line-clamp-4 text-sm leading-7 text-[#46574d]">
                  {record.summary}
                </p>

                <Link
                  href={`/${record.entityType}s/${record.slug}`}
                  className="button-secondary inline-flex rounded-full px-4 py-2 text-sm"
                >
                  View Profile
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
