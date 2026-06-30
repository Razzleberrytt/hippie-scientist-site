import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import React from 'react'

import { buildPageMetadata, blogJsonLd, breadcrumbJsonLd } from '../../src/lib/seo'
import LastUpdatedBadge from '../../src/components/editorial/LastUpdatedBadge'
import ResponsiveTable from '@/components/ui/ResponsiveTable'
import { getFocusAdhdArticle, focusAdhdArticles } from '@/lib/focus-adhd-articles'
import AffiliateDisclosure from '../AffiliateDisclosure'
import { StartHereBox, AdhdCtaDashboard, AdhdComparisonCard, AdhdInlineCta, getAdhdCtasForSlug } from './AdhdMonetizationWidgets'
import EmailCapture from '@/components/EmailCapture'
import RecommendedProduct from '../RecommendedProduct'

type Block =
  | { type: 'h2' | 'h3' | 'h4'; text: string }
  | { type: 'p'; text: string }
  | { type: 'ul' | 'ol'; items: string[] }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'hr' }

type RelatedLink = {
  href: string
  label: string
  eyebrow: string
}

const ADHD_ARTICLE_PRODUCTS: Record<string, string> = {
  'adhd-stack-guide': 'magnesium',
  'ashwagandha-for-adhd': 'ashwagandha',
  'best-supplements-for-adhd': 'magnesium',
  'citicoline-vs-alpha-gpc': 'lions-mane',
  'l-theanine-for-adhd': 'l-theanine',
  'l-theanine-vs-caffeine-for-focus': 'l-theanine',
  'magnesium-for-adhd': 'magnesium',
  'melatonin-for-adhd-sleep': 'magnesium',
  'sleep-and-adhd': 'magnesium',
}

const focusArticleSlugs = new Set(focusAdhdArticles.map((article) => article.slug))

function articleLink(slug: string, label: string, eyebrow: string): RelatedLink | null {
  if (!focusArticleSlugs.has(slug)) return null
  return {
    href: `/articles/${slug}/`,
    label,
    eyebrow,
  }
}

function routeLink(href: string, label: string, eyebrow: string): RelatedLink {
  return { href, label, eyebrow }
}

function addRelatedLinks(links: RelatedLink[], ...nextLinks: Array<RelatedLink | null>): void {
  links.push(...nextLinks.filter((link): link is RelatedLink => Boolean(link)))
}

function dedupeRelatedLinks(links: RelatedLink[], currentArticleHref: string): RelatedLink[] {
  const seen = new Set<string>()
  const deduped: RelatedLink[] = []

  for (const link of links) {
    if (link.href === currentArticleHref || seen.has(link.href)) continue
    seen.add(link.href)
    deduped.push(link)
    if (deduped.length >= 8) break
  }

  return deduped
}

const deficiencyArticleSlugs = new Set([
  'iron-ferritin-and-adhd',
  'vitamin-d-and-adhd',
  'zinc-and-adhd',
  'magnesium-for-adhd',
  'omega-3-and-adhd',
  'nutrient-deficiencies-and-adhd',
  'adhd-blood-tests',
])

const sleepCalmArticleSlugs = new Set([
  'sleep-and-adhd',
  'l-theanine-for-adhd',
  'melatonin-for-adhd-sleep',
  'ashwagandha-for-adhd',
  'magnesium-for-adhd',
])

const cognitiveFocusArticleSlugs = new Set([
  'citicoline-vs-alpha-gpc',
  'l-theanine-vs-caffeine-for-focus',
  'l-tyrosine-and-adhd',
  'alpha-gpc-and-adhd',
  'citicoline-for-adhd',
  'rhodiola-rosea-and-adhd',
])

