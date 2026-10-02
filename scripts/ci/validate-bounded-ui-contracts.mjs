#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const root = process.cwd()

function escapeRegex(value) {
  return value.replace(/[.*+?^$()|[\]\\]/g, '\\$&')
}

export function requiredCopyForRoute(verifierSource, route) {
  const routePattern = new RegExp(
    "route:\\s*['\"]" + escapeRegex(route) + "['\"]\\s*,\\s*required:\\s*\\[([^\\]]*)\\]",
    's',
  )
  const match = verifierSource.match(routePattern)
  if (!match) throw new Error('No required core-route copy contract found for ' + route)

  return [...match[1].matchAll(/['"]([^'"]+)['"]/g)].map((entry) => entry[1])
}

export function validateRequiredSourceCopy({ route, source, verifierSource }) {
  const required = requiredCopyForRoute(verifierSource, route)
  return required.filter((value) => !source.includes(value))
}

export function validateBoundedUiContracts({
  researchSource = fs.readFileSync(path.join(root, 'app/research/page.tsx'), 'utf8'),
  verifierSource = fs.readFileSync(path.join(root, 'scripts/verify-core-routes.mjs'), 'utf8'),
} = {}) {
  const missing = validateRequiredSourceCopy({
    route: '/research',
    source: researchSource,
    verifierSource,
  })

  if (missing.length) {
    throw new Error(
      '[bounded-ui-contracts] /research source and postbuild core-route copy drifted: ' + missing.join(' | '),
    )
  }

  return { routes: 1, requiredCopyChecks: requiredCopyForRoute(verifierSource, '/research').length }
}

function main() {
  const result = validateBoundedUiContracts()
  console.log(
    '[bounded-ui-contracts] verified ' + result.routes +
      ' bounded hub route and ' + result.requiredCopyChecks +
      ' source↔postbuild copy requirements',
  )
}

const entry = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : ''
if (entry && import.meta.url === entry) main()
