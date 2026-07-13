// Derives interaction tags + additive-risk edges from the herb monograph workbook.
// Faithful port of generate_interaction_edges.py. Deterministic / idempotent.
// Usage in pipeline: import { deriveInteractionData } and feed it Entity_Master rows,
//   OR run standalone: node build_interaction_data.mjs <workbook.xlsx> <outDir>
import { readFileSync } from 'node:fs';
import { writeFileSync } from 'node:fs';

const KEYWORDS = {
  serotonergic:      ['seroton','ssri','snri','maoi'],
  anticoagulant:     ['anticoagul','antiplatelet','bleeding','pre-surgery','surgery'],
  cns_sedation:      ['sedat','cns depress','drowsi'],
  blood_glucose:     ['glucose','hypoglyc','diabet'],
  blood_pressure:    ['hypotens','hypertens','blood pressure'],
  hepatic:           ['hepat','liver'],
  immunosuppressant: ['immunosuppress'],
  renal:             ['kidney','renal'],
  pregnancy:         ['pregnan','breastfeed','lactation'],
  allergy:           ['allerg'],
  thyroid:           ['thyroid'],
};
const ADDITIVE = new Set(['serotonergic','anticoagulant','cns_sedation','blood_glucose','blood_pressure']);
const SEVERITY = { serotonergic:['severe',90], anticoagulant:['severe',90],
  cns_sedation:['moderate',60], blood_glucose:['moderate',60], blood_pressure:['moderate',60] };
const PLAIN = { serotonergic:'serotonergic activity', anticoagulant:'effects on bleeding/clotting',
  cns_sedation:'sedation / CNS depression', blood_glucose:'blood-sugar lowering', blood_pressure:'blood-pressure effects' };

const splitFlags = v => (v == null ? [] : String(v).split(/[;,]/).map(s => s.trim()).filter(Boolean));

export function deriveInteractionData(rows) {
  const tagSet = new Set();        // dedupe on full tuple, like pandas drop_duplicates
  const tags = [];
  const entMech = new Map();       // slug -> Set(additive mechanisms)
  const nameBySlug = new Map();

  for (const r of rows) {
    const slug = r.slug, name = r.name;
    nameBySlug.set(slug, name);
    for (const phrase of splitFlags(r.contraindications_or_flags)) {
      const pl = phrase.toLowerCase();
      for (const [mech, keys] of Object.entries(KEYWORDS)) {
        if (keys.some(k => pl.includes(k))) {
          const beh = ADDITIVE.has(mech) ? 'additive' : 'single_only';
          const key = [slug, mech, beh, phrase].join('\u0001');
          if (!tagSet.has(key)) {
            tagSet.add(key);
            tags.push({ entity_slug: slug, entity_name: name, risk_mechanism: mech,
                        pair_behavior: beh, matched_text: phrase, confidence: 'high' });
          }
          if (ADDITIVE.has(mech)) {
            if (!entMech.has(slug)) entMech.set(slug, new Set());
            entMech.get(slug).add(mech);
          }
        }
      }
    }
  }

  const byMech = {};
  for (const [slug, mechs] of entMech) for (const m of mechs) (byMech[m] ??= []).push(slug);

  const edges = [];
  for (const mech of ADDITIVE) {
    const [sev, wt] = SEVERITY[mech];
    const slugs = (byMech[mech] || []).slice().sort();
    for (let i = 0; i < slugs.length; i++)
      for (let j = i + 1; j < slugs.length; j++) {
        const [s, t] = [slugs[i], slugs[j]].sort();
        const shared = [...new Set([...entMech.get(s)].filter(x => entMech.get(t).has(x)))].sort();
        const note = shared.length < 2 ? '' : 'pair also shares: ' + shared.filter(x => x !== mech).join(', ');
        const claim = `Both ${nameBySlug.get(s)} and ${nameBySlug.get(t)} are flagged for ${PLAIN[mech]}. `
          + `Combining them may have an additive effect. This is a mechanistic caution, not a verified `
          + `interaction — consult a clinician before stacking.`;
        edges.push({ source_slug: s, target_slug: t, source_name: nameBySlug.get(s), target_name: nameBySlug.get(t),
          relationship_type: 'additive_risk', risk_mechanism: mech, severity: sev,
          weight_or_strength: wt, confidence: 'high', claim_language: claim, notes: note });
      }
  }
  edges.sort((a, b) => a.source_slug.localeCompare(b.source_slug)
    || a.target_slug.localeCompare(b.target_slug) || a.risk_mechanism.localeCompare(b.risk_mechanism));

  // slug-keyed lookups for O(1) detail-page access (each edge indexed under both ends)
  const edgesBySlug = {}, tagsBySlug = {};
  for (const e of edges) {
    (edgesBySlug[e.source_slug] ??= []).push({ partner_slug: e.target_slug, partner_name: e.target_name,
      risk_mechanism: e.risk_mechanism, severity: e.severity, weight: e.weight_or_strength, claim_language: e.claim_language, notes: e.notes });
    (edgesBySlug[e.target_slug] ??= []).push({ partner_slug: e.source_slug, partner_name: e.source_name,
      risk_mechanism: e.risk_mechanism, severity: e.severity, weight: e.weight_or_strength, claim_language: e.claim_language, notes: e.notes });
  }
  for (const tg of tags) (tagsBySlug[tg.entity_slug] ??= []).push({ risk_mechanism: tg.risk_mechanism,
    pair_behavior: tg.pair_behavior, matched_text: tg.matched_text, confidence: tg.confidence });

  return { edges, tags, edgesBySlug, tagsBySlug };
}

export function validate({ edges, tags }) {
  const errors = [];
  if (edges.length !== 9886) errors.push(`edge rows ${edges.length} != 9886`);
  if (tags.length !== 1169)  errors.push(`risk-tag rows ${tags.length} != 1169`);
  if (edges.some(e => !e.claim_language)) errors.push('empty claim_language present');
  const byMech = {};
  for (const e of edges) byMech[e.risk_mechanism] = (byMech[e.risk_mechanism] || 0) + 1;
  if (errors.length) { errors.forEach(e => console.error('VALIDATION FAIL:', e)); process.exit(1); }
  console.log('VALIDATION OK — edges:', edges.length, '| tags:', tags.length);
  console.log('per-mechanism:', byMech);
}

// standalone runner
if (import.meta.url === `file://${process.argv[1]}`) {
  const [,, wbPath = 'herb_monograph_master.xlsx', outDir = '.'] = process.argv;
  const XLSX = await import('xlsx');
  const wb = XLSX.read(readFileSync(wbPath), { type: 'buffer' });
  const rows = XLSX.utils.sheet_to_json(wb.Sheets['Entity_Master'], { defval: null });
  const data = deriveInteractionData(rows);
  validate(data);
  writeFileSync(`${outDir}/interaction_edges.json`, JSON.stringify(data.edgesBySlug, null, 0));
  writeFileSync(`${outDir}/entity_risk_tags.json`, JSON.stringify(data.tagsBySlug, null, 0));
  console.log('wrote interaction_edges.json + entity_risk_tags.json to', outDir);
}
