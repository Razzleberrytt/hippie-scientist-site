import { logger } from '../utils/logger'

type RugcheckResponse = {
  flagged: boolean
  score: number
  issues: string[]
}

export class RugcheckGate {
  constructor(private endpoint: string) {}

  async validateToken(mint: string): Promise<boolean> {
    const url = `${this.endpoint}/tokens/${mint}`
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Rugcheck failed with status ${response.status}`)
      }
      const payload = (await response.json()) as RugcheckResponse
      if (payload.flagged) {
        await logger.warn(`Rugcheck flagged ${mint}: ${payload.issues.join(', ')}`)
        return false
      }
      await logger.info(`Rugcheck score for ${mint}: ${payload.score}`)
      return payload.score >= 70
    } catch (error) {
      await logger.error(`Rugcheck validation error: ${(error as Error).message}`)
      return false
    }
  }
}
