import type { ReactNode } from 'react'
import { Inbox, RefreshCw, SearchX, AlertTriangle } from 'lucide-react'
import { cn } from '../../utils/cn'
import { Button } from './Button'

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-dashed border-line px-6 py-12 text-center',
        className,
      )}
    >
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-panel-muted text-ink-faint">
        {icon ?? <Inbox className="h-5 w-5" aria-hidden />}
      </div>
      <h3 className="text-[15px] font-semibold text-ink">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-[13px] leading-relaxed text-muted">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function NoResults({
  onClear,
  term,
}: {
  onClear?: () => void
  term?: string
}) {
  return (
    <EmptyState
      icon={<SearchX className="h-5 w-5" aria-hidden />}
      title={term ? `No matches for “${term}”` : 'No results'}
      description={
        term
          ? 'Try a different keyword, or clear the active filters.'
          : 'Nothing here yet. Adjust your filters to see more.'
      }
      action={
        onClear && (
          <Button variant="outline" size="sm" onClick={onClear}>
            <RefreshCw className="h-3.5 w-3.5" aria-hidden /> Clear filters
          </Button>
        )
      }
    />
  )
}

export function ErrorState({
  message = 'Something went wrong while loading this data.',
  onRetry,
}: {
  message?: string
  onRetry?: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50/60 px-6 py-10 text-center dark:border-red-500/25 dark:bg-red-500/8">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400">
        <AlertTriangle className="h-5 w-5" aria-hidden />
      </div>
      <h3 className="text-[15px] font-semibold text-ink">Unable to load</h3>
      <p className="mt-1.5 max-w-sm text-[13px] text-muted">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton', className)} />
}

export function CardSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="rounded-2xl border border-line bg-panel p-5">
      <Skeleton className="h-4 w-32" />
      <div className="mt-4 space-y-2.5">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-full" />
        ))}
      </div>
    </div>
  )
}

export function StatSkeletonGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-line bg-panel p-5">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-4 h-7 w-16" />
          <Skeleton className="mt-3 h-3 w-28" />
        </div>
      ))}
    </div>
  )
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-panel">
      <div className="border-b border-line bg-panel-muted px-5 py-3">
        <Skeleton className="h-3.5 w-full max-w-md" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 border-b border-line px-5 py-3.5 last:border-0">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-3.5 flex-1" />
          <Skeleton className="h-3.5 w-16" />
          <Skeleton className="h-5 w-20 rounded-md" />
        </div>
      ))}
    </div>
  )
}
