import { MIN_PERFORMANCE_REWARD_VIEWS } from '../distribution/opportunity-feedback.mjs';

const UNKNOWN = 'Unknown';

const ALLOWED_DENOMINATORS = new Set([
  'engineering_hours',
  'operator_hours',
  'ci_runner_minutes',
  'assets_produced',
  'maintained_surfaces',
  'external_tool_spend',
  'incremental_throughput',
]);

const ALLOWED_OUTCOMES = new Set([
  'qualified_visits',
  'deep_evidence_interactions',
  'affiliate_outbound_actions',
  'email_signups',
  'network_reported_orders',
  'network_reported_revenue',
  'governed_distribution_outcomes',
  'merged_changes',
]);

function requireText(value, field) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${field} is required`);
  return value.trim();
}

function normalizeObservation(observation, role, allowedTypes) {
  if (!observation || typeof observation !== 'object') throw new Error(`${role} observation is required`);
  const type = requireText(observation.type, `${role}.type`);
  if (!allowedTypes.has(type)) throw new Error(`unsupported ${role} type: ${type}`);
  const source = requireText(observation.source, `${role}.source`);
  const scope = requireText(observation.scope, `${role}.scope`);
  const windowStart = requireText(observation.window?.start, `${role}.window.start`);
  const windowEnd = requireText(observation.window?.end, `${role}.window.end`);
  if (!Number.isFinite(Date.parse(windowStart)) || !Number.isFinite(Date.parse(windowEnd)) || Date.parse(windowEnd) < Date.parse(windowStart)) {
    throw new Error(`${role}.window must contain valid ordered dates`);
  }
  const definition = requireText(observation.definition, `${role}.definition`);
  const confidence = requireText(observation.confidence, `${role}.confidence`);

  if (observation.value === UNKNOWN || observation.value == null) {
    return { type, value: UNKNOWN, source, scope, window: { start: windowStart, end: windowEnd }, definition, confidence };
  }
  if (typeof observation.value !== 'number' || !Number.isFinite(observation.value) || observation.value < 0) {
    throw new Error(`${role}.value must be a non-negative finite number or Unknown`);
  }
  return { type, value: observation.value, source, scope, window: { start: windowStart, end: windowEnd }, definition, confidence };
}

export function deriveEfficiencyRatio({ id, numerator, denominator, attributionBoundary, estimate = false, exposure }) {
  const normalizedNumerator = normalizeObservation(numerator, 'numerator', ALLOWED_OUTCOMES);
  const normalizedDenominator = normalizeObservation(denominator, 'denominator', ALLOWED_DENOMINATORS);
  const ratioId = requireText(id, 'id');
  const boundary = requireText(attributionBoundary, 'attributionBoundary');

  if (normalizedNumerator.scope !== normalizedDenominator.scope) {
    throw new Error('numerator and denominator scopes must match');
  }
  if (normalizedNumerator.window.start !== normalizedDenominator.window.start || normalizedNumerator.window.end !== normalizedDenominator.window.end) {
    throw new Error('numerator and denominator observation windows must match');
  }

  const normalizedExposure = exposure == null ? null : normalizeObservation(exposure, 'exposure', new Set(['measured_views']));
  if (normalizedExposure) {
    if (normalizedExposure.scope !== normalizedNumerator.scope
      || normalizedExposure.window.start !== normalizedNumerator.window.start
      || normalizedExposure.window.end !== normalizedNumerator.window.end) {
      throw new Error('exposure scope and window must match the ratio');
    }
    if (normalizedExposure.value !== UNKNOWN && !Number.isSafeInteger(normalizedExposure.value)) {
      throw new Error('exposure.value must be an integer view count or Unknown');
    }
  }

  const unknown = normalizedNumerator.value === UNKNOWN || normalizedDenominator.value === UNKNOWN;
  const zeroDenominator = normalizedDenominator.value === 0;
  const value = unknown || zeroDenominator ? UNKNOWN : normalizedNumerator.value / normalizedDenominator.value;

  return Object.freeze({
    schemaVersion: '1.0.0',
    id: ratioId,
    numerator: normalizedNumerator,
    denominator: normalizedDenominator,
    value,
    unit: `${normalizedNumerator.type}_per_${normalizedDenominator.type}`,
    attributionBoundary: boundary,
    estimate: Boolean(estimate),
    exposure: normalizedExposure,
    scaleSignal: value === UNKNOWN ? 'WAIT' : 'OBSERVED',
  });
}

export function evaluateMarginalScale({ current, prior, deteriorationThreshold = 0.15, qualityDebtRising, attributionReliable }) {
  if (!current || !prior) throw new Error('current and prior ratios are required');
  if (!Number.isFinite(deteriorationThreshold) || deteriorationThreshold <= 0 || deteriorationThreshold > 1) {
    throw new Error('deteriorationThreshold must be greater than zero and at most one');
  }
  // Known adverse guardrails stop scaling even when outcome observations are missing.
  if (attributionReliable === false) return { decision: 'STOP_OR_PIVOT', reason: 'attribution unreliable' };
  if (qualityDebtRising === true) return { decision: 'STOP_OR_PIVOT', reason: 'quality or maintenance debt rising' };
  if (attributionReliable !== true || qualityDebtRising !== false) {
    return { decision: 'WAIT', reason: 'explicit attribution and quality-debt observations required' };
  }

  // Recompute from named observations; a caller-supplied value/unit is not authority.
  current = deriveEfficiencyRatio(current);
  prior = deriveEfficiencyRatio(prior);
  const sameMetric = ['numerator', 'denominator'].every((role) =>
    ['type', 'scope', 'definition'].every((field) => current[role][field] === prior[role][field]));
  const duration = (ratio) => Date.parse(ratio.numerator.window.end) - Date.parse(ratio.numerator.window.start);
  if (!sameMetric || current.attributionBoundary !== prior.attributionBoundary || duration(current) !== duration(prior)) {
    return { decision: 'WAIT', reason: 'incompatible metric, scope, definition, attribution boundary, or window duration' };
  }
  if (current.numerator.type === 'merged_changes') {
    return { decision: 'WAIT', reason: 'operational throughput is diagnostic, not a qualified user outcome' };
  }
  if (current.estimate || prior.estimate) {
    return { decision: 'WAIT', reason: 'estimates cannot authorize scaling' };
  }
  if (!Number.isFinite(current.value) || !Number.isFinite(prior.value) || prior.value === 0) {
    return { decision: 'WAIT', reason: 'insufficient comparable observations' };
  }
  // Positive eligibility currently requires source-bound distribution exposure in both periods.
  // Other efficiency ratios remain useful diagnostics, not permission to scale.
  if ([current, prior].some((ratio) => !Number.isSafeInteger(ratio.exposure?.value)
    || ratio.exposure.value < MIN_PERFORMANCE_REWARD_VIEWS
    || [ratio.numerator, ratio.denominator, ratio.exposure].some((observation) => observation.confidence.toLowerCase() === 'unknown'))) {
    return { decision: 'WAIT', reason: 'sufficient observed exposure required in both comparison periods' };
  }
  const change = (current.value - prior.value) / prior.value;
  if (!Number.isFinite(change)) return { decision: 'WAIT', reason: 'insufficient comparable observations' };
  if (change <= -deteriorationThreshold) {
    return { decision: 'STOP_OR_PIVOT', reason: 'marginal qualified outcome deteriorated materially', change };
  }
  return { decision: 'ELIGIBLE_TO_SCALE', reason: 'marginal efficiency sustained or improved; other release gates still apply', change };
}

export { UNKNOWN, ALLOWED_DENOMINATORS, ALLOWED_OUTCOMES };
