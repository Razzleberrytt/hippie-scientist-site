import Link from 'next/link'

export default function AuthorityHubTemplate({
  title,
  summary,
  records = [],
  comparisons = [],
  stacks = [],
}: any) {
  return (
    <div className="container-page py-12 space-y-10">
      <section className="hero-shell rounded-[2rem] p-8 shadow-card">
        <div className="max-w-4xl space-y-5">
          <p className="eyebrow-label">Authority Hub</p>

          <h1>{title}</h1>

          <p className="detail-reading text-lg">
            {summary}
          </p>
        </div>
      </section>

      <section className="space-y-5">
        <div className="space-y-2">
          <p className="eyebrow-label">Related Profiles</p>
          <h2>Evidence-informed discovery</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {records.map((record: any) => (
            <article
              key={record.slug}
              className="card-premium p-5"
            >
              <div className="space-y-3">
                <h3 className="text-xl font-semibold tracking-tight">
                  {record.name}
                </h3>

                <p className="line-clamp-4 text-sm leading-7 text-[#46574d]">
                  {record.summary}
                </p>

                <div className="flex flex-wrap gap-2">
                  {(record.relatedOverlap || []).slice(0, 3).map((tag: string) => (
                    <span
                      key={tag}
                      className="chip-readable"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

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

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="card-premium p-6 space-y-4">
          <div>
            <p className="eyebrow-label">Comparisons</p>
            <h2>Related comparisons</h2>
          </div>

          <div className="space-y-3">
            {comparisons.map((comparison: any) => (
              <div
                key={comparison.slug}
                className="surface-subtle rounded-2xl p-4"
              >
                <Link
                  href={`/compare/${comparison.slug}`}
                  className="font-medium hover:underline"
                >
                  {comparison.name || comparison.slug}
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className="card-premium p-6 space-y-4">
          <div>
            <p className="eyebrow-label">Stacks</p>
            <h2>Related stack systems</h2>
          </div>

          <div className="space-y-3">
            {stacks.map((stack: any) => (
              <div
                key={stack.slug}
                className="surface-subtle rounded-2xl p-4"
              >
                <Link
                  href={`/stacks/${stack.slug}`}
                  className="font-medium hover:underline"
                >
                  {stack.name || stack.slug}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
