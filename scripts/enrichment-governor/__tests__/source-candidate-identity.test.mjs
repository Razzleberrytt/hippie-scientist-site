import test from 'node:test'
import assert from 'node:assert/strict'
import { candidateSourceIdBase } from '../../lib/source-candidate-identity.mjs'

test('PubMed identity wins while DOI remains metadata', () => {
  assert.equal(
    candidateSourceIdBase({
      title: 'Example',
      pmid: '33809274',
      doi: '10.3390/nu13030923',
      canonicalUrl: 'https://pubmed.ncbi.nlm.nih.gov/33809274/',
      publicationYear: 2021,
    }),
    'src_pubmed-33809274',
  )
})

test('DOI is the fallback when PMID is absent', () => {
  assert.equal(
    candidateSourceIdBase({ title: 'Example', doi: '10.1000/ABC.Def', publicationYear: 2026 }),
    'src_doi-10-1000-abc-def',
  )
})

test('URL, monograph and title fallbacks remain deterministic', () => {
  assert.equal(
    candidateSourceIdBase({ title: 'Example', canonicalUrl: 'https://Example.com/path/' }),
    'src_url-example-com-path',
  )
  assert.equal(candidateSourceIdBase({ title: 'Example', monographId: 'MONO 12' }), 'src_mono-mono-12')
  assert.equal(candidateSourceIdBase({ title: 'Fallback Title', publicationYear: 2026 }), 'src_title-fallback-title-2026')
})
