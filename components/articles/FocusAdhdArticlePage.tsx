import Link from 'next/link'
import Image from 'next/image'
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
import CitationReadySummary from '@/components/seo/CitationReadySummary'

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

// Per-slug hero images (1536x1024) for image SEO + engagement.
const ADHD_ARTICLE_IMAGES: Record<string, { src: string; alt: string }> = {
  'adhd-blood-tests': { src: '/images/guides/adhd/adhd-blood-tests.jpg', alt: 'Blood test tube and supplement capsules — checking nutrient levels relevant to ADHD' },
  'adhd-stack-guide': { src: '/images/guides/adhd/adhd-supplements-general.jpg', alt: 'An assortment of ADHD supplement capsules with a weekly pill organizer' },
  'alpha-gpc-and-adhd': { src: '/images/guides/adhd/adhd-choline.jpg', alt: 'Alpha-GPC choline nootropic capsules with a lion’s mane mushroom' },
  'ashwagandha-for-adhd': { src: '/images/guides/adhd/adhd-ashwagandha.jpg', alt: 'Ashwagandha root, powder, and leaves — an adaptogen studied for stress and ADHD' },
  'best-magnesium-supplement-for-adhd': { src: '/images/guides/adhd/adhd-magnesium.jpg', alt: 'Magnesium glycinate capsules and powder used for calm and focus in ADHD' },
  'best-supplements-for-adhd': { src: '/images/guides/adhd/adhd-supplements-general.jpg', alt: 'A stack of natural supplements commonly used to support ADHD' },
  'citicoline-for-adhd': { src: '/images/guides/adhd/adhd-choline.jpg', alt: 'Citicoline nootropic capsules used to support attention and focus' },
  'citicoline-vs-alpha-gpc': { src: '/images/guides/adhd/adhd-choline.jpg', alt: 'Choline nootropic capsules comparing citicoline and alpha-GPC for focus' },
  'iron-ferritin-and-adhd': { src: '/images/guides/adhd/adhd-iron.jpg', alt: 'Iron supplement capsules with iron-rich leafy greens, relevant to ferritin and ADHD' },
  'l-theanine-for-adhd': { src: '/images/guides/adhd/adhd-l-theanine.jpg', alt: 'L-theanine capsules and green tea used for calm, focused attention' },
  'l-theanine-magnesium-adhd-stack': { src: '/images/guides/adhd/adhd-l-theanine.jpg', alt: 'L-theanine and magnesium supplements used together as a calming focus stack' },
  'l-theanine-vs-caffeine-for-focus': { src: '/images/guides/adhd/adhd-l-theanine-caffeine.jpg', alt: 'Green tea and coffee side by side — comparing L-theanine and caffeine for focus' },
  'l-theanine-without-caffeine': { src: '/images/guides/adhd/adhd-l-theanine.jpg', alt: 'Caffeine-free L-theanine capsules and green tea leaves' },
  'l-tyrosine-and-adhd': { src: '/images/guides/adhd/adhd-l-tyrosine.jpg', alt: 'L-tyrosine powder and capsules used to support focus and dopamine in ADHD' },
  'magnesium-for-adhd': { src: '/images/guides/adhd/adhd-magnesium.jpg', alt: 'Magnesium glycinate capsules and powder used for calm and focus in ADHD' },
  'magnesium-glycinate-vs-citrate-for-adhd': { src: '/images/guides/adhd/adhd-magnesium.jpg', alt: 'Magnesium supplements comparing glycinate and citrate forms for ADHD' },
  'melatonin-for-adhd-sleep': { src: '/images/guides/adhd/adhd-melatonin-sleep.jpg', alt: 'Melatonin tablets on a calm bedside setting used for ADHD-related sleep problems' },
  'nutrient-deficiencies-and-adhd': { src: '/images/guides/adhd/adhd-nutrient-deficiency.jpg', alt: 'Nutrient-rich whole foods and supplements linked to nutrient deficiencies in ADHD' },
  'omega-3-and-adhd': { src: '/images/guides/adhd/adhd-omega3.jpg', alt: 'Omega-3 fish oil softgel capsules used to support attention in ADHD' },
  'rhodiola-rosea-and-adhd': { src: '/images/guides/adhd/adhd-rhodiola.jpg', alt: 'Rhodiola rosea root and flowers — an adaptogen for mental energy and ADHD' },
  'sleep-and-adhd': { src: '/images/guides/adhd/adhd-sleep.jpg', alt: 'A calm bedroom nightstand with water and supplements — sleep and ADHD' },
  'vitamin-d-and-adhd': { src: '/images/guides/adhd/adhd-vitamin-d.jpg', alt: 'Vitamin D softgel capsules in warm sunlight, relevant to ADHD' },
  'zinc-and-adhd': { src: '/images/guides/adhd/adhd-zinc.jpg', alt: 'Zinc supplement tablets with pumpkin seeds, a dietary zinc source, for ADHD' },
}

const focusArticleSlugs = new Set(focusAdhdArticles.map((article) => article.slug))
const ADHD_GUIDE_BASE = '/guides/adhd'

