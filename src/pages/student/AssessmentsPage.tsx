import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ClipboardCheck,
  ClipboardList,
  Clock,
  Info,
  ListTodo,
  PenLine,
  Play,
  RotateCcw,
  Trophy,
  X,
} from 'lucide-react'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  DataTable,
  EmptyState,
  Modal,
  PageHeader,
  Progress,
  Select,
  StatCard,
  Tabs,
  type Column,
} from '../../components/ui'
import { QUIZZES } from '../../data/seed'
import { useAppStore } from '../../store/useAppStore'
import type { Assessment, Quiz } from '../../types'
import { cn } from '../../utils/cn'
import { formatDate, relativeTime, scoreColor } from '../../utils/format'
import { dueLabel, statusTone } from './studentData'

const PASS_MARK = 60

function coachingNote(a: Assessment): string {
  if (a.status === 'Overdue') {
    return `This ${a.type.toLowerCase()} passed its due date ${dueLabel(a.dueDate)}. Submit whatever you have as soon as possible — late work still scores, missing work scores zero, and overdue items are one of the inputs in your risk prediction.`
  }
  if (a.status === 'Pending') {
    return `${dueLabel(a.dueDate)} — block out the ${a.maxScore}-point rubric before you start. Assignment completion is a weighted factor in your risk score, so finishing this on time directly helps.`
  }
  if (a.status === 'Upcoming') {
    return `Still ${dueLabel(a.dueDate).toLowerCase()} — a good window to start early. Review the related material in your learning plan first, then attempt this while there is time to fix weak spots.`
  }
  const score = a.score ?? 0
  if (score >= 75) {
    return `Scored ${score}/${a.maxScore} — a strong result. Use the spare time to coach others or move to your next weakest topic.`
  }
  if (score >= PASS_MARK) {
    return `Scored ${score}/${a.maxScore} — a pass, with clear room to grow. Go through the questions you missed and add a revision slot for this topic to next week's plan.`
  }
  return `Scored ${score}/${a.maxScore} — below the ${PASS_MARK}% pass mark. Book time with your teacher, redo the missed questions and prioritize this subject in your learning plan this week.`
}

