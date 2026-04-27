import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import posts from '@/data/blog/posts.json'

type Params = { params: Promise<{ slug: string }> }

type SectionInput = {
  title?: string
  heading?: string
  name?: string
  content?: unknown
  text?: unknown
  body?: unknown
  description?: unknown
  items?: unknown
  bullets?: unknown
  points?: unknown
}

type BlogPost = {
  slug: string
  title: string
  excerpt?: string
  date?: string
  readingTime?: string
  content?: unknown
  body?: unknown
  markdown?: unknown
  contentHtml?: unknown
  html?: unknown
  sections?: unknown
  summary?: unknown
  researchDigest?: unknown
  fieldNotes?: unknown
  traditionalContext?: unknown
  safetyNotes?: unknown
}

type RenderSection = {
  heading: string
  paragraphs: string[]
  bullets: string[]
}

const allPosts = posts as BlogPost[]

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

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const toText = (value: unknown): string => {
  if (typeof value !== 'string') return ''
  return value.replace(/\r\n/g, '\n').trim()
}

const toTextArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map(item => toText(item))
      .filter(Boolean)
  }

  const singleValue = toText(value)
  return singleValue ? [singleValue] : []
}

const splitParagraphs = (value: string): string[] =>
  value
    .split(/\n\s*\n/)
    .map(part => part.trim())
    .filter(Boolean)

