#!/usr/bin/env node
/**
 * create-content-page.mjs
 *
 * Interactive scaffold for new static content pages.
 * Usage: node scripts/create-content-page.mjs
 *   or:  npm run create:page
 *
 * Generates to:
 *   article → app/articles/<slug>/page.tsx
 *   guide   → app/guides/<slug>/page.tsx
 *   compare → app/compare/<slug>/page.tsx
 */

import fs from 'fs'
import path from 'path'
import readline from 'readline'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const TODAY = new Date().toISOString().slice(0, 10)

// ─── Slug helpers ────────────────────────────────────────────────────────────

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function isValidSlug(slug) {
  return /^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(slug) || /^[a-z0-9]$/.test(slug)
}

function checkSlugUniqueness(type, slug) {
  const typeMap = { article: 'articles', guide: 'guides', compare: 'compare' }
  const dir = path.join(ROOT, 'app', typeMap[type], slug)
  if (fs.existsSync(dir)) {
    return { taken: true, conflict: `app/${typeMap[type]}/${slug}/ already exists` }
  }
  // For articles also check the JSON data source
  if (type === 'article') {
    const jsonPath = path.join(ROOT, 'data', 'articles', 'articles.json')
    if (fs.existsSync(jsonPath)) {
      const articles = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))
      if (articles.some((a) => a.slug === slug)) {
        return { taken: true, conflict: `Slug "${slug}" is already in data/articles/articles.json` }
      }
    }
  }
  return { taken: false }
}

// ─── readline prompt helper ──────────────────────────────────────────────────

function prompt(rl, question) {
  return new Promise((resolve) => rl.question(question, (answer) => resolve(answer.trim())))
}

// ─── Page templates ──────────────────────────────────────────────────────────

