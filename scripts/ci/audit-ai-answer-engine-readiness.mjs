#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const LLMS = path.join(ROOT, 'public', 'llms.txt')
const ROBOTS = path.join(ROOT, 'app', 'robots.ts')
const MANIFEST = path.join(ROOT, 'public', 'data', 'ai-entities', 'manifest.json')
const SCHEMA = path.join(ROOT, 'components', 'seo', 'SchemaGraphScript.tsx')
const CITATION_SUMMARY = path.join(ROOT, 'components', 'seo', 'CitationReadySummary.tsx')
const ANSWER_TABLE = path.join(ROOT, 'components', 'seo', 'AnswerEngineTable.tsx')
const ARTICLE_EVIDENCE = path.join(ROOT, 'src', 'components', 'evidence', 'WhatEvidenceShows.tsx')
const ARTICLE_CITATIONS = path.join(ROOT, 'src', 'lib', 'article-citation-metadata.ts')
const ARTICLE_PAGE = path.join(ROOT, 'app', 'articles', '[slug]', 'page.tsx')
const MENTAL_HEALTH_ARTICLE = path.join(ROOT, 'components', 'articles', 'MentalHealthArticlePage.tsx')
const GOAL_CLUSTER_ARTICLE = path.join(ROOT, 'components', 'articles', 'GoalClusterArticlePage.tsx')
const RHABDO_PAGE = path.join(ROOT, 'app', 'learn', 'rhabdomyolysis', 'page.tsx')
const LEGACY_GUIDE_REFERENCE = path.join(ROOT, 'components', 'LegacyGuideReference.tsx')
const LEGACY_GUIDE_QUICK_ANSWER = path.join(ROOT, 'components', 'LegacyGuideQuickAnswer.tsx')
const LEGACY_GUIDE_FAQ = path.join(ROOT, 'components', 'LegacyGuideFAQ.tsx')
const LEGACY_GUIDE_PAGES = [
  ['prebiotics', path.join(ROOT, 'app', 'guides', 'other', 'prebiotics', 'page.tsx')],
  ['greens-powders', path.join(ROOT, 'app', 'guides', 'other', 'greens-powders', 'page.tsx')],
  ['bovine-colostrum', path.join(ROOT, 'app', 'guides', 'other', 'bovine-colostrum', 'page.tsx')],
  ['electrolyte-supplements', path.join(ROOT, 'app', 'guides', 'other', 'electrolyte-supplements', 'page.tsx')],
  ['collagen-supplements', path.join(ROOT, 'app', 'guides', 'other', 'collagen-supplements', 'page.tsx')],
]
const REFERENCES = path.join(ROOT, 'components', 'References.tsx')
const EVIDENCE_BADGE = path.join(ROOT, 'components', 'ui', 'EvidenceScoreBadge.tsx')
const SAFETY_GAUGE = path.join(ROOT, 'components', 'ui', 'SafetyGaugeMeter.tsx')
const VERDICT_CARD = path.join(ROOT, 'components', 'editorial', 'ScientificVerdictCard.tsx')
const PROFILE_DECISION = path.join(ROOT, 'components', 'editorial', 'ProfileDecisionPanel.tsx')
const LAST_UPDATED = path.join(ROOT, 'src', 'components', 'editorial', 'LastUpdatedBadge.tsx')
const LICENSING_PAGE = path.join(ROOT, 'app', 'info', 'content-licensing', 'page.tsx')
const APP = path.join(ROOT, 'app')
const strict = process.argv.includes('--strict')

const findings = []
const add = (severity, area, message) => findings.push({ severity, area, message })
const text = (file) => existsSync(file) ? readFileSync(file, 'utf8') : ''

function walk(dir, out = []) {
  if (!existsSync(dir)) return out
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, out)
    else if (/\.(?:tsx|ts|mdx)$/.test(entry.name)) out.push(full)
  }
  return out
}

function requireSignals(file, area, component, signals) {
  const source = text(file)
  if (!source) {
    add('error', area, `${component} is missing`)
    return
  }
  for (const [signal, label] of signals) {
    if (!source.includes(signal)) add('error', area, `${component} missing ${label}`)
  }
}

