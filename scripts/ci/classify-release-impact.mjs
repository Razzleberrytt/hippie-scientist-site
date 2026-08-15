#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

export const RELEASE_SENSITIVE_PATTERNS = [
  /^scripts\/(?:data|build|pipeline|ci)\//,
  /^scripts\/(?:build|orchestrate|profile-build|generate-|create-content)/,
  /^app\/(?:.+\/)?(?:page|layout|template|default|error|global-error|not-found|loading)\.[^/]+$/,
  /^app\/(?:.+\/)?route\.[^/]+$/,
  /^app\/(?:.+\/)?(?:sitemap|robots|manifest|feed|favicon|icon\d*|apple-icon\d*|opengraph-image|twitter-image)\.[^/]+$/,
  /^app\/(?:.+\/)?generateStaticParams(?:\.[^/]+)?$/,
  /^(?:src\/)?lib\/(?:[^/]*-)?(?:content|data|seo|schema|routes?|taxonomy)(?:[-./]|$)/,
  /^public\/data\//,
  /^public\/(?:_redirects|_headers)$/,
  /^next\.config\./,
  /^package(?:-lock)?\.json$/,
]

export function isReleaseSensitivePath(file) {
  const normalized = String(file || '').trim().replaceAll('\\', '/')
  return Boolean(normalized) && RELEASE_SENSITIVE_PATTERNS.some((pattern) => pattern.test(normalized))
}

export function classifyReleaseImpact(files) {
  const normalizedFiles = Array.from(new Set(
    files.map((file) => String(file || '').trim().replaceAll('\\', '/')).filter(Boolean),
  ))
  const sensitiveFiles = normalizedFiles.filter(isReleaseSensitivePath)
  return {
    releaseSensitive: sensitiveFiles.length > 0,
    sensitiveFiles,
    files: normalizedFiles,
  }
}

function main() {
  const args = process.argv.slice(2)
  const outputArg = args.find((arg) => arg.startsWith('--github-output='))
  const fileArgs = args.filter((arg) => !arg.startsWith('--github-output='))
  const input = fileArgs.length ? fileArgs : fs.readFileSync(0, 'utf8').split(/\r?\n/)
  const result = classifyReleaseImpact(input)

  for (const file of result.sensitiveFiles) console.log(`[release-impact] sensitive: ${file}`)
  console.log(`[release-impact] release_sensitive=${result.releaseSensitive}`)

  if (outputArg) {
    const outputPath = outputArg.slice('--github-output='.length)
    if (!outputPath) throw new Error('--github-output requires a file path')
    fs.appendFileSync(outputPath, `release_sensitive=${result.releaseSensitive}\n`)
  }
}

const entry = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : ''
if (entry && import.meta.url === entry) main()
