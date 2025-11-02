import { DiscoveryContext, MarketQuote, TokenPair } from '../types/trading'
import { logger } from '../utils/logger'

type DiscoveryResult = MarketQuote | null

type ApiAdapter = (pair: TokenPair, context: DiscoveryContext) => Promise<DiscoveryResult>

const parseNumber = (value: unknown): number => {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) {
    throw new Error(`Invalid numeric value: ${value}`)
  }
  return parsed
}

const buildRaydiumAdapter =
  (endpoint: string): ApiAdapter =>
  async (pair, context) => {
    const url = `${endpoint}?base=${pair.baseMint}&quote=${pair.quoteMint}`
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Raydium discovery failed with ${response.status}`)
    }
    const payload = await response.json()
    if (!Array.isArray(payload) || payload.length === 0) return null
    const [first] = payload
    const price = parseNumber(first.price)
    const liquidityUsd = parseNumber(first.liquidityUsd ?? first.liquidity ?? 0)
    if (liquidityUsd < context.minimumLiquidityUsd) return null
    return {
      platform: 'RAYDIUM',
      price,
      liquidityUsd,
      routingPath: first.route ?? [],
    }
  }

const buildJupiterAdapter =
  (endpoint: string): ApiAdapter =>
  async (pair, context) => {
    const url = `${endpoint}/quote?inputMint=${pair.baseMint}&outputMint=${pair.quoteMint}&slippageBps=${context.slippageBps}`
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Jupiter discovery failed with ${response.status}`)
    }
    const payload = await response.json()
    if (!payload?.data?.length) return null
    const [first] = payload.data
    const price = parseNumber(first.outAmount) / parseNumber(first.inAmount)
    const liquidityUsd = parseNumber(first.marketInfos?.[0]?.liquidity ?? 0)
    if (liquidityUsd < context.minimumLiquidityUsd) return null
    return {
      platform: 'JUPITER',
      price,
      liquidityUsd,
      routingPath: first.marketInfos?.flatMap((info: any) => info.label ?? []) ?? [],
    }
  }

const buildOrcaAdapter =
  (endpoint: string): ApiAdapter =>
  async (pair, context) => {
    const url = `${endpoint}/quote?inputMint=${pair.baseMint}&outputMint=${pair.quoteMint}`
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Orca discovery failed with ${response.status}`)
    }
    const payload = await response.json()
    if (!payload?.data) return null
    const price = parseNumber(payload.data.price)
    const liquidityUsd = parseNumber(payload.data.liquidity ?? 0)
    if (liquidityUsd < context.minimumLiquidityUsd) return null
    return {
      platform: 'ORCA',
      price,
      liquidityUsd,
      routingPath: payload.data.route ?? [],
    }
  }

export class MultiApiDiscovery {
  private adapters: ApiAdapter[]

  constructor(raydiumEndpoint: string, jupiterEndpoint: string, orcaEndpoint: string) {
    this.adapters = [
      buildRaydiumAdapter(raydiumEndpoint),
      buildJupiterAdapter(jupiterEndpoint),
      buildOrcaAdapter(orcaEndpoint),
    ]
  }

  async discover(pair: TokenPair, context: DiscoveryContext): Promise<MarketQuote | null> {
    for (const adapter of this.adapters) {
      try {
        const quote = await adapter(pair, context)
        if (quote) {
          await logger.info(
            `Discovery success via ${quote.platform}: price=${quote.price.toFixed(6)}, liquidity=$${quote.liquidityUsd.toFixed(2)}`
          )
          return quote
        }
      } catch (error) {
        await logger.warn((error as Error).message)
      }
    }
    await logger.warn('No liquidity discovered across Raydium/Jupiter/Orca')
    return null
  }
}
