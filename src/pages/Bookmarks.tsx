import React from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import CardShell from '../components/CardShell'
import { posts } from '../data/posts'
import { useFavorites } from '../hooks/useFavorites'

const Bookmarks: React.FC = () => {
  const { favorites, toggle } = useFavorites()
  const bookmarked = React.useMemo(() => posts.filter(p => favorites.includes(p.slug)), [favorites])

  if (bookmarked.length === 0) {
    return (
      <div className='mx-auto max-w-3xl px-6 py-12 text-center'>
        <Helmet>
          <title>Bookmarks - The Hippie Scientist</title>
        </Helmet>
        <p className='mb-4'>No bookmarks yet.</p>
        <Link to='/blog' className='text-comet underline'>
          Browse posts
        </Link>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>Bookmarks - The Hippie Scientist</title>
      </Helmet>
      <div className='mx-auto max-w-3xl space-y-6 px-6 py-12'>
        {bookmarked.map(post => (
          <CardShell key={post.id} className='hover:shadow-intense'>
            <div className='flex items-start justify-between gap-4'>
              <Link to={`/blog/${post.slug}`} className='flex-1 space-y-2'>
                <h2 className='text-gradient text-2xl font-bold'>{post.title}</h2>
                <p className='text-moss'>{post.excerpt}</p>
              </Link>
              <button
                type='button'
                onClick={() => toggle(post.slug)}
                aria-label='Remove bookmark'
                className='rounded-md p-1 text-sm text-rose-300 hover:underline'
              >
                Remove
              </button>
            </div>
          </CardShell>
        ))}
      </div>
    </>
  )
}

export default Bookmarks
