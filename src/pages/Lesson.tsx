import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { posts } from '../data/posts'

const Lesson: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const post = posts.find(p => p.slug === slug)

  if (!post) {
    return (
      <div className='mx-auto max-w-3xl px-6 py-12 text-center'>
        <p className='mb-4'>Lesson not found.</p>
        <Link to='/learn' className='text-comet underline'>
          Back to Learn
        </Link>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>{post.title} - Learn</title>
      </Helmet>
      <div className='mx-auto max-w-3xl px-6 py-12'>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='text-gradient mb-6 text-4xl font-bold'
        >
          {post.title}
        </motion.h1>
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
      </div>
    </>
  )
}

export default Lesson
