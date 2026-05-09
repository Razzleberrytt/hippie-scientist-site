import Link from 'next/link'

export default function ComparisonTemplate({
  title,
  left,
  right,
  summary,
}: any) {
  return (
    <main className="container-page py-12 space-y-10">
      <section className="hero-shell rounded-[2rem] p-8 shadow-card">
        <div className="max-w-4xl space-y-5">
          <p className="eyebrow-label">Comparison Guide</p>

          <h1>{title}</h1>

          <p className="detail-reading text-lg">
            {summary}
          </p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        {[left, right].map((item: any) => (
          <article
            key={item.slug}
            className="card-premium p-6 space-y-4"
          >
            <div className="space-y-2">
              <p className="eyebrow-label">
                {item.entityType}
              </p>

              <h2 className="text-2xl font-semibold tracking-tight">
                {item.name}
              </h2>
            </div>

            <p className="line-clamp-5 text-sm leading-7 text-[#46574d]">
              {item.summary}
            </p>

            <Link
              href={`/${item.entityType}s/${item.slug}`}
              className="button-secondary inline-flex rounded-full px-4 py-2 text-sm"
            >
              View Profile
            </Link>
          </article>
        ))}
      </section>
    </main>
  )
}
