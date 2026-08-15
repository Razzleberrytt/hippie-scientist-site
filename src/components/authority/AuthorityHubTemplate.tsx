import Link from 'next/link'

export default function AuthorityHubTemplate({
  title,
  summary,
  records = [],
  comparisons = [],
  stacks = [],
}: any) {
  const heroMetrics = [
    { value: records.length, label: 'profiles' },
    { value: comparisons.length, label: 'comparisons' },
    { value: stacks.length, label: 'stack systems' },
  ]

  return (
    <div className="container-page space-y-10 py-6 sm:py-12">
      <section className="hero-shell rounded-[2rem] p-6 sm:p-8 lg:p-10">
        <div className="max-w-4xl">
          <p className="eyebrow-label">Authority Hub</p>

          <h1 className="heading-premium mt-5">{title}</h1>

          <p className="text-reading mt-4 max-w-3xl">
            {summary}
          </p>

          <dl className="mt-6 grid grid-cols-3 overflow-hidden rounded-2xl border border-[color:var(--hs-hairline)] bg-[color:color-mix(in_srgb,var(--hs-surface)_76%,transparent)] backdrop-blur-sm">
            {heroMetrics.map((metric, index) => (
              <div
                key={metric.label}
                className={`px-3 py-3.5 text-center sm:px-5 sm:py-4 ${index > 0 ? 'border-l border-[color:var(--hs-hairline)]' : ''}`}
              >
                <dt className="sr-only">{metric.label}</dt>
                <dd>
                  <span className="block font-display text-2xl font-semibold tracking-[-0.035em] text-[color:var(--hs-ink)] sm:text-[1.7rem]">
                    {metric.value}
                  </span>
                  <span className="mt-1 block text-[0.66rem] font-bold uppercase tracking-[0.12em] text-[color:var(--hs-body)] sm:text-[0.7rem]">
                    {metric.label}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
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
                  href={`/guides/compare/${comparison.slug}`}
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
