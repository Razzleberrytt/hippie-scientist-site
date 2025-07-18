import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import PanelWrapper from '../components/PanelWrapper'
import { posts } from '../data/posts'
import { useFavorites } from '../hooks/useFavorites'

const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const post = posts.find(p => p.slug === slug)
  const { toggle, isFavorite } = useFavorites()

  if (!post) {
    return (
      <div className='mx-auto max-w-3xl px-6 py-12 text-center'>
        <p className='mb-4'>Post not found.</p>
        <Link to='/blog' className='text-comet underline'>
          Back to blog
        </Link>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>{post.title} - The Hippie Scientist</title>
      </Helmet>
      <PanelWrapper className='mx-auto max-w-3xl px-6 py-12'>
        <div className='mb-6 flex items-start justify-between gap-4'>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className='text-gradient flex-1 text-4xl font-bold'
          >
            {post.title}
          </motion.h1>
          <button
            type='button'
            onClick={() => toggle(post.slug)}
            aria-label={isFavorite(post.slug) ? 'Remove bookmark' : 'Add bookmark'}
            className='rounded-md p-2 text-yellow-300 transition hover:text-yellow-400'
          >
            <Star className={isFavorite(post.slug) ? 'fill-current' : 'stroke-current'} />
          </button>
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className='mb-8 text-sm text-moss'
        >
          Stardate: {post.date}
        </motion.p>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='space-y-4'>
          {post.content.split('\n').map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </motion.div>
      </PanelWrapper>
    </>
  )
}

export default BlogPost
