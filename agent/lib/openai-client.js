import OpenAI from 'openai'

import { safeJsonParse } from './errors.js'

const OPENAI_REQUEST_TIMEOUT_MS = 45_000
const OPENAI_MAX_RETRIES = 2

let cachedClient = null

export function createOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    return null
  }

  if (cachedClient) {
    return cachedClient
  }

  cachedClient = new OpenAI({
    apiKey,
    timeout: OPENAI_REQUEST_TIMEOUT_MS,
    maxRetries: OPENAI_MAX_RETRIES,
  })

  return cachedClient
}

export async function runJsonPrompt(
  systemPrompt,
  userPrompt,
  temperature = 0.1
) {
  const client = createOpenAIClient()

  if (!client) {
    return null
  }

  const response = await client.chat.completions.create({
    model: 'gpt-4.1-mini',
    temperature,
    messages: [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: userPrompt,
      },
    ],
  })

  return safeJsonParse(
    response.choices?.[0]?.message?.content,
    null
  )
}
