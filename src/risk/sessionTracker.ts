import { SessionConfig, SessionPnL } from '../types/trading'

export class SessionTracker {
  private tiers: number[] = []
  private realized = 0
  private unrealized = 0

  constructor(private config: SessionConfig) {
    this.tiers = [config.sessionTargetPct / 100]
  }

  recordRealized(pnlPct: number): void {
    this.realized += pnlPct
    this.extendTiersIfNeeded()
  }

  updateUnrealized(pnlPct: number): void {
    this.unrealized = pnlPct
    this.extendTiersIfNeeded()
  }

  nextTierTarget(): number {
    return this.tiers[this.tiers.length - 1]
  }

  summary(): SessionPnL {
    return {
      realized: this.realized,
      unrealized: this.unrealized,
    }
  }

  private extendTiersIfNeeded(): void {
    const current = this.realized + this.unrealized
    const lastTarget = this.nextTierTarget()
    if (current >= lastTarget) {
      const increment = this.config.sessionTierPct / 100
      const newTarget = lastTarget + increment
      this.tiers.push(newTarget)
    }
  }
}
