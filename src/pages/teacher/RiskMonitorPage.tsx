import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CalendarCheck2,
  Send,
  ShieldAlert,
  TriangleAlert,
  Users,
} from 'lucide-react'
import {
  Avatar,
  Button,
  Card,
  CardHeader,
  ChartCard,
  Checkbox,
  EmptyState,
  PageHeader,
  RiskBadge,
  SegmentedControl,
  Select,
  Textarea,
  Modal,
} from '../../components/ui'
import {
  CategoryBar,
  RiskScatter,
  TrendChart,
  type ScatterPoint,
} from '../../components/charts/ChartPrimitives'
import { MockBadge, PrototypeNote } from '../../components/shared/MockBadge'
import { toOptions } from '../../components/shared/FilterBar'
import { useAppStore } from '../../store/useAppStore'
import {
  ATTENDANCE_VS_PERFORMANCE,
  DEMO_STUDENT_ID,
  DEPARTMENTS,
  RISK_TREND,
  STUDENTS,
  SUBJECT_RISK,
} from '../../data/seed'
import { RISK_COLORS } from '../../utils/format'
import { shortSubject } from './teacherHelpers'

const DEFAULT_MESSAGE =
  'Your predicted risk level needs attention this week. Please review your attendance and pending submissions, and meet me during office hours.'

const TREND_SERIES = [
  { key: 'high', name: 'High risk', color: RISK_COLORS.High.hex },
  { key: 'medium', name: 'Medium risk', color: RISK_COLORS.Medium.hex },
  { key: 'low', name: 'Low risk', color: RISK_COLORS.Low.hex },
]

const SUBJECT_BARS = [
  { key: 'high', name: 'High', color: RISK_COLORS.High.hex },
  { key: 'medium', name: 'Medium', color: RISK_COLORS.Medium.hex },
  { key: 'low', name: 'Low', color: RISK_COLORS.Low.hex },
]

