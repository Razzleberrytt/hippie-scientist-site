import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import React from 'react'

import AffiliateDisclosure from '@/components/AffiliateDisclosure'
import EmailCapture from '@/components/articles/EmailCapture'
import ProductCriteriaBox from '@/components/articles/ProductCriteriaBox'
import ResponsiveTable from '@/components/ui/ResponsiveTable'
import SchemaOrg from '@/components/SchemaOrg'
import SeeAlsoInCluster from '@/components/SeeAlsoInCluster'
import {
  focusClusterArticleSources,
  getFocusClusterArticle,
} from '@/lib/focus-cluster-markdown'
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL, TWITTER_HANDLE } from '@/lib/seo'

const FOCUS_CLUSTER_SITE_URL = 'https://thehippiescientist.net'
const ADHD_CHECKLIST_CAPTURE = {
  title: 'Get the ADHD Supplement Starter Checklist',
  description: 'A simple 4-week tracker for choosing one supplement at a time, watching side effects, and avoiding messy stimulant-heavy stacks.',
  ctaLabel: 'Send me the checklist',
  magnet: 'adhd-supplement-starter-checklist',
}

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

type CriteriaConfig = {
  title: string
  criteria: string[]
  avoidList?: string[]
  ctaLabel?: string
  ctaHref?: string
  afterSectionContaining: string
}

