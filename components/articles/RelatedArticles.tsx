import Link from 'next/link'

const CATEGORY_LABEL: Record<string, string> = {
  sleep: 'Sleep',
  stress: 'Stress',
  anxiety: 'Anxiety',
  focus: 'Focus',
}

export interface RelatedArticle {
  href: string
  title: string
  description: string
  category?: 'sleep' | 'stress' | 'anxiety' | 'focus'
}

interface RelatedArticlesProps {
  articles: RelatedArticle[]
  heading?: string
}

export default function RelatedArticles({
  articles,
  heading = 'Related Guides',
}: RelatedArticlesProps) {
  if (!articles.length) return null

  const limited = articles.slice(0, 3)

  return (
    <section className="border-y border-[color:var(--hs-hairline-strong)] py-6 sm:py-7">
      <div className="mb-2 flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow-label">Further reading</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[color:var(--hs-ink)]">{heading}</h2>
        </div>
        <span className="hidden text-[10px] font-bold uppercase tracking-[0.16em] text-[color:var(--hs-body)] sm:inline">
          {limited.length} selected
        </span>
      </div>

      <div className="divide-y divide-[color:var(--hs-hairline)]">
        {limited.map(({ href, title, description, category }, index) => (
          <Link
            key={href}
            href={href}
            className="group grid gap-3 py-5 transition sm:grid-cols-[3.25rem_minmax(0,1fr)_auto] sm:items-start sm:gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--hs-gold)] focus-visible:ring-offset-4"
          >
            <span className="font-display text-lg font-semibold tabular-nums text-[color:var(--hs-gold)]">
              {String(index + 1).padStart(2, '0')}
            </span>

            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[color:var(--tone-ink)]">
                {category ? CATEGORY_LABEL[category] : 'Guide'}
              </p>
              <h3 className="mt-1 text-base font-semibold leading-snug text-[color:var(--hs-ink)] transition group-hover:text-[color:var(--tone-ink)]">
                {title}
              </h3>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-[color:var(--hs-body)]">{description}</p>
            </div>

            <span
              aria-hidden="true"
              className="hidden pt-5 text-lg text-[color:var(--hs-body)] transition group-hover:translate-x-1 group-hover:text-[color:var(--hs-gold)] sm:block"
            >
              →
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
