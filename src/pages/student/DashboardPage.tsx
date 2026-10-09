import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Bell,
  CalendarCheck,
  ClipboardList,
  FileText,
  Lightbulb,
  ShieldAlert,
  TrendingUp,
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
  Progress,
  RiskBadge,
  StatCard,
} from '../../components/ui'
import { MockBadge } from '../../components/shared/MockBadge'
import { RiskGauge } from '../../components/charts/RiskGauge'
import { selectRoleNotifications, useAppStore } from '../../store/useAppStore'
import { SUBJECTS_WITH_RISK } from '../../data/seed'
import { formatDate, relativeTime } from '../../utils/format'
import { cn } from '../../utils/cn'
import { DEMO_PREDICTION, DEMO_STUDENT, dueLabel, statusTone } from './studentData'

export function DashboardPage() {
  const navigate = useNavigate()
  const recommendations = useAppStore((s) => s.recommendations)
  const ensureRecommendations = useAppStore((s) => s.ensureRecommendations)
  const assessments = useAppStore((s) => s.assessments)
  const notifications = useAppStore((s) => s.notifications)

  useEffect(() => {
    ensureRecommendations(DEMO_PREDICTION.recommendations)
  }, [ensureRecommendations])

  const pred = DEMO_PREDICTION
  const student = DEMO_STUDENT
  const firstName = student.name.split(' ')[0]
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const completed = recommendations.filter((r) => r.status === 'Completed').length
  const openAssessments = assessments.filter((a) => a.status !== 'Completed')
  const upcoming = [...openAssessments]
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 4)
  const alerts = selectRoleNotifications(notifications, 'student')
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 3)

  return (
    <div className="animate-fade-in-up space-y-5 sm:space-y-6">
      <PageHeader
        title="Student Dashboard"
        subtitle={`${greeting}, ${firstName} — your risk snapshot, action plan and everything due next.`}
        actions={
          <>
            <Button variant="outline" onClick={() => navigate('/student/reports')}>
              <FileText className="h-4 w-4" aria-hidden />
              Reports
            </Button>
            <Button onClick={() => navigate('/student/recommendations')}>
              View action plan
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
          </>
        }
      />

      {/* ---------------- stat cards ---------------- */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-5">
        <StatCard
          label="Attendance"
          value={student.attendance}
          unit="%"
          tone="warning"
          hint="Semester to date"
          icon={<CalendarCheck className="h-4 w-4" aria-hidden />}
          onClick={() => navigate('/student/attendance')}
        />
        <StatCard
          label="Overall performance"
          value={student.overallPerformance}
          unit="%"
          tone="info"
          hint="Weighted across subjects"
          icon={<TrendingUp className="h-4 w-4" aria-hidden />}
          onClick={() => navigate('/student/performance')}
        />
        <StatCard
          label="Risk score"
          value={pred.risk_score}
          unit="/100"
          tone={pred.risk_level === 'High' ? 'danger' : pred.risk_level === 'Medium' ? 'warning' : 'success'}
          hint={`${pred.risk_level} risk band · demo model`}
          icon={<ShieldAlert className="h-4 w-4" aria-hidden />}
          onClick={() => navigate('/student/risk-analysis')}
        />
        <StatCard
          label="Recommendations completed"
          value={`${completed} of ${recommendations.length}`}
          tone={completed > 0 ? 'success' : 'brand'}
          hint="Your personalised action plan"
          icon={<Lightbulb className="h-4 w-4" aria-hidden />}
          onClick={() => navigate('/student/recommendations')}
        />
        <StatCard
          label="Assessments pending"
          value={openAssessments.length}
          tone="warning"
          hint="Includes overdue items"
          icon={<ClipboardList className="h-4 w-4" aria-hidden />}
          onClick={() => navigate('/student/assessments')}
        />
      </div>

      {/* ---------------- AI risk card ---------------- */}
      <Card>
        <CardHeader
          icon={<ShieldAlert className="h-4.5 w-4.5" aria-hidden />}
          title="Your risk snapshot"
          description="How the demo model currently scores you, and why."
          actions={<MockBadge />}
        />
        <CardContent className="pt-3">
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-line bg-panel-muted px-4 py-6">
              <RiskGauge
                score={pred.risk_score}
                level={pred.risk_level}
                sublabel="Demo model · STU-001"
              />
              <RiskBadge level={pred.risk_level} score={pred.risk_score} />
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <Overline>Prediction summary</Overline>
                <p className="mt-2 text-[13.5px] leading-relaxed text-ink-muted">{pred.summary}</p>
              </div>

              <div className="space-y-3">
                <Overline>Top contributing factors</Overline>
                {pred.contributing_factors.slice(0, 3).map((f) => (
                  <div key={f.name}>
                    <div className="mb-1 flex items-center justify-between gap-3 text-[12.5px]">
                      <span className="truncate text-ink-muted">{f.name}</span>
                      <span className="shrink-0 font-semibold tabular-nums text-ink">
                        {f.contribution}%
                      </span>
                    </div>
                    <Progress value={f.contribution} height="h-1.5" />
                  </div>
                ))}
              </div>

              <div className="mt-auto flex flex-wrap gap-2 pt-1">
                <Button onClick={() => navigate('/student/risk-analysis')}>
                  Why this prediction?
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Button>
                <Button variant="outline" onClick={() => navigate('/student/attendance')}>
                  Attendance detail
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ---------------- coming up + alerts ---------------- */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Coming up"
            description="Your next 4 open assessments"
            actions={
              <Button variant="ghost" size="sm" onClick={() => navigate('/student/assessments')}>
                View all
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Button>
            }
          />
          <CardContent className="pt-3">
            {upcoming.length === 0 ? (
              <EmptyState
                title="Nothing pending"
                description="Every assessment on your list is complete — nice work."
                action={
                  <Button size="sm" variant="outline" onClick={() => navigate('/student/assessments')}>
                    Open assessments
                  </Button>
                }
              />
            ) : (
              <ul className="space-y-2">
                {upcoming.map((a) => (
                  <li key={a.id}>
                    <button
                      type="button"
                      onClick={() => navigate('/student/assessments')}
                      className="flex w-full items-center justify-between gap-3 rounded-xl border border-line px-3.5 py-2.5 text-left transition-colors hover:border-accent/40 hover:bg-panel-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-[13.5px] font-medium text-ink">
                          {a.title}
                        </span>
                        <span className="mt-0.5 block text-[12px] text-ink-subtle">
                          {a.subject} · {formatDate(a.dueDate)} · {dueLabel(a.dueDate)}
                        </span>
                      </span>
                      <Badge tone={statusTone(a.status)}>{a.status}</Badge>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            icon={<Bell className="h-4.5 w-4.5" aria-hidden />}
            title="Latest alerts"
            description="The three newest updates to your plan"
            actions={
              <Button variant="ghost" size="sm" onClick={() => navigate('/student/notifications')}>
                All notifications
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Button>
            }
          />
          <CardContent className="pt-3">
            {alerts.length === 0 ? (
              <EmptyState
                icon={<Bell className="h-5 w-5" aria-hidden />}
                title="No alerts yet"
                description="Risk changes, new recommendations and deadline reminders appear here."
                action={
                  <Button size="sm" variant="outline" onClick={() => navigate('/student/notifications')}>
                    Open notifications
                  </Button>
                }
              />
            ) : (
              <ul className="space-y-2">
                {alerts.map((n) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => navigate(n.link ?? '/student/notifications')}
                      className={cn(
                        'flex w-full items-start gap-3 rounded-xl border border-line px-3.5 py-2.5 text-left transition-colors hover:border-accent/40 hover:bg-panel-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
                        !n.read && 'bg-brand-50/40 dark:bg-brand-500/5',
                      )}
                    >
                      <span
                        className={cn(
                          'mt-1.5 h-2 w-2 shrink-0 rounded-full',
                          n.read ? 'bg-ink-faint' : 'bg-accent',
                        )}
                        aria-hidden
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13.5px] font-medium text-ink">
                          {n.title}
                        </span>
                        <span className="mt-0.5 block text-[12.5px] leading-relaxed text-muted">
                          {n.message}
                        </span>
                        <span className="mt-1 block text-[11.5px] text-ink-faint">
                          {relativeTime(n.createdAt)}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ---------------- subjects ---------------- */}
      <PageSection
        title="Your subjects"
        description="Attendance and marks across all six subjects this semester"
        actions={
          <Button variant="ghost" size="sm" onClick={() => navigate('/student/performance')}>
            Open performance
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Button>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SUBJECTS_WITH_RISK.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => navigate('/student/performance')}
              className="rounded-2xl border border-line bg-panel p-4 text-left shadow-card transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-card-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-semibold text-ink">{s.name}</p>
                  <p className="mt-0.5 truncate text-[11.5px] text-ink-subtle">
                    {s.code} · {s.teacher}
                  </p>
                </div>
                <RiskBadge level={s.risk} size="sm" />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-panel-muted px-2.5 py-1.5">
                  <p className="text-[11px] text-ink-subtle">Attendance</p>
                  <p className="text-[13.5px] font-semibold text-ink">{s.attendance}%</p>
                </div>
                <div className="rounded-lg bg-panel-muted px-2.5 py-1.5">
                  <p className="text-[11px] text-ink-subtle">Marks</p>
                  <p className="text-[13.5px] font-semibold text-ink">{s.marks}%</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </PageSection>
    </div>
  )
}
