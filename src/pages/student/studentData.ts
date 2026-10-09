// ---------------------------------------------------------------------------
// Local helpers shared by the student pages.
// (Kept inside the student folder — shared code is never modified.)
// ---------------------------------------------------------------------------

import { getDemoStudent, SUBJECTS_WITH_RISK } from '../../data/seed'
import {
  getStudentRiskPrediction,
  type PredictionInput,
} from '../../services/predictionService'
import { daysUntil } from '../../utils/format'
import type { Assessment, RiskPrediction, Student, Subject } from '../../types'

/** The logged-in demo student (STU-001 — Ananya Iyer). */
export const DEMO_STUDENT: Student = getDemoStudent()

/** The subject with the weakest combined attendance + marks profile. */
export function weakestSubject(): Subject {
  return [...SUBJECTS_WITH_RISK].sort(
    (a, b) => a.attendance + a.marks - (b.attendance + b.marks),
  )[0]
}

/** Prediction inputs for the demo student — identical on every page. */
export function demoPredictionInput(): PredictionInput {
  const s = DEMO_STUDENT
  return {
    attendance: s.attendance,
    previous_marks: s.previousMarks,
    internal_marks: s.internalMarks,
    quiz_scores: s.quizScore,
    assignment_completion: s.assignmentCompletion,
    learning_activity: s.learningActivity,
    weakSubject: weakestSubject().name,
    studentName: s.name,
  }
}

/** Deterministic demo prediction (mock service — same inputs → same output). */
export function demoPrediction(): RiskPrediction {
  return getStudentRiskPrediction(demoPredictionInput())
}

/** Shared preview prediction used across the student pages. */
export const DEMO_PREDICTION: RiskPrediction = demoPrediction()

export type BadgeTone =
  | 'default'
  | 'brand'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral'

/** Badge tone for an assessment status. */
export function statusTone(status: Assessment['status']): BadgeTone {
  switch (status) {
    case 'Completed':
      return 'success'
    case 'Overdue':
      return 'danger'
    case 'Pending':
      return 'warning'
    default:
      return 'info'
  }
}

/** Badge tone for a recommendation priority. */
export function priorityTone(priority: 'High' | 'Medium' | 'Low'): BadgeTone {
  if (priority === 'High') return 'danger'
  if (priority === 'Medium') return 'warning'
  return 'success'
}

/** Human readable due-date hint: "Due in 3d" / "2d overdue" / "Due today". */
export function dueLabel(iso: string): string {
  const d = daysUntil(iso)
  if (d < 0) return `${Math.abs(d)}d overdue`
  if (d === 0) return 'Due today'
  return `Due in ${d}d`
}
