#!/usr/bin/env node

import fs from 'node:fs'
import fsPromises from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const outDir = path.join(root, 'out')
const FULL_HTML_AUDIT = process.env.FULL_HTML_AUDIT === '1' || process.env.CI === 'true'
const staticAssetExt = /\.(?:css|js|json|png|jpe?g|gif|webp|avif|svg|ico|txt|xml|map|woff2?)$i

let files = []

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '_next') continue
    const filePath = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(filePath)
    else if (entry.isFile() && entry.name.endsWith('.html')) files.push(filePath)
  }
}

if (!fs.existsSync(outDir)) {
  console.log('[audit-internal-links] SKIP: Build output not found at out/. Run npm run build first.')
  process.exit(0)
}

walk(outDir)

const routeFromFile = (filePath) =>
  '/' + path.relative(outDir, filePath)
    .replace(/index\.html$/, '')
    .replace(/\.html$/, '')
    .replace(/\\/g, '/')
    .replace(/\/+/g, '/')
    .replace(/\/$/, '') || '/'

function readRedirectSourcePatterns() {
  const candidates = [
    path.join(outDir, '_redirects'),
    path.join(root, 'public', '_redirects'),
  ]
  const redirectsPath = candidates.find((candidate) => fs.existsSync(candidate))
  if (!redirectsPath) return { redirectsPath: null, sources: [] }

  const sources = fs.readFileSync(redirectsPath, 'utf8')
    .split(/\r/\n?/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => line.split(/\s+/))
    .filter((parts) => parts.length >= 3 && /^30[1278]$/.test(parts[2]))
    .map(([source]) => source)
    .filter((source) => source?.startsWith('/'))

  return { redirectsPath, sources }
}

const redirectSourceTable = readRedirectSourcePatterns()
const redirectSourcePatterns = redirectSourceTable.sources

if (redirectSourceTable.redirectsPath) {
  console.log(
    `[audit-internal-links] Using redirect sources from ${path.relative(root, redirectSourceTable.redirectsPath)} (${redirectSourcePatterns.length} rules).`,
  )
}

