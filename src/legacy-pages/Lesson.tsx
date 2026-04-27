import React from 'react'
import { useParams, Link } from 'react-router-dom'

const Lesson: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  return (
    <div className='mx-auto max-w-3xl px-6 py-12 text-center'>
      <h1 className='mb-4 text-3xl font-bold text-white'>
        {slug ? `Lesson: ${slug}` : 'Lesson not found'}
      </h1>
      <p className='mb-4 text-white/70'>
        {slug ? `We couldn't find the lesson "${slug}".` : "We couldn't find that lesson."}
      </p>
      <Link to='/learning' className='text-[color:var(--accent)] underline'>
        Back to Learn
      </Link>
    </div>
  )
}

export default Lesson