function articleLink(slug: string, label: string, eyebrow: string): RelatedLink | null {
  if (!focusArticleSlugs.has(slug)) return null
  return {
    href: `${ADHD_GUIDE_BASE}/${slug}/`,
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

function getCitationSummary(article: NonNullable<ReturnType<typeof getFocusAdhdArticle>>) {
  const isComparison = / vs | versus |comparison/i.test(article.title)
  const isSleep = article.tags.some((tag) => /sleep/i.test(tag))
  const isDeficiency = article.tags.some((tag) => /deficien/i.test(tag))
  const isStack = /stack/i.test(article.title)

  return {
    answer: `${article.title}. ${article.description} The practical takeaway is to match the supplement to the specific use case, evidence level, safety context, and any medication or lab-testing considerations.`,
    bestFor: [
      isComparison ? 'Readers deciding between two supplement options or forms.' : 'Readers who want a conservative, evidence-first starting point.',
      isSleep ? 'Sleep-related attention problems, delayed sleep, or bedtime arousal questions.' : 'Focus, attention, or cognitive-support questions where expectations need to stay realistic.',
      isDeficiency ? 'Nutrient-status questions where testing or documented low intake changes the decision.' : 'Supplement decisions that need safety, dosing, and interaction context before product choice.',
    ],
    evidenceLevel: isStack
      ? 'Mixed by ingredient; stack guidance depends on the weakest evidence and highest safety risk in the combination.'
      : 'Varies by ingredient and population; the page separates ADHD-specific evidence from broader cognitive, sleep, stress, or mechanistic evidence.',
    safetyNote: 'Use supplements as adjuncts, not replacements for ADHD care. Children, pregnancy, psychiatric medication, stimulants, sedatives, anticoagulants, and complex health conditions need clinician review.',
    notClaiming: 'This page is not claiming that supplements diagnose, treat, cure, or replace evidence-based ADHD treatment.',
  }
}

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

    return dedupeRelatedLinks(curatedLinks, `${ADHD_GUIDE_BASE}/${slug}/`)
  }

  const links: RelatedLink[] = [routeLink('/guides/adhd/adhd-supplements/', 'ADHD Supplements Guide', 'Start here')]

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

  return dedupeRelatedLinks(links, `${ADHD_GUIDE_BASE}/${slug}/`)
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

function headingId(text: string) {
  const normalized = text.toLowerCase().replace(/<[^>]+>/g, '')
  if (normalized.includes('references')) return 'references'
  if (normalized.includes('faq') || normalized.includes('frequently asked questions')) return 'faq'
  return undefined
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
          blockEl = <h2 key={index} id={headingId(block.text)} className="mt-10 scroll-mt-24 text-2xl font-semibold tracking-tight text-ink first:mt-0" dangerouslySetInnerHTML={{ __html: inlineFormat(block.text) }} />
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

export function focusAdhdMetadata(slug: string, basePath: string = ADHD_GUIDE_BASE): Metadata {
  const article = focusAdhdArticles.find((item) => item.slug === slug)
  if (!article) return {}
  return buildPageMetadata({
    title: article.seoTitle,
    description: article.description,
    path: `${basePath}/${slug}`,
    openGraphType: 'article',
  })
}

export default function FocusAdhdArticlePage({ slug, basePath = ADHD_GUIDE_BASE }: { slug: string; basePath?: string }) {
  const article = getFocusAdhdArticle(slug)
  if (!article) notFound()
  const related = getRelatedFocusAdhdLinks(slug)
  const articlePath = `${basePath}/${article.slug}`

  const articleLd = blogJsonLd({
    title: article.title,
    slug: article.slug,
    date: article.date,
    updated: article.date,
    excerpt: article.description,
  }, articlePath)
  const breadcrumbLd = breadcrumbJsonLd([
    { name: 'Guides', url: 'https://thehippiescientist.net/guides' },
    { name: basePath === ADHD_GUIDE_BASE ? 'ADHD' : 'Focus', url: `https://thehippiescientist.net${basePath}` },
    { name: article.title, url: `https://thehippiescientist.net${articlePath}` },
  ])

  return (
    <article className="mx-auto max-w-5xl px-4 pb-20 pt-6 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <nav className="mb-6 flex items-center gap-2 text-sm text-muted">
        <Link href="/guides/" className="transition hover:text-ink">Guides</Link>
        <span>/</span>
        <Link href={basePath === ADHD_GUIDE_BASE ? "/guides/adhd/" : "/guides/focus/"} className="transition hover:text-ink">{basePath === ADHD_GUIDE_BASE ? "ADHD" : "Focus"}</Link>
        <span>/</span>
        <span className="line-clamp-1 text-ink">{article.title}</span>
      </nav>

      <section className="border-b border-brand-900/15 pb-8 pt-4 sm:pb-10 sm:pt-6">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full border border-brand-900/10 bg-brand-50 px-2.5 py-0.5 font-bold uppercase tracking-wider text-brand-800">{article.category}</span>
          {article.tags.slice(0, 4).map((tag) => <span key={tag} className="rounded-full border border-brand-900/10 bg-white px-2.5 py-0.5 font-semibold text-muted">{tag}</span>)}
          <span className="text-muted">{article.readingTime}</span>
        </div>
        <h1 className="mt-4 max-w-[22ch] font-display text-2xl font-bold leading-[1.08] text-ink sm:text-4xl lg:text-5xl">{article.title}</h1>
        <div className="mt-3"><LastUpdatedBadge date={article.date} label="Last updated" /></div>
        <p className="mt-4 max-w-3xl text-base leading-7 text-muted">{article.description}</p>

        {ADHD_ARTICLE_IMAGES[slug] && (
          <figure className="mt-6">
            <div className="overflow-hidden rounded-2xl border border-brand-900/10 shadow-sm bg-white">
              <Image
                src={ADHD_ARTICLE_IMAGES[slug].src}
                alt={ADHD_ARTICLE_IMAGES[slug].alt}
                width={1536}
                height={1024}
                priority
                className="w-full h-auto"
              />
            </div>
          </figure>
        )}

        <StartHereBox currentSlug={slug} />
      </section>

      <div className="mt-6">
        <CitationReadySummary {...getCitationSummary(article)} referencesHref="#references" />
      </div>

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
        <Link href="/guides/adhd/" className="text-sm font-semibold text-brand-700 hover:text-brand-800">Back to ADHD Guides</Link>
      </div>
    </article>
  )
}