function articleTemplate(slug, title, description) {
  const functionName = slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('')

  return `import Link from 'next/link'
import { buildPageMetadata, blogJsonLd, breadcrumbJsonLd, faqPageJsonLd } from '@/lib/seo'
import EvidenceSummaryCard from '@/components/evidence/EvidenceSummaryCard'
import SafetyNotice from '@/components/evidence/SafetyNotice'
import LastUpdatedBadge from '@/components/editorial/LastUpdatedBadge'
import { AFFILIATE_TAGS } from '@/config/affiliate'

const SLUG = '${slug}'
const TITLE = '${title}'
const DESCRIPTION =
  '${description}'
const DATE = '${TODAY}'

export const metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: \`/articles/\${SLUG}\`,
  openGraphType: 'article',
})

const FAQS = [
  {
    question: 'TODO: Add a relevant question here?',
    answer:
      'TODO: Add a well-sourced, balanced answer. Avoid clinical claims. Use hedged language (may, has been studied for, some research suggests).',
  },
  {
    question: 'TODO: Another common question?',
    answer: 'TODO: Answer here.',
  },
]

export default function ${functionName}Page() {
  void AFFILIATE_TAGS.amazon // used via RecommendationSection when products are added

  const pageBreadcrumb = breadcrumbJsonLd([
    { name: 'Home', url: 'https://thehippiescientist.net' },
    { name: 'Articles', url: 'https://thehippiescientist.net/articles' },
    { name: TITLE, url: \`https://thehippiescientist.net/articles/\${SLUG}\` },
  ])

  const articleLd = blogJsonLd(
    { title: TITLE, slug: SLUG, date: DATE, description: DESCRIPTION },
    \`/articles/\${SLUG}\`,
  )

  const faqLd = faqPageJsonLd({ pagePath: \`/articles/\${SLUG}\`, questions: FAQS })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageBreadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <nav className="mb-6 flex items-center gap-2 text-sm text-muted" aria-label="Breadcrumb">
          <Link href="/articles" className="transition hover:text-ink">Articles</Link>
          <span>/</span>
          <span className="text-ink line-clamp-1">{TITLE}</span>
        </nav>

        <div className="mb-8">
          <LastUpdatedBadge date={DATE} />
          <h1 className="text-4xl font-bold tracking-tight mt-4 mb-4">{TITLE}</h1>
          <p className="text-xl text-muted-foreground">{DESCRIPTION}</p>
        </div>

        {/* TODO: Quick Verdict */}
        <div className="mb-10 p-6 border rounded-xl bg-card">
          <h2 className="text-2xl font-semibold mb-4">Quick Verdict</h2>
          <ul className="space-y-2 text-muted-foreground">
            <li>• TODO: Key takeaway 1.</li>
            <li>• TODO: Key takeaway 2.</li>
            <li>• TODO: Key takeaway 3.</li>
            <li>• Not a replacement for professional medical advice.</li>
          </ul>
        </div>

        {/* TODO: Introduction */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">TODO: What Is [Topic]?</h2>
          <div className="prose prose-lg max-w-none">
            <p>TODO: 2–3 paragraphs introducing the subject. Cover origin, mechanism overview, and why this topic matters.</p>
          </div>
        </section>

        {/* TODO: Evidence Summary */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Evidence Summary</h2>
          <EvidenceSummaryCard
            title="TODO: [Topic] — Evidence Summary"
            evidenceLevel="TODO: Strong | Moderate | Limited | Insufficient"
            humanEvidence="TODO: Describe human trial evidence — number of studies, population, outcomes."
            mechanisticEvidence="TODO: Describe proposed mechanisms and preclinical evidence."
            safetyProfile="TODO: Known safety signals, drug interactions, populations to caution."
          />
        </section>

        {/* TODO: Dosage */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Dosage and Timing</h2>
          <div className="prose prose-lg max-w-none">
            <p>TODO: Typical supplemental dose ranges from research. Timing considerations. Individual variation note.</p>
          </div>
        </section>

        {/* TODO: Safety */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Safety Considerations</h2>
          <SafetyNotice>
            <p>TODO: Describe contraindications, drug interactions, and populations requiring extra caution. Always recommend consulting a licensed clinician.</p>
          </SafetyNotice>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {FAQS.map((faq, i) => (
              <div key={i} className="border rounded-lg p-5">
                <h3 className="font-semibold text-lg mb-2">{faq.question}</h3>
                <p className="text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Related */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Related Articles</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {/* TODO: Add 2–4 related links */}
            <Link href="/articles" className="block p-4 border rounded-lg hover:border-brand-700 transition">
              ← All Articles
            </Link>
            <Link href="/herbs" className="block p-4 border rounded-lg hover:border-brand-700 transition">
              Herb Profiles →
            </Link>
          </div>
        </section>

        <div className="mt-8">
          <Link href="/articles" className="text-sm font-semibold text-brand-700 hover:text-brand-800">
            ← Back to Articles
          </Link>
        </div>
      </div>
    </>
  )
}
`
}

