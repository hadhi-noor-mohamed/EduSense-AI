// ---------------------------------------------------------------------------
// EduSense AI — Mock prediction service
//
// PROTOTYPE NOTE -----------------------------------------------------------
// This is a DEMO / MOCK ML service running entirely in the browser. It uses a
// transparent, deterministic scoring formula so that risk predictions and
// explainability output can be demonstrated without a backend.
//
// It is NOT a trained model and does NOT report real accuracy metrics.
//
// The interface below is intentionally shaped like a future REST call so the
// UI can later be switched to `POST /api/predict` without any page rewrites.
// ---------------------------------------------------------------------------

import type {
  ContributingFactor,
  Recommendation,
  RiskLevel,
  RiskPrediction,
} from '../types'
import { clamp } from '../utils/format'
import { generateRecommendations } from './recommendationService'

export interface PredictionInput {
  /** 0-100 */
  attendance: number
  /** 0-100 previous semester aggregate */
  previous_marks: number
  /** 0-100 internal assessment aggregate */
  internal_marks: number
  /** 0-100 quiz average */
  quiz_scores: number
  /** 0-100 percentage of assignments completed */
  assignment_completion: number
  /** learning activity in hours per week */
  learning_activity: number
  /** Optional: used to attach a relevant subject to each recommendation */
  weakSubject?: string
  studentName?: string
}

/** Healthy reference thresholds used by the demo scoring engine. */
const BENCHMARK: Record<keyof Omit<PredictionInput, 'weakSubject' | 'studentName'>, number> = {
  attendance: 85,
  previous_marks: 75,
  internal_marks: 75,
  quiz_scores: 75,
  assignment_completion: 90,
  learning_activity: 8,
}

/** Relative importance of each input in the demo risk model. */
const WEIGHT: Record<keyof typeof BENCHMARK, number> = {
  attendance: 2.6,
  previous_marks: 1.1,
  internal_marks: 1.5,
  quiz_scores: 1.3,
  assignment_completion: 1.3,
  learning_activity: 0.35,
}

/** Sensitivity curve of the demo score: 1 - e^(-k · shortfallRatio^p). */
const SCORE_K = 3.755
const SCORE_P = 0.7

export const FACTOR_LABEL: Record<keyof typeof BENCHMARK, string> = {
  attendance: 'Attendance',
  previous_marks: 'Previous Semester Marks',
  internal_marks: 'Internal Assessment',
  quiz_scores: 'Quiz Performance',
  assignment_completion: 'Assignment Completion',
  learning_activity: 'Learning Activity',
}

const FACTOR_DETAIL: Record<keyof typeof BENCHMARK, string> = {
  attendance: 'Class attendance rate',
  previous_marks: 'Last semester aggregate',
  internal_marks: 'Internal assessment average',
  quiz_scores: 'Continuous quiz average',
  assignment_completion: 'Assignments submitted on time',
  learning_activity: 'Self-study hours per week',
}

type MetricKey = keyof typeof BENCHMARK

function metricsOf(input: PredictionInput): Record<MetricKey, number> {
  return {
    attendance: clamp(input.attendance, 0, 100),
    previous_marks: clamp(input.previous_marks, 0, 100),
    internal_marks: clamp(input.internal_marks, 0, 100),
    quiz_scores: clamp(input.quiz_scores, 0, 100),
    assignment_completion: clamp(input.assignment_completion, 0, 100),
    // hours/week → 0-100 scale (8h/week = 100)
    learning_activity: clamp((input.learning_activity / BENCHMARK.learning_activity) * 100, 0, 100),
  }
}

export function riskLevelFor(score: number): RiskLevel {
  if (score >= 65) return 'High'
  if (score >= 40) return 'Medium'
  return 'Low'
}

/** Weighted shortfall ratio: 0 = meets every benchmark, 1 = meets nothing. */
function shortfallRatio(metrics: Record<MetricKey, number>): number {
  let shortfall = 0
  let total = 0
  for (const key of Object.keys(BENCHMARK) as MetricKey[]) {
    const target = key === 'learning_activity' ? 100 : BENCHMARK[key]
    shortfall += Math.max(0, target - metrics[key]) * WEIGHT[key]
    total += target * WEIGHT[key]
  }
  return total === 0 ? 0 : shortfall / total
}

