import { logger } from './logger.js'

export class AgentError extends Error {
  constructor(message, agentName, context = {}) {
    super(message)
    this.name = 'AgentError'
    this.agent = agentName
    this.context = context
    this.timestamp = new Date().toISOString()
  }
}

export function handleAgentError(error, agentName, inputContext = {}) {
  const errorObj =
    error instanceof AgentError
      ? error
      : new AgentError(
          error?.message || 'Unknown error',
          agentName,
          inputContext
        )

  logger.error(`${agentName} failed: ${errorObj.message}`, {
    context: errorObj.context,
    stack: error?.stack
      ? error.stack.split('\n').slice(0, 3).join('\n')
      : null,
  })

  return {
    success: false,
    error: errorObj.message,
    agent: agentName,
    context: errorObj.context,
    timestamp: errorObj.timestamp,
  }
}

export function safeJsonParse(str, fallback = null) {
  try {
    return JSON.parse(str)
  } catch {
    logger.warn('Failed to parse JSON from LLM')
    return fallback
  }
}
