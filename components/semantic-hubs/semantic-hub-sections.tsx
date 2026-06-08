import Link from 'next/link'

type MicroSection = {
  title: string
  body: string
}

export type GraphLink = {
  label: string
  href: string
  description: string
}

export type EcosystemPanel = {
  eyebrow: string
  title: string
  body: string
  signals?: string[]
  href?: string
}

export function SemanticHubIntro({ sections }: { sections: MicroSection[] }) {
  const strongSections = sections.filter((section) => section.title && section.body).slice(0, 3)

  if (!strongSections.length) return null

  return (
    <section className="grid gap-4 md:grid-cols-3">
      {strongSections.map((section) => (
        <article key={section.title} className="surface-subtle rounded-2xl border border-brand-900/10 p-5">
          <p className="eyebrow-label">{section.title}</p>
          <p className="mt-3 text-sm leading-7 text-[#46574d]">{section.body}</p>
        </article>
      ))}
    </section>
  )
}

export function KnowledgeGraphLinks({ eyebrow = 'Knowledge graph', title, links }: { eyebrow?: string; title: string; links: GraphLink[] }) {
  const strongLinks = links.filter((link) => link.label && link.href && link.description).slice(0, 6)

  if (!strongLinks.length) return null

  return (
    <section className="space-y-5">
      <div className="space-y-2">
        <p className="eyebrow-label">{eyebrow}</p>
        <h2 className="text-3xl font-semibold tracking-tight text-ink">{title}</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {strongLinks.map((link) => (
          <Link key={link.href} href={link.href} className="surface-subtle rounded-2xl border border-brand-900/10 p-4 transition hover:border-brand-700/30 hover:bg-white/60">
            <p className="text-sm font-semibold leading-6 text-ink">{link.label}</p>
            <p className="mt-2 text-xs leading-5 text-muted-readable">{link.description}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}

export function SignalPanel({ eyebrow, title, description, signals }: { eyebrow: string; title: string; description: string; signals: string[] }) {
  const cleanSignals = signals.filter(Boolean).slice(0, 8)

  if (!cleanSignals.length) return null

  return (
    <section className="surface-depth card-spacing">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center">
        <div className="space-y-3">
          <p className="eyebrow-label">{eyebrow}</p>
          <h2 className="text-3xl font-semibold tracking-tight text-ink">{title}</h2>
          <p className="detail-reading text-base">{description}</p>
        </div>

        <div className="flex flex-wrap gap-2 lg:justify-end">
          {cleanSignals.map((signal) => (
            <span key={signal} className="chip-readable">{signal}</span>
          ))}
        </div>
      </div>
    </section>
  )
}

export function EcosystemPanelGrid({ title, eyebrow = 'Ecosystem context', panels, limit = 6 }: { title: string; eyebrow?: string; panels: EcosystemPanel[]; limit?: number }) {
  const strongPanels = panels
    .filter((panel) => panel.eyebrow && panel.title && panel.body)
    .slice(0, limit)

  if (!strongPanels.length) return null

  return (
    <section className="space-y-5">
      <div className="space-y-2">
        <p className="eyebrow-label">{eyebrow}</p>
        <h2 className="text-3xl font-semibold tracking-tight text-ink">{title}</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {strongPanels.map((panel) => {
          const content = (
            <div className="space-y-3">
              <p className="identity-kicker">{panel.eyebrow}</p>
              <h3 className="text-lg font-semibold leading-7 text-ink">{panel.title}</h3>
              <p className="text-sm leading-7 text-[#46574d]">{panel.body}</p>
              {panel.signals?.length ? (
                <div className="flex flex-wrap gap-2 pt-1">
                  {panel.signals.filter(Boolean).slice(0, 4).map((signal) => (
                    <span key={signal} className="chip-readable text-[10px] uppercase tracking-wide">{signal}</span>
                  ))}
                </div>
              ) : null}
            </div>
          )

          if (panel.href) {
            return (
              <Link key={`${panel.eyebrow}-${panel.title}`} href={panel.href} className="surface-subtle rounded-2xl border border-brand-900/10 p-5 transition hover:border-brand-700/30 hover:bg-white/60">
                {content}
              </Link>
            )
          }

          return (
            <article key={`${panel.eyebrow}-${panel.title}`} className="surface-subtle rounded-2xl border border-brand-900/10 p-5">
              {content}
            </article>
          )
        })}
      </div>
    </section>
  )
}
