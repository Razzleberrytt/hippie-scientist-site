import OpenAI from 'openai'

import { safeJsonParse } from './errors.js'

let cachedClient = null

export function createOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    return null
  }

  if (cachedClient) {
    return cachedClient
  }

  cachedClient = new OpenAI({ apiKey })

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
