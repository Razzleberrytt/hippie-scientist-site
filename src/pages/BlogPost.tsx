import React, { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import DOMPurify from 'dompurify'
import { cleanBlogExcerpt, ensureTrailingSlash, resolveBlogIndexUrl } from '@/lib/blog'
import { useHerbData } from '@/lib/herb-data'
import { decorateCompounds } from '@/lib/compounds'
import { normalizeScientificTags } from '@/lib/tags'
import { trackEvent, useSavedItems } from '@/lib/growth'

type PostMeta = {
  slug: string
  title: string
  date: string
  description?: string
  summary?: string
  tags?: string[]
  readingTime?: string
}

const compounds = decorateCompounds()

export default function BlogPost() {
  const { slug = '' } = useParams()
  const herbs = useHerbData()
  const [meta, setMeta] = useState<PostMeta | null>(null)
  const [html, setHtml] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const base = useMemo(() => ensureTrailingSlash(import.meta.env.BASE_URL || '/'), [])
  const indexUrl = useMemo(() => resolveBlogIndexUrl(base), [base])
  const { toggle, isSaved } = useSavedItems()

  useEffect(() => {
    let alive = true
    async function load() {
      setLoading(true)
      setError('')
      setMeta(null)
      setHtml('')
      try {
        const idx = await fetch(indexUrl, { cache: 'no-cache' }).then(r => r.json())
        const m = idx.find((p: PostMeta) => p.slug === slug) ?? null
        if (alive) setMeta(m)

        const h = await fetch(`${base}blogdata/posts/${slug}.html`, { cache: 'no-cache' })
        if (!h.ok) throw new Error(`Post HTML not found: ${slug}`)
        const text = await h.text()
        if (alive) setHtml(text)
      } catch (e: any) {
        if (alive) setError(e.message || 'Failed to load post.')
      } finally {
        if (alive) setLoading(false)
      }
    }
    load()
    return () => {
      alive = false
    }
  }, [slug, base, indexUrl])

  const relatedHerbs = useMemo(() => {
    const tags = normalizeScientificTags(meta?.tags || [])
    return herbs
      .filter(item => item.tags?.some(tag => tags.includes((tag || '').toLowerCase())))
      .slice(0, 3)
  }, [meta?.tags, herbs])

  const relatedCompounds = useMemo(() => {
    const tags = normalizeScientificTags(meta?.tags || [])
    return compounds
      .filter(item =>
        item.tags?.some(tag =>
          tags.includes(
            tag
              .toLowerCase()
              .replace(/^[^a-z0-9]+/i, '')
              .trim()
          )
        )
      )
      .slice(0, 3)
  }, [meta?.tags])

  if (loading) {
    return <main className='container-page py-7 text-white/75 sm:py-8'>Loading post…</main>
  }

  if (error || (!meta && !html)) {
    return (
      <main className='container-page py-7 sm:py-8'>
        <section className='glass-elev rounded-3xl p-6 sm:p-8'>
          <p className='text-sm uppercase tracking-[0.14em] text-white/60'>Not Found</p>
          <h1 className='mt-2 text-2xl font-semibold text-white'>Blog post not found</h1>
          <p className='mt-3 text-white/75'>
            {error || 'We could not find that post. It may have moved or the slug is incorrect.'}
          </p>
          <Link to='/blog' className='btn-primary mt-5 inline-flex'>
            ← Back to blog
          </Link>
        </section>
      </main>
    )
  }

  return (
    <main className='container-page py-7 sm:py-8'>
      <div className='mb-4'>
        <Link to='/blog' className='btn-secondary inline-flex items-center gap-2 rounded-full px-4'>
          ← Back to Blog
        </Link>
      </div>

      <header className='ds-card-lg mb-8 space-y-4'>
        <h1 className='text-3xl font-semibold tracking-tight text-white sm:text-4xl'>
          {meta?.title || 'Loading…'}
        </h1>

        <div className='flex flex-wrap items-center gap-2 text-sm text-white/65'>
          {meta?.date && <time dateTime={meta.date}>{formatDate(meta.date)}</time>}
          {meta?.readingTime && <span>• {meta.readingTime}</span>}
          <span>• {resolvePostType(meta?.tags || [])}</span>
        </div>

        <section className='rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5'>
          <h2 className='text-sm font-semibold uppercase tracking-[0.14em] text-white/70'>
            Summary
          </h2>
          <p className='mt-2 text-sm leading-7 text-white/80'>
            {cleanBlogExcerpt(meta?.summary, meta?.description)}
          </p>
        </section>
        {meta?.slug && (
          <button
            className='w-fit rounded-full border border-white/20 px-3 py-1 text-sm text-white/85'
            onClick={() =>
              toggle({
                type: 'article',
                slug: meta.slug,
                title: meta.title,
                href: `/blog/${meta.slug}`,
                note: cleanBlogExcerpt(meta.summary, meta.description),
              })
            }
          >
            {isSaved('article', meta.slug) ? '★ Favorited' : '☆ Favorite'}
          </button>
        )}
      </header>

      <section className='mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <InfoBlock
          title='Research Digest'
          body='Mechanisms, evidence quality, and confidence boundaries from available studies.'
        />
        <InfoBlock
          title='Field Notes'
          body='Applied context on dose framing, preparation, and user-reported patterns.'
        />
        <InfoBlock
          title='Traditional Context'
          body='Ethnobotanical usage where documented, with caution around over-generalization.'
        />
        <InfoBlock
          title='Safety Notes'
          body='Contraindications, interaction flags, and uncertainty markers when direct evidence is limited.'
        />
      </section>

      <article
        className='prose prose-invert prose-headings:scroll-mt-24 prose-headings:mt-10 prose-headings:text-white prose-p:text-white/85 prose-p:leading-8 prose-a:text-accent-200 hover:prose-a:text-accent-100 prose-blockquote:border-l-white/30 prose-blockquote:text-white/70 prose-strong:text-white prose-code:text-pink-300 prose-pre:bg-black/60 prose-li:marker:text-white/50 prose-li:my-1 prose-img:rounded-xl max-w-none'
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(html, { USE_PROFILES: { html: true } }),
        }}
      />

      <section className='mt-8 rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6'>
        <h2 className='text-lg font-semibold text-white'>Explore Next</h2>
        <div className='mt-4 grid gap-5 sm:grid-cols-2'>
          <div>
            <h3 className='text-sm font-semibold uppercase tracking-wide text-white/70'>
              Related Herbs
            </h3>
            <ul className='mt-2 space-y-2 text-sm text-white/80'>
              {relatedHerbs.length ? (
                relatedHerbs.map(item => (
                  <li key={item.slug}>
                    <Link className='link text-[color:var(--accent)]' to={`/herbs/${item.slug}`}>
                      {item.common || item.scientific || item.slug}
                    </Link>
                  </li>
                ))
              ) : (
                <li>
                  <Link className='link text-[color:var(--accent)]' to='/herbs'>
                    Browse herb database
                  </Link>
                </li>
              )}
            </ul>
          </div>
          <div>
            <h3 className='text-sm font-semibold uppercase tracking-wide text-white/70'>
              Related Compounds
            </h3>
            <ul className='mt-2 space-y-2 text-sm text-white/80'>
              {relatedCompounds.length ? (
                relatedCompounds.map(item => (
                  <li key={item.slug}>
                    <Link
                      className='link text-[color:var(--accent)]'
                      to={`/compounds/${item.slug}`}
                      onClick={() =>
                        trackEvent('detail_click', {
                          source: 'blog_explore_next',
                          target: `/compounds/${item.slug}`,
                        })
                      }
                    >
                      {item.name}
                    </Link>
                  </li>
                ))
              ) : (
                <li>
                  <Link className='link text-[color:var(--accent)]' to='/compounds'>
                    Browse compounds
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>
      </section>

      <footer className='mt-10 border-t border-white/10 pt-6'>
        <p className='text-xs text-white/50'>
          Educational research content only, not medical advice. Verify interactions and consult a
          qualified clinician before use.
        </p>
      </footer>
    </main>
  )
}

function resolvePostType(tags: string[]) {
  const joined = tags.join(' ').toLowerCase()
  if (/research|science|compound/.test(joined)) return 'Research Digest'
  if (/traditional|ethno|history/.test(joined)) return 'Traditional Context'
  if (/safety|risk/.test(joined)) return 'Safety Notes'
  return 'Field Notes'
}

function InfoBlock({ title, body }: { title: string; body: string }) {
  return (
    <div className='rounded-2xl border border-white/10 bg-white/5 p-4'>
      <h3 className='text-sm font-semibold uppercase tracking-wide text-white/70'>{title}</h3>
      <p className='mt-2 text-sm leading-7 text-white/75'>{body}</p>
    </div>
  )
}

function formatDate(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}
