import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import PanelWrapper from '../components/PanelWrapper'
import { posts } from '../data/mdPosts'
import ReactMarkdown from 'react-markdown'
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
          className='mb-4 text-sm text-moss'
        >
          By {post.author} · {post.date} · {post.readingTime}
        </motion.p>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='prose prose-invert max-w-none'>
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </motion.div>
      </PanelWrapper>
    </>
  )
}

export default BlogPost