function auditDiscovery() {
  const llms = text(LLMS)
  if (!llms) add('error', 'discovery', 'public/llms.txt is missing')
  else {
    for (const signal of ['Answer-engine retrieval policy', 'Query-to-source routing', 'Entity resolution rules', 'Evidence and temporal semantics']) {
      if (!llms.includes(signal)) add('error', 'discovery', `llms.txt missing ${signal}`)
    }
    if (!llms.includes('/data/ai-entities/manifest.json')) add('error', 'discovery', 'llms.txt does not advertise the AI entity manifest')
    if (!llms.includes('/info/methodology/')) add('error', 'discovery', 'llms.txt does not advertise methodology')
    if (!llms.includes('/info/content-licensing/')) add('warn', 'attribution', 'llms.txt does not advertise content attribution/reuse guidance')
  }

  const robots = text(ROBOTS)
  if (!robots) add('error', 'crawlability', 'app/robots.ts is missing')
  else {
    if (!robots.includes("'/data/ai-entities/'")) add('error', 'crawlability', 'robots does not explicitly allow AI entity artifacts')
    if (!robots.includes('sitemap.xml')) add('error', 'crawlability', 'robots does not advertise sitemap.xml')
  }
}

function auditMachineReadable() {
  const schema = text(SCHEMA)
  if (!schema) add('error', 'structured-data', 'SchemaGraphScript.tsx is missing')
  else {
    if (!schema.includes('Dataset')) add('error', 'structured-data', 'profile schema graph does not expose Dataset nodes')
    if (!schema.includes('subjectOf')) add('warn', 'structured-data', 'profile entity graph does not visibly connect entity to dataset with subjectOf')
  }

  if (!existsSync(MANIFEST)) {
    add('warn', 'entity-data', 'AI entity manifest is not present in the checkout; run the runtime data build before release')
  } else {
    try {
      const parsed = JSON.parse(text(MANIFEST))
      const serialized = JSON.stringify(parsed)
      if (!serialized.includes('herb') || !serialized.includes('compound')) add('warn', 'entity-data', 'entity manifest may not expose both herb and compound collections')
      if (statSync(MANIFEST).size < 100) add('error', 'entity-data', 'AI entity manifest is unexpectedly small')
    } catch {
      add('error', 'entity-data', 'AI entity manifest is not valid JSON')
    }
  }
}

function auditSharedExtractionPrimitives() {
  requireSignals(CITATION_SUMMARY, 'extractability', 'CitationReadySummary', [
    ['data-answer-engine-summary', 'answer-engine summary marker'],
    ['data-claim', 'claim marker'],
    ['data-evidence', 'evidence marker'],
    ['data-limitation', 'limitation marker'],
    ['data-citation-sources', 'claim-adjacent source marker'],
    ['aria-labelledby', 'accessible stable heading relationship'],
    ['href={`#${id}`}', 'stable permanent answer link'],
    ['toCitationReadySummary(answer)', 'canonical citation-ready text normalizer'],
  ])

  const table = text(ANSWER_TABLE)
  if (!table) add('warn', 'extractability', 'AnswerEngineTable semantic research-table primitive is missing')
  else {
    for (const signal of ['data-answer-engine-table', '<caption', 'scope="col"', 'scope="row"', 'id={id}']) {
      if (!table.includes(signal)) add('error', 'extractability', `AnswerEngineTable missing semantic signal: ${signal}`)
    }
  }

  if (!existsSync(LICENSING_PAGE)) add('warn', 'attribution', 'public content licensing/attribution policy page is missing')
}

