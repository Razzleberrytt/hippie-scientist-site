#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'

const ROOT = process.cwd()
const MIN_PUBLISHABLE_HERBS = 400
const MIN_SITEMAP_LOC_ENTRIES = 500
const MIN_NON_DRAFT_BLOG_POSTS = 5

const QUALITY_THRESHOLDS = {
  publishableDescriptionLength: 20,
  publishableMinSources: 1,
}

function toArray(value) {
  return Array.isArray(value) ? value : []
}

function toText(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function readJson(relativePath) {
  const fullPath = path.join(ROOT, relativePath)
  if (!fs.existsSync(fullPath)) return null
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'))
}

function fail(messages) {
  for (const message of messages) {
    console.error(`[deploy-readiness] ${message}`)
  }
  process.exit(1)
}

function sourceQualityScore(record) {
  return toArray(record?.sources).reduce((count, source) => {
    if (typeof source === 'string') return count + (source.trim().length > 0 ? 1 : 0)
    if (!source || typeof source !== 'object') return count
    const title = toText(source.title)
    const url = toText(source.url)
    const doi = toText(source.doi)
    const citation = toText(source.citation)
    const hasEvidence = title.length > 0 || url.length > 0 || doi.length > 0 || citation.length > 0
    return count + (hasEvidence ? 1 : 0)
  }, 0)
}

function stripCitationBrackets(value) {
  return toText(value).replace(/\[[^\]]*\]/g, ' ').replace(/\s+/g, ' ').trim()
}

function supportingFieldCount(record) {
  const fields = [
    record?.mechanism,
    record?.effects,
    record?.interactions,
    record?.contraindications,
    record?.safetyNotes,
    record?.dosage,
    record?.preparation,
    record?.activeCompounds,
    record?.traditionalUse,
    record?.therapeuticUses,
  ]

  return fields.reduce((count, field) => {
    if (Array.isArray(field)) return count + (field.some(item => toText(item).length > 0) ? 1 : 0)
    return count + (toText(field).length > 0 ? 1 : 0)
  }, 0)
}

function hasLinkedContext(record) {
  return (
    toArray(record?.effects).length > 0 ||
    toArray(record?.interactions).length > 0 ||
    toArray(record?.activeCompounds).length > 0 ||
    toText(record?.mechanism).length > 0 ||
    toText(record?.traditionalUse).length > 0
  )
}

function hasValidName(record) {
  const name = toText(record?.name || record?.displayName || record?.commonName || record?.latin)
  const slug = toText(record?.slug)
  return name.length >= 2 && slug.length >= 2
}

function isPublishableHerb(record, thresholds) {
  if (!record || typeof record !== 'object') return false

  const descriptionLength = stripCitationBrackets(record?.description).length
  const summaryLength = stripCitationBrackets(record?.summary).length
  const sourceScore = sourceQualityScore(record)
  const supports = supportingFieldCount(record) > 0
  const linked = hasLinkedContext(record)
  const corrupted = /^\[object\s+object\]$/i.test(toText(record?.description))
  const hasAnyUsefulContent = descriptionLength > 0 || summaryLength > 0 || sourceScore > 0 || supports

  if (!hasValidName(record) || corrupted || !hasAnyUsefulContent) return false

  const passesDescription = descriptionLength >= thresholds.publishableDescriptionLength || summaryLength > 0
  const passesSourceOrContext = sourceScore >= thresholds.publishableMinSources || linked
  return passesDescription && passesSourceOrContext && supports
}

function countSitemapLocs(relativePath) {
  const fullPath = path.join(ROOT, relativePath)
  if (!fs.existsSync(fullPath)) return { exists: false, count: 0 }
  const xml = fs.readFileSync(fullPath, 'utf8')
  const count = (xml.match(/<loc>/g) || []).length
  return { exists: true, count }
}

function listBlogPosts(relativeDir) {
  const dir = path.join(ROOT, relativeDir)
  if (!fs.existsSync(dir)) return []

  return fs
    .readdirSync(dir)
    .filter(file => file.endsWith('.md') || file.endsWith('.mdx'))
    .map(file => {
      const raw = fs.readFileSync(path.join(dir, file), 'utf8')
      const parsed = matter(raw)
      return {
        file,
        draft: parsed.data?.draft === true,
      }
    })
}

