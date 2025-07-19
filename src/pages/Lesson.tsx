import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import PanelWrapper from '../components/PanelWrapper'

const Lesson: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const post = null

  return (
    <div className='mx-auto max-w-3xl px-6 py-12 text-center'>
      <p className='mb-4'>Lesson not found.</p>
      <Link to='/learn' className='text-comet underline'>
        Back to Learn
      </Link>
    </div>
  )
}

export default Lesson