function auditArticleExtractionPrimitives() {
  requireSignals(ARTICLE_EVIDENCE, 'article-semantics', 'WhatEvidenceShows', [
    ['data-answer-engine-summary="true"', 'answer-engine summary marker'],
    ['data-claim="true"', 'claim marker'],
    ['data-evidence="true"', 'evidence marker'],
    ['data-citation-sources="true"', 'claim-adjacent source marker'],
    ['referencesHref', 'reference-ledger target support'],
  ])

  requireSignals(REFERENCES, 'article-semantics', 'References', [
    ['id={`ref-${ref.n}`}', 'stable ordinal source anchors'],
    ['data-citation-source=', 'citation-source marker'],
    ['itemType="https://schema.org/CreativeWork"', 'CreativeWork source semantics'],
  ])

  requireSignals(ARTICLE_CITATIONS, 'article-semantics', 'article-citation-metadata', [
    ['evidenceSourceUrl', 'canonical evidence source URL primitive'],
    ['evidenceStudyId', 'canonical evidence source identity primitive'],
    ['normalizeArticleReferences', 'article reference normalizer'],
    ['buildArticleReferenceSchema', 'conservative scholarly citation schema builder'],
  ])

  requireSignals(ARTICLE_PAGE, 'article-semantics', 'generic article page', [
    ['<References refs={articleReferences}', 'shared durable reference ledger'],
    ["referencesHref={articleReferences.length ? '#references' : undefined}", 'claim-adjacent references target'],
    ['articleReferences.map(buildArticleReferenceSchema)', 'canonical article citation schema builder'],
  ])

  const articleCitations = text(ARTICLE_CITATIONS)
  if (/author\s*:/.test(articleCitations.split('buildArticleReferenceSchema')[1]?.split('buildCitationReadySummary')[0] || '')) {
    add('error', 'article-semantics', 'article scholarly citation builder promotes free-form reference authors into structured author nodes')
  }
}

function auditMentalHealthCitationPrimitives() {
  requireSignals(MENTAL_HEALTH_ARTICLE, 'mental-health-citations', 'MentalHealthArticlePage', [
    ['href={`#ref-${ref.number}`}', 'ordinal inline citation targets'],
    ['data-source-id={ref.id}', 'internal source-id provenance on inline citations'],
    ['data-reference-ledger="true"', 'reference-ledger marker'],
    ['id={citationId}', 'ordinal source entry anchors'],
    ['data-citation-source="true"', 'citation-source marker'],
    ['data-source-id={reference.id}', 'internal source-id provenance on source entries'],
    ['itemType="https://schema.org/CreativeWork"', 'CreativeWork source semantics'],
    ['citation: article.references.map((reference) => reference.url)', 'Article citation URL graph'],
    ["'@id': AUTHOR_SCHEMA_ID", 'canonical first-party author identity'],
  ])

  const source = text(MENTAL_HEALTH_ARTICLE)
  if (/href={`#ref-\$\{ref\.id\}`}/.test(source) || /id={`ref-\$\{reference\.id\}`}/.test(source)) {
    add('error', 'mental-health-citations', 'mental-health public citation fragments expose internal source IDs instead of ordinal anchors')
  }
}

function auditGoalClusterCitationPrimitives() {
  requireSignals(GOAL_CLUSTER_ARTICLE, 'goal-cluster-citations', 'GoalClusterArticlePage', [
    ["import References from '@/components/References'", 'shared References ledger import'],
    ['const sourceRefs = content.references.map', 'sleep source adapter'],
    ['<References refs={sourceRefs}', 'shared durable source ledger'],
    ['citation: content.references.map((reference) => reference.href)', 'Article citation URL graph'],
    ['href="#references"', 'source-ledger verification target'],
    ['data-answer-engine-summary="true"', 'answer-engine summary marker'],
    ['data-claim="true"', 'TLDR claim markers'],
  ])

  const source = text(GOAL_CLUSTER_ARTICLE)
  if (source.includes('<h2 className="text-base font-semibold text-ink">References</h2>') && source.includes('content.references.map((reference) =>')) {
    add('error', 'goal-cluster-citations', 'sleep goal-cluster page reintroduced a page-local references renderer instead of the shared ledger')
  }
}

function auditRhabdoCitationPrimitives() {
  requireSignals(RHABDO_PAGE, 'safety-citations', 'rhabdomyolysis page', [
    ['normalizeArticleReferences(page.references)', 'canonical article reference normalization'],
    ['articleReferences.map(buildArticleReferenceSchema)', 'canonical conservative citation schema'],
    ['<References refs={articleReferences}', 'shared durable source ledger'],
    ["'@id': AUTHOR_SCHEMA_ID", 'canonical first-party author identity'],
    ["'@id': ORGANIZATION_SCHEMA_ID", 'canonical publisher identity'],
    ['data-citation-sources="true"', 'source-ledger verification marker'],
  ])

  const source = text(RHABDO_PAGE)
  if (source.includes("reference.pmid ? `https://pubmed.ncbi.nlm.nih.gov/${reference.pmid}/`")) {
    add('error', 'safety-citations', 'rhabdomyolysis page reintroduced page-local PubMed URL derivation')
  }
  if (/citation:\s*page\.references\.map/.test(source)) {
    add('error', 'safety-citations', 'rhabdomyolysis page reintroduced page-local scholarly citation construction')
  }
}

