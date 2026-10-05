import assert from 'node:assert/strict'
import { test } from 'vitest'
import { validateArticleQuality } from '../article-quality-gates.mjs'

const dummyFindings = title => validateArticleQuality({
  slug: '5-mapb', title: '5-MAPB evidence', content: 'Evidence review.',
  references: [{ title, authors: 'Richter LHJ, et al.', url: 'https://pubmed.ncbi.nlm.nih.gov/28601767/' }],
}, { fileName: 'fixture.mdx' }).filter(issue => issue.startsWith('dummy reference'))

test('actual metabolism study titles may describe compounds as examples', () => {
  assert.deepEqual(dummyFindings('Pooled human liver preparations, HepaRG, or HepG2 cell lines for metabolism studies of new psychoactive substances? A study using MDMA, MDBD, butylone, MDPPP, MDPV, MDPB, 5-MAPB, and 5-API as examples'), [])
})

test('placeholder reference labels remain rejected', () => {
  for (const title of ['Example reference A', 'Example citation', 'Example', 'Placeholder reference', 'Sample reference']) {
    assert.equal(dummyFindings(title).length, 1, title)
  }
})
