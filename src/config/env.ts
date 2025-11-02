import 'dotenv/config'

export type Environment = {
  rpcEndpoint: string
  wsEndpoint?: string
  keypairPath?: string
  telegramBotToken?: string
  telegramChatId?: string
  raydiumApiUrl: string
  jupiterApiUrl: string
  orcaApiUrl: string
  rugcheckApiUrl: string
  sessionTargetPct: number
  sessionTierPct: number
  accountRiskPct: number
  stopLossPct: number
  maxConcurrentTrades: number
  strategies: string[]
}

const numberFromEnv = (value: string | undefined, fallback: number): number => {
  if (!value) return fallback
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const arrayFromEnv = (value: string | undefined): string[] => {
  if (!value) return []
  return value
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
}

export const loadEnvironment = (): Environment => ({
  rpcEndpoint: process.env.RPC_ENDPOINT ?? 'https://api.mainnet-beta.solana.com',
  wsEndpoint: process.env.WS_ENDPOINT,
  keypairPath: process.env.KEYPAIR_PATH,
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
  telegramChatId: process.env.TELEGRAM_CHAT_ID,
  raydiumApiUrl: process.env.RAYDIUM_API_URL ?? 'https://api.raydium.io/mint/ids',
  jupiterApiUrl: process.env.JUPITER_API_URL ?? 'https://quote-api.jup.ag/v6',
  orcaApiUrl: process.env.ORCA_API_URL ?? 'https://api.orca.so/v1',
  rugcheckApiUrl: process.env.RUGCHECK_API_URL ?? 'https://api.rugcheck.xyz/v1',
  sessionTargetPct: numberFromEnv(process.env.SESSION_TARGET_PCT, 5),
  sessionTierPct: numberFromEnv(process.env.SESSION_TIER_PCT, 5),
  accountRiskPct: numberFromEnv(process.env.ACCOUNT_RISK_PCT, 3),
  stopLossPct: numberFromEnv(process.env.STOPLOSS_PCT, 20),
  maxConcurrentTrades: numberFromEnv(process.env.MAX_CONCURRENT_TRADES, 5),
  strategies: arrayFromEnv(process.env.STRATEGIES),
})
