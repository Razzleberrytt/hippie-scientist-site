import Link from 'next/link'
import { semanticCollections } from '@/lib/semantic-collections'
import { getEcosystemVisual } from '@/lib/ecosystem-visuals'

export default function SemanticCollectionGrid() {
  return (
    <section className="compact-section section-rhythm-balanced">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <p className="eyebrow-label">Semantic Collections</p>
          <span className="chip-readable">Dynamic authority ecosystems</span>
        </div>

        <h2 className="compact-heading">
          Explore connected scientific ecosystems.
        </h2>

        <p className="compact-copy">
          Collections organize herbs and compounds into semantic ecosystems centered around pathways, mechanisms, goals, and research continuity.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {semanticCollections.map((collection) => {
          const visual = getEcosystemVisual(collection.slug)

          return (
            <Link
              key={collection.slug}
              href={`/collections/${collection.slug}`}
              className="compact-card group section-rhythm-compact overflow-hidden"
              style={{ background: visual.gradient }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <span className="eyebrow-label">{collection.intent}</span>

                  <h3 className="max-w-none text-lg font-semibold leading-tight tracking-tight text-ink group-hover:text-brand-700">
                    {collection.title}
                  </h3>
                </div>

                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl border border-black/5 bg-white/60 text-xl shadow-sm"
                  style={{ color: visual.accent }}
                  aria-hidden="true"
                >
                  {visual.glyph}
                </div>
              </div>

              <p className="line-clamp-3 text-sm leading-6 text-[#46574d]">
                {collection.description}
              </p>

              <div className="flex flex-wrap gap-2 border-t border-black/5 pt-3">
                {collection.keywords.slice(0, 4).map((keyword) => (
                  <span key={keyword} className="chip-readable bg-white/70">
                    {keyword}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="identity-meta">Semantic ecosystem</span>
                <span className="text-sm font-semibold text-brand-800">
                  Explore →
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
