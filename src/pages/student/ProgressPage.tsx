import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  CalendarCheck,
  CircleCheckBig,
  Flame,
  ListChecks,
  ListTodo,
  ShieldAlert,
  TrendingUp,
  Trophy,
  TriangleAlert,
} from 'lucide-react'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  EmptyState,
  Overline,
  PageHeader,
  PageSection,
  ProgressWithLabel,
  StatCard,
} from '../../components/ui'
import { ChartCard } from '../../components/ui/ChartCard'
import { DonutChart } from '../../components/charts/ChartPrimitives'
import { PROGRESS_TIMELINE, QUIZZES } from '../../data/seed'
import { useAppStore } from '../../store/useAppStore'
import type { ReactNode } from 'react'
import { CHART_COLORS, formatDate, relativeTime } from '../../utils/format'
import { cn } from '../../utils/cn'

const TONE_META: Record<
  string,
  { className: string; icon: ReactNode; badge: 'success' | 'warning' | 'danger' }
> = {
  success: {
    className:
      'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/12 dark:text-emerald-400',
    icon: <TrendingUp className="h-4 w-4" aria-hidden />,
    badge: 'success',
  },
  warning: {
    className: 'bg-amber-50 text-amber-600 dark:bg-amber-500/12 dark:text-amber-400',
    icon: <TriangleAlert className="h-4 w-4" aria-hidden />,
    badge: 'warning',
  },
  danger: {
    className: 'bg-red-50 text-red-600 dark:bg-red-500/12 dark:text-red-400',
    icon: <ShieldAlert className="h-4 w-4" aria-hidden />,
    badge: 'danger',
  },
}

