import { SessionConfig, Position } from '../types/trading'

export class RiskManager {
  private positions: Map<string, Position> = new Map()

  constructor(private config: SessionConfig) {}

  get openPositions(): Position[] {
    return Array.from(this.positions.values())
  }

  canEnter(): boolean {
    return this.positions.size < this.config.maxConcurrentTrades
  }

  registerFill(tokenMint: string, fillPrice: number, size: number): Position {
    const existing = this.positions.get(tokenMint)
    if (existing) {
      const totalSize = existing.size + size
      const weightedPrice = (existing.entryPrice * existing.size + fillPrice * size) / totalSize
      const updated: Position = {
        ...existing,
        size: totalSize,
        entryPrice: weightedPrice,
        currentPrice: fillPrice,
        lastUpdated: new Date(),
      }
      this.positions.set(tokenMint, updated)
      return updated
    }

    const position: Position = {
      tokenMint,
      size,
      entryPrice: fillPrice,
      currentPrice: fillPrice,
      lastUpdated: new Date(),
    }
    this.positions.set(tokenMint, position)
    return position
  }

  updatePrice(tokenMint: string, price: number): void {
    const position = this.positions.get(tokenMint)
    if (!position) return
    this.positions.set(tokenMint, {
      ...position,
      currentPrice: price,
      lastUpdated: new Date(),
    })
  }

  closePosition(tokenMint: string): Position | undefined {
    const position = this.positions.get(tokenMint)
    if (!position) return undefined
    this.positions.delete(tokenMint)
    return position
  }

  calculateStopLoss(entryPrice: number): number {
    const stopLossPct = this.config.stopLossPct / 100
    return entryPrice * (1 - stopLossPct)
  }

  allocationPerTrade(accountBalance: number): number {
    return (accountBalance * this.config.accountRiskPct) / 100
  }
}
