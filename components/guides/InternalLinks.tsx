import Link from 'next/link'
import type { GuideInternalLink, InternalLinkType } from '@/lib/schemas/guide-schemas'

const TYPE_LABELS: Record<InternalLinkType, string> = {
  herb: 'Herb Profile',
  compound: 'Compound',
  guide: 'Guide',
  goal: 'Goal',
  compare: 'Compare',
}

interface Props {
  links: GuideInternalLink[]
  heading?: string
}

export default function InternalLinks({ links, heading = 'Related Resources' }: Props) {
  if (!links.length) return null
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-ink">{heading}</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-2xl border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/20 hover:bg-white"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-700">
              {TYPE_LABELS[link.type]}
            </p>
            <p className="mt-1 text-sm font-semibold text-ink">{link.label}</p>
            {link.description && (
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">
                {link.description}
              </p>
            )}
          </Link>
        ))}
      </div>
    </section>
  )
}
