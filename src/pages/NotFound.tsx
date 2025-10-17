import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Meta from '../components/Meta'
import { useHerbData } from '@/lib/herb-data'

export default function NotFound() {
  const [q, setQ] = useState('')
  const data = useHerbData()
  const popular = useMemo(() => {
    const arr = (data || []).slice(0, 6)
    return arr.map(h => ({
      slug:
        h.slug ||
        (h.common || h.scientific || '')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, ''),
      title: h.common || h.scientific,
    }))
  }, [data])

  const results = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return []
    return (data || [])
      .filter(h => {
        const hay = [
          h.common,
          h.scientific,
          h.effects,
          (h.tags || []).join(' '),
          (h.compounds || []).join(' '),
        ]
          .join(' ')
          .toLowerCase()
        return hay.includes(s)
      })
      .slice(0, 10)
      .map(h => ({
        slug:
          h.slug ||
          (h.common || h.scientific || '')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, ''),
        title: h.common || h.scientific,
      }))
  }, [data, q])

  return (
    <>
      <Meta
        title='Page Not Found — The Hippie Scientist'
        description='That page does not exist. Try searching the herb index.'
        path='/404'
        noindex
      />
      <main className='container mx-auto space-y-6 px-4 py-10'>
        <header className='rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm'>
          <h1 className='bg-gradient-to-r from-lime-300 via-cyan-300 to-pink-400 bg-clip-text text-3xl font-extrabold text-transparent'>
            Page not found
          </h1>
          <p className='mt-2 text-white/75'>Let’s get you to the right herb or article.</p>

          <div className='mt-4 flex items-center gap-2'>
            <input
              className='w-full max-w-md rounded-lg border border-white/10 bg-white/10 px-3 py-2 placeholder-white/50'
              placeholder='Search herbs, compounds, effects…'
              value={q}
              onChange={e => setQ(e.target.value)}
              autoFocus
            />
          </div>

          {!!results.length && (
            <ul className='mt-3 grid gap-2 sm:grid-cols-2'>
              {results.map((r, i) => (
                <li key={i}>
                  <Link className='underline' to={`/herb/${encodeURIComponent(r.slug)}`}>
                    {r.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </header>

        <section>
          <h2 className='mb-2 font-semibold text-white/85'>Popular herbs</h2>
          <ul className='grid gap-3 sm:grid-cols-2 md:grid-cols-3'>
            {popular.map((p, i) => (
              <li key={i} className='rounded-xl border border-white/10 bg-white/[0.04] p-3'>
                <Link className='underline' to={`/herb/${encodeURIComponent(p.slug)}`}>
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <nav className='text-white/70'>
          <Link className='mr-4 underline' to='/herbs'>
            Browse database
          </Link>
          <Link className='mr-4 underline' to='/blog'>
            Read the blog
          </Link>
          <Link className='underline' to='/'>
            Go home
          </Link>
        </nav>
      </main>
    </>
  )
}
