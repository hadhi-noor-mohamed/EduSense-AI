import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Check,
  CircleCheckBig,
  Clock,
  Lightbulb,
  ListChecks,
  Play,
  RotateCcw,
  Sparkles,
} from 'lucide-react'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  EmptyState,
  NoResults,
  Overline,
  PageHeader,
  ProgressWithLabel,
  SegmentedControl,
  Select,
  StatCard,
} from '../../components/ui'
import { MockBadge, PrototypeNote } from '../../components/shared/MockBadge'
import { useAppStore } from '../../store/useAppStore'
import type { Recommendation } from '../../types'
import { DEMO_PREDICTION, priorityTone } from './studentData'

type StatusFilter = 'All' | 'Not Started' | 'In Progress' | 'Completed'

function statusToneOf(status: Recommendation['status']) {
  if (status === 'Completed') return 'success' as const
  if (status === 'In Progress') return 'info' as const
  return 'neutral' as const
}

export function RecommendationsPage() {
  const navigate = useNavigate()
  const recommendations = useAppStore((s) => s.recommendations)
  const ensureRecommendations = useAppStore((s) => s.ensureRecommendations)
  const setStatus = useAppStore((s) => s.setRecommendationStatus)
  const pushToast = useAppStore((s) => s.pushToast)

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All')
  const [priorityFilter, setPriorityFilter] = useState('All')

  useEffect(() => {
    ensureRecommendations(DEMO_PREDICTION.recommendations)
  }, [ensureRecommendations])

  const total = recommendations.length
  const completed = recommendations.filter((r) => r.status === 'Completed').length
  const inProgress = recommendations.filter((r) => r.status === 'In Progress').length
  const notStarted = recommendations.filter((r) => r.status === 'Not Started').length
  const completionPct = total === 0 ? 0 : Math.round((completed / total) * 100)

  const filtered = useMemo(
    () =>
      recommendations.filter(
        (r) =>
          (statusFilter === 'All' || r.status === statusFilter) &&
          (priorityFilter === 'All' || r.priority === priorityFilter),
      ),
    [recommendations, statusFilter, priorityFilter],
  )

  const change = (
    rec: Recommendation,
    next: Recommendation['status'],
    title: string,
    tone: 'success' | 'info',
  ) => {
    setStatus(rec.id, next)
    pushToast({ title, description: rec.title, tone })
  }

  const clearFilters = () => {
    setStatusFilter('All')
    setPriorityFilter('All')
  }

  return (
    <div className="animate-fade-in-up space-y-5 sm:space-y-6">
      <PageHeader
        title="Recommendations"
        subtitle="Personalised actions generated from your demo risk prediction — start them, track progress and tick them off."
        actions={<MockBadge />}
      />

      {/* ---------------- plan stats ---------------- */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total actions"
          value={total}
          tone="brand"
          hint="Generated for your risk profile"
          icon={<Lightbulb className="h-4 w-4" aria-hidden />}
        />
        <StatCard
          label="Not started"
          value={notStarted}
          tone="warning"
          hint="Waiting on you"
          icon={<Play className="h-4 w-4" aria-hidden />}
        />
        <StatCard
          label="In progress"
          value={inProgress}
          tone="info"
          hint="Currently being worked on"
          icon={<Clock className="h-4 w-4" aria-hidden />}
        />
        <StatCard
          label="Completed"
          value={completed}
          tone={completed > 0 ? 'success' : 'brand'}
          hint={`${completionPct}% of your plan done`}
          icon={<CircleCheckBig className="h-4 w-4" aria-hidden />}
        />
      </div>

      {/* ---------------- filters + completion ---------------- */}
      <div className="flex flex-col gap-4 rounded-2xl border border-line bg-panel p-4 shadow-card lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <span className="mb-1.5 block text-[13px] font-medium text-ink">Status</span>
            <SegmentedControl
              options={[
                { value: 'All', label: 'All' },
                { value: 'Not Started', label: 'Not started' },
                { value: 'In Progress', label: 'In progress' },
                { value: 'Completed', label: 'Completed' },
              ]}
              value={statusFilter}
              onChange={(v) => setStatusFilter(v as StatusFilter)}
            />
          </div>
          <div className="min-w-[170px]">
            <Select
              label="Priority"
              options={[
                { value: 'All', label: 'All priorities' },
                { value: 'High', label: 'High' },
                { value: 'Medium', label: 'Medium' },
                { value: 'Low', label: 'Low' },
              ]}
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            />
          </div>
        </div>
        <div className="w-full lg:max-w-xs">
          <ProgressWithLabel value={completionPct} label="Plan completion" />
        </div>
      </div>

      {/* ---------------- list ---------------- */}
      {total === 0 ? (
        <EmptyState
          icon={<ListChecks className="h-5 w-5" aria-hidden />}
          title="No recommendations yet"
          description="Run your risk analysis to generate a personalised action plan."
          action={
            <Button onClick={() => navigate('/student/risk-analysis')}>
              Open risk analysis
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
          }
        />
      ) : filtered.length === 0 ? (
        <NoResults onClear={clearFilters} />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {filtered.map((r) => (
            <Card key={r.id} className="flex flex-col">
              <CardHeader
                title={r.title}
                description={r.description}
                actions={
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <Badge tone={priorityTone(r.priority)}>{r.priority} priority</Badge>
                    <Badge tone={statusToneOf(r.status)}>{r.status}</Badge>
                  </div>
                }
              />
              <CardContent className="flex flex-1 flex-col gap-3 pt-1">
                <div>
                  <Overline>Why you are seeing this</Overline>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{r.reason}</p>
                </div>

                <dl className="flex flex-wrap gap-2 text-[12px]">
                  <dt className="sr-only">Related subject</dt>
                  <dd className="rounded-lg bg-panel-muted px-2.5 py-1 font-medium text-ink-muted">
                    {r.relatedSubject}
                  </dd>
                  <dt className="sr-only">Estimated effort</dt>
                  <dd className="inline-flex items-center gap-1.5 rounded-lg bg-panel-muted px-2.5 py-1 font-medium text-ink-muted">
                    <Clock className="h-3.5 w-3.5" aria-hidden />
                    {r.estimatedEffort}
                  </dd>
                </dl>

                <div className="mt-auto flex flex-wrap gap-2 pt-1">
                  {r.status === 'Not Started' && (
                    <>
                      <Button size="sm" onClick={() => change(r, 'In Progress', 'Recommendation started', 'info')}>
                        <Play className="h-3.5 w-3.5" aria-hidden />
                        Start
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => change(r, 'Completed', 'Recommendation completed', 'success')}
                      >
                        <Check className="h-3.5 w-3.5" aria-hidden />
                        Mark complete
                      </Button>
                    </>
                  )}
                  {r.status === 'In Progress' && (
                    <>
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => change(r, 'Completed', 'Recommendation completed', 'success')}
                      >
                        <Check className="h-3.5 w-3.5" aria-hidden />
                        Mark complete
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => change(r, 'Not Started', 'Recommendation moved back to not started', 'info')}
                      >
                        <RotateCcw className="h-3.5 w-3.5" aria-hidden />
                        Move back
                      </Button>
                    </>
                  )}
                  {r.status === 'Completed' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => change(r, 'Not Started', 'Recommendation reopened', 'info')}
                    >
                      <RotateCcw className="h-3.5 w-3.5" aria-hidden />
                      Reopen
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filtered.length > 0 && (
        <Card>
          <CardHeader
            icon={<Sparkles className="h-4.5 w-4.5" aria-hidden />}
            title="How these recommendations are produced"
            description="The demo prediction service turns your weakest factors into concrete actions."
          />
          <CardContent className="pt-1">
            <PrototypeNote />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
