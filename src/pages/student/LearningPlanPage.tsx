import { useMemo, useState } from 'react'
import {
  BookOpen,
  CalendarDays,
  Check,
  CircleCheckBig,
  Clock,
  Flame,
  ListTodo,
  RotateCcw,
} from 'lucide-react'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  ConfirmDialog,
  EmptyState,
  Overline,
  PageHeader,
  PageSection,
  Progress,
  ProgressWithLabel,
} from '../../components/ui'
import { LEARNING_RESOURCES } from '../../data/seed'
import { useAppStore } from '../../store/useAppStore'
import { cn } from '../../utils/cn'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export function LearningPlanPage() {
  const learningTasks = useAppStore((s) => s.learningTasks)
  const toggleLearningTask = useAppStore((s) => s.toggleLearningTask)
  const resetLearningTasks = useAppStore((s) => s.resetLearningTasks)
  const pushToast = useAppStore((s) => s.pushToast)

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [reviewed, setReviewed] = useState<string[]>([])

  const byDay = useMemo(() => {
    const map = new Map<string, typeof learningTasks>()
    for (const day of DAYS) map.set(day, [])
    for (const t of learningTasks) {
      const list = map.get(t.day)
      if (list) list.push(t)
      else map.set(t.day, [t])
    }
    return map
  }, [learningTasks])

  const totalTasks = learningTasks.length
  const doneTasks = learningTasks.filter((t) => t.done).length
  const weekPct = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100)
  const minutesLeft = learningTasks.filter((t) => !t.done).reduce((sum, t) => sum + t.minutes, 0)

  const handleToggle = (id: string) => {
    const task = learningTasks.find((t) => t.id === id)
    toggleLearningTask(id)
    if (!task) return
    pushToast({
      title: task.done ? 'Task moved back to to-do' : 'Task completed — nice work',
      description: `${task.subject} · ${task.topic}`,
      tone: task.done ? 'info' : 'success',
    })
  }

  const restorePlan = () => {
    resetLearningTasks()
    pushToast({ title: 'Weekly plan restored', description: 'All tasks reset to the seeded plan.', tone: 'success' })
  }

  const toggleReviewed = (title: string) => {
    if (reviewed.includes(title)) {
      setReviewed(reviewed.filter((t) => t !== title))
      pushToast({ title: 'Removed from reviewed list', description: title, tone: 'info' })
    } else {
      setReviewed([...reviewed, title])
      pushToast({ title: 'Resource marked as reviewed', description: title, tone: 'success' })
    }
  }

  return (
    <div className="animate-fade-in-up space-y-5 sm:space-y-6">
      <PageHeader
        title="Learning Plan"
        subtitle={`Your week, one day at a time — ${doneTasks} of ${totalTasks} tasks done, about ${minutesLeft} minutes left on the board.`}
        actions={
          <Button variant="outline" onClick={() => setConfirmOpen(true)}>
            <RotateCcw className="h-4 w-4" aria-hidden />
            Reset plan
          </Button>
        }
      />

      {/* ---------------- weekly progress ---------------- */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="sm:col-span-1">
          <CardContent>
            <ProgressWithLabel value={weekPct} label="Weekly completion" />
            <p className="mt-3 text-[12.5px] text-ink-subtle">
              {doneTasks} of {totalTasks} tasks checked off
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/12 dark:text-emerald-400">
              <CircleCheckBig className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <p className="text-[13px] font-semibold text-ink">Completed</p>
              <p className="text-[12.5px] text-ink-subtle">{doneTasks} tasks this week</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/12 dark:text-amber-400">
              <Clock className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <p className="text-[13px] font-semibold text-ink">Time remaining</p>
              <p className="text-[12.5px] text-ink-subtle">{minutesLeft} minutes of focused study</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ---------------- day plan ---------------- */}
      {totalTasks === 0 ? (
        <EmptyState
          icon={<ListTodo className="h-5 w-5" aria-hidden />}
          title="Your plan is empty"
          description="Restore the seeded weekly plan to get your study tasks back."
          action={
            <Button onClick={restorePlan}>
              <RotateCcw className="h-4 w-4" aria-hidden />
              Restore plan
            </Button>
          }
        />
      ) : (
        <PageSection
          title="This week"
          description="Check a task off when you finish it — progress saves automatically"
        >
          <div className="grid gap-4 lg:grid-cols-2">
            {DAYS.map((day) => {
              const tasks = byDay.get(day) ?? []
              if (tasks.length === 0) return null
              const done = tasks.filter((t) => t.done).length
              const pct = Math.round((done / tasks.length) * 100)
              const mins = tasks.reduce((sum, t) => sum + t.minutes, 0)

              return (
                <Card key={day}>
                  <CardHeader
                    icon={<CalendarDays className="h-4.5 w-4.5" aria-hidden />}
                    title={day}
                    description={`${tasks.length} task${tasks.length === 1 ? '' : 's'} · ${mins} min planned`}
                    actions={
                      <Badge tone={pct === 100 ? 'success' : 'info'}>
                        {done}/{tasks.length}
                      </Badge>
                    }
                  />
                  <CardContent className="pt-2">
                    <Progress value={pct} height="h-1.5" barClassName={pct === 100 ? 'bg-emerald-500' : undefined} />
                    <ul className="mt-3 space-y-2.5">
                      {tasks.map((t) => (
                        <li
                          key={t.id}
                          className={cn(
                            'rounded-xl border border-line px-3 py-2.5 transition-colors',
                            t.done && 'bg-panel-muted/60',
                          )}
                        >
                          <Checkbox
                            label={t.topic}
                            checked={t.done}
                            onChange={() => handleToggle(t.id)}
                            description={`${t.subject} · ${t.minutes} min · ${t.resource}`}
                          />
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </PageSection>
      )}

      {/* ---------------- resources ---------------- */}
      <PageSection
        title="Extra resources"
        description="Supplementary material picked for your weakest areas — mark items as reviewed as you go"
        actions={
          reviewed.length > 0 ? (
            <Badge tone="success" icon={<Check className="h-3 w-3" aria-hidden />}>
              {reviewed.length} reviewed
            </Badge>
          ) : undefined
        }
      >
        {LEARNING_RESOURCES.length === 0 ? (
          <EmptyState
            icon={<BookOpen className="h-5 w-5" aria-hidden />}
            title="No extra resources"
            description="Resources appear here once they are curated for your plan."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {LEARNING_RESOURCES.map((res) => {
              const isReviewed = reviewed.includes(res.title)
              return (
                <Card key={res.title} className={cn(isReviewed && 'border-emerald-400/50')}>
                  <CardContent className="flex h-full flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[14px] font-semibold leading-snug text-ink">{res.title}</p>
                        <p className="mt-1 text-[12px] text-ink-subtle">{res.subject}</p>
                      </div>
                      <Flame
                        className={cn(
                          'h-4 w-4 shrink-0',
                          isReviewed ? 'text-emerald-500' : 'text-ink-faint',
                        )}
                        aria-hidden
                      />
                    </div>
                    <div className="flex flex-wrap gap-2 text-[12px]">
                      <Badge tone="neutral">{res.type}</Badge>
                      <Badge tone="neutral">{res.minutes} min</Badge>
                    </div>
                    <div className="mt-auto pt-1">
                      <Button
                        size="sm"
                        variant={isReviewed ? 'success' : 'outline'}
                        onClick={() => toggleReviewed(res.title)}
                      >
                        {isReviewed ? (
                          <>
                            <Check className="h-3.5 w-3.5" aria-hidden /> Reviewed
                          </>
                        ) : (
                          'Mark as reviewed'
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </PageSection>

      <Overline className="block text-center">
        Plan resets restore the seeded schedule — your current checks are demo data.
      </Overline>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={restorePlan}
        title="Reset the weekly plan?"
        message="Every task you ticked this week will be unchecked and the seeded schedule will be restored. This cannot be undone."
        confirmLabel="Reset plan"
        tone="danger"
      />
    </div>
  )
}
