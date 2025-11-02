import { AbstractStrategy, StrategyContext } from './baseStrategy'
import { MarketQuote, TradeSignal } from '../types/trading'

export class MomentumStrategy extends AbstractStrategy {
  private lastPrice: number | null = null

  constructor() {
    super('momentum')
  }

  evaluate(quote: MarketQuote, _context: StrategyContext): TradeSignal | null {
    if (this.lastPrice === null) {
      this.lastPrice = quote.price
      return null
    }

    const change = (quote.price - this.lastPrice) / this.lastPrice
    this.lastPrice = quote.price

    if (change >= 0.01) {
      return {
        strategy: this.name,
        action: 'BUY',
        confidence: Math.min(1, change * 10),
        targetPrice: quote.price * 1.01,
        stopLossPrice: quote.price * 0.8,
      }
    }

    if (change <= -0.02) {
      return {
        strategy: this.name,
        action: 'SELL',
        confidence: Math.min(1, Math.abs(change) * 10),
        targetPrice: quote.price * 0.99,
        stopLossPrice: quote.price * 1.1,
      }
    }

    return null
  }
}