/**
 * Produces a full demo prediction: risk level, risk score, explainability
 * factors and personalised recommendations.
 */
export function getStudentRiskPrediction(studentData: PredictionInput): RiskPrediction {
  const metrics = metricsOf(studentData)
  const ratio = shortfallRatio(metrics)

  // Saturation curve keeps scores between 0-100 while staying sensitive in the
  // range where early-warning interventions actually matter.
  const risk_score = clamp(
    Math.round(100 * (1 - Math.exp(-SCORE_K * Math.pow(ratio, SCORE_P)))),
    3,
    97,
  )
  const risk_level = riskLevelFor(risk_score)

  const contributing_factors = explainFactors(metrics)
  const recommendations = generateRecommendations(studentData, contributing_factors)

  return {
    risk_level,
    risk_score,
    contributing_factors,
    recommendations,
    summary: buildSummary(risk_level, contributing_factors, studentData),
    isMock: true,
  }
}

function explainFactors(metrics: Record<MetricKey, number>): ContributingFactor[] {
  const keys = Object.keys(BENCHMARK) as MetricKey[]
  const totalWeight = keys.reduce((s, k) => s + WEIGHT[k], 0)

  const raw = keys.map((key) => {
    const target = key === 'learning_activity' ? 100 : BENCHMARK[key]
    const value = metrics[key]
    const shortfall = Math.max(0, target - value) * WEIGHT[key]
    return { key, value, target, shortfall }
  })

  const totalShortfall = raw.reduce((s, r) => s + r.shortfall, 0)
  const atBenchmark = totalShortfall === 0

  // Exact (un-rounded) share of risk attributable to each input.
  const shares = raw.map((r) => ({
    ...r,
    share: atBenchmark
      ? (WEIGHT[r.key] / totalWeight) * 100
      : (r.shortfall / totalShortfall) * 100,
  }))

  shares.sort((a, b) => b.share - a.share)

  // The explainability panel surfaces the four strongest signals, rescaled so
  // they read as a clean 100% breakdown.
  const top = shares.slice(0, 4)
  const topSum = top.reduce((s, f) => s + f.share, 0) || 1

  let running = 0
  const factors: ContributingFactor[] = top.map((r, idx) => {
    const contribution =
      idx === top.length - 1
        ? 100 - running
        : Math.round((r.share / topSum) * 100)
    running += contribution

    const benchmarkLabel =
      r.key === 'learning_activity'
        ? `${BENCHMARK.learning_activity} hrs/week target`
        : `${r.target}% target`

    return {
      name: FACTOR_LABEL[r.key],
      contribution,
      detail: atBenchmark
        ? `${FACTOR_DETAIL[r.key]} — currently meets the ${benchmarkLabel}`
        : `${FACTOR_DETAIL[r.key]} — ${Math.round(r.value)} vs ${benchmarkLabel}`,
      raw: {
        factor: FACTOR_LABEL[r.key],
        value: Math.round(r.value),
        benchmark: r.target,
      },
    }
  })

  return factors
}

function buildSummary(
  level: RiskLevel,
  factors: ContributingFactor[],
  input: PredictionInput,
): string {
  if (level === 'Low') {
    return `Your demo risk score is low. ${factors[0]?.name ?? 'Core metrics'} is the factor closest to its benchmark — keep sustaining it.`
  }
  const names = factors.slice(0, 2).map((f) => f.name.toLowerCase())
  const subject = input.weakSubject ? ` in ${input.weakSubject}` : ''
  if (level === 'High') {
    return `Your current risk level is mainly driven by ${names[0]} and ${names[1]}${subject}. Addressing these two factors first will reduce your projected risk fastest.`
  }
  return `Your predicted risk is moderate, with ${names[0]} contributing the most${subject}. Small, consistent improvements should move you into the low-risk band.`
}

// The future backend contract this service will be swapped for:
//   POST /api/predict
//   body: { attendance, previous_marks, internal_marks, quiz_scores,
//           assignment_completion, learning_activity }
//   resp : { risk_level, risk_score, contributing_factors, recommendations }
export const PREDICTION_API_CONTRACT = {
  endpoint: 'POST /api/predict',
  input: Object.keys(BENCHMARK),
  output: ['risk_level', 'risk_score', 'contributing_factors', 'recommendations'],
  status: 'mock',
} as const

export type { Recommendation }
