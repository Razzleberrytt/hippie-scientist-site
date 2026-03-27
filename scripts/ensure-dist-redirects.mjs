import { copyFile, access, readFile, writeFile } from 'node:fs/promises'
import { constants } from 'node:fs'
import path from 'node:path'

const source = path.resolve('public/_redirects')
const target = path.resolve('dist/_redirects')
const aliasesFile = path.resolve('public/data/entity-slug-aliases.json')

async function ensureBaseRedirects() {
  try {
    await access(target, constants.F_OK)
    console.log('[ensure-dist-redirects] dist/_redirects already exists')
  } catch {
    await copyFile(source, target)
    console.log('[ensure-dist-redirects] copied public/_redirects -> dist/_redirects')
  }
}

async function appendEntityAliasRedirects() {
  try {
    await access(aliasesFile, constants.F_OK)
  } catch {
    console.log('[ensure-dist-redirects] alias map not found; skipping entity redirect append')
    return
  }

  const aliasRaw = await readFile(aliasesFile, 'utf8')
  const parsed = JSON.parse(aliasRaw)
  const map = {
    ...(parsed?.herbs || {}),
    ...(parsed?.compounds || {}),
  }

  const aliasRules = Object.entries(map)
    .filter(([from, to]) => from && to && from !== to)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([from, to]) => `${from} ${to} 301`)

  if (aliasRules.length === 0) {
    console.log('[ensure-dist-redirects] no alias redirects to append')
    return
  }

  const existing = await readFile(target, 'utf8')
  const existingLines = new Set(
    existing
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(Boolean)
  )

  const rulesToAppend = aliasRules.filter(rule => !existingLines.has(rule))
  if (rulesToAppend.length === 0) {
    console.log('[ensure-dist-redirects] alias redirects already present')
    return
  }

  const separator = existing.endsWith('\n') ? '' : '\n'
  const appended = `${existing}${separator}${rulesToAppend.join('\n')}\n`
  await writeFile(target, appended, 'utf8')
  console.log(`[ensure-dist-redirects] appended ${rulesToAppend.length} entity alias redirects`)
}

await ensureBaseRedirects()
await appendEntityAliasRedirects()
