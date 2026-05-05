export async function runDiscoveryAgent({ client, slug }) {
  const response = await client.chat.completions.create({
    model: 'gpt-4.1-mini',
    temperature: 0.1,
    messages: [
      {
        role: 'system',
        content:
          'Return only valid JSON. Human studies only. No markdown. No hallucinated PMIDs.'
      },
      {
        role: 'user',
        content: `Return a JSON array of structured human evidence rows for ${slug}.`
      }
    ]
  })

  try {
    return JSON.parse(response.choices?.[0]?.message?.content || '[]')
  } catch {
    return []
  }
}
