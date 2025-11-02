import { AbstractStrategy, StrategyContext } from './baseStrategy'
import { MarketQuote, TradeSignal } from '../types/trading'

export class SniperStrategy extends AbstractStrategy {
  constructor() {
    super('sniper')
  }

  evaluate(quote: MarketQuote, context: StrategyContext): TradeSignal | null {
    const riskBudget = (context.portfolioValue * this.config.allocationPct) / 100
    if (riskBudget <= 0) {
      return null
    }

    if (quote.liquidityUsd < 50000) {
      return null
    }

    return {
      strategy: this.name,
      action: 'BUY',
      confidence: Math.min(1, quote.liquidityUsd / 1000000),
      targetPrice: quote.price * 1.015,
      stopLossPrice: quote.price * 0.8,
    }
  }
}
