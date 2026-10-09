import type { ReactNode } from 'react'
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import { cn } from '../../utils/cn'

export function StatCard({
  label,
  value,
  unit,
  icon,
  hint,
  delta,
  deltaLabel,
  tone = 'brand',
  onClick,
  className,
}: {
  label: string
  value: ReactNode
  unit?: string
  icon?: ReactNode
  hint?: string
  delta?: number
  deltaLabel?: string
  tone?: 'brand' | 'success' | 'warning' | 'danger' | 'info'
  onClick?: () => void
  className?: string
}) {
  const toneMap = {
    brand: 'bg-brand-50 text-brand-700 dark:bg-brand-500/12 dark:text-brand-300',
    success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/12 dark:text-emerald-400',
    warning: 'bg-amber-50 text-amber-700 dark:bg-amber-500/12 dark:text-amber-400',
    danger: 'bg-red-50 text-red-700 dark:bg-red-500/12 dark:text-red-400',
    info: 'bg-blue-50 text-blue-700 dark:bg-blue-500/12 dark:text-blue-300',
  }

  const Wrapper = onClick ? 'button' : 'div'

  return (
    <Wrapper
      {...(onClick ? { type: 'button' as const, onClick } : {})}
      className={cn(
        'group w-full rounded-2xl border border-line bg-panel p-4 text-left shadow-card transition-all duration-200 sm:p-5',
        onClick &&
          'hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-card-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-[12.5px] font-medium text-ink-muted">{label}</span>
        {icon && (
          <span className={cn('flex h-8 w-8 items-center justify-center rounded-lg', toneMap[tone])}>
            {icon}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="text-[26px] font-bold leading-none tracking-tight text-ink sm:text-[28px]">
          {value}
        </span>
        {unit && <span className="text-sm font-semibold text-ink-subtle">{unit}</span>}
        {typeof delta === 'number' && (
          <span
            className={cn(
              'ml-1 inline-flex items-center gap-0.5 text-[12px] font-semibold',
              delta > 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : delta < 0
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-ink-subtle',
            )}
          >
            {delta > 0 ? (
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
            ) : delta < 0 ? (
              <ArrowDownRight className="h-3.5 w-3.5" aria-hidden />
            ) : (
              <Minus className="h-3.5 w-3.5" aria-hidden />
            )}
            {Math.abs(delta)}%
          </span>
        )}
      </div>

      {(hint || deltaLabel) && (
        <p className="mt-2 text-[12px] leading-relaxed text-ink-subtle">
          {hint ?? deltaLabel}
        </p>
      )}
    </Wrapper>
  )
}
