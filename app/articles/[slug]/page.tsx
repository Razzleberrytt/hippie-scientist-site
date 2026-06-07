import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import rawArticles from '../../../data/articles/articles.json'
import { buildPageMetadata, blogJsonLd, breadcrumbJsonLd } from '@/lib/seo'
import { formatDate } from '@/lib/blog-index'

export type ArticleReference = {
  title: string
  authors: string
  year: string
  pmid: string
  url: string
}

export type Article = {
  slug: string
  title: string
  description: string
  date: string | null
  updatedAt: string | null
  author: string
  keywords: string[]
  featuredImage: string
  tags: string[]
  readingTime: string
  content: string
  references: ArticleReference[]
  profile_status: string
  ai_assisted: boolean
}

const allArticles = rawArticles as Article[]

type ArticleRouteParams = Promise<{ slug: string }>

export function generateStaticParams() {
  return allArticles.map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: { params: ArticleRouteParams }) {
  const { slug } = await params
  const article = allArticles.find((a) => a.slug === slug)
  if (!article) return {}

  return buildPageMetadata({
    title: article.title,
    description: article.description || 'An evidence-based article from The Hippie Scientist.',
    path: `/articles/${slug}`,
    openGraphType: 'article',
  })
}

// ─── Markdown body renderer ──────────────────────────────────────────────────

type Block =
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'h4'; text: string }
  | { type: 'blockquote'; text: string }
  | { type: 'hr' }
  | { type: 'ul'; items: string[] }
  | { type: 'p'; text: string }

function parseBlocks(raw: string): Block[] {
  const lines = raw.split('\n').map((l) => l.trim()).filter((l) => l !== '')
  const blocks: Block[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (line.startsWith('# ')) { i++; continue }
    if (line.startsWith('#### ')) { blocks.push({ type: 'h4', text: line.slice(5) }); i++; continue }
    if (line.startsWith('### ')) { blocks.push({ type: 'h3', text: line.slice(4) }); i++; continue }
    if (line.startsWith('## ')) { blocks.push({ type: 'h2', text: line.slice(3) }); i++; continue }
    if (line.startsWith('> ')) { blocks.push({ type: 'blockquote', text: line.slice(2) }); i++; continue }
    if (line === '---') { blocks.push({ type: 'hr' }); i++; continue }

    if (line.startsWith('- ') || line.startsWith('* ')) {
      const items: string[] = []
      while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* '))) {
        items.push(lines[i].slice(2))
        i++
      }
      blocks.push({ type: 'ul', items })
      continue
    }

    blocks.push({ type: 'p', text: line })
    i++
  }

  return blocks
}

function inlineFormat(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/_(.+?)_/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code class="rounded bg-brand-50 px-1 py-0.5 font-mono text-sm text-brand-800">$1</code>')
}

