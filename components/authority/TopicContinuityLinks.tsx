import Link from 'next/link'

type TopicLink = {
  href: string
  label: string
}

type TopicContinuityLinksProps = {
  title?: string
  items?: TopicLink[]
}

export default function TopicContinuityLinks({
  title = 'Continue Exploring',
  items = [],
}: TopicContinuityLinksProps) {
  if (!items.length) {
    return null
  }

  return (
    <section className="surface-subtle rounded-3xl p-6">
      <div className="space-y-2">
        <p className="eyebrow-label">Topic Continuity</p>

        <h2 className="text-xl font-semibold tracking-tight text-ink">
          {title}
        </h2>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="chip-readable hover:bg-white transition"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </section>
  )
}
