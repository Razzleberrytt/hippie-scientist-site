import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import React from 'react'

import { buildPageMetadata, blogJsonLd, breadcrumbJsonLd } from '@/lib/seo'
import LastUpdatedBadge from '@/components/editorial/LastUpdatedBadge'
import ResponsiveTable from '@/components/ui/ResponsiveTable'
import { getFocusAdhdArticle, focusAdhdArticles } from '@/lib/focus-adhd-articles'
import AffiliateDisclosure from '@/components/AffiliateDisclosure'
import { StartHereBox, AdhdCtaDashboard, AdhdComparisonCard, AdhdInlineCta, getAdhdCtasForSlug } from './AdhdMonetizationWidgets'
import EmailCapture from '@/components/EmailCapture'

type Block =
  | { type: 'h2' | 'h3' | 'h4'; text: string }
  | { type: 'p'; text: string }
  | { type: 'ul' | 'ol'; items: string[] }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'hr' }

const relatedLinks = [
  ['best-supplements-for-adhd', 'Best Supplements for ADHD'],
  ['adhd-stack-guide', 'ADHD Stack Guide'],
  ['sleep-and-adhd', 'Sleep and ADHD'],
  ['nutrient-deficiencies-and-adhd', 'Nutrient Deficiencies and ADHD'],
  ['adhd-blood-tests', 'ADHD Blood Tests Guide'],
  ['magnesium-for-adhd', 'Magnesium for ADHD'],
  ['l-theanine-for-adhd', 'L-Theanine for ADHD'],
  ['melatonin-for-adhd-sleep', 'Melatonin for ADHD Sleep'],
  ['omega-3-and-adhd', 'Omega-3 and ADHD'],
  ['zinc-and-adhd', 'Zinc and ADHD'],
  ['iron-ferritin-and-adhd', 'Iron, Ferritin, and ADHD'],
  ['vitamin-d-and-adhd', 'Vitamin D and ADHD'],
  ['ashwagandha-for-adhd', 'Ashwagandha for ADHD'],
  ['citicoline-vs-alpha-gpc', 'Citicoline vs Alpha-GPC'],
] as const

function parseBlocks(raw: string): Block[] {
  const lines = raw.split(/\r?\n/)
  const blocks: Block[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i].trim()
    if (!line) { i++; continue }
    if (line === '---') { blocks.push({ type: 'hr' }); i++; continue }
    if (line.startsWith('# ')) { i++; continue }
    if (line.startsWith('#### ')) { blocks.push({ type: 'h4', text: line.slice(5) }); i++; continue }
    if (line.startsWith('### ')) { blocks.push({ type: 'h3', text: line.slice(4) }); i++; continue }
    if (line.startsWith('## ')) { blocks.push({ type: 'h2', text: line.slice(3) }); i++; continue }

    if (line.startsWith('|') && lines[i + 1]?.trim().match(/^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/)) {
      const splitRow = (value: string) => value.replace(/^\|/, '').replace(/\|$/, '').split('|').map(cell => cell.trim())
      const headers = splitRow(line)
      const rows: string[][] = []
      i += 2
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        rows.push(splitRow(lines[i].trim()))
        i++
      }
      blocks.push({ type: 'table', headers, rows })
      continue
    }

    if (/^[-*]\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*]\s+/, ''))
        i++
      }
      blocks.push({ type: 'ul', items })
      continue
    }

    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ''))
        i++
      }
      blocks.push({ type: 'ol', items })
      continue
    }

    const paragraph = [line]
    i++
    while (i < lines.length) {
      const next = lines[i].trim()
      if (!next || next.startsWith('#') || next === '---' || /^[-*]\s+/.test(next) || /^\d+\.\s+/.test(next) || next.startsWith('|')) break
      paragraph.push(next)
      i++
    }
    blocks.push({ type: 'p', text: paragraph.join(' ') })
  }

  return blocks
}

function inlineFormat(text: string) {
  return text
    .replace(/\[([^\]]+)]\(([^)]+)\)/g, (_match, label: string, href: string) => {
      const external = /^https?:\/\//i.test(href)
      return `<a href="${href}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''} class="font-semibold text-brand-700 hover:text-brand-800 hover:underline">${label}</a>`
    })
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code class="rounded bg-brand-50 px-1 py-0.5 font-mono text-sm text-brand-800">$1</code>')
}

