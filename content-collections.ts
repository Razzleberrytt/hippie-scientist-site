import { defineCollection, defineConfig } from '@content-collections/core'
import { compileMDX } from '@content-collections/mdx'
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
    const body = await compileMDX(context, document)
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

export default defineConfig({
  content: [articleMonographs],
})
