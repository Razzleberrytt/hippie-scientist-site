#!/usr/bin/env node
/**
 * Injects the 4 anxiety sheets from the formatting-stripped xlsx into the
 * formatted git version, restoring all formatting while preserving anxiety data.
 *
 * Root cause: openpyxl strips all Excel cell formatting when it reads+saves
 * an xlsx file. The anxiety sheets were added externally via openpyxl, causing
 * the file to drop from 25MB → 2.8MB (data intact, formatting gone).
 *
 * Strategy (ZIP-level injection):
 * 1. Extract anxiety sheet XMLs from the stripped current file
 * 2. Insert them into the formatted git version at ZIP level
 * 3. Update workbook.xml, rels, and [Content_Types].xml accordingly
 *
 * The anxiety sheets use inlineStr (not shared string refs), so no sharedStrings
 * update is needed.
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

const ANXIETY_SHEET_NAMES = [
  'Anxiety Outcome Problems',
  'Anxiety Evidence Claims',
  'Anxiety Evidence Sources',
  'Anxiety Safety Notes',
]

function parseSheetEntries(wbXml) {
  return [...wbXml.matchAll(/<sheet\b([^>]+)\/>/g)].map((m) => m[0])
}

function parseRels(relsXml) {
  return [...relsXml.matchAll(/<Relationship\b([^>]+)\/>/g)].map((m) => m[0])
}

function attrValue(entry, attr) {
  const m = entry.match(new RegExp(`${attr}="([^"]*)"`, 'i'))
  return m ? m[1] : null
}

function main() {
  const xlsxPath = path.join(repoRoot, 'data-sources/herb_monograph_master.xlsx')

  // The formatted git version was saved to TEMP during investigation
  const gitPath = path.join(process.env.TEMP || '/tmp', 'git_xlsx.xlsx')

  if (!fs.existsSync(gitPath)) {
    console.error(`[inject] formatted git version not found at ${gitPath}`)
    console.error('[inject] Run: git show f551696d:data-sources/herb_monograph_master.xlsx > "$TEMP/git_xlsx.xlsx"')
    process.exit(1)
  }

  console.log('[inject] Reading formatted git version...')
  const gitData = new Uint8Array(fs.readFileSync(gitPath))
  const gitFiles = unzipSync(gitData)

  console.log('[inject] Reading current (formatting-stripped) version...')
  const currentData = new Uint8Array(fs.readFileSync(xlsxPath))
  const currentFiles = unzipSync(currentData)

  // --- Identify anxiety sheets in current file ---
  const currentWbXml = strFromU8(currentFiles['xl/workbook.xml'])
  const currentRelsXml = strFromU8(currentFiles['xl/_rels/workbook.xml.rels'])
  const currentContentTypesXml = strFromU8(currentFiles['[Content_Types].xml'])

  const currentSheetEntries = parseSheetEntries(currentWbXml)
  const anxietyEntries = currentSheetEntries.filter((e) =>
    ANXIETY_SHEET_NAMES.some((name) => e.includes(`name="${name}"`))
  )

  if (anxietyEntries.length !== 4) {
    throw new Error(`[inject] Expected 4 anxiety sheet entries, found ${anxietyEntries.length}`)
  }

  console.log('[inject] Found anxiety sheets:', anxietyEntries.map((e) => attrValue(e, 'name')).join(', '))

  // Map current rId → file path for anxiety sheets
  const currentRels = parseRels(currentRelsXml)
  const currentRelMap = new Map(currentRels.map((r) => [attrValue(r, 'Id'), attrValue(r, 'Target')]))

  const anxietySheetFiles = anxietyEntries.map((entry) => {
    const rId = attrValue(entry, 'r:id')
    const rawTarget = currentRelMap.get(rId) || ''
    // Normalize: strip leading /xl/ prefix if present
    const target = rawTarget.replace(/^\/xl\//, '')
    const zipKey = `xl/${target}`
    if (!currentFiles[zipKey]) {
      throw new Error(`[inject] Sheet file not found: ${zipKey} (rId ${rId})`)
    }
    return { entry, rId, target, zipKey }
  })

  // --- Prepare git files for modification ---
  const gitWbXml = strFromU8(gitFiles['xl/workbook.xml'])
  const gitRelsXml = strFromU8(gitFiles['xl/_rels/workbook.xml.rels'])
  const gitContentTypesXml = strFromU8(gitFiles['[Content_Types].xml'])

  // Find next available rId in git version
  const allGitRIds = [...gitRelsXml.matchAll(/Id="rId(\d+)"/g)].map((m) => parseInt(m[1]))
  let nextRId = Math.max(...allGitRIds) + 1

  // Find max sheetId in git version
  const allGitSheetIds = [...gitWbXml.matchAll(/sheetId="(\d+)"/g)].map((m) => parseInt(m[1]))
  let nextSheetId = Math.max(...allGitSheetIds) + 1

  // Find next available sheet file number in git version
  const allGitSheetNums = Object.keys(gitFiles)
    .filter((k) => k.match(/^xl\/worksheets\/sheet\d+\.xml$/))
    .map((k) => parseInt(k.match(/sheet(\d+)\.xml/)[1]))
  let nextSheetNum = Math.max(...allGitSheetNums) + 1

  console.log(`[inject] Git base: ${allGitSheetIds.length} sheets, max rId=${Math.max(...allGitRIds)}, max sheetId=${Math.max(...allGitSheetIds)}, max file num=${Math.max(...allGitSheetNums)}`)
  console.log(`[inject] New rIds will start at rId${nextRId}, sheetIds at ${nextSheetId}, file nums at ${nextSheetNum}`)

  // --- Build merged files ---
  const mergedFiles = { ...gitFiles }

  const newSheetEntries = []
  const newRelEntries = []
  const newContentTypes = []

  for (const { entry, zipKey } of anxietySheetFiles) {
    const name = attrValue(entry, 'name')
    const newRId = `rId${nextRId++}`
    const newSheetId = nextSheetId++
    const newFileNum = nextSheetNum++
    const newFileName = `worksheets/sheet${newFileNum}.xml`
    const newZipKey = `xl/${newFileName}`

    // Copy sheet XML from current to merged
    mergedFiles[newZipKey] = currentFiles[zipKey]

    // New workbook.xml sheet entry (no trailing space before />)
    newSheetEntries.push(`<sheet name="${name}" sheetId="${newSheetId}" r:id="${newRId}"/>`)

    // New rels entry (use relative path to match git version's format)
    newRelEntries.push(
      `<Relationship Id="${newRId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="${newFileName}"/>`
    )

    // New content type entry
    newContentTypes.push(
      `<Override PartName="/xl/${newFileName}" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`
    )

    console.log(`[inject] ${name}: ${zipKey} → ${newZipKey} (${newRId}, sheetId=${newSheetId})`)
  }

  // --- Patch workbook.xml ---
  const newWbXml = gitWbXml.replace(
    '</sheets>',
    newSheetEntries.join('') + '</sheets>'
  )
  if (newWbXml === gitWbXml) throw new Error('[inject] Failed to patch workbook.xml: </sheets> not found')
  mergedFiles['xl/workbook.xml'] = strToU8(newWbXml)

  // --- Patch rels ---
  const newRelsXml = gitRelsXml.replace(
    '</Relationships>',
    newRelEntries.join('') + '</Relationships>'
  )
  if (newRelsXml === gitRelsXml) throw new Error('[inject] Failed to patch workbook rels: </Relationships> not found')
  mergedFiles['xl/_rels/workbook.xml.rels'] = strToU8(newRelsXml)

  // --- Patch [Content_Types].xml ---
  const newContentTypesXml = gitContentTypesXml.replace(
    '</Types>',
    newContentTypes.join('') + '</Types>'
  )
  if (newContentTypesXml === gitContentTypesXml) throw new Error('[inject] Failed to patch [Content_Types].xml: </Types> not found')
  mergedFiles['[Content_Types].xml'] = strToU8(newContentTypesXml)

  // --- Write result ---
  // fflate zipSync with compression level 0 for sheet XMLs (xlsx convention) and deflate for others
  const zipInput = {}
  for (const [key, data] of Object.entries(mergedFiles)) {
    zipInput[key] = [data, { level: 0 }]
  }

  console.log('[inject] Zipping merged workbook...')
  const merged = zipSync(zipInput)
  fs.writeFileSync(xlsxPath, merged)

  const sizeMB = (merged.length / 1024 / 1024).toFixed(1)
  console.log(`[inject] Written to ${xlsxPath} (${sizeMB} MB)`)
  console.log(`[inject] Success: ${allGitSheetIds.length + 4} sheets total`)
}

main()
