'use client'

import Card from '@/components/Card'

type BrowserItem = {
  slug: string
  title: string
  summary?: string
  href: string
  typeLabel?: string
  domain?: string
  isATier?: boolean
  meta?: string[]
}

type LibraryBrowserProps = {
  eyebrow?: string
  title: string
  description?: string
  emptyLabel?: string
  items: BrowserItem[]
}

const normalizeText = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : ''

const getSubtitle = (item: BrowserItem) =>
  item.domain || item.typeLabel || 'Profile'

const getDescription = (item: BrowserItem) =>
  normalizeText(item.summary) || 'Open this profile for the available evidence, safety, and decision context.'

const getBadge = (item: BrowserItem) =>
  item.isATier ? 'Top pick' : item.typeLabel || undefined

export default function LibraryBrowser({
  eyebrow = 'Library',
  title,
  description,
  emptyLabel = 'No matching profiles found.',
  items,
}: LibraryBrowserProps) {
  const cleanItems = items.filter(item => normalizeText(item.slug) && normalizeText(item.title) && normalizeText(item.href))

  return (
    <div className="mx-auto w-full max-w-7xl space-y-7 py-2">
      <section className="relative isolate overflow-hidden rounded-[2rem] bg-slate-950 p-5 text-white shadow-2xl shadow-slate-900/20 sm:p-7">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-400/25 blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-300/50 to-transparent" />
        <div className="relative max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.26em] text-emerald-200/75">{eyebrow}</p>
          <h1 className="mt-3 text-4xl font-black leading-[0.96] tracking-tight text-white sm:text-6xl">{title}</h1>
          {description ? <p className="mt-4 max-w-2xl text-base leading-7 text-white/72">{description}</p> : null}
          <div className="mt-5 flex flex-wrap gap-2 text-xs font-black">
            <span className="rounded-full bg-white px-4 py-2 text-slate-950 shadow-sm">{cleanItems.length} profiles</span>
            <span className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-white/75">Decision cards</span>
          </div>
        </div>
      </section>

      {cleanItems.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {cleanItems.map(item => (
            <Card
              key={item.slug}
              title={item.title}
              subtitle={getSubtitle(item)}
              description={getDescription(item)}
              href={item.href}
              badge={getBadge(item)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600 shadow-sm">
          <p>{emptyLabel}</p>
        </div>
      )}
    </div>
  )
}
