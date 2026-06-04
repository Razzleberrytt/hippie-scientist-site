import Link from 'next/link'
import { getBestForRankings } from '@/lib/authority-runtime'

function titleize(slug: string) {
  return slug
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export default async function BestPage({ params }: any) {
  const slug = String(params?.slug || '').toLowerCase()
  const ranked = await getBestForRankings(slug)

  return (
    <div className="container-page py-12 space-y-8">
      <section className="hero-shell rounded-[2rem] p-8 shadow-card">
        <div className="max-w-4xl space-y-5">
          <p className="eyebrow-label">Best-For Rankings</p>

          <h1>
            Best Natural Options for {titleize(slug)}
          </h1>
        </div>
      </section>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {ranked.map((item: any) => (
          <article
            key={item.slug}
            className="card-premium p-5"
          >
            <div className="space-y-4">
              <h2 className="text-xl font-semibold tracking-tight">
                {item.name}
              </h2>

              <p className="line-clamp-4 text-sm leading-7 text-[#46574d]">
                {item.summary}
              </p>

              <Link
                href={'/' + item.entityType + 's/' + item.slug}
                className="button-secondary inline-flex rounded-full px-4 py-2 text-sm"
              >
                View Profile
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
