import { describe, expect, it } from 'vitest';
import { deriveEfficiencyRatio, evaluateMarginalScale, UNKNOWN } from '../scripts/measurement/marginal-economics.mjs';

const obs = (type, value, definition) => ({
  type,
  value,
  source: 'fixture:authoritative-observation',
  scope: 'distribution:ashwagandha',
  window: { start: '2026-08-01', end: '2026-08-28' },
  definition,
  confidence: 'high',
});

const ratio = (numeratorValue, denominatorValue) => deriveEfficiencyRatio({
  id: 'qualified-visits-per-asset',
  numerator: obs('qualified_visits', numeratorValue, 'attributable canonical-page visits'),
  denominator: obs('assets_produced', denominatorValue, 'validated distribution assets'),
  attributionBoundary: 'UTM-attributed visits only',
});

describe('marginal outcome-per-effort economics', () => {
  it('computes a reproducible ratio from named aligned observations', () => {
    const result = ratio(120, 6);
    expect(result.value).toBe(20);
    expect(result.unit).toBe('qualified_visits_per_assets_produced');
    expect(result.scaleSignal).toBe('OBSERVED');
  });

  it('keeps missing observations Unknown instead of coercing them to zero', () => {
    expect(ratio(UNKNOWN, 6).value).toBe(UNKNOWN);
    expect(ratio(120, UNKNOWN).scaleSignal).toBe('WAIT');
  });

  it('refuses mismatched scopes/windows', () => {
    const denominator = { ...obs('assets_produced', 3, 'assets'), scope: 'distribution:other' };
    expect(() => deriveEfficiencyRatio({
      id: 'bad',
      numerator: obs('qualified_visits', 9, 'visits'),
      denominator,
      attributionBoundary: 'same campaign',
    })).toThrow(/scopes must match/);
  });

  it('stops scaling when marginal efficiency materially deteriorates', () => {
    const result = evaluateMarginalScale({ current: ratio(70, 5), prior: ratio(100, 5) });
    expect(result.decision).toBe('STOP_OR_PIVOT');
  });

  it('stops scaling when quality debt rises or attribution becomes unreliable', () => {
    const current = ratio(120, 5);
    const prior = ratio(100, 5);
    expect(evaluateMarginalScale({ current, prior, qualityDebtRising: true }).decision).toBe('STOP_OR_PIVOT');
    expect(evaluateMarginalScale({ current, prior, attributionReliable: false }).decision).toBe('STOP_OR_PIVOT');
  });

  it('waits instead of guessing when comparison data is unavailable', () => {
    expect(evaluateMarginalScale({ current: ratio(UNKNOWN, 5), prior: ratio(100, 5) }).decision).toBe('WAIT');
  });
});