function getCriteriaForSlug(slug: string): CriteriaConfig | null {
  switch (slug) {
    case 'best-supplements-for-adhd':
      return {
        title: 'What to Look For in ADHD Supplements',
        criteria: [
          'Third-party tested (USP, NSF, Informed Sport, or equivalent)',
          'Active dose clearly labeled — not just total formula weight',
          'Evidence-fit for your goal: omega-3 for attention support, magnesium glycinate for sleep and calm, L-theanine for relaxed focus',
          'No proprietary blends that hide individual ingredient amounts',
        ],
        avoidList: [
          '"ADHD Support" blends with undisclosed or combined-dose ingredients',
          'Products claiming to replace or replicate medication effects',
          'Stacks with many stimulant or nootropic ingredients at unverified doses',
        ],
        afterSectionContaining: 'buy first',
      }
    case 'omega-3-for-adhd':
      return {
        title: 'What to Look For in an Omega-3 for ADHD',
        criteria: [
          'EPA-dominant formula — EPA content should exceed DHA for ADHD-related attention support',
          'EPA and DHA amounts clearly listed on the label (not just "fish oil concentrate")',
          'Third-party tested for heavy metals and oxidation (IFOS, NSF, or equivalent)',
          'Freshness indicators: low TOTOX score or distilled oil; no rancid smell on opening',
        ],
        avoidList: [
          'Vague "1,000 mg fish oil" labels with low or unlisted EPA/DHA content',
          'Products with no freshness or oxidation testing disclosed',
          'Formulas where combined EPA + DHA is less than 60% of total oil weight',
        ],
        afterSectionContaining: 'look for in a fish oil',
      }
    case 'magnesium-for-adhd':
      return {
        title: 'What to Look For in a Magnesium Supplement for ADHD',
        criteria: [
          'Form: glycinate or bisglycinate for calm and sleep support',
          'Elemental magnesium clearly labeled — not just total compound weight',
          'Gentle on digestion; glycinate forms are typically better tolerated than oxide or citrate at higher doses',
          'No unnecessary additives, artificial colors, or stimulant co-ingredients',
        ],
        avoidList: [
          'Magnesium oxide listed as the main or only form — poor bioavailability and high laxative effect',
          'Labels that show "magnesium 400 mg" without specifying elemental vs. compound weight',
          'Blends that combine magnesium with stimulant herbs (ginseng, guarana, etc.)',
        ],
        afterSectionContaining: 'magnesium forms',
      }
    case 'l-theanine-for-adhd':
      return {
        title: 'What to Look For in an L-Theanine Supplement',
        criteria: [
          'Standalone L-theanine — not buried in a proprietary blend',
          '100–200 mg per serving: the range used in most attention and sleep trials',
          'Caffeine-free unless you intentionally want the L-theanine + caffeine combination',
          'Third-party tested for purity; pharmaceutical-grade L-theanine (e.g., Suntheanine) preferred by researchers',
        ],
        avoidList: [
          'Proprietary blends where L-theanine content is unlisted or marked as "blend"',
          'Products with hidden caffeine from green tea extract in calming-positioned formulas',
          'Supplements making "ADHD treatment" claims — L-theanine is a support option, not a diagnostic therapy',
        ],
        afterSectionContaining: 'l-theanine dosage for adhd',
      }
    case 'citicoline-vs-alpha-gpc':
      return {
        title: 'What to Look For in Citicoline or Alpha-GPC',
        criteria: [
          'Citicoline: 250–500 mg per serving (Cognizin is the most-studied branded form)',
          'Alpha-GPC: 300 mg starting dose; 50% active compound form is standard',
          'Clear labeling of the exact compound — not just "choline complex"',
          'Single-ingredient or clearly dosed formulas; avoid stacks where the choline source amount is unlisted',
        ],
        avoidList: [
          'Stacking high-dose citicoline and Alpha-GPC simultaneously without medical guidance',
          'Proprietary "nootropic blends" with combined choline content unlisted',
          'Supplements marketing themselves as ADHD medication replacements',
        ],
        afterSectionContaining: 'alpha-gpc dosage',
      }
    case 'best-supplements-for-focus-without-caffeine':
      return {
        title: 'What to Look For in Caffeine-Free Focus Supplements',
        criteria: [
          'No caffeine, guarana, yerba mate, or other stimulant sources anywhere in the formula',
          'Active doses clearly listed — not hidden in a proprietary blend',
          'Goal-specific ingredient: L-theanine for calm focus, citicoline for attention, magnesium glycinate for sleep clarity',
          'Third-party tested; single-ingredient products are easier to verify than multi-ingredient stacks',
        ],
        avoidList: [
          '"Caffeine-free" labels on products that contain green tea extract, guarana, or stimulant-adjacent ingredients',
          'Proprietary nootropic blends with many ingredients but no individual doses listed',
          'Products marketed with vague "brain boost" claims without referenced evidence',
        ],
        afterSectionContaining: 'how we ranked',
      }
    default:
      return null
  }
}

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
      site: TWITTER_HANDLE,
      creator: TWITTER_HANDLE,
    },
    robots: { index: true, follow: true },
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

