#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const artifactDir = path.join(root, 'artifacts/research-graphics')
const artifactManifestPath = path.join(artifactDir, 'manifest.json')
const reviewPath = path.join(root, 'data/media/research-graphic-reviews.json')
const publicDir = path.join(root, 'public/media/research')
const publicManifestPath = path.join(publicDir, 'manifest.json')
const checkOnly = process.argv.includes('--check')
const MAX_FUTURE_REVIEW_SKEW_MS = 5 * 60 * 1000

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')) } catch { return fallback }
}

function normalizedReview(review) {
  return {
    graphic: String(review?.graphic || '').trim(),
    reviewer: String(review?.reviewer || '').trim(),
    reviewedAt: String(review?.reviewedAt || '').trim(),
    status: String(review?.status || '').trim().toLowerCase(),
    evidenceVerified: review?.evidenceVerified === true,
    attributionVerified: review?.attributionVerified === true,
    destinationVerified: review?.destinationVerified === true,
    visualVerified: review?.visualVerified === true,
    note: String(review?.note || '').trim(),
  }
}

function hasValidReviewTimestamp(reviewedAt) {
  const reviewedAtMs = Date.parse(reviewedAt)
  return Number.isFinite(reviewedAtMs) && reviewedAtMs <= Date.now() + MAX_FUTURE_REVIEW_SKEW_MS
}

function isApproved(review) {
  if (!review || review.status !== 'approved') return false
  if (!review.reviewer || !review.reviewedAt) return false
  if (!hasValidReviewTimestamp(review.reviewedAt)) return false
  return review.evidenceVerified && review.attributionVerified && review.destinationVerified && review.visualVerified
}

const artifactManifest = readJson(artifactManifestPath, null)
if (!artifactManifest?.graphics || !Array.isArray(artifactManifest.graphics)) {
  console.error('[media-promotion] missing artifacts/research-graphics/manifest.json — generate review artifacts first')
  process.exit(1)
}

const reviewRegistry = readJson(reviewPath, { version: 1, reviews: [] })
const reviews = new Map((reviewRegistry.reviews || []).map((entry) => {
  const review = normalizedReview(entry)
  return [review.graphic, review]
}))

const errors = []
const eligible = []
for (const graphic of artifactManifest.graphics) {
  const svg = graphic.svg ? path.basename(graphic.svg) : ''
  const png = graphic.png ? path.basename(graphic.png) : ''
  const review = reviews.get(svg) || reviews.get(png)
  if (!review) continue
  if (!isApproved(review)) {
    errors.push(`${svg || png}: review record exists but is not fully approved`)
    continue
  }
  if (!graphic.sourceUrl || !graphic.alt) {
    errors.push(`${svg || png}: generated manifest lacks sourceUrl or alt text`)
    continue
  }
  eligible.push({ graphic, review, svg, png })
}

for (const [name, review] of reviews) {
  if (!artifactManifest.graphics.some((graphic) => [graphic.svg && path.basename(graphic.svg), graphic.png && path.basename(graphic.png)].includes(name))) {
    errors.push(`${name}: approved/reviewed registry entry does not match a current generated graphic`)
  }
  if (review.status === 'approved' && !isApproved(review)) errors.push(`${name}: approved review is missing one or more verification fields`)
}

if (errors.length) {
  console.error(`[media-promotion] ${errors.length} blocking review/promotion problem(s)`)
  errors.forEach((error) => console.error(`- ${error}`))
  process.exit(1)
}

console.log(`[media-promotion] ${eligible.length} graphics eligible for public promotion`)
if (checkOnly) process.exit(0)

fs.mkdirSync(publicDir, { recursive: true })
const published = []
for (const { graphic, review, svg, png } of eligible) {
  for (const filename of [svg, png].filter(Boolean)) {
    const source = path.join(artifactDir, filename)
    if (!fs.existsSync(source)) {
      console.error(`[media-promotion] approved source missing: ${filename}`)
      process.exit(1)
    }
    fs.copyFileSync(source, path.join(publicDir, filename))
  }
  published.push({
    kind: graphic.kind,
    sourceUrl: graphic.sourceUrl,
    alt: graphic.alt,
    evidenceGrade: graphic.evidenceGrade || null,
    svg: svg ? `/media/research/${svg}` : null,
    png: png ? `/media/research/${png}` : null,
    reviewedBy: review.reviewer,
    reviewedAt: review.reviewedAt,
    reviewNote: review.note || null,
  })
}

fs.writeFileSync(publicManifestPath, `${JSON.stringify({ version: 1, generatedAt: new Date().toISOString(), graphics: published }, null, 2)}\n`)
console.log(`[media-promotion] published ${published.length} human-reviewed graphics to public/media/research`)
