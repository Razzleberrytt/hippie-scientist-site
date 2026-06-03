#!/usr/bin/env tsx
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import publicationManifest from '../public/data/publication-manifest.json'
import submissions from '../ops/enrichment-submissions.json'
import {
  buildFallbackCompoundIntro,
  buildFallbackHerbIntro,
  buildGovernedDetailIntro,
  countPlaceholderSignals,
} from '../src/lib/governedIntro'
import {
  getGovernedResearchEnrichment,
  getPublishableGovernedEntries,
  type GovernedEntityType,
} from '../src/lib/governedResearch'
import { calculateCompoundConfidence, calculateHerbConfidence } from '../src/utils/calculateConfidence'

type EntityType = 'herb' | 'compound'

const BLOCKED_REVIEW_STATUSES = new Set([
  'blocked',
  'rejected',
  'revision_requested',
  'ready_for_review',
  'draft_submission',
])

function asString(value: unknown) {
  return String(value || '').trim()
}

function asStringArray(value: unknown) {
  if (!Array.isArray(value)) return []
  return value.map(item => String(item || '').trim()).filter(Boolean)
}

function keyOf(entityType: EntityType, slug: string) {
  return `${entityType}:${slug}`
}

function readDetailRow(entityType: EntityType, slug: string): Record<string, unknown> | null {
  const filePath = path.join(
    process.cwd(),
    'public',
    'data',
    entityType === 'herb' ? 'herbs-detail' : 'compounds-detail',
    `${slug}.json`,
  )
  if (!fs.existsSync(filePath)) return null
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as Record<string, unknown>
}

function run() {
  const herbRoutes = (((publicationManifest as Record<string, unknown>).routes || {}) as Record<
    string,
    string[]
  >).herbs || []
  const compoundRoutes = (((publicationManifest as Record<string, unknown>).routes || {}) as Record<
    string,
    string[]
  >).compounds || []

  const blockedOrUnapproved = new Set(
    (submissions as Array<{
      entityType: GovernedEntityType
      entitySlug: string
      reviewStatus: string
      active?: boolean
    }>)
      .filter(row => BLOCKED_REVIEW_STATUSES.has(String(row.reviewStatus)) || row.active !== true)
      .map(row => keyOf(row.entityType, row.entitySlug)),
  )

  let evaluated = 0
  let governedCount = 0
  let fallbackCount = 0
  let placeholderBefore = 0
  let placeholderAfter = 0

  for (const route of herbRoutes) {
    const slug = asString(route).replace(/^\/herbs\//, '')
    const row = readDetailRow('herb', slug)
    if (!row) continue
    evaluated += 1

    const effects = asStringArray(row.effects)
    const therapeuticUses = asStringArray(row.therapeuticUses)
    const contraindications = asStringArray(row.contraindications)
    const interactions = asStringArray(row.interactions)
    const sideEffects = asStringArray(row.sideeffects)
    const sourceCount = Array.isArray(row.sources) ? row.sources.length : 0
    const cautionCount = contraindications.length + interactions.length + sideEffects.length
    const confidence = calculateHerbConfidence({
      mechanism: asString(row.mechanism),
      effects,
      compounds: asStringArray(row.activeCompounds),
    })

    const fallbackIntro = buildFallbackHerbIntro({
      herbDisplayName: asString(row.commonName || row.common || row.name || slug),
      description: asString(row.description),
      mechanism: asString(row.mechanism),
      therapeuticUses,
      primaryEffects: effects.slice(0, 4),
      confidence,
      sourceCount,
      cautionCount,
      contraindications,
      interactions,
      sideEffects,
      introFacts: [
        sourceCount > 0 ? `${sourceCount} source${sourceCount === 1 ? '' : 's'} listed` : 'sources pending',
        cautionCount > 0
          ? `${cautionCount} caution signal${cautionCount === 1 ? '' : 's'}`
          : 'no caution flags listed',
      ],
    })

    const governedIntro = buildGovernedDetailIntro({
      entityName: asString(row.commonName || row.common || row.name || slug),
      fallback: fallbackIntro,
      enrichment: getGovernedResearchEnrichment('herb', slug),
      sourceCount,
    })

    placeholderBefore += countPlaceholderSignals(fallbackIntro)
    placeholderAfter += countPlaceholderSignals(governedIntro)

    if (governedIntro.decision.mode === 'governed') governedCount += 1
    else fallbackCount += 1

    if (blockedOrUnapproved.has(keyOf('herb', slug))) {
      assert.equal(
        governedIntro.decision.mode,
        'fallback',
        `Blocked/unapproved herb leaked governed intro: herb:${slug}`,
      )
    }
  }

  for (const route of compoundRoutes) {
    const slug = asString(route).replace(/^\/compounds\//, '')
    const row = readDetailRow('compound', slug)
    if (!row) continue
    evaluated += 1

    const effects = asStringArray(row.effects)
    const therapeuticUses = asStringArray(row.therapeuticUses)
    const contraindications = asStringArray(row.contraindications)
    const interactions = asStringArray(row.interactions)
    const sideEffects = asStringArray(row.sideEffects)
    const herbs = asStringArray(row.herbs)
    const sourceCount = Array.isArray(row.sources) ? row.sources.length : 0
    const cautionCount = contraindications.length + interactions.length + sideEffects.length
    const confidence = calculateCompoundConfidence({
      mechanism: asString(row.mechanism),
      effects,
      compounds: herbs,
    })

    const fallbackIntro = buildFallbackCompoundIntro({
      compoundName: asString(row.name || slug),
      description: asString(row.description),
      mechanism: asString(row.mechanism),
      therapeuticUses,
      primaryEffects: effects.slice(0, 4),
      linkedHerbCount: herbs.length,
      confidence,
      sourceCount,
      cautionCount,
      contraindications,
      interactions,
      sideEffects,
      introFacts: [
        sourceCount > 0 ? `${sourceCount} source${sourceCount === 1 ? '' : 's'} listed` : 'sources pending',
        cautionCount > 0
          ? `${cautionCount} caution signal${cautionCount === 1 ? '' : 's'}`
          : 'no caution flags listed',
      ],
    })

    const governedIntro = buildGovernedDetailIntro({
      entityName: asString(row.name || slug),
      fallback: fallbackIntro,
      enrichment: getGovernedResearchEnrichment('compound', slug),
      sourceCount,
    })

    placeholderBefore += countPlaceholderSignals(fallbackIntro)
    placeholderAfter += countPlaceholderSignals(governedIntro)

    if (governedIntro.decision.mode === 'governed') governedCount += 1
    else fallbackCount += 1

    if (blockedOrUnapproved.has(keyOf('compound', slug))) {
      assert.equal(
        governedIntro.decision.mode,
        'fallback',
        `Blocked/unapproved compound leaked governed intro: compound:${slug}`,
      )
    }
  }

  const publishable = getPublishableGovernedEntries()
  assert.ok(publishable.length > 0, 'Expected publishable governed entries for intro verification.')
  assert.ok(governedCount > 0, 'Expected at least one page to receive governed intro output.')
  assert.ok(placeholderAfter <= placeholderBefore, 'Expected placeholder-heavy intro signals to be reduced or unchanged.')

  console.log(
    `[verify-governed-intro-refresh] PASS evaluated=${evaluated} governed=${governedCount} fallback=${fallbackCount} placeholderBefore=${placeholderBefore} placeholderAfter=${placeholderAfter}`,
  )
}

run()
