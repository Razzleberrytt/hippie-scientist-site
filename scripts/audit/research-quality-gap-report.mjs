#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '../..')
const reportsDir = path.join(repoRoot, 'reports')

const DETAIL_DIRS = [
  ['herb', path.join(repoRoot, 'public/data/herbs-detail')],
  ['compound', path.join(repoRoot, 'public/data/compounds-detail')],
]

const SEVERITY_WEIGHT = { critical: 100, high: 40, medium: 15, low: 5 }

const PLACEHOLDER_PATTERNS = [
  /minimal citation row/i,
  /metadata extraction/i,
  /source present in evidence[_ ]register/i,
  /not source-complete/i,
  /needs review/i,
  /research pending/i,
  /safety review pending/i,
  /placeholder/i,
]

const GENERIC_DESCRIPTION_PATTERNS = [
  /^traditional (herbal|medicinal) (medicine|product)/i,
  /emerging evidence supporting therapeutic applications/i,
]

const GENERIC_SAFETY_PATTERNS = [
  /^generally well tolerated( when used appropriately| for most users)?[.;]?$/i,
  /review interactions and contraindications/i,
]

const HUMAN_EVIDENCE_LEVELS = new Set([
  'human_rct',
  'human_obs',
  'human_observational',
  'human_clinical',
  'meta_analysis',
  'systematic_review',
])

function clean(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim()
}

function safeArray(value) {
  return Array.isArray(value) ? value : []
}

function hasAnyPattern(value, patterns) {
  const text = clean(value)
  return Boolean(text) && patterns.some(pattern => pattern.test(text))
}

function isIndexable(profile) {
  const robots = clean(profile.robots).toLowerCase()
  const status = clean(profile.indexability_status).toUpperCase()
  const sitemap = profile.sitemap_included === true
  return status === 'PUBLISH' || robots === 'index,follow' || sitemap
}

