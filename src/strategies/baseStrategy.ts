import type { BotConfig } from '../core/config.ts'
import type { Logger } from '../core/logger.ts'

export interface StrategyContext {
  config: BotConfig
  logger: Logger
  sendTradeAlert: (message: string) => Promise<boolean>
  sendErrorAlert: (error: unknown) => Promise<boolean>
}

export abstract class BaseStrategy {
  constructor(public readonly name: string) {}

  abstract initialize(context: StrategyContext): Promise<void>
  abstract start(context: StrategyContext): Promise<void>
  abstract stop(context: StrategyContext): Promise<void>
}
