import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const workflow = readFileSync('.github/workflows/maintenance-cadence.yml', 'utf8');

const resilientObservabilitySteps = [
  'Citation-health check',
  'Search Console opportunity report',
  'AI citation-readiness topology',
  'AI citation telemetry',
  'AI source-gap and competitor citation audit',
  'AI SEO action priority',
  'Upload weekly reports',
];

const failClosedQualitySteps = [
  ['Broken-link check', ['npm run audit:links']],
  ['Content-integrity check', ['npm run audit:content', 'npm run gate:content-quality']],
  ['Sitemap checks', ['npm run audit:sitemap', 'npm run seo:audit-sitemap']],
];

function stepBlock(stepName) {
  const escaped = stepName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return workflow.match(new RegExp(`- name: ${escaped}[\\s\\S]*?(?=\\n\\s+- name:)`))?.[0] ?? '';
}

describe('weekly maintenance observability execution', () => {
  it('gives dependency installation a stable outcome id', () => {
    expect(stepBlock('Install dependencies')).toMatch(/id: dependencies/);
  });

  it.each(resilientObservabilitySteps)(
    '%s survives quality failures but not a broken dependency substrate',
    (stepName) => {
      const block = stepBlock(stepName);
      expect(block).toContain("if: ${{ always() && steps.dependencies.outcome == 'success' }}");
      expect(block).not.toContain('continue-on-error');
    },
  );

  it.each(failClosedQualitySteps)('%s remains fail-closed', (stepName, requiredCommands) => {
    const block = stepBlock(stepName);
    expect(block).not.toContain('if: always()');
    expect(block).not.toContain('continue-on-error');
    for (const command of requiredCommands) expect(block).toContain(command);
  });
});
