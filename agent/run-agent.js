import fs from 'node:fs'
import path from 'node:path'
import OpenAI from 'openai'

const repoRoot = process.cwd()
const patchDir = path.join(repoRoot, 'agent', 'patches')

const compounds = [
  'ashwagandha',
  'l-theanine',
  'rhodiola-rosea',
  'creatine',
  'magnesium-glycinate',
]

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true })
}

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-')
}

async function main() {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    console.warn('[agent] OPENAI_API_KEY missing, skipping')
    process.exit(0)
  }

  ensureDir(patchDir)

  const compound = compounds[Math.floor(Math.random() * compounds.length)]

  const client = new OpenAI({ apiKey })

  const response = await client.chat.completions.create({
    model: 'gpt-4.1-mini',
    temperature: 0.2,
    messages: [
      {
        role: 'system',
        content:
          'Return ONLY valid JSON. No markdown. No explanations. HUMAN studies only. Never invent PMIDs or sources. If unknown leave fields empty. Output must exactly match the requested array schema.',
      },
      {
        role: 'user',
        content: `Generate one structured human-study extraction entry for the compound ${compound}. Use this exact JSON schema: [{"compound_slug":"","effect_target":"","study_type":"","population":"","effect_direction":"","effect_size":"","sample_size":"","duration":"","dose":"","pmid_or_source":""}]`,
      },
    ],
  })

  const raw = response.choices?.[0]?.message?.content || '[]'

  let parsed = []

  try {
    parsed = JSON.parse(raw)
  } catch {
    console.warn('[agent] invalid JSON returned, skipping')
    process.exit(0)
  }

  if (!Array.isArray(parsed)) {
    console.warn('[agent] non-array response, skipping')
    process.exit(0)
  }

  const fileName = `${compound}-${timestamp()}.json`
  const filePath = path.join(patchDir, fileName)

  fs.writeFileSync(filePath, JSON.stringify(parsed, null, 2))

  console.log(`[agent] wrote ${fileName}`)
}

main().catch(error => {
  console.error('[agent] failed', error)
  process.exit(0)
})
