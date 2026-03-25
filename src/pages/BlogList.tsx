import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion, useReducedMotion } from '@/lib/motion'

import {
  cleanBlogExcerpt,
  paginateCollection,
  resolveBlogIndexUrl,
  sortPostsByDateDesc,
} from '@/lib/blog'
import { CTA } from '@/lib/cta'

type PostIndex = {
  author?: string | null
  sources?: Array<{ title?: string | null; url?: string | null; note?: string | null }>
  slug: string
  title: string
  date: string | null
  lastUpdated?: string | null
  description?: string | null
  summary?: string | null
  tags?: string[]
  readingTime?: string | null
  cover?: string | null
  featuredImage?: string | null
  image?: string | null
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
  const coverGradients = [
    'from-emerald-300/35 via-cyan-300/25 to-indigo-400/35',
    'from-violet-300/30 via-fuchsia-300/20 to-cyan-300/35',
    'from-lime-300/30 via-emerald-300/20 to-teal-300/35',
    'from-sky-300/30 via-blue-300/20 to-violet-300/30',
  ]

  return (
    <div className='container-page space-y-6 py-7 sm:py-8'>
      <header className='ds-card-lg space-y-3'>
        <h1 className='text-3xl font-semibold tracking-tight text-white sm:text-4xl'>{heading}</h1>
        <p className='max-w-2xl text-white/85'>
          Mechanism-focused notes with explicit uncertainty, safety framing, and practical
          interpretation.
        </p>
        <p className='text-xs text-white/70'>
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

      <div className='grid auto-rows-fr gap-4 md:grid-cols-2'>
        {pagination.items.map((post, index) => (
          <motion.article
            key={post.slug}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className='ds-card-lg flex h-full min-h-[25rem] flex-col space-y-3 text-white shadow-[var(--glow-lg)] transition-transform duration-300'
          >
            <div
              className={`relative h-32 w-full overflow-hidden rounded-xl bg-gradient-to-r sm:h-40 ${coverGradients[index % coverGradients.length]}`}
            >
              {resolvePostImage(post) ? (
                <img
                  src={resolvePostImage(post) || ''}
                  alt={`Cover image for ${post.title || 'blog post'}`}
                  className='h-full w-full object-cover opacity-85 transition-transform duration-500'
                />
              ) : null}
              <div className='absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent' />
            </div>
            <div className='flex flex-wrap items-center gap-2 text-xs text-white/85'>
              <span className='ds-pill bg-white/8'>{resolveCategory(post.tags)}</span>
              <time dateTime={post.date || undefined}>{formatDate(post.date || '')}</time>
              {post.readingTime && <span>• {post.readingTime}</span>}
            </div>
            <h2 className='min-h-[3.5rem] text-xl font-semibold tracking-tight sm:text-2xl'>
              <Link to={`/blog/${post.slug}`} className='hover:text-emerald-200'>
                {post.title || 'Research note'}
              </Link>
            </h2>
            <div className='flex-1 space-y-2'>
              <p className='line-clamp-3 max-w-3xl overflow-hidden text-sm leading-7 text-white/90 sm:text-base'>
                {cleanBlogExcerpt(post.summary, post.description)}
              </p>
              <p className='text-xs text-emerald-100'>
                By {post.author || 'Hippie Scientist Team'}
              </p>
            </div>
            <div className='pt-1'>
              <Link to={`/blog/${post.slug}`} className='btn-primary min-w-28 self-start'>
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

function resolvePostImage(post: PostIndex): string | null {
  return post.cover || post.featuredImage || post.image || null
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