function MarkdownArticle({ markdown, slug }: { markdown: string; slug: string }) {
  const blocks = parseBlocks(markdown)
  const config = getCriteriaForSlug(slug)

  // Email capture: inject before FAQ section or near end
  const faqIndex = blocks.findIndex(
    (block) => block.type === 'h2' && /^(faq|frequently asked questions)\b/i.test(block.text),
  )
  const captureIndex = faqIndex >= 0 ? faqIndex : Math.max(blocks.length - 1, 0)

  // Criteria block: inject at end of target section (before the next h2)
  let criteriaInsertIndex = -1
  if (config) {
    const searchText = config.afterSectionContaining.toLowerCase()
    const matchedIndex = blocks.findIndex(
      (b) => (b.type === 'h2' || b.type === 'h3') && b.text.toLowerCase().includes(searchText),
    )
    if (matchedIndex !== -1) {
      let nextH2Index = blocks.length
      for (let i = matchedIndex + 1; i < blocks.length; i++) {
        if (blocks[i].type === 'h2') {
          nextH2Index = i
          break
        }
      }
      criteriaInsertIndex = nextH2Index
    }
  }

  return (
    <div className="space-y-5">
      {blocks.map((block, index) => {
        const capture = index === captureIndex ? <EmailCapture {...ADHD_CHECKLIST_CAPTURE} /> : null
        const criteriaBlock =
          config && criteriaInsertIndex !== -1 && index === criteriaInsertIndex ? (
            <>
              <AffiliateDisclosure variant="compact" className="mt-6" />
              <ProductCriteriaBox
                title={config.title}
                criteria={config.criteria}
                avoidList={config.avoidList}
                ctaLabel={config.ctaLabel}
                ctaHref={config.ctaHref}
              />
            </>
          ) : null

        if (block.type === 'h2') {
          return (
            <React.Fragment key={index}>
              {criteriaBlock}
              {capture}
              <h2 className="mt-11 text-2xl font-semibold tracking-tight text-ink first:mt-0">
                {renderInline(block.text)}
              </h2>
            </React.Fragment>
          )
        }

        if (block.type === 'h3') {
          return (
            <React.Fragment key={index}>
              {criteriaBlock}
              {capture}
              <h3 className="mt-8 text-xl font-semibold tracking-tight text-ink">
                {renderInline(block.text)}
              </h3>
            </React.Fragment>
          )
        }

        if (block.type === 'h4') {
          return (
            <React.Fragment key={index}>
              {criteriaBlock}
              {capture}
              <h4 className="mt-6 text-lg font-semibold tracking-tight text-ink">
                {renderInline(block.text)}
              </h4>
            </React.Fragment>
          )
        }

        if (block.type === 'p') {
          return (
            <React.Fragment key={index}>
              {criteriaBlock}
              {capture}
              <p className="text-[1.03rem] leading-8 text-[#46574d]">
                {renderInline(block.text)}
              </p>
            </React.Fragment>
          )
        }

        if (block.type === 'blockquote') {
          return (
            <React.Fragment key={index}>
              {criteriaBlock}
              {capture}
              <blockquote className="border-l-4 border-brand-700/30 bg-brand-50/60 py-3 pl-4 pr-3 text-[1.01rem] leading-8 text-[#46574d]">
                {renderInline(block.text)}
              </blockquote>
            </React.Fragment>
          )
        }

        if (block.type === 'ul' || block.type === 'ol') {
          const List = block.type
          return (
            <React.Fragment key={index}>
              {criteriaBlock}
              {capture}
              <List className={`ml-6 space-y-2 text-[1.01rem] leading-8 text-[#46574d] ${block.type === 'ul' ? 'list-disc' : 'list-decimal'}`}>
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex}>{renderInline(item)}</li>
                ))}
              </List>
            </React.Fragment>
          )
        }

        if (block.type === 'table') {
          return (
            <React.Fragment key={index}>
              {criteriaBlock}
              {capture}
              <ResponsiveTable label="Article table" className="my-7">
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
            </React.Fragment>
          )
        }

        return (
          <React.Fragment key={index}>
            {criteriaBlock}
            {capture}
            <hr className="my-8 border-brand-900/10" />
          </React.Fragment>
        )
      })}
      {config && criteriaInsertIndex === blocks.length && (
        <>
          <AffiliateDisclosure variant="compact" className="mt-6" />
          <ProductCriteriaBox
            title={config.title}
            criteria={config.criteria}
            avoidList={config.avoidList}
            ctaLabel={config.ctaLabel}
            ctaHref={config.ctaHref}
          />
        </>
      )}
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
    <SchemaOrg node={graph} />
  )
}

export default async function FocusClusterRootArticlePage({ params }: { params: PageParams }) {
  const { slug } = await params
  const article = getFocusClusterArticle(slug)
  if (!article) notFound()

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
        <MarkdownArticle markdown={article.markdown} slug={article.slug} />
      </section>

      {getCriteriaForSlug(article.slug) !== null && (
        <AffiliateDisclosure variant="full" className="mt-10" />
      )}

      <SeeAlsoInCluster currentPath={`/${article.slug}`} title="More Focus & ADHD guides" />
    </article>
  )
}
