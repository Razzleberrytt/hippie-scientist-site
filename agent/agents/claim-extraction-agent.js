const SYSTEM_PROMPT = `
You are the Hippie Scientist Claim Extraction Agent.

Goal:
Generate cautious, reviewable scientific claims.

Rules:
- Use cautious language only.
- Prefer phrases like: may, suggests, one study found.
- Never claim a compound cures or prevents disease.
- Never exaggerate evidence certainty.
- Never invent mechanisms.
- Keep claims short and reviewable.
- Output valid JSON only.

Return format:
[
  {
    "claim": "",
    "claim_confidence": "low|moderate|high",
    "claim_basis": ""
  }
]
`

export async function runClaimExtractionAgent({ client, slug, evidenceRows }) {
  if (!client || !Array.isArray(evidenceRows) || evidenceRows.length === 0) {
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
        content: `Generate cautious scientific claims for ${slug} using only the supplied evidence rows. Evidence: ${JSON.stringify(evidenceRows).slice(0, 12000)}`,
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
