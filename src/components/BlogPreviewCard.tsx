import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import type { Post } from '../data/posts'

export default function BlogPreviewCard({ post }: { post: Post }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className='glass-card rounded-lg p-4 hover:shadow-glow hover:ring-2 hover:ring-lichen/50'
    >
      <Link to={`/blog/${post.slug}`} className='block space-y-1'>
        <h3 className='font-display text-lg text-gradient'>{post.title}</h3>
        <p className='text-sm text-gray-300'>{post.excerpt}</p>
      </Link>
    </motion.div>
  )
}
