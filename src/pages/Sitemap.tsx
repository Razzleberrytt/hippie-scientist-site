import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import Meta from '../components/Meta'
import { useHerbData } from '@/lib/herb-data'

let blogPosts: { title: string; slug: string }[] = []
try {
  blogPosts = require('../data/blog/posts.json')
} catch (_) {
  /* ignore if not present */
}

export default function Sitemap() {
  const herbs = useHerbData()
  const herbLinks = useMemo(() => {
    const sl = (s: string) =>
      s
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
    return (herbs || []).map(h => ({
      name: h.common || h.scientific,
      path: `/herb/${sl(h.common || h.scientific || '')}`,
    }))
  }, [herbs])

  return (
    <>
      <Meta
        title='HTML Sitemap — The Hippie Scientist'
        description='Explore every page, herb, and post on The Hippie Scientist.'
        path='/sitemap'
        noindex
      />
      <main className='container mx-auto space-y-8 px-4 py-10'>
        <h1 className='h1 bg-gradient-to-r from-lime-300 via-cyan-300 to-pink-400 bg-clip-text text-transparent'>
          HTML Sitemap
        </h1>
        <section>
          <h2 className='mb-2 font-semibold text-white/85'>Core Pages</h2>
          <ul className='list-inside list-disc space-y-1 text-white/70'>
            <li>
              <Link className='underline' to='/'>
                Home
              </Link>
            </li>
            <li>
              <Link className='underline' to='/herbs'>
                Herb Database
              </Link>
            </li>
            <li>
              <Link className='underline' to='/compounds'>
                Compounds
              </Link>
            </li>
            <li>
              <Link className='underline' to='/blog'>
                Blog
              </Link>
            </li>
            <li>
              <Link className='underline' to='/about'>
                About
              </Link>
            </li>
            <li>
              <Link className='underline' to='/privacy'>
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link className='underline' to='/disclaimer'>
                Disclaimer
              </Link>
            </li>
            <li>
              <Link className='underline' to='/contact'>
                Contact
              </Link>
            </li>
          </ul>
        </section>

        {blogPosts.length > 0 && (
          <section>
            <h2 className='mb-2 font-semibold text-white/85'>Blog Posts</h2>
            <ul className='list-inside list-disc space-y-1 text-white/70'>
              {blogPosts.map((p, i) => (
                <li key={i}>
                  <Link className='underline' to={`/blog/${p.slug}/`}>
                    {p.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section>
          <h2 className='mb-2 font-semibold text-white/85'>Herbs</h2>
          <ul className='grid gap-y-1 text-white/70 sm:grid-cols-2 md:grid-cols-3'>
            {herbLinks.map((h, i) => (
              <li key={i}>
                <Link className='underline' to={h.path}>
                  {h.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </>
  )
}
