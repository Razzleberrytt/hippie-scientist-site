export interface BotanicalData {
  id?: string
  name: string
  displayName?: string
  summary: string
  effects: string[]
  confidence: string
  sourceLine?: string
  type: 'herb' | 'compound'
  slug: string
}

export interface BotanicalCardProps {
  data: BotanicalData
}
