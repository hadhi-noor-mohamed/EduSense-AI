import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Building2,
  CalendarCheck2,
  FileCheck2,
  ShieldAlert,
  TrendingUp,
  TriangleAlert,
  Users,
} from 'lucide-react'
import {
  Avatar,
  Button,
  Card,
  CardHeader,
  ChartCard,
  EmptyState,
  PageHeader,
  RiskBadge,
  StatCard,
} from '../../components/ui'
import { CategoryBar, DonutChart } from '../../components/charts/ChartPrimitives'
import { FilterBar, toOptions } from '../../components/shared/FilterBar'
import { MockBadge, PrototypeNote } from '../../components/shared/MockBadge'
import {
  COURSES,
  DEPARTMENTS,
  DEPARTMENT_PERFORMANCE,
  SEMESTERS,
  STUDENTS,
  YEARS,
} from '../../data/seed'
import { CHART_COLORS, RISK_COLORS } from '../../utils/format'
import { pctOf, shortDept } from './institutionHelpers'

const RISK_LEVELS = ['High', 'Medium', 'Low'] as const

const DEPT_BARS = [
  { key: 'performance', name: 'Performance', color: CHART_COLORS.primary },
  { key: 'attendance', name: 'Attendance', color: CHART_COLORS.secondary },
]

