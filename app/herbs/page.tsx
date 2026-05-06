import Link from 'next/link'
import { getHerbs } from '@/lib/runtime-data'
import '@/styles/premium-cards.css'

function getSummary(item: any) {
  return (
    item.short_earthy_summary ||
    item.shortEarthySummary ||
    item.summary ||
    item.coreInsight ||
    item.hero ||
    'A research-backed botanical profile with evidence, safety notes, and practical context.'
  )
}

function getEvidence(item: any) {
  return (
    item.evidence_tier ||
    item.evidenceTier ||
    item.safety?.evidenceTier ||
    item.summary_quality ||
    'Moderate'
  )
}

function getSafety(item: any) {
  return (
    item.safety_level ||
    item.safetyLevel ||
    item.safety?.confidence ||
    'Review'
  )
}

function evidenceClass(level: string) {
  const value = level.toLowerCase()

  if (value.includes('strong')) {
    return 'evidence-pill-strong'
  }

  if (value.includes('moderate')) {
    return 'evidence-pill-moderate'
  }

  return 'chip-readable'
}

function safetyClass(level: string) {
  const value = level.toLowerCase()

  if (value.includes('safe')) {
    return 'evidence-pill-strong'
  }

  if (value.includes('caution') || value.includes('review')) {
    return 'chip-readable'
  }

  return 'rounded-full border border-red-700/10 bg-red-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800'
}

export default async function HerbsPage() {
  const herbs = await getHerbs()

  return (
    <main className="min-h-screen bg-background text-ink">
      <section className="container-page py-12 sm:py-16 lg:py-20">
        <div className="section-spacing">
          <div className="max-w-3xl space-y-6">
            <div className="space-y-3">
              <p className="eyebrow-label">
                Botanical Research Library
              </p>

              <h1 className="max-w-[10ch]">
                Herbs
              </h1>
            </div>

            <p className="text-reading text-[1.05rem] sm:text-lg">
              Explore evidence-based herb profiles with mechanisms, safety context,
              research summaries, and practical wellness applications.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 xl:gap-7">
            {herbs.map((herb: any) => {
              const evidence = getEvidence(herb)
              const safety = getSafety(herb)

              return (
                <article
                  key={herb.slug}
                  className="card-premium card-spacing group flex h-full flex-col"
                >
                  <div className="flex flex-wrap gap-2">
                    <span className={evidenceClass(evidence)}>
                      {evidence}
                    </span>

                    <span className={safetyClass(safety)}>
                      {safety}
                    </span>
                  </div>

                  <div className="mt-6 flex flex-1 flex-col space-y-4">
                    <div className="space-y-3">
                      <h2 className="max-w-[18ch] text-2xl font-semibold leading-tight tracking-tight text-ink transition-colors duration-300 group-hover:text-brand-700">
                        {herb.name}
                      </h2>

                      <p className="line-clamp-4 text-sm leading-7 text-[#46574d] sm:text-[0.98rem]">
                        {getSummary(herb)}
                      </p>
                    </div>

                    <div className="mt-auto pt-3">
                      <Link
                        href={`/herbs/${herb.slug}`}
                        className="button-secondary rounded-full px-4 py-2.5 text-sm"
                      >
                        View Profile
                      </Link>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>
    </main>
  )
}
