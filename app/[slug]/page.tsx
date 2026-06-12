import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import React from 'react'

import ResponsiveTable from '@/components/ui/ResponsiveTable'
import {
  focusClusterArticleSources,
  getAllFocusClusterArticles,
  getFocusClusterArticle,
} from '@/lib/focus-cluster-markdown'
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL } from '@/lib/seo'

const FOCUS_CLUSTER_SITE_URL = 'https://www.thehippiescientist.net'

export const dynamic = 'force-static'
export const dynamicParams = false

type PageParams = Promise<{ slug: string }>

type Block =
  | { type: 'h2' | 'h3' | 'h4'; text: string }
  | { type: 'p'; text: string }
  | { type: 'ul' | 'ol'; items: string[] }
  | { type: 'blockquote'; text: string }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'hr' }

export function generateStaticParams() {
  return focusClusterArticleSources.map((article) => ({ slug: article.slug }))
}

export async function generateMetadata({ params }: { params: PageParams }): Promise<Metadata> {
  const { slug } = await params
  const article = getFocusClusterArticle(slug)
  if (!article) return {}
  const canonical = `${FOCUS_CLUSTER_SITE_URL}/${article.slug}/`

  return {
    title: article.seoTitle,
    description: article.metaDescription,
    alternates: { canonical },
    openGraph: {
      title: article.seoTitle,
      description: article.metaDescription,
      url: canonical,
      siteName: SITE_NAME,
      type: 'article',
      images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: article.seoTitle }],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.seoTitle,
      description: article.metaDescription,
      images: [DEFAULT_OG_IMAGE],
    },
  }
}

function parseBlocks(raw: string): Block[] {
  const lines = raw.split(/\r?\n/)
  const blocks: Block[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i].trim()
    if (!line) {
      i += 1
      continue
    }

    if (line.startsWith('# ')) {
      i += 1
      continue
    }

    if (line.startsWith('#### ')) {
      blocks.push({ type: 'h4', text: line.slice(5).trim() })
      i += 1
      continue
    }

    if (line.startsWith('### ')) {
      blocks.push({ type: 'h3', text: line.slice(4).trim() })
      i += 1
      continue
    }

    if (line.startsWith('## ')) {
      blocks.push({ type: 'h2', text: line.slice(3).trim() })
      i += 1
      continue
    }

    if (line === '---') {
      blocks.push({ type: 'hr' })
      i += 1
      continue
    }

    if (line.startsWith('> ')) {
      const quoteLines: string[] = []
      while (i < lines.length && lines[i].trim().startsWith('> ')) {
        quoteLines.push(lines[i].trim().slice(2).trim())
        i += 1
      }
      blocks.push({ type: 'blockquote', text: quoteLines.join(' ') })
      continue
    }

    if (line.startsWith('|') && lines[i + 1]?.trim().match(/^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/)) {
      const splitRow = (value: string) =>
        value
          .replace(/^\|/, '')
          .replace(/\|$/, '')
          .split('|')
          .map((cell) => cell.trim())

      const headers = splitRow(line)
      const rows: string[][] = []
      i += 2

      while (i < lines.length && lines[i].trim().startsWith('|')) {
        rows.push(splitRow(lines[i].trim()))
        i += 1
      }

      blocks.push({ type: 'table', headers, rows })
      continue
    }

    if (/^[-*]\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*]\s+/, ''))
        i += 1
      }
      blocks.push({ type: 'ul', items })
      continue
    }

    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ''))
        i += 1
      }
      blocks.push({ type: 'ol', items })
      continue
    }

    const paragraph = [line]
    i += 1
    while (i < lines.length) {
      const next = lines[i].trim()
      if (
        !next ||
        next.startsWith('#') ||
        next === '---' ||
        next.startsWith('|') ||
        next.startsWith('> ') ||
        /^[-*]\s+/.test(next) ||
        /^\d+\.\s+/.test(next)
      ) {
        break
      }
      paragraph.push(next)
      i += 1
    }

    blocks.push({ type: 'p', text: paragraph.join(' ') })
  }

  return blocks
}

function isSafeHref(href: string): boolean {
  return href.startsWith('/') || href.startsWith('#') || /^https?:\/\//i.test(href)
}