export function DashboardPage() {
  const navigate = useNavigate()

  const [department, setDepartment] = useState('')
  const [year, setYear] = useState('')
  const [semester, setSemester] = useState('')
  const [course, setCourse] = useState('')

  const filtered = useMemo(
    () =>
      STUDENTS.filter(
        (s) =>
          (!department || s.department === department) &&
          (!year || s.year === year) &&
          (!semester || s.semester === semester) &&
          (!course || s.course === course),
      ),
    [department, year, semester, course],
  )

  const stats = useMemo(() => {
    const total = filtered.length
    const high = filtered.filter((s) => s.risk === 'High').length
    const avgAttendance = total
      ? Math.round(filtered.reduce((a, s) => a + s.attendance, 0) / total)
      : 0
    const avgPerformance = total
      ? Math.round(filtered.reduce((a, s) => a + s.overallPerformance, 0) / total)
      : 0
    return { total, high, avgAttendance, avgPerformance, highPct: pctOf(high, total) }
  }, [filtered])

  const donutData = useMemo(() => {
    const counts: Record<(typeof RISK_LEVELS)[number], number> = { High: 0, Medium: 0, Low: 0 }
    for (const s of filtered) counts[s.risk] += 1
    return RISK_LEVELS.map((level) => ({
      name: `${level} risk`,
      value: counts[level],
      color: RISK_COLORS[level].hex,
    }))
  }, [filtered])

  const deptRows = useMemo(
    () =>
      DEPARTMENT_PERFORMANCE.filter((d) => !department || d.department === department).map((d) => ({
        ...d,
        dept: shortDept(d.department),
      })),
    [department],
  )

  const attention = useMemo(
    () => [...filtered].sort((a, b) => b.riskScore - a.riskScore).slice(0, 6),
    [filtered],
  )

  const filters = [
    { key: 'dept', label: 'Department', value: department, options: toOptions(DEPARTMENTS), onChange: setDepartment },
    { key: 'year', label: 'Year', value: year, options: toOptions(YEARS), onChange: setYear },
    { key: 'sem', label: 'Semester', value: semester, options: toOptions(SEMESTERS), onChange: setSemester },
    { key: 'course', label: 'Course', value: course, options: toOptions(COURSES), onChange: setCourse },
  ]

  return (
    <div className="animate-fade-in-up space-y-5 sm:space-y-6">
      <PageHeader
        title="Institution dashboard"
        subtitle="SRM Institute of Technology · cohort risk and performance overview for the current academic term."
        actions={
          <>
            <MockBadge compact />
            <Button variant="secondary" onClick={() => navigate('/institution/analytics')}>
              <TrendingUp className="h-4 w-4" aria-hidden />
              View analytics
            </Button>
            <Button onClick={() => navigate('/institution/reports')}>
              <FileCheck2 className="h-4 w-4" aria-hidden />
              Generate report
            </Button>
          </>
        }
      />

      <FilterBar
        filters={filters}
        onReset={() => {
          setDepartment('')
          setYear('')
          setSemester('')
          setCourse('')
        }}
        right={
          <span className="text-[12.5px] text-ink-subtle">
            {stats.total} of {STUDENTS.length} students in view
          </span>
        }
      />

      {/* ---------- key stats (derived from the filtered cohort) ---------- */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        <StatCard
          label="Students in scope"
          value={stats.total}
          icon={<Users className="h-4 w-4" aria-hidden />}
          tone="brand"
          hint={`of ${STUDENTS.length} in the demo cohort`}
        />
        <StatCard
          label="High risk"
          value={stats.high}
          icon={<ShieldAlert className="h-4 w-4" aria-hidden />}
          tone="danger"
          hint="flagged by the mock prediction service"
        />
        <StatCard
          label="Avg attendance"
          value={stats.avgAttendance}
          unit="%"
          icon={<CalendarCheck2 className="h-4 w-4" aria-hidden />}
          tone="info"
        />
        <StatCard
          label="Avg performance"
          value={stats.avgPerformance}
          unit="%"
          icon={<TrendingUp className="h-4 w-4" aria-hidden />}
          tone="success"
        />
        <StatCard
          label="At-risk %"
          value={stats.highPct}
          unit="%"
          icon={<TriangleAlert className="h-4 w-4" aria-hidden />}
          tone="warning"
          hint="share of students at High risk"
        />
      </div>

      {/* ---------- charts ---------- */}
      <div className="grid gap-5 xl:grid-cols-2">
        <ChartCard
          title="Risk distribution"
          description="High / Medium / Low split of the students currently in scope."
          icon={<ShieldAlert className="h-4.5 w-4.5" aria-hidden />}
        >
          {stats.total === 0 ? (
            <EmptyState
              title="No students in scope"
              description="No students match the active filters, so there is nothing to plot."
            />
          ) : (
            <DonutChart
              data={donutData}
              centerLabel={String(stats.total)}
              centerSub="students"
            />
          )}
        </ChartCard>

        <ChartCard
          title="Department performance vs attendance"
          description={
            department
              ? `Showing ${shortDept(department)} only. Clear the department filter to compare all departments.`
              : 'Aggregate performance and attendance percentages per department.'
          }
          icon={<Building2 className="h-4.5 w-4.5" aria-hidden />}
        >
          <CategoryBar data={deptRows} xKey="dept" bars={DEPT_BARS} height={260} unit="%" />
        </ChartCard>
      </div>

      {/* ---------- students needing attention ---------- */}
      <Card>
        <CardHeader
          title="Students needing attention"
          description="Top 6 by demo risk score within the current filters. Open a student to review factors and interventions."
          actions={<MockBadge compact />}
        />
        {attention.length === 0 ? (
          <div className="p-5">
            <EmptyState
              title="No students match the filters"
              description="Adjust or clear the filters above to see students again."
            />
          </div>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[700px] border-collapse text-left">
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
                    <span className="sr-only">View</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {attention.map((s) => (
                  <tr key={s.id} className="border-b border-line transition-colors last:border-0 hover:bg-panel-muted/60">
                    <td className="px-5 py-3">
                      <Link
                        to={`/teacher/students/${s.id}`}
                        className="flex items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                      >
                        <Avatar name={s.name} tone={s.avatar} size="sm" />
                        <span className="min-w-0">
                          <span className="block truncate text-[13.5px] font-semibold text-ink">{s.name}</span>
                          <span className="block text-[11.5px] text-ink-subtle">{s.rollNo}</span>
                        </span>
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-[13px] text-ink-muted">{shortDept(s.department)}</td>
                    <td className="px-5 py-3 text-[13px] tabular-nums text-ink-muted">{s.attendance}%</td>
                    <td className="px-5 py-3">
                      <RiskBadge level={s.risk} score={s.riskScore} size="sm" />
                    </td>
                    <td className="px-5 py-3 text-[13px] text-ink-muted">{s.topFactor}</td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        to={`/teacher/students/${s.id}`}
                        aria-label={`View ${s.name}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-panel-muted hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                      >
                        <ArrowRight className="h-4 w-4" aria-hidden />
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
    </div>
  )
}
