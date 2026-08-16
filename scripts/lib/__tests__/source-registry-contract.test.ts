import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

type JsonSchema = {
  items?: {
    properties?: Record<string, { enum?: string[] }>
  }
}

type SourceClassRule = {
  evidenceClass: string
  allowedSourceTypes: string[]
  preferredStudyDesigns: string[]
}

const ROOT = process.cwd()

function readJson<T>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8')) as T
}

function enumValues(schema: JsonSchema, field: string): string[] {
  const values = schema.items?.properties?.[field]?.enum
  if (!values) throw new Error(`Missing enum for ${field}`)
  return [...values].sort()
}

describe('source registry contract alignment', () => {
  const registrySchema = readJson<JsonSchema>('schemas/source-registry.schema.json')
  const candidateSchema = readJson<JsonSchema>('schemas/source-candidate.schema.json')
  const sourceClassGovernance = readJson<Record<string, SourceClassRule>>('schemas/source-class-governance.json')

  it('keeps candidate and registry enum vocabularies aligned', () => {
    expect(enumValues(candidateSchema, 'sourceType')).toEqual(enumValues(registrySchema, 'sourceType'))
    expect(enumValues(candidateSchema, 'sourceClass')).toEqual(enumValues(registrySchema, 'sourceClass'))
    expect(enumValues(candidateSchema, 'evidenceClass')).toEqual(enumValues(registrySchema, 'evidenceClass'))
    expect(enumValues(candidateSchema, 'studyDesign')).toEqual(enumValues(registrySchema, 'studyDesign'))
    expect(enumValues(candidateSchema, 'publicationStatus')).toEqual(enumValues(registrySchema, 'publicationStatus'))
    expect(enumValues(candidateSchema, 'proposedReliabilityTier')).toEqual(enumValues(registrySchema, 'reliabilityTier'))
  })

  it('keeps source-class governance inside the persisted registry vocabulary', () => {
    const sourceClasses = new Set(enumValues(registrySchema, 'sourceClass'))
    const evidenceClasses = new Set(enumValues(registrySchema, 'evidenceClass'))
    const sourceTypes = new Set(enumValues(registrySchema, 'sourceType'))
    const studyDesigns = new Set(enumValues(registrySchema, 'studyDesign'))

    expect(Object.keys(sourceClassGovernance).sort()).toEqual([...sourceClasses].sort())

    for (const [sourceClass, rule] of Object.entries(sourceClassGovernance)) {
      expect(sourceClasses.has(sourceClass), `unknown sourceClass: ${sourceClass}`).toBe(true)
      expect(evidenceClasses.has(rule.evidenceClass), `${sourceClass} has unknown evidenceClass`).toBe(true)

      for (const sourceType of rule.allowedSourceTypes) {
        expect(sourceTypes.has(sourceType), `${sourceClass} has unknown sourceType: ${sourceType}`).toBe(true)
      }

      for (const studyDesign of rule.preferredStudyDesigns) {
        expect(studyDesigns.has(studyDesign), `${sourceClass} has unknown studyDesign: ${studyDesign}`).toBe(true)
      }
    }
  })
})
