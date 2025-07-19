import React from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import StarfieldBackground from '../components/StarfieldBackground'
import PanelWrapper from '../components/PanelWrapper'
import PostFilter from '../components/PostFilter'
import { posts } from '../data/mdPosts'
import { decodeTag } from '../utils/format'

const Blog: React.FC = () => {
  const [filtered, setFiltered] = React.useState(posts)

  return (
    <>
      <Helmet>
        <title>Blog - The Hippie Scientist</title>
      </Helmet>
      <div className='relative min-h-screen px-4 pt-20'>
        <StarfieldBackground />
        <div className='relative mx-auto max-w-4xl space-y-8'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className='text-center'
          >
            <h1 className='text-gradient mb-6 text-5xl font-bold'>Blog</h1>
            <p className='mx-auto max-w-2xl text-lg text-sand'>
              Writings and research notes from the cosmic garden.
            </p>
          </motion.div>
          <PostFilter posts={posts} onFilter={setFiltered} />
          <div className='space-y-6'>
            {filtered.map((post, idx) => (
              <motion.div
                key={post.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
              >
                <PanelWrapper className='hover-glow'>
                  <Link to={`/blog/${post.slug}`} className='block space-y-2'>
                    <h2 className='text-gradient text-2xl font-bold'>{post.title}</h2>
                    <p className='text-moss'>{post.excerpt}</p>
                    <div className='flex flex-wrap gap-2'>
                      {post.tags.map(tag => (
                        <span key={tag} className='tag-pill'>
                          {decodeTag(tag)}
                        </span>
                      ))}
                    </div>
                    <p className='text-sm text-sand'>
                      {post.date} · {post.readingTime}
                    </p>
                  </Link>
                </PanelWrapper>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default Blog
