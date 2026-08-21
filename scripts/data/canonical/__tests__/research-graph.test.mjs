import { describe, expect, it } from 'vitest'
import { entityId } from '../ids.mjs'
import { buildResearchRelationshipGraph } from '../../research-graph-lib.mjs'

describe('research relationship graph', () => {
  it('derives study, pathway, outcome, botanical-compound and comparison relationships conservatively', () => {
    const herbA = entityId('herb', 'herb-a')
    const herbB = entityId('herb', 'herb-b')
    const compound = entityId('compound', 'compound-x')
    const pathway = entityId('mechanism', 'pathway-x')
    const outcome = entityId('effect', 'sleep')
    const study = entityId('study', 'study-1')

    const graph = buildResearchRelationshipGraph({
      herbs: [
        { slug: 'herb-a', name: 'Herb A', evidence_grade: 'A' },
        { slug: 'herb-b', name: 'Herb B', evidence_grade: 'C' },
      ],
      compounds: [{ slug: 'compound-x', name: 'Compound X', evidence_grade: 'B' }],
      herbCompoundMap: [
        { herb_slug: 'herb-a', compound_slug: 'compound-x', herb: 'Herb A', compound: 'Compound X' },
        { herb_slug: 'herb-b', compound_slug: 'compound-x', herb: 'Herb B', compound: 'Compound X' },
      ],
      claims: [
        {
          id: 'clm_mechanism',
          subject_id: herbA,
          predicate: 'affects_mechanism',
          object_id: pathway,
          qualifiers: { study_id: study },
          source_ids: ['src_1'],
          evidence_level: 'human_rct',
        },
        {
          id: 'clm_outcome',
          subject_id: herbA,
          predicate: 'supports_outcome',
          object_id: outcome,
          qualifiers: { study_id: study, direction: '+' },
          source_ids: ['src_1'],
          evidence_level: 'human_rct',
        },
      ],
    })

    const relationships = new Set(graph.edges.map((edge) => edge.rel))
    expect(relationships).toContain('contains_compound')
    expect(relationships).toContain('affects_pathway')
    expect(relationships).toContain('studied_for_outcome')
    expect(relationships).toContain('study_investigates_ingredient')
    expect(relationships).toContain('study_reports_outcome')
    expect(relationships).toContain('pathway_associated_outcome')

    const pathwayOutcome = graph.edges.find((edge) => edge.rel === 'pathway_associated_outcome')
    expect(pathwayOutcome?.from).toBe(pathway)
    expect(pathwayOutcome?.to).toBe(outcome)
    expect(pathwayOutcome?.caveat).toMatch(/not a causal/i)

    expect(graph.indexes.compoundsByBotanical[herbA]).toContain(compound)
    expect(graph.indexes.botanicalsByCompound[compound]).toEqual(expect.arrayContaining([herbA, herbB]))

    const sharedCompoundComparison = graph.comparisonOpportunities.find((row) =>
      row.pair.some((item) => item.slug === 'herb-a') && row.pair.some((item) => item.slug === 'herb-b')
    )
    expect(sharedCompoundComparison?.types).toContain('shared_active_compounds')
  })

  it('does not invent pathway-to-outcome causality across unrelated studies', () => {
    const subject = entityId('compound', 'compound-y')
    const pathway = entityId('mechanism', 'pathway-y')
    const outcome = entityId('effect', 'focus')

    const graph = buildResearchRelationshipGraph({
      compounds: [{ slug: 'compound-y', name: 'Compound Y' }],
      claims: [
        { id: 'clm_a', subject_id: subject, predicate: 'affects_mechanism', object_id: pathway, qualifiers: { study_id: entityId('study', 'a') } },
        { id: 'clm_b', subject_id: subject, predicate: 'supports_outcome', object_id: outcome, qualifiers: { study_id: entityId('study', 'b') } },
      ],
    })

    expect(graph.edges.some((edge) => edge.rel === 'pathway_associated_outcome')).toBe(false)
  })
})
