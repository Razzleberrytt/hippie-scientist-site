import type { Metadata } from 'next'
import Link from 'next/link'
import posts from '@/data/blog/posts.json'
import { getCompounds, getHerbs } from '@/lib/runtime-data'

type BlogPost = {
  slug: string
  title: string
  excerpt?: string
  date?: string
  readingTime?: string
}

const allPosts = posts as BlogPost[]

const getPostSortValue = (post: BlogPost): number => {
  if (!post.date) return 0
  const value = new Date(post.date).getTime()
  return Number.isNaN(value) ? 0 : value
}

const truncateText = (value: string | undefined, maxLength: number): string => {
  if (!value) return 'No summary yet.'
  if (value.length <= maxLength) return value
  return `${value.slice(0, maxLength - 1).trimEnd()}…`
}

const formatDate = (value: string | undefined): string => {
  if (!value) return 'Undated'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

export const metadata: Metadata = {
  title: 'The Hippie Scientist',
  description:
    'Educational information about herbs and compounds, written in plain English and grounded in science.',
}

export default async function HomePage() {
  const [herbs, compounds] = await Promise.all([getHerbs(), getCompounds()])

  const featuredPosts = [...allPosts]
    .sort((a, b) => getPostSortValue(b) - getPostSortValue(a))
    .slice(0, 3)

  return (
    <div className='space-y-10 sm:space-y-14'>
      <section className='rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-10'>
        <span className='inline-flex rounded-full border border-white/15 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-white/70'>
          Science-first herb education
        </span>

        <h1 className='mt-4 text-4xl font-bold tracking-tight sm:text-5xl'>
          The Hippie Scientist
        </h1>

        <p className='mt-4 max-w-3xl text-base leading-7 text-white/75 sm:text-lg'>
          Educational information about herbs and compounds, written in plain
          English and grounded in science.
        </p>

        <p className='mt-3 max-w-3xl text-sm leading-6 text-white/60 sm:text-base'>
          Browse plant profiles, compound notes, and short articles that make
          research easier to understand without pretending to be medical advice.
        </p>

        <div className='mt-6 flex flex-wrap gap-3'>
          <Link
            href='/herbs'
            className='rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90'
          >
            Browse herbs
          </Link>

          <Link
            href='/compounds'
            className='rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/5'
          >
            Browse compounds
          </Link>

          <Link
            href='/blog'
            className='rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/5'
          >
            Read the blog
          </Link>
        </div>

        <div className='mt-8 grid gap-4 sm:grid-cols-3'>
          <div className='ds-card'>
            <p className='text-sm text-white/60'>Herb profiles</p>
            <p className='mt-2 text-3xl font-semibold'>{herbs.length}</p>
          </div>

          <div className='ds-card'>
            <p className='text-sm text-white/60'>Compound profiles</p>
            <p className='mt-2 text-3xl font-semibold'>{compounds.length}</p>
          </div>

          <div className='ds-card'>
            <p className='text-sm text-white/60'>Blog posts</p>
            <p className='mt-2 text-3xl font-semibold'>{allPosts.length}</p>
          </div>
        </div>
      </section>

      <section className='grid gap-4 lg:grid-cols-3'>
        <Link
          href='/herbs'
          className='group ds-card block transition hover:border-white/30 hover:bg-white/5'
        >
          <p className='text-xs font-medium uppercase tracking-[0.2em] text-white/50'>
            Start here
          </p>
          <h2 className='mt-3 text-2xl font-semibold'>Herbs</h2>
          <p className='mt-3 text-sm leading-6 text-white/70'>
            Explore plant profiles, summaries, and quick reference notes.
          </p>
          <span className='mt-5 inline-flex text-sm font-medium text-blue-300 transition group-hover:translate-x-0.5'>
            Open herb library →
          </span>
        </Link>

        <Link
          href='/compounds'
          className='group ds-card block transition hover:border-white/30 hover:bg-white/5'
        >
          <p className='text-xs font-medium uppercase tracking-[0.2em] text-white/50'>
            Research notes
          </p>
          <h2 className='mt-3 text-2xl font-semibold'>Compounds</h2>
          <p className='mt-3 text-sm leading-6 text-white/70'>
            Review active constituents, classes, and concise descriptions.
          </p>
          <span className='mt-5 inline-flex text-sm font-medium text-blue-300 transition group-hover:translate-x-0.5'>
            Open compound library →
          </span>
        </Link>

        <Link
          href='/blog'
          className='group ds-card block transition hover:border-white/30 hover:bg-white/5'
        >
          <p className='text-xs font-medium uppercase tracking-[0.2em] text-white/50'>
            Fresh content
          </p>
          <h2 className='mt-3 text-2xl font-semibold'>Blog</h2>
          <p className='mt-3 text-sm leading-6 text-white/70'>
            Read short explainers, comparisons, and practical notes.
          </p>
          <span className='mt-5 inline-flex text-sm font-medium text-blue-300 transition group-hover:translate-x-0.5'>
            Read latest posts →
          </span>
        </Link>
      </section>

      <section className='grid gap-6 lg:grid-cols-[1.4fr_0.8fr]'>
        <div className='space-y-4'>
          <div>
            <p className='text-sm font-medium uppercase tracking-[0.2em] text-white/50'>
              Latest posts
            </p>
            <h2 className='mt-2 text-3xl font-semibold'>Recent writing</h2>
          </div>

          <div className='grid gap-4'>
            {featuredPosts.map(post => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className='group ds-card block transition hover:border-white/30 hover:bg-white/5'
              >
                <div className='flex flex-wrap items-center gap-3 text-xs text-white/50'>
                  <span>{formatDate(post.date)}</span>
                  {post.readingTime ? <span>{post.readingTime}</span> : null}
                </div>

                <h3 className='mt-3 text-xl font-semibold'>{post.title}</h3>

                <p className='mt-3 text-sm leading-6 text-white/70'>
                  {truncateText(post.excerpt, 180)}
                </p>

                <span className='mt-4 inline-flex text-sm font-medium text-blue-300 transition group-hover:translate-x-0.5'>
                  Read post →
                </span>
              </Link>
            ))}
          </div>
        </div>

        <aside className='ds-card h-fit'>
          <p className='text-sm font-medium uppercase tracking-[0.2em] text-white/50'>
            Good to know
          </p>

          <h2 className='mt-2 text-2xl font-semibold'>Use this site carefully</h2>

          <div className='mt-4 space-y-3 text-sm leading-6 text-white/70'>
            <p>
              This project is for education and research context, not diagnosis
              or treatment.
            </p>
            <p>
              Start with conservative reading, check safety notes, and avoid
              treating internet content as personal medical advice.
            </p>
          </div>
        </aside>
      </section>

      <section className='grid gap-4 lg:grid-cols-2'>
        <Link
          href='/about'
          className='group ds-card block transition hover:border-white/30 hover:bg-white/5'
        >
          <p className='text-xs font-medium uppercase tracking-[0.2em] text-white/50'>
            Learn more
          </p>
          <h2 className='mt-3 text-2xl font-semibold'>About this project</h2>
          <p className='mt-3 text-sm leading-6 text-white/70'>
            Read what the site is for, how to use it, and what it is trying to do.
          </p>
          <span className='mt-5 inline-flex text-sm font-medium text-blue-300 transition group-hover:translate-x-0.5'>
            Open About →
          </span>
        </Link>

        <Link
          href='/contact'
          className='group ds-card block transition hover:border-white/30 hover:bg-white/5'
        >
          <p className='text-xs font-medium uppercase tracking-[0.2em] text-white/50'>
            Get in touch
          </p>
          <h2 className='mt-3 text-2xl font-semibold'>Contact</h2>
          <p className='mt-3 text-sm leading-6 text-white/70'>
            Send feedback, corrections, ideas, or questions about the site.
          </p>
          <span className='mt-5 inline-flex text-sm font-medium text-blue-300 transition group-hover:translate-x-0.5'>
            Open Contact →
          </span>
        </Link>
      </section>
    </div>
  )
}