function auditLegacyGuideReferencePrimitives() {
  requireSignals(LEGACY_GUIDE_REFERENCE, 'legacy-guide-citations', 'LegacyGuideReference', [
    ['const citationId = `ref-${n}`', 'canonical ordinal citation ID'],
    ['id={citationId}', 'stable ordinal source anchor'],
    ['data-citation-source="true"', 'citation-source marker'],
    ['itemType="https://schema.org/CreativeWork"', 'conservative CreativeWork semantics'],
    ['href={`#${citationId}`}', 'durable source self-link'],
    ['itemProp="name"', 'citation text name semantic'],
    ['itemProp="url"', 'source URL semantic'],
    ['function sourceIdentifier(url?: string)', 'URL-only source identifier normalizer'],
    ["hostname === 'pubmed.ncbi.nlm.nih.gov'", 'canonical PubMed host gate'],
    ['return match ? `PMID:${match[1]}`', 'PMID identifier derivation'],
    ["hostname === 'doi.org' || hostname === 'www.doi.org'", 'canonical DOI host gate'],
    ['return /^10\\.\\d{4,9}\\/\\S+$/i.test(doi) ? `DOI:${doi}`', 'DOI identifier syntax gate'],
    ['data-source-identifier={identifier}', 'machine-readable source identifier'],
    ['itemProp="identifier"', 'CreativeWork identifier semantic'],
  ])

  const legacyReferenceSource = text(LEGACY_GUIDE_REFERENCE)
  const identifierNormalizer = legacyReferenceSource.split('function sourceIdentifier')[1]?.split('/**')[0] || ''
  if (/\btext\b/.test(identifierNormalizer)) {
    add('error', 'legacy-guide-citations', 'LegacyGuideReference source identifier normalizer reads citation prose instead of URL-only identity')
  }

  for (const [slug, file] of LEGACY_GUIDE_PAGES) {
    requireSignals(file, 'legacy-guide-citations', `${slug} guide`, [
      ["import Ref from '@/components/LegacyGuideReference'", 'shared legacy reference import'],
      ['<Ref n={', 'shared legacy reference usage'],
    ])

    const source = text(file)
    const visibleCount = source.match(/Evidence Review · (\d+) References/)?.[1]
    const renderedCount = (source.match(/<Ref n=\{/g) || []).length
    if (!visibleCount) {
      add('error', 'legacy-guide-citations', `${slug} guide missing visible Evidence Review reference count`)
    } else if (Number(visibleCount) !== renderedCount) {
      add('error', 'legacy-guide-citations', `${slug} guide displays ${visibleCount} references but renders ${renderedCount}`)
    }

    if (/^type RefProps\b/m.test(source) || /^function Ref\s*\(/m.test(source)) {
      add('error', 'legacy-guide-citations', `${slug} guide reintroduced a local legacy reference renderer`)
    }
  }
}

function auditLegacyGuideQuickAnswerPrimitives() {
  requireSignals(LEGACY_GUIDE_QUICK_ANSWER, 'legacy-guide-answers', 'LegacyGuideQuickAnswer', [
    ['id="quick-answer"', 'stable quick-answer anchor'],
    ['aria-labelledby="quick-answer-heading"', 'accessible heading relationship'],
    ['data-answer-engine-summary="true"', 'answer-engine summary marker'],
    ['data-claim="true"', 'claim marker'],
    ['href="#quick-answer"', 'durable answer self-link'],
    ['referencesHref', 'optional reference-ledger target'],
    ['data-citation-sources="true"', 'claim-adjacent source marker'],
  ])

  for (const [slug, file] of LEGACY_GUIDE_PAGES) {
    requireSignals(file, 'legacy-guide-answers', `${slug} guide`, [
      ["import LegacyGuideQuickAnswer from '@/components/LegacyGuideQuickAnswer'", 'shared quick-answer import'],
      ['<LegacyGuideQuickAnswer referencesHref="#references">', 'shared quick-answer wrapper with source target'],
      ['id="references"', 'matching references target'],
    ])
  }
}

function auditLegacyGuideFaqPrimitives() {
  requireSignals(LEGACY_GUIDE_FAQ, 'legacy-guide-faq', 'LegacyGuideFAQ', [
    ["import FAQSchema from '@/components/seo/FAQSchema'", 'FAQ schema boundary'],
    ['<FAQSchema pagePath={pagePath} questions={questions} />', 'shared structured FAQ rendering'],
    ['id="frequently-asked-questions"', 'stable visible FAQ anchor'],
    ['data-visible-faq="true"', 'visible FAQ marker'],
    ['questions.map((faq)', 'shared visible FAQ rendering'],
    ['href="#references"', 'FAQ source-ledger verification target'],
    ['data-citation-sources="true"', 'FAQ source-verification marker'],
    ['href="#frequently-asked-questions"', 'durable FAQ self-link'],
  ])

  for (const [slug, file] of LEGACY_GUIDE_PAGES) {
    requireSignals(file, 'legacy-guide-faq', `${slug} guide`, [
      ["import LegacyGuideFAQ from '@/components/LegacyGuideFAQ'", 'shared legacy FAQ import'],
      ['<LegacyGuideFAQ', 'shared FAQ boundary usage'],
      ['questions={FAQS}', 'FAQ source-array binding'],
    ])

    const source = text(file)
    if (source.includes("import FAQSchema from '@/components/seo/FAQSchema'") || source.includes('<FAQSchema ')) {
      add('error', 'legacy-guide-faq', `${slug} guide reintroduced standalone FAQ schema outside LegacyGuideFAQ`)
    }
    if (/FAQS\.map\s*\(/.test(source)) {
      add('error', 'legacy-guide-faq', `${slug} guide reintroduced page-local FAQ rendering outside LegacyGuideFAQ`)
    }
  }
}

function auditLegacyGuideTablePrimitives() {
  for (const [slug, file] of LEGACY_GUIDE_PAGES) {
    const source = text(file)
    const tableCount = (source.match(/<table\b/g) || []).length
    if (!tableCount) continue

    const semanticSurfaceCount = (source.match(/data-answer-engine-table="true"/g) || []).length
    const stableSurfaceCount = (source.match(/<section id="[^"]+" data-answer-engine-table="true"/g) || []).length
    const captionCount = (source.match(/<caption\b/g) || []).length
    const columnScopeCount = (source.match(/scope="col"/g) || []).length
    const rowScopeCount = (source.match(/scope="row"/g) || []).length
    const unscopedHeaders = source.match(/<th(?![^>]*\bscope=)[^>]*>/g) || []

    if (semanticSurfaceCount !== tableCount) {
      add('error', 'legacy-guide-tables', `${slug} guide renders ${tableCount} table(s) but marks ${semanticSurfaceCount} answer-engine table surface(s)`)
    }
    if (stableSurfaceCount !== tableCount) {
      add('error', 'legacy-guide-tables', `${slug} guide tables must each live in a stably identified semantic section`)
    }
    if (captionCount !== tableCount) {
      add('error', 'legacy-guide-tables', `${slug} guide renders ${tableCount} table(s) but only ${captionCount} caption(s)`)
    }
    if (unscopedHeaders.length) {
      add('error', 'legacy-guide-tables', `${slug} guide contains ${unscopedHeaders.length} table header(s) without scope`)
    }
    if (columnScopeCount < tableCount || rowScopeCount < tableCount) {
      add('error', 'legacy-guide-tables', `${slug} guide tables require both column and row header scopes`)
    }
  }
}

function auditProfilePrimitives() {
  requireSignals(EVIDENCE_BADGE, 'profile-semantics', 'EvidenceScoreBadge', [
    ['data-evidence="true"', 'evidence marker'],
    ['data-evidence-grade={canonicalGrade}', 'canonical evidence-grade value'],
  ])
  requireSignals(SAFETY_GAUGE, 'profile-semantics', 'SafetyGaugeMeter', [
    ['data-safety-context="true"', 'safety-context marker'],
    ['data-safety-label={label}', 'qualitative safety label'],
  ])
  if (text(SAFETY_GAUGE).includes('data-safety-score=')) {
    add('error', 'profile-semantics', 'SafetyGaugeMeter exposes a derived visual gauge as a machine-readable clinical-looking score')
  }
  requireSignals(LAST_UPDATED, 'profile-semantics', 'LastUpdatedBadge', [
    ['data-editorial-provenance="true"', 'editorial-provenance marker'],
    ['data-last-reviewed=', 'last-reviewed value'],
    ['itemProp="dateModified"', 'dateModified semantic'],
  ])
  requireSignals(VERDICT_CARD, 'profile-semantics', 'ScientificVerdictCard', [
    ['data-answer-engine-decision="true"', 'decision marker'],
    ['data-recommendation=', 'recommendation value'],
    ['data-claim="true"', 'bottom-line claim marker'],
    ['data-limitation="true"', 'limitation marker'],
    ['data-safety-context="true"', 'safety marker'],
    ['data-evidence="true"', 'evidence marker'],
  ])
  const decision = text(PROFILE_DECISION)
  if (!decision.includes('id="decision-summary"')) add('error', 'profile-semantics', 'ProfileDecisionPanel does not give curated verdicts a stable decision-summary anchor')
}

function auditExtractability() {
  const files = walk(APP)
  const candidates = files.filter((file) => /(?:herbs|compounds|guides|articles)/.test(file))
  let quick = 0
  let evidence = 0
  let references = 0
  let schema = 0
  let safety = 0
  let freshness = 0

  for (const file of candidates) {
    const source = text(file)
    if (/quick answer|CitationReadySummary|TL;DR|WhatEvidenceShows/i.test(source)) quick++
    if (/Evidence Summary|evidence grade|EvidenceGrade|EvidenceBadge|WhatEvidenceShows/i.test(source)) evidence++
    if (/References|Citations|CompareCitations|Sources/i.test(source)) references++
    if (/SchemaGraphScript|JsonLd|JSON-LD|AuthorityJsonLd|CompareSchema/i.test(source)) schema++
    if (/Safety|contraindication|interaction/i.test(source)) safety++
    if (/dateModified|last reviewed|updated/i.test(source)) freshness++
  }

  const total = candidates.length || 1
  const metric = (name, count, floor) => {
    const pct = Math.round((count / total) * 100)
    if (pct < floor) add('warn', 'extractability', `${name} signal appears in ${count}/${candidates.length} candidate source files (${pct}%)`)
  }

  metric('quick-answer', quick, 8)
  metric('evidence', evidence, 12)
  metric('references', references, 10)
  metric('schema', schema, 8)
  metric('safety', safety, 12)
  metric('freshness', freshness, 6)
}

function auditAntiPatterns() {
  for (const file of walk(APP)) {
    const source = text(file)
    const rel = path.relative(ROOT, file)
    if (/AggregateRating/.test(source) && !/ratingCount|reviewCount/.test(source)) add('warn', 'trust', `${rel}: AggregateRating requires verified visible rating provenance`)
    if (/\bclinically proven\b/i.test(source)) add('warn', 'claim-discipline', `${rel}: contains “clinically proven”; verify the wording is justified and qualified`)
    if (/\bguaranteed\b/i.test(source) && /supplement|herb|compound|treat|benefit/i.test(source)) add('warn', 'claim-discipline', `${rel}: contains potentially absolute health-benefit language`)
  }
}

auditDiscovery()
auditMachineReadable()
auditSharedExtractionPrimitives()
auditArticleExtractionPrimitives()
auditMentalHealthCitationPrimitives()
auditGoalClusterCitationPrimitives()
auditRhabdoCitationPrimitives()
auditLegacyGuideReferencePrimitives()
auditLegacyGuideQuickAnswerPrimitives()
auditLegacyGuideFaqPrimitives()
auditLegacyGuideTablePrimitives()
auditProfilePrimitives()
auditExtractability()
auditAntiPatterns()

const order = { error: 0, warn: 1 }
findings.sort((a, b) => order[a.severity] - order[b.severity] || a.area.localeCompare(b.area) || a.message.localeCompare(b.message))

console.log(`[ai-answer-engine] ${findings.length ? `${findings.length} finding(s)` : 'PASS'}`)
for (const item of findings) console.log(`- ${item.severity.toUpperCase()} [${item.area}] ${item.message}`)

const errors = findings.filter((item) => item.severity === 'error').length
const warnings = findings.filter((item) => item.severity === 'warn').length
console.log(`[ai-answer-engine] errors=${errors} warnings=${warnings} mode=${strict ? 'strict' : 'advisory'}`)

if (errors || (strict && warnings)) process.exit(1)
