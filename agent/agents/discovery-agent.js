const SYSTEM_PROMPT = `
You are the Hippie Scientist Discovery Agent.

Mission:
Extract ONLY conservative, structured human evidence.

Rules:
- Human randomized controlled trials and meta-analyses preferred.
- Never fabricate PMIDs.
- Never invent effect sizes.
- No mechanistic speculation.
- No marketing language.
- No summaries.
- No markdown.
- Output valid JSON only.
- If information is uncertain, leave fields blank.
- Reject animal and in vitro evidence.

Return an array using this exact schema:
[
  {
    "compound_slug": "",
    "effect_target": "",
    "study_type": "",
    "population": "",
    "effect_direction": "",
    "effect_size": "",
    "sample_size": "",
    "duration": "",
    "dose": "",
    "pmid_or_source": ""
  }
]
`

export async function runDiscoveryAgent({ client, slug }) {
  if (!client) {
    return []
  }

  const response = await client.chat.completions.create({
    model: 'gpt-4.1-mini',
    temperature: 0.1,
    messages: [
      {
        role: 'system',
        content: SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: `Extract conservative structured human evidence for ${slug}.`,
      },
    ],
  })

  try {
    const parsed = JSON.parse(response.choices?.[0]?.message?.content || '[]')

    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}