function guideTemplate(slug, title, description) {
  const functionName = slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('')

  return `import Link from 'next/link'
import { buildPageMetadata, blogJsonLd, breadcrumbJsonLd, faqPageJsonLd } from '@/lib/seo'
import EvidenceSummaryCard from '@/components/evidence/EvidenceSummaryCard'
import SafetyNotice from '@/components/evidence/SafetyNotice'
import LastUpdatedBadge from '@/components/editorial/LastUpdatedBadge'
import { AFFILIATE_TAGS } from '@/config/affiliate'

const SLUG = '${slug}'
const TITLE = '${title}'
const DESCRIPTION =
  '${description}'
const DATE = '${TODAY}'

export const metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: \`/guides/\${SLUG}\`,
})

const FAQS = [
  {
    question: 'TODO: Common question about this topic?',
    answer: 'TODO: Balanced, hedged answer. No clinical claims.',
  },
  {
    question: 'TODO: Another question?',
    answer: 'TODO: Answer here.',
  },
]

export default function ${functionName}Page() {
  void AFFILIATE_TAGS.amazon // used via RecommendationSection when products are added

  const pageBreadcrumb = breadcrumbJsonLd([
    { name: 'Home', url: 'https://thehippiescientist.net' },
    { name: 'Guides', url: 'https://thehippiescientist.net/guides' },
    { name: TITLE, url: \`https://thehippiescientist.net/guides/\${SLUG}\` },
  ])

  const guideLd = blogJsonLd(
    { title: TITLE, slug: SLUG, date: DATE, description: DESCRIPTION },
    \`/guides/\${SLUG}\`,
  )

  const faqLd = faqPageJsonLd({ pagePath: \`/guides/\${SLUG}\`, questions: FAQS })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(guideLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageBreadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <nav className="mb-6 flex items-center gap-2 text-sm text-muted" aria-label="Breadcrumb">
          <Link href="/guides" className="transition hover:text-ink">Guides</Link>
          <span>/</span>
          <span className="text-ink line-clamp-1">{TITLE}</span>
        </nav>

        <div className="mb-8">
          <LastUpdatedBadge date={DATE} />
          <h1 className="text-4xl font-bold tracking-tight mt-4 mb-4">{TITLE}</h1>
          <p className="text-xl text-muted-foreground">{DESCRIPTION}</p>
        </div>

        {/* TODO: Overview — what this guide covers */}
        <div className="mb-10 p-6 border rounded-xl bg-card">
          <h2 className="text-2xl font-semibold mb-4">What This Guide Covers</h2>
          <ul className="space-y-2 text-muted-foreground">
            <li>• TODO: Bullet 1 — key topic coverage.</li>
            <li>• TODO: Bullet 2 — evidence summary.</li>
            <li>• TODO: Bullet 3 — practical guidance.</li>
            <li>• TODO: Bullet 4 — safety.</li>
          </ul>
        </div>

        {/* TODO: Background */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">TODO: Background</h2>
          <div className="prose prose-lg max-w-none">
            <p>TODO: Introduce the topic — what it is, why it matters, who it is relevant for.</p>
          </div>
        </section>

        {/* TODO: Evidence */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Evidence Review</h2>
          <EvidenceSummaryCard
            title="TODO: [Topic] Evidence"
            evidenceLevel="TODO: Strong | Moderate | Limited | Insufficient"
            humanEvidence="TODO: Describe human evidence."
            mechanisticEvidence="TODO: Describe mechanisms."
            safetyProfile="TODO: Safety considerations."
          />
        </section>

        {/* TODO: Best Options */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">TODO: Top Options</h2>
          <div className="prose prose-lg max-w-none">
            <p>TODO: Cover the primary options/compounds relevant to this guide with brief comparisons.</p>
          </div>
        </section>

        {/* TODO: Dosage */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Dosage Guidance</h2>
          <div className="prose prose-lg max-w-none">
            <p>TODO: Typical dose ranges. Timing. Important individual variation note.</p>
          </div>
        </section>

        {/* TODO: Safety */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Safety & Interactions</h2>
          <SafetyNotice>
            <p>TODO: Drug interactions, contraindications, and populations requiring extra caution.</p>
          </SafetyNotice>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {FAQS.map((faq, i) => (
              <div key={i} className="border rounded-lg p-5">
                <h3 className="font-semibold text-lg mb-2">{faq.question}</h3>
                <p className="text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Related */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Related Guides</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {/* TODO: Add 2–4 related links */}
            <Link href="/guides" className="block p-4 border rounded-lg hover:border-brand-700 transition">
              ← All Guides
            </Link>
            <Link href="/herbs" className="block p-4 border rounded-lg hover:border-brand-700 transition">
              Herb Profiles →
            </Link>
          </div>
        </section>

        <div className="mt-8">
          <Link href="/guides" className="text-sm font-semibold text-brand-700 hover:text-brand-800">
            ← Back to Guides
          </Link>
        </div>
      </div>
    </>
  )
}
`
}

