export type COAVerificationConfidence = 'high' | 'medium' | 'low'

export type COATestCategory = 'potency' | 'heavy_metals' | 'microbes'

export type COATestStatus = 'pass' | 'fail' | 'insufficient_data'

export type COAAvailabilityState = 'verified' | 'no_coa' | 'insufficient_data' | 'unverified_lab'

export interface COATestResult {
  category: COATestCategory
  analyte: string
  measuredValue?: string
  limit?: string
  status: COATestStatus
}

export interface COADocument {
  id: string
  labName?: string
  isIso17025Accredited?: boolean
  testDate?: string
  batchLot?: string
  pdfUrl?: string
  confidence: COAVerificationConfidence
  confidenceRationale: string
  availability: COAAvailabilityState
  testResults: COATestResult[]
}
