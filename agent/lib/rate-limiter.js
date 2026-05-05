export class TokenBucketRateLimiter {
  constructor({ capacity = 3, refillPerSecond = 1 } = {}) {
    this.capacity = capacity
    this.tokens = capacity
    this.refillPerSecond = refillPerSecond
    this.lastRefill = Date.now()
    this.throttledCalls = 0
  }

  refill() {
    const now = Date.now()
    const elapsedSeconds = (now - this.lastRefill) / 1000
    const refillAmount = elapsedSeconds * this.refillPerSecond

    if (refillAmount > 0) {
      this.tokens = Math.min(this.capacity, this.tokens + refillAmount)
      this.lastRefill = now
    }
  }

  async take() {
    this.refill()

    if (this.tokens >= 1) {
      this.tokens -= 1
      return
    }

    this.throttledCalls += 1

    const waitMs = Math.ceil(((1 - this.tokens) / this.refillPerSecond) * 1000)
    await new Promise(resolve => setTimeout(resolve, waitMs))

    this.refill()
    this.tokens = Math.max(0, this.tokens - 1)
  }

  stats() {
    return {
      throttled_calls: this.throttledCalls,
      available_tokens: Number(this.tokens.toFixed(2)),
      capacity: this.capacity,
      refill_per_second: this.refillPerSecond,
    }
  }
}