function compareTemplate(slug, title, description) {
  const functionName = slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('')

  // Derive subject A and B from slug (e.g. "a-vs-b" → ["a", "b"])
  const vsParts = slug.split('-vs-')
  const subjectA = vsParts[0]
    ? vsParts[0].replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : 'Option A'
  const subjectB = vsParts[1]
    ? vsParts[1].replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : 'Option B'

  return `import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '@/lib/seo'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import AffiliateDisclosure from '@/components/AffiliateDisclosure'
import LastUpdatedBadge from '@/components/editorial/LastUpdatedBadge'

const SLUG = '${slug}'
const TITLE = '${title}'
const DESCRIPTION =
  '${description}'
const DATE = '${TODAY}'
const SITE = 'https://thehippiescientist.net'

export const metadata: Metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: \`/compare/\${SLUG}/\`,
})

export default function ${functionName}Page() {
  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd
        title={TITLE}
        description={DESCRIPTION}
        url={\`\${SITE}/compare/\${SLUG}\`}
        type="Article"
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Compare', href: '/compare' },
          { label: '${subjectA} vs ${subjectB}' },
        ]}
      />

      <LastUpdatedBadge date={DATE} />
      <AffiliateDisclosure />

      {/* Hero */}
      <section className="space-y-5 max-w-4xl">
        <p className="eyebrow-label">Educational Comparison</p>
        <h1 className="text-5xl font-bold tracking-tight text-ink">{TITLE}</h1>
        <p className="text-lg leading-8 text-[#46574d]">{DESCRIPTION}</p>

        {/* TODO: Add evidence-grade badges */}
        <div className="flex flex-wrap gap-3 pt-1">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 border border-green-200 px-3 py-1 text-xs font-semibold text-green-800">
            TODO: ${subjectA} — Evidence Grade: ?
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 border border-green-200 px-3 py-1 text-xs font-semibold text-green-800">
            TODO: ${subjectB} — Evidence Grade: ?
          </span>
        </div>
      </section>

      {/* Side-by-side overview */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="card-premium p-6 space-y-4">
          <p className="eyebrow-label">TODO: Category / Mechanism type</p>
          <h2 className="text-3xl font-semibold tracking-tight text-ink">${subjectA}</h2>
          <p className="text-sm leading-7 text-[#46574d]">
            TODO: 3–4 sentences on mechanism, onset, primary use cases, and who benefits most.
          </p>
          {/* TODO: Add link to compound/herb profile if it exists */}
          {/* <Link href="/compounds/TODO" className="chip-readable">Explore ${subjectA}</Link> */}
        </div>

        <div className="card-premium p-6 space-y-4">
          <p className="eyebrow-label">TODO: Category / Mechanism type</p>
          <h2 className="text-3xl font-semibold tracking-tight text-ink">${subjectB}</h2>
          <p className="text-sm leading-7 text-[#46574d]">
            TODO: 3–4 sentences on mechanism, onset, primary use cases, and who benefits most.
          </p>
          {/* <Link href="/compounds/TODO" className="chip-readable">Explore ${subjectB}</Link> */}
        </div>
      </section>

      {/* TODO: Head-to-head comparison table */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Head-to-Head</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-brand-900/10">
                <th className="pb-2 pr-6 text-left text-xs font-bold uppercase tracking-wider text-muted">Dimension</th>
                <th className="pb-2 pr-6 text-left text-xs font-bold uppercase tracking-wider text-muted">${subjectA}</th>
                <th className="pb-2 text-left text-xs font-bold uppercase tracking-wider text-muted">${subjectB}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-900/5">
              {[
                ['Onset', 'TODO', 'TODO'],
                ['Duration', 'TODO', 'TODO'],
                ['Primary target', 'TODO', 'TODO'],
                ['Evidence grade', 'TODO', 'TODO'],
                ['Best for', 'TODO', 'TODO'],
                ['Stack well with', 'TODO', 'TODO'],
              ].map(([dimension, a, b]) => (
                <tr key={dimension} className="align-top">
                  <td className="py-3 pr-6 font-medium text-ink">{dimension}</td>
                  <td className="py-3 pr-6 text-[#46574d]">{a}</td>
                  <td className="py-3 text-[#46574d]">{b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* TODO: When to choose A */}
      <section className="space-y-3 max-w-4xl">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">When to Choose ${subjectA}</h2>
        <p className="text-[#46574d] leading-7">TODO: Describe the use cases where ${subjectA} wins — timing, goals, populations.</p>
      </section>

      {/* TODO: When to choose B */}
      <section className="space-y-3 max-w-4xl">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">When to Choose ${subjectB}</h2>
        <p className="text-[#46574d] leading-7">TODO: Describe the use cases where ${subjectB} wins — timing, goals, populations.</p>
      </section>

      {/* TODO: Can you combine them? */}
      <section className="space-y-3 max-w-4xl">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Can You Combine Them?</h2>
        <p className="text-[#46574d] leading-7">TODO: Discuss stacking considerations — safety, rationale, when it makes sense.</p>
      </section>

      {/* TODO: Safety */}
      <section className="rounded-xl border border-amber-700/20 bg-amber-50/80 p-5 text-sm leading-6 text-[#5b4a2c] max-w-4xl">
        <p className="font-semibold mb-1">Safety Reminder</p>
        <p>
          This page is for educational purposes only. It is not medical advice, a diagnosis, or a recommendation
          to use any substance. Discuss all supplement use with a licensed clinician, especially if you take
          medications or have a health condition.
        </p>
      </section>

      {/* Related comparisons */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-ink">Related Comparisons</h2>
        <div className="flex flex-wrap gap-3">
          {/* TODO: Add 3–5 related compare links */}
          <Link href="/compare" className="chip-readable">All Comparisons →</Link>
        </div>
      </section>
    </div>
  )
}
`
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

  console.log('\n── The Hippie Scientist: Content Page Generator ──\n')

  // 1. Type
  let type = ''
  while (!['article', 'guide', 'compare'].includes(type)) {
    type = (await prompt(rl, 'Type (article | guide | compare): ')).toLowerCase()
    if (!['article', 'guide', 'compare'].includes(type)) {
      console.log('  Please enter article, guide, or compare.')
    }
  }

  // 2. Title
  let title = ''
  while (!title) {
    title = await prompt(rl, 'Title: ')
    if (!title) console.log('  Title is required.')
  }

  // 3. Slug
  const suggestedSlug = slugify(title)
  let slug = ''
  while (true) {
    const raw = await prompt(rl, `Slug [${suggestedSlug}]: `)
    slug = raw || suggestedSlug

    if (!isValidSlug(slug)) {
      console.log('  Slug must be lowercase letters, numbers, and hyphens only (no leading/trailing hyphens).')
      slug = ''
      continue
    }

    const { taken, conflict } = checkSlugUniqueness(type, slug)
    if (taken) {
      console.log(`  Conflict: ${conflict}`)
      console.log('  Choose a different slug.')
      slug = ''
      continue
    }

    break
  }

  // 4. Description
  let description = ''
  while (!description) {
    description = await prompt(rl, 'Meta description (1–2 sentences): ')
    if (!description) console.log('  Description is required.')
  }

  rl.close()

  // 5. Generate
  const typeToDir = { article: 'articles', guide: 'guides', compare: 'compare' }
  const targetDir = path.join(ROOT, 'app', typeToDir[type], slug)
  const targetFile = path.join(targetDir, 'page.tsx')

  const templateFns = { article: articleTemplate, guide: guideTemplate, compare: compareTemplate }
  const content = templateFns[type](slug, title, description)

  fs.mkdirSync(targetDir, { recursive: true })
  fs.writeFileSync(targetFile, content, 'utf-8')

  console.log('\n✓ Created:')
  console.log(`  ${path.relative(ROOT, targetFile)}`)
  console.log(`\n  Route: /${typeToDir[type]}/${slug}`)
  console.log('\nNext steps:')
  console.log('  1. Fill in all TODO sections in the generated file.')
  console.log('  2. Run: npm run lint && npm run typecheck')
  console.log('  3. Run: npm run build')
  console.log('  4. Commit and push to deploy.\n')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
