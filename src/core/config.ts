import { createLogger, LogLevel, normalizeLogLevel, setLogLevel } from './logger'

export type BotMode = 'dry-run' | 'live'

export interface TelegramConfig {
  botToken?: string
  chatId?: string
  enabled: boolean
}

export interface SolanaConfig {
  rpcUrl?: string
  keypairPath?: string
  commitment: string
}

export interface LiquiditySniperConfig {
  pollIntervalMs: number
  minLiquidityUsd: number
}

export interface StrategyConfig {
  default: string
  liquiditySniper: LiquiditySniperConfig
}

export interface BotConfig {
  environment: string
  mode: BotMode
  dryRun: boolean
  logLevel: LogLevel
  solana: SolanaConfig
  telegram: TelegramConfig
  strategy: StrategyConfig
}

const logger = createLogger('Config')

let cachedConfig: BotConfig | null = null

function parseNumber(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback
  }

  const parsed = Number(value)
  if (Number.isFinite(parsed) && parsed > 0) {
    return parsed
  }

  logger.warn(`Invalid numeric value received: ${value}. Falling back to ${fallback}.`)
  return fallback
}

export function getConfig(): BotConfig {
  if (cachedConfig) {
    return cachedConfig
  }

  const environment = process.env.NODE_ENV ?? 'development'
  const logLevel = normalizeLogLevel(process.env.LOG_LEVEL)
  setLogLevel(logLevel)

  const mode: BotMode = process.env.BOT_MODE?.toLowerCase() === 'live' ? 'live' : 'dry-run'
  const dryRun = mode !== 'live'

  const solana: SolanaConfig = {
    rpcUrl: process.env.SOLANA_RPC_URL ?? process.env.RPC_URL,
    keypairPath: process.env.SOLANA_KEYPAIR_PATH ?? process.env.KEYPAIR_PATH,
    commitment: process.env.SOLANA_COMMITMENT ?? 'confirmed',
  }

  if (!solana.rpcUrl) {
    logger.warn('SOLANA_RPC_URL is not set. Network calls will fail until it is configured.')
  }

  const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN?.trim()
  const telegramChatId = process.env.TELEGRAM_CHAT_ID?.trim()

  const telegram: TelegramConfig = {
    botToken: telegramBotToken,
    chatId: telegramChatId,
    enabled: Boolean(telegramBotToken && telegramChatId),
  }

  const liquiditySniper: LiquiditySniperConfig = {
    pollIntervalMs: parseNumber(process.env.LIQUIDITY_SNIPER_POLL_INTERVAL_MS, 5000),
    minLiquidityUsd: parseNumber(process.env.LIQUIDITY_SNIPER_MIN_LIQUIDITY_USD, 10000),
  }

  const strategy: StrategyConfig = {
    default: process.env.DEFAULT_STRATEGY ?? 'liquiditySniper',
    liquiditySniper,
  }

  cachedConfig = {
    environment,
    mode,
    dryRun,
    logLevel,
    solana,
    telegram,
    strategy,
  }

  return cachedConfig
}

export function reloadConfig(): BotConfig {
  cachedConfig = null
  return getConfig()
}
