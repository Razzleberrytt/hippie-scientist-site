#!/usr/bin/env ts-node
import { loadEnvironment } from './config/env'
import { TradingSession } from './session/runSession'
import { StrategyConfig } from './types/trading'
import { logger } from './utils/logger'

const printHelp = () => {
  process.stdout.write(
    `SnipeBT trading session runner\n\nUsage:\n  ts-node src/main.ts [options]\n\nOptions:\n  --help                 Show this help message\n  --base <mint>          Base token mint address (default: SOL)\n  --quote <mint>         Quote token mint address (default: USDC)\n  --balance <number>     Account balance used for sizing (default: 1000)\n  --strategies <list>    Comma-separated list of strategies to enable\n  --config <json>        Inline JSON array overriding strategy configs\n`
  )
}

const parseArgs = (
  args: string[]
): {
  help: boolean
  base: string
  quote: string
  balance: number
  strategies?: string[]
  strategyConfigs: StrategyConfig[]
} => {
  const options = {
    help: false,
    base: 'So11111111111111111111111111111111111111112',
    quote: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    balance: 1000,
    strategies: undefined as string[] | undefined,
    strategyConfigs: [] as StrategyConfig[],
  }

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]
    switch (arg) {
      case '--help':
        options.help = true
        break
      case '--base':
        options.base = args[++index] ?? options.base
        break
      case '--quote':
        options.quote = args[++index] ?? options.quote
        break
      case '--balance': {
        const value = Number(args[++index])
        if (Number.isFinite(value)) {
          options.balance = value
        }
        break
      }
      case '--strategies': {
        const value = args[++index]
        if (value) {
          options.strategies = value
            .split(',')
            .map(name => name.trim())
            .filter(Boolean)
        }
        break
      }
      case '--config': {
        const value = args[++index]
        if (value) {
          try {
            const parsed = JSON.parse(value)
            if (Array.isArray(parsed)) {
              options.strategyConfigs = parsed as StrategyConfig[]
            }
          } catch (error) {
            process.stderr.write(
              `Failed to parse strategy config JSON: ${(error as Error).message}\n`
            )
          }
        }
        break
      }
      default:
        break
    }
  }

  return options
}

const main = async () => {
  const args = parseArgs(process.argv.slice(2))
  if (args.help) {
    printHelp()
    return
  }

  const env = loadEnvironment()
  const session = new TradingSession({
    envConfig: {
      telegramBotToken: env.telegramBotToken,
      telegramChatId: env.telegramChatId,
      raydiumApiUrl: env.raydiumApiUrl,
      jupiterApiUrl: env.jupiterApiUrl,
      orcaApiUrl: env.orcaApiUrl,
      rugcheckApiUrl: env.rugcheckApiUrl,
      sessionTargetPct: env.sessionTargetPct,
      sessionTierPct: env.sessionTierPct,
      accountRiskPct: env.accountRiskPct,
      stopLossPct: env.stopLossPct,
      maxConcurrentTrades: env.maxConcurrentTrades,
      strategies: args.strategies ?? env.strategies,
    },
    tokenPair: {
      baseMint: args.base,
      quoteMint: args.quote,
    },
    accountBalance: args.balance,
    strategyConfigs: args.strategyConfigs,
  })

  await session.run()
}

main().catch(async error => {
  await logger.error(`Fatal error: ${(error as Error).message}`)
  process.exit(1)
})
