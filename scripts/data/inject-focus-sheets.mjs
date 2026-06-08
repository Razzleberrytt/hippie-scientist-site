#!/usr/bin/env node
/**
 * Injects 4 Focus evidence engine sheets into herb_monograph_master.xlsx
 * at ZIP level, creating sheet XML from hardcoded data.
 *
 * Does NOT use openpyxl or any Python path — safe to run without
 * losing existing workbook formatting.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { unzipSync, zipSync, strToU8, strFromU8 } = require('./../../node_modules/fflate/umd/index.js')

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '../..')

// ---------------------------------------------------------------------------
// Focus data
// ---------------------------------------------------------------------------

const FOCUS_OUTCOME_PROBLEMS = {
  headers: ['problem_key', 'title', 'description'],
  rows: [
    ['attention_maintenance', 'Attention maintenance', 'Difficulty sustaining focus without mental drift or cognitive fatigue over extended periods.'],
    ['decision_fatigue', 'Decision fatigue', 'Degraded decision quality or executive function from repeated or high-stakes choices.'],
    ['task_switching', 'Task switching', 'Difficulty shifting between contexts with interference carryover or restart friction.'],
    ['cognitive_load', 'Cognitive load', 'Mental overload from simultaneously managing multiple priorities or information streams.'],
  ],
}

const FOCUS_EVIDENCE_CLAIMS = {
  headers: [
    'claim_id', 'ingredient_name', 'ingredient_slug',
    'focus_problem', 'claim_statement', 'confidence_tier',
    'evidence_summary', 'limitations', 'best_fit', 'not_best_fit',
    'decision_group', 'display_order', 'published',
  ],
  rows: [
    [
      'l-theanine-attention-maintenance', 'L-Theanine', 'l-theanine',
      'attention_maintenance',
      'L-theanine may support sustained attention and reduce mind-wandering without producing sedation.',
      'limited_human',
      'Small human EEG and attention studies associate L-theanine with increased alpha-wave activity and improved selective attention under mild cognitive demand.',
      'Evidence base is small, tasks are often artificial, and effects may be subtle without caffeine co-administration.',
      'Quiet sustained-attention tasks where sedation is not acceptable.',
      'High-stimulation environments, panic-prone profiles, or expectations of strong stimulant-like focus.',
      'Attention support', '1', 'TRUE',
    ],
    [
      'l-theanine-task-switching', 'L-Theanine', 'l-theanine',
      'task_switching',
      'L-theanine combined with caffeine has the strongest acute evidence for reducing task-switching errors and attention carryover.',
      'limited_human',
      'Human trials combining L-theanine and caffeine show improved cognitive flexibility, reaction time, and reduced commission errors during multi-task paradigms.',
      'Benefits are largely attributed to the combination, not theanine alone; dose matching matters.',
      'Context-switching work environments where caffeine is already in use and cognitive smoothing is the goal.',
      'Caffeine-sensitive users, anxious profiles, or situations where a pure sedation-free profile is needed without caffeine.',
      'Cognitive switching support', '2', 'TRUE',
    ],
    [
      'bacopa-attention-maintenance', 'Bacopa', 'bacopa',
      'attention_maintenance',
      'Bacopa monnieri has the most consistent human trial evidence among botanicals for sustained attention and information processing speed.',
      'moderate_human',
      'Multiple RCTs in healthy adults report improvements in attention, processing speed, and visual information retention after 8-12 weeks of supplementation.',
      'Benefits require extended supplementation (weeks), GI side effects are common, and effect sizes vary by population and extract.',
      'Long-term sustained-attention optimization in cognitively healthy adults willing to tolerate an 8-12 week onset window.',
      'Acute focus demands, GI-sensitive individuals, or situations requiring immediate effect.',
      'Sustained attention support', '3', 'TRUE',
    ],
    [
      'bacopa-cognitive-load', 'Bacopa', 'bacopa',
      'cognitive_load',
      'Bacopa may reduce working memory load and improve cognitive performance under conditions of mental complexity.',
      'moderate_human',
      'RCTs and meta-analyses report improvements on working memory and spatial memory tasks, suggesting a capacity benefit relevant to cognitive load reduction.',
      'Effects are modest and slow-onset; evidence for extreme cognitive-load conditions is limited.',
      'Cognitively demanding work requiring accurate working memory over extended periods.',
      'Short-term acute cognitive demands or situations where GI side effects are not tolerable.',
      'Cognitive load support', '4', 'TRUE',
    ],
    [
      'lions-mane-cognitive-load', "Lion's Mane", 'lions-mane',
      'cognitive_load',
      "Lion's mane mushroom has early-stage human evidence suggesting benefits for cognitive function that may be relevant to cognitive load capacity.",
      'limited_human',
      'A small randomized trial in older adults with mild cognitive concerns reported improved cognitive scores after 16 weeks; NGF-stimulating mechanisms are supported in animal models.',
      'Human evidence is limited to one small RCT in a specific population; relevance to healthy-adult cognitive load is extrapolated.',
      'An exploratory add-on for users interested in neurotrophin pathways who can accept a weak evidence base.',
      'Acute needs, strong-evidence requirements, or use as a primary cognitive support without other strategies.',
      'Cognitive load support', '5', 'TRUE',
    ],
    [
      'ginkgo-attention-maintenance', 'Ginkgo', 'ginkgo',
      'attention_maintenance',
      'Ginkgo biloba has moderate human evidence for supporting attention speed and accuracy, particularly in populations with attention-related concerns.',
      'moderate_human',
      'Systematic reviews and meta-analyses confirm attention and processing speed benefits across multiple trials, with the clearest signals in older adults or those with cognitive complaints.',
      'Effects in young healthy adults are less consistent; anticoagulant interaction context is a routine safety check.',
      'Attention and processing speed support in adults with concern about age-related cognitive changes.',
      'Anticoagulant users, pre-surgical contexts, or when seeking primarily neuroprotective rather than acute attention effects.',
      'Attention support', '6', 'TRUE',
    ],
    [
      'rhodiola-decision-fatigue', 'Rhodiola', 'rhodiola',
      'decision_fatigue',
      'Rhodiola rosea has the clearest evidence base among adaptogens for reducing mental fatigue and cognitive performance decline under sustained demands.',
      'moderate_human',
      'RCTs in physicians and students under high-load conditions report reduced mental fatigue, improved cognitive endurance, and subjective well-being. Effect onset is within days to 2 weeks.',
      'Evidence is moderate and extrapolation to everyday decision fatigue requires care; stimulant-like effects may disrupt sleep if used late in the day.',
      'Decision fatigue and cognitive burnout in high-workload contexts, especially when stress overlap is present.',
      'Bipolar-spectrum risk without clinician oversight, or late-day use in sleep-sensitive individuals.',
      'Decision fatigue support', '7', 'TRUE',
    ],
  ],
}

const FOCUS_EVIDENCE_SOURCES = {
  headers: [
    'source_id', 'claim_id', 'citation_label', 'source_type',
    'title', 'year', 'url', 'source_note', 'published',
  ],
  rows: [
    [
      'src-theanine-egawa-2016-foc', 'l-theanine-attention-maintenance',
      'Egawa 2016', 'randomized_trial',
      'L-Theanine improves working memory and attention-switching in healthy adults',
      '2016', 'https://pubmed.ncbi.nlm.nih.gov/27396874/',
      'Double-blind crossover trial showing improved attention and working memory in healthy adults; supports sustained attention framing for L-theanine.',
      'TRUE',
    ],
    [
      'src-theanine-giesbrecht-2010-foc', 'l-theanine-task-switching',
      'Giesbrecht 2010', 'randomized_trial',
      'The combination of L-theanine and caffeine improves cognitive performance and increases subjective alertness',
      '2010', 'https://pubmed.ncbi.nlm.nih.gov/19840080/',
      'Crossover RCT confirming combined L-theanine and caffeine benefits on task-switching and attention; supports focus task-switching framing.',
      'TRUE',
    ],
    [
      'src-bacopa-stough-2001-foc', 'bacopa-attention-maintenance',
      'Stough 2001', 'randomized_trial',
      'The chronic effects of an extract of Bacopa monniera (Brahmi) on cognitive function in healthy human subjects',
      '2001', 'https://pubmed.ncbi.nlm.nih.gov/11498727/',
      'One of the first well-controlled RCTs showing Bacopa improvements in visual information processing speed after 12 weeks.',
      'TRUE',
    ],
    [
      'src-bacopa-morgan-2010-foc', 'bacopa-attention-maintenance',
      'Morgan & Stevens 2010', 'randomized_trial',
      'Does Bacopa monnieri improve memory performance in older persons? Results of a randomized, placebo-controlled, double-blind trial',
      '2010', 'https://pubmed.ncbi.nlm.nih.gov/20590480/',
      'RCT in older adults showing improved working memory and attention; supports sustained attention framing across age groups.',
      'TRUE',
    ],
    [
      'src-bacopa-kongkeaw-2014-foc', 'bacopa-cognitive-load',
      'Kongkeaw 2014', 'meta_analysis',
      'Meta-analysis of randomized controlled trials on cognitive effects of Bacopa monnieri extract',
      '2014', 'https://pubmed.ncbi.nlm.nih.gov/24252493/',
      'Meta-analysis of 9 RCTs confirming cognitive performance improvements; supports working memory and cognitive load framing.',
      'TRUE',
    ],
    [
      'src-lions-mane-mori-2009-foc', 'lions-mane-cognitive-load',
      'Mori 2009', 'randomized_trial',
      'Improving effects of the mushroom Yamabushitake (Hericium erinaceus) on mild cognitive impairment',
      '2009', 'https://pubmed.ncbi.nlm.nih.gov/18844328/',
      '16-week RCT in adults with mild cognitive impairment showing cognitive score improvements; primary human evidence for lion\'s mane cognitive benefits.',
      'TRUE',
    ],
    [
      'src-ginkgo-brondino-2013-foc', 'ginkgo-attention-maintenance',
      'Brondino 2013', 'systematic_review',
      'A systematic review and meta-analysis of Ginkgo biloba in neuropsychiatric disorders',
      '2013', 'https://pubmed.ncbi.nlm.nih.gov/23781171/',
      'Systematic review covering attention, cognition, and neuropsychiatric outcomes; supports the attention-maintenance framing.',
      'TRUE',
    ],
    [
      'src-ginkgo-tan-2015-foc', 'ginkgo-attention-maintenance',
      'Tan 2015', 'meta_analysis',
      'Dose-response relationship of Ginkgo biloba on cognitive function: A meta-analysis',
      '2015', 'https://pubmed.ncbi.nlm.nih.gov/25671022/',
      'Meta-analysis of Ginkgo dose-response for cognitive outcomes including attention speed; supplements the Brondino systematic review.',
      'TRUE',
    ],
    [
      'src-rhodiola-darbinyan-2000-foc', 'rhodiola-decision-fatigue',
      'Darbinyan 2000', 'randomized_trial',
      'Rhodiola rosea in stress induced fatigue -- a double blind cross-over study of a standardized extract SHR-5',
      '2000', 'https://pubmed.ncbi.nlm.nih.gov/11081987/',
      'Classic crossover trial in physicians under night-shift stress showing reduced fatigue and improved cognitive performance; core evidence for cognitive fatigue framing.',
      'TRUE',
    ],
    [
      'src-rhodiola-shevtsov-2003-foc', 'rhodiola-decision-fatigue',
      'Shevtsov 2003', 'randomized_trial',
      'A randomized trial of two different doses of a SHR-5 Rhodiola rosea extract versus placebo and control of capacity for mental work',
      '2003', 'https://pubmed.ncbi.nlm.nih.gov/12725561/',
      'Dose-ranging RCT for Rhodiola cognitive fatigue; supports decision-fatigue and mental-endurance framing.',
      'TRUE',
    ],
  ],
}

const FOCUS_SAFETY_NOTES = {
  headers: [
    'safety_id', 'ingredient_slug', 'risk_type',
    'severity', 'warning', 'decision_effect', 'published',
  ],
  rows: [
    [
      'bacopa-gi-effects-focus', 'bacopa', 'gastrointestinal', 'moderate',
      'Bacopa monnieri commonly causes GI side effects including nausea, diarrhea, and stomach cramping, particularly at higher doses or when taken without food.',
      'Take Bacopa with food and reduce dose if GI symptoms emerge.',
      'TRUE',
    ],
    [
      'bacopa-pregnancy-focus', 'bacopa', 'pregnancy_breastfeeding', 'high',
      'Bacopa has demonstrated uterotonic activity in animal models and is considered unsafe to use during pregnancy.',
      'Do not use Bacopa as a self-directed focus supplement during pregnancy.',
      'TRUE',
    ],
    [
      'ginkgo-anticoagulant-focus', 'ginkgo', 'anticoagulant_interaction', 'high',
      'Ginkgo biloba has antiplatelet activity and may potentiate anticoagulant medications (warfarin, aspirin, NSAIDs), increasing bleeding risk.',
      'Review anticoagulant or blood-thinning medication context before use; avoid self-directed use in pre-surgical settings.',
      'TRUE',
    ],
    [
      'ginkgo-seizure-risk-focus', 'ginkgo', 'seizure_risk', 'moderate',
      'A contaminant (ginkgotoxin) present in poorly processed Ginkgo can cause seizures; product quality and standardization matter for safety.',
      'Use only standardized 24% flavone glycosides / 6% terpene lactone extracts; avoid crude or unstandardized preparations.',
      'TRUE',
    ],
    [
      'rhodiola-stimulant-stacking-focus', 'rhodiola', 'stimulant_stacking', 'moderate',
      'Rhodiola has mild stimulant-like effects and can cause insomnia, irritability, or overstimulation when combined with other stimulant compounds or taken late in the day.',
      'Avoid late-day dosing; reduce dose or avoid stacking with other stimulants if jitteriness or sleep disruption emerges.',
      'TRUE',
    ],
    [
      'lions-mane-allergy-focus', 'lions-mane', 'allergic_reaction', 'moderate',
      "Lion's mane is a mushroom allergen; individuals with mushroom or fungal allergies should approach with caution.",
      "Start with a low dose and monitor for itching, rash, or respiratory symptoms before regular use.",
      'TRUE',
    ],
    [
      'l-theanine-sedative-stacking-focus', 'l-theanine', 'sedative_stacking', 'moderate',
      'Stacking L-theanine with alcohol, sedatives, or multiple calming agents may produce unpredictable sedation levels.',
      'Avoid stacking until single-ingredient response and medication context are established.',
      'TRUE',
    ],
  ],
}

// ---------------------------------------------------------------------------
// XML helpers
// ---------------------------------------------------------------------------

function colLetter(n) {
  let result = ''
  while (n > 0) {
    const rem = (n - 1) % 26
    result = String.fromCharCode(65 + rem) + result
    n = Math.floor((n - 1) / 26)
  }
  return result
}

function escapeXml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function makeSheetXml({ headers, rows }) {
  const headerCells = headers
    .map((h, i) => `<c r="${colLetter(i + 1)}1" t="inlineStr"><is><t>${escapeXml(h)}</t></is></c>`)
    .join('')

  const dataRows = rows
    .map((row, ri) => {
      const cells = row
        .map((cell, ci) => `<c r="${colLetter(ci + 1)}${ri + 2}" t="inlineStr"><is><t>${escapeXml(cell)}</t></is></c>`)
        .join('')
      return `<row r="${ri + 2}">${cells}</row>`
    })
    .join('')

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData><row r="1">${headerCells}</row>${dataRows}</sheetData></worksheet>`
}

// ---------------------------------------------------------------------------
// Inject
// ---------------------------------------------------------------------------

function parseSheetEntries(wbXml) {
  return [...wbXml.matchAll(/<sheet\b([^>]+)\/>/g)].map((m) => m[0])
}

function main() {
  const xlsxPath = path.join(repoRoot, 'data-sources/herb_monograph_master.xlsx')

  const FOCUS_SHEETS = [
    { name: 'Focus Outcome Problems', data: FOCUS_OUTCOME_PROBLEMS },
    { name: 'Focus Evidence Claims', data: FOCUS_EVIDENCE_CLAIMS },
    { name: 'Focus Evidence Sources', data: FOCUS_EVIDENCE_SOURCES },
    { name: 'Focus Safety Notes', data: FOCUS_SAFETY_NOTES },
  ]

  console.log('[inject-focus] Reading workbook...')
  const raw = new Uint8Array(fs.readFileSync(xlsxPath))
  const files = unzipSync(raw)

  const wbXml = strFromU8(files['xl/workbook.xml'])
  const relsXml = strFromU8(files['xl/_rels/workbook.xml.rels'])
  const contentTypesXml = strFromU8(files['[Content_Types].xml'])

  // Guard: check focus sheets not already present
  const existing = parseSheetEntries(wbXml).map((e) => e.match(/name="([^"]+)"/)?.[1] || '')
  for (const { name } of FOCUS_SHEETS) {
    if (existing.includes(name)) {
      console.error(`[inject-focus] Sheet "${name}" already exists — aborting to avoid duplicates`)
      process.exit(1)
    }
  }

  // Find next available ids / numbers
  const allRIds = [...relsXml.matchAll(/Id="rId(\d+)"/g)].map((m) => parseInt(m[1]))
  let nextRId = Math.max(...allRIds) + 1

  const allSheetIds = [...wbXml.matchAll(/sheetId="(\d+)"/g)].map((m) => parseInt(m[1]))
  let nextSheetId = Math.max(...allSheetIds) + 1

  const allSheetNums = Object.keys(files)
    .filter((k) => k.match(/^xl\/worksheets\/sheet\d+\.xml$/))
    .map((k) => parseInt(k.match(/sheet(\d+)\.xml/)[1]))
  let nextSheetNum = Math.max(...allSheetNums) + 1

  console.log(`[inject-focus] Workbook: ${existing.length} sheets, max rId=${Math.max(...allRIds)}, max sheetId=${Math.max(...allSheetIds)}, max file num=${Math.max(...allSheetNums)}`)

  const merged = { ...files }
  const newSheetEntries = []
  const newRelEntries = []
  const newContentTypes = []

  for (const { name, data } of FOCUS_SHEETS) {
    const rId = `rId${nextRId++}`
    const sheetId = nextSheetId++
    const fileNum = nextSheetNum++
    const fileName = `worksheets/sheet${fileNum}.xml`
    const zipKey = `xl/${fileName}`
    const xml = makeSheetXml(data)

    merged[zipKey] = strToU8(xml)
    newSheetEntries.push(`<sheet name="${escapeXml(name)}" sheetId="${sheetId}" r:id="${rId}"/>`)
    newRelEntries.push(`<Relationship Id="${rId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="${fileName}"/>`)
    newContentTypes.push(`<Override PartName="/xl/${fileName}" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`)

    console.log(`[inject-focus] ${name}: ${zipKey} (${rId}, sheetId=${sheetId}), ${data.rows.length} data rows`)
  }

  // Patch workbook.xml
  const newWbXml = wbXml.replace('</sheets>', newSheetEntries.join('') + '</sheets>')
  if (newWbXml === wbXml) throw new Error('[inject-focus] Failed to patch workbook.xml')
  merged['xl/workbook.xml'] = strToU8(newWbXml)

  // Patch rels
  const newRelsXml = relsXml.replace('</Relationships>', newRelEntries.join('') + '</Relationships>')
  if (newRelsXml === relsXml) throw new Error('[inject-focus] Failed to patch rels')
  merged['xl/_rels/workbook.xml.rels'] = strToU8(newRelsXml)

  // Patch content types
  const newContentTypesXml = contentTypesXml.replace('</Types>', newContentTypes.join('') + '</Types>')
  if (newContentTypesXml === contentTypesXml) throw new Error('[inject-focus] Failed to patch content types')
  merged['[Content_Types].xml'] = strToU8(newContentTypesXml)

  // Write
  const zipInput = {}
  for (const [key, data] of Object.entries(merged)) {
    zipInput[key] = [data, { level: 0 }]
  }

  console.log('[inject-focus] Zipping...')
  const out = zipSync(zipInput)
  fs.writeFileSync(xlsxPath, out)

  const sizeMB = (out.length / 1024 / 1024).toFixed(1)
  console.log(`[inject-focus] Written: ${xlsxPath} (${sizeMB} MB, ${existing.length + FOCUS_SHEETS.length} sheets total)`)
}

main()