function canonicalIdentifier(source) {
  const doi = clean(source?.doi).toLowerCase().replace(/^https?:\/\/(dx\.)?doi\.org\//, '')
  if (doi) return `doi:${doi}`
  const pmid = clean(source?.pmid || source?.pubmedId)
  if (pmid) return `pmid:${pmid}`
  const url = clean(source?.url).toLowerCase().replace(/\/$/, '')
  return url ? `url:${url}` : ''
}

function addFinding(findings, severity, code, message, detail = {}) {
  findings.push({ severity, code, message, ...detail })
}

function tierLooksMechanistic(value) {
  const tier = clean(value).toLowerCase()
  return tier.includes('mechanistic') || tier.includes('preclinical')
}

function hasHumanClaim(claims) {
  return claims.some(claim => HUMAN_EVIDENCE_LEVELS.has(clean(claim?.evidenceLevel).toLowerCase()))
}

function auditProfile(profile, type, filePath) {
  const findings = []
  const slug = clean(profile.slug) || path.basename(filePath, '.json')
  const name = clean(profile.name) || slug
  const sources = safeArray(profile.sources)
  const curatedSources = sources.filter(source => clean(source?.id))
  const claims = safeArray(profile.claimMap)
  const evidence = profile.evidence && typeof profile.evidence === 'object' ? profile.evidence : {}
  const governance = profile.governance && typeof profile.governance === 'object' ? profile.governance : {}
  const indexable = isIndexable(profile)

  if (indexable && governance.indexingAllowed === false) {
    addFinding(
      findings,
      'critical',
      'INDEXING_GOVERNANCE_CONTRADICTION',
      'Runtime is indexable/publishable while governance explicitly disallows indexing.',
    )
  }

  if (indexable && /pending/i.test(clean(evidence.reviewStatus))) {
    addFinding(
      findings,
      'high',
      'INDEXABLE_PENDING_EVIDENCE_REVIEW',
      `Indexable profile has evidence reviewStatus="${clean(evidence.reviewStatus)}".`,
    )
  }

  const pendingClaims = claims.filter(claim => !/^approved$/i.test(clean(claim?.reviewStatus)))
  if (indexable && pendingClaims.length > 0) {
    addFinding(
      findings,
      'high',
      'INDEXABLE_UNAPPROVED_CLAIMS',
      `${pendingClaims.length} claim(s) are not approved on an indexable profile.`,
      { claimIds: pendingClaims.map(claim => clean(claim?.id)).filter(Boolean) },
    )
  }

  if (indexable && clean(profile.profile_status).toLowerCase() === 'partial') {
    addFinding(
      findings,
      'high',
      'INDEXABLE_PARTIAL_PROFILE',
      'Profile is marked partial but is exposed as publishable/indexable.',
    )
  }

  if (hasAnyPattern(profile.description, GENERIC_DESCRIPTION_PATTERNS)) {
    addFinding(findings, 'medium', 'GENERIC_DESCRIPTION', 'Description is generic rather than entity-specific research copy.')
  }

  const safetyText = [
    clean(profile.safetyNotes),
    clean(profile.safety),
    ...safeArray(profile.contraindications).map(clean),
  ].filter(Boolean)

  if (safetyText.some(text => hasAnyPattern(text, PLACEHOLDER_PATTERNS))) {
    addFinding(findings, 'high', 'SAFETY_PLACEHOLDER', 'Safety/contraindication content contains placeholder or workflow text.')
  }

  if (safetyText.some(text => hasAnyPattern(text, GENERIC_SAFETY_PATTERNS))) {
    addFinding(findings, 'medium', 'GENERIC_SAFETY', 'Safety copy is generic and not evidence-bounded.')
  }

  if (hasHumanClaim(claims) && !clean(profile.preparation)) {
    addFinding(
      findings,
      'medium',
      'HUMAN_EVIDENCE_WITHOUT_PREPARATION_CONTEXT',
      'Human evidence is present but preparation/product context is blank.',
    )
  }

  if (hasHumanClaim(claims) && tierLooksMechanistic(profile.evidence_tier)) {
    addFinding(
      findings,
      'high',
      'EVIDENCE_TIER_CONTRADICTS_CLAIMS',
      `evidence_tier="${clean(profile.evidence_tier)}" conflicts with human evidence in claimMap.`,
    )
  }

  const sourceById = new Map()
  const duplicateIdentifiers = new Map()
  for (const source of curatedSources) {
    const id = clean(source.id)
    sourceById.set(id, source)

    if (hasAnyPattern(`${clean(source.title)} ${clean(source.citation)} ${clean(source.note)}`, PLACEHOLDER_PATTERNS)) {
      addFinding(
        findings,
        'high',
        'PLACEHOLDER_SOURCE_METADATA',
        `Source ${id} contains placeholder/incomplete citation metadata.`,
        { sourceId: id },
      )
    }

    const hasStableLocator = Boolean(clean(source.doi) || clean(source.pmid || source.pubmedId) || clean(source.url))
    if (!clean(source.title) || !hasStableLocator) {
      addFinding(
        findings,
        'high',
        'INCOMPLETE_SOURCE_METADATA',
        `Source ${id} is missing a title or stable locator (DOI/PMID/URL).`,
        { sourceId: id },
      )
    }

    const identifier = canonicalIdentifier(source)
    if (identifier) {
      if (!duplicateIdentifiers.has(identifier)) duplicateIdentifiers.set(identifier, [])
      duplicateIdentifiers.get(identifier).push(id)
    }
  }

  for (const [identifier, sourceIds] of duplicateIdentifiers) {
    if (sourceIds.length > 1) {
      addFinding(
        findings,
        'medium',
        'DUPLICATE_CURATED_SOURCE',
        `Duplicate curated source identifier ${identifier}.`,
        { sourceIds },
      )
    }
  }

  for (const claim of claims) {
    const claimId = clean(claim?.id)
    const refs = safeArray(claim?.sourceRefIds).map(clean).filter(Boolean)
    if (refs.length === 0) {
      addFinding(
        findings,
        'critical',
        'CLAIM_WITHOUT_SOURCE',
        `Claim ${claimId || '(missing id)'} has no sourceRefIds.`,
        { claimId },
      )
      continue
    }

    const missingRefs = refs.filter(ref => !sourceById.has(ref))
    if (missingRefs.length > 0) {
      addFinding(
        findings,
        'critical',
        'CLAIM_REFERENCES_MISSING_SOURCE',
        `Claim ${claimId || '(missing id)'} references source IDs not present in curated sources.`,
        { claimId, missingSourceIds: missingRefs },
      )
    }
  }

  const declaredSourceCount = Number(evidence.sourceCount)
  if (Number.isFinite(declaredSourceCount) && declaredSourceCount !== curatedSources.length) {
    addFinding(
      findings,
      'high',
      'SOURCE_COUNT_MISMATCH',
      `evidence.sourceCount=${declaredSourceCount}, but ${curatedSources.length} curated source(s) with IDs are present.`,
    )
  }

  const declaredClaimCount = Number(evidence.claimCount)
  if (Number.isFinite(declaredClaimCount) && declaredClaimCount !== claims.length) {
    addFinding(
      findings,
      'high',
      'CLAIM_COUNT_MISMATCH',
      `evidence.claimCount=${declaredClaimCount}, but claimMap contains ${claims.length} claim(s).`,
    )
  }

  const evidenceSourceIds = safeArray(evidence.sourceIds).map(clean).filter(Boolean)
  const evidenceClaimIds = safeArray(evidence.claimIds).map(clean).filter(Boolean)
  const actualSourceIds = curatedSources.map(source => clean(source.id)).filter(Boolean)
  const actualClaimIds = claims.map(claim => clean(claim?.id)).filter(Boolean)

  const missingEvidenceSources = actualSourceIds.filter(id => !evidenceSourceIds.includes(id))
  const staleEvidenceSources = evidenceSourceIds.filter(id => !actualSourceIds.includes(id))
  if (missingEvidenceSources.length || staleEvidenceSources.length) {
    addFinding(
      findings,
      'high',
      'EVIDENCE_SOURCE_LEDGER_MISMATCH',
      'evidence.sourceIds does not match the curated sources present on the profile.',
      { missingEvidenceSources, staleEvidenceSources },
    )
  }

  const missingEvidenceClaims = actualClaimIds.filter(id => !evidenceClaimIds.includes(id))
  const staleEvidenceClaims = evidenceClaimIds.filter(id => !actualClaimIds.includes(id))
  if (missingEvidenceClaims.length || staleEvidenceClaims.length) {
    addFinding(
      findings,
      'high',
      'EVIDENCE_CLAIM_LEDGER_MISMATCH',
      'evidence.claimIds does not match claimMap.',
      { missingEvidenceClaims, staleEvidenceClaims },
    )
  }

  const score = findings.reduce((sum, finding) => sum + SEVERITY_WEIGHT[finding.severity], 0)
  return { name, slug, type, file: path.relative(repoRoot, filePath), score, findings }
}

function loadProfiles() {
  const profiles = []
  for (const [type, dir] of DETAIL_DIRS) {
    if (!fs.existsSync(dir)) continue
    const files = fs.readdirSync(dir).filter(name => name.endsWith('.json')).sort()
    for (const file of files) {
      const filePath = path.join(dir, file)
      try {
        const profile = JSON.parse(fs.readFileSync(filePath, 'utf8'))
        profiles.push(auditProfile(profile, type, filePath))
      } catch (error) {
        profiles.push({
          name: file,
          slug: file.replace(/\.json$/, ''),
          type,
          file: path.relative(repoRoot, filePath),
          score: SEVERITY_WEIGHT.critical,
          findings: [{
            severity: 'critical',
            code: 'INVALID_JSON',
            message: error instanceof Error ? error.message : String(error),
          }],
        })
      }
    }
  }
  return profiles.sort((a, b) => b.score - a.score || a.slug.localeCompare(b.slug))
}

function summarize(profiles) {
  const bySeverity = { critical: 0, high: 0, medium: 0, low: 0 }
  const byCode = {}
  let profilesWithFindings = 0

  for (const profile of profiles) {
    if (profile.findings.length) profilesWithFindings += 1
    for (const finding of profile.findings) {
      bySeverity[finding.severity] += 1
      byCode[finding.code] = (byCode[finding.code] || 0) + 1
    }
  }

  return {
    profilesScanned: profiles.length,
    profilesWithFindings,
    profilesClean: profiles.length - profilesWithFindings,
    findingsBySeverity: bySeverity,
    findingsByCode: Object.fromEntries(
      Object.entries(byCode).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])),
    ),
  }
}