export function RiskMonitorPage() {
  const pushNotification = useAppStore((s) => s.pushNotification)
  const pushToast = useAppStore((s) => s.pushToast)

  const [riskFilter, setRiskFilter] = useState('all')
  const [department, setDepartment] = useState('')

  const [warnOpen, setWarnOpen] = useState(false)
  const [selected, setSelected] = useState<string[]>([])
  const [message, setMessage] = useState(DEFAULT_MESSAGE)
  const [warnError, setWarnError] = useState('')

  const highRisk = STUDENTS.filter((s) => s.risk === 'High')

  const matches = (risk: string, dept: string) =>
    (riskFilter === 'all' || risk === riskFilter) &&
    (!department || dept === department)

  const filteredStudents = STUDENTS.filter((s) => matches(s.risk, s.department))

  const scatterPoints: ScatterPoint[] = ATTENDANCE_VS_PERFORMANCE.map((p, i) => ({
    point: { x: p.attendance, y: p.performance, name: p.name, risk: p.risk },
    department: STUDENTS[i].department,
  }))
    .filter((row) => matches(row.point.risk, row.department))
    .map((row) => row.point)

  const warnings = filteredStudents.filter((s) => s.risk === 'High' || s.attendance < 70)

  const subjectRiskData = SUBJECT_RISK.map((s) => ({ ...s, label: shortSubject(s.subject) }))

  const clearFilters = () => {
    setRiskFilter('all')
    setDepartment('')
  }

  const openWarn = () => {
    setSelected(highRisk.map((s) => s.id))
    setMessage(DEFAULT_MESSAGE)
    setWarnError('')
    setWarnOpen(true)
  }

  const toggleStudent = (id: string, checked: boolean) => {
    setSelected((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)))
    if (checked) setWarnError('')
  }

  const sendWarning = () => {
    if (selected.length === 0) {
      setWarnError('Select at least one student before sending.')
      return
    }
    const names = STUDENTS.filter((s) => selected.includes(s.id)).map((s) => s.name)
    pushNotification({
      title: `Early warning sent to ${selected.length} student${selected.length === 1 ? '' : 's'}`,
      message: message.trim(),
      type: 'risk',
      roles: ['teacher'],
      link: '/teacher/risk-monitor',
    })
    pushToast({
      title: 'Early warning dispatched',
      description: names.join(', '),
      tone: 'success',
    })
    // The demo student sees the warning land in their own notification centre.
    if (selected.includes(DEMO_STUDENT_ID)) {
      pushNotification({
        title: 'Early warning from your class mentor',
        message: message.trim(),
        type: 'teacher',
        roles: ['student'],
        link: '/student/notifications',
      })
    }
    setWarnOpen(false)
  }

  return (
    <div className="animate-fade-in-up space-y-5 sm:space-y-6">
      <PageHeader
        title="Risk monitor"
        subtitle="Track attendance against performance, watch the risk trend and send an early warning to the students who need it."
        actions={
          <>
            <MockBadge compact />
            <Button onClick={openWarn}>
              <Send className="h-4 w-4" aria-hidden />
              Send early warning
            </Button>
          </>
        }
      />

      {/* ---------- filters (re-filter the table AND the scatter plot) ---------- */}
      <div className="flex flex-col gap-3 rounded-2xl border border-line bg-panel px-4 py-3.5 shadow-card sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[13px] font-medium text-ink">Risk level</span>
            <SegmentedControl
              options={[
                { value: 'all', label: 'All' },
                { value: 'High', label: 'High' },
                { value: 'Medium', label: 'Medium' },
                { value: 'Low', label: 'Low' },
              ]}
              value={riskFilter}
              onChange={setRiskFilter}
            />
          </div>
          <div className="w-full sm:w-64">
            <Select
              label="Department"
              placeholder="All departments"
              options={toOptions(DEPARTMENTS)}
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center gap-3 sm:pb-0.5">
          <span className="text-[12.5px] tabular-nums text-ink-subtle">
            {filteredStudents.length} of {STUDENTS.length} students in view
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            disabled={riskFilter === 'all' && !department}
          >
            Clear filters
          </Button>
        </div>
      </div>

      {/* ---------- charts ---------- */}
      <div className="grid gap-5 xl:grid-cols-2">
        <ChartCard
          title="Attendance vs performance"
          description="Each dot is one student in the current filter, coloured by risk band."
          icon={<CalendarCheck2 className="h-4.5 w-4.5" aria-hidden />}
          actions={<MockBadge compact />}
        >
          {scatterPoints.length === 0 ? (
            <EmptyState
              title="No students to plot"
              description="The active filters exclude every student. Clear them to see the full scatter plot."
            />
          ) : (
            <RiskScatter points={scatterPoints} height={300} />
          )}
        </ChartCard>

        <ChartCard
          title="Risk trend"
          description="Students per risk band across the last six review cycles."
          icon={<TriangleAlert className="h-4.5 w-4.5" aria-hidden />}
          footer={
            <div className="flex flex-wrap items-center gap-4 border-t border-line px-5 py-3 text-[11.5px] text-ink-muted">
              {TREND_SERIES.map((s) => (
                <span key={s.key} className="inline-flex items-center gap-1.5">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: s.color }}
                    aria-hidden
                  />
                  {s.name}
                </span>
              ))}
            </div>
          }
        >
          <TrendChart data={RISK_TREND} xKey="month" series={TREND_SERIES} height={300} />
        </ChartCard>
      </div>

      <ChartCard
        title="Subject risk spread"
        description="How many students sit in each risk band per subject."
        icon={<ShieldAlert className="h-4.5 w-4.5" aria-hidden />}
        actions={<MockBadge compact />}
      >
        <CategoryBar
          data={subjectRiskData}
          xKey="label"
          bars={SUBJECT_BARS}
          stacked
          height={280}
          unit=""
        />
      </ChartCard>

      {/* ---------- early warning list ---------- */}
      <Card>
        <CardHeader
          title="Early warning list"
          description="High-risk students plus anyone whose attendance has dropped below 70%."
          actions={<MockBadge compact />}
        />
        {warnings.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={<Users className="h-5 w-5" aria-hidden />}
              title="No students match the current filters"
              description="Nobody in this risk band and department meets the early-warning rules right now."
              action={
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear filters
                </Button>
              }
            />
          </div>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[680px] border-collapse text-left">
              <thead>
                <tr className="border-y border-line bg-panel-muted/70">
                  <th scope="col" className="px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">
                    Student
                  </th>
                  <th scope="col" className="px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">
                    Department
                  </th>
                  <th scope="col" className="px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">
                    Attendance
                  </th>
                  <th scope="col" className="px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">
                    Risk score
                  </th>
                  <th scope="col" className="px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">
                    Top factor
                  </th>
                  <th scope="col" className="px-5 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {warnings.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-line transition-colors last:border-0 hover:bg-panel-muted/60"
                  >
                    <td className="px-5 py-3">
                      <Link
                        to={`/teacher/students/${s.id}`}
                        className="flex items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                      >
                        <Avatar name={s.name} tone={s.avatar} size="sm" />
                        <span className="min-w-0">
                          <span className="block truncate text-[13.5px] font-semibold text-ink">
                            {s.name}
                          </span>
                          <span className="block text-[11.5px] text-ink-subtle">{s.rollNo}</span>
                        </span>
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-[13px] text-ink-muted">{s.department}</td>
                    <td className="px-5 py-3">
                      <span
                        className={
                          s.attendance < 70
                            ? 'text-[13px] font-semibold tabular-nums text-red-600 dark:text-red-400'
                            : 'text-[13px] font-medium tabular-nums text-ink'
                        }
                      >
                        {s.attendance}%
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <RiskBadge level={s.risk} score={s.riskScore} size="sm" />
                    </td>
                    <td className="px-5 py-3 text-[13px] text-ink-muted">{s.topFactor}</td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        to={`/teacher/students/${s.id}`}
                        aria-label={`Open ${s.name}`}
                        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12.5px] font-medium text-accent transition-colors hover:bg-panel-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                      >
                        View <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <PrototypeNote />

      {/* ---------- send early warning modal ---------- */}
      <Modal
        open={warnOpen}
        onClose={() => setWarnOpen(false)}
        title="Send early warning"
        description="High-risk students are pre-selected. Uncheck anyone who should not receive this message."
        footer={
          <>
            <Button variant="ghost" onClick={() => setWarnOpen(false)}>
              Cancel
            </Button>
            <Button onClick={sendWarning}>
              <Send className="h-4 w-4" aria-hidden />
              Send warning
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="max-h-56 overflow-y-auto rounded-xl border border-line bg-panel-muted px-3.5 py-2.5">
            {highRisk.map((s) => (
              <Checkbox
                key={s.id}
                label={s.name}
                description={`${s.rollNo} · attendance ${s.attendance}% · risk score ${s.riskScore}`}
                checked={selected.includes(s.id)}
                onChange={(checked) => toggleStudent(s.id, checked)}
              />
            ))}
          </div>

          {warnError && (
            <p className="text-[12px] text-red-600 dark:text-red-400">{warnError}</p>
          )}

          <Textarea
            id="warning-message"
            label="Message"
            value={message}
            onChange={(e) => {
              setMessage(e.target.value)
              if (warnError) setWarnError('')
            }}
          />

          <p className="text-[12px] leading-relaxed text-ink-subtle">
            {selected.length} student{selected.length === 1 ? '' : 's'} selected · the alert is
            pushed to the teacher notification feed as a risk notification.
          </p>
        </div>
      </Modal>
    </div>
  )
}
