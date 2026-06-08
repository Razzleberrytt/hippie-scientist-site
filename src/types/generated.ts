import type { Herb, Compound, Claim } from './content'

export interface BuildReport {
  buildReportVersion: number
  workbook: string
  counts: {
    herbs: number
    compounds: number
    claims: number
    herbCompoundMap: number
    canonicalMechanisms: number
    topics: number
    pathways: number
    supernodes: number
    [key: string]: number
  }
  generatedAt?: string
}

export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

export interface RuntimeDataset {
  herbs: Herb[]
  compounds: Compound[]
  claims: Claim[]
  [key: string]: unknown
}
