#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'

const ROOT = process.cwd()
const MIN_SITEMAP_LOC_ENTRIES = 500
const MIN_NON_DRAFT_BLOG_POSTS = 5
const DEFAULT_MIN_PUBLISHABLE_HERBS = 250
const DEFAULT_MIN_PUBLISHABLE_COMPOUNDS = 200
const DEPLOY_MODES = {
  githubPagesIntegration: 'github-pages-integration',
  cloudflareDirect: 'cloudflare-direct',
}

const QUALITY_THRESHOLDS = {
  publishableDescriptionLength: 20,
  publishableMinSources: 1,
}

function toArray(value) {
  return Array.isArray(value) ? value : []
}

function toText(value) {
  if (typeof value === 'string') return value.trim()
  if (typeof value === 'number' || typeof value === 'boolean') return String(value).trim()
  if (Array.isArray(value)) return value.map(toText).filter(Boolean).join(', ')
  if (value && typeof value === 'object') {
    return toText(value.value ?? value.text ?? value.label ?? value.name ?? value.title ?? value.summary)
  }
  return ''
}

function readJson(relativePath) {
  const fullPath = path.join(ROOT, relativePath)
  if (!fs.existsSync(fullPath)) return null
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'))
}

function readJsonWithStatus(relativePath, errors) {
  const fullPath = path.join(ROOT, relativePath)
  if (!fs.existsSync(fullPath)) return { ok: false, exists: false, value: null }
  try {
    return { ok: true, exists: true, value: JSON.parse(fs.readFileSync(fullPath, 'utf8')) }
  } catch {
    errors.push(`${relativePath} contains invalid JSON.`)
    return { ok: false, exists: true, value: null }
  }
}

function resolveMinThreshold(name, fallback) {
  const raw = toText(process.env[name])
  if (!raw) return fallback
  const parsed = Number(raw)
  if (!Number.isFinite(parsed) || parsed < 0) return fallback
  return parsed
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
    record?.mechanisms,
    record?.mechanism_summary,
    record?.effects,
    record?.primary_effects,
    record?.interactions,
    record?.contraindications,
    record?.contraindications_interactions,
    record?.safetyNotes,
    record?.safety_notes,
    record?.dosage,
    record?.dosage_range,
    record?.preparation,
    record?.oral_form,
    record?.activeCompounds,
    record?.traditionalUse,
    record?.therapeuticUses,
    record?.evidence_grade,
    record?.primaryDomain,
  ]

  return fields.reduce((count, field) => count + (toText(field).length > 0 ? 1 : 0), 0)
}

function hasLinkedContext(record) {
  return (
    toArray(record?.effects).length > 0 ||
    toArray(record?.primary_effects).length > 0 ||
    toArray(record?.interactions).length > 0 ||
    toArray(record?.activeCompounds).length > 0 ||
    toText(record?.mechanism).length > 0 ||
    toText(record?.mechanism_summary).length > 0 ||
    toText(record?.traditionalUse).length > 0 ||
    toText(record?.primaryDomain).length > 0
  )
}

function hasValidName(record) {
  const name = toText(
    record?.name ||
      record?.displayName ||
      record?.display_name ||
      record?.commonName ||
      record?.common_name ||
      record?.canonicalName ||
      record?.canonical_name ||
      record?.compound_name ||
      record?.latin,
  )
  const slug = toText(record?.slug)
  const badIdentityTokens = new Set(['[object object]', 'unknown', 'nan', 'undefined'])
  const lowerName = name.toLowerCase()
  const lowerSlug = slug.toLowerCase()
  if (badIdentityTokens.has(lowerName) || badIdentityTokens.has(lowerSlug)) return false
  return name.length >= 2 && slug.length >= 2
}

function entityLabel(record) {
  return toText(
    record?.displayName ||
      record?.display_name ||
      record?.name ||
      record?.commonName ||
      record?.common_name ||
      record?.canonicalName ||
      record?.canonical_name ||
      record?.compound_name ||
      record?.latin,
  )
}

