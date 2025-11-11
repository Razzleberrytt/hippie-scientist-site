import { randomUUID } from 'node:crypto'

import { getConfig } from '../core/config.ts'
import { createLogger } from '../core/logger.ts'
import { closePosition, listOpen } from '../positions/index.ts'
import type { PositionRecord } from '../data/db.ts'

const logger = createLogger('Liquidation')

export interface LiquidateAllParams {
  userPublicKey?: string
  baseMint?: string
}

export interface LiquidationResult {
  id: string
  status: 'success' | 'skipped' | 'failed'
  txId?: string
  reason?: string
}

async function executeJupiterSwap(position: PositionRecord): Promise<{
  txId?: string
  exitPriceUsd?: number
}> {
  const config = getConfig()
  if (config.dryRun) {
    logger.info(`Dry-run: Jupiter swap skipped for position ${position.id}.`)
    return { exitPriceUsd: position.entryPriceUsd }
  }

  logger.info(
    `Submitting Jupiter swap for ${position.amount} of ${position.baseMint} (position ${position.id}).`
  )

  // Placeholder for actual Jupiter execution logic.
  const txId = randomUUID().replace(/-/g, '')
  logger.debug(`Jupiter swap simulated with signature ${txId}`)

  return { txId, exitPriceUsd: position.entryPriceUsd }
}

export async function liquidateAll(params: LiquidateAllParams): Promise<LiquidationResult[]> {
  const positions = await listOpen()
  const filtered = positions.filter(position => {
    if (params.userPublicKey && position.userPublicKey !== params.userPublicKey) {
      return false
    }

    if (params.baseMint && position.baseMint !== params.baseMint) {
      return false
    }

    return true
  })

  if (filtered.length === 0) {
    logger.info('No open positions matched liquidation filters.')
    return []
  }

  const results: LiquidationResult[] = []

  for (const position of filtered) {
    try {
      const { txId, exitPriceUsd } = await executeJupiterSwap(position)
      if (getConfig().dryRun) {
        results.push({ id: position.id, status: 'skipped', reason: 'dry-run' })
        continue
      }

      await closePosition({ id: position.id, exitPriceUsd, txId })
      logger.info(`Position ${position.id} closed after liquidation.`)
      results.push({ id: position.id, status: 'success', txId })
    } catch (error) {
      logger.error(`Failed to liquidate position ${position.id}.`, error)
      results.push({ id: position.id, status: 'failed', reason: (error as Error).message })
    }
  }

  return results
}
