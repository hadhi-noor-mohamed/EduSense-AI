import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Activity,
  Bell,
  BellOff,
  CheckCheck,
  ClipboardCheck,
  ExternalLink,
  Info,
  Sparkles,
  Trash2,
  TriangleAlert,
  UserCog,
} from 'lucide-react'
import type { NotificationItem, Role } from '../../types'
import {
  selectRoleNotifications,
  useAppStore,
} from '../../store/useAppStore'
import { PageHeader } from '../ui/PageHeader'
import { Tabs } from '../ui/Tabs'
import { EmptyState } from '../ui/States'
import { relativeTime } from '../../utils/format'
import { cn } from '../../utils/cn'

const TYPE_META: Record<NotificationItem['type'], { icon: typeof Bell; label: string; className: string }> = {
  risk: { icon: TriangleAlert, label: 'Risk alerts', className: 'bg-red-50 text-red-600 dark:bg-red-500/12 dark:text-red-400' },
  recommendation: { icon: Sparkles, label: 'Recommendations', className: 'bg-brand-50 text-brand-700 dark:bg-brand-500/12 dark:text-brand-300' },
  assessment: { icon: ClipboardCheck, label: 'Assessments', className: 'bg-amber-50 text-amber-600 dark:bg-amber-500/12 dark:text-amber-400' },
  teacher: { icon: UserCog, label: 'Teacher notes', className: 'bg-blue-50 text-blue-600 dark:bg-blue-500/12 dark:text-blue-300' },
  progress: { icon: Activity, label: 'Progress', className: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/12 dark:text-emerald-400' },
  system: { icon: Info, label: 'System', className: 'bg-slate-100 text-slate-600 dark:bg-slate-500/12 dark:text-slate-300' },
}

export function NotificationsView({ role, title, subtitle }: { role: Role; title: string; subtitle: string }) {
  const navigate = useNavigate()
  const notifications = useAppStore((s) => s.notifications)
  const markRead = useAppStore((s) => s.markNotificationRead)
  const markAllRead = useAppStore((s) => s.markAllRead)
  const remove = useAppStore((s) => s.deleteNotification)
  const pushToast = useAppStore((s) => s.pushToast)
  const [tab, setTab] = useState('all')

  const items = useMemo(
    () => selectRoleNotifications(notifications, role),
    [notifications, role],
  )
  const unread = items.filter((n) => !n.read).length

  const filtered = items.filter((n) => {
    if (tab === 'all') return true
    if (tab === 'unread') return !n.read
    return n.type === tab
  })

  const typeTabs = Array.from(new Set(items.map((n) => n.type))).slice(0, 3)

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={
          <>
            <span className="rounded-lg border border-line bg-panel px-3 py-2 text-[12.5px] font-medium text-ink-muted">
              {unread} unread
            </span>
            <button
              type="button"
              disabled={unread === 0}
              onClick={() => {
                markAllRead(role)
                pushToast({ title: 'All notifications marked as read', tone: 'success' })
              }}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-line bg-panel px-3.5 text-[13px] font-medium text-ink transition-colors hover:bg-panel-muted disabled:opacity-45"
            >
              <CheckCheck className="h-4 w-4" aria-hidden />
              Mark all as read
            </button>
          </>
        }
      />

      <div className="mb-4 overflow-x-auto">
        <Tabs
          items={[
            { value: 'all', label: 'All', count: items.length },
            { value: 'unread', label: 'Unread', count: unread },
            ...typeTabs.map((t) => ({
              value: t,
              label: TYPE_META[t].label,
              count: items.filter((n) => n.type === t).length,
            })),
          ]}
          value={tab}
          onChange={setTab}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<BellOff className="h-5 w-5" aria-hidden />}
          title={tab === 'unread' ? 'No unread notifications' : 'Nothing here yet'}
          description={
            tab === 'unread'
              ? 'You are fully caught up with every alert for this role.'
              : 'New risk alerts, assessment reminders and updates will appear here.'
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-panel shadow-card">
          {filtered.map((n) => {
            const meta = TYPE_META[n.type]
            const Icon = meta.icon
            return (
              <article
                key={n.id}
                className={cn(
                  'group flex gap-3.5 border-b border-line px-4 py-4 transition-colors last:border-0 sm:px-5',
                  !n.read && 'bg-brand-50/40 dark:bg-brand-500/5',
                )}
              >
                <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', meta.className)}>
                  <Icon className="h-4.5 w-4.5" aria-hidden />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-[14px] font-semibold text-ink">{n.title}</h3>
                    {!n.read && (
                      <span className="rounded bg-accent px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                        New
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-[13px] leading-relaxed text-muted">{n.message}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-[11.5px] text-ink-faint">
                    <span>{relativeTime(n.createdAt)}</span>
                    <span className="rounded bg-panel-muted px-1.5 py-0.5 font-medium text-ink-subtle">
                      {meta.label}
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-1.5 sm:flex-row sm:items-center">
                  {n.link && (
                    <button
                      type="button"
                      onClick={() => {
                        markRead(n.id)
                        navigate(n.link!)
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[12px] font-medium text-accent transition-colors hover:bg-panel-muted"
                    >
                      Open <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                    </button>
                  )}
                  {!n.read && (
                    <button
                      type="button"
                      onClick={() => markRead(n.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[12px] font-medium text-ink-muted transition-colors hover:bg-panel-muted hover:text-ink"
                    >
                      Mark read
                    </button>
                  )}
                  <button
                    type="button"
                    aria-label={`Delete: ${n.title}`}
                    onClick={() => {
                      remove(n.id)
                      pushToast({ title: 'Notification deleted', tone: 'info' })
                    }}
                    className="rounded-lg p-1.5 text-ink-faint transition-colors hover:bg-panel-muted hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