function ArticleBody({ content }: { content: string }) {
  const blocks = parseBlocks(content)

  return (
    <div className="space-y-4">
      {blocks.map((block, i) => {
        if (block.type === 'h2') {
          return (
            <h2
              key={i}
              id={block.text.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
              className="mt-10 mb-2 max-w-2xl text-2xl font-semibold tracking-tight text-ink first:mt-0"
              dangerouslySetInnerHTML={{ __html: inlineFormat(block.text) }}
            />
          )
        }
        if (block.type === 'h3') {
          return (
            <h3
              key={i}
              className="mt-6 mb-1 text-xl font-semibold tracking-tight text-ink"
              dangerouslySetInnerHTML={{ __html: inlineFormat(block.text) }}
            />
          )
        }
        if (block.type === 'h4') {
          return (
            <h4
              key={i}
              className="mt-4 mb-1 text-base font-semibold text-ink"
              dangerouslySetInnerHTML={{ __html: inlineFormat(block.text) }}
            />
          )
        }
        if (block.type === 'blockquote') {
          return (
            <blockquote
              key={i}
              className="my-4 border-l-4 border-brand-700/40 bg-brand-50/60 py-3 pl-5 pr-4 text-sm leading-7 text-brand-900/80 italic rounded-r-lg"
              dangerouslySetInnerHTML={{ __html: inlineFormat(block.text) }}
            />
          )
        }
        if (block.type === 'hr') {
          return <hr key={i} className="my-6 border-brand-900/10" />
        }
        if (block.type === 'ul') {
          return (
            <ul key={i} className="ml-5 space-y-1.5 list-disc">
              {block.items.map((item, j) => (
                <li
                  key={j}
                  className="text-[1.01rem] leading-7 text-[#46574d]"
                  dangerouslySetInnerHTML={{ __html: inlineFormat(item) }}
                />
              ))}
            </ul>
          )
        }
        return (
          <p
            key={i}
            className="text-[1.01rem] leading-[1.85] text-[#46574d]"
            dangerouslySetInnerHTML={{ __html: inlineFormat(block.text) }}
          />
        )
      })}
    </div>
  )
}

// ─── References table ────────────────────────────────────────────────────────

function ReferencesTable({ refs }: { refs: ArticleReference[] }) {
  if (!refs.length) return null

  return (
    <section className="mt-10 rounded-[1rem] border border-brand-900/10 bg-white/90 p-5 shadow-sm sm:p-6">
      <h2 className="mb-4 text-lg font-semibold tracking-tight text-ink">References</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-900/10">
              <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">#</th>
              <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">Study</th>
              <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">Authors</th>
              <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">Year</th>
              <th className="pb-2 text-left text-xs font-bold uppercase tracking-wider text-muted">Link</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-900/5">
            {refs.map((ref, i) => (
              <tr key={i} className="align-top">
                <td className="py-3 pr-4 text-muted">{i + 1}</td>
                <td className="py-3 pr-4 leading-6 text-ink">{ref.title}</td>
                <td className="py-3 pr-4 text-muted">{ref.authors}</td>
                <td className="py-3 pr-4 text-muted">{ref.year}</td>
                <td className="py-3">
                  {ref.url ? (
                    <a
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-brand-700 hover:text-brand-800 hover:underline"
                    >
                      {ref.pmid ? `PMID ${ref.pmid}` : 'View'}
                    </a>
                  ) : ref.pmid ? (
                    <a
                      href={`https://pubmed.ncbi.nlm.nih.gov/${ref.pmid}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-brand-700 hover:text-brand-800 hover:underline"
                    >
                      PMID {ref.pmid}
                    </a>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function ArticlePage({ params }: { params: ArticleRouteParams }) {
  const { slug } = await params
  const article = allArticles.find((a) => a.slug === slug)
  if (!article) return notFound()

  const pageBreadcrumb = breadcrumbJsonLd([
    { name: 'Articles', url: 'https://thehippiescientist.net/research-notes' },
    { name: article.title, url: `https://thehippiescientist.net/articles/${article.slug}` },
  ])

  const articleLd = blogJsonLd({
    title: article.title,
    slug: article.slug,
    date: article.date || '2026-01-01',
    excerpt: article.description,
  }, `/articles/${article.slug}`)

  return (
    <article className="mx-auto max-w-5xl space-y-0 px-4 pb-20 pt-6 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageBreadcrumb) }}
      />

      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted">
        <Link href="/research-notes" className="transition hover:text-ink">Articles</Link>
        <span>/</span>
        <span className="text-ink line-clamp-1">{article.title}</span>
      </nav>

      {/* Hero */}
      <section className="rounded-[1.5rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8 lg:p-10">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full border border-brand-900/10 bg-brand-50 px-2.5 py-0.5 font-bold uppercase tracking-wider text-brand-800">
            Deep Dive
          </span>
          {article.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="rounded-full border border-brand-900/10 bg-white px-2.5 py-0.5 font-semibold text-muted capitalize">
              {tag}
            </span>
          ))}
          <span className="text-muted">{formatDate(article.date ?? undefined)}</span>
          <span className="text-muted">·</span>
          <span className="text-muted">{article.readingTime}</span>
        </div>

        <h1 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl lg:text-5xl">
          {article.title}
        </h1>

        <p className="mt-2 text-sm text-muted">
          By{' '}
          <a href="/about" rel="author" className="font-medium text-ink hover:underline">
            {article.author}
          </a>
        </p>

        {article.description && (
          <p className="mt-4 max-w-3xl text-base leading-7 text-[#46574d]">
            {article.description}
          </p>
        )}

        {article.featuredImage && (
          <div className="mt-6 overflow-hidden rounded-xl border border-brand-900/10">
            <Image
              src={article.featuredImage}
              alt={article.title}
              width={1200}
              height={630}
              className="w-full object-cover"
              priority
            />
          </div>
        )}
      </section>

      {/* Body + sidebar */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_240px]">
        <section className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8">
          {article.ai_assisted && (
            <div className="mb-6 rounded-xl border border-emerald-100 bg-emerald-50/50 px-4 py-3 text-xs text-emerald-800 leading-5">
              This article was drafted with AI assistance and reviewed for accuracy. Report errors via our{' '}
              <Link href="/contact/" className="font-semibold underline hover:text-emerald-900">contact page</Link>.
            </div>
          )}
          <ArticleBody content={article.content} />
          <ReferencesTable refs={article.references} />
        </section>

        {/* Sidebar */}
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Reading guide</p>
            <ul className="mt-3 space-y-2.5 text-sm leading-6 text-[#46574d]">
              <li>Mechanisms provide context — not proof of efficacy.</li>
              <li>Check safety sections before practical use.</li>
              <li>References link to peer-reviewed sources; PMID = PubMed.</li>
            </ul>
          </div>

          {article.references.length > 0 && (
            <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
                {article.references.length} reference{article.references.length !== 1 ? 's' : ''}
              </p>
              <ul className="mt-3 space-y-2">
                {article.references.map((ref, i) => (
                  <li key={i} className="text-xs leading-5">
                    <span className="mr-1.5 font-bold text-brand-700">{i + 1}.</span>
                    {ref.url ? (
                      <a
                        href={ref.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#46574d] hover:text-brand-700 hover:underline"
                      >
                        {ref.title.length > 60 ? `${ref.title.slice(0, 60)}…` : ref.title}
                      </a>
                    ) : (
                      <span className="text-[#46574d]">{ref.title.length > 60 ? `${ref.title.slice(0, 60)}…` : ref.title}</span>
                    )}
                    {ref.year && <span className="ml-1 text-muted">({ref.year})</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Explore more</p>
            <div className="mt-3 space-y-2">
              <Link href="/goals" className="block text-sm font-medium text-brand-700 hover:text-brand-800">
                Evidence Reviews →
              </Link>
              <Link href="/herbs" className="block text-sm font-medium text-brand-700 hover:text-brand-800">
                Herb Profiles →
              </Link>
              <Link href="/research-notes" className="block text-sm font-medium text-brand-700 hover:text-brand-800">
                Research Notes →
              </Link>
            </div>
          </div>
        </aside>
      </div>

      {/* Back link */}
      <div className="mt-8">
        <Link href="/research-notes" className="text-sm font-semibold text-brand-700 hover:text-brand-800">
          ← Back to Articles
        </Link>
      </div>
    </article>
  )
}
