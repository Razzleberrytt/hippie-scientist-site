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

const ratio = (numeratorValue, denominatorValue, overrides = {}) => deriveEfficiencyRatio({
  id: 'qualified-visits-per-asset',
  numerator: obs('qualified_visits', numeratorValue, 'attributable canonical-page visits'),
  denominator: obs('assets_produced', denominatorValue, 'validated distribution assets'),
  attributionBoundary: 'UTM-attributed visits only',
  exposure: obs('measured_views', 250, 'platform-reported measured views'),
  ...overrides,
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
    const result = evaluateMarginalScale({ current: ratio(70, 5), prior: ratio(100, 5), attributionReliable: true, qualityDebtRising: false });
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

const verifiedGuardrails = { attributionReliable: true, qualityDebtRising: false };
const evaluate = (current, prior, options = {}) => evaluateMarginalScale({ current, prior, ...verifiedGuardrails, ...options });

describe('scale eligibility release boundaries', () => {
  it('permits a comparable, sufficiently exposed qualified outcome with explicit guardrails', () => {
    expect(evaluate(ratio(120, 5), ratio(100, 5))).toEqual({
      decision: 'ELIGIBLE_TO_SCALE',
      reason: 'marginal efficiency sustained or improved; other release gates still apply',
      change: 0.2,
    });
  });

  it.each([
    {},
    { attributionReliable: true },
    { qualityDebtRising: false },
    { attributionReliable: 'true', qualityDebtRising: false },
    { attributionReliable: true, qualityDebtRising: null },
    { attributionReliable: UNKNOWN, qualityDebtRising: false },
  ])('waits when guardrail observations are omitted or unverified: %j', (guardrails) => {
    expect(evaluateMarginalScale({ current: ratio(120, 5), prior: ratio(100, 5), ...guardrails }).decision).toBe('WAIT');
  });

  it.each([{ attributionReliable: false }, { qualityDebtRising: true }])('keeps known adverse guardrails blocking despite missing values: %j', (guardrails) => {
    expect(evaluateMarginalScale({ current: ratio(UNKNOWN, 5), prior: ratio(100, 5), ...guardrails }).decision).toBe('STOP_OR_PIVOT');
  });

  it.each([
    { numerator: obs('email_signups', 120, 'attributable canonical-page visits') },
    { denominator: obs('engineering_hours', 5, 'validated distribution assets') },
    { numerator: obs('qualified_visits', 120, 'different visit definition') },
    { denominator: obs('assets_produced', 5, 'different asset definition') },
    { attributionBoundary: 'all visits, not attributable visits' },
  ])('refuses incompatible metric identity: %j', (overrides) => {
    expect(evaluate(ratio(120, 5, overrides), ratio(100, 5)).decision).toBe('WAIT');
  });

  it('refuses cross-campaign or cross-platform pooling', () => {
    const changeScope = (observation) => ({ ...observation, scope: 'distribution:other-platform' });
    const original = ratio(120, 5);
    const other = ratio(120, 5, {
      numerator: changeScope(original.numerator),
      denominator: changeScope(original.denominator),
      exposure: changeScope(original.exposure),
    });
    expect(evaluate(other, ratio(100, 5)).decision).toBe('WAIT');
  });

  it('allows different periods of equal length but refuses unequal observation durations', () => {
    const withWindow = (window) => {
      const original = ratio(100, 5);
      return deriveEfficiencyRatio({ ...original,
        numerator: { ...original.numerator, window },
        denominator: { ...original.denominator, window },
        exposure: { ...original.exposure, window },
      });
    };
    expect(evaluate(ratio(120, 5), withWindow({ start: '2026-07-01', end: '2026-07-28' })).decision).toBe('ELIGIBLE_TO_SCALE');
    expect(evaluate(ratio(120, 5), withWindow({ start: '2026-07-01', end: '2026-07-10' })).decision).toBe('WAIT');
  });

  it.each([0, 1, 249, UNKNOWN])('withholds eligibility below measured-view threshold: %s', (views) => {
    const low = ratio(120, 5, { exposure: obs('measured_views', views, 'platform-reported measured views') });
    expect(evaluate(low, ratio(100, 5)).decision).toBe('WAIT');
    expect(evaluate(ratio(120, 5), low).decision).toBe('WAIT');
  });

  it('waits when exposure is missing or confidence is Unknown', () => {
    expect(evaluate(ratio(120, 5, { exposure: null }), ratio(100, 5)).decision).toBe('WAIT');
    expect(evaluate(ratio(120, 5), ratio(100, 5, { exposure: null })).decision).toBe('WAIT');
    const exposure = { ...obs('measured_views', 250, 'measured views'), confidence: UNKNOWN };
    expect(evaluate(ratio(120, 5, { exposure }), ratio(100, 5)).decision).toBe('WAIT');
  });

  it.each([
    { scope: 'distribution:other' },
    { window: { start: '2026-08-02', end: '2026-08-28' } },
    { source: '' },
    { value: 250.5 },
    { value: -1 },
  ])('rejects unbound or malformed exposure receipts: %j', (overrides) => {
    const exposure = { ...obs('measured_views', 250, 'measured views'), ...overrides };
    expect(() => ratio(120, 5, { exposure })).toThrow();
  });

  it('retains CI throughput diagnostics without granting scale eligibility', () => {
    const throughput = (value) => ratio(120, 5, {
      numerator: obs('merged_changes', value, 'merged PRs'),
      denominator: obs('ci_runner_minutes', 5, 'hosted runner minutes'),
    });
    expect(throughput(10).value).toBe(2);
    expect(evaluate(throughput(10), throughput(5)).decision).toBe('WAIT');
  });

  it('does not grant eligibility from estimated or forged derived values', () => {
    expect(evaluate(ratio(120, 5, { estimate: true }), ratio(100, 5)).decision).toBe('WAIT');
    expect(evaluate({ ...ratio(70, 5), value: 999 }, ratio(100, 5)).decision).toBe('STOP_OR_PIVOT');
  });

  it.each([NaN, Infinity, -0.1, 0, 1.1])('rejects invalid deterioration threshold: %s', (deteriorationThreshold) => {
    expect(() => evaluate(ratio(120, 5), ratio(100, 5), { deteriorationThreshold })).toThrow(/deteriorationThreshold/);
  });

  it('rejects invalid or reversed observation windows', () => {
    for (const window of [{ start: 'not-a-date', end: '2026-08-28' }, { start: '2026-08-28', end: '2026-08-01' }]) {
      expect(() => ratio(120, 5, { numerator: { ...obs('qualified_visits', 120, 'visits'), window } })).toThrow(/window/);
    }
  });

  it('rejects mismatched numerator and denominator windows', () => {
    const denominator = { ...obs('assets_produced', 5, 'assets'), window: { start: '2026-08-02', end: '2026-08-28' } };
    expect(() => ratio(120, 5, { denominator })).toThrow(/windows must match/);
  });

  it('waits for a zero denominator or baseline', () => {
    expect(evaluate(ratio(120, 0), ratio(100, 5)).decision).toBe('WAIT');
    expect(evaluate(ratio(120, 5), ratio(0, 5)).decision).toBe('WAIT');
  });
});
