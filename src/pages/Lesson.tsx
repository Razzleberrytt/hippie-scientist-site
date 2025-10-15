import React from 'react'
import { useParams, Link } from 'react-router-dom'

const Lesson: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  return (
    <div className='mx-auto max-w-3xl px-6 py-12 text-center'>
      <h1 className='mb-4 text-3xl font-bold text-white'>
        {slug ? `Lesson: ${slug}` : 'Lesson not found'}
      </h1>
      <p className='text-sand mb-4'>
        {slug ? `We couldn't find the lesson "${slug}".` : "We couldn't find that lesson."}
      </p>
      <Link to='/learn' className='text-comet underline'>
        Back to Learn
      </Link>
    </div>
  )
}

export default Lesson