function entitySummary(record) {
  return stripCitationBrackets(
    record?.summary ||
      record?.description ||
      record?.mechanism_summary ||
      record?.scispace_primary_fact_v2 ||
      record?.primary_fact ||
      record?.evidence_summary ||
      record?.safety_summary ||
      record?.safety_notes ||
      record?.best_for ||
      record?.time_to_effect ||
      record?.duration,
  )
}

function hasValidSlug(record) {
  const slug = toText(record?.slug)
  const badIdentityTokens = new Set(['[object object]', 'unknown', 'nan', 'undefined'])
  return slug.length >= 2 && !badIdentityTokens.has(slug.toLowerCase())
}

function isDeployableEntity(record) {
  if (!record || typeof record !== 'object') return false
  const slug = toText(record.slug)
  const label = entityLabel(record)
  const summary = entitySummary(record)
  const badIdentityTokens = new Set(['[object object]', 'unknown', 'nan', 'undefined'])
  return (
    slug.length >= 2 &&
    label.length >= 2 &&
    summary.length > 0 &&
    !badIdentityTokens.has(slug.toLowerCase()) &&
    !badIdentityTokens.has(label.toLowerCase())
  )
}

function isDeployableCompound(record) {
  if (!record || typeof record !== 'object') return false
  if (!hasValidSlug(record)) return false

  const label = entityLabel(record)
  const summary = entitySummary(record)
  const hasAnyCompoundContext =
    label.length >= 2 ||
    summary.length > 0 ||
    supportingFieldCount(record) > 0 ||
    Object.keys(record).some(key => !['slug', 'id'].includes(key) && toText(record[key]).length > 0)

  return hasAnyCompoundContext
}

