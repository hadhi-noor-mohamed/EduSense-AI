import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { cn } from '../../utils/cn'

const TONES = {
  success: {
    icon: CheckCircle2,
    className:
      'text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30',
    bar: 'bg-emerald-500',
  },
  error: {
    icon: XCircle,
    className: 'text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/30',
    bar: 'bg-red-500',
  },
  warning: {
    icon: AlertTriangle,
    className: 'text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/30',
    bar: 'bg-amber-500',
  },
  info: {
    icon: Info,
    className: 'text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/30',
    bar: 'bg-blue-500',
  },
}

export function Toaster() {
  const toasts = useAppStore((s) => s.toasts)
  const dismiss = useAppStore((s) => s.dismissToast)

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="no-print pointer-events-none fixed inset-x-3 bottom-3 z-[120] flex flex-col items-stretch gap-2 sm:inset-x-auto sm:right-5 sm:bottom-5 sm:w-[360px]"
    >
      {toasts.map((t) => {
        const tone = TONES[t.tone]
        const Icon = tone.icon
        return (
          <div
            key={t.id}
            role="status"
            className={cn(
              'pointer-events-auto animate-slide-in-right overflow-hidden rounded-xl border bg-panel shadow-pop',
              tone.className,
            )}
          >
            <div className="flex items-start gap-3 px-3.5 py-3">
              <Icon className="mt-0.5 h-4.5 w-4.5 shrink-0" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-[13.5px] font-semibold text-ink">{t.title}</p>
                {t.description && (
                  <p className="mt-0.5 text-[12.5px] leading-relaxed text-muted">{t.description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss notification"
                className="-mr-1 rounded p-1 text-ink-faint transition-colors hover:text-ink"
              >
                <X className="h-3.5 w-3.5" aria-hidden />
              </button>
            </div>
            <div className={cn('h-0.5 w-full opacity-60', tone.bar)}>
              <div className="h-full w-full origin-left animate-shrink" />
            </div>
          </div>
        )
      })}
    </div>
  )
}
