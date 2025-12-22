import { getConfig } from '../core/config.ts'
import { createLogger } from '../core/logger.ts'
import { listOpen } from '../positions/index.ts'

const logger = createLogger('RiskControls')

let tradeTimestamps: number[] = []

function isAllowedMint(mint: string): boolean {
  const { risk } = getConfig()
  if (risk.allowMints.length > 0 && !risk.allowMints.includes(mint)) {
    return false
  }

  if (risk.denyMints.includes(mint)) {
    return false
  }

  return true
}

function pruneRateLimiter(windowMs: number): void {
  const threshold = Date.now() - windowMs
  tradeTimestamps = tradeTimestamps.filter(timestamp => timestamp >= threshold)
}

export interface RiskCheckInput {
  mint: string
  liquidityUsd: number
}

export async function assertCanOpenPosition({ mint, liquidityUsd }: RiskCheckInput): Promise<void> {
  const { risk } = getConfig()

  if (!isAllowedMint(mint)) {
    throw new Error(`Mint ${mint} is not permitted by allow/deny configuration.`)
  }

  if (liquidityUsd < risk.minLiquidityUsd) {
    throw new Error(
      `Liquidity $${liquidityUsd} below minimum threshold of $${risk.minLiquidityUsd}.`
    )
  }

  const openPositions = await listOpen()
  if (openPositions.length >= risk.maxOpenPositions) {
    throw new Error('Open position cap reached.')
  }

  pruneRateLimiter(60_000)
  if (tradeTimestamps.length >= risk.maxTradesPerMinute) {
    throw new Error('Per-minute trade limit reached.')
  }

  tradeTimestamps.push(Date.now())
  logger.debug(
    `Risk checks passed for ${mint}. ${tradeTimestamps.length}/${risk.maxTradesPerMinute} trades this minute.`
  )
}

export function resetRateLimiter(): void {
  tradeTimestamps = []
}
