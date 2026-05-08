import Link from 'next/link'
import { getCompounds } from '@/lib/runtime-data'
import { cleanSummary, formatDisplayLabel } from '@/lib/display-utils'
import { getRuntimeVisibility } from '@/lib/runtime-visibility'
import '@/styles/premium-cards.css'

function safeString(value: unknown) {
  return typeof value === 'string' ? value : ''
}

function getName(item: any) {
  return (
    formatDisplayLabel(item?.displayName) ||
    formatDisplayLabel(item?.name) ||
    formatDisplayLabel(item?.slug) ||
    'Unknown Compound'
  )
}

function getSummary(item: any) {
  return cleanSummary(
    item?.short_earthy_summary ||
      item?.shortEarthySummary ||
      item?.summary ||
      item?.coreInsight ||
      item?.hero ||
      item?.description ||
      '',
    'compound'
  )
}

function getEvidenceLabel(item: any) {
  return safeString(
    item?.evidence_tier ||
      item?.evidenceTier ||
      item?.evidence_grade ||
      item?.evidenceLevel ||
      item?.summary_quality
  )
}

function getProfileLabel(item: any) {
  return safeString(
    item?.profile_status ||
      item?.summary_quality ||
      item?.status
  )
}

function getBadgeClass(value: string) {
  const normalized = safeString(value).toLowerCase()

  if (
    normalized.includes('strong') ||
    normalized.includes('high') ||
    normalized.includes('clinical')
  ) {
    return 'evidence-pill-strong'
  }

  if (
    normalized.includes('moderate') ||
    normalized.includes('human')
  ) {
    return 'evidence-pill-moderate'
  }

  return 'chip-readable'
}

export default async function CompoundsPage() {
  const runtimeCompounds = await getCompounds()

  const compounds = runtimeCompounds.filter((compound: any) => {
    try {
      return getRuntimeVisibility(compound).canRender
    } catch {
      return true
    }
  })

  return (
    <main className="min-h-screen bg-background text-ink">
      <section className="container-page py-12 sm:py-16 lg:py-20">
        <div className="section-spacing">
          <div className="hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8 lg:p-10">
            <div className="max-w-3xl space-y-6">
              <div className="space-y-3">
                <p className="eyebrow-label">
                  Scientific Compound Library
                </p>

                <h1 className="max-w-[12ch]">
                  Compounds
                </h1>
              </div>

              <p className="detail-reading text-[1.05rem] sm:text-lg">
                Explore phytochemicals, amino acids, alkaloids, and bioactive molecules organized around mechanisms, evidence maturity, and research pathways.
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 xl:gap-6">
            {compounds.map((compound: any) => {
              const evidence = getEvidenceLabel(compound)
              const profile = getProfileLabel(compound)

              return (
                <article
                  key={compound?.slug || getName(compound)}
                  className="card-premium group flex h-full flex-col p-5 sm:p-6"
                >
                  <div className="metadata-row">
                    {evidence ? (
                      <span className={getBadgeClass(evidence)}>
                        {evidence}
                      </span>
                    ) : null}

                    {profile ? (
                      <span className="chip-readable">
                        {profile}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-5 flex flex-1 flex-col">
                    <div className="space-y-3">
                      <h2 className="max-w-[18ch] text-[1.45rem] font-semibold leading-tight tracking-tight text-ink transition-colors duration-300 group-hover:text-brand-700">
                        {getName(compound)}
                      </h2>

                      <p className="line-clamp-4 text-sm leading-7 text-[#46574d]">
                        {getSummary(compound)}
                      </p>
                    </div>

                    <div className="mt-auto flex items-center justify-between gap-4 pt-6">
                      <div className="identity-meta">
                        Molecular research profile
                      </div>

                      <Link
                        href={`/compounds/${compound?.slug || ''}`}
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
