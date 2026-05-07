import Link from 'next/link'

type CompareWithItem = {
  href: string
  title: string
  description: string
}

type CompareWithCardProps = {
  items?: CompareWithItem[]
}

export default function CompareWithCard({ items = [] }: CompareWithCardProps) {
  const visible = items.filter(item => item.href && item.title && item.description).slice(0, 6)
  if (!visible.length) return null

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {visible.map(item => (
        <Link key={item.href} href={item.href} className="card-premium block p-5 hover:-translate-y-0.5">
          <p className="eyebrow-label">Commonly explored with</p>
          <h3 className="mt-2 text-lg font-semibold text-ink">{item.title}</h3>
          <p className="mt-3 text-sm leading-7 text-[#46574d]">{item.description}</p>
          <p className="mt-4 text-sm font-semibold text-brand-800">Open profile →</p>
        </Link>
      ))}
    </div>
  )
}
