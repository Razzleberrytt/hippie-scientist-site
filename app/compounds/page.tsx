import Link from 'next/link'
import { getCompounds } from '@/lib/runtime-data'
import '@/styles/premium-cards.css'

function getSummary(item: any) {
  return (
    item.short_earthy_summary ||
    item.shortEarthySummary ||
    item.summary ||
    item.coreInsight ||
    item.hero ||
    'A research-backed compound profile with evidence summaries, mechanisms, and safety context.'
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
    return 'bg-emerald-100 text-emerald-800 border border-emerald-200'
  }

  if (value.includes('moderate')) {
    return 'bg-amber-100 text-amber-800 border border-amber-200'
  }

  return 'bg-stone-100 text-stone-700 border border-stone-200'
}

function safetyClass(level: string) {
  const value = level.toLowerCase()

  if (value.includes('safe')) {
    return 'bg-emerald-100 text-emerald-800 border border-emerald-200'
  }

  if (value.includes('caution') || value.includes('review')) {
    return 'bg-orange-100 text-orange-800 border border-orange-200'
  }

  return 'bg-red-100 text-red-800 border border-red-200'
}

export default async function CompoundsPage() {
  const compounds = await getCompounds()

  return (
    <main className="min-h-screen bg-[#f7f1e6] text-stone-900">
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="max-w-3xl space-y-5">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-stone-500">
            Scientific Compound Library
          </p>

          <h1 className="text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl">
            Compounds
          </h1>

          <p className="text-base leading-8 text-stone-600 sm:text-lg">
            Browse compounds, phytochemicals, amino acids, and bioactive molecules
            with evidence-driven summaries and scientific context.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {compounds.map((compound: any) => {
            const evidence = getEvidence(compound)
            const safety = getSafety(compound)

            return (
              <article
                key={compound.slug}
                className="group rounded-3xl border border-stone-200/80 bg-white/90 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex flex-wrap gap-2">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${evidenceClass(
                      evidence
                    )}`}
                  >
                    {evidence}
                  </span>

                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${safetyClass(
                      safety
                    )}`}
                  >
                    {safety}
                  </span>
                </div>

                <div className="mt-5 space-y-4">
                  <h2 className="text-2xl font-semibold tracking-tight text-stone-900 transition-colors group-hover:text-emerald-700">
                    {compound.name}
                  </h2>

                  <p className="line-clamp-4 text-sm leading-7 text-stone-600 sm:text-base">
                    {getSummary(compound)}
                  </p>
                </div>

                <div className="mt-8">
                  <Link
                    href={`/compounds/${compound.slug}`}
                    className="inline-flex items-center rounded-full border border-stone-300 bg-stone-50 px-4 py-2 text-sm font-medium text-stone-700 transition-all hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
                  >
                    View Profile
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      </section>
    </main>
  )
}
