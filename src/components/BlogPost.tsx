import { ReactNode } from 'react'

export default function BlogPost({ children }: { children: ReactNode }) {
  return (
    <article className='dark:prose-dark prose prose-invert mx-auto max-w-3xl p-4'>
      {children}
    </article>
  )
}
