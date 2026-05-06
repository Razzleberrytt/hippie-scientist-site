import Link from 'next/link'

type Item = {
  slug: string
  name?: string
  relationship_reason?: string
  relationship_score?: number
}

type Props = {
  title: string
  subtitle?: string
  items: Item[]
}

export default function RecommendationRail({ title, subtitle, items }: Props) {
  if (!items?.length) return null

  return (
    <section className="space-y-5">
      <div>
        <div className="text-xs uppercase tracking-[0.2em] text-emerald-300">
          Semantic Discovery
        </div>

        <h2 className="mt-2 text-3xl font-semibold text-white">
          {title}
        </h2>

        {subtitle && (
          <p className="mt-3 max-w-3xl text-sm leading-7 text-neutral-400">
            {subtitle}
          </p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => {
          const strength = Math.min(100, (item.relationship_score || 1) * 15)

          return (
            <Link
              key={item.slug}
              href={`/compounds/${item.slug}`}
              className="group rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/[0.08]"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-semibold text-white group-hover:text-emerald-300 transition">
                    {item.name || item.slug}
                  </h3>

                  <div className="rounded-full border border-white/10 bg-black/20 px-2 py-1 text-[10px] uppercase tracking-wide text-neutral-300">
                    {strength >= 60 ? 'Strong' : strength >= 30 ? 'Moderate' : 'Exploratory'}
                  </div>
                </div>

                <p className="text-sm leading-7 text-neutral-400">
                  {item.relationship_reason || 'Semantically related compound profile.'}
                </p>

                <div className="h-2 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-400"
                    style={{ width: `${strength}%` }}
                  />
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
