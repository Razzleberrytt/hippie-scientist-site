import { MarketQuote, StrategyConfig, TradeSignal } from '../types/trading'

export interface StrategyContext {
  portfolioValue: number
  accountBalance: number
}

export interface TradingStrategy {
  readonly name: string
  configure(config: StrategyConfig): void
  evaluate(quote: MarketQuote, context: StrategyContext): TradeSignal | null
}

export abstract class AbstractStrategy implements TradingStrategy {
  protected config: StrategyConfig = {
    name: 'abstract',
    minConfidence: 0.6,
    allocationPct: 10,
  }

  constructor(public readonly name: string) {}

  configure(config: StrategyConfig): void {
    this.config = { ...this.config, ...config }
  }

  abstract evaluate(quote: MarketQuote, context: StrategyContext): TradeSignal | null
}
