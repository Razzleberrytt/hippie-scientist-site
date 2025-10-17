import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'

import { paginateCollection, resolveBlogIndexUrl, sortPostsByDateDesc } from '@/lib/blog'

type PostIndex = {
  slug: string
  title: string
  date: string | null
  description?: string | null
  summary?: string | null
  tags?: string[]
  readingTime?: string | null
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
      if (currentPage !== 1) navigate('/blog/', { replace: true })
      return
    }
    if (!isValidPage && hasParam) {
      navigate('/blog/', { replace: true })
      return
    }
    if (currentPage !== pagination.page) {
      const target = pagination.page === 1 ? '/blog/' : `/blog/page/${pagination.page}`
      navigate(target, { replace: true })
    }
  }, [loading, posts.length, currentPage, pagination.page, isValidPage, hasParam, navigate])

  if (loading) return <div className='p-6 opacity-80'>Loading…</div>
  if (error) return <div className='p-6 opacity-80'>{error}</div>
  if (!posts.length) return <div className='p-6 opacity-80'>No posts yet.</div>

  const heading = pagination.page > 1 ? `Blog — Page ${pagination.page}` : 'Blog'
  const intro =
    'Daily notes, research digests, and herb craft. Fresh posts drop in chronological order.'

  return (
    <div className='container-page space-y-6 py-8'>
      <header className='space-y-3'>
        <h1 className='text-4xl font-extrabold tracking-tight'>{heading}</h1>
        <p className='max-w-2xl text-white/70'>{intro}</p>
      </header>

      <div className='space-y-6'>
        {pagination.items.map(p => (
          <motion.article
            key={p.slug}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className='glass-elev rounded-3xl p-5 text-white transition hover:translate-y-[-2px] hover:shadow-glow sm:p-6'
          >
            <h2 className='text-xl font-semibold tracking-tight sm:text-2xl'>
              <Link to={`/blog/${p.slug}/`} className='text-accent-200 hover:text-accent-100'>
                {p.title}
              </Link>
            </h2>
            <div className='mt-2 text-sm text-white/60'>
              <time dateTime={p.date || undefined}>{formatDate(p.date || '')}</time>
              {p.readingTime && <> • {p.readingTime}</>}
            </div>
            <p className='mt-3 text-white/80'>{p.summary || p.description}</p>
            <div className='mt-4'>
              <Link to={`/blog/${p.slug}/`} className='btn-primary'>
                Read post
              </Link>
            </div>
          </motion.article>
        ))}
      </div>

      <PaginationNav current={pagination.page} totalPages={pagination.totalPages} />
    </div>
  )
}

function PaginationNav({ current, totalPages }: { current: number; totalPages: number }) {
  if (totalPages <= 1) return null
  return (
    <nav
      aria-label='Blog pagination'
      className='flex flex-wrap items-center justify-center gap-2 pt-4'
    >
      {Array.from({ length: totalPages }).map((_, index) => {
        const pageNumber = index + 1
        const to = pageNumber === 1 ? '/blog/' : `/blog/page/${pageNumber}`
        const active = pageNumber === current
        return (
          <Link
            key={pageNumber}
            to={to}
            aria-current={active ? 'page' : undefined}
            className={`rounded-full border px-3 py-1.5 text-sm transition ${
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
