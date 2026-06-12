import Link from 'next/link'
import { focusClusterSeeAlsoLinks } from '@/lib/schema'

type SeeAlsoInClusterProps = {
  currentPath?: string
  title?: string
}

export default function SeeAlsoInCluster({
  currentPath,
  title = 'See also in Focus & ADHD',
}: SeeAlsoInClusterProps) {
  const links = focusClusterSeeAlsoLinks.filter((link) => link.href !== currentPath).slice(0, 6)

  if (!links.length) return null

  return (
    <section className="rounded-2xl border border-brand-900/10 bg-brand-50/60 p-5 sm:p-6">
      <div className="max-w-2xl">
        <p className="eyebrow-label">Cluster guide</p>
        <h2 className="mt-2 text-xl font-semibold text-ink">{title}</h2>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-xl border border-brand-900/10 bg-white/80 p-4 text-sm transition hover:border-brand-700/25 hover:bg-white"
          >
            <span className="font-semibold text-brand-800">{link.title}</span>
            <span className="mt-1 block leading-6 text-muted">{link.description}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
