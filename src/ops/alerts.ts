import { LAMPORTS_PER_SOL } from '@solana/web3.js'

import { getConfig } from '../core/config.ts'
import { createLogger } from '../core/logger.ts'
import { getRpcStats } from '../core/rpc.ts'
import { sendTradeAlert } from '../alerts/telegram.ts'
import { equityFromSol, getSolBalance } from '../solana/balance.ts'

const logger = createLogger('Alerts')

interface AlertOptions {
  minLamports?: number
}

export function startAlerts(options: AlertOptions = {}): NodeJS.Timeout | null {
  const config = getConfig()

  if (!config.telegram.enabled) {
    logger.info('Alerts disabled: Telegram credentials not configured.')
    return null
  }

  const threshold = Math.max(options.minLamports ?? 0, config.alerts.lowBalanceLamports)
  let lowBalanceAlerted = false
  let lastRpcSwitchCount = 0

  const check = async () => {
    try {
      const lamports = await getSolBalance(config.solana.walletPublicKey)
      if (lamports !== null) {
        if (lamports <= threshold && threshold > 0 && !lowBalanceAlerted) {
          const equity = equityFromSol(lamports)
          await sendTradeAlert(
            `Low SOL balance detected: ${equity.sol.toFixed(4)} SOL remaining (threshold ${
              threshold / LAMPORTS_PER_SOL
            } SOL).`
          )
          lowBalanceAlerted = true
        } else if (lamports > threshold) {
          lowBalanceAlerted = false
        }
      }

      const stats = getRpcStats()
      if (stats.switches > lastRpcSwitchCount) {
        await sendTradeAlert(
          `RPC endpoint switched to ${stats.endpoint ?? 'unknown'} (${stats.switches} total).`
        )
        lastRpcSwitchCount = stats.switches
      }
    } catch (error) {
      logger.error('Alert loop failed.', error)
    }
  }

  void check()
  return setInterval(() => {
    void check()
  }, 60_000)
}
