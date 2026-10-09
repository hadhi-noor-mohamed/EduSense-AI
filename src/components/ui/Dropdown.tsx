import { useEffect, useRef, useState, type ReactNode } from 'react'
import { cn } from '../../utils/cn'

export function Dropdown({
  trigger,
  children,
  align = 'right',
  className,
  menuLabel,
}: {
  trigger: (props: { open: boolean; toggle: () => void }) => ReactNode
  children: (close: () => void) => ReactNode
  align?: 'left' | 'right'
  className?: string
  menuLabel?: string
}) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const close = () => setOpen(false)

  return (
    <div ref={wrapRef} className="relative">
      {trigger({ open, toggle: () => setOpen((v) => !v) })}
      {open && (
        <div
          role="menu"
          aria-label={menuLabel}
          className={cn(
            'absolute z-50 mt-2 min-w-[220px] animate-scale-in overflow-hidden rounded-xl border border-line bg-panel py-1.5 shadow-pop',
            align === 'right' ? 'right-0' : 'left-0',
            className,
          )}
        >
          {children(close)}
        </div>
      )}
    </div>
  )
}

export function MenuItem({
  children,
  onClick,
  icon,
  danger,
  active,
}: {
  children: ReactNode
  onClick: () => void
  icon?: ReactNode
  danger?: boolean
  active?: boolean
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-[13px] font-medium transition-colors',
        danger
          ? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10'
          : 'text-ink-muted hover:bg-panel-muted hover:text-ink',
        active && 'text-accent',
      )}
    >
      {icon}
      <span className="min-w-0 flex-1">{children}</span>
    </button>
  )
}

export function MenuSeparator() {
  return <div className="my-1.5 h-px bg-line" role="separator" />
}

export function MenuLabel({ children }: { children: ReactNode }) {
  return (
    <div className="px-3.5 pb-1 pt-2 text-[10.5px] font-semibold uppercase tracking-wider text-ink-faint">
      {children}
    </div>
  )
}
