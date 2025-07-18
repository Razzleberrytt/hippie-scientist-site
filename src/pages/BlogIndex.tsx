import React from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import CardShell from '../components/CardShell'
import PostFilter from '../components/PostFilter'
import { posts } from '../data/posts'

const BlogIndex: React.FC = () => {
  const [filtered, setFiltered] = React.useState(posts)

  return (
    <>
      <Helmet>
        <title>Blog - The Hippie Scientist</title>
      </Helmet>
      <div className='mx-auto max-w-3xl space-y-6 px-6 py-12'>
        <PostFilter posts={posts} onFilter={setFiltered} />
        {filtered.map(post => (
          <CardShell key={post.id} className='hover:shadow-intense'>
            <Link to={`/blog/${post.slug}`} className='block space-y-2'>
              <motion.h2 whileHover={{ x: 4 }} className='text-gradient text-2xl font-bold'>
                {post.title}
              </motion.h2>
              <p className='text-moss'>{post.excerpt}</p>
            </Link>
          </CardShell>
        ))}
      </div>
    </>
  )
}

export default BlogIndex
