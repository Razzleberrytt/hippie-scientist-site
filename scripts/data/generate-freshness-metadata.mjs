#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ExcelJS = require('exceljs');

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, 'public', 'data');
const WORKBOOK_PATH = path.join(ROOT, 'data-sources', 'herb_monograph_master.xlsx');
const OUTPUT_FILE = path.join(DATA_DIR, 'freshness-metadata.json');

function parsePmid(value) {
  if (!value) return undefined;
  const match = String(value).match(/\b(\d{7,8})\b/);
  return match?.[1];
}

// Extract citations from a JSON record
function extractCitationsFromRecord(record) {
  const results = [];
  const parsePmidLocal = (val) => {
    const m = String(val || '').match(/\b(\d{7,8})\b/);
    return m?.[1];
  };

  const addCit = (title, pmid, year, authors) => {
    if (!title && !pmid) return;
    const cleanTitle = String(title || '').trim();
    const cleanPmid = cleanPmidField(pmid || parsePmidLocal(cleanTitle));
    const key = cleanPmid || cleanTitle;
    if (key && !results.some(c => (cleanPmid && c.pmid === cleanPmid) || c.title === cleanTitle)) {
      results.push({ title: cleanTitle, pmid: cleanPmid, year, authors });
    }
  };

  const cleanPmidField = (val) => {
    if (!val) return undefined;
    const m = String(val).match(/\b(\d{7,8})\b/);
    return m?.[1];
  };

  // Process sources
  if (Array.isArray(record?.sources)) {
    for (const src of record.sources) {
      if (!src) continue;
      if (typeof src === 'string') {
        addCit(src, parsePmidLocal(src));
      } else if (typeof src === 'object') {
        addCit(src.title || src.citation || src.ref, src.pmid || src.pubmedId, src.year, src.authors);
      }
    }
  }

  // Process references
  if (Array.isArray(record?.references)) {
    for (const ref of record.references) {
      if (!ref) continue;
      if (typeof ref === 'string') {
        addCit(ref, parsePmidLocal(ref));
      } else if (typeof ref === 'object') {
        addCit(ref.title || ref.citation || ref.ref, ref.pmid || ref.pubmedId, ref.year, ref.authors);
      }
    }
  }

  // Process pmids
  if (Array.isArray(record?.pmids)) {
    for (const pmid of record.pmids) {
      if (!pmid) continue;
      const id = String(pmid).trim();
      addCit(`PubMed ${id}`, id);
    }
  }

  return results;
}

// Load Study Registry sheet from workbook
async function loadStudyRegistryCitations() {
  if (!fs.existsSync(WORKBOOK_PATH)) {
    console.warn('[freshness-metadata] Workbook not found at:', WORKBOOK_PATH);
    return {};
  }

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(WORKBOOK_PATH);
  const sheet = workbook.getWorksheet('Study Registry');
  if (!sheet) {
    console.warn('[freshness-metadata] Study Registry sheet not found');
    return {};
  }

  const headers = {};
  sheet.getRow(1).eachCell((cell, colNumber) => {
    headers[colNumber] = cell.value ? String(cell.value).trim().toLowerCase() : '';
  });

  let slugCol = -1;
  let pmidCol = -1;
  let notesCol = -1;
  let studyTypeCol = -1;

  for (const [colNum, name] of Object.entries(headers)) {
    const col = parseInt(colNum, 10);
    if (name === 'compound_slug' || name === 'slug' || name === 'herb_slug') slugCol = col;
    if (name === 'pmid_or_source' || name === 'pmid' || name === 'source') pmidCol = col;
    if (name === 'notes' || name === 'study_title' || name === 'title') notesCol = col;
    if (name === 'study_type') studyTypeCol = col;
  }

  const results = {};
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const slug = row.getCell(slugCol).value ? String(row.getCell(slugCol).value).trim().toLowerCase() : '';
    const pmidOrSource = row.getCell(pmidCol).value ? String(row.getCell(pmidCol).value).trim() : '';
    const notes = row.getCell(notesCol).value ? String(row.getCell(notesCol).value).trim() : '';
    const studyType = row.getCell(studyTypeCol).value ? String(row.getCell(studyTypeCol).value).trim() : '';

    if (!slug || !pmidOrSource) return;

    const pmid = parsePmid(pmidOrSource);
    const title = pmid ? `PubMed ${pmid}` : pmidOrSource;
    
    if (!results[slug]) results[slug] = [];
    
    const list = results[slug];
    if (!list.some(c => (pmid && c.pmid === pmid) || c.title === title)) {
      list.push({
        title: notes || title,
        pmid,
        studyType
      });
    }
  });

  return results;
}

