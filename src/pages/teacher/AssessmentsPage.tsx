import { useState } from 'react'
import { CheckCircle2, ClipboardCheck, Clock, Inbox, Send, TrendingUp } from 'lucide-react'
import {
  Badge,
  Button,
  ChartCard,
  DataTable,
  EmptyState,
  Modal,
  PageHeader,
  Progress,
  Select,
  StatCard,
  type Column,
} from '../../components/ui'
import { CategoryBar, DonutChart } from '../../components/charts/ChartPrimitives'
import { MockBadge, PrototypeNote } from '../../components/shared/MockBadge'
import { useAppStore } from '../../store/useAppStore'
import { ASSESSMENTS, TEACHERS } from '../../data/seed'
import type { Assessment } from '../../types'
import { CHART_COLORS, daysUntil, formatDate } from '../../utils/format'
import { assessmentTone, shortSubject } from './teacherHelpers'

const TEACHER = TEACHERS[0]

const ALL_SUBJECTS = Array.from(new Set(ASSESSMENTS.map((a) => a.subject))).sort()

const TYPE_OPTIONS = [
  { value: 'Quiz', label: 'Quiz' },
  { value: 'Assignment', label: 'Assignment' },
  { value: 'Internal', label: 'Internal' },
  { value: 'Exam', label: 'Exam' },
]

