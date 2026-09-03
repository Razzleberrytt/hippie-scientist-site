import { describe, expect, it } from 'vitest'

import { resolveAiEntityArtifactRoute } from '../ai-entity-artifact-route'

describe('AI entity artifact canonical routing', () => {
  it.each([
    ['kava', 'piper-methysticum'],
    ['passionflower', 'passiflora-incarnata'],
    ['ashwagandha-withania-somnifera', 'ashwagandha'],
  ])('routes herb page %s to its existing artifact %s', (pageSlug, artifactSlug) => {
    expect(resolveAiEntityArtifactRoute('herb', pageSlug)).toEqual({
      kind: 'herb',
      slug: artifactSlug,
    })
  })

  it.each([
    ['elderberry', 'elderberry'],
    ['garlic', 'allium-sativum'],
    ['ginger', 'ginger'],
    ['lions-mane', 'hericium-erinaceus'],
    ['maca', 'maca'],
    ['reishi', 'ganoderma-lucidum'],
    ['valerian', 'valeriana-officinalis'],
  ])('routes cross-taxonomy compound page %s to herb artifact %s', (pageSlug, artifactSlug) => {
    expect(resolveAiEntityArtifactRoute('compound', pageSlug)).toEqual({
      kind: 'herb',
      slug: artifactSlug,
    })
  })

  it('leaves ordinary canonical profiles unchanged', () => {
    expect(resolveAiEntityArtifactRoute('compound', 'magnesium')).toEqual({
      kind: 'compound',
      slug: 'magnesium',
    })
    expect(resolveAiEntityArtifactRoute('herb', 'rhodiola')).toEqual({
      kind: 'herb',
      slug: 'rhodiola',
    })
  })
})
