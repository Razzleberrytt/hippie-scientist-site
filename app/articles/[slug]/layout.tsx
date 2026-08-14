import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { allArticleMonographs, allBlogPosts } from '../../../.content-collections/generated'
import { compactMetaTitle } from '../../../src/lib/seo'

const articlePages = [...allArticleMonographs, ...allBlogPosts]

type LayoutProps = {
  children: ReactNode
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Omit<LayoutProps, 'children'>): Promise<Metadata> {
  const { slug } = await params
  const page = articlePages.find((item) => item.slug === slug)
  if (!page) return {}

  return {
    twitter: {
      card: 'summary_large_image',
      title: compactMetaTitle(page.title),
      description: page.description,
      images: ['/og-default.jpg'],
    },
  }
}

export default function ArticleLayout({ children }: LayoutProps) {
  return children
}
