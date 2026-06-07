import Link from 'next/link'
import type { ReactNode } from 'react'

type RelatedItem = {
  href: string
  title: string
  kind?: 'herb' | 'compound' | 'article' | 'guide' | 'goal'
  description?: string
}

const KIND_LABEL: Record<string, string> = {
  herb: 'Herb',
  compound: 'Compound',
  article: 'Article',
  guide: 'Guide',
  goal: 'Goal',
}

type RelatedContentProps = {
  title?: string
  items: RelatedItem[]
  children?: ReactNode
  className?: string
}

export default function RelatedContent({ title = 'Related content', items, children, className = '' }: RelatedContentProps) {
  if (!items.length && !children) return null

  return (
    <aside
      aria-label={title}
      className={`rounded-xl border border-brand-900/10 bg-brand-50/60 p-4 sm:p-5 ${className}`}
    >
      <p className="text-[10px] font-bold uppercase text-muted">{title}</p>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="group flex flex-col gap-0.5"
            >
              <span className="flex items-center gap-1.5 text-sm font-semibold text-brand-800 group-hover:text-brand-900 group-hover:underline">
                {item.kind && (
                  <span className="rounded bg-white px-1.5 py-0.5 text-[10px] font-bold uppercase text-muted border border-brand-900/10">
                    {KIND_LABEL[item.kind] || item.kind}
                  </span>
                )}
                {item.title}
              </span>
              {item.description && (
                <span className="text-xs leading-5 text-[#46574d]">{item.description}</span>
              )}
            </Link>
          </li>
        ))}
      </ul>
      {children}
    </aside>
  )
}
