import assert from 'node:assert/strict'
import { getRenderableCuratedProducts, resolveAffiliateUrl } from '@/lib/curatedProducts'

async function run() {
  const herbRows = getRenderableCuratedProducts({
    entityType: 'herb',
    entitySlug: 'ashwagandha',
    confidence: 'medium',
    sourceCount: 3,
  })
  assert.equal(herbRows.length > 0, true)
  assert.equal(herbRows.every(row => row.researchStatus === 'approved' && row.active), true)
  assert.equal(herbRows.every(row => Boolean(row.rationaleShort) && Boolean(row.rationaleLong)), true)
  assert.equal(herbRows.every(row => row.affiliateUrl.includes('tag=razzleberry02-20')), true)

  const noSources = getRenderableCuratedProducts({
    entityType: 'herb',
    entitySlug: 'ashwagandha',
    confidence: 'high',
    sourceCount: 0,
  })
  assert.equal(noSources.length, 0)

  const lowConfidenceCompound = getRenderableCuratedProducts({
    entityType: 'compound',
    entitySlug: 'luteolin',
    confidence: 'low',
    sourceCount: 5,
  })
  assert.equal(lowConfidenceCompound.length, 0)

  const unknownEntity = getRenderableCuratedProducts({
    entityType: 'herb',
    entitySlug: 'unknown-herb',
    confidence: 'high',
    sourceCount: 3,
  })
  assert.equal(unknownEntity.length, 0)

  assert.match(resolveAffiliateUrl(herbRows[0]), /tag=razzleberry02-20/)
}

run()