// Parse goals and option slugs from data/goals.ts
function parseGoalsConfig() {
  const goalsFilePath = path.join(ROOT, 'data', 'goals.ts');
  if (!fs.existsSync(goalsFilePath)) {
    console.warn('[freshness-metadata] goals.ts not found');
    return [];
  }

  const content = fs.readFileSync(goalsFilePath, 'utf8');
  const goals = [];
  
  // Match each goal block
  const goalBlockRegex = /slug:\s*'([^']+)',[\s\S]*?options:\s*\[([\s\S]*?)\]/g;
  let match;
  while ((match = goalBlockRegex.exec(content)) !== null) {
    const goalSlug = match[1];
    const optionsBlock = match[2];
    
    // Find options inside this block
    const optionSlugs = [];
    const optionRegex = /slug:\s*'([^']+)'/g;
    let optMatch;
    while ((optMatch = optionRegex.exec(optionsBlock)) !== null) {
      optionSlugs.push(optMatch[1]);
    }
    
    goals.push({
      slug: goalSlug,
      options: optionSlugs
    });
  }
  
  return goals;
}

async function main() {
  console.log('[freshness-metadata] Starting metadata compilation...');
  
  const studyRegistry = await loadStudyRegistryCitations();
  const goalsConfig = parseGoalsConfig();
  
  // Load herbs and compounds lists
  const herbsFile = path.join(DATA_DIR, 'herbs.json');
  const compoundsFile = path.join(DATA_DIR, 'compounds.json');
  
  const herbs = fs.existsSync(herbsFile) ? JSON.parse(fs.readFileSync(herbsFile, 'utf8')) : [];
  const compounds = fs.existsSync(compoundsFile) ? JSON.parse(fs.readFileSync(compoundsFile, 'utf8')) : [];

  // Load all evidence engines
  const goalSlugs = ['sleep', 'stress', 'focus', 'anxiety'];
  const engines = {};
  for (const g of goalSlugs) {
    const p = path.join(DATA_DIR, 'evidence-engine', `${g}.json`);
    if (fs.existsSync(p)) {
      engines[g] = JSON.parse(fs.readFileSync(p, 'utf8'));
    }
  }

  // Get citations from evidence engines for a specific slug
  function getEngineCitationsForSlug(slug) {
    const citations = [];
    const seen = new Set();
    
    for (const [goal, engine] of Object.entries(engines)) {
      const claims = engine.claims || [];
      const sourcesByClaim = engine.sourcesByClaim || {};
      
      for (const claim of claims) {
        if (claim.ingredient_slug === slug || claim.ingredientSlug === slug) {
          const sources = sourcesByClaim[claim.claim_id] || sourcesByClaim[claim.claimId] || [];
          for (const s of sources) {
            const title = s.title || s.citation || '';
            const pmid = s.pmid || parsePmid(s.url) || parsePmid(title);
            const key = pmid || title;
            if (key && !seen.has(key)) {
              seen.add(key);
              citations.push({ title, pmid, year: s.year, authors: s.authors || s.citation_label });
            }
          }
        }
      }
    }
    return citations;
  }

  const metadata = {
    homepage: {
      lastReviewed: '2026-06-06',
      citationCount: 0
    },
    goals: {},
    profiles: {}
  };

  const allUniqueStudies = [];
  const addUniqueStudy = (cit) => {
    const key = cit.pmid || cit.title;
    if (key && !allUniqueStudies.some(c => (cit.pmid && c.pmid === cit.pmid) || c.title === cit.title)) {
      allUniqueStudies.push(cit);
    }
  };

  // Compile Profile Freshness & Citations
  console.log('[freshness-metadata] Processing herbs...');
  for (const h of herbs) {
    const detailPath = path.join(DATA_DIR, 'herbs-detail', `${h.slug}.json`);
    let detail = {};
    if (fs.existsSync(detailPath)) {
      detail = JSON.parse(fs.readFileSync(detailPath, 'utf8'));
    }
    
    const merged = { ...h, ...detail };
    const recordCits = extractCitationsFromRecord(merged);
    const engineCits = getEngineCitationsForSlug(h.slug);
    const registryCits = studyRegistry[h.slug] || [];
    
    // Combine and deduplicate
    const combined = [...recordCits];
    const addList = [...engineCits, ...registryCits];
    for (const ec of addList) {
      if (!combined.some(c => (ec.pmid && c.pmid === ec.pmid) || (ec.title && c.title === ec.title))) {
        combined.push(ec);
      }
    }
    
    // Add to global list
    combined.forEach(addUniqueStudy);
    
    // Fallback date
    const lastReviewed = h.last_reviewed || h.last_updated || '2026-06-06';
    
    metadata.profiles[h.slug] = {
      lastReviewed,
      citationCount: combined.length
    };
  }

  console.log('[freshness-metadata] Processing compounds...');
  for (const c of compounds) {
    const detailPath = path.join(DATA_DIR, 'compounds-detail', `${c.slug}.json`);
    let detail = {};
    if (fs.existsSync(detailPath)) {
      detail = JSON.parse(fs.readFileSync(detailPath, 'utf8'));
    }
    
    const merged = { ...c, ...detail };
    const recordCits = extractCitationsFromRecord(merged);
    const engineCits = getEngineCitationsForSlug(c.slug);
    const registryCits = studyRegistry[c.slug] || [];
    
    // Combine and deduplicate
    const combined = [...recordCits];
    const addList = [...engineCits, ...registryCits];
    for (const ec of addList) {
      if (!combined.some(rc => (ec.pmid && rc.pmid === ec.pmid) || (ec.title && ec.title === ec.title))) {
        combined.push(ec);
      }
    }
    
    // Add to global list
    combined.forEach(addUniqueStudy);
    
    // Fallback date
    const lastReviewed = c.last_reviewed || c.last_updated || '2026-06-06';
    
    metadata.profiles[c.slug] = {
      lastReviewed,
      citationCount: combined.length
    };
  }

  // Compile Goal Pathway Freshness & Citations
  console.log('[freshness-metadata] Processing goals...');
  
  // Mapping of goals to Authority Freshness Registry dates
  const goalRegistryDates = {
    sleep: '2026-05-10',
    stress: '2026-05-10',
    anxiety: '2026-05-10',
    focus: '2026-05-10',
    recovery: '2026-05-10',
    longevity: '2026-05-10',
    cognition: '2026-05-10',
    inflammation: '2026-05-10',
    pain: '2026-05-10'
  };

  for (const goal of goalsConfig) {
    const goalCitations = [];
    const addGoalCitations = (cit) => {
      const key = cit.pmid || cit.title;
      if (key && !goalCitations.some(c => (cit.pmid && c.pmid === cit.pmid) || c.title === cit.title)) {
        goalCitations.push(cit);
      }
    };
    
    // 1. Add citations from the goal options
    for (const optSlug of goal.options) {
      // Find herb or compound detail
      let detail = {};
      const herbDetailPath = path.join(DATA_DIR, 'herbs-detail', `${optSlug}.json`);
      const compDetailPath = path.join(DATA_DIR, 'compounds-detail', `${optSlug}.json`);
      
      if (fs.existsSync(herbDetailPath)) {
        detail = JSON.parse(fs.readFileSync(herbDetailPath, 'utf8'));
      } else if (fs.existsSync(compDetailPath)) {
        detail = JSON.parse(fs.readFileSync(compDetailPath, 'utf8'));
      }
      
      const recordCits = extractCitationsFromRecord(detail);
      const registryCits = studyRegistry[optSlug] || [];
      const engineCits = getEngineCitationsForSlug(optSlug);
      
      [...recordCits, ...registryCits, ...engineCits].forEach(addGoalCitations);
    }
    
    // 2. Add citations from the goal's specific evidence engine sources
    const engine = engines[goal.slug];
    if (engine) {
      const sourcesByClaim = engine.sourcesByClaim || {};
      for (const sources of Object.values(sourcesByClaim)) {
        for (const s of sources) {
          const title = s.title || s.citation || '';
          const pmid = s.pmid || parsePmid(s.url) || parsePmid(title);
          addGoalCitations({ title, pmid, year: s.year, authors: s.authors });
        }
      }
    }
    
    const lastReviewed = goalRegistryDates[goal.slug] || '2026-06-06';
    metadata.goals[goal.slug] = {
      lastReviewed,
      citationCount: goalCitations.length
    };
  }

  // Set homepage stats
  metadata.homepage.citationCount = allUniqueStudies.length;
  
  // Write result to file
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(metadata, null, 2) + '\n', 'utf8');
  console.log(`[freshness-metadata] Successfully compiled and wrote freshness metadata to: ${OUTPUT_FILE}`);
  console.log(`[freshness-metadata] Homepage: ${metadata.homepage.lastReviewed} • ${metadata.homepage.citationCount} human studies cited`);
}

main().catch((error) => {
  console.error('[freshness-metadata] Compilation failed:', error);
  process.exit(1);
});