const buildSectionsFromMarkdownishText = (value: string): RenderSection[] => {
  const sections: RenderSection[] = []
  const blocks = value
    .replace(/\r\n/g, '\n')
    .split(/\n(?=##\s+)/)
    .map(block => block.trim())
    .filter(Boolean)

  if (blocks.length === 0) return []

  for (const block of blocks) {
    const lines = block.split('\n').map(line => line.trim())
    const firstLine = lines[0] ?? ''
    const heading = firstLine.startsWith('## ')
      ? firstLine.replace(/^##\s+/, '').trim()
      : sections.length === 0
        ? 'Article'
        : 'Section'

    const bodyLines = firstLine.startsWith('## ') ? lines.slice(1) : lines
    const bullets = bodyLines
      .filter(line => /^[-*]\s+/.test(line))
      .map(line => line.replace(/^[-*]\s+/, '').trim())
      .filter(Boolean)

    const paragraphText = bodyLines
      .filter(line => !/^[-*]\s+/.test(line))
      .join('\n')
      .trim()

    const paragraphs = paragraphText ? splitParagraphs(paragraphText) : []

    if (paragraphs.length > 0 || bullets.length > 0) {
      sections.push({ heading, paragraphs, bullets })
    }
  }

  return sections
}

const buildSectionsFromStructuredData = (value: unknown): RenderSection[] => {
  if (!Array.isArray(value)) return []

  return value
    .map(item => {
      if (!isRecord(item)) return null

      const section = item as SectionInput
      const heading =
        toText(section.title) ||
        toText(section.heading) ||
        toText(section.name) ||
        'Section'

      const paragraphSource =
        section.content ?? section.text ?? section.body ?? section.description

      const paragraphs = Array.isArray(paragraphSource)
        ? toTextArray(paragraphSource)
        : splitParagraphs(toText(paragraphSource))

      const bullets = toTextArray(
        section.items ?? section.bullets ?? section.points,
      )

      if (paragraphs.length === 0 && bullets.length === 0) return null

      return {
        heading,
        paragraphs,
        bullets,
      }
    })
    .filter((section): section is RenderSection => Boolean(section))
}

const buildFallbackSections = (post: BlogPost): RenderSection[] => {
  const candidates: Array<[string, unknown]> = [
    ['Summary', post.summary],
    ['Research Digest', post.researchDigest],
    ['Field Notes', post.fieldNotes],
    ['Traditional Context', post.traditionalContext],
    ['Safety Notes', post.safetyNotes],
  ]

  return candidates
    .map(([heading, value]) => {
      const paragraphs = splitParagraphs(toText(value))
      const bullets = Array.isArray(value) ? toTextArray(value) : []

      if (paragraphs.length === 0 && bullets.length === 0) return null

      return { heading, paragraphs, bullets }
    })
    .filter((section): section is RenderSection => Boolean(section))
}

const getPostBySlug = (slug: string): BlogPost | null =>
  allPosts.find(post => post.slug === slug) ?? null

const getLeadText = (post: BlogPost): string =>
  toText(post.excerpt) || 'A full article for this post is being prepared.'

const getHtmlContent = (post: BlogPost): string =>
  toText(post.contentHtml) || toText(post.html)

const getTextContent = (post: BlogPost): string =>
  toText(post.content) || toText(post.body) || toText(post.markdown)

const getSections = (post: BlogPost): RenderSection[] => {
  const structuredSections = buildSectionsFromStructuredData(post.sections)
  if (structuredSections.length > 0) return structuredSections

  const markdownishSections = buildSectionsFromMarkdownishText(getTextContent(post))
  if (markdownishSections.length > 0) return markdownishSections

  return buildFallbackSections(post)
}

export async function generateStaticParams() {
  return allPosts.map(post => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)

  if (!post) {
    return { title: 'Post Not Found | The Hippie Scientist' }
  }

  return {
    title: `${post.title} | The Hippie Scientist`,
    description: getLeadText(post),
    alternates: { canonical: `/blog/${post.slug}` },
  }
}

export default async function BlogPostPage({ params }: Params) {
  const { slug } = await params
  const post = getPostBySlug(slug)

  if (!post) notFound()

  const htmlContent = getHtmlContent(post)
  const sections = getSections(post)
  const leadText = getLeadText(post)

  return (
    <div className='space-y-8'>
      <nav className='flex flex-wrap gap-3 text-sm text-white/60'>
        <Link
          href='/blog'
          className='rounded-full border border-white/10 px-4 py-2 transition hover:border-white/25 hover:bg-white/5 hover:text-white'
        >
          ← Back to blog
        </Link>

        <Link
          href='/herbs'
          className='rounded-full border border-white/10 px-4 py-2 transition hover:border-white/25 hover:bg-white/5 hover:text-white'
        >
          Browse herbs
        </Link>

        <Link
          href='/compounds'
          className='rounded-full border border-white/10 px-4 py-2 transition hover:border-white/25 hover:bg-white/5 hover:text-white'
        >
          Browse compounds
        </Link>
      </nav>

      <article className='grid gap-6 lg:grid-cols-[1.45fr_0.85fr]'>
        <div className='space-y-6'>
          <header className='rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8'>
            <div className='flex flex-wrap items-center gap-3 text-xs font-medium uppercase tracking-[0.2em] text-white/50'>
              <span className='inline-flex rounded-full border border-white/15 px-3 py-1 text-white/70'>
                Blog post
              </span>
              <span>{formatDate(post.date)}</span>
              {post.readingTime ? <span>{post.readingTime}</span> : null}
            </div>

            <h1 className='mt-4 text-4xl font-bold tracking-tight sm:text-5xl'>
              {post.title}
            </h1>

            <p className='mt-4 max-w-3xl whitespace-pre-line text-base leading-7 text-white/75 sm:text-lg'>
              {leadText}
            </p>
          </header>

          {htmlContent ? (
            <section className='ds-card'>
              <div
                className='prose prose-invert max-w-none prose-headings:tracking-tight prose-p:text-white/75 prose-li:text-white/75'
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            </section>
          ) : null}

          {!htmlContent && sections.length > 0
            ? sections.map(section => (
                <section key={section.heading} className='ds-card'>
                  <h2 className='text-2xl font-semibold tracking-tight'>
                    {section.heading}
                  </h2>

                  {section.paragraphs.map(paragraph => (
                    <p
                      key={paragraph}
                      className='mt-4 whitespace-pre-line text-sm leading-7 text-white/75 sm:text-base'
                    >
                      {paragraph}
                    </p>
                  ))}

                  {section.bullets.length > 0 ? (
                    <ul className='mt-4 list-disc space-y-3 pl-5 text-sm leading-6 text-white/75 sm:text-base'>
                      {section.bullets.map(item => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : null}
                </section>
              ))
            : null}

          {!htmlContent && sections.length === 0 ? (
            <section className='ds-card'>
              <p className='text-sm leading-7 text-white/75 sm:text-base'>
                This article is live in the index, but its full body content has
                not been added yet.
              </p>
            </section>
          ) : null}
        </div>

        <aside className='space-y-6'>
          <section className='ds-card'>
            <p className='text-sm font-medium uppercase tracking-[0.2em] text-white/50'>
              Article details
            </p>

            <dl className='mt-4 space-y-4 text-sm'>
              <div className='flex items-start justify-between gap-4 border-b border-white/10 pb-3'>
                <dt className='text-white/55'>Published</dt>
                <dd className='text-right font-medium text-white'>
                  {formatDate(post.date)}
                </dd>
              </div>

              <div className='flex items-start justify-between gap-4 border-b border-white/10 pb-3'>
                <dt className='text-white/55'>Reading time</dt>
                <dd className='text-right font-medium text-white'>
                  {post.readingTime || 'Not listed'}
                </dd>
              </div>

              <div className='flex items-start justify-between gap-4'>
                <dt className='text-white/55'>Slug</dt>
                <dd className='text-right font-medium text-white'>{post.slug}</dd>
              </div>
            </dl>
          </section>

          <section className='ds-card'>
            <p className='text-sm font-medium uppercase tracking-[0.2em] text-white/50'>
              Reminder
            </p>

            <p className='mt-4 text-sm leading-7 text-white/75'>
              This site is for education and research context. It is not personal
              medical advice.
            </p>
          </section>
        </aside>
      </article>
    </div>
  )
}
