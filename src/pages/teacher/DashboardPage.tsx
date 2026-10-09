import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  CalendarCheck2,
  ClipboardList,
  ShieldAlert,
  TriangleAlert,
  Users,
} from 'lucide-react'
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardHeader,
  ChartCard,
  EmptyState,
  PageHeader,
  RiskBadge,
  StatCard,
} from '../../components/ui'
import { DonutChart, TrendChart } from '../../components/charts/ChartPrimitives'
import { MockBadge, PrototypeNote } from '../../components/shared/MockBadge'
import { useAppStore } from '../../store/useAppStore'
import { RISK_TREND, STUDENTS, TEACHERS } from '../../data/seed'
import { RISK_COLORS, formatDate } from '../../utils/format'
import { avgOf, followUpLabel, interventionTone, isOverdue, riskCounts } from './teacherHelpers'

const TEACHER = TEACHERS[0]

const TREND_SERIES = [
  { key: 'high', name: 'High risk', color: RISK_COLORS.High.hex },
  { key: 'medium', name: 'Medium risk', color: RISK_COLORS.Medium.hex },
  { key: 'low', name: 'Low risk', color: RISK_COLORS.Low.hex },
]

export function DashboardPage() {
  const navigate = useNavigate()
  const interventions = useAppStore((s) => s.interventions)

  const counts = riskCounts(STUDENTS)
  const avgAttendance = avgOf(STUDENTS.map((s) => s.attendance))
  const openInterventions = interventions.filter((i) => i.status !== 'Completed')
  const topWarnings = [...STUDENTS].sort((a, b) => b.riskScore - a.riskScore).slice(0, 6)

  const donutData = [
    { name: 'High risk', value: counts.High, color: RISK_COLORS.High.hex },
    { name: 'Medium risk', value: counts.Medium, color: RISK_COLORS.Medium.hex },
    { name: 'Low risk', value: counts.Low, color: RISK_COLORS.Low.hex },
  ]

  return (
    <div className="animate-fade-in-up space-y-5 sm:space-y-6">
      <PageHeader
        title="Teacher dashboard"
        subtitle={`${TEACHER.name} · ${TEACHER.department} · teaching ${TEACHER.subjects.join(' and ')} — early-warning overview for the ${STUDENTS.length}-student demo cohort.`}
        actions={
          <>
            <MockBadge compact />
            <Button variant="secondary" onClick={() => navigate('/teacher/interventions')}>
              <ClipboardList className="h-4 w-4" aria-hidden />
              Interventions
            </Button>
            <Button onClick={() => navigate('/teacher/students')}>
              <Users className="h-4 w-4" aria-hidden />
              View all students
            </Button>
          </>
        }
      />

      {/* ---------- headline stats ---------- */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        <StatCard
          label="Students monitored"
          value={STUDENTS.length}
          icon={<Users className="h-4 w-4" aria-hidden />}
          tone="brand"
          hint="in your demo cohort"
          onClick={() => navigate('/teacher/students')}
        />
        <StatCard
          label="High risk"
          value={counts.High}
          icon={<ShieldAlert className="h-4 w-4" aria-hidden />}
          tone="danger"
          hint="flagged by the mock prediction service"
          onClick={() => navigate('/teacher/risk-monitor')}
        />
        <StatCard
          label="Medium risk"
          value={counts.Medium}
          icon={<TriangleAlert className="h-4 w-4" aria-hidden />}
          tone="warning"
          hint="watch-list students"
          onClick={() => navigate('/teacher/risk-monitor')}
        />
        <StatCard
          label="Avg attendance"
          value={avgAttendance}
          unit="%"
          icon={<CalendarCheck2 className="h-4 w-4" aria-hidden />}
          tone="info"
          hint="cohort average this term"
          onClick={() => navigate('/teacher/analytics')}
        />
        <StatCard
          label="Open interventions"
          value={openInterventions.length}
          icon={<ClipboardList className="h-4 w-4" aria-hidden />}
          tone="success"
          hint="not yet completed"
          onClick={() => navigate('/teacher/interventions')}
        />
      </div>

      {/* ---------- charts ---------- */}
      <div className="grid gap-5 xl:grid-cols-2">
        <ChartCard
          title="Risk distribution"
          description="High / Medium / Low split across the monitored cohort."
          icon={<ShieldAlert className="h-4.5 w-4.5" aria-hidden />}
        >
          <DonutChart data={donutData} centerLabel={String(STUDENTS.length)} centerSub="students" />
        </ChartCard>

        <ChartCard
          title="Risk trend"
          description="Share of students per risk band over the last six review cycles."
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
          <TrendChart data={RISK_TREND} xKey="month" series={TREND_SERIES} height={252} unit="%" />
        </ChartCard>
      </div>

      {/* ---------- early warnings + open interventions ---------- */}
      <div className="grid gap-5 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader
            title="Top early warnings"
            description="Six highest demo risk scores in the cohort — open a student to review contributing factors."
            actions={<MockBadge compact />}
          />
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left">
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
                    Risk
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
                {topWarnings.map((s) => (
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
                    <td className="px-5 py-3 text-[13px] tabular-nums text-ink-muted">
                      {s.attendance}%
                    </td>
                    <td className="px-5 py-3">
                      <RiskBadge level={s.risk} score={s.riskScore} size="sm" />
                    </td>
                    <td className="px-5 py-3 text-[13px] text-ink-muted">{s.topFactor}</td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        to={`/teacher/students/${s.id}`}
                        aria-label={`View ${s.name}`}
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
        </Card>

        <Card className="flex flex-col">
          <CardHeader
            title="Open interventions"
            description="Follow-ups that are still Pending or In Progress."
            actions={<MockBadge compact />}
          />
          <div className="mt-3 flex-1 space-y-2.5 px-5 pb-4">
            {openInterventions.length === 0 ? (
              <EmptyState
                title="Nothing open right now"
                description="Every logged intervention has been completed. Log a new one from the interventions page."
                action={
                  <Button size="sm" onClick={() => navigate('/teacher/interventions')}>
                    Open interventions
                  </Button>
                }
              />
            ) : (
              openInterventions.slice(0, 4).map((i) => (
                <div
                  key={i.id}
                  className="rounded-xl border border-line bg-panel-muted/50 px-3.5 py-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      to={`/teacher/students/${i.studentId}`}
                      className="min-w-0 text-[13.5px] font-semibold text-ink transition-colors hover:text-accent"
                    >
                      {i.studentName}
                    </Link>
                    <Badge tone={interventionTone(i.status)}>{i.status}</Badge>
                  </div>
                  <p className="mt-1 truncate text-[13px] text-ink-muted">{i.intervention}</p>
                  <p className="mt-1.5 flex flex-wrap items-center gap-2 text-[11.5px] text-ink-subtle">
                    <span>Follow-up {formatDate(i.followUpDate)}</span>
                    <span
                      className={
                        isOverdue(i.followUpDate)
                          ? 'font-semibold text-red-600 dark:text-red-400'
                          : 'text-ink-faint'
                      }
                    >
                      {followUpLabel(i.followUpDate)}
                    </span>
                  </p>
                </div>
              ))
            )}
          </div>
          <div className="border-t border-line px-5 py-3.5">
            <Link
              to="/teacher/interventions"
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-accent transition-colors hover:text-brand-700"
            >
              Manage all interventions
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
        </Card>
      </div>

      <PrototypeNote />
    </div>
  )
}