export function ProgressPage() {
  const navigate = useNavigate()
  const recommendations = useAppStore((s) => s.recommendations)
  const learningTasks = useAppStore((s) => s.learningTasks)
  const assessments = useAppStore((s) => s.assessments)
  const quizResults = useAppStore((s) => s.quizResults)

  const recTotal = recommendations.length
  const recDone = recommendations.filter((r) => r.status === 'Completed').length
  const recInProgress = recommendations.filter((r) => r.status === 'In Progress').length
  const recNotStarted = recommendations.filter((r) => r.status === 'Not Started').length
  const recPct = recTotal === 0 ? 0 : Math.round((recDone / recTotal) * 100)

  const taskTotal = learningTasks.length
  const taskDone = learningTasks.filter((t) => t.done).length
  const taskPct = taskTotal === 0 ? 0 : Math.round((taskDone / taskTotal) * 100)

  const asmDone = assessments.filter((a) => a.status === 'Completed').length
  const asmPct = assessments.length === 0 ? 0 : Math.round((asmDone / assessments.length) * 100)

  const attempts = Object.values(quizResults)
  const quizAvg =
    attempts.length === 0
      ? 0
      : Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length)

  const donutData = [
    { name: 'Completed', value: recDone, color: CHART_COLORS.success },
    { name: 'In progress', value: recInProgress, color: CHART_COLORS.secondary },
    { name: 'Not started', value: recNotStarted, color: CHART_COLORS.muted },
  ].filter((d) => d.value > 0)

  const streak = learningTasks.filter((t) => t.done).length

  return (
    <div className="animate-fade-in-up space-y-5 sm:space-y-6">
      <PageHeader
        title="Progress"
        subtitle="A timeline of what changed, plus live completion rates across your plan, tasks and assessments."
        actions={
          <Button variant="outline" onClick={() => navigate('/student/reports')}>
            Open full report
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Button>
        }
      />

      {/* ---------------- stat cards ---------------- */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Action plan"
          value={`${recPct}%`}
          tone={recPct >= 50 ? 'success' : 'warning'}
          hint={`${recDone} of ${recTotal} recommendations done`}
          icon={<ListChecks className="h-4 w-4" aria-hidden />}
        />
        <StatCard
          label="Weekly tasks"
          value={`${taskPct}%`}
          tone={taskPct >= 50 ? 'success' : 'info'}
          hint={`${taskDone} of ${taskTotal} tasks checked off`}
          icon={<ListTodo className="h-4 w-4" aria-hidden />}
        />
        <StatCard
          label="Assessments done"
          value={`${asmPct}%`}
          tone="info"
          hint={`${asmDone} of ${assessments.length} graded or submitted`}
          icon={<CalendarCheck className="h-4 w-4" aria-hidden />}
        />
        <StatCard
          label="Quiz average"
          value={attempts.length > 0 ? `${quizAvg}%` : '—'}
          tone={attempts.length > 0 && quizAvg >= 60 ? 'success' : 'warning'}
          hint={
            attempts.length > 0
              ? `${attempts.length} attempt${attempts.length === 1 ? '' : 's'} recorded`
              : 'Take a quiz to record your first score'
          }
          icon={<Trophy className="h-4 w-4" aria-hidden />}
          onClick={() => navigate('/student/assessments')}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        {/* ---------------- timeline ---------------- */}
        <Card className="xl:col-span-2">
          <CardHeader
            icon={<Flame className="h-4.5 w-4.5" aria-hidden />}
            title="Progress timeline"
            description="Notable wins and setbacks from the last month"
            actions={<Badge tone="neutral">{PROGRESS_TIMELINE.length} events</Badge>}
          />
          <CardContent className="pt-3">
            {PROGRESS_TIMELINE.length === 0 ? (
              <EmptyState
                icon={<Flame className="h-5 w-5" aria-hidden />}
                title="No progress events yet"
                description="Attendance, quiz and recommendation changes will show up here as the term goes on."
                action={
                  <Button size="sm" variant="outline" onClick={() => navigate('/student/dashboard')}>
                    Back to dashboard
                  </Button>
                }
              />
            ) : (
              <ol className="relative space-y-5 border-l border-line pl-5">
                {PROGRESS_TIMELINE.map((item) => {
                  const meta = TONE_META[item.tone] ?? TONE_META.success
                  return (
                    <li key={item.id} className="relative">
                      <span
                        className={cn(
                          'absolute -left-[31px] flex h-5 w-5 items-center justify-center rounded-full ring-4 ring-panel',
                          meta.className,
                        )}
                        aria-hidden
                      >
                        {meta.icon}
                      </span>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-[14px] font-semibold text-ink">{item.title}</h3>
                        <Badge tone={meta.badge}>
                          {item.tone === 'success' ? 'Gain' : item.tone === 'warning' ? 'Watch' : 'Setback'}
                        </Badge>
                      </div>
                      <p className="mt-1 text-[13px] leading-relaxed text-muted">{item.detail}</p>
                      <p className="mt-1 text-[11.5px] text-ink-faint">
                        {formatDate(item.date)} · {relativeTime(item.date)}
                      </p>
                    </li>
                  )
                })}
              </ol>
            )}
          </CardContent>
        </Card>

        {/* ---------------- completion + donut ---------------- */}
        <div className="space-y-5">
          <ChartCard
            title="Action plan status"
            description="Recommendation status breakdown"
            icon={<ListChecks className="h-4.5 w-4.5" aria-hidden />}
          >
            {donutData.length === 0 ? (
              <EmptyState
                title="No recommendations yet"
                description="Your action plan fills in once the risk prediction generates recommendations."
                action={
                  <Button size="sm" variant="outline" onClick={() => navigate('/student/recommendations')}>
                    Open recommendations
                  </Button>
                }
              />
            ) : (
              <DonutChart
                data={donutData}
                centerLabel={String(recDone)}
                centerSub={`of ${recTotal} done`}
                height={210}
              />
            )}
          </ChartCard>

          <Card>
            <CardHeader
              icon={<CircleCheckBig className="h-4.5 w-4.5" aria-hidden />}
              title="Completion rates"
              description="Live against your store data"
            />
            <CardContent className="space-y-4 pt-3">
              <ProgressWithLabel value={recPct} label="Recommendations" />
              <ProgressWithLabel value={taskPct} label="Weekly learning tasks" />
              <ProgressWithLabel value={asmPct} label="Assessments" />
              <div className="rounded-xl bg-panel-muted px-3 py-2.5 text-[12.5px] text-ink-subtle">
                <Overline>Current streak</Overline>
                <p className="mt-1 text-ink-muted">
                  {streak} of {taskTotal} tasks ticked off this week — keep the chain going.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[13.5px] font-semibold text-ink">Want the printable version?</p>
                <p className="mt-0.5 text-[12.5px] text-ink-subtle">
                  Generate a full report with risk, attendance and plan status.
                </p>
              </div>
              <Button size="sm" onClick={() => navigate('/student/reports')}>
                Reports
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <PageSection
        title="Suggested next steps"
        description="Based on what is still open in your plan"
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent>
              <p className="text-[13.5px] font-semibold text-ink">
                {recTotal - recDone > 0
                  ? `${recTotal - recDone} recommendations still open`
                  : 'All recommendations completed'}
              </p>
              <p className="mt-1 text-[12.5px] leading-relaxed text-ink-subtle">
                {recTotal - recDone > 0
                  ? 'Work through the highest-priority items first for the biggest impact.'
                  : 'You have cleared the action plan — revisit it after your next prediction run.'}
              </p>
              <div className="mt-3">
                <Button size="sm" variant="outline" onClick={() => navigate('/student/recommendations')}>
                  Open plan
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <p className="text-[13.5px] font-semibold text-ink">
                {taskTotal - taskDone > 0 ? `${taskTotal - taskDone} tasks left this week` : 'Week fully cleared'}
              </p>
              <p className="mt-1 text-[12.5px] leading-relaxed text-ink-subtle">
                Your learning plan groups the remaining topics by day with estimated study time.
              </p>
              <div className="mt-3">
                <Button size="sm" variant="outline" onClick={() => navigate('/student/learning-plan')}>
                  Open learning plan
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <p className="text-[13.5px] font-semibold text-ink">{QUIZZES.length} quizzes ready</p>
              <p className="mt-1 text-[12.5px] leading-relaxed text-ink-subtle">
                Practising a quiz is the fastest way to lift your quiz average before the next internal.
              </p>
              <div className="mt-3">
                <Button size="sm" variant="outline" onClick={() => navigate('/student/assessments')}>
                  Practise now
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageSection>
    </div>
  )
}
