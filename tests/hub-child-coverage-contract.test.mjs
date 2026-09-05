import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = readFileSync('scripts/ci/validate-hub-child-coverage.mjs', 'utf8');

describe('hub child coverage contract', () => {
  it('protects the ADHD hub alongside the existing governed hubs', () => {
    const hubsBlock = source.match(/const HUBS = \[[\s\S]*?\]/)?.[0] ?? '';

    expect(hubsBlock).toContain("'/guides/adhd'");
    expect(hubsBlock).toContain("'/guides/sleep'");
    expect(hubsBlock).toContain("'/guides/compare'");
    expect(hubsBlock).toContain("'/learn'");
    expect(hubsBlock).toContain("'/evidence/evidence-report'");
  });

  it('keeps the reachability gate scoped to indexable pages already advertised in the sitemap', () => {
    expect(source).toContain('if (!isIndexable(html)) continue');
    expect(source).toContain('if (!sitemap.includes(`${route}/`)) continue');
    expect(source).toContain('if (!hubHtml.includes(`href="${route}/"`)) failures.push');
  });
});
