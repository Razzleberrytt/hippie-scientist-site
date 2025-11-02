export type TokenPair = {
  baseMint: string
  quoteMint: string
}

export type MarketQuote = {
  platform: 'RAYDIUM' | 'JUPITER' | 'ORCA'
  price: number
  liquidityUsd: number
  routingPath: string[]
}

export type DiscoveryContext = {
  minimumLiquidityUsd: number
  slippageBps: number
}

export type TradeSignal = {
  strategy: string
  action: 'BUY' | 'SELL'
  confidence: number
  targetPrice: number
  stopLossPrice?: number
}

export type Position = {
  tokenMint: string
  size: number
  entryPrice: number
  currentPrice: number
  lastUpdated: Date
}

export type SessionPnL = {
  realized: number
  unrealized: number
}

export type StrategyConfig = {
  name: string
  minConfidence: number
  allocationPct: number
}

export type SessionConfig = {
  maxConcurrentTrades: number
  accountRiskPct: number
  stopLossPct: number
  sessionTargetPct: number
  sessionTierPct: number
}
