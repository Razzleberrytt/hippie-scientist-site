#!/usr/bin/env node

const origin = 'https://thehippiescientist.net'
const targets = [
  { path: '/sitemap.xml', expectImmutable: false },
  { path: '/robots.txt', expectImmutable: false },
  { path: '/favicon.svg', expectImmutable: false },
]
const errors = []
const observations = []

for (const target of targets) {
  const response = await fetch(`${origin}${target.path}`, {
    headers: { 'user-agent': 'TheHippieScientist-Cache-Monitor/1.0' },
  })
  const cacheControl = response.headers.get('cache-control') || ''
  const cfCacheStatus = response.headers.get('cf-cache-status') || ''
  const age = response.headers.get('age') || ''
  observations.push({ path: target.path, status: response.status, cacheControl, cfCacheStatus, age })
  if (!response.ok) errors.push(`${target.path} returned ${response.status}`)
  if (!/public|max-age|s-maxage/i.test(cacheControl)) errors.push(`${target.path} has no explicit public/cache lifetime policy`)
}

const home = await fetch(`${origin}/`, { headers: { 'user-agent': 'TheHippieScientist-Cache-Monitor/1.0' } })
const html = await home.text()
const assetMatches = [...html.matchAll(/(?:src|href)=["']([^"']*\/_next\/static\/[^"']+)["']/g)].map((match) => match[1])
const asset = assetMatches[0]
if (asset) {
  const assetUrl = new URL(asset, origin)
  const response = await fetch(assetUrl, { headers: { 'user-agent': 'TheHippieScientist-Cache-Monitor/1.0' } })
  const cacheControl = response.headers.get('cache-control') || ''
  const cfCacheStatus = response.headers.get('cf-cache-status') || ''
  observations.push({ path: assetUrl.pathname, status: response.status, cacheControl, cfCacheStatus, age: response.headers.get('age') || '' })
  if (!response.ok) errors.push(`${assetUrl.pathname} returned ${response.status}`)
  if (!/immutable/i.test(cacheControl) || !/max-age=31536000/i.test(cacheControl)) {
    errors.push(`${assetUrl.pathname} is not serving the expected one-year immutable cache policy`)
  }
}

console.log(JSON.stringify({ generatedAt: new Date().toISOString(), observations, errors }, null, 2))
if (errors.length) process.exitCode = 1
