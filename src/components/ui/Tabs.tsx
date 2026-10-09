import { useRef, useState, type ReactNode } from 'react'
import { cn } from '../../utils/cn'

export interface TabItem {
  value: string
  label: string
  icon?: ReactNode
  count?: number
}

export function Tabs({
  items,
  value,
  onChange,
  className,
  size = 'md',
}: {
  items: TabItem[]
  value: string
  onChange: (v: string) => void
  className?: string
  size?: 'sm' | 'md'
}) {
  const listRef = useRef<HTMLDivElement>(null)
  return (
    <div
      ref={listRef}
      role="tablist"
      className={cn(
        'inline-flex w-full items-center gap-1 overflow-x-auto rounded-xl border border-line bg-panel-muted p-1 no-scrollbar',
        className,
      )}
    >
      {items.map((t) => {
        const active = t.value === value
        return (
          <button
            key={t.value}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(t.value)}
            className={cn(
              'inline-flex shrink-0 items-center gap-1.5 rounded-lg font-medium transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
              size === 'sm' ? 'px-2.5 py-1 text-[12px]' : 'px-3 py-1.5 text-[13px]',
              active
                ? 'bg-panel text-ink shadow-sm ring-1 ring-line'
                : 'text-ink-muted hover:text-ink',
            )}
          >
            {t.icon}
            {t.label}
            {typeof t.count === 'number' && (
              <span
                className={cn(
                  'ml-0.5 rounded px-1.5 py-0.5 text-[10px] font-semibold',
                  active ? 'bg-accent text-white' : 'bg-panel-muted text-ink-subtle',
                )}
              >
                {t.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export function SegmentedControl({
  options,
  value,
  onChange,
  className,
}: {
  options: { value: string; label: string }[]
  value: string
  onChange: (v: string) => void
  className?: string
}) {
  const [focusIndex, setFocusIndex] = useState(0)
  return (
    <div
      role="tablist"
      className={cn('inline-flex rounded-lg border border-line bg-panel p-0.5', className)}
      onKeyDown={(e) => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
        e.preventDefault()
        const dir = e.key === 'ArrowRight' ? 1 : -1
        const next = (focusIndex + dir + options.length) % options.length
        setFocusIndex(next)
        onChange(options[next].value)
      }}
    >
      {options.map((o, i) => (
        <button
          key={o.value}
          type="button"
          role="tab"
          aria-selected={o.value === value}
          onFocus={() => setFocusIndex(i)}
          onClick={() => {
            setFocusIndex(i)
            onChange(o.value)
          }}
          className={cn(
            'rounded-md px-3 py-1.5 text-[12.5px] font-medium transition-colors',
            o.value === value
              ? 'bg-accent text-white shadow-sm'
              : 'text-ink-muted hover:text-ink',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
