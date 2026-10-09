import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  CalendarCheck,
  ClipboardCheck,
  ListChecks,
  PenLine,
  TrendingUp,
} from 'lucide-react'
import {
  Badge,
  Button,
  Modal,
  PageHeader,
  PageSection,
  RiskBadge,
  SegmentedControl,
  StatCard,
  Tabs,
  ChartCard,
} from '../../components/ui'
import { TrendChart, type SeriesDef } from '../../components/charts/ChartPrimitives'
import { MockBadge } from '../../components/shared/MockBadge'
import { PERFORMANCE_SERIES, SUBJECTS_WITH_RISK } from '../../data/seed'
import { CHART_COLORS } from '../../utils/format'
import { cn } from '../../utils/cn'
import type { Subject, TimeFilter } from '../../types'

type SeriesKey = 'marks' | 'attendance' | 'quiz' | 'assignments'

const SERIES_META: Record<SeriesKey, SeriesDef> = {
  marks: { key: 'marks', name: 'Marks', color: CHART_COLORS.primary },
  attendance: { key: 'attendance', name: 'Attendance', color: CHART_COLORS.secondary },
  quiz: { key: 'quiz', name: 'Quiz', color: CHART_COLORS.purple },
  assignments: { key: 'assignments', name: 'Assignments', color: CHART_COLORS.success },
}

const ALL_SERIES: SeriesKey[] = ['marks', 'attendance', 'quiz', 'assignments']

/** Healthy reference values used by the demo risk model. */
const BENCHMARKS: Record<SeriesKey, number> = {
  marks: 75,
  attendance: 85,
  quiz: 75,
  assignments: 90,
}

const SUBJECT_METRICS: { key: SeriesKey; label: string; icon: ReactNode }[] = [
  { key: 'attendance', label: 'Attendance', icon: <CalendarCheck className="h-4 w-4" aria-hidden /> },
  { key: 'marks', label: 'Marks', icon: <TrendingUp className="h-4 w-4" aria-hidden /> },
  { key: 'quiz', label: 'Quiz average', icon: <ListChecks className="h-4 w-4" aria-hidden /> },
  { key: 'assignments', label: 'Assignments', icon: <ClipboardCheck className="h-4 w-4" aria-hidden /> },
]

const LATEST_STATS: { key: SeriesKey; label: string; icon: ReactNode }[] = [
  { key: 'marks', label: 'Marks', icon: <PenLine className="h-4 w-4" aria-hidden /> },
  { key: 'attendance', label: 'Attendance', icon: <CalendarCheck className="h-4 w-4" aria-hidden /> },
  { key: 'quiz', label: 'Quiz average', icon: <ListChecks className="h-4 w-4" aria-hidden /> },
  { key: 'assignments', label: 'Assignments', icon: <ClipboardCheck className="h-4 w-4" aria-hidden /> },
]

const RANGE_OPTIONS = [
  { value: 'Weekly', label: 'Weekly' },
  { value: 'Monthly', label: 'Monthly' },
  { value: 'Semester', label: 'Semester' },
]

