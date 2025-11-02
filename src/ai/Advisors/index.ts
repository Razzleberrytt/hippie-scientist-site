export type AdvisorInsight = {
  strategy: string
  sentiment: 'bullish' | 'bearish' | 'neutral'
  confidence: number
  notes?: string
}

export class AdvisorNetwork {
  // Advisory only: suggestions are never auto-executed without manual confirmation.
  async requestInsights(pair: { baseMint: string; quoteMint: string }): Promise<AdvisorInsight[]> {
    return [
      {
        strategy: 'momentum',
        sentiment: 'bullish',
        confidence: 0.5,
        notes: `Advisory insight for pair ${pair.baseMint}/${pair.quoteMint}`,
      },
    ]
  }
}