function renderMarkdown(payload) {
  const lines = [
    '# Research Quality Gap Audit',
    '',
    `Generated: ${payload.generatedAt}`,
    '',
    'This report goes beyond field presence. It checks source/claim integrity, editorial review state,',
    'governance/indexability contradictions, placeholder citation metadata, preparation context, and',
    'evidence-ledger consistency across generated herb and compound detail profiles.',
    '',
    '## Summary',
    '',
    `- Profiles scanned: **${payload.summary.profilesScanned}**`,
    `- Profiles with findings: **${payload.summary.profilesWithFindings}**`,
    `- Clean profiles: **${payload.summary.profilesClean}**`,
    `- Critical findings: **${payload.summary.findingsBySeverity.critical}**`,
    `- High findings: **${payload.summary.findingsBySeverity.high}**`,
    `- Medium findings: **${payload.summary.findingsBySeverity.medium}**`,
    `- Low findings: **${payload.summary.findingsBySeverity.low}**`,
    '',
    '## Finding Types',
    '',
    '| Code | Count |',
    '| --- | ---: |',
    ...Object.entries(payload.summary.findingsByCode).map(([code, count]) => `| \`${code}\` | ${count} |`),
    '',
    '## Highest-Priority Profiles',
    '',
    '| Score | Type | Profile | Findings |',
    '| ---: | --- | --- | ---: |',
    ...payload.profiles
      .filter(profile => profile.findings.length)
      .slice(0, 100)
      .map(profile => `| ${profile.score} | ${profile.type} | \`${profile.slug}\` | ${profile.findings.length} |`),
    '',
  ]

  for (const profile of payload.profiles.filter(profile => profile.findings.length).slice(0, 100)) {
    lines.push(`### ${profile.name} (\`${profile.slug}\`)`)
    lines.push('')
    lines.push(`Source: \`${profile.file}\`  `)
    lines.push(`Priority score: **${profile.score}**`)
    lines.push('')
    for (const finding of profile.findings) {
      lines.push(`- **${finding.severity.toUpperCase()} — ${finding.code}:** ${finding.message}`)
    }
    lines.push('')
  }

  return `${lines.join('\n')}\n`
}

function run() {
  const profiles = loadProfiles()
  const payload = {
    generatedAt: new Date().toISOString(),
    summary: summarize(profiles),
    profiles,
  }

  fs.mkdirSync(reportsDir, { recursive: true })
  fs.writeFileSync(
    path.join(reportsDir, 'research-quality-gaps.json'),
    `${JSON.stringify(payload, null, 2)}\n`,
    'utf8',
  )
  fs.writeFileSync(
    path.join(reportsDir, 'research-quality-gaps.md'),
    renderMarkdown(payload),
    'utf8',
  )

  console.log(
    `[research-quality-gaps] Scanned ${payload.summary.profilesScanned} profiles; ` +
      `${payload.summary.profilesWithFindings} have findings.`,
  )
  console.log('[research-quality-gaps] Wrote reports/research-quality-gaps.json')
  console.log('[research-quality-gaps] Wrote reports/research-quality-gaps.md')
}

run()
