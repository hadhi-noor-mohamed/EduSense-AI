import type { ContributingFactor, RiskLevel } from '../../types'
import { cn } from '../../utils/cn'

const LEVEL_STYLES: Record<RiskLevel, { bar: string; text: string; ring: string }> = {
  Low: {
    bar: 'bg-emerald-500',
    text: 'text-emerald-600 dark:text-emerald-400',
    ring: 'ring-emerald-500/25',
  },
  Medium: {
    bar: 'bg-amber-500',
    text: 'text-amber-600 dark:text-amber-400',
    ring: 'ring-amber-500/25',
  },
  High: {
    bar: 'bg-red-500',
    text: 'text-red-600 dark:text-red-400',
    ring: 'ring-red-500/25',
  },
}

/**
 * Horizontal contribution chart for explainability output.
 *
 * Designed as a drop-in for real SHAP / feature-importance values: it only
 * needs an ordered list of `{ name, contribution, detail }`.
 */
export function RiskFactorChart({
  factors,
  level,
  className,
  showDetail = true,
  animate = true,
}: {
  factors: ContributingFactor[]
  level: RiskLevel
  className?: string
  showDetail?: boolean
  animate?: boolean
}) {
  const styles = LEVEL_STYLES[level]

  if (factors.length === 0) {
    return (
      <p className={cn('text-[13px] text-muted', className)}>
        No contributing factors were returned for this prediction.
      </p>
    )
  }

  return (
    <ul className={cn('space-y-4', className)}>
      {factors.map((f, i) => (
        <li key={f.name}>
          <div className="mb-1.5 flex items-baseline justify-between gap-3">
            <span className="flex min-w-0 items-baseline gap-2">
              <span className="text-[11px] font-bold text-ink-faint">{i + 1}.</span>
              <span className="truncate text-[13.5px] font-medium text-ink">{f.name}</span>
            </span>
            <span className="shrink-0 text-[13.5px] font-bold tabular-nums text-ink">
              {f.contribution}%
            </span>
          </div>

          <div
            role="img"
            aria-label={`${f.name} contributes ${f.contribution} percent`}
            className="h-2.5 w-full overflow-hidden rounded-full bg-panel-muted"
          >
            <div
              className={cn(
                'h-full rounded-full transition-[width] duration-[900ms] ease-out',
                styles.bar,
                animate && 'motion-safe:animate-fade-in',
              )}
              style={{
                width: `${f.contribution}%`,
                animationDelay: animate ? `${i * 70}ms` : undefined,
              }}
            />
          </div>

          {showDetail && f.detail && (
            <p className="mt-1.5 text-[12px] leading-relaxed text-ink-subtle">{f.detail}</p>
          )}
        </li>
      ))}
    </ul>
  )
}

/** Compact legend variant used in tight card layouts. */
export function RiskFactorLegend({ factors, level }: { factors: ContributingFactor[]; level: RiskLevel }) {
  const styles = LEVEL_STYLES[level]
  return (
    <div className="space-y-2">
      {factors.map((f) => (
        <div key={f.name} className="flex items-center gap-2.5 text-[12.5px]">
          <span className={cn('h-2.5 w-2.5 shrink-0 rounded-full', styles.bar)} aria-hidden />
          <span className="min-w-0 flex-1 truncate text-ink-muted">{f.name}</span>
          <span className="font-semibold tabular-nums text-ink">{f.contribution}%</span>
        </div>
      ))}
    </div>
  )
}
