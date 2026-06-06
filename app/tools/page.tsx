import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Research Tools',
  description: 'Interactive tools for herb and compound research — coming soon.',
  robots: { index: false, follow: true },
}

export default function ToolsPage() {
  const links = [
    { href: '/herbs', label: 'Herb Library' },
    { href: '/compounds', label: 'Compounds' },
    { href: '/compare', label: 'Compare' },
    { href: '/goals', label: 'By Goal' },
  ]

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <p className="eyebrow-label mb-4">Coming Soon</p>
      <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        Research Tools
      </h1>
      <p className="mt-4 text-base leading-7 text-muted">
        Interactive tools for herb and compound research — coming soon.
      </p>

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="rounded-full border border-brand-900/10 bg-white px-5 py-2 text-sm font-semibold text-ink transition hover:bg-sand-50"
          >
            {label}
          </Link>
        ))}
      </div>
    </div>
  )
}
