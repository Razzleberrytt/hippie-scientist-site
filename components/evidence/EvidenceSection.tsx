import EvidenceBadge from './EvidenceBadge'

interface StudyLink {
  label: string
  href: string
}

interface EvidenceSectionProps {
  title: string
  evidenceLevel: 'Strong' | 'Moderate' | 'Limited' | 'Traditional' | 'Theoretical'
  summary: string
  limitations?: string
  studies?: StudyLink[]
}

export default function EvidenceSection({
  title,
  evidenceLevel,
  summary,
  limitations,
  studies = [],
}: EvidenceSectionProps) {
  return (
    <section className="card-premium p-6 space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <p className="eyebrow-label">Evidence strength review</p>

        <EvidenceBadge level={evidenceLevel} />
      </div>

      <div className="space-y-4">
        <h2 className="text-3xl font-semibold tracking-tight text-ink">
          {title}
        </h2>

        <p className="text-base leading-8 text-muted">
          {summary}
        </p>
      </div>

      {limitations ? (
        <div className="surface-subtle rounded-2xl p-4 space-y-2">
          <p className="text-sm font-semibold tracking-wide text-ink">
            Research limitations
          </p>

          <p className="text-sm leading-7 text-[#5c6b63]">
            {limitations}
          </p>
        </div>
      ) : null}

      {studies.length ? (
        <div className="space-y-3">
          <p className="text-sm font-semibold tracking-wide text-ink">
            Referenced research
          </p>

          <div className="flex flex-wrap gap-3">
            {studies.map((study) => (
              <a
                key={study.href}
                href={study.href}
                target="_blank"
                rel="noopener noreferrer"
                className="chip-readable"
              >
                {study.label}
              </a>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  )
}
