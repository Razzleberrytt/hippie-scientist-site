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