function validatePublicationManifest(manifest, errors) {
  if (!manifest || typeof manifest !== 'object') {
    errors.push('public/data/publication-manifest.json is missing or unreadable JSON.')
    return
  }

  if (!toText(manifest.generatedAt)) {
    errors.push('publication-manifest missing generatedAt timestamp.')
  }

  const entityHerbs = toArray(manifest?.entities?.herbs)
  const entityCompounds = toArray(manifest?.entities?.compounds)
  const routeHerbs = toArray(manifest?.routes?.herbs)
  const routeCompounds = toArray(manifest?.routes?.compounds)

  if (entityHerbs.length === 0) errors.push('publication-manifest entities.herbs is empty.')
  if (entityCompounds.length === 0) errors.push('publication-manifest entities.compounds is empty.')

  if (routeHerbs.length !== entityHerbs.length) {
    errors.push(`publication-manifest coherence error: routes.herbs (${routeHerbs.length}) must match entities.herbs (${entityHerbs.length}).`)
  }

  if (routeCompounds.length !== entityCompounds.length) {
    errors.push(`publication-manifest coherence error: routes.compounds (${routeCompounds.length}) must match entities.compounds (${entityCompounds.length}).`)
  }

  const malformedHerbEntity = entityHerbs.find(
    entry => !toText(entry?.slug) || !toText(entry?.route).startsWith('/herbs/') || entry?.publicationEligible !== true,
  )
  if (malformedHerbEntity) {
    errors.push('publication-manifest contains malformed or non-publishable herb entries under entities.herbs.')
  }

  const malformedCompoundEntity = entityCompounds.find(
    entry => !toText(entry?.slug) || !toText(entry?.route).startsWith('/compounds/') || entry?.publicationEligible !== true,
  )
  if (malformedCompoundEntity) {
    errors.push('publication-manifest contains malformed or non-publishable compound entries under entities.compounds.')
  }

  const herbsSummaryIndexable = Number(manifest?.summaries?.herbs?.indexable || 0)
  const compoundsSummaryIndexable = Number(manifest?.summaries?.compounds?.indexable || 0)
  if (herbsSummaryIndexable !== entityHerbs.length) {
    errors.push(`publication-manifest summaries.herbs.indexable (${herbsSummaryIndexable}) does not match entities.herbs length (${entityHerbs.length}).`)
  }
  if (compoundsSummaryIndexable !== entityCompounds.length) {
    errors.push(`publication-manifest summaries.compounds.indexable (${compoundsSummaryIndexable}) does not match entities.compounds length (${entityCompounds.length}).`)
  }
}

function validateCloudflareEnv(errors) {
  const token = toText(process.env.CLOUDFLARE_API_TOKEN)
  const accountId = toText(process.env.CLOUDFLARE_ACCOUNT_ID)
  const project = toText(process.env.CLOUDFLARE_PAGES_PROJECT)

  const missing = []
  if (!token) missing.push('CLOUDFLARE_API_TOKEN')
  if (!accountId) missing.push('CLOUDFLARE_ACCOUNT_ID')
  if (!project) missing.push('CLOUDFLARE_PAGES_PROJECT')

  if (missing.length > 0) {
    errors.push(`Cloudflare deploy secrets missing: ${missing.join(', ')}. Configure these as GitHub Actions repository secrets before deploy.`)
    return
  }

  if (!/^[a-f0-9]{32}$/i.test(accountId)) {
    errors.push('CLOUDFLARE_ACCOUNT_ID appears malformed (expected 32 hex characters).')
  }

  if (!/^[a-z0-9][a-z0-9-]{1,62}$/.test(project)) {
    errors.push('CLOUDFLARE_PAGES_PROJECT appears malformed (use lowercase letters, numbers, and hyphens).')
  }
}

function main() {
  const errors = []

  const herbs = readJson('public/data/herbs.json')
  if (!Array.isArray(herbs)) {
    errors.push('public/data/herbs.json is missing or not an array.')
  } else {
    const manifest = readJson('public/data/publication-manifest.json')
    const thresholds = {
      publishableDescriptionLength:
        Number(manifest?.thresholds?.publishableDescriptionLength) || QUALITY_THRESHOLDS.publishableDescriptionLength,
      publishableMinSources: Number(manifest?.thresholds?.publishableMinSources) || QUALITY_THRESHOLDS.publishableMinSources,
    }
    const publishableCount = herbs.filter(herb => isPublishableHerb(herb, thresholds)).length
    if (publishableCount < MIN_PUBLISHABLE_HERBS) {
      errors.push(
        `Publishable herb count below threshold: ${publishableCount} < ${MIN_PUBLISHABLE_HERBS} (evaluated with hardened quality rules).`,
      )
    }
  }

  const sitemap = countSitemapLocs('dist/sitemap.xml')
  if (!sitemap.exists) {
    errors.push('dist/sitemap.xml is missing (build/postbuild output required before deploy).')
  } else if (sitemap.count <= MIN_SITEMAP_LOC_ENTRIES) {
    errors.push(`dist/sitemap.xml must contain more than ${MIN_SITEMAP_LOC_ENTRIES} <loc> entries (found ${sitemap.count}).`)
  }

  validatePublicationManifest(readJson('public/data/publication-manifest.json'), errors)

  const posts = listBlogPosts('content/blog')
  const nonDraftCount = posts.filter(post => !post.draft).length
  if (nonDraftCount < MIN_NON_DRAFT_BLOG_POSTS) {
    errors.push(`content/blog must include at least ${MIN_NON_DRAFT_BLOG_POSTS} non-draft posts (found ${nonDraftCount}).`)
  }

  validateCloudflareEnv(errors)

  if (errors.length > 0) {
    fail(errors)
  }

  console.log(
    `[deploy-readiness] PASS publishableHerbs>=${MIN_PUBLISHABLE_HERBS}, sitemapLocs>${MIN_SITEMAP_LOC_ENTRIES}, publicationManifest=coherent, nonDraftPosts>=${MIN_NON_DRAFT_BLOG_POSTS}, cloudflareEnv=valid`,
  )
}

main()
