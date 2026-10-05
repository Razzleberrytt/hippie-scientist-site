import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { countArticleWords } from '../lib/article-quality-gates.mjs'

// Read the same authoring source/frontmatter as the canonical article builder.
// This reports review leads; it deliberately cannot certify scientific approval.
const directory = 'content/articles'
const articles = fs.readdirSync(directory).filter(name => /\.mdx?$/.test(name)).map(name => {
  const file = path.join(directory, name)
  const { data, content } = matter(fs.readFileSync(file, 'utf8'))
  return { file, data, content }
})
const slugs = new Set(articles.map(article => article.data.slug))
const relationshipSource = fs.readFileSync('data/article-citation-overrides.ts', 'utf8').split('export const articleCitationOverrides')[0]
const relationshipSlugs = new Set([...relationshipSource.matchAll(/slug:\s*'([^']+)'/g)].map(match => match[1]))
const modules = {
  history: /history|emergence|market|first.*detect/i,
  pharmacology: /pharmacolog|pharmacodynamic|mechanism|receptor|transporter/i,
  metabolism: /metaboli|pharmacokinetic|\bPK\b|disposition/i,
  humanEvidence: /human|clinical|case.*series|forensic/i,
  toxicity: /toxic|overdose|emergency/i,
  interactions: /interaction|polysubstance|co.use|combination/i,
  tolerance: /tolerance/i,
  dependence: /dependence/i,
  withdrawal: /withdrawal/i,
  support: /treatment|support|help/i,
  testing: /testing|detection|drug.check|analytical/i,
  forensic: /forensic|postmortem/i,
  legal: /legal|regulat|schedul|control/i,
  uncertainty: /unknown|uncertain|evidence.gap|not.established/i,
}
const rows = articles.filter(article => ['Substance Use & Harm Reduction', 'Novel Psychoactive Substances'].includes(article.data.category)).map(({ file, data, content }) => {
  const headings = [...content.matchAll(/^#{1,6}\s+(.+)$/gm)].map(match => match[1]).join('\n')
  const references = Array.isArray(data.references) ? data.references : []
  const links = new Set([...content.matchAll(/\]\(\/articles\/([^/#?\s)]+)\/?(?:[?#][^)]*)?\)/g)].map(match => match[1]))
  return {
    file, slug: data.slug, title: data.title,
    words: countArticleWords(content),
    references: references.length,
    pmids: references.filter(ref => ref.pmid).map(ref => String(ref.pmid)),
    missingHeadingSignals: Object.entries(modules).filter(([, pattern]) => !pattern.test(headings)).map(([module]) => module),
    brokenArticleLinks: [...links].filter(slug => !slugs.has(slug)),
    unresolvedRelatedSlugs: (Array.isArray(data.relatedSlugs) ? data.relatedSlugs : []).filter(slug => !slugs.has(slug) && !relationshipSlugs.has(slug)),
    placeholderAuthors: references.filter(ref => /investigators|study$|researchers/i.test(String(ref.authors || ''))).map(ref => ref.title),
    referencesMissingUrl: references.filter(ref => !ref.url).map(ref => ref.title),
  }
}).sort((a, b) => a.slug.localeCompare(b.slug))
const report = {
  scope: 'Source articles with category Substance Use & Harm Reduction or Novel Psychoactive Substances',
  semantics: 'Heading signals and metadata only. Missing signals require manual review; presence is not evidence verification or completion.',
  articleCount: rows.length,
  brokenArticleLinkCount: rows.reduce((sum, row) => sum + row.brokenArticleLinks.length, 0),
  articles: rows,
}
const output = process.argv[2]
if (output) fs.writeFileSync(output, JSON.stringify(report, null, 2) + '\n')
console.log(JSON.stringify(report, null, 2))
if (report.brokenArticleLinkCount) process.exitCode = 1
