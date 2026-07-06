import { defineCollection, defineConfig } from '@content-collections/core'
import { compileMDX } from '@content-collections/mdx'
import remarkGfm from 'remark-gfm'
import { z } from 'zod/v4'

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/
const articleReferenceSchema = z.object({
  title: z.string().min(1),
  authors: z.string().default(''),
  year: z.string().default(''),
  pmid: z.string().default(''),
  url: z.string().default(''),
})

const mdxOptions = {
  remarkPlugins: [remarkGfm],
}

const articleFaqSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
})

const articleMonographs = defineCollection({
  name: 'articleMonographs',
  directory: 'content/articles',
  include: '**/*.{md,mdx}',
  schema: z.object({
    title: z.string().min(1),
    slug: z.string().regex(slugPattern),
    description: z.string().min(1),
    date: z.string().regex(isoDatePattern).optional(),
    lastUpdated: z.string().regex(isoDatePattern).optional(),
    updatedAt: z.string().regex(isoDatePattern).optional(),
    category: z.string().min(1),
    tags: z.array(z.string()).default([]),
    readingTime: z.union([z.string().min(1), z.number().int().positive()]).optional(),
    evidenceGrade: z.string().min(1).optional(),
    evidence_grade: z.string().min(1).optional(),
    author: z.string().optional(),
    // Optional trust/E-E-A-T signals. `reviewedBy`/`reviewerCredential` are
    // only rendered when a real reviewer is supplied — never fabricate one.
    reviewedBy: z.string().optional(),
    reviewerCredential: z.string().optional(),
    lastReviewed: z.string().regex(isoDatePattern).optional(),
    faqs: z.array(articleFaqSchema).default([]),
    references: z.array(articleReferenceSchema).default([]),
    content: z.string(),
  }),
  transform: async (document, context) => {
    // Plain-markdown articles (.md) may contain literal `<` (e.g. "<5% oral",
    // "<1%") that MDX's JSX parser misreads as a malformed tag start. Escape
    // any `<` not immediately followed by a tag-name character, `/`, or `!`
    // so it renders as literal text instead of failing the MDX compile.
    const sanitizedDocument = {
      ...document,
      content: document.content.replace(/<(?![a-zA-Z/!])/g, '&lt;'),
    }
    const body = await compileMDX(context, sanitizedDocument, mdxOptions)
    const wordCount = document.content.split(/\s+/).filter(Boolean).length
    const estimatedMinutes = Math.max(1, Math.round(wordCount / 200))
    const readingTime =
      typeof document.readingTime === 'number'
        ? `${document.readingTime} min read`
        : document.readingTime || `${estimatedMinutes} min read`
    const lastUpdated = document.lastUpdated ?? document.updatedAt ?? document.date ?? ''
    const evidenceGrade = document.evidenceGrade ?? document.evidence_grade ?? ''

    return {
      ...document,
      readingTime,
      lastUpdated,
      evidenceGrade,
      body,
      url: `/articles/${document.slug}`,
    }
  },
})

const blogPosts = defineCollection({
  name: 'blogPosts',
  directory: 'content/blog',
  include: '**/*.{md,mdx}',
  schema: z.object({
    title: z.string().min(1),
    slug: z.string().regex(slugPattern),
    excerpt: z.string().default(''),
    date: z.string().regex(isoDatePattern).optional(),
    tags: z.array(z.string()).default([]),
    ai_assisted: z.boolean().optional(),
    content: z.string(),
  }),
  transform: async (document, context) => {
    const sanitizedDocument = {
      ...document,
      content: document.content.replace(/<(?![a-zA-Z/!])/g, '&lt;'),
    }
    const body = await compileMDX(context, sanitizedDocument, mdxOptions)
    const wordCount = document.content.split(/\s+/).filter(Boolean).length
    const estimatedMinutes = Math.max(1, Math.round(wordCount / 200))

    return {
      ...document,
      description: document.excerpt,
      lastUpdated: document.date ?? '',
      category: 'Field Notes',
      readingTime: `${estimatedMinutes} min read`,
      evidenceGrade: '',
      references: [],
      body,
      url: `/articles/${document.slug}`,
    }
  },
})

const compoundMdxPages = defineCollection({
  name: 'compoundMdxPages',
  directory: 'content/compounds',
  include: '**/*.mdx',
  schema: z.object({
    title: z.string().min(1),
    slug: z.string().regex(slugPattern),
    metaDescription: z.string().min(1),
    keywords: z.array(z.string()).default([]),
    lastUpdated: z.string().regex(isoDatePattern),
    evidenceGrade: z.string().min(1),
    readingTime: z.union([z.string().min(1), z.number().int().positive()]).default(6),
    references: z.array(articleReferenceSchema).default([]),
    content: z.string(),
  }),
  transform: async (document, context) => {
    const body = await compileMDX(context, document, mdxOptions)
    const readingTime =
      typeof document.readingTime === 'number'
        ? `${document.readingTime} min read`
        : document.readingTime

    return {
      ...document,
      description: document.metaDescription,
      readingTime,
      body,
      url: `/compounds/${document.slug}`,
    }
  },
})

const novelPsychoactiveSubstancePages = defineCollection({
  name: 'novelPsychoactiveSubstancePages',
  directory: 'novel-psychoactive-substances',
  include: '**/*.mdx',
  schema: z.object({
    title: z.string().min(1),
    metaTitle: z.string().min(1).optional(),
    metaDescription: z.string().min(1),
    keywords: z.array(z.string()).default([]),
    lastUpdated: z.string().regex(isoDatePattern),
    evidenceGrade: z.string().min(1).optional(),
    section: z.literal('novel-psychoactive-substances'),
    relatedSlugs: z.array(z.string().regex(slugPattern)).default([]),
    content: z.string(),
  }),
  transform: async (document, context) => {
    const body = await compileMDX(context, document, mdxOptions)
    const slug = document._meta.path

    return {
      ...document,
      slug,
      description: document.metaDescription,
      body,
      url:
        slug === 'index'
          ? '/novel-psychoactive-substances'
          : `/novel-psychoactive-substances/${slug}`,
    }
  },
})

export default defineConfig({
  content: [articleMonographs, blogPosts, compoundMdxPages, novelPsychoactiveSubstancePages],
})
