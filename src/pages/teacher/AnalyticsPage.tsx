import { useState } from 'react'
import { Building2, ShieldAlert, TrendingDown, TriangleAlert } from 'lucide-react'
import { Card, CardHeader, ChartCard, PageHeader, SegmentedControl } from '../../components/ui'
import {
  CategoryBar,
  DonutChart,
  TrendChart,
  type SeriesDef,
} from '../../components/charts/ChartPrimitives'
import { MockBadge, PrototypeNote } from '../../components/shared/MockBadge'
import {
  DEPARTMENT_PERFORMANCE,
  RISK_TREND,
  SEMESTER_COMPARISON,
  SUBJECT_RISK,
} from '../../data/seed'
import { CHART_COLORS, RISK_COLORS } from '../../utils/format'
import { shortDept } from './teacherHelpers'

const PERFORMANCE_BAR: SeriesDef = {
  key: 'performance',
  name: 'Performance',
  color: CHART_COLORS.primary,
}

const ATTENDANCE_BAR: SeriesDef = {
  key: 'attendance',
  name: 'Attendance',
  color: CHART_COLORS.secondary,
}

const SEMESTER_SERIES: SeriesDef[] = [
  { key: 'performance', name: 'Performance', color: CHART_COLORS.primary },
  { key: 'attendance', name: 'Attendance', color: CHART_COLORS.secondary },
  { key: 'completion', name: 'Assignment completion', color: CHART_COLORS.success },
]

const SERIES_OPTIONS = [
  { value: 'both', label: 'Both' },
  { value: 'performance', label: 'Performance' },
  { value: 'attendance', label: 'Attendance' },
]

export function AnalyticsPage() {
  const [seriesMode, setSeriesMode] = useState('both')

  const deptData = DEPARTMENT_PERFORMANCE.map((d) => ({ ...d, dept: shortDept(d.department) }))
  const bars: SeriesDef[] =
    seriesMode === 'performance'
      ? [PERFORMANCE_BAR]
      : seriesMode === 'attendance'
        ? [ATTENDANCE_BAR]
        : [PERFORMANCE_BAR, ATTENDANCE_BAR]

  const subjectTotals = SUBJECT_RISK.reduce(
    (acc, s) => ({ high: acc.high + s.high, medium: acc.medium + s.medium, low: acc.low + s.low }),
    { high: 0, medium: 0, low: 0 },
  )
  const totalRatings = subjectTotals.high + subjectTotals.medium + subjectTotals.low

  const donutData = [
    { name: 'High risk', value: subjectTotals.high, color: RISK_COLORS.High.hex },
    { name: 'Medium risk', value: subjectTotals.medium, color: RISK_COLORS.Medium.hex },
    { name: 'Low risk', value: subjectTotals.low, color: RISK_COLORS.Low.hex },
  ]

  // ---------- derived insights ----------
  const weakest = DEPARTMENT_PERFORMANCE.reduce((a, b) =>
    b.performance < a.performance ? b : a,
  )
  const riskiestSubject = SUBJECT_RISK.reduce((a, b) => (b.high > a.high ? b : a))
  const semFirst = SEMESTER_COMPARISON[0]
  const semLast = SEMESTER_COMPARISON[SEMESTER_COMPARISON.length - 1]
  const semesterSlide = semFirst.performance - semLast.performance
  const trendFirst = RISK_TREND[0]
  const trendLast = RISK_TREND[RISK_TREND.length - 1]
  const highDelta = trendLast.high - trendFirst.high

  const insights = [
    {
      icon: <Building2 className="h-4 w-4" aria-hidden />,
      text: `${weakest.department} is the weakest department in view — ${weakest.performance}% performance against ${weakest.attendance}% attendance across ${weakest.students} students.`,
    },
    {
      icon: <ShieldAlert className="h-4 w-4" aria-hidden />,
      text: `${riskiestSubject.subject} carries the most High-risk students (${riskiestSubject.high} of ${riskiestSubject.high + riskiestSubject.medium + riskiestSubject.low} subject ratings).`,
    },
    {
      icon: <TrendingDown className="h-4 w-4" aria-hidden />,
      text: `Performance slides ${semesterSlide} points from ${semFirst.semester} to ${semLast.semester} (attendance drops ${semFirst.attendance - semLast.attendance} points over the same span).`,
    },
    {
      icon: <TriangleAlert className="h-4 w-4" aria-hidden />,
      text: `High-risk headcount moved from ${trendFirst.high} in ${trendFirst.month} to ${trendLast.high} in ${trendLast.month} (${highDelta >= 0 ? '+' : ''}${highDelta}), so early-warning capacity should scale with it.`,
    },
  ]

  return (
    <div className="animate-fade-in-up space-y-5 sm:space-y-6">
      <PageHeader
        title="Analytics"
        subtitle="Department, semester and subject-level trends for the demo cohort. Everything below is derived from the seed data."
        actions={<MockBadge compact />}
      />

      {/* ---------- department comparison ---------- */}
      <ChartCard
        title="Department performance vs attendance"
        description={
          seriesMode === 'both'
            ? 'Two series plotted together — switch the control to isolate one.'
            : seriesMode === 'performance'
              ? 'Showing the performance series only.'
              : 'Showing the attendance series only.'
        }
        actions={
          <SegmentedControl
            options={SERIES_OPTIONS}
            value={seriesMode}
            onChange={setSeriesMode}
          />
        }
      >
        <CategoryBar data={deptData} xKey="dept" bars={bars} height={280} />
      </ChartCard>

      <div className="grid gap-5 xl:grid-cols-2">
        {/* ---------- semester trend ---------- */}
        <ChartCard
          title="Semester comparison"
          description="Performance, attendance and assignment completion per semester."
          footer={
            <div className="flex flex-wrap items-center gap-4 border-t border-line px-5 py-3 text-[11.5px] text-ink-muted">
              {SEMESTER_SERIES.map((s) => (
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
          <TrendChart
            data={SEMESTER_COMPARISON}
            xKey="semester"
            series={SEMESTER_SERIES}
            height={280}
          />
        </ChartCard>

        {/* ---------- subject risk donut ---------- */}
        <ChartCard
          title="Subject risk distribution"
          description="Aggregated High / Medium / Low ratings across every subject."
          icon={<ShieldAlert className="h-4.5 w-4.5" aria-hidden />}
          actions={<MockBadge compact />}
        >
          <DonutChart
            data={donutData}
            centerLabel={String(totalRatings)}
            centerSub="subject ratings"
            height={260}
          />
        </ChartCard>
      </div>

      {/* ---------- key insights ---------- */}
      <Card>
        <CardHeader
          title="Key insights"
          description="Computed live from the seed arrays — change the data and these sentences change."
          actions={<MockBadge compact />}
        />
        <ul className="mt-3 space-y-2.5 border-t border-line px-5 py-4">
          {insights.map((insight, idx) => (
            <li
              key={idx}
              className="flex items-start gap-3 rounded-xl border border-line bg-panel-muted/50 px-3.5 py-3"
            >
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-panel text-accent">
                {insight.icon}
              </span>
              <p className="text-[13px] leading-relaxed text-ink-muted">{insight.text}</p>
            </li>
          ))}
        </ul>
      </Card>

      <PrototypeNote />
    </div>
  )
}
