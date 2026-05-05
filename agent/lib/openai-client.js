import OpenAI from 'openai'

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
