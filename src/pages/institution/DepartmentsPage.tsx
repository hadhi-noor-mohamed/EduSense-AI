import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Building2, Mail, Search, SearchX, Users } from 'lucide-react'
import {
  Avatar,
  Badge,
  Button,
  EmptyState,
  Input,
  Modal,
  PageHeader,
  Progress,
  ProgressWithLabel,
  RiskBadge,
  SegmentedControl,
} from '../../components/ui'
import { DEPARTMENT_PERFORMANCE, STUDENTS, TEACHERS } from '../../data/seed'
import type { Student } from '../../types'
import { pctOf, shortDept } from './institutionHelpers'

interface DeptRow {
  name: string
  short: string
  performance: number
  attendance: number
  students: Student[]
  high: number
  medium: number
  low: number
}

type DeptMetric = 'performance' | 'attendance'

export function DepartmentsPage() {
  const [query, setQuery] = useState('')
  const [metric, setMetric] = useState<DeptMetric>('performance')
  const [selected, setSelected] = useState<DeptRow | null>(null)

  const rows = useMemo<DeptRow[]>(
    () =>
      DEPARTMENT_PERFORMANCE.map((d) => {
        const students = STUDENTS.filter((s) => s.department === d.department)
        return {
          name: d.department,
          short: shortDept(d.department),
          performance: d.performance,
          attendance: d.attendance,
          students,
          high: students.filter((s) => s.risk === 'High').length,
          medium: students.filter((s) => s.risk === 'Medium').length,
          low: students.filter((s) => s.risk === 'Low').length,
        }
      }),
    [],
  )

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return rows
      .filter((r) => !q || r.name.toLowerCase().includes(q))
      .sort((a, b) => b[metric] - a[metric])
  }, [rows, query, metric])

  const selectedTeachers = useMemo(
    () => TEACHERS.filter((t) => t.department === selected?.name),
    [selected],
  )

  return (
    <div className="animate-fade-in-up space-y-5 sm:space-y-6">
      <PageHeader
        title="Departments"
        subtitle="Performance, attendance and risk split per department. Click any department for the full breakdown."
        actions={
          <SegmentedControl
            options={[
              { value: 'performance', label: 'Performance' },
              { value: 'attendance', label: 'Attendance' },
            ]}
            value={metric}
            onChange={(v) => setMetric(v as DeptMetric)}
          />
        }
      />

      <div className="max-w-sm">
        <Input
          label="Search departments"
          placeholder="e.g. Mechanical Engineering"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          leftIcon={<Search className="h-4 w-4" aria-hidden />}
        />
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={<SearchX className="h-5 w-5" aria-hidden />}
          title="No departments match your search"
          description="Try a different keyword, or clear the search to see every department."
          action={
            <Button variant="outline" size="sm" onClick={() => setQuery('')}>
              Clear search
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((row) => (
            <button
              key={row.name}
              type="button"
              onClick={() => setSelected(row)}
              className="group w-full rounded-2xl border border-line bg-panel p-5 text-left shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-card-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-panel-muted text-accent">
                    <Building2 className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="mt-3 block truncate text-[15px] font-semibold text-ink">{row.name}</h3>
                  <p className="mt-1 flex items-center gap-1.5 text-[12.5px] text-ink-subtle">
                    <Users className="h-3.5 w-3.5" aria-hidden />
                    {row.students.length} students
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[26px] font-bold leading-none tracking-tight text-ink">
                    {row[metric]}
                    <span className="ml-0.5 text-sm font-semibold text-ink-subtle">%</span>
                  </p>
                  <p className="mt-1 text-[11.5px] font-medium uppercase tracking-wide text-ink-subtle">
                    {metric === 'performance' ? 'Performance' : 'Attendance'}
                  </p>
                </div>
              </div>

              <Progress
                value={row[metric]}
                className="mt-4"
                barClassName={row[metric] >= 70 ? 'bg-emerald-500' : row[metric] >= 65 ? 'bg-amber-500' : 'bg-red-500'}
              />

              <div className="mt-4 flex items-center justify-between gap-2">
                <div className="flex flex-wrap gap-1.5">
                  <Badge tone="danger" icon={<span className="h-1.5 w-1.5 rounded-full bg-red-500" aria-hidden />}>
                    {row.high} High
                  </Badge>
                  <Badge tone="warning" icon={<span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden />}>
                    {row.medium} Med
                  </Badge>
                  <Badge tone="success" icon={<span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />}>
                    {row.low} Low
                  </Badge>
                </div>
                <span className="text-[12px] font-medium text-ink-muted transition-colors group-hover:text-accent">
                  {metric === 'performance' ? 'Attendance' : 'Performance'} {row[metric === 'performance' ? 'attendance' : 'performance']}%
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={selected?.name ?? 'Department'}
        description={
          selected ? `${selected.students.length} students · ${selectedTeachers.length} teachers mapped` : undefined
        }
        size="xl"
        footer={
          <Button variant="secondary" onClick={() => setSelected(null)}>
            Close
          </Button>
        }
      >
        {selected && (
          <div className="space-y-6">
            {/* metric breakdown */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: 'Performance', value: `${selected.performance}%` },
                { label: 'Attendance', value: `${selected.attendance}%` },
                { label: 'Students', value: String(selected.students.length) },
                { label: 'High risk', value: String(selected.high) },
              ].map((m) => (
                <div key={m.label} className="rounded-xl border border-line bg-panel-muted px-3.5 py-3">
                  <p className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-subtle">{m.label}</p>
                  <p className="mt-1 text-[16px] font-semibold text-ink">{m.value}</p>
                </div>
              ))}
            </div>

            <div>
              <h3 className="mb-3 text-[12px] font-bold uppercase tracking-[0.08em] text-accent">Risk split</h3>
              <div className="space-y-2.5">
                <ProgressWithLabel
                  value={pctOf(selected.high, selected.students.length)}
                  label={`${selected.high} High risk`}
                  barClassName="bg-red-500"
                />
                <ProgressWithLabel
                  value={pctOf(selected.medium, selected.students.length)}
                  label={`${selected.medium} Medium risk`}
                  barClassName="bg-amber-500"
                />
                <ProgressWithLabel
                  value={pctOf(selected.low, selected.students.length)}
                  label={`${selected.low} Low risk`}
                  barClassName="bg-emerald-500"
                />
              </div>
            </div>

            {/* students */}
            <div>
              <h3 className="mb-2.5 text-[12px] font-bold uppercase tracking-[0.08em] text-accent">Students</h3>
              {selected.students.length === 0 ? (
                <p className="rounded-xl border border-dashed border-line bg-panel-muted px-3.5 py-3 text-[12.5px] text-ink-subtle">
                  No seeded students in this department.
                </p>
              ) : (
                <div className="overflow-hidden rounded-xl border border-line">
                  {selected.students.map((s) => (
                    <div
                      key={s.id}
                      className="flex flex-wrap items-center gap-3 border-b border-line px-3.5 py-2.5 last:border-0"
                    >
                      <Avatar name={s.name} tone={s.avatar} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-semibold text-ink">{s.name}</p>
                        <p className="text-[11.5px] text-ink-subtle">{s.rollNo}</p>
                      </div>
                      <span className="text-[12.5px] tabular-nums text-ink-muted">{s.attendance}%</span>
                      <RiskBadge level={s.risk} size="sm" />
                      <Link
                        to={`/teacher/students/${s.id}`}
                        className="rounded-lg px-2 py-1.5 text-[12px] font-medium text-accent transition-colors hover:bg-panel-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                      >
                        View
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* teachers */}
            <div>
              <h3 className="mb-2.5 text-[12px] font-bold uppercase tracking-[0.08em] text-accent">Faculty</h3>
              {selectedTeachers.length === 0 ? (
                <p className="rounded-xl border border-dashed border-line bg-panel-muted px-3.5 py-3 text-[12.5px] text-ink-subtle">
                  No teachers mapped to this department in the demo data.
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {selectedTeachers.map((t) => (
                    <div key={t.id} className="rounded-xl border border-line p-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={t.name} tone={t.avatar} size="sm" />
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-semibold text-ink">{t.name}</p>
                          <p className="truncate text-[11.5px] text-ink-subtle">{t.subjects.join(', ')}</p>
                        </div>
                      </div>
                      <a
                        href={`mailto:${t.email}`}
                        className="mt-2.5 inline-flex items-center gap-1.5 text-[12px] text-accent transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                      >
                        <Mail className="h-3.5 w-3.5" aria-hidden />
                        {t.email}
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}