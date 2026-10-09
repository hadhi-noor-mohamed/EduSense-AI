import { cn } from '../../utils/cn'

export function Progress({
  value,
  className,
  barClassName,
  height = 'h-2',
}: {
  value: number
  className?: string
  barClassName?: string
  height?: string
}) {
  const v = Math.max(0, Math.min(100, value))
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(v)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn('w-full overflow-hidden rounded-full bg-panel-muted', height, className)}
    >
      <div
        className={cn(
          'h-full rounded-full bg-accent transition-[width] duration-700 ease-out',
          barClassName,
        )}
        style={{ width: `${v}%` }}
      />
    </div>
  )
}

export function ProgressWithLabel({
  value,
  label,
  className,
  barClassName,
}: {
  value: number
  label?: string
  className?: string
  barClassName?: string
}) {
  return (
    <div className={className}>
      {label && (
        <div className="mb-1.5 flex items-center justify-between text-[12px]">
          <span className="text-muted">{label}</span>
          <span className="font-semibold text-ink">{Math.round(value)}%</span>
        </div>
      )}
      <Progress value={value} barClassName={barClassName} />
    </div>
  )
}
