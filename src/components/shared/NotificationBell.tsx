import { useNavigate } from 'react-router-dom'
import {
  Bell,
  BellOff,
  CheckCheck,
  Sparkles,
  Trash2,
  TriangleAlert,
  ClipboardCheck,
  UserCog,
  Activity,
  Info,
} from 'lucide-react'
import type { NotificationItem, Role } from '../../types'
import {
  selectRoleNotifications,
  selectUnread,
  useAppStore,
} from '../../store/useAppStore'
import { relativeTime } from '../../utils/format'
import { cn } from '../../utils/cn'

const TYPE_META: Record<NotificationItem['type'], { icon: typeof Bell; className: string }> = {
  risk: {
    icon: TriangleAlert,
    className: 'bg-red-50 text-red-600 dark:bg-red-500/12 dark:text-red-400',
  },
  recommendation: {
    icon: Sparkles,
    className: 'bg-brand-50 text-brand-700 dark:bg-brand-500/12 dark:text-brand-300',
  },
  assessment: {
    icon: ClipboardCheck,
    className: 'bg-amber-50 text-amber-600 dark:bg-amber-500/12 dark:text-amber-400',
  },
  teacher: {
    icon: UserCog,
    className: 'bg-blue-50 text-blue-600 dark:bg-blue-500/12 dark:text-blue-300',
  },
  progress: {
    icon: Activity,
    className: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/12 dark:text-emerald-400',
  },
  system: {
    icon: Info,
    className: 'bg-slate-100 text-slate-600 dark:bg-slate-500/12 dark:text-slate-300',
  },
}

export function NotificationBell({
  role,
  menuOpen,
  onToggle,
}: {
  role: Role
  menuOpen: boolean
  onToggle: () => void
}) {
  const navigate = useNavigate()
  const notifications = useAppStore((s) => s.notifications)
  const markRead = useAppStore((s) => s.markNotificationRead)
  const markAllRead = useAppStore((s) => s.markAllRead)
  const remove = useAppStore((s) => s.deleteNotification)

  const items = selectRoleNotifications(notifications, role)
  const unread = selectUnread(notifications, role)
  const recent = items.slice(0, 6)

  const openPath = (path?: string) => {
    onToggle()
    if (path) navigate(path)
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        aria-label={`Notifications${unread > 0 ? ` (${unread} unread)` : ''}`}
        aria-expanded={menuOpen}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-panel-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <Bell className="h-4.5 w-4.5" aria-hidden />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-panel dark:ring-[rgb(var(--bg-elevated))]">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {menuOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={onToggle} aria-hidden />
          <div
            role="menu"
            aria-label="Notifications"
            className="absolute right-0 z-50 mt-2 w-[min(92vw,380px)] animate-scale-in overflow-hidden rounded-2xl border border-line bg-panel shadow-pop"
          >
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <div>
                <p className="text-[13.5px] font-semibold text-ink">Notifications</p>
                <p className="text-[11.5px] text-ink-subtle">{unread} unread</p>
              </div>
              <button
                type="button"
                onClick={() => markAllRead(role)}
                disabled={unread === 0}
                className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[12px] font-medium text-accent transition-colors hover:bg-panel-muted disabled:opacity-40"
              >
                <CheckCheck className="h-3.5 w-3.5" aria-hidden />
                Mark all read
              </button>
            </div>

            <div className="max-h-[54vh] overflow-y-auto">
              {recent.length === 0 && (
                <div className="px-4 py-10 text-center">
                  <BellOff className="mx-auto mb-2 h-5 w-5 text-ink-faint" aria-hidden />
                  <p className="text-[13px] font-medium text-ink">All caught up</p>
                  <p className="mt-1 text-[12px] text-ink-subtle">
                    No notifications for this role yet.
                  </p>
                </div>
              )}

              {recent.map((n) => {
                const meta = TYPE_META[n.type]
                const Icon = meta.icon
                return (
                  <div
                    key={n.id}
                    className={cn(
                      'group flex gap-3 border-b border-line px-4 py-3 last:border-0 transition-colors hover:bg-panel-muted/60',
                      !n.read && 'bg-brand-50/40 dark:bg-brand-500/5',
                    )}
                  >
                    <button
                      type="button"
                      className="flex min-w-0 flex-1 gap-3 text-left"
                      onClick={() => {
                        markRead(n.id)
                        openPath(n.link)
                      }}
                    >
                      <span className={cn('mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', meta.className)}>
                        <Icon className="h-4 w-4" aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="truncate text-[13px] font-semibold text-ink">
                            {n.title}
                          </span>
                          {!n.read && (
                            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-label="Unread" />
                          )}
                        </span>
                        <span className="mt-0.5 block text-[12px] leading-relaxed text-muted">
                          {n.message}
                        </span>
                        <span className="mt-1 block text-[11px] text-ink-faint">
                          {relativeTime(n.createdAt)}
                        </span>
                      </span>
                    </button>
                    <button
                      type="button"
                      aria-label={`Delete notification: ${n.title}`}
                      onClick={() => remove(n.id)}
                      className="h-7 w-7 shrink-0 rounded-md p-1.5 text-ink-faint opacity-0 transition-opacity hover:bg-panel-muted hover:text-red-500 focus:opacity-100 group-hover:opacity-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden />
                    </button>
                  </div>
                )
              })}
            </div>

            <div className="border-t border-line px-4 py-2.5">
              <button
                type="button"
                onClick={() => openPath(`/${role === 'organization' ? 'admin' : role}/notifications`)}
                className="w-full rounded-lg py-1.5 text-[12.5px] font-medium text-accent transition-colors hover:bg-panel-muted"
              >
                View all notifications
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
