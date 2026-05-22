#!/usr/bin/env node

import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { assertWorkbookExists, resolveWorkbookPath } from '../workbook-source.mjs'
import { getSheet, getSheetNames, readWorkbook, sheetToRows } from './workbook-parser.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '../..')

const REQUIRED_SHEETS = [
  'Editorial Compound Pages',
  'Editorial Learn Articles',
  'Editorial Research Notes',
  'Editorial Compare Tables',
]

const WARN_ONLY_SHEETS = [
  'Canonical Enums',
  'Runtime Validation Rules',
  'Runtime Payload Spec',
  'Runtime QA Gates',
  'Publisher Workflow',
]

const CANONICAL_EVIDENCE_TIERS = new Set(['Strong', 'Moderate', 'Limited', 'Theoretical', 'Unknown'])
const CANONICAL_SAFETY_LEVELS = new Set(['Safe', 'Review', 'Caution', 'Avoid', 'Unknown'])
const INDIVIDUAL_VARIATION_REGEX = /\b(individual|interindividual|person[-\s]?to[-\s]?person|var(?:y|ies|iation|iable)|responders?)\b/i

function clean(value) {
  if (value === null || value === undefined) return ''
  return String(value).replace(/\s+/g, ' ').trim()
}

function slugify(value) {
  return clean(value)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function first(row, keys) {
  for (const key of keys) {
    const value = row?.[key]
    if (clean(value)) return value
  }
  return ''
}

function parseArgs(argv) {
  const strict = argv.slice(2).includes('--strict')
  return { strict }
}

function pushIssue(list, severity, sheet, rowNumber, message) {
  list.push({ severity, sheet, rowNumber, message })
}

function validateSheets(sheetNames, issues) {
  for (const name of REQUIRED_SHEETS) {
    if (!sheetNames.includes(name)) {
      pushIssue(issues, 'error', name, '-', 'missing required editorial sheet')
    }
  }

  for (const name of WARN_ONLY_SHEETS) {
    if (!sheetNames.includes(name)) {
      pushIssue(issues, 'warn', name, '-', 'missing warn-only governance sheet')
    }
  }
}

function validateCompoundPages(rows, issues) {
  const slugToRows = new Map()

  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index] || {}
    const rowNumber = index + 2

    const title = clean(first(row, ['title', 'name', 'compound_title', 'compound name']))
    if (!title) {
      pushIssue(issues, 'error', 'Editorial Compound Pages', rowNumber, 'title/name is required')
    }

    const rawSlug = clean(first(row, ['slug', 'url_slug', 'compound_slug']))
    const resolvedSlug = rawSlug || slugify(title)

    if (!resolvedSlug) {
      pushIssue(issues, 'error', 'Editorial Compound Pages', rowNumber, 'slug is required or derivable from title/name')
    }

    if (resolvedSlug) {
      const slugKey = resolvedSlug.toLowerCase()
      const existing = slugToRows.get(slugKey) || []
      existing.push(rowNumber)
      slugToRows.set(slugKey, existing)
    }

    const pageText = clean(
      first(row, ['page_text', 'content', 'body', 'summary', 'editorial_copy', 'description'])
    )
    if (pageText && !INDIVIDUAL_VARIATION_REGEX.test(pageText)) {
      pushIssue(issues, 'warn', 'Editorial Compound Pages', rowNumber, 'text does not mention individual variation')
    }

    const evidenceTier = clean(first(row, ['evidence_tier', 'evidence tier']))
    if (evidenceTier && !CANONICAL_EVIDENCE_TIERS.has(evidenceTier)) {
      pushIssue(issues, 'warn', 'Editorial Compound Pages', rowNumber, `non-canonical evidence tier: ${evidenceTier}`)
    }

    const safetyLevel = clean(first(row, ['safety_level', 'safety level']))
    if (safetyLevel && !CANONICAL_SAFETY_LEVELS.has(safetyLevel)) {
      pushIssue(issues, 'warn', 'Editorial Compound Pages', rowNumber, `non-canonical safety level: ${safetyLevel}`)
    }
  }

  for (const [slug, rowNumbers] of slugToRows.entries()) {
    if (rowNumbers.length > 1) {
      for (const rowNumber of rowNumbers) {
        pushIssue(
          issues,
          'error',
          'Editorial Compound Pages',
          rowNumber,
          `duplicate slug "${slug}" appears ${rowNumbers.length} times`
        )
      }
    }
  }
}

function validateResearchNotes(rows, issues) {
  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index] || {}
    const rowNumber = index + 2

    const title = clean(first(row, ['title', 'name', 'research_note_title']))
    if (!title) {
      pushIssue(issues, 'error', 'Editorial Research Notes', rowNumber, 'title is required')
    }

    const limitations = clean(first(row, ['limitations', 'limiters', 'study_limitations']))
    if (!limitations) {
      pushIssue(issues, 'warn', 'Editorial Research Notes', rowNumber, 'limitations should exist')
    }

    const citation = clean(first(row, ['citation', 'source', 'url', 'doi']))
    const needsVerification = clean(first(row, ['needs_verification', 'needs verification', 'citation_needs_verification']))
    if (!citation && !needsVerification) {
      pushIssue(
        issues,
        'warn',
        'Editorial Research Notes',
        rowNumber,
        'citation or needs-verification marker should exist'
      )
    }
  }
}

function printIssues(issues) {
  for (const issue of issues) {
    console.error(`[${issue.severity.toUpperCase()}] ${issue.sheet} | row ${issue.rowNumber} | ${issue.message}`)
  }
}

function run() {
  const { strict } = parseArgs(process.argv)

  const workbookPath = resolveWorkbookPath(repoRoot)
  assertWorkbookExists(workbookPath)

  const workbook = readWorkbook(workbookPath)
  const sheetNames = getSheetNames(workbook)
  const issues = []

  validateSheets(sheetNames, issues)

  const compoundSheet = getSheet(workbook, 'Editorial Compound Pages')
  if (compoundSheet) {
    validateCompoundPages(sheetToRows(compoundSheet), issues)
  }

  const researchSheet = getSheet(workbook, 'Editorial Research Notes')
  if (researchSheet) {
    validateResearchNotes(sheetToRows(researchSheet), issues)
  }

  const errors = issues.filter((issue) => issue.severity === 'error')
  const warnings = issues.filter((issue) => issue.severity === 'warn')

  if (issues.length > 0) {
    printIssues(issues)
  }

  if (errors.length > 0 || (strict && warnings.length > 0)) {
    console.error(`[editorial-workbook] FAIL errors=${errors.length} warnings=${warnings.length} strict=${strict}`)
    process.exit(1)
  }

  console.log(`[editorial-workbook] PASS errors=${errors.length} warnings=${warnings.length} strict=${strict}`)
}

run()