function isPublishableHerb(record, thresholds) {
  if (!record || typeof record !== 'object') return false

  const descriptionLength = stripCitationBrackets(record?.description).length
  const summaryLength = stripCitationBrackets(record?.summary).length
  const mechanismSummaryLength = stripCitationBrackets(record?.mechanism_summary).length
  const sourceScore = sourceQualityScore(record)
  const supports = supportingFieldCount(record) > 0
  const linked = hasLinkedContext(record)
  const corrupted = /^\[object\s+object\]$/i.test(toText(record?.description))
  const hasAnyUsefulContent = descriptionLength > 0 || summaryLength > 0 || mechanismSummaryLength > 0 || sourceScore > 0 || supports

  if (!hasValidName(record) || corrupted || !hasAnyUsefulContent) return false

  const passesDescription =
    descriptionLength >= thresholds.publishableDescriptionLength || summaryLength > 0 || mechanismSummaryLength > 0
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

function validatePublicationManifest(manifest, warnings) {
  if (!manifest || typeof manifest !== 'object') {
    warnings.push('public/data/publication-manifest.json is missing or unreadable JSON (warning only for workbook-only deploy contract).')
    return
  }

  if (!toText(manifest.generatedAt)) {
    warnings.push('publication-manifest missing generatedAt timestamp (warning only).')
  }

  const entityHerbs = toArray(manifest?.entities?.herbs)
  const entityCompounds = toArray(manifest?.entities?.compounds)
  const routeHerbs = toArray(manifest?.routes?.herbs)
  const routeCompounds = toArray(manifest?.routes?.compounds)

  if (entityHerbs.length === 0) warnings.push('publication-manifest entities.herbs is empty (warning only).')
  if (entityCompounds.length === 0) warnings.push('publication-manifest entities.compounds is empty (warning only).')

  if (routeHerbs.length !== entityHerbs.length) {
    warnings.push(
      `publication-manifest coherence warning: routes.herbs (${routeHerbs.length}) does not match entities.herbs (${entityHerbs.length}).`,
    )
  }

  if (routeCompounds.length !== entityCompounds.length) {
    warnings.push(
      `publication-manifest coherence warning: routes.compounds (${routeCompounds.length}) does not match entities.compounds (${entityCompounds.length}).`,
    )
  }

  const malformedHerbEntity = entityHerbs.find(
    entry => !toText(entry?.slug) || !toText(entry?.route).startsWith('/herbs/') || entry?.publicationEligible !== true,
  )
  if (malformedHerbEntity) {
    warnings.push('publication-manifest contains malformed or non-publishable herb entries under entities.herbs (warning only).')
  }

  const malformedCompoundEntity = entityCompounds.find(
    entry => !toText(entry?.slug) || !toText(entry?.route).startsWith('/compounds/') || entry?.publicationEligible !== true,
  )
  if (malformedCompoundEntity) {
    warnings.push(
      'publication-manifest contains malformed or non-publishable compound entries under entities.compounds (warning only).',
    )
  }

  const herbsSummaryIndexable = Number(manifest?.summaries?.herbs?.indexable || 0)
  const compoundsSummaryIndexable = Number(manifest?.summaries?.compounds?.indexable || 0)
  if (herbsSummaryIndexable !== entityHerbs.length) {
    warnings.push(
      `publication-manifest summaries.herbs.indexable (${herbsSummaryIndexable}) does not match entities.herbs length (${entityHerbs.length}) (warning only).`,
    )
  }
  if (compoundsSummaryIndexable !== entityCompounds.length) {
    warnings.push(
      `publication-manifest summaries.compounds.indexable (${compoundsSummaryIndexable}) does not match entities.compounds length (${entityCompounds.length}) (warning only).`,
    )
  }
}

function validateCloudflareEnv(errors, warnings) {
  const deployMode = toText(process.env.DEPLOY_MODE || DEPLOY_MODES.githubPagesIntegration)
  if (!Object.values(DEPLOY_MODES).includes(deployMode)) {
    errors.push(
      `DEPLOY_MODE must be one of: ${DEPLOY_MODES.githubPagesIntegration}, ${DEPLOY_MODES.cloudflareDirect} (received "${deployMode || '(empty)'}").`,
    )
    return deployMode
  }

  const token = toText(process.env.CLOUDFLARE_API_TOKEN)
  const accountId = toText(process.env.CLOUDFLARE_ACCOUNT_ID)
  const project = toText(process.env.CLOUDFLARE_PAGES_PROJECT)
  const missing = []
  if (!token) missing.push('CLOUDFLARE_API_TOKEN')
  if (!accountId) missing.push('CLOUDFLARE_ACCOUNT_ID')
  if (!project) missing.push('CLOUDFLARE_PAGES_PROJECT')

  const requireDirectSecrets = toText(process.env.REQUIRE_CLOUDFLARE_DIRECT_SECRETS).toLowerCase() === 'true'

  if (missing.length > 0) {
    const message = `Cloudflare direct deploy secrets missing: ${missing.join(', ')}.`
    if (deployMode === DEPLOY_MODES.cloudflareDirect && requireDirectSecrets) {
      errors.push(`${message} Configure these as GitHub Actions repository secrets before direct API deploy.`)
    } else {
      warnings.push(`${message} Assuming Cloudflare Pages GitHub integration will build from the repository.`)
    }
    return deployMode
  }

  if (!/^[a-f0-9]{32}$/i.test(accountId)) {
    errors.push('CLOUDFLARE_ACCOUNT_ID appears malformed (expected 32 hex characters).')
  }

  if (!/^[a-z0-9][a-z0-9-]{1,62}$/.test(project)) {
    errors.push('CLOUDFLARE_PAGES_PROJECT appears malformed (use lowercase letters, numbers, and hyphens).')
  }

  return deployMode
}

function main() {
  const errors = []
  const warnings = []
  const minPublishableHerbs = resolveMinThreshold('MIN_PUBLISHABLE_HERBS', DEFAULT_MIN_PUBLISHABLE_HERBS)
  const minPublishableCompounds = resolveMinThreshold('MIN_PUBLISHABLE_COMPOUNDS', DEFAULT_MIN_PUBLISHABLE_COMPOUNDS)

  const herbsData = readJsonWithStatus('public/data/herbs.json', errors)
  const compoundsData = readJsonWithStatus('public/data/compounds.json', errors)
  const herbsSummaryData = readJsonWithStatus('public/data/herbs-summary.json', errors)
  const compoundsSummaryData = readJsonWithStatus('public/data/compounds-summary.json', errors)
  const manifest = readJson('public/data/publication-manifest.json')

  if (!herbsData.exists || !Array.isArray(herbsData.value)) {
    errors.push('public/data/herbs.json is missing or not an array.')
  } else {
    if (herbsData.value.length === 0) {
      errors.push('public/data/herbs.json contains zero herbs.')
    }

    const thresholds = {
      publishableDescriptionLength:
        Number(manifest?.thresholds?.publishableDescriptionLength) || QUALITY_THRESHOLDS.publishableDescriptionLength,
      publishableMinSources: Number(manifest?.thresholds?.publishableMinSources) || QUALITY_THRESHOLDS.publishableMinSources,
    }
    const publishableCount = herbsData.value.filter(herb => isPublishableHerb(herb, thresholds)).length
    const deployableCount = herbsData.value.filter(isDeployableEntity).length

    if (deployableCount < minPublishableHerbs) {
      errors.push(
        `Deployable herb count below threshold: ${deployableCount} < ${minPublishableHerbs} (set MIN_PUBLISHABLE_HERBS to override).`,
      )
    }

    if (publishableCount < minPublishableHerbs) {
      warnings.push(
        `Strict herb quality count below threshold: ${publishableCount} < ${minPublishableHerbs}. Static deploy is allowed because deployable workbook records=${deployableCount}.`,
      )
    }
  }

  if (!compoundsData.exists || !Array.isArray(compoundsData.value)) {
    errors.push('public/data/compounds.json is missing or not an array.')
  } else {
    if (compoundsData.value.length === 0) {
      errors.push('public/data/compounds.json contains zero compounds.')
    }

    const deployableCompounds = compoundsData.value.filter(isDeployableCompound).length
    if (deployableCompounds < minPublishableCompounds) {
      errors.push(
        `Deployable compound count below threshold: ${deployableCompounds} < ${minPublishableCompounds} (set MIN_PUBLISHABLE_COMPOUNDS to override).`,
      )
    }
  }

  if (!herbsSummaryData.exists || !Array.isArray(herbsSummaryData.value)) {
    errors.push('public/data/herbs-summary.json is missing or not an array.')
  }
  if (!compoundsSummaryData.exists || !Array.isArray(compoundsSummaryData.value)) {
    errors.push('public/data/compounds-summary.json is missing or not an array.')
  }

  if (!fs.existsSync(path.join(ROOT, 'public/data/herbs-detail'))) {
    errors.push('public/data/herbs-detail is missing.')
  }
  if (!fs.existsSync(path.join(ROOT, 'public/data/compounds-detail'))) {
    errors.push('public/data/compounds-detail is missing.')
  }

  const sitemap = countSitemapLocs('public/sitemap.xml')
  if (!sitemap.exists) {
    errors.push('public/sitemap.xml is missing (run `npm run sitemap` before deploy).')
  } else if (sitemap.count <= MIN_SITEMAP_LOC_ENTRIES) {
    errors.push(`public/sitemap.xml must contain more than ${MIN_SITEMAP_LOC_ENTRIES} <loc> entries (found ${sitemap.count}).`)
  }

  validatePublicationManifest(manifest, warnings)

  const posts = listBlogPosts('content/blog')
  const nonDraftCount = posts.filter(post => !post.draft).length
  if (nonDraftCount < MIN_NON_DRAFT_BLOG_POSTS) {
    warnings.push(`content/blog includes fewer than ${MIN_NON_DRAFT_BLOG_POSTS} non-draft posts (found ${nonDraftCount}); blog detail routing is disabled for static MVP.`)
  }

  const deployMode = validateCloudflareEnv(errors, warnings)

  for (const warning of warnings) {
    console.warn(`[deploy-readiness] WARN ${warning}`)
  }

  if (errors.length > 0) {
    fail(errors)
  }

  console.log(
    `[deploy-readiness] PASS deployableHerbs>=${minPublishableHerbs}, deployableCompounds>=${minPublishableCompounds}, sitemapLocs>${MIN_SITEMAP_LOC_ENTRIES}, canonicalData=valid, deployMode=${deployMode}, cloudflareEnv=valid-for-current-mode`,
  )
}

main()
