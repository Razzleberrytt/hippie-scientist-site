import React, { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import DOMPurify from 'dompurify'
import { ensureTrailingSlash, resolveBlogIndexUrl } from '@/lib/blog'
import { useHerbData } from '@/lib/herb-data'
import { decorateCompounds } from '@/lib/compounds'
import { normalizeScientificTags } from '@/lib/tags'

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
  const base = useMemo(() => ensureTrailingSlash(import.meta.env.BASE_URL || '/'), [])
  const indexUrl = useMemo(() => resolveBlogIndexUrl(base), [base])

  useEffect(() => {
    let alive = true
    async function load() {
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

  if (error) {
    return (
      <main className='container-page py-8'>
        <p className='text-red-400'>{error}</p>
        <a className='underline' href='/blog'>
          ← Back to blog
        </a>
      </main>
    )
  }

  return (
    <main className='container-page py-8'>
      <header className='glass-elev mb-8 rounded-3xl p-6 sm:p-8'>
        <a href='/blog' className='text-accent-300 hover:text-accent-200 text-sm'>
          ← Back to Blog
        </a>
        <h1 className='mt-2 text-4xl font-extrabold tracking-tight text-white'>
          {meta?.title || 'Loading…'}
        </h1>

        <div className='mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-white/60'>
          {meta?.date && <time dateTime={meta.date}>{formatDate(meta.date)}</time>}
          {meta?.readingTime && <span aria-hidden='true'>•</span>}
          {meta?.readingTime && <span>{meta.readingTime}</span>}
          {meta?.tags?.length ? (
            <>
              <span aria-hidden='true'>•</span>
              <ul className='flex flex-wrap gap-2'>
                {normalizeScientificTags(meta.tags).map(t => (
                  <li key={t} className='pill bg-white/10 text-[12px] text-white/70'>
                    {t}
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </div>

        <section className='mt-5 rounded-2xl border border-white/10 bg-white/5 p-4'>
          <h2 className='text-sm font-semibold uppercase tracking-[0.14em] text-white/70'>
            Summary
          </h2>
          <p className='mt-2 text-sm leading-7 text-white/80'>
            {meta?.summary ||
              meta?.description ||
              'A grounded research note focused on practical interpretation and scientific context.'}
          </p>
        </section>
      </header>

      <section className='mb-6 grid gap-4 sm:grid-cols-3'>
        <div className='rounded-2xl border border-white/10 bg-white/5 p-4'>
          <h3 className='text-sm font-semibold uppercase tracking-wide text-white/70'>
            Research Digest
          </h3>
          <p className='mt-2 text-sm leading-7 text-white/75'>
            Highlights from mechanism-level and evidence-focused discussion.
          </p>
        </div>
        <div className='rounded-2xl border border-white/10 bg-white/5 p-4'>
          <h3 className='text-sm font-semibold uppercase tracking-wide text-white/70'>
            Field Notes
          </h3>
          <p className='mt-2 text-sm leading-7 text-white/75'>
            Practical framing for context, preparation, and use conditions.
          </p>
        </div>
        <div className='rounded-2xl border border-white/10 bg-white/5 p-4'>
          <h3 className='text-sm font-semibold uppercase tracking-wide text-white/70'>
            Traditional Insights
          </h3>
          <p className='mt-2 text-sm leading-7 text-white/75'>
            Cultural and historical framing where relevant.
          </p>
        </div>
      </section>

      <article
        className='prose prose-invert prose-headings:scroll-mt-24 prose-headings:text-white prose-p:text-white/85 prose-a:text-accent-200 hover:prose-a:text-accent-100 prose-blockquote:border-l-white/30 prose-blockquote:text-white/70 prose-strong:text-white prose-code:text-pink-300 prose-pre:bg-black/60 prose-li:marker:text-white/50 prose-img:rounded-xl max-w-none leading-8'
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(html, { USE_PROFILES: { html: true } }),
        }}
      />

      <section className='mt-8 rounded-3xl border border-white/10 bg-white/5 p-6'>
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
                    <Link className='link text-[color:var(--accent)]' to={`/herb/${item.slug}`}>
                      {item.common || item.scientific || item.slug}
                    </Link>
                  </li>
                ))
              ) : (
                <li className='text-white/60'>No direct herb links available.</li>
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
                    >
                      {item.name}
                    </Link>
                  </li>
                ))
              ) : (
                <li className='text-white/60'>No direct compound links available.</li>
              )}
            </ul>
          </div>
        </div>
      </section>

      <footer className='mt-10 border-t border-white/10 pt-6'>
        <p className='text-xs text-white/50'>
          Educational content only. Not medical advice. Consult a qualified professional before use.
        </p>
      </footer>
    </main>
  )
}

function formatDate(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}