function getRelatedFocusAdhdLinks(slug: string): RelatedLink[] {
  if (slug === 'citicoline-vs-alpha-gpc') {
    const curatedLinks: RelatedLink[] = []

    addRelatedLinks(
      curatedLinks,
      articleLink('citicoline-for-adhd', 'Citicoline for ADHD', 'Choline guide'),
      articleLink('alpha-gpc-and-adhd', 'Alpha-GPC for ADHD', 'Choline guide'),
      articleLink('best-supplements-for-adhd', 'Best Supplements for ADHD', 'Core guide'),
      articleLink('adhd-stack-guide', 'ADHD Stack Guide', 'Stack guide'),
      articleLink('l-theanine-vs-caffeine-for-focus', 'L-Theanine vs Caffeine for Focus', 'Focus comparison'),
      articleLink('l-theanine-for-adhd', 'L-Theanine for ADHD', 'Calm focus'),
      articleLink('omega-3-and-adhd', 'Omega-3 and ADHD', 'Evidence guide'),
      routeLink('/learn/cholinergic-system', 'Cholinergic System', 'Mechanism guide'),
    )

    return dedupeRelatedLinks(curatedLinks, `/articles/${slug}/`)
  }

  const links: RelatedLink[] = [routeLink('/guides/adhd-supplements/', 'ADHD Supplements Guide', 'Start here')]

  addRelatedLinks(
    links,
    articleLink('best-supplements-for-adhd', 'Best Supplements for ADHD', 'Core guide'),
    articleLink('adhd-stack-guide', 'ADHD Stack Guide', 'Stack guide'),
  )

  if (deficiencyArticleSlugs.has(slug)) {
    addRelatedLinks(
      links,
      articleLink('nutrient-deficiencies-and-adhd', 'Nutrient Deficiencies and ADHD', 'Deficiency guide'),
      articleLink('adhd-blood-tests', 'ADHD Blood Tests Guide', 'Testing guide'),
      articleLink('iron-ferritin-and-adhd', 'Iron/Ferritin and ADHD', 'Iron status'),
      articleLink('vitamin-d-and-adhd', 'Vitamin D and ADHD', 'Vitamin D'),
      articleLink('zinc-and-adhd', 'Zinc and ADHD', 'Mineral guide'),
      articleLink('magnesium-for-adhd', 'Magnesium for ADHD', 'Mineral guide'),
      articleLink('omega-3-and-adhd', 'Omega-3 and ADHD', 'Fatty acids'),
      // Phase 3a: magnesium form guidance
      articleLink('magnesium-glycinate-vs-citrate-for-adhd', 'Glycinate vs Citrate for ADHD', 'Form guide'),
      articleLink('best-magnesium-supplement-for-adhd', 'Best Magnesium for ADHD', 'Buying guide'),
    )
  } else if (sleepCalmArticleSlugs.has(slug)) {
    addRelatedLinks(
      links,
      articleLink('sleep-and-adhd', 'Sleep and ADHD', 'Sleep guide'),
      articleLink('melatonin-for-adhd-sleep', 'Melatonin for ADHD Sleep', 'Sleep timing'),
      articleLink('l-theanine-for-adhd', 'L-Theanine for ADHD', 'Calm focus'),
      articleLink('magnesium-for-adhd', 'Magnesium for ADHD', 'Calm support'),
      // Phase 3a: new stack + form pages
      articleLink('l-theanine-magnesium-adhd-stack', 'L-Theanine + Magnesium Stack', 'Stack guide'),
      articleLink('l-theanine-without-caffeine', 'L-Theanine Without Caffeine', 'Caffeine-free focus'),
      routeLink('/guides/sleep/l-theanine-for-sleep/', 'L-Theanine for Sleep', 'Sleep guide'),
      routeLink('/guides/sleep/magnesium-types-for-sleep/', 'Magnesium Types for Sleep', 'Sleep guide'),
      routeLink('/guides/sleep/best-herbs-for-sleep/', 'Best Herbs for Sleep', 'Sleep guide'),
    )
  } else if (cognitiveFocusArticleSlugs.has(slug)) {
    addRelatedLinks(
      links,
      articleLink('adhd-stack-guide', 'ADHD Stack Guide', 'Stack guide'),
      articleLink('best-supplements-for-adhd', 'Best Supplements for ADHD', 'Core guide'),
      articleLink('citicoline-for-adhd', 'Citicoline for ADHD', 'Choline guide'),
      articleLink('citicoline-vs-alpha-gpc', 'Citicoline vs Alpha-GPC', 'Choline comparison'),
      articleLink('l-tyrosine-and-adhd', 'L-Tyrosine for ADHD', 'Stress focus'),
      articleLink('rhodiola-rosea-and-adhd', 'Rhodiola Rosea for ADHD', 'Stress fatigue'),
      articleLink('l-theanine-vs-caffeine-for-focus', 'L-Theanine vs Caffeine for Focus', 'Focus comparison'),
      articleLink('l-theanine-for-adhd', 'L-Theanine for ADHD', 'Calm focus'),
      articleLink('omega-3-and-adhd', 'Omega-3 and ADHD', 'Fatty acids'),
      // Phase 3a: caffeine-free focus option
      articleLink('l-theanine-without-caffeine', 'L-Theanine Without Caffeine', 'Caffeine-free focus'),
    )
  }

  return dedupeRelatedLinks(links, `/articles/${slug}/`)
}

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
      const safePrefixes = /^(https?:\/\/|\/)/i
      const safeHref = safePrefixes.test(href.trim()) ? href.trim() : '#'
      const external = /^https?:\/\//i.test(safeHref)
      const escapedHref = safeHref.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      const safeLabel = label.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      return `<a href="${escapedHref}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''} class="font-semibold text-brand-700 hover:text-brand-800 hover:underline">${safeLabel}</a>`
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
              {block.items.map((item, itemIndex) => <li key={itemIndex} className="leading-7 text-muted" dangerouslySetInnerHTML={{ __html: inlineFormat(item) }} />)}
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
                      {row.map((cell, cellIndex) => <td key={cellIndex} className="py-3 pr-4 leading-6 text-muted" dangerouslySetInnerHTML={{ __html: inlineFormat(cell) }} />)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </ResponsiveTable>
          )
        } else if (block.type === 'p') {
          blockEl = <p key={index} className="text-[1.01rem] leading-[1.85] text-muted" dangerouslySetInnerHTML={{ __html: inlineFormat(block.text) }} />
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
  const related = getRelatedFocusAdhdLinks(slug)

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
        <Link href="/articles/" className="transition hover:text-ink">Articles</Link>
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
        <p className="mt-4 max-w-3xl text-base leading-7 text-muted">{article.description}</p>

        <StartHereBox currentSlug={slug} />
      </section>

      <section className="mt-6 rounded-[1rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8">
        <AffiliateDisclosure variant="compact" className="mb-6" />

        <MarkdownBody body={article.body} slug={slug} />

        <AdhdComparisonCard slug={slug} />

        <AdhdCtaDashboard currentSlug={slug} />

        {ADHD_ARTICLE_PRODUCTS[slug] && (
          <div className="mt-6">
            <RecommendedProduct
              slug={ADHD_ARTICLE_PRODUCTS[slug]}
              title="Evidence-based starting points"
              limit={2}
            />
          </div>
        )}

        <EmailCapture
          headline="Get the ADHD supplement checklist"
          description="Receive our evidence-first supplement checklist, safety reminders, and updates on ADHD nutrient research. No medical claims or personalized advice."
          ctaLabel="Get Checklist"
          location="adhd-articles"
          className="mt-8"
        />

        <AffiliateDisclosure variant="full" className="mt-8" />
      </section>

      {['sleep-and-adhd', 'magnesium-for-adhd', 'l-theanine-for-adhd', 'melatonin-for-adhd-sleep'].includes(slug) && (
        <section className="mt-6 rounded-[1rem] border border-brand-900/10 bg-white/90 p-5 shadow-sm">
          <h2 className="text-lg font-semibold tracking-tight text-ink">Related Sleep &amp; Calm Guides</h2>
          <p className="text-xs text-muted mt-1">For general sleep research and comparative guides on these ingredients:</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <Link href="/guides/sleep/l-theanine-for-sleep/" className="rounded-[0.75rem] border border-brand-900/10 bg-brand-50/30 px-3 py-2 text-sm font-semibold text-brand-800 hover:border-brand-900/20 hover:bg-white transition">
              L-Theanine for Sleep →
            </Link>
            <Link href="/guides/sleep/magnesium-types-for-sleep/" className="rounded-[0.75rem] border border-brand-900/10 bg-brand-50/30 px-3 py-2 text-sm font-semibold text-brand-800 hover:border-brand-900/20 hover:bg-white transition">
              Magnesium Types for Sleep →
            </Link>
            <Link href="/guides/sleep/best-herbs-for-sleep/" className="rounded-[0.75rem] border border-brand-900/10 bg-brand-50/30 px-3 py-2 text-sm font-semibold text-brand-800 hover:border-brand-900/20 hover:bg-white transition">
              Best Herbs for Sleep →
            </Link>
          </div>
        </section>
      )}

      <section className="mt-6 rounded-[1rem] border border-brand-900/10 bg-brand-50/70 p-5">
        <h2 className="text-lg font-semibold tracking-tight text-ink">Related Focus, ADHD &amp; Sleep guides</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {related.map((link) => (
            <Link key={link.href} href={link.href} className="rounded-[0.75rem] border border-brand-900/10 bg-white/80 px-3 py-2 text-sm font-semibold text-brand-800 hover:border-brand-900/20 hover:bg-white">
              <span className="block text-[0.68rem] font-bold uppercase tracking-wider text-muted">{link.eyebrow}</span>
              <span className="mt-0.5 block">{link.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <div className="mt-8">
        <Link href="/articles/" className="text-sm font-semibold text-brand-700 hover:text-brand-800">Back to Articles</Link>
      </div>
    </article>
  )
}
