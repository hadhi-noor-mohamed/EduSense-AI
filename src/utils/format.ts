import type { RiskLevel, Trend } from '../types'

/** Consistent, theme-aware chart palette (works on light + dark backgrounds). */
export const CHART_COLORS = {
  primary: '#6366f1',
  secondary: '#3b82f6',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  purple: '#a855f7',
  cyan: '#06b6d4',
  pink: '#ec4899',
  muted: '#94a3b8',
}

export const RISK_COLORS: Record<RiskLevel, { hex: string; tailwind: string }> = {
  Low: { hex: '#22c55e', tailwind: 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-400 ring-emerald-600/25' },
  Medium: { hex: '#f59e0b', tailwind: 'bg-amber-500/12 text-amber-700 dark:text-amber-400 ring-amber-600/25' },
  High: { hex: '#ef4444', tailwind: 'bg-red-500/12 text-red-700 dark:text-red-400 ring-red-600/25' },
}

export const riskColor = (level: RiskLevel) => RISK_COLORS[level].hex

export function scoreColor(score: number): string {
  if (score >= 75) return CHART_COLORS.success
  if (score >= 60) return CHART_COLORS.warning
  return CHART_COLORS.danger
}

export function pct(n: number): string {
  return `${Math.round(n)}%`
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

export function trendOf(values: number[]): Trend {
  if (values.length < 2) return 'flat'
  const a = values[values.length - 2]
  const b = values[values.length - 1]
  const diff = b - a
  if (Math.abs(diff) < 1) return 'flat'
  return diff > 0 ? 'up' : 'down'
}

/** Short deterministic hash — used to give each record a stable pseudo-random id. */
export function hash(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

export function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')
}

export function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ''
  const diff = Date.now() - then
  const mins = Math.round(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.round(hrs / 24)
  if (days < 7) return `${days}d ago`
  return formatDate(iso)
}

export function daysUntil(iso: string): number {
  const d = new Date(iso).getTime()
  if (Number.isNaN(d)) return 0
  return Math.ceil((d - Date.now()) / 86400000)
}

/** Stable pseudo-random generator so demo data never shifts between renders. */
export function seededRandom(seed: number) {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}
