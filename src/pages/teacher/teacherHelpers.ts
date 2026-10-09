// ---------------------------------------------------------------------------
// Local helpers shared by the teacher pages.
// (Kept inside the teacher folder per the page-authoring contract.)
// ---------------------------------------------------------------------------

import type { Assessment, InterventionStatus, Student } from '../../types'
import { daysUntil } from '../../utils/format'

/** Badge tone keys — mirrors the `Badge` component's `tone` union. */
export type BadgeTone =
  | 'default'
  | 'brand'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral'

const DEPT_SHORT: Record<string, string> = {
  'Computer Science & Engineering': 'CSE',
  'Information Technology': 'IT',
  'Electronics & Communication': 'ECE',
  'Mechanical Engineering': 'ME',
  'Civil Engineering': 'CE',
  'Artificial Intelligence & Data Science': 'AI & DS',
}

/** Compact, axis-friendly label for a department name. */
export function shortDept(name: string): string {
  return DEPT_SHORT[name] ?? name
}

const SUBJECT_SHORT: Record<string, string> = {
  'Machine Learning': 'ML',
  'Computer Networks': 'Networks',
  'Cyber Security': 'Cyber Sec.',
  'Data Structures': 'Data Str.',
  'Database Management': 'DBMS',
  'Software Engineering': 'Soft. Eng.',
}

/** Compact, axis-friendly label for a subject name. */
export function shortSubject(name: string): string {
  return SUBJECT_SHORT[name] ?? name
}

/** Safe integer percentage of `part` against `total` (0 when total is 0). */
export function pctOf(part: number, total: number): number {
  if (!total) return 0
  return Math.round((part / total) * 100)
}

/** Rounded mean of a numeric list (0 for an empty list). */
export function avgOf(values: number[]): number {
  if (values.length === 0) return 0
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length)
}

export interface RiskCounts {
  High: number
  Medium: number
  Low: number
}

/** High / Medium / Low head-count for a list of students. */
export function riskCounts(students: Student[]): RiskCounts {
  const counts: RiskCounts = { High: 0, Medium: 0, Low: 0 }
  for (const s of students) counts[s.risk] += 1
  return counts
}

/** Human label for a follow-up date, e.g. `Overdue by 3d`, `in 4 days`. */
export function followUpLabel(iso: string): string {
  const d = daysUntil(iso)
  if (d < 0) return `Overdue by ${Math.abs(d)}d`
  if (d === 0) return 'Due today'
  return `in ${d} day${d === 1 ? '' : 's'}`
}

/** True when a date (follow-up / due) is in the past. */
export function isOverdue(iso: string): boolean {
  return daysUntil(iso) < 0
}

/** Badge tone for an intervention status. */
export function interventionTone(status: InterventionStatus): BadgeTone {
  if (status === 'Completed') return 'success'
  if (status === 'In Progress') return 'info'
  return 'warning'
}

/** Badge tone for an assessment status. */
export function assessmentTone(status: Assessment['status']): BadgeTone {
  if (status === 'Completed') return 'success'
  if (status === 'Overdue') return 'danger'
  if (status === 'Pending') return 'warning'
  return 'info'
}

/** Options for the inline / modal intervention status select. */
export const INTERVENTION_STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'Pending', label: 'Pending' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Completed', label: 'Completed' },
]

/** Options for the intervention risk filter. */
export const RISK_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: 'High', label: 'High risk' },
  { value: 'Medium', label: 'Medium risk' },
  { value: 'Low', label: 'Low risk' },
]

/** `yyyy-mm-dd` string for a native date input, `offsetDays` from today. */
export function dateInputValue(offsetDays: number): string {
  const d = new Date(Date.now() + offsetDays * 86400000)
  const month = `${d.getMonth() + 1}`.padStart(2, '0')
  const day = `${d.getDate()}`.padStart(2, '0')
  return `${d.getFullYear()}-${month}-${day}`
}
