import Link from 'next/link'

const CATEGORY_LABEL: Record<string, string> = {
  sleep: '😴 Sleep',
  stress: '😌 Stress',
  anxiety: '😟 Anxiety',
  focus: '🧠 Focus',
}

export interface RelatedArticle {
  href: string;
  title: string;
  description: string;
  category?: 'sleep' | 'stress' | 'anxiety' | 'focus';
}

interface RelatedArticlesProps {
  articles: RelatedArticle[];
  heading?: string;
}

export default function RelatedArticles({
  articles,
  heading = 'Related Guides',
}: RelatedArticlesProps) {
  if (!articles.length) return null

  const limited = articles.slice(0, 3)

  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold text-ink">{heading}</h2>
      <div className="grid gap-3 sm:grid-cols-3">
        {limited.map(({ href, title, description, category }) => (
          <Link
            key={href}
            href={href}
            className="rounded-2xl border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/20 hover:bg-white"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-700">
              {category ? CATEGORY_LABEL[category] : 'Guide'}
            </p>
            <p className="mt-1 text-sm font-semibold text-ink">{title}</p>
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">{description}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}
