import { useMemo, useState } from 'react'
import { BookOpen, Building2, CalendarRange, Lightbulb, ShieldAlert } from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  ChartCard,
  PageHeader,
  SegmentedControl,
  Tabs,
} from '../../components/ui'
import { CategoryBar, TrendChart, type SeriesDef } from '../../components/charts/ChartPrimitives'
import { PrototypeNote } from '../../components/shared/MockBadge'
import {
  DEPARTMENT_PERFORMANCE,
  DROPOUT_RISK_TREND,
  RISK_TREND,
  SEMESTER_COMPARISON,
  SUBJECT_RISK,
} from '../../data/seed'
import { CHART_COLORS, RISK_COLORS } from '../../utils/format'
import { shortDept } from './institutionHelpers'

type DeptMetric = 'compare' | 'performance' | 'attendance' | 'students'

const PERF_BAR: SeriesDef = { key: 'performance', name: 'Performance', color: CHART_COLORS.primary }
const ATT_BAR: SeriesDef = { key: 'attendance', name: 'Attendance', color: CHART_COLORS.secondary }
const STUDENTS_BAR: SeriesDef = { key: 'students', name: 'Students', color: CHART_COLORS.purple }

export function AnalyticsPage() {
  const [tab, setTab] = useState('departments')
  const [deptMetric, setDeptMetric] = useState<DeptMetric>('compare')

  const deptData = useMemo(
    () =>
      DEPARTMENT_PERFORMANCE.map((d) => ({
        dept: shortDept(d.department),
        performance: d.performance,
        attendance: d.attendance,
        students: d.students,
      })),
    [],
  )

  const deptBars: SeriesDef[] =
    deptMetric === 'performance'
      ? [PERF_BAR]
      : deptMetric === 'attendance'
        ? [ATT_BAR]
        : deptMetric === 'students'
          ? [STUDENTS_BAR]
          : [PERF_BAR, ATT_BAR]

  const riskSeries: SeriesDef[] = [
    { key: 'high', name: 'High risk', color: RISK_COLORS.High.hex },
    { key: 'medium', name: 'Medium risk', color: RISK_COLORS.Medium.hex },
    { key: 'low', name: 'Low risk', color: RISK_COLORS.Low.hex },
  ]

  const semesterSeries: SeriesDef[] = [
    { key: 'performance', name: 'Performance', color: CHART_COLORS.primary },
    { key: 'attendance', name: 'Attendance', color: CHART_COLORS.secondary },
    { key: 'completion', name: 'Completion', color: CHART_COLORS.cyan },
  ]

  const dropoutBars: SeriesDef[] = [
    { key: 'flagged', name: 'Flagged', color: CHART_COLORS.danger },
    { key: 'intervened', name: 'Intervened', color: CHART_COLORS.success },
  ]

  const subjectBars: SeriesDef[] = [
    { key: 'high', name: 'High risk', color: RISK_COLORS.High.hex },
    { key: 'medium', name: 'Medium risk', color: RISK_COLORS.Medium.hex },
    { key: 'low', name: 'Low risk', color: RISK_COLORS.Low.hex },
  ]

  const insights = useMemo(() => {
    const lowest = DEPARTMENT_PERFORMANCE.reduce((a, b) =>
      b.performance < a.performance ? b : a,
    )
    let dropFrom = SEMESTER_COMPARISON[0]
    let dropTo = SEMESTER_COMPARISON[0]
    let maxDrop = 0
    for (let i = 1; i < SEMESTER_COMPARISON.length; i++) {
      const drop = SEMESTER_COMPARISON[i - 1].performance - SEMESTER_COMPARISON[i].performance
      if (drop > maxDrop) {
        maxDrop = drop
        dropFrom = SEMESTER_COMPARISON[i - 1]
        dropTo = SEMESTER_COMPARISON[i]
      }
    }
    const riskiest = SUBJECT_RISK.reduce((a, b) => (b.high > a.high ? b : a))
    const last = DROPOUT_RISK_TREND[DROPOUT_RISK_TREND.length - 1]
    const coverage = Math.round((last.intervened / last.flagged) * 100)

    return [
      {
        title: `${lowest.department} needs attention`,
        detail: `Lowest department performance at ${lowest.performance}%, with ${lowest.attendance}% average attendance across ${lowest.students} students.`,
      },
      {
        title: `Steepest slide: ${dropFrom.semester} → ${dropTo.semester}`,
        detail: `Performance fell ${maxDrop} percentage points (${dropFrom.performance}% → ${dropTo.performance}%) between these semesters.`,
      },
      {
        title: `${riskiest.subject} carries the most risk`,
        detail: `${riskiest.high} of ${riskiest.high + riskiest.medium + riskiest.low} students are flagged High risk in this subject.`,
      },
      {
        title: `${coverage}% intervention coverage in ${last.month}`,
        detail: `${last.intervened} of ${last.flagged} flagged students received support — ${last.flagged - last.intervened} still need follow-up.`,
      },
    ]
  }, [])

  return (
    <div className="animate-fade-in-up space-y-5 sm:space-y-6">
      <PageHeader
        title="Analytics"
        subtitle="Department, semester, risk-trend and subject-level aggregates across the institution."
      />

      <div className="overflow-x-auto">
        <Tabs
          className="max-w-2xl"
          items={[
            { value: 'departments', label: 'Departments', icon: <Building2 className="h-3.5 w-3.5" aria-hidden /> },
            { value: 'semesters', label: 'Semesters', icon: <CalendarRange className="h-3.5 w-3.5" aria-hidden /> },
            { value: 'risk', label: 'Risk trends', icon: <ShieldAlert className="h-3.5 w-3.5" aria-hidden /> },
            { value: 'subjects', label: 'Subjects', icon: <BookOpen className="h-3.5 w-3.5" aria-hidden /> },
          ]}
          value={tab}
          onChange={setTab}
        />
      </div>

      <div key={tab} className="animate-fade-in space-y-5">
        {tab === 'departments' && (
          <ChartCard
            title="Department comparison"
            description={
              deptMetric === 'students'
                ? 'Enrolled demo students per department.'
                : deptMetric === 'compare'
                  ? 'Performance and attendance percentages side by side.'
                  : `${deptMetric === 'performance' ? 'Performance' : 'Attendance'} percentage per department.`
            }
            icon={<Building2 className="h-4.5 w-4.5" aria-hidden />}
            actions={
              <SegmentedControl
                options={[
                  { value: 'compare', label: 'All metrics' },
                  { value: 'performance', label: 'Performance' },
                  { value: 'attendance', label: 'Attendance' },
                  { value: 'students', label: 'Students' },
                ]}
                value={deptMetric}
                onChange={(v) => setDeptMetric(v as DeptMetric)}
              />
            }
          >
            <CategoryBar
              data={deptData}
              xKey="dept"
              bars={deptBars}
              height={300}
              unit={deptMetric === 'students' ? '' : '%'}
            />
          </ChartCard>
        )}

        {tab === 'semesters' && (
          <ChartCard
            title="Semester comparison"
            description="Performance, attendance and completion rates across semesters."
            icon={<CalendarRange className="h-4 w-4" aria-hidden />}
          >
            <TrendChart data={SEMESTER_COMPARISON} xKey="semester" series={semesterSeries} height={300} />
          </ChartCard>
        )}

        {tab === 'risk' && (
          <div className="grid gap-5 xl:grid-cols-2">
            <ChartCard
              title="Risk level trend"
              description="Number of students per risk level, month by month."
              icon={<ShieldAlert className="h-4 w-4" aria-hidden />}
            >
              <TrendChart data={RISK_TREND} xKey="month" series={riskSeries} height={280} unit="" />
            </ChartCard>

            <ChartCard
              title="Dropout-risk flags vs interventions"
              description="Students flagged as dropout-risk compared with those who received an intervention."
              icon={<ShieldAlert className="h-4 w-4" aria-hidden />}
            >
              <CategoryBar data={DROPOUT_RISK_TREND} xKey="month" bars={dropoutBars} height={280} unit="" />
            </ChartCard>
          </div>
        )}

        {tab === 'subjects' && (
          <ChartCard
            title="Subject risk profile"
            description="Stacked High / Medium / Low risk student counts per subject."
            icon={<BookOpen className="h-4 w-4" aria-hidden />}
          >
            <CategoryBar data={SUBJECT_RISK} xKey="subject" bars={subjectBars} stacked height={320} unit="" />
          </ChartCard>
        )}
      </div>

      {/* ---------- key insights ---------- */}
      <Card>
        <CardHeader
          icon={<Lightbulb className="h-4.5 w-4.5" aria-hidden />}
          title="Key insights"
          description="Computed directly from the seeded institutional data sets."
        />
        <CardContent className="pt-2">
          <div className="grid gap-3 sm:grid-cols-2">
            {insights.map((insight) => (
              <div key={insight.title} className="flex gap-3 rounded-xl border border-line bg-panel-muted px-4 py-3.5">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                <div className="min-w-0">
                  <p className="text-[13.5px] font-semibold text-ink">{insight.title}</p>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-muted">{insight.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <PrototypeNote />
    </div>
  )
}