const normalizeRoute = (route) => {
  if (!route) return '/'
  const withoutQuery = route.split(/[?#]/)[0]
  if (withoutQuery === '/') return '/'
  return withoutQuery.replace(/\/+$/, '') || '/'
}

const isRedirectSourceRoute = (route) => redirectSourcePatterns.some((source) => {
  const normalizedRoute = normalizeRoute(route)
  if (source.endsWith('/*')) return normalizedRoute.startsWith(normalizeRoute(source.slice(0, -1)))
  if (source.includes(':splat')) {
    return normalizedRoute.startsWith(normalizeRoute(source.split(':splat')[0]))
  }
  return normalizedRoute === normalizeRoute(source)
})

files = files.filter((filePath) => !isRedirectSourceRoute(routeFromFile(filePath)))

if (!FULL_HTML_AUDIT) {
  const criticalSubpaths = [
    '/index.html',
    '/faq/index.html',
    '/herbs/index.html',
    '/compounds/index.html',
    '/articles/index.html',
    '/guides/index.html',
    '/herbs/ashwagandha/index.html',
    '/compounds/l-theanine/index.html',
    '/articles/best-supplements-for-adhd/index.html',
    '/articles/adhd-stack-guide/index.html',
    '/articles/2c-b-effects/index.html',
  ]
  files = files.filter((filePath) => {
    const relative = '/' + path.relative(outDir, filePath).replace(/\\/g, '/')
    return criticalSubpaths.includes(relative)
  })
  console.log(
    `[audit-internal-links] Running in targeted mode. Scanning ${files.length} critical pages (use FULL_HTML_AUDIT=1 to audit all files).`,
  )
}

const routes = new Set(files.map(routeFromFile))
const graph = new Map([...routes].map((route) => [route, new Set()]))
const inboundGraph = new Map([...routes].map((route) => [route, new Set()]))
const hrefRe = /href=["'](\/[^"'#\s~]*)["']/g
const robotsNoindexRe = /<meta\b(?=[^>]*\bname=["']robots["'])(?=[^>]*\bcontent=["'][^"']*\bnoindex\b)[^>]*>/i

function nonCanonicalInternalHref(href) {
  if (!href || href === '/' || href.includes('?') || href.includes('#')) return null
  if (staticAssetExt.test(href)) return null
  if (href.endsWith('/')) return null
  if (href.split('/').pop()?.includes('.')) return null
  return { href, canonicalHref: `${href}/` }
}

function topCounts(rows, key, limit = 25) {
  const counts = new Map()
  for (const row of rows) {
    const value = String(row[key] || '').trim()
    if (!value) continue
    counts.set(value, (counts.get(value) || 0) + 1)
  }
  return [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value))
    .slice(0, limit)
}

function summarizeNonCanonicalLinks(rows) {
  return {
    total: rows.length,
    topHrefs: topCounts(rows, 'href'),
    topCanonicalHrefs: topCounts(rows, 'canonicalHref'),
    topSourceRoutes: topCounts(rows, 'source'),
  }
}

async function run() {
  const batchSize = 100
  const noindexRoutes = new Set()
  const nonCanonicalInternalLinks = []

  console.log(`[internal-links] Starting audit of ${files.length} HTML files in batches of ${batchSize}...`)

  for (let i = 0; i < files.length; i += batchSize) {
    console.log(
      o`[internal-links] Processing batch ${i / batchSize + 1}/${Math.ceil(files.length / batchSize)} (files ${i•ôÑ¼€‘í5…Ñ ¹µ¥¸¡¤€¬‰…Ñ¡M¥é”°™¥±•Ì¹±•¹Ñ ¥ô¤¸¸¹€°(€€€€¤(€€€½¹ÍÐ‰…Ñ €ô™¥±•Ì¹Í±¥”¡¤°¤€¬‰…Ñ¡M¥é”¤((€€€…Ý…¥ÐAÉ½µ¥Í”¹…±°¡‰…Ñ ¹µ…À¡…Íå¹Œ€¡™¥±•A…Ñ °¥¹‘•à¤€ôøì(€€€€€½¹ÍÐÉ½ÕÑ”€ôÉ½ÕÑ•É½µ¥±”¡™¥±•A…Ñ ¤(€€€€€½¹ÍÐ™¥±•%¹‘•à€ô¤€¬¥¹‘•à(€€€€€½¹Í½±”¹±½œ¡m¥¹Ñ•É¹…°µ±¥¹­ÍtM…¹¹¥¹œ€‘í™¥±•%¹‘•áôè€‘íÉ½ÕÑ•õ€¤(€€€€€½¹ÍÐ¡Ñµ°€ô…Ý…¥Ð™ÍAÉ½µ¥Í•Ì¹É•…‘¥±”¡™¥±•A…Ñ °€ÕÑ˜àœ¤(€€€€€¥˜€¡É½‰½ÑÍ9½¥¹‘•áI”¹Ñ•ÍÐ¡¡Ñµ°¤¤¹½¥¹‘•áI½ÕÑ•Ì¹…‘¡É½ÕÑ”¤((€€€€€½¹ÍÐÍÑ…ÉÐ€ô…Ñ”¹¹½Ü ¤(€€€€€™½È€¡½¹ÍÐµ…Ñ ½˜¡Ñµ°¹µ…Ñ¡±°¡¡É•™I”¤¤ì(€€€€€€€½¹ÍÐ¡É•˜€ôµ…Ñ¡lÅt(€€€€€€€¥˜€ …¡É•˜¹ÍÑ…ÉÑÍ]¥Ñ  œ¼œ¤¤½¹Ñ¥¹Õ”((€€€€€€€½¹ÍÐ¹½¹…¹½¹¥…°€ô¹½¹…¹½¹¥…±%¹Ñ•É¹…±!É•˜¡¡É•˜¤(€€€€€€€¥˜€¡¹½¹…¹½¹¥…°¤¹½¹…¹½¹¥…±%¹Ñ•É¹…±1¥¹­Ì¹ÁÕÍ ¡ìÍ½ÕÉ”èÉ½ÕÑ”°€¸¸¹¹½¹…¹½¹¥…°ô¤((€€€€€€€½¹ÍÐÑ…É•Ð€ô¹½Éµ…±¥é•I½ÕÑ”¡¡É•˜¤(€€€€€€€¥˜€¡É…Á ¹¡…Ì¡Ñ…É•Ð¤¤ì(€€€€€€€€€É…Á ¹•Ð¡É½ÕÑ”¤¹…‘¡Ñ…É•Ð¤(€€€€€€€€€¥˜€¡Ñ…É•Ð€„ôôÉ½ÕÑ”¤¥¹‰½Õ¹‘É…Á ¹•Ð¡Ñ…É•Ð¤¹…‘¡É½ÕÑ”¤(€€€€€€€ô(€€€€€ô((€€€€€½¹ÍÐ‘ÕÉ…Ñ¥½¸€ô…Ñ”¹¹½Ü ¤€´ÍÑ…ÉÐ(€€€€€¥˜€¡‘ÕÉ…Ñ¥½¸€ø€ÄÀÀ¤ì(€€€€€€€½¹Í½±”¹±½œ¡m¥¹Ñ•É¹…°µ±¥¹­Ít]…É¹¥¹œè¥±”€‘í™¥±•%¹‘•áô€‘íÉ½ÕÑ•ôÑ½½¬€‘í‘ÕÉ…Ñ¥½¹õµÌÑ¼Í…¸É••á€¤(€€€€€ô(€€€ô¤¤(€ô((€½¹ÍÐ½ÉÁ¡…¹I½ÕÑ•Ì€ôl¸¸¹¥¹‰½Õ¹‘É…Á ¹•¹ÑÉ¥•Ì ¥t(€€€€¹™¥±Ñ•È ¡l°¥¹½µ¥¹t¤€ôø¥¹½µ¥¹œ¹Í¥é”€ôôô€À¤(€€€€¹µ…À ¡mÉ½ÕÑ•t¤€ôøÉ½ÕÑ”¤(€½¹ÍÐÝ•…­±å½¹¹•Ñ•€ôl¸¸¹¥¹‰½Õ¹‘É…Á ¹•¹ÑÉ¥•Ì ¥t(€€€€¹™¥±Ñ•È ¡l°¥¹½µ¥¹t¤€ôø¥¹½µ¥¹œ¹Í¥é”€ø€À€˜˜¥¹½µ¥¹œ¹Í¥é”€ð€Ì¤(€€€€¹µ…À ¡mÉ½ÕÑ”°¥¹½µ¥¹t¤€ôø€¡ìÉ½ÕÑ”°¥¹‰½Õ¹è¥¹½µ¥¹œ¹Í¥é”ô¤¤(€½¹ÍÐ¥¹Ñ•É¹…±1¥¹­•¹Í¥Ñä€ôl¸¸¹É…Á ¹•¹ÑÉ¥•Ì ¥t(€€€€¹µ…À ¡mÉ½ÕÑ”°½ÕÑ‰½Õ¹‘t¤€ôø€¡ìÉ½ÕÑ”°½ÕÑ‰½Õ¹è½ÕÑ‰½Õ¹¹Í¥é”ô¤¤(€€€€¹Í½ÉÐ ¡„°ˆ¤€ôøˆ¹½ÕÑ‰½Õ¹€´„¹½ÕÑ‰½Õ¹¤(€½¹ÍÐ¹½¹…¹½¹¥…±MÕµµ…Éä€ôÍÕµµ…É¥é•9½¹…¹½¹¥…±1¥¹­Ì¡¹½¹…¹½¹¥…±%¹Ñ•É¹…±1¥¹­Ì¤((€½¹ÍÐÉ•Á½ÉÐ€ôì(€€€•¹•É…Ñ•‘Ðè¹•Ü…Ñ” ¤¹Ñ½%M=MÑÉ¥¹œ ¤°(€€€É•‘¥É•ÑM½ÕÉ”èÉ•‘¥É•ÑM½ÕÉ•Q…‰±”¹É•‘¥É•ÑÍA…Ñ (€€€€€€üÁ…Ñ ¹É•±…Ñ¥Ù”¡É½½Ð°É•‘¥É•ÑM½ÕÉ•Q…‰±”¹É•‘¥É•ÑÍA…Ñ ¤¹É•Á±…” ½qp½œ°€œ¼œ¤(€€€€€€è¹Õ±°°(€€€É•‘¥É•ÑIÕ±•Í¡•­•èÉ•‘¥É•ÑM½ÕÉ•A…ÑÑ•É¹Ì¹±•¹Ñ °(€€€Ñ½Ñ…±I½ÕÑ•ÌèÉ½ÕÑ•Ì¹Í¥é”°(€€€½ÉÁ¡…¹I½ÕÑ•Ì°(€€€Ý•…­±å½¹¹•Ñ•°(€€€¥¹Ñ•É¹…±1¥¹­•¹Í¥Ñäè¥¹Ñ•É¹…±1¥¹­•¹Í¥Ñä¹Í±¥” À°€ÄÀÀ¤°(€€€¹½¹…¹½¹¥…±%¹Ñ•É¹…±1¥¹­Ì°(€€€¹½¹…¹½¹¥…±MÕµµ…Éä°(€ô((€™Ì¹µ­‘¥ÉMå¹Œ¡Á…Ñ ¹©½¥¸¡É½½Ð°€½ÁÌœ°€É•Á½ÉÑÌœ¤°ìÉ•ÕÉÍ¥Ù”èÑÉÕ”ô¤(€™Ì¹ÝÉ¥Ñ•¥±•Må¹Œ (€€€Á…Ñ ¹©½¥¸¡É½½Ð°€½ÁÌœ°€É•Á½ÉÑÌœ°€¥¹Ñ•É¹…°µ±¥¹¬µÉ•Á½ÉÐ¹©Í½¸œ¤°(€€€)M=8¹ÍÑÉ¥¹¥™ä¡É•Á½ÉÐ°¹Õ±°°€È¤°(€€¤((€½¹ÍÐ¹½¹%¹‘•á…‰±”€ô½ÉÁ¡…¹I½ÕÑ•Ì¹™¥±Ñ•È ¡É½ÕÑ”¤€ôø(€€€É½ÕÑ”€ôôô€œ¼ÐÀÐœñð(€€€É½ÕÑ”€ôôô€œ¼ÔÀÀœñð(€€€É½ÕÑ”¹ÍÑ…ÉÑÍ]¥Ñ  œ½}¹½Ðµ™½Õ¹œ¤ñð(€€€É½ÕÑ”¹ÍÑ…ÉÑÍ]¥Ñ  œ½Í¥Ñ•µ…À¹áµ°œ¤ñð(€€€É½ÕÑ”¹ÍÑ…ÉÑÍ]¥Ñ  œ½É½‰½ÑÌ¹ÑáÐœ¤ñð(€€€É½ÕÑ”¹ÍÑ…ÉÑÍ]¥Ñ  œ½½Á•¹É…Á µ¥µ…”œ¤ñð(€€€É½ÕÑ”¹ÍÑ…ÉÑÍ]¥Ñ  œ½ÑÝ¥ÑÑ•Èµ¥µ…”œ¤ñð(€€€É½ÕÑ”¹ÍÑ…ÉÑÍ]¥Ñ  œ½‰±½‘…Ñ„œ¤ñð(€€€¹½¥¹‘•áI½ÕÑ•Ì¹¡…Ì¡É½ÕÑ”¤°(€€¤(€½¹ÍÐ‰±½­¥¹=ÉÁ¡…¹Ì€ô½ÉÁ¡…¹I½ÕÑ•Ì¹™¥±Ñ•È ¡É½ÕÑ”¤€ôø€…¹½¹%¹‘•á…‰±”¹¥¹±Õ‘•Ì¡É½ÕÑ”¤¤(€½¹ÍÐÑ½Á9½¹…¹½¹¥…±M½ÕÉ”€ô¹½¹…¹½¹¥…±MÕµµ…Éä¹Ñ½ÁM½ÕÉ•I½ÕÑ•ÍlÁt((€½¹Í½±”¹±½œ (€€€¥¹Ñ•É¹…°µ±¥¹­ÌèÉ½ÕÑ•Ìô‘íÉ½ÕÑ•Ì¹Í¥é•ô°½ÉÁ¡…¸ô‘í½ÉÁ¡…¹I½ÕÑ•Ì¹±•¹Ñ¡ô°‰±½­¥¹=ÉÁ¡…¸ô‘í‰±½­¥¹=ÉÁ¡…¹Ì¹±•¹Ñ¡ô°Ý•…¬ô‘íÝ•…­±å½¹¹•Ñ•¹±•¹Ñ¡ô°¹½¹…¹½¹¥…°ô‘í¹½¹…¹½¹¥…±%¹Ñ•É¹…±1¥¹­Ì¹±•¹Ñ¡õ€°(€€¤(€¥˜€¡Ñ½Á9½¹…¹½¹¥…±M½ÕÉ”¤ì(€€€½¹Í½±”¹±½œ¡m¥¹Ñ•É¹…°µ±¥¹­ÍtÑ½À¹½¸µ…¹½¹¥…°Í½ÕÉ”è€‘íÑ½Á9½¹…¹½¹¥…±M½ÕÉ”¹Ù…±Õ•ô€ ‘íÑ½Á9½¹…¹½¹¥…±M½ÕÉ”¹½Õ¹Ñô¥€¤(€ô(€¥˜€¡¹½¹…¹½¹¥…±%¹Ñ•É¹…±1¥¹­Ì¹±•¹Ñ ¤ì(€€€½¹Í½±”¹•ÉÉ½È¡m¥¹Ñ•É¹…°µ±¥¹­Ít™½Õ¹€‘í¹½¹…¹½¹¥…±%¹Ñ•É¹…±1¥¹­Ì¹±•¹Ñ¡ô¹½¸µ…¹½¹¥…°¥¹Ñ•É¹…°¡É•™Í€¤(€€€¥˜€¡ÁÉ½•ÍÌ¹•¹Ø¹$€ôôô€ÑÉÕ”œ¤ÁÉ½•ÍÌ¹•á¥Ñ½‘”€ô€Ä(€ô(€¥˜€¡‰±½­¥¹=ÉÁ¡…¹Ì¹±•¹Ñ ¤ì(€€€½¹Í½±”¹•ÉÉ½È¡m¥¹Ñ•É¹…°µ±¥¹­Ít™½Õ¹€‘í‰±½­¥¹=ÉÁ¡…¹Ì¹±•¹Ñ¡ô½ÉÁ¡…¹•É…Ý±…‰±”É½ÕÑ•Í€¤(€€€¥˜€¡ÁÉ½•ÍÌ¹•¹Ø¹$€ôôô€ÑÉÕ”œ¤ÁÉ½•ÍÌ¹•á¥Ñ½‘”€ô€Ä(€ô)ô()ÉÕ¸ ¤¹…Ñ  ¡•ÉÉ½È¤€ôøì(€½¹Í½±”¹•ÉÉ½È¡•ÉÉ½È¤(€ÁÉ½•ÍÌ¹•á¥Ð Ä¤)ô¤(