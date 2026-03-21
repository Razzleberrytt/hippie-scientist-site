import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'

import {
  cleanBlogExcerpt,
  paginateCollection,
  resolveBlogIndexUrl,
  sortPostsByDateDesc,
} from '@/lib/blog'
import { CTA } from '@/lib/cta'

type PostIndex = {
  slug: string
  title: string
  date: string | null
  lastUpdated?: string | null
  description?: string | null
  summary?: string | null
  tags?: string[]
  readingTime?: string | null
  cover?: string | null
}

const PER_PAGE = 12

export default function BlogList() {
  const { page: pageParam } = useParams<{ page?: string }>()
  const navigate = useNavigate()
  const reduceMotion = useReducedMotion()
  const [posts, setPosts] = useState<PostIndex[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const indexUrl = useMemo(() => resolveBlogIndexUrl(import.meta.env.BASE_URL || '/'), [])

  const requestedPage = Number.parseInt(pageParam ?? '1', 10)
  const hasParam = typeof pageParam !== 'undefined'
  const isValidPage = Number.isFinite(requestedPage) && requestedPage > 0
  const currentPage = isValidPage ? requestedPage : 1

  useEffect(() => {
    let alive = true
    setLoading(true)
    setError(null)
    fetch(indexUrl, { cache: 'no-store' })
      .then(r => (r.ok ? r.json() : []))
      .then(data => {
        if (!alive) return
        const rows = Array.isArray(data) ? data : []
        setPosts(sortPostsByDateDesc(rows))
      })
      .catch(() => {
        if (!alive) return
        setPosts([])
        setError('Failed to load blog posts.')
      })
      .finally(() => {
        if (!alive) return
        setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [indexUrl])

  const pagination = useMemo(
    () => paginateCollection(posts, currentPage, PER_PAGE),
    [posts, currentPage]
  )

  useEffect(() => {
    if (loading) return
    if (!posts.length) {
      if (currentPage !== 1) navigate('/blog', { replace: true })
      return
    }
    if (!isValidPage && hasParam) {
      navigate('/blog', { replace: true })
      return
    }
    if (currentPage !== pagination.page) {
      const target = pagination.page === 1 ? '/blog' : `/blog/page/${pagination.page}`
      navigate(target, { replace: true })
    }
  }, [loading, posts.length, currentPage, pagination.page, isValidPage, hasParam, navigate])

  if (loading) return <div className='container-page py-8 opacity-80'>Loading…</div>
  if (error) return <div className='container-page py-8 opacity-80'>{error}</div>
  if (!posts.length) return <div className='container-page py-8 opacity-80'>No posts yet.</div>

  const heading =
    pagination.page > 1 ? `Research Notebook — Page ${pagination.page}` : 'Research Notebook'
  const series = buildSeriesBuckets(posts)

  return (
    <div className='container-page space-y-6 py-7 sm:py-8'>
      <header className='ds-card-lg space-y-3'>
        <h1 className='text-3xl font-semibold tracking-tight text-white sm:text-4xl'>{heading}</h1>
        <p className='text-white/72 max-w-2xl'>
          Mechanism-focused notes with explicit uncertainty, safety framing, and practical
          interpretation.
        </p>
        <p className='text-xs text-white/60'>
          Educational use only. Posts summarize available evidence and may include unresolved gaps.
        </p>
        <div className='flex flex-wrap gap-2'>
          {series.slice(0, 5).map(item => (
            <span key={item.label} className='ds-pill'>
              {item.label} · {item.count}
            </span>
          ))}
        </div>
      </header>

      <div className='grid gap-4 md:grid-cols-2'>
        {pagination.items.map(post => (
          <motion.article
            key={post.slug}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className='ds-card-lg flex h-full flex-col space-y-3 text-white'
          >
            <div className='h-24 w-full overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500/20 via-indigo-500/20 to-fuchsia-500/20'>
              {post.cover ? (
                <img
                  src={post.cover}
                  alt=''
                  aria-hidden
                  className='h-full w-full object-cover opacity-75'
                />
              ) : null}
            </div>
            <div className='flex flex-wrap items-center gap-2 text-xs text-white/70'>
              <span className='ds-pill bg-white/8'>{resolveCategory(post.tags)}</span>
              <time dateTime={post.date || undefined}>{formatDate(post.date || '')}</time>
              {post.lastUpdated && <span>• Updated {formatDate(post.lastUpdated)}</span>}
              {post.readingTime && <span>• {post.readingTime}</span>}
            </div>
            <h2 className='text-xl font-semibold tracking-tight sm:text-2xl'>
              <Link to={`/blog/${post.slug}`} className='hover:text-emerald-200'>
                {post.title || 'Research note'}
              </Link>
            </h2>
            <p className='max-w-3xl flex-1 overflow-hidden text-sm leading-7 text-white/80 sm:text-base'>
              {cleanBlogExcerpt(post.summary, post.description)}
            </p>
            <p className='text-xs text-emerald-100/85'>
              Targets keyword: {deriveKeyword(post.title)} · Answers: {deriveQuestion(post.title)}
            </p>
            <div>
              <Link to={`/blog/${post.slug}`} className='btn-primary min-w-28'>
                {CTA.primary.learn}
              </Link>
            </div>
          </motion.article>
        ))}
      </div>

      <PaginationNav current={pagination.page} totalPages={pagination.totalPages} />
    </div>
  )
}

function buildSeriesBuckets(posts: PostIndex[]) {
  const counts = new Map<string, number>()
  posts.forEach(post => {
    const label = resolveCategory(post.tags)
    counts.set(label, (counts.get(label) || 0) + 1)
  })
  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
}

function deriveKeyword(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 4)
    .join(' ')
}

function deriveQuestion(title: string) {
  return `What is ${title.toLowerCase()}?`
}

function resolveCategory(tags?: string[]) {
  const joined = (tags || []).join(' ').toLowerCase()
  if (/research|compound|science/.test(joined)) return 'Research Digest'
  if (/traditional|culture|ethno/.test(joined)) return 'Traditional Context'
  if (/safety/.test(joined)) return 'Safety Notes'
  return 'Field Notes'
}

function PaginationNav({ current, totalPages }: { current: number; totalPages: number }) {
  if (totalPages <= 1) return null
  return (
    <nav
      aria-label='Blog pagination'
      className='flex flex-wrap items-center justify-center gap-2 pb-2 pt-4'
    >
      {Array.from({ length: totalPages }).map((_, index) => {
        const pageNumber = index + 1
        const to = pageNumber === 1 ? '/blog' : `/blog/page/${pageNumber}`
        const active = pageNumber === current
        return (
          <Link
            key={pageNumber}
            to={to}
            aria-current={active ? 'page' : undefined}
            className={`inline-flex min-h-11 items-center rounded-full border px-4 text-sm transition ${
              active
                ? 'border-white/30 bg-white/15 text-white'
                : 'border-white/10 bg-white/5 text-white/80 hover:bg-white/10'
            }`}
          >
            {pageNumber}
          </Link>
        )
      })}
    </nav>
  )
}

function formatDate(iso: string) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}