export function AssessmentsPage() {
  const navigate = useNavigate()
  const assessments = useAppStore((s) => s.assessments)
  const quizResults = useAppStore((s) => s.quizResults)
  const submitQuizResult = useAppStore((s) => s.submitQuizResult)
  const pushToast = useAppStore((s) => s.pushToast)

  const [tab, setTab] = useState('assessments')
  const [typeFilter, setTypeFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [selected, setSelected] = useState<Assessment | null>(null)

  // quiz flow
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null)
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [result, setResult] = useState<{ correct: number; total: number; score: number } | null>(null)

  const filtered = useMemo(
    () =>
      assessments.filter(
        (a) =>
          (typeFilter === 'All' || a.type === typeFilter) &&
          (statusFilter === 'All' || a.status === statusFilter),
      ),
    [assessments, typeFilter, statusFilter],
  )

  const completed = assessments.filter((a) => a.status === 'Completed')
  const pending = assessments.filter((a) => a.status === 'Pending')
  const overdue = assessments.filter((a) => a.status === 'Overdue')
  const scored = completed.filter((a) => a.score !== null)
  const avgScore =
    scored.length === 0
      ? 0
      : Math.round(scored.reduce((sum, a) => sum + (a.score ?? 0), 0) / scored.length)

  const columns: Column<Assessment>[] = [
    {
      key: 'subject',
      header: 'Subject',
      sortValue: (a) => a.subject,
      render: (a) => <span className="font-medium text-ink">{a.subject}</span>,
    },
    {
      key: 'title',
      header: 'Assessment',
      sortValue: (a) => a.title,
      render: (a) => <span className="text-ink-muted">{a.title}</span>,
    },
    {
      key: 'type',
      header: 'Type',
      sortValue: (a) => a.type,
      render: (a) => <Badge tone="neutral">{a.type}</Badge>,
    },
    {
      key: 'due',
      header: 'Due date',
      sortValue: (a) => a.dueDate,
      render: (a) => (
        <span>
          <span className="block text-ink">{formatDate(a.dueDate)}</span>
          <span className="block text-[11.5px] text-ink-faint">{dueLabel(a.dueDate)}</span>
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortValue: (a) => a.status,
      render: (a) => <Badge tone={statusTone(a.status)}>{a.status}</Badge>,
    },
    {
      key: 'score',
      header: 'Score',
      align: 'right',
      sortValue: (a) => a.score ?? -1,
      render: (a) =>
        a.score === null ? (
          <span className="text-ink-faint">—</span>
        ) : (
          <span className="font-semibold tabular-nums text-ink">
            {a.score}/{a.maxScore}
          </span>
        ),
    },
  ]

  const startQuiz = (q: Quiz) => {
    setActiveQuiz(q)
    setStep(0)
    setAnswers(new Array(q.questions.length).fill(-1))
    setResult(null)
  }

  const pickAnswer = (index: number) => {
    setAnswers((prev) => {
      const next = [...prev]
      next[step] = index
      return next
    })
  }

  const submitQuiz = () => {
    if (!activeQuiz) return
    const correct = activeQuiz.questions.reduce(
      (sum, q, i) => (answers[i] === q.answerIndex ? sum + 1 : sum),
      0,
    )
    const total = activeQuiz.questions.length
    const saved = submitQuizResult(activeQuiz.id, activeQuiz.subject, correct, total)
    setResult({ correct, total, score: saved.score })
    pushToast({
      title: saved.score >= PASS_MARK ? `Quiz passed — ${saved.score}%` : `Quiz submitted — ${saved.score}%`,
      description: `${correct} of ${total} correct. ${saved.score >= PASS_MARK ? 'Above' : 'Below'} the ${PASS_MARK}% pass mark.`,
      tone: saved.score >= PASS_MARK ? 'success' : 'warning',
    })
  }

  const clearAssessmentFilters = () => {
    setTypeFilter('All')
    setStatusFilter('All')
  }

  return (
    <div className="animate-fade-in-up space-y-5 sm:space-y-6">
      <PageHeader
        title="Assessments"
        subtitle="Everything graded and due this semester, plus interactive quizzes you can take right now."
        actions={
          <Button variant="outline" onClick={() => navigate('/student/learning-plan')}>
            <ListTodo className="h-4 w-4" aria-hidden />
            Learning plan
          </Button>
        }
      />

      <Tabs
        items={[
          { value: 'assessments', label: 'Assessments', count: assessments.length, icon: <ClipboardList className="h-3.5 w-3.5" aria-hidden /> },
          { value: 'quizzes', label: 'Quizzes', count: QUIZZES.length, icon: <PenLine className="h-3.5 w-3.5" aria-hidden /> },
        ]}
        value={tab}
        onChange={setTab}
      />

      {tab === 'assessments' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              label="Completed"
              value={completed.length}
              tone="success"
              hint={`Average score ${avgScore}%`}
              icon={<Check className="h-4 w-4" aria-hidden />}
            />
            <StatCard
              label="Pending"
              value={pending.length}
              tone="warning"
              hint="Due soon"
              icon={<Clock className="h-4 w-4" aria-hidden />}
            />
            <StatCard
              label="Overdue"
              value={overdue.length}
              tone={overdue.length > 0 ? 'danger' : 'brand'}
              hint="Needs immediate attention"
              icon={<Info className="h-4 w-4" aria-hidden />}
            />
            <StatCard
              label="Total items"
              value={assessments.length}
              tone="info"
              hint="Across all subjects"
              icon={<ClipboardList className="h-4 w-4" aria-hidden />}
            />
          </div>

          <DataTable<Assessment>
            columns={columns}
            rows={filtered}
            getRowId={(a) => a.id}
            onRowClick={(a) => setSelected(a)}
            searchFields={(a) => [a.subject, a.title, a.type]}
            searchPlaceholder="Search assessments…"
            toolbar={
              <>
                <div className="w-40">
                  <Select
                    label="Type"
                    options={[
                      { value: 'All', label: 'All types' },
                      { value: 'Quiz', label: 'Quiz' },
                      { value: 'Assignment', label: 'Assignment' },
                      { value: 'Internal', label: 'Internal' },
                      { value: 'Exam', label: 'Exam' },
                    ]}
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                  />
                </div>
                <div className="w-40">
                  <Select
                    label="Status"
                    options={[
                      { value: 'All', label: 'All statuses' },
                      { value: 'Completed', label: 'Completed' },
                      { value: 'Pending', label: 'Pending' },
                      { value: 'Overdue', label: 'Overdue' },
                      { value: 'Upcoming', label: 'Upcoming' },
                    ]}
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  />
                </div>
              </>
            }
            emptyTitle="No assessments match your filters"
            emptyDescription="Try a different type or status, or clear the filters to see everything."
            emptyAction={
              <Button size="sm" variant="outline" onClick={clearAssessmentFilters}>
                <RotateCcw className="h-3.5 w-3.5" aria-hidden />
                Clear filters
              </Button>
            }
          />
          <p className="text-[12.5px] text-ink-subtle">
            Select any row to open its detail card and coaching note.
          </p>
        </div>
      )}

      {tab === 'quizzes' && (
        <div className="space-y-5">
          {QUIZZES.length === 0 ? (
            <EmptyState
              icon={<PenLine className="h-5 w-5" aria-hidden />}
              title="No quizzes available"
              description="Interactive quizzes will appear here when your teacher publishes them."
            />
          ) : (
            <div className="grid gap-4 lg:grid-cols-3">
              {QUIZZES.map((q) => {
                const attempt = quizResults[q.id]
                return (
                  <Card key={q.id} className="flex flex-col">
                    <CardHeader
                      icon={<ClipboardCheck className="h-4.5 w-4.5" aria-hidden />}
                      title={q.title}
                      description={`${q.questions.length} questions · one attempt at a time`}
                      actions={<Badge tone="neutral">{q.subject}</Badge>}
                    />
                    <CardContent className="flex flex-1 flex-col gap-3 pt-2">
                      {attempt ? (
                        <div className="rounded-xl bg-panel-muted px-3 py-2.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[12px] text-ink-subtle">Last attempt</span>
                            <Badge tone={attempt.score >= PASS_MARK ? 'success' : 'danger'}>
                              {attempt.correct}/{attempt.total} · {attempt.score}%
                            </Badge>
                          </div>
                          <p className="mt-1 text-[11.5px] text-ink-faint">{relativeTime(attempt.at)}</p>
                        </div>
                      ) : (
                        <div className="rounded-xl border border-dashed border-line px-3 py-2.5 text-[12.5px] text-ink-subtle">
                          Not attempted yet — pass mark is {PASS_MARK}%.
                        </div>
                      )}
                      <div className="mt-auto">
                        <Button size="sm" onClick={() => startQuiz(q)}>
                          <Play className="h-3.5 w-3.5" aria-hidden />
                          {attempt ? 'Retake quiz' : 'Start quiz'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ---------------- assessment detail ---------------- */}
      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={selected?.title ?? ''}
        description={selected ? `${selected.subject} · ${selected.type}` : undefined}
        footer={
          <Button variant="outline" onClick={() => setSelected(null)}>
            Close
          </Button>
        }
      >
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-[13px]">
              <div className="rounded-xl bg-panel-muted px-3 py-2.5">
                <p className="text-[11.5px] text-ink-subtle">Due date</p>
                <p className="mt-0.5 font-semibold text-ink">{formatDate(selected.dueDate)}</p>
                <p className="text-[11.5px] text-ink-faint">{dueLabel(selected.dueDate)}</p>
              </div>
              <div className="rounded-xl bg-panel-muted px-3 py-2.5">
                <p className="text-[11.5px] text-ink-subtle">Score</p>
                <p className="mt-0.5 font-semibold text-ink">
                  {selected.score === null ? 'Not graded' : `${selected.score}/${selected.maxScore}`}
                </p>
                <p className="text-[11.5px] text-ink-faint">Pass mark {PASS_MARK}%</p>
              </div>
              <div className="rounded-xl bg-panel-muted px-3 py-2.5">
                <p className="text-[11.5px] text-ink-subtle">Status</p>
                <p className="mt-1">
                  <Badge tone={statusTone(selected.status)}>{selected.status}</Badge>
                </p>
              </div>
              <div className="rounded-xl bg-panel-muted px-3 py-2.5">
                <p className="text-[11.5px] text-ink-subtle">Type</p>
                <p className="mt-1">
                  <Badge tone="neutral">{selected.type}</Badge>
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-line bg-panel-muted px-3.5 py-3">
              <p className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wide text-ink-muted">
                <Info className="h-3.5 w-3.5" aria-hidden />
                Coaching note
              </p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
                {coachingNote(selected)}
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* ---------------- quiz modal ---------------- */}
      <Modal
        open={activeQuiz !== null}
        onClose={() => setActiveQuiz(null)}
        size="lg"
        title={activeQuiz?.title ?? ''}
        description={
          activeQuiz
            ? result
              ? 'Attempt submitted'
              : `Question ${step + 1} of ${activeQuiz.questions.length} · ${activeQuiz.subject}`
            : undefined
        }
        footer={
          result ? (
            <>
              <Button
                variant="outline"
                onClick={() => activeQuiz && startQuiz(activeQuiz)}
              >
                <RotateCcw className="h-4 w-4" aria-hidden />
                Retake
              </Button>
              <Button onClick={() => setActiveQuiz(null)}>Back to quizzes</Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
              >
                <ArrowLeft className="h-4 w-4" aria-hidden />
                Previous
              </Button>
              {activeQuiz && step === activeQuiz.questions.length - 1 ? (
                <Button
                  onClick={submitQuiz}
                  disabled={answers[step] === -1}
                >
                  <Trophy className="h-4 w-4" aria-hidden />
                  Submit quiz
                </Button>
              ) : (
                <Button
                  onClick={() => setStep((s) => s + 1)}
                  disabled={answers[step] === -1}
                >
                  Next
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Button>
              )}
            </>
          )
        }
      >
        {activeQuiz && !result && (
          <div className="space-y-4">
            <div>
              <div className="mb-1.5 flex items-center justify-between text-[12px]">
                <span className="text-muted">
                  Question {step + 1} of {activeQuiz.questions.length}
                </span>
                <span className="font-semibold text-ink">
                  {answers.filter((a) => a !== -1).length} answered
                </span>
              </div>
              <Progress value={((step + 1) / activeQuiz.questions.length) * 100} />
            </div>

            <div>
              <h3 className="text-[15px] font-semibold leading-relaxed text-ink">
                {activeQuiz.questions[step].question}
              </h3>
              <div role="radiogroup" aria-label="Answer options" className="mt-3 space-y-2">
                {activeQuiz.questions[step].options.map((opt, i) => {
                  const isSelected = answers[step] === i
                  return (
                    <button
                      key={opt}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => pickAnswer(i)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left text-[13.5px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
                        isSelected
                          ? 'border-accent bg-accent/8 text-ink'
                          : 'border-line bg-panel text-ink-muted hover:border-accent/40 hover:bg-panel-muted',
                      )}
                    >
                      <span
                        className={cn(
                          'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold',
                          isSelected ? 'bg-accent text-white' : 'bg-panel-muted text-ink-subtle',
                        )}
                        aria-hidden
                      >
                        {String.fromCharCode(65 + i)}
                      </span>
                      {opt}
                    </button>
                  )
                })}
              </div>
            </div>

            {answers[step] === -1 && (
              <p className="text-[12.5px] text-ink-subtle">
                Pick an option to continue — answers save as you go.
              </p>
            )}
          </div>
        )}

        {activeQuiz && result && (
          <div className="space-y-5">
            <div className="flex flex-col items-center gap-3 py-2">
              <div className="relative h-28 w-28">
                <svg viewBox="0 0 100 100" className="h-28 w-28 -rotate-90" aria-hidden>
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    strokeWidth="10"
                    className="stroke-panel-muted"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    strokeWidth="10"
                    strokeLinecap="round"
                    stroke={scoreColor(result.score)}
                    strokeDasharray={`${(result.score / 100) * 263.9} 263.9`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-ink">{result.score}%</span>
                  <span className="text-[11px] text-ink-subtle">
                    {result.correct}/{result.total}
                  </span>
                </div>
              </div>
              <Badge tone={result.score >= PASS_MARK ? 'success' : 'danger'}>
                {result.score >= PASS_MARK
                  ? `Passed · ${PASS_MARK}% pass mark`
                  : `Below the ${PASS_MARK}% pass mark`}
              </Badge>
              <p className="max-w-sm text-center text-[13px] leading-relaxed text-muted">
                {result.score >= PASS_MARK
                  ? 'Solid work — this result has been saved and the matching assessment is now marked completed.'
                  : 'Review the explanations below, then retake the quiz when you are ready.'}
              </p>
            </div>

            <div className="space-y-3">
              {activeQuiz.questions.map((q, i) => {
                const userIndex = answers[i]
                const isCorrect = userIndex === q.answerIndex
                return (
                  <div
                    key={q.id}
                    className={cn(
                      'rounded-xl border px-3.5 py-3',
                      isCorrect
                        ? 'border-emerald-400/50 bg-emerald-50/50 dark:bg-emerald-500/8'
                        : 'border-red-400/50 bg-red-50/50 dark:bg-red-500/8',
                    )}
                  >
                    <div className="flex items-start gap-2.5">
                      <span
                        className={cn(
                          'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white',
                          isCorrect ? 'bg-emerald-500' : 'bg-red-500',
                        )}
                        aria-hidden
                      >
                        {isCorrect ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      </span>
                      <div className="min-w-0">
                        <p className="text-[13.5px] font-medium text-ink">{q.question}</p>
                        <p className="mt-1 text-[12.5px] text-ink-muted">
                          Your answer:{' '}
                          <span className={isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>
                            {userIndex >= 0 ? q.options[userIndex] : 'Not answered'}
                          </span>
                          {!isCorrect && (
                            <>
                              {' · '}Correct:{' '}
                              <span className="font-semibold text-ink">{q.options[q.answerIndex]}</span>
                            </>
                          )}
                        </p>
                        <p className="mt-1 text-[12.5px] leading-relaxed text-ink-subtle">
                          {q.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
