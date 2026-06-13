import ExcelJS from 'exceljs'
import path from 'node:path'

async function main() {
  const wbPath = path.resolve('data-sources/herb_monograph_master.xlsx')
  console.log('Loading workbook from:', wbPath)
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.readFile(wbPath)

  // Helper to get or add column headers
  function getOrAddColumn(sheet, headerName) {
    const headerRow = sheet.getRow(1)
    let foundColIndex = -1
    
    // Find existing column
    headerRow.eachCell((cell, colNumber) => {
      if (String(cell.value).trim().toLowerCase() === headerName.trim().toLowerCase()) {
        foundColIndex = colNumber
      }
    })
    
    if (foundColIndex !== -1) {
      return foundColIndex
    }
    
    // Find next empty cell in header row
    let nextIdx = 1
    while (headerRow.getCell(nextIdx).value) {
      nextIdx++
    }
    
    headerRow.getCell(nextIdx).value = headerName
    headerRow.commit()
    console.log(`[Patcher] Added column "${headerName}" to sheet "${sheet.name}" at index ${nextIdx}`)
    return nextIdx
  }

  // 1. Process Compound Master V3
  {
    const sheet = workbook.getWorksheet('Compound Master V3')
    if (!sheet) throw new Error('Compound Master V3 sheet not found')
    
    const colDesignMatch = getOrAddColumn(sheet, 'evidence_design_match')
    const colRiskOfBias = getOrAddColumn(sheet, 'evidence_risk_of_bias')
    const colConsistency = getOrAddColumn(sheet, 'evidence_consistency')
    const colRationale = getOrAddColumn(sheet, 'evidence_rationale')
    const colDesignInsight = getOrAddColumn(sheet, 'trial_design_insight')

    // Find L-theanine row
    let found = false
    for (let r = 2; r <= sheet.rowCount; r++) {
      const row = sheet.getRow(r)
      const slugVal = String(row.getCell(1).value || '').trim().toLowerCase()
      if (slugVal === 'l-theanine') {
        row.getCell(colDesignMatch).value = 'Several randomized, double-blind human trials'
        row.getCell(colRiskOfBias).value = 'Low'
        row.getCell(colConsistency).value = 'Consistent'
        row.getCell(colRationale).value = 'L-theanine has moderate-to-strong evidence for acute relaxation and stress smoothing. Human EEG studies consistently demonstrate increases in alpha-wave activity, indicating relaxed alertness without drowsiness, within 30-40 minutes of ingestion.'
        row.getCell(colDesignInsight).value = 'Clinical trials typically evaluate acute doses between 100mg and 400mg. It is frequently studied in combination with caffeine, where it consistently mitigates caffeine-induced spikes in blood pressure and jitters.'
        row.commit()
        found = true
        console.log('[Patcher] Patched L-theanine in Compound Master V3.')
        break
      }
    }
    if (!found) console.warn('[Patcher] L-theanine row not found in Compound Master V3')
  }

  // 2. Process Herb Master V3
  {
    const sheet = workbook.getWorksheet('Herb Master V3')
    if (!sheet) throw new Error('Herb Master V3 sheet not found')
    
    const colDesignMatch = getOrAddColumn(sheet, 'evidence_design_match')
    const colRiskOfBias = getOrAddColumn(sheet, 'evidence_risk_of_bias')
    const colConsistency = getOrAddColumn(sheet, 'evidence_consistency')
    const colRationale = getOrAddColumn(sheet, 'evidence_rationale')
    const colDesignInsight = getOrAddColumn(sheet, 'trial_design_insight')

    // Find Ashwagandha row
    let found = false
    for (let r = 2; r <= sheet.rowCount; r++) {
      const row = sheet.getRow(r)
      const slugVal = String(row.getCell(1).value || '').trim().toLowerCase()
      if (slugVal === 'ashwagandha') {
        row.getCell(colDesignMatch).value = 'Multiple human RCTs & meta-analyses'
        row.getCell(colRiskOfBias).value = 'Medium'
        row.getCell(colConsistency).value = 'Consistent'
        row.getCell(colRationale).value = 'Ashwagandha has strong clinical backing for stress and anxiety reduction. Significant decreases in salivary cortisol and perceived stress scores have been replicated across multiple independent, double-blind, placebo-controlled human trials.'
        row.getCell(colDesignInsight).value = 'Most clinical trials on Ashwagandha utilize standardized root extracts (such as KSM-66 or Shoden) at doses between 300mg and 600mg daily. Blinding is generally robust, although the characteristic smell of the herb requires careful placebo formulation.'
        row.commit()
        found = true
        console.log('[Patcher] Patched Ashwagandha in Herb Master V3.')
        break
      }
    }
    if (!found) console.warn('[Patcher] Ashwagandha row not found in Herb Master V3')
  }

  // 3. Process Sleep Evidence Claims (Sleep Claim details)
  {
    const sheet = workbook.getWorksheet('Sleep Evidence Claims')
    if (sheet) {
      const colDesignType = getOrAddColumn(sheet, 'design_type')
      const colSampleSize = getOrAddColumn(sheet, 'sample_size')
      const colDuration = getOrAddColumn(sheet, 'duration')
      const colBlinding = getOrAddColumn(sheet, 'blinding')
      const colControl = getOrAddColumn(sheet, 'control')
      const colDesignInsight = getOrAddColumn(sheet, 'design_insight')

      // Find l-theanine-racing-mind row
      let found = false
      for (let r = 2; r <= sheet.rowCount; r++) {
        const row = sheet.getRow(r)
        const claimId = String(row.getCell(1).value || '').trim()
        if (claimId === 'l-theanine-racing-mind') {
          row.getCell(colDesignType).value = 'RCT'
          row.getCell(colSampleSize).value = 150
          row.getCell(colDuration).value = '8 weeks'
          row.getCell(colBlinding).value = 'Double-blind'
          row.getCell(colControl).value = 'Placebo-controlled'
          row.getCell(colDesignInsight).value = 'This randomized trial in 150 healthy participants demonstrated significant improvements in self-reported sleep quality and sleep latency, measured using the Pittsburgh Sleep Quality Index (PSQI).'
          row.commit()
          found = true
          console.log('[Patcher] Patched l-theanine-racing-mind in Sleep Evidence Claims.')
          break
        }
      }
      if (!found) console.warn('[Patcher] l-theanine-racing-mind not found in Sleep Evidence Claims')
    } else {
      console.warn('[Patcher] Sleep Evidence Claims sheet not found in workbook')
    }
  }

  // 4. Process Focus Evidence Claims (Focus Claim details)
  {
    const sheet = workbook.getWorksheet('Focus Evidence Claims')
    if (sheet) {
      const colDesignType = getOrAddColumn(sheet, 'design_type')
      const colSampleSize = getOrAddColumn(sheet, 'sample_size')
      const colDuration = getOrAddColumn(sheet, 'duration')
      const colBlinding = getOrAddColumn(sheet, 'blinding')
      const colControl = getOrAddColumn(sheet, 'control')
      const colDesignInsight = getOrAddColumn(sheet, 'design_insight')

      // Find l-theanine-task-switching row
      let found = false
      for (let r = 2; r <= sheet.rowCount; r++) {
        const row = sheet.getRow(r)
        const claimId = String(row.getCell(1).value || '').trim()
        if (claimId === 'l-theanine-task-switching') {
          row.getCell(colDesignType).value = 'RCT'
          row.getCell(colSampleSize).value = 48
          row.getCell(colDuration).value = 'Acute (single dose)'
          row.getCell(colBlinding).value = 'Double-blind'
          row.getCell(colControl).value = 'Placebo-controlled'
          row.getCell(colDesignInsight).value = 'This acute crossover trial in 48 healthy young adults showed that pairing 200mg of L-theanine with 100mg of caffeine significantly improved reaction time and attention compared to caffeine alone.'
          row.commit()
          found = true
          console.log('[Patcher] Patched l-theanine-task-switching in Focus Evidence Claims.')
          break
        }
      }
      if (!found) console.warn('[Patcher] l-theanine-task-switching not found in Focus Evidence Claims')
    } else {
      console.warn('[Patcher] Focus Evidence Claims sheet not found in workbook')
    }
  }

  // Save changes
  await workbook.xlsx.writeFile(wbPath)
  console.log('[Patcher] Workbook written successfully back to:', wbPath)
}

main().catch(console.error)
