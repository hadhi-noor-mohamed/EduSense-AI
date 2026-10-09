import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  CalendarCheck,
  CalendarDays,
  ShieldAlert,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  EmptyState,
  PageHeader,
  Progress,
  SegmentedControl,
  Select,
  StatCard,
} from '../../components/ui'
import { ChartCard } from '../../components/ui/ChartCard'
import { TrendChart } from '../../components/charts/ChartPrimitives'
import { ATTENDANCE_RECORDS, SUBJECTS } from '../../data/seed'
import { CHART_COLORS } from '../../utils/format'
import { cn } from '../../utils/cn'

const ATTENDANCE_THRESHOLD = 75

type SubjectRow = { subject: string; value: number }

export function AttendancePage() {
  const navigate = useNavigate()
  const [view, setView] = useState('trend')
  const [month, setMonth] = useState(ATTENDANCE_RECORDS[ATTENDANCE_RECORDS.length - 1]?.month ?? '')
  const [scope, setScope] = useState('all')

  const chartData: Record<string, string | number>[] = ATTENDANCE_RECORDS.map((r) => ({
    month: r.month,
    overall: r.overall,
    requirement: ATTENDANCE_THRESHOLD,
  }))

  const current = ATTENDANCE_RECORDS[ATTENDANCE_RECORDS.length - 1]
  const first = ATTENDANCE_RECORDS[0]
  const change = current && first ? current.overall - first.overall : 0
  const monthsBelow = ATTENDANCE_RECORDS.filter(
    (r) => r.overall < ATTENDANCE_THRESHOLD,
  ).length

  const subjectRows: SubjectRow[] = (() => {
    const rec = ATTENDANCE_RECORDS.find((r) => r.month === month)
    if (!rec) return []
    return SUBJECTS.map((s) => ({ subject: s.name, value: rec.bySubject[s.name] ?? 0 }))
  })()

  const visibleRows =
    scope === 'below'
      ? subjectRows.filter((r) => r.value < ATTENDANCE_THRESHOLD)
      : subjectRows

  const belowCount = subjectRows.filter((r) => r.value < ATTENDANCE_THRESHOLD).length
  const weakest = [...subjectRows].sort((a, b) => a.value - b.value)[0]

  return (
    <div className="animate-fade-in-up space-y-5 sm:space-y-6">
      <PageHeader
        title="Attendance"
        subtitle="Month-by-month attendance overall and per subject — attendance below 75% feeds directly into your risk score."
        actions={
          <SegmentedControl
            options={[
              { value: 'trend', label: 'Overall trend' },
              { value: 'subjects', label: 'By subject' },
            ]}
            value={view}
            onChange={setView}
          />
        }
      />

      {/* ---------------- stat cards ---------------- */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Current attendance"
          value={current?.overall ?? 0}
          unit="%"
          tone={current && current.overall < ATTENDANCE_THRESHOLD ? 'danger' : 'success'}
          hint="Semester to date"
          icon={<CalendarCheck className="h-4 w-4" aria-hidden />}
        />
        <StatCard
          label="Change since March"
          value={change}
          unit="%"
          tone={change < 0 ? 'danger' : 'success'}
          hint={`${first?.overall ?? 0}% → ${current?.overall ?? 0}%`}
          icon={change < 0 ? <TrendingDown className="h-4 w-4" aria-hidden /> : <TrendingUp className="h-4 w-4" aria-hidden />}
        />
        <StatCard
          label="Months below 75%"
          value={monthsBelow}
          tone={monthsBelow > 0 ? 'warning' : 'success'}
          hint={`of ${ATTENDANCE_RECORDS.length} months tracked`}
          icon={<CalendarDays className="h-4 w-4" aria-hidden />}
        />
        <StatCard
          label="Weakest subject"
          value={weakest ? weakest.value : '—'}
          unit={weakest ? '%' : undefined}
          tone="danger"
          hint={weakest ? weakest.subject : 'No data'}
          icon={<ShieldAlert className="h-4 w-4" aria-hidden />}
        />
      </div>

      {view === 'trend' ? (
        <ChartCard
          title="Overall attendance trend"
          description="Solid line is your attendance; dashed reference sits at the 75% requirement."
          icon={<TrendingDown className="h-4.5 w-4.5" aria-hidden />}
          footer={
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3.5">
              <p className="text-[12.5px] text-ink-subtle">
                {monthsBelow} of {ATTENDANCE_RECORDS.length} months sit below the 75% requirement.
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate('/student/risk-analysis')}
              >
                See how this affects your risk
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Button>
            </div>
          }
        >
          <TrendChart
            data={chartData}
            xKey="month"
            area
            yDomain={[30, 100]}
            series={[
              { key: 'overall', name: 'Overall attendance', color: CHART_COLORS.secondary },
              { key: 'requirement', name: '75% requirement', color: CHART_COLORS.danger },
            ]}
          />
        </ChartCard>
      ) : (
        <Card>
          <CardHeader
            icon={<CalendarDays className="h-4.5 w-4.5" aria-hidden />}
            title="Attendance by subject"
            description="Pick a month to see where every subject stands against the 75% requirement."
            actions={
              <div className="flex flex-wrap items-center gap-2">
                <div className="w-32">
                  <Select
                    label="Month"
                    options={ATTENDANCE_RECORDS.map((r) => ({ value: r.month, label: r.month }))}
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                  />
                </div>
                <div className="min-w-[150px]">
                  <span className="mb-1.5 block text-[13px] font-medium text-ink">Show</span>
                  <SegmentedControl
                    options={[
                      { value: 'all', label: 'All subjects' },
                      { value: 'below', label: `Below ${ATTENDANCE_THRESHOLD}%` },
                    ]}
                    value={scope}
                    onChange={setScope}
                  />
                </div>
              </div>
            }
          />
          <CardContent className="pt-3">
            {visibleRows.length === 0 ? (
              <EmptyState
                icon={<CalendarCheck className="h-5 w-5" aria-hidden />}
                title={`No subjects below ${ATTENDANCE_THRESHOLD}% in ${month}`}
                description={
                  scope === 'below'
                    ? `Every subject met the requirement this month — switch back to “All subjects” to see the full breakdown.`
                    : 'No attendance records are available for this month.'
                }
                action={
                  scope === 'below' ? (
                    <Button size="sm" variant="outline" onClick={() => setScope('all')}>
                      Show all subjects
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              <ul className="space-y-3.5">
                {visibleRows.map((row) => {
                  const below = row.value < ATTENDANCE_THRESHOLD
                  return (
                    <li key={row.subject}>
                      <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2 text-[13px]">
                        <span className="font-medium text-ink">{row.subject}</span>
                        <span className="flex items-center gap-2">
                          {below && <Badge tone="danger">Below {ATTENDANCE_THRESHOLD}%</Badge>}
                          <span
                            className={cn(
                              'font-semibold tabular-nums',
                              below ? 'text-red-600 dark:text-red-400' : 'text-ink',
                            )}
                          >
                            {row.value}%
                          </span>
                        </span>
                      </div>
                      <Progress
                        value={row.value}
                        height="h-2"
                        barClassName={
                          below
                            ? 'bg-red-500'
                            : row.value >= 85
                              ? 'bg-emerald-500'
                              : undefined
                        }
                      />
                    </li>
                  )
                })}
              </ul>
            )}

            <p className="mt-4 border-t border-line pt-3 text-[12.5px] text-ink-subtle">
              {belowCount === 0
                ? `All ${subjectRows.length} subjects are at or above ${ATTENDANCE_THRESHOLD}% in ${month}.`
                : `${belowCount} of ${subjectRows.length} subjects fall below ${ATTENDANCE_THRESHOLD}% in ${month}.`}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
