import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { allArticleMonographs, allBlogPosts } from '../../.content-collections/generated'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import EditorialFamilyNav from '@/components/navigation/EditorialFamilyNav'
import { SITE_URL, buildTwitterMetadata } from '../../lib/seo'

const articlePages = [...allArticleMonographs, ...allBlogPosts].sort((a, b) =>
  b.lastUpdated.localeCompare(a.lastUpdated)
)

const latestArticles = articlePages.slice(0, 6)

function normalizeArticleCategory(category?: string) {
  const raw = category?.trim() || 'Other'
  const key = raw.toLocaleLowerCase()
  const label = raw === key
    ? raw.replace(/\b\w/g, (character) => character.toUpperCase())
    : raw
  return { key, label }
}

const articleGroups = Object.values(
  articlePages.reduce<Record<string, { label: string; pages: typeof articlePages }>>((groups, page) => {
    const { key, label } = normalizeArticleCategory(page.category)
    if (!groups[key]) groups[key] = { label, pages: [] }
    groups[key].pages.push(page)
    return groups
  }, {})
).sort((a, b) => a.label.localeCompare(b.label))

export const metadata: Metadata = {
  title: 'Articles — Research Notes & Evidence Reviews',
  description:
    'Research notes, evidence reviews, regulatory updates, and editorial deep dives on herbs, compounds, and emerging psychoactive substances.',
  alternates: { canonical: `${SITE_URL}/articles/` },
  openGraph: {
    title: 'Articles — Research Notes & Evidence Reviews',
    description:
      'Research notes, evidence reviews, regulatory updates, and editorial deep dives on herbs, compounds, and emerging psychoactive substances.',
    type: 'website',
    url: `${SITE_URL}/articles/`,
    images: ['/og-default.jpg'],
  },
  twitter: buildTwitterMetadata({
    title: 'Articles — Research Notes & Evidence Reviews',
    description: 'Research notes, evidence reviews, regulatory updates, and editorial deep dives on herbs, compounds, and emerging psychoactive substances.',
  }),
}

export default function ArticlesIndexPage() {
  return (
    <div className='mx-auto max-w-6xl space-y-8 px-4 pb-24 pt-4 sm:pt-6'>
      <Breadcrumbs items={[{ href: '/', label: 'Home' }, { label: 'Articles' }]} />

      <header className='hero-shell rounded-[2rem] border px-5 py-6 sm:p-8'>
        <p className='eyebrow-label'>Editorial library · Research and reading</p>
        <h1 className='heading-premium mt-5 max-w-4xl'>Articles</h1>
        <p className='text-reading mt-4 max-w-3xl'>
          Read research notes, evidence reviews, regulatory updates, and editorial deep dives. Guides are for decisions; Learn is for concepts; Articles are for deeper reading.
        </p>
      </header>

      <EditorialFamilyNav active='articles' />

      <section aria-labelledby='latest-articles-heading'>
        <div className='flex flex-wrap items-end justify-between gap-3'>
          <div>
            <p className='eyebrow-label'>Latest</p>
            <h2 id='latest-articles-heading' className='mt-2 text-3xl font-semibold tracking-tight text-ink'>
              Recent articles
            </h2>
          </div>
          <p className='text-sm text-muted'>{articlePages.length} published pieces</p>
        </div>

        <div className='mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {latestArticles.map((page) => (
            <Link key={page.slug} href={page.url} className='card-premium group flex min-h-[12rem] flex-col p-5'>
              <div className='flex flex-wrap items-center gap-2 text-xs text-muted'>
                <span className='font-semibold uppercase tracking-[0.08em]'>{page.category}</span>
                <time dateTime={page.lastUpdated}>{page.lastUpdated}</time>
              </div>
              <h3 className='mt-3 text-lg font-semibold leading-snug text-ink'>{page.title}</h3>
              <p className='mt-2 line-clamp-2 text-sm leading-6 text-muted'>{page.description}</p>
              <span className='mt-auto inline-flex items-center gap-2 pt-4 text-sm font-bold text-brand-700'>
                Read article
                <ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-1' aria-hidden='true' />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby='article-archive-heading'>
        <div className='max-w-3xl'>
          <p className='eyebrow-label'>Full archive</p>
          <h2 id='article-archive-heading' className='mt-2 text-3xl font-semibold tracking-tight text-ink'>
            Browse by category
          </h2>
          <p className='mt-2 text-sm leading-6 text-muted'>
            The complete archive stays here, but categories expand only when you need them instead of rendering every article as a full card.
          </p>
        </div>

        <div className='mt-5 grid gap-3 md:grid-cols-2'>
          {articleGroups.map(({ label, pages }) => (
            <details key={label.toLocaleLowerCase()} className='rounded-2xl border border-brand-900/10 bg-white p-5 shadow-sm'>
              <summary className='cursor-pointer font-semibold text-ink'>
                {label} <span className='font-normal text-muted'>({pages.length})</span>
              </summary>
              <div className='mt-4 space-y-2'>
                {pages.map((page) => (
                  <Link key={page.slug} href={page.url} className='block rounded-lg px-2 py-2 text-sm text-brand-800 transition hover:bg-brand-50/50'>
                    <span className='font-medium'>{page.title}</span>
                    <span className='ml-2 text-xs text-muted'>{page.lastUpdated}</span>
                  </Link>
                ))}
              </div>
            </details>
          ))}
        </div>
      </section>
    </div>
  )
}
