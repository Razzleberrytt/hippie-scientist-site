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

const articleMonographs = defineCollection({
  name: 'articleMonographs',
  directory: 'content/articles',
  include: '**/*.mdx',
  schema: z.object({
    title: z.string().min(1),
    slug: z.string().regex(slugPattern),
    description: z.string().min(1),
    date: z.string().regex(isoDatePattern).optional(),
    lastUpdated: z.string().regex(isoDatePattern),
    category: z.string().min(1),
    tags: z.array(z.string()).default([]),
    readingTime: z.union([z.string().min(1), z.number().int().positive()]),
    evidenceGrade: z.string().min(1),
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
      readingTime,
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
  content: [articleMonographs, compoundMdxPages, novelPsychoactiveSubstancePages],
})
