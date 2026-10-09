import type { ReactNode } from 'react'
import { ShieldAlert, ShieldCheck, ShieldHalf } from 'lucide-react'
import type { RiskLevel } from '../../types'
import { cn } from '../../utils/cn'

type Tone =
  | 'default'
  | 'brand'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral'

const tones: Record<Tone, string> = {
  default: 'bg-panel-muted text-ink-muted ring-line',
  brand: 'bg-brand-50 text-brand-700 ring-brand-600/20 dark:bg-brand-500/12 dark:text-brand-300 dark:ring-brand-400/25',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/12 dark:text-emerald-400 dark:ring-emerald-400/25',
  warning: 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/12 dark:text-amber-400 dark:ring-amber-400/25',
  danger: 'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/12 dark:text-red-400 dark:ring-red-400/25',
  info: 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-500/12 dark:text-blue-300 dark:ring-blue-400/25',
  neutral: 'bg-slate-100 text-slate-600 ring-slate-500/15 dark:bg-slate-500/12 dark:text-slate-300 dark:ring-slate-400/20',
}

export function Badge({
  children,
  tone = 'default',
  className,
  icon,
}: {
  children: ReactNode
  tone?: Tone
  className?: string
  icon?: ReactNode
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-semibold leading-none ring-1 ring-inset',
        tones[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  )
}

const riskTone: Record<RiskLevel, Tone> = {
  Low: 'success',
  Medium: 'warning',
  High: 'danger',
}

const riskIcon: Record<RiskLevel, typeof ShieldCheck> = {
  Low: ShieldCheck,
  Medium: ShieldHalf,
  High: ShieldAlert,
}

export function RiskBadge({
  level,
  score,
  className,
  size = 'md',
}: {
  level: RiskLevel
  score?: number
  className?: string
  size?: 'sm' | 'md'
}) {
  const Icon = riskIcon[level]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md font-semibold ring-1 ring-inset',
        size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-[11px]',
        tones[riskTone[level]],
        className,
      )}
      title={`${level} risk${score !== undefined ? ` · score ${score}` : ''}`}
    >
      <Icon className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} aria-hidden />
      {level} Risk
      {score !== undefined && <span className="opacity-70">· {score}</span>}
    </span>
  )
}

export function StatusDot({ tone }: { tone: 'green' | 'amber' | 'red' | 'slate' }) {
  const map = {
    green: 'bg-emerald-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
    slate: 'bg-slate-400',
  }
  return <span className={cn('h-2 w-2 rounded-full', map[tone])} aria-hidden />
}