export function PerformancePage() {
  const navigate = useNavigate()
  const [range, setRange] = useState<TimeFilter>('Weekly')
  const [seriesKey, setSeriesKey] = useState<SeriesKey | 'all'>('all')
  const [selected, setSelected] = useState<Subject | null>(null)

  const points = PERFORMANCE_SERIES[range]
  const latest = points[points.length - 1]
  const previous = points[points.length - 2]

  const chartData: Record<string, string | number>[] = points.map((p) => ({
    label: p.label,
    marks: p.marks,
    attendance: p.attendance,
    quiz: p.quiz,
    assignments: p.assignments,
  }))

  const series: SeriesDef[] =
    seriesKey === 'all' ? ALL_SERIES.map((k) => SERIES_META[k]) : [SERIES_META[seriesKey]]

  const seriesTabs = [
    { value: 'all', label: 'All' },
    ...ALL_SERIES.map((k) => ({ value: k, label: SERIES_META[k].name })),
  ]

  return (
    <div className="animate-fade-in-up space-y-5 sm:space-y-6">
      <PageHeader
        title="My Performance"
        subtitle="Marks, attendance, quiz scores and assignment completion over time — with every subject benchmarked."
        actions={
          <SegmentedControl
            options={RANGE_OPTIONS}
            value={range}
            onChange={(v) => setRange(v as TimeFilter)}
          />
        }
      />

      {/* ---------------- latest values + deltas ---------------- */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {LATEST_STATS.map((s) => (
          <StatCard
            key={s.key}
            label={s.label}
            value={latest[s.key]}
            unit="%"
            delta={latest[s.key] - previous[s.key]}
            deltaLabel={`vs ${previous.label}`}
            icon={s.icon}
            tone={latest[s.key] - previous[s.key] >= 0 ? 'success' : 'danger'}
            hint={`Latest point in the ${range.toLowerCase()} view`}
            onClick={() => setSeriesKey(s.key)}
          />
        ))}
      </div>

      {/* ---------------- trend chart ---------------- */}
      <div>
        <div className="mb-3 overflow-x-auto">
          <Tabs
            items={seriesTabs}
            value={seriesKey}
            onChange={(v) => setSeriesKey(v as SeriesKey | 'all')}
          />
        </div>
        <ChartCard
          title="Performance trend"
          description={`${range} view · plotting ${
            series.length === ALL_SERIES.length
              ? 'marks, attendance, quiz and assignments'
              : series.map((s) => s.name.toLowerCase()).join(', ')
          }.`}
        >
          <TrendChart data={chartData} xKey="label" series={series} height={300} />
        </ChartCard>
      </div>

      {/* ---------------- subject grid ---------------- */}
      <PageSection
        title="Subject performance"
        description="Open a subject for the full metrics-versus-benchmark breakdown."
        actions={<MockBadge compact />}
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {SUBJECTS_WITH_RISK.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSelected(s)}
              className="group rounded-2xl border border-line bg-panel p-4 text-left shadow-card transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-card-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-[14.5px] font-semibold text-ink">{s.name}</p>
                  <p className="mt-0.5 truncate text-[11.5px] text-ink-subtle">
                    {s.code} · {s.teacher}
                  </p>
                </div>
                <RiskBadge level={s.risk} size="sm" />
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                {SUBJECT_METRICS.map((m) => (
                  <div key={m.key} className="rounded-lg bg-panel-muted px-2.5 py-1.5">
                    <p className="flex items-center gap-1 text-[11px] text-ink-subtle">
                      <span className="text-ink-faint [&>svg]:h-3 [&>svg]:w-3">{m.icon}</span>
                      {m.label}
                    </p>
                    <p className="text-[13.5px] font-semibold text-ink">{s[m.key]}%</p>
                  </div>
                ))}
              </div>

              <span className="mt-3 inline-flex items-center gap-1 text-[12px] font-medium text-accent">
                Full breakdown
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </span>
            </button>
          ))}
        </div>
      </PageSection>

      {/* ---------------- subject modal ---------------- */}
      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={selected ? selected.name : 'Subject detail'}
        description={selected ? `${selected.code} · ${selected.teacher}` : undefined}
        footer={
          <>
            <Button variant="ghost" onClick={() => setSelected(null)}>
              Close
            </Button>
            <Button onClick={() => navigate('/student/risk-analysis')}>
              Open risk analysis
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
          </>
        }
      >
        {selected && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-[13px] text-muted">Demo risk level for this subject</span>
              <RiskBadge level={selected.risk} />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[380px] border-collapse text-left text-[13px]">
                <thead>
                  <tr className="border-b border-line text-[11px] uppercase tracking-wider text-ink-subtle">
                    <th scope="col" className="py-2 pr-3 font-semibold">Metric</th>
                    <th scope="col" className="py-2 pr-3 font-semibold">You</th>
                    <th scope="col" className="py-2 pr-3 font-semibold">Benchmark</th>
                    <th scope="col" className="py-2 font-semibold">Gap</th>
                  </tr>
                </thead>
                <tbody>
                  {SUBJECT_METRICS.map((m) => {
                    const value = selected[m.key]
                    const gap = value - BENCHMARKS[m.key]
                    return (
                      <tr key={m.key} className="border-b border-line last:border-0">
                        <td className="py-2.5 pr-3 text-ink-muted">{m.label}</td>
                        <td className="py-2.5 pr-3 font-semibold tabular-nums text-ink">{value}%</td>
                        <td className="py-2.5 pr-3 tabular-nums text-ink-subtle">
                          {BENCHMARKS[m.key]}%
                        </td>
                        <td
                          className={cn(
                            'py-2.5 font-semibold tabular-nums',
                            gap < 0
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-emerald-600 dark:text-emerald-400',
                          )}
                        >
                          {gap > 0 ? `+${gap}` : gap}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between gap-3 rounded-xl bg-panel-muted px-3.5 py-2.5">
              <span className="text-[12px] text-ink-subtle">Pending submissions for this subject</span>
              <Badge tone={selected.assignments >= 90 ? 'success' : 'warning'}>
                {selected.assignments}% complete
              </Badge>
            </div>

            <p className="text-[12px] leading-relaxed text-ink-subtle">
              Benchmarks are the healthy reference values used by the demo risk model: attendance
              85%, marks 75%, quiz 75%, assignments 90% (and 8 self-study hours per week).
            </p>
          </div>
        )}
      </Modal>
    </div>
  )
}
