import fs from 'node:fs'
import { pathToFileURL } from 'node:url'

const RELEASE_IMPACT_PATTERNS = [
  /^scripts\/(?:data|build|pipeline|ci)\//,
  /^scripts\/(?:build|orchestrate|profile-build|generate-|create-content)/,
  /^app\/(?:.*\/)?page\.[^/]+$/,
  /^app\/(?:.*\/)?route\.[^/]+$/,
  /^app\/(?:sitemap|robots|manifest|feed)(?:\.|\/)/,
  /^lib\/(?:content|data|seo|schema|routes|taxonomy)(?:[./]|$)/,
  /^public\/data\//,
  /^next\.config\./,
  /^package(?:-lock)?\.json$/,
]

export function requiresFullRelease(paths) {
  return paths.some((rawPath) => {
    const filePath = String(rawPath || '').trim()
    return filePath && RELEASE_IMPACT_PATTERNS.some((pattern) => pattern.test(filePath))
  })
}

function readChangedPaths(filePath) {
  const raw = filePath ? fs.readFileSync(filePath, 'utf8') : fs.readFileSync(0, 'utf8')
  return raw.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
}

function main() {
  const changedPaths = readChangedPaths(process.argv[2])
  const releaseRequired = requiresFullRelease(changedPaths)
  process.stdout.write(`release_required=${releaseRequired}\n`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}
