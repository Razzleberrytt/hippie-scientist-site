import { ReactNode } from 'react'

type BlogSource = {
  title: string
  url: string
  note?: string
}

type BlogPostLayoutProps = {
  title?: string
  author?: string
  sources?: BlogSource[]
  children: ReactNode
}

export default function BlogPost({ children, title, author, sources }: BlogPostLayoutProps) {
  return (
    <article className='dark:prose-dark prose prose-invert mx-auto max-w-3xl p-4'>
      {title && <h1>{title}</h1>}
      <p className='-mt-3 text-sm text-white/70'>By {author || 'Hippie Scientist Team'}</p>
      {children}
      {Array.isArray(sources) && sources.length > 0 && (
        <section className='mt-8'>
          <h2>References</h2>
          <ol>
            {sources.map((source, index) => (
              <li key={`${source.url}-${index}`}>
                <a href={source.url} target='_blank' rel='noreferrer'>
                  {source.title}
                </a>
                {source.note ? ` — ${source.note}` : ''}
              </li>
            ))}
          </ol>
        </section>
      )}
    </article>
  )
}