const STATUS_OPTIONS = [
  { value: 'Completed', label: 'Completed' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Overdue', label: 'Overdue' },
  { value: 'Upcoming', label: 'Upcoming' },
]

const SCOPE_OPTIONS = [
  { value: 'mine', label: 'My subjects (DS + ML)' },
  { value: 'all', label: 'All subjects' },
  ...ALL_SUBJECTS.map((s) => ({ value: `subject:${s}`, label: s })),
]

const STATUS_COLORS: { key: string; name: string; color: string }[] = [
  { key: 'Completed', name: 'Completed', color: CHART_COLORS.success },
  { key: 'Pending', name: 'Pending', color: CHART_COLORS.warning },
  { key: 'Overdue', name: 'Overdue', color: CHART_COLORS.danger },
  { key: 'Upcoming', name: 'Upcoming', color: CHART_COLORS.secondary },
]

function dueLabel(a: Assessment): string {
  const d = daysUntil(a.dueDate)
  if (d < 0) return `Overdue by ${Math.abs(d)}d`
  if (d === 0) return 'Due today'
  return `in ${d} day${d === 1 ? '' : 's'}`
}

export function AssessmentsPage() {
  const pushNotification = useAppStore((s) => s.pushNotification)
  const pushToast = useAppStore((s) => s.pushToast)

  const [scope, setScope] = useState('mine')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selected, setSelected] = useState<Assessment | null>(null)

  const filtered = ASSESSMENTS.filter((a) => {
    if (scope === 'mine' && !TEACHER.subjects.includes(a.subject)) return false
    if (scope !== 'mine' && scope !== 'all' && a.subject !== scope.slice('subject:'.length))
      return false
    if (typeFilter && a.type !== typeFilter) return false
    if (statusFilter && a.status !== statusFilter) return false
    return true
  })

  const scores = filtered.map((a) => a.score).filter((s): s is number => s !== null)
  const avgScore = scores.length
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0

  const completed = filtered.filter((a) => a.status === 'Completed').length
  const pendingOrOverdue = filtered.filter(
    (a) => a.status === 'Pending' || a.status === 'Overdue',
  ).length

  const statusData = STATUS_COLORS.map((s) => ({
    name: s.name,
    value: filtered.filter((a) => a.status === s.key).length,
    color: s.color,
  }))

  const scoreGroups = new Map<string, number[]>()
  for (const a of filtered) {
    if (a.score === null) continue
    const list = scoreGroups.get(a.subject) ?? []
    list.push(a.score)
    scoreGroups.set(a.subject, list)
  }
  const scoreData = Array.from(scoreGroups, ([subject, list]) => ({
    label: shortSubject(subject),
    avg: Math.round(list.reduce((x, y) => x + y, 0) / list.length),
  }))

  const anyActive = Boolean(scope !== 'mine' || typeFilter || statusFilter)
  const clearAll = () => {
    setScope('mine')
    setTypeFilter('')
    setStatusFilter('')
  }

  const notify = (a: Assessment) => {
    pushNotification({
      title: `Assessment update · ${a.title}`,
      message: `${a.subject} · ${a.type} · due ${formatDate(a.dueDate)} — current status: ${a.status}.`,
      type: 'assessment',
      roles: ['teacher'],
      link: '/teacher/assessments',
    })
    pushToast({
      title: 'Notification pushed',
      description: `${a.title} added to the teacher notification feed.`,
      tone: 'success',
    })
  }

  const noteFor = (a: Assessment): string => {
    const d = daysUntil(a.dueDate)
    if (a.status === 'Completed')
      return `Graded on ${formatDate(a.dueDate)} — recorded score ${a.score ?? '—'} of ${a.maxScore}.`
    if (a.status === 'Overdue')
      return `Past due by ${Math.abs(d)} day${Math.abs(d) === 1 ? '' : 's'} — submissions are still outstanding.`
    if (a.status === 'Pending')
      return `Due ${formatDate(a.dueDate)} (in ${d} day${d === 1 ? '' : 's'}).`
    return `Scheduled for ${formatDate(a.dueDate)} — ${d} day${d === 1 ? '' : 's'} away.`
  }

  const columns: Column<Assessment>[] = [
    {
      key: 'title',
      header: 'Assessment',
      sortValue: (a) => a.title,
      render: (a) => (
        <div className="min-w-[200px]">
          <span className="block text-[13.5px] font-semibold text-ink">{a.title}</span>
          <span className="block text-[11.5px] text-ink-subtle">{a.subject}</span>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      sortValue: (a) => a.type,
      render: (a) => <span className="text-[13px] text-ink-muted">{a.type}</span>,
    },
    {
      key: 'dueDate',
      header: 'Due date',
      sortValue: (a) => a.dueDate,
      render: (a) => (
        <div className="min-w-[130px]">
          <span className="block text-[13px] text-ink-muted">{formatDate(a.dueDate)}</span>
          <span
            className={
              daysUntil(a.dueDate) < 0 && a.status !== 'Completed'
                ? 'block text-[11.5px] font-semibold text-red-600 dark:text-red-400'
                : 'block text-[11.5px] text-ink-faint'
            }
          >
            {dueLabel(a)}
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortValue: (a) => a.status,
      render: (a) => <Badge tone={assessmentTone(a.status)}>{a.status}</Badge>,
    },
    {
      key: 'score',
      header: 'Score',
      align: 'right',
      sortValue: (a) => a.score ?? -1,
      render: (a) =>
        a.score === null ? (
          <span className="text-[13px] text-ink-faint">—</span>
        ) : (
          <div className="ml-auto w-[130px]">
            <span className="mb-1 block text-right text-[12px] font-semibold tabular-nums text-ink">
              {a.score} / {a.maxScore}
            </span>
            <Progress
              value={(a.score / a.maxScore) * 100}
              height="h-1.5"
              barClassName={
                a.score >= 75
                  ? 'bg-emerald-500'
                  : a.score >= 50
                    ? 'bg-amber-500'
                    : 'bg-red-500'
              }
            />
          </div>
        ),
    },
  ]

  return (
    <div className="animate-fade-in-up space-y-5 sm:space-y-6">
      <PageHeader
        title="Assessments"
        subtitle={`${TEACHER.name}'s quizzes, assignments and internals — filter by subject scope, type or status, then open a row for details.`}
        actions={<MockBadge compact />}
      />

      {/* ---------- filters ---------- */}
      <div className="flex flex-col gap-3 rounded-2xl border border-line bg-panel p-4 shadow-card sm:flex-row sm:items-end">
        <div className="grid flex-1 gap-3 sm:grid-cols-3">
          <Select
            label="Subject scope"
            options={SCOPE_OPTIONS}
            value={scope}
            onChange={(e) => setScope(e.target.value)}
          />
          <Select
            label="Type"
            placeholder="All types"
            options={TYPE_OPTIONS}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          />
          <Select
            label="Status"
            placeholder="All statuses"
            options={STATUS_OPTIONS}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 sm:pb-0.5">
          <span className="text-[12.5px] tabular-nums text-ink-subtle">
            {filtered.length} of {ASSESSMENTS.length}
          </span>
          <Button variant="outline" size="sm" onClick={clearAll} disabled={!anyActive}>
            Clear filters
          </Button>
        </div>
      </div>

      {/* ---------- stats ---------- */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total"
          value={filtered.length}
          icon={<ClipboardCheck className="h-4 w-4" aria-hidden />}
          tone="brand"
          hint="in the current view"
        />
        <StatCard
          label="Completed"
          value={completed}
          icon={<CheckCircle2 className="h-4 w-4" aria-hidden />}
          tone="success"
          hint="graded and closed"
        />
        <StatCard
          label="Pending / overdue"
          value={pendingOrOverdue}
          icon={<Clock className="h-4 w-4" aria-hidden />}
          tone="warning"
          hint="needs attention"
        />
        <StatCard
          label="Average score"
          value={avgScore}
          unit="%"
          icon={<TrendingUp className="h-4 w-4" aria-hidden />}
          tone="info"
          hint={
            scores.length
              ? `across ${scores.length} scored assessment${scores.length === 1 ? '' : 's'}`
              : 'no scored assessments in this view'
          }
        />
      </div>

      {/* ---------- charts ---------- */}
      <div className="grid gap-5 xl:grid-cols-2">
        <ChartCard
          title="Status distribution"
          description="Completed, pending, overdue and upcoming assessments in the current view."
          icon={<ClipboardCheck className="h-4.5 w-4.5" aria-hidden />}
        >
          {filtered.length === 0 ? (
            <EmptyState
              title="Nothing to chart"
              description="No assessments match the active filters."
            />
          ) : (
            <DonutChart
              data={statusData}
              centerLabel={String(filtered.length)}
              centerSub="assessments"
              height={250}
            />
          )}
        </ChartCard>

        <ChartCard
          title="Average score by subject"
          description="Mean score across graded assessments, grouped by subject."
          icon={<TrendingUp className="h-4.5 w-4.5" aria-hidden />}
          actions={<MockBadge compact />}
        >
          {scoreData.length === 0 ? (
            <EmptyState
              title="No graded assessments here"
              description="Clear the filters or pick another subject scope to see scored work."
            />
          ) : (
            <CategoryBar
              data={scoreData}
              xKey="label"
              bars={[{ key: 'avg', name: 'Average score', color: CHART_COLORS.primary }]}
              height={250}
            />
          )}
        </ChartCard>
      </div>

      {/* ---------- table ---------- */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Inbox className="h-5 w-5" aria-hidden />}
          title="No assessments match"
          description="Nothing in this scope matches the selected type and status."
          action={
            <Button variant="outline" size="sm" onClick={clearAll}>
              Clear filters
            </Button>
          }
        />
      ) : (
        <DataTable
          columns={columns}
          rows={filtered}
          getRowId={(a) => a.id}
          onRowClick={(a) => setSelected(a)}
          pageSize={Math.max(1, filtered.length)}
          dense
        />
      )}

      <PrototypeNote />

      {/* ---------- detail modal ---------- */}
      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={selected ? selected.title : 'Assessment'}
        description={selected ? `${selected.subject} · ${selected.type}` : undefined}
        footer={
          selected ? (
            <>
              <Button variant="ghost" onClick={() => setSelected(null)}>
                Close
              </Button>
              <Button
                onClick={() => {
                  notify(selected)
                  setSelected(null)
                }}
              >
                <Send className="h-4 w-4" aria-hidden />
                Push teacher notification
              </Button>
            </>
          ) : null
        }
      >
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-line bg-panel-muted px-3.5 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">
                  Due date
                </p>
                <p className="mt-1 text-[14px] font-semibold text-ink">
                  {formatDate(selected.dueDate)}
                </p>
                <p className="mt-0.5 text-[11.5px] text-ink-faint">{dueLabel(selected)}</p>
              </div>
              <div className="rounded-xl border border-line bg-panel-muted px-3.5 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">
                  Score
                </p>
                <p className="mt-1 text-[14px] font-semibold text-ink">
                  {selected.score === null
                    ? 'Not graded'
                    : `${selected.score} / ${selected.maxScore}`}
                </p>
                <p className="mt-0.5 text-[11.5px] text-ink-faint">{selected.status}</p>
              </div>
            </div>

            <div className="rounded-xl border border-line bg-panel-muted px-3.5 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">
                Note
              </p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">
                {noteFor(selected)}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Badge tone={assessmentTone(selected.status)}>{selected.status}</Badge>
              <MockBadge compact />
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