function MarkdownBody({ body, slug }: { body: string; slug: string }) {
  const blocks = parseBlocks(body)
  const ctaTypes = getAdhdCtasForSlug(slug)

  // Find insertion points
  // 1. Top insertion point: right before the first h2 block, or index 3 if no h2
  const firstH2Index = blocks.findIndex((b) => b.type === 'h2')
  const topCtaIndex = firstH2Index !== -1 ? firstH2Index : 3

  // 2. Bottom insertion point: right before the first h2 block containing "FAQ" or "Frequently Asked Questions", or blocks.length - 2
  const faqIndex = blocks.findIndex((b) => b.type === 'h2' && (b.text.toLowerCase().includes('faq') || b.text.toLowerCase().includes('frequently asked questions')))
  const bottomCtaIndex = faqIndex !== -1 ? faqIndex : Math.max(0, blocks.length - 2)

  // 3. Mid insertion point: midpoint between top and bottom CTAs, after a paragraph block
  const midPoint = Math.floor((topCtaIndex + bottomCtaIndex) / 2)
  let midCtaIndex = midPoint
  for (let idx = midPoint; idx < bottomCtaIndex; idx++) {
    if (blocks[idx]?.type === 'p') {
      midCtaIndex = idx + 1
      break
    }
  }

  const renderedCtas = new Set<string>()

  return (
    <div className="space-y-4">
      {blocks.map((block, index) => {
        const elements: React.ReactNode[] = []

        // Render top CTA
        if (index === topCtaIndex && !renderedCtas.has('top')) {
          elements.push(<AdhdInlineCta key="top-cta" type={ctaTypes.top} />)
          renderedCtas.add('top')
        }

        // Render mid CTA
        if (index === midCtaIndex && !renderedCtas.has('mid') && midCtaIndex > topCtaIndex + 2 && midCtaIndex < bottomCtaIndex - 2) {
          elements.push(<AdhdInlineCta key="mid-cta" type={ctaTypes.mid} />)
          renderedCtas.add('mid')
        }

        // Render bottom CTA
        if (index === bottomCtaIndex && !renderedCtas.has('bottom') && bottomCtaIndex > topCtaIndex + 2) {
          elements.push(<AdhdInlineCta key="bottom-cta" type={ctaTypes.bottom} />)
          renderedCtas.add('bottom')
        }

        // Render the block itself
        let blockEl: React.ReactNode = null
        if (block.type === 'h2') {
          blockEl = <h2 key={index} className="mt-10 text-2xl font-semibold tracking-tight text-ink first:mt-0" dangerouslySetInnerHTML={{ __html: inlineFormat(block.text) }} />
        } else if (block.type === 'h3') {
          blockEl = <h3 key={index} className="mt-7 text-xl font-semibold tracking-tight text-ink" dangerouslySetInnerHTML={{ __html: inlineFormat(block.text) }} />
        } else if (block.type === 'h4') {
          blockEl = <h4 key={index} className="mt-5 text-base font-semibold text-ink" dangerouslySetInnerHTML={{ __html: inlineFormat(block.text) }} />
        } else if (block.type === 'hr') {
          blockEl = <hr key={index} className="my-6 border-brand-900/10" />
        } else if (block.type === 'ul' || block.type === 'ol') {
          const List = block.type
          blockEl = (
            <List key={index} className={`ml-5 space-y-1.5 ${block.type === 'ul' ? 'list-disc' : 'list-decimal'}`}>
              {block.items.map((item, itemIndex) => <li key={itemIndex} className="leading-7 text-[#46574d]" dangerouslySetInnerHTML={{ __html: inlineFormat(item) }} />)}
            </List>
          )
        } else if (block.type === 'table') {
          blockEl = (
            <ResponsiveTable key={index} label="Focus and ADHD evidence table">
              <table className="min-w-[760px] w-full text-sm">
                <thead>
                  <tr className="border-b border-brand-900/10">
                    {block.headers.map((header) => <th key={header} className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted" dangerouslySetInnerHTML={{ __html: inlineFormat(header) }} />)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-900/5">
                  {block.rows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cell, cellIndex) => <td key={cellIndex} className="py-3 pr-4 leading-6 text-[#46574d]" dangerouslySetInnerHTML={{ __html: inlineFormat(cell) }} />)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </ResponsiveTable>
          )
        } else if (block.type === 'p') {
          blockEl = <p key={index} className="text-[1.01rem] leading-[1.85] text-[#46574d]" dangerouslySetInnerHTML={{ __html: inlineFormat(block.text) }} />
        }

        if (blockEl) {
          elements.push(blockEl)
        }

        return <React.Fragment key={index}>{elements}</React.Fragment>
      })}
    </div>
  )
}

export function focusAdhdMetadata(slug: string): Metadata {
  const article = focusAdhdArticles.find((item) => item.slug === slug)
  if (!article) return {}
  return buildPageMetadata({
    title: article.seoTitle,
    description: article.description,
    path: `/articles/${slug}`,
    openGraphType: 'article',
  })
}

export default function FocusAdhdArticlePage({ slug }: { slug: string }) {
  const article = getFocusAdhdArticle(slug)
  if (!article) notFound()

  const articleLd = blogJsonLd({
    title: article.title,
    slug: article.slug,
    date: article.date,
    updated: article.date,
    excerpt: article.description,
  }, `/articles/${article.slug}`)
  const breadcrumbLd = breadcrumbJsonLd([
    { name: 'Articles', url: 'https://thehippiescientist.net/articles' },
    { name: article.title, url: `https://thehippiescientist.net/articles/${article.slug}` },
  ])

  return (
    <article className="mx-auto max-w-5xl px-4 pb-20 pt-6 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <nav className="mb-6 flex items-center gap-2 text-sm text-muted">
        <Link href="/articles" className="transition hover:text-ink">Articles</Link>
        <span>/</span>
        <span className="line-clamp-1 text-ink">{article.title}</span>
      </nav>

      <section className="rounded-[1.25rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full border border-brand-900/10 bg-brand-50 px-2.5 py-0.5 font-bold uppercase tracking-wider text-brand-800">{article.category}</span>
          {article.tags.slice(0, 4).map((tag) => <span key={tag} className="rounded-full border border-brand-900/10 bg-white px-2.5 py-0.5 font-semibold text-muted">{tag}</span>)}
          <span className="text-muted">{article.readingTime}</span>
        </div>
        <h1 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl lg:text-5xl">{article.title}</h1>
        <div className="mt-3"><LastUpdatedBadge date={article.date} label="Last updated" /></div>
        <p className="mt-4 max-w-3xl text-base leading-7 text-[#46574d]">{article.description}</p>
        
        <StartHereBox currentSlug={slug} />
      </section>

      <section className="mt-6 rounded-[1rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8">
        <AffiliateDisclosure variant="compact" className="mb-6" />
        
        <MarkdownBody body={article.body} slug={slug} />
        
        <AdhdComparisonCard slug={slug} />
        
        <AdhdCtaDashboard currentSlug={slug} />
        
        <EmailCapture
          headline="Get the ADHD supplement checklist"
          description="Receive our evidence-first supplement checklist, safety reminders, and updates on ADHD nutrient research. No medical claims or personalized advice."
          ctaLabel="Get Checklist"
          location="adhd-articles"
          className="mt-8"
        />
        
        <AffiliateDisclosure variant="full" className="mt-8" />
      </section>

      <section className="mt-6 rounded-[1rem] border border-brand-900/10 bg-brand-50/70 p-5">
        <h2 className="text-lg font-semibold tracking-tight text-ink">Related Focus &amp; ADHD guides</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {relatedLinks.filter(([relatedSlug]) => relatedSlug !== slug).map(([relatedSlug, label]) => (
            <Link key={relatedSlug} href={`/articles/${relatedSlug}`} className="rounded-[0.75rem] border border-brand-900/10 bg-white/80 px-3 py-2 text-sm font-semibold text-brand-800 hover:border-brand-900/20 hover:bg-white">
              {label}
            </Link>
          ))}
        </div>
      </section>

      <div className="mt-8">
        <Link href="/articles" className="text-sm font-semibold text-brand-700 hover:text-brand-800">Back to Articles</Link>
      </div>
    </article>
  )
}
