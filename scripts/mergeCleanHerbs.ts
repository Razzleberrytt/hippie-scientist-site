import * as fs from 'fs/promises';
import * as path from 'path';
import { pathToFileURL } from 'url';
import 'ts-node/register/transpile-only';

async function listHerbFiles(): Promise<string[]> {
  const extras = await fs.readdir('newHerbs');
  return [
    'src/data/herbs/herbs.ts',
    'src/data/herbs/herbsfull.ts',
    'src/data/herbs/herbsData.ts',
    'src/data/herbs/herbs.json',
    ...extras.filter(f => f.endsWith('.ts') && !f.includes('newCompounds')).map(f => path.join('newHerbs', f)),
  ];
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

async function loadHerbFile(file: string): Promise<any[]> {
  if (file.endsWith('.json')) {
    const txt = await fs.readFile(file, 'utf8');
    return JSON.parse(txt);
  }
  const mod = await import(path.resolve(file));
  return (mod.newHerbs || mod.herbs || mod.herbsData || mod.default || []) as any[];
}

function normalize(entry: any): any {
  const map: Record<string, string> = {
    origin: 'region',
    source: 'region',
    effects_description: 'effects',
    effectsDescription: 'effects',
  };
  const out: any = {};
  for (const [k, v] of Object.entries(entry)) {
    const key = map[k] || k;
    out[key] = v;
  }
  if (!out.slug && out.name) out.slug = slugify(String(out.name));
  if (!out.id) out.id = out.slug;
  if (typeof out.effects === 'string') out.effects = out.effects.split(/[,;]/).map((s: string) => s.trim()).filter(Boolean);
  if (!Array.isArray(out.effects)) out.effects = out.effects ? [String(out.effects)] : [];
  if (out.tags != null && !Array.isArray(out.tags)) out.tags = String(out.tags).split(/[,;]/).map(s => s.trim()).filter(Boolean);
  if (out.activeCompounds != null && !Array.isArray(out.activeCompounds)) out.activeCompounds = String(out.activeCompounds).split(/[,;]/).map(s=>s.trim()).filter(Boolean);
  return out;
}

function countFields(obj: any): number {
  return Object.values(obj).filter(v => {
    if (Array.isArray(v)) return v.length > 0;
    return v !== null && v !== undefined && v !== '';
  }).length;
}

interface Conflict { slug: string; field: string; oldVal: any; newVal: any; }

async function main() {
  const herbFiles = await listHerbFiles();
  const all: any[] = [];
  for (const f of herbFiles) {
    try {
      const arr = await loadHerbFile(f);
      all.push(...arr);
    } catch (e) {
      console.error('Failed to load', f, e);
    }
  }

  const map = new Map<string, any>();
  const conflicts: Conflict[] = [];
  let enriched = 0;

  for (const raw of all) {
    if (!raw || !raw.name) continue;
    const h = normalize(raw);
    const key = String(h.slug);
    if (!map.has(key)) {
      map.set(key, h);
      continue;
    }
    const existing = map.get(key);
    const merged = { ...existing };
    for (const [k, v] of Object.entries(h)) {
      const cur = merged[k];
      if (cur == null || (Array.isArray(cur) ? cur.length === 0 : cur === '')) {
        merged[k] = v;
        enriched++;
      } else if (v != null && JSON.stringify(cur) !== JSON.stringify(v)) {
        conflicts.push({ slug: key, field: k, oldVal: cur, newVal: v });
      }
    }
    map.set(key, merged);
  }

  const result = Array.from(map.values()).map(h => {
    if (!h.region) { h.region = 'Unknown'; enriched++; }
    if (!h.legalStatus) { h.legalStatus = 'Unknown'; enriched++; }
    const fieldCount = countFields(h);
    if (fieldCount < 4 || h.effects.length === 0) {
      h.needsReview = true;
    }
    return h;
  }).sort((a,b)=>a.slug.localeCompare(b.slug));

  await fs.mkdir('cleanedData', { recursive: true });
  await fs.writeFile('cleanedData/herbs.json', JSON.stringify(result, null, 2));

  const headers = Array.from(new Set(result.flatMap(o => Object.keys(o))));
  const csvLines = [headers.join(',')];
  for (const h of result) {
    csvLines.push(headers.map(k => {
      const v = h[k];
      if (Array.isArray(v)) return '"'+v.join(';').replace(/"/g,'\"')+'"';
      if (v == null) return '';
      return '"'+String(v).replace(/"/g,'\"')+'"';
    }).join(','));
  }
  await fs.writeFile('cleanedData/herbs.csv', csvLines.join('\n'));

  const tsContent = `import type { Herb } from '../src/types';\nexport const herbs: Herb[] = ${JSON.stringify(result, null, 2)} as const;\nexport default herbs;\n`;
  await fs.writeFile('cleanedData/herbs.ts', tsContent);

  const summary = {
    totalUnique: result.length,
    enrichedCount: enriched,
    flaggedCount: result.filter(h => h.needsReview).length,
    conflicts
  };
  await fs.writeFile('cleanedData/summary.json', JSON.stringify(summary, null, 2));
}

main();