function renderInline(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = []
  const tokenPattern = /(\[([^\]]+)]\(([^)]+)\)|\*\*([^*]+)\*\*|`([^`]+)`|\*([^*]+)\*)/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = tokenPattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index))
    }

    if (match[2] && match[3]) {
      const label = match[2]
      const href = match[3].trim()
      if (isSafeHref(href)) {
        const isExternal = /^https?:\/\//i.test(href)
        nodes.push(
          <a
            key={`${match.index}-a`}
            href={href}
            className="font-semibold text-brand-700 hover:text-brand-800 hover:underline"
            {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            {label}
          </a>,
        )
      } else {
        nodes.push(label)
      }
    } else if (match[4]) {
      nodes.push(<strong key={`${match.index}-strong`}>{match[4]}</strong>)
    } else if (match[5]) {
      nodes.push(
        <code key={`${match.index}-code`} className="rounded bg-brand-50 px-1 py-0.5 font-mono text-sm text-brand-800">
          {match[5]}
        </code>,
      )
    } else if (match[6]) {
      nodes.push(<em key={`${match.index}-em`}>{match[6]}</em>)
    }

    lastIndex = tokenPattern.lastIndex
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex))
  }

  return nodes
}

function MarkdownArticle({ markdown }: { markdown: string }) {
  const blocks = parseBlocks(markdown)

  return (
    <div className="space-y-5">
      {blocks.map((block, index) => {
        if (block.type === 'h2') {
          return (
            <h2 key={index} className="mt-11 text-2xl font-semibold tracking-tight text-ink first:mt-0">
              {renderInline(block.text)}
            </h2>
          )
        }

        if (block.type === 'h3') {
          return (
            <h3 key={index} className="mt-8 text-xl font-semibold tracking-tight text-ink">
              {renderInline(block.text)}
            </h3>
          )
        }

        if (block.type === 'h4') {
          return (
            <h4 key={index} className="mt-6 text-lg font-semibold tracking-tight text-ink">
              {renderInline(block.text)}
            </h4>
          )
        }

        if (block.type === 'p') {
          return (
            <p key={index} className="text-[1.03rem] leading-8 text-[#46574d]">
              {renderInline(block.text)}
            </p>
          )
        }

        if (block.type === 'blockquote') {
          return (
            <blockquote key={index} className="border-l-4 border-brand-700/30 bg-brand-50/60 py-3 pl-4 pr-3 text-[1.01rem] leading-8 text-[#46574d]">
              {renderInline(block.text)}
            </blockquote>
          )
        }

        if (block.type === 'ul' || block.type === 'ol') {
          const List = block.type
          return (
            <List key={index} className={`ml-6 space-y-2 text-[1.01rem] leading-8 text-[#46574d] ${block.type === 'ul' ? 'list-disc' : 'list-decimal'}`}>
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>{renderInline(item)}</li>
              ))}
            </List>
          )
        }

        if (block.type === 'table') {
          return (
            <ResponsiveTable key={index} label="Article table" className="my-7">
              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr className="border-b border-brand-900/10">
                    {block.headers.map((header, headerIndex) => (
                      <th key={`${header}-${headerIndex}`} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted">
                        {renderInline(header)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-900/5">
                  {block.rows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <td key={`${rowIndex}-${cellIndex}`} className="px-4 py-3 align-top leading-6 text-[#46574d]">
                          {renderInline(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </ResponsiveTable>
          )
        }

        return <hr key={index} className="my-8 border-brand-900/10" />
      })}
    </div>
  )
}

function ArticleJsonLd({
  title,
  description,
  slug,
  dateModified,
}: {
  title: string
  description: string
  slug: string
  dateModified: string
}) {
  const url = `${FOCUS_CLUSTER_SITE_URL}/${slug}/`
  const graph = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    url,
    mainEntityOfPage: url,
    dateModified,
    author: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  )
}

export default async function FocusClusterRootArticlePage({ params }: { params: PageParams }) {
  const { slug } = await params
  const article = getFocusClusterArticle(slug)
  if (!article) notFound()

  const related = getAllFocusClusterArticles().filter((item) => item.slug !== article.slug)

  return (
    <article className="mx-auto max-w-4xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
      <ArticleJsonLd
        title={article.title}
        description={article.metaDescription}
        slug={article.slug}
        dateModified={article.dateModified}
      />

      <nav className="mb-6 flex items-center gap-2 text-sm text-muted">
        <Link href="/articles" className="transition hover:text-ink">Articles</Link>
        <span>/</span>
        <span className="line-clamp-1 text-ink">{article.title}</span>
      </nav>

      <header className="border-b border-brand-900/10 pb-8">
        <p className="eyebrow-label">Focus &amp; ADHD</p>
        <h1 className="mt-3 font-display text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl">
          {article.title}
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-[#46574d]">
          {article.metaDescription}
        </p>
        <div className="mt-5 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full border border-brand-900/10 bg-brand-50 px-3 py-1 font-semibold text-brand-800">
            {article.primaryKeyword}
          </span>
          {article.secondaryKeywords.slice(0, 4).map((keyword) => (
            <span key={keyword} className="rounded-full border border-brand-900/10 bg-white px-3 py-1 font-semibold text-muted">
              {keyword}
            </span>
          ))}
        </div>
      </header>

      <section className="mt-8">
        <MarkdownArticle markdown={article.markdown} />
      </section>

      <section className="mt-12 rounded-[0.85rem] border border-brand-900/10 bg-brand-50/70 p-5">
        <h2 className="text-lg font-semibold tracking-tight text-ink">More Focus &amp; ADHD guides</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {related.map((item) => (
            <Link
              key={item.slug}
              href={`/${item.slug}`}
              className="rounded-[0.75rem] border border-brand-900/10 bg-white/80 p-3 text-sm font-semibold text-brand-800 hover:border-brand-900/20 hover:bg-white"
            >
              {item.title}
            </Link>
          ))}
        </div>
      </section>
    </article>
  )
}
