import fs from 'fs';
import { getRuntimeVisibility } from '../lib/runtime-visibility.ts';

const compounds = JSON.parse(fs.readFileSync('public/data/compounds-summary.json', 'utf8'));

const targets = ['caffeine', 'l-theanine', 'creatine', 'ashwagandha'];

targets.forEach(slug => {
  const c = compounds.find(x => x.slug === slug);
  if (!c) {
    console.log(`\nCompound "${slug}" not found in summary index.`);
    return;
  }
  
  console.log(`\n--- Debug compound: ${slug} ---`);
  console.log("runtime_export_decision:", c.runtime_export_decision);
  console.log("profile_status:", c.profile_status);
  console.log("summary_quality:", c.summary_quality);
  console.log("evidence_tier:", c.evidence_tier);
  console.log("sitemap_included:", c.sitemap_included);
  console.log("robots:", c.robots);
  console.log("indexability_status:", c.indexability_status);
  console.log("primary_effects:", c.primary_effects);
  
  const vis = getRuntimeVisibility(c);
  console.log("getRuntimeVisibility results:", vis);
});
