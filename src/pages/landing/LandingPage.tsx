import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bell,
  BookOpen,
  Building2,
  Check,
  ChevronDown,
  ClipboardCheck,
  Eye,
  FileText,
  GraduationCap,
  Lightbulb,
  Lock,
  PlayCircle,
  Radar,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Badge, RiskBadge } from '../../components/ui/Badge'
import { MockBadge, PrototypeNote } from '../../components/shared/MockBadge'
import { useAppStore } from '../../store/useAppStore'
import { getStudentRiskPrediction, FACTOR_LABEL } from '../../services/predictionService'
import { getDemoStudent, FAQS } from '../../data/seed'

/* ------------------------------------------------------------------ */
/* Static content                                                      */
/* ------------------------------------------------------------------ */

const STATS = [
  { value: '24', label: 'Seeded students' },
  { value: '6', label: 'Subjects tracked' },
  { value: '4', label: 'Role workspaces' },
  { value: '6', label: 'Risk inputs explained' },
]

const STEPS: { icon: LucideIcon; title: string; body: string; tag: string }[] = [
  {
    icon: BookOpen,
    tag: 'Step 1',
    title: 'Collect academic signals',
    body: 'Attendance, previous semester marks, internal assessments, quizzes, assignment completion and self-study hours are gathered per student.',
  },
  {
    icon: Radar,
    tag: 'Step 2',
    title: 'Predict the risk level',
    body: 'A transparent scoring service compares each signal with a healthy benchmark and returns Low, Medium or High risk with a 0–100 score.',
  },
  {
    icon: Eye,
    tag: 'Step 3',
    title: 'Explain the prediction',
    body: 'Every input is ranked by how much it contributed, so a score is never a black box — students and teachers see exactly why.',
  },
  {
    icon: Target,
    tag: 'Step 4',
    title: 'Recommend the next action',
    body: 'The same factors drive a prioritised action plan with effort estimates, plus interventions on the teacher side.',
  },
]

const FEATURES: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: Radar,
    title: 'Early risk detection',
    body: 'A single 0–100 score per student with clear High, Medium and Low bands agreed with faculty.',
  },
  {
    icon: Eye,
    title: 'Explainable by default',
    body: 'Contribution percentages, raw values and benchmarks for every factor — shaped like a SHAP response.',
  },
  {
    icon: Lightbulb,
    title: 'Personalised action plan',
    body: 'Prioritised recommendations with effort estimates that students can start, complete and track.',
  },
  {
    icon: Activity,
    title: 'Performance analytics',
    body: 'Weekly, monthly and semester trends across marks, attendance, quizzes and assignments.',
  },
  {
    icon: Users,
    title: 'Cohort monitoring',
    body: 'Teachers filter, sort and drill into 24 students, then log notes, interventions and follow-ups.',
  },
  {
    icon: FileText,
    title: 'Printable reports',
    body: 'Generate, print and download a self-contained report for any role in a couple of clicks.',
  },
]

const AUDIENCES: { icon: LucideIcon; role: string; path: string; body: string; points: string[] }[] = [
  {
    icon: GraduationCap,
    role: 'Students',
    path: '/login/student',
    body: 'Own your progress instead of guessing at it.',
    points: ['Risk score + reasons', 'Action plan tracking', 'Attendance & quiz insights'],
  },
  {
    icon: Users,
    role: 'Teachers',
    path: '/login/teacher',
    body: 'Spend your limited hours where they matter most.',
    points: ['Cohort risk table', 'Early-warning alerts', 'Intervention records'],
  },
  {
    icon: Building2,
    role: 'Institutions',
    path: '/login/institution',
    body: 'See department-level patterns before results day.',
    points: ['Department analytics', 'Semester comparison', 'Institution reports'],
  },
  {
    icon: BarChart3,
    role: 'Organizations',
    path: '/login/organization',
    body: 'Operate many institutions from one console.',
    points: ['Tenant management', 'Program portfolio', 'Platform adoption'],
  },
]

const PREVIEWS: Record<string, { title: string; caption: string; rows: { label: string; value: string; tone?: string }[] }> = {
  Student: {
    title: 'Student dashboard',
    caption: 'My risk, my reasons, my plan',
    rows: [
      { label: 'Risk score', value: '78 · High', tone: 'danger' },
      { label: 'Attendance', value: '66%', tone: 'danger' },
      { label: 'Internal assessment', value: '49%', tone: 'warning' },
      { label: 'Action items done', value: '2 of 6', tone: 'success' },
    ],
  },
  Teacher: {
    title: 'Teacher risk monitor',
    caption: '24 students, sorted by who needs help',
    rows: [
      { label: 'High risk', value: '8 students', tone: 'danger' },
      { label: 'Medium risk', value: '7 students', tone: 'warning' },
      { label: 'Open interventions', value: '4 active', tone: 'success' },
      { label: 'Follow-ups due', value: 'Next 3 days', tone: 'info' },
    ],
  },
  Institution: {
    title: 'Institution analytics',
    caption: 'Department, year, semester, course',
    rows: [
      { label: 'Students in scope', value: '24', tone: 'info' },
      { label: 'Avg performance', value: '69%', tone: 'warning' },
      { label: 'Weakest department', value: 'ECE · 64%', tone: 'danger' },
      { label: 'Reports ready', value: 'October', tone: 'success' },
    ],
  },
}

const RESPONSIBLE = [
  {
    icon: Lock,
    title: 'Runs in your browser',
    body: 'Mock auth and demo data live in localStorage. Nothing is uploaded anywhere in this build.',
  },
  {
    icon: ShieldCheck,
    title: 'Supports, never replaces',
    body: 'Risk scores are a conversation starter for teachers — not a label, grade or automated decision.',
  },
  {
    icon: Sparkles,
    title: 'Honest about itself',
    body: 'Every prediction surface is marked as prototype output from a transparent mock service.',
  },
]

/** Illustrative action-plan rows shown before the demo student has signed in. */
const PLAN_PREVIEW: { t: string; p: string; done: boolean; s: string }[] = [
  { t: 'Improve class attendance', p: 'High', done: true, s: 'Machine Learning' },
  { t: 'Clear assignment backlog', p: 'High', done: true, s: 'Data Structures' },
  { t: 'Daily 20-minute quiz drill', p: 'Medium', done: false, s: 'Computer Networks' },
  { t: 'Block 6 hrs self-study weekly', p: 'Medium', done: false, s: 'All subjects' },
]

/* ------------------------------------------------------------------ */

export function LandingPage() {
  const navigate = useNavigate()
  const student = getDemoStudent()
  const prediction = getStudentRiskPrediction({
    attendance: student.attendance,
    previous_marks: student.previousMarks,
    internal_marks: student.internalMarks,
    quiz_scores: student.quizScore,
    assignment_completion: student.assignmentCompletion,
    learning_activity: student.learningActivity,
    weakSubject: 'Machine Learning',
    studentName: student.name,
  })

  const [preview, setPreview] = useState<string>('Student')
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  // If the demo student has already been working their plan in this browser,
  // the landing preview reflects real progress; otherwise it shows the sample.
  const storedRecommendations = useAppStore((s) => s.recommendations)
  const planRows =
    storedRecommendations.length > 0
      ? storedRecommendations.slice(0, 4).map((r) => ({
          t: r.title,
          p: r.priority,
          done: r.status === 'Completed',
          s: r.relatedSubject,
        }))
      : PLAN_PREVIEW
  const planDone = planRows.filter((r) => r.done).length

  const storedTasks = useAppStore((s) => s.learningTasks)
  const tasksDone = storedTasks.filter((t) => t.done).length
  const taskPercent = storedTasks.length
    ? Math.round((tasksDone / storedTasks.length) * 100)
    : 0

  const previewData = PREVIEWS[preview]

  return (
    <div className="animate-fade-in">
      {/* ============================ 1. HERO ============================ */}
      <section className="relative overflow-hidden border-b border-line">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgb(var(--accent)/0.14),transparent_55%)]"
        />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-panel px-3 py-1.5 text-[12px] font-medium text-ink-muted">
              <Sparkles className="h-3.5 w-3.5 text-accent" aria-hidden />
              Explainable-AI student performance prediction
            </span>

            <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-5xl">
              Predict. Understand.
              <br />
              <span className="text-accent">Improve.</span>
            </h1>

            <p className="mt-5 max-w-xl text-[15.5px] leading-relaxed text-muted">
              EduSense AI flags academic risk early, shows <em>exactly</em> which inputs caused it,
              and turns that explanation into a plan students can actually follow.
            </p>

            <div className="mt-7 flex flex-wrap gap-2.5">
              <Button size="lg" onClick={() => navigate('/login/student')}>
                <PlayCircle className="h-4 w-4" aria-hidden />
                Open student demo
              </Button>
              <Link
                to="/roles"
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-line bg-panel px-5 text-sm font-semibold text-ink transition-colors hover:bg-panel-muted"
              >
                Explore all roles
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-2.5">
              <MockBadge />
              <span className="text-[12px] text-ink-subtle">
                Demo credentials on every login screen · password123
              </span>
            </div>
          </div>

          {/* hero product card */}
          <div className="relative">
            <div className="rounded-3xl border border-line bg-panel p-5 shadow-pop sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
                    Live demo prediction
                  </p>
                  <p className="mt-1 text-[15px] font-bold text-ink">{student.name}</p>
                </div>
                <RiskBadge level={prediction.risk_level} score={prediction.risk_score} />
              </div>

              <div className="mt-5 flex items-end gap-4">
                <div>
                  <p className="text-[46px] font-extrabold leading-none tracking-tight text-ink">
                    {prediction.risk_score}
                  </p>
                  <p className="mt-1 text-[12px] text-ink-subtle">risk score / 100</p>
                </div>
                <div className="mb-1 flex-1">
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-panel-muted">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-red-500"
                      style={{ width: `${prediction.risk_score}%` }}
                    />
                  </div>
                  <p className="mt-2 text-[12px] leading-snug text-ink-subtle">{prediction.summary}</p>
                </div>
              </div>

              <div className="mt-5 space-y-3 border-t border-line pt-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
                  Why this prediction
                </p>
                {prediction.contributing_factors.map((f) => (
                  <div key={f.name}>
                    <div className="flex items-center justify-between text-[12.5px]">
                      <span className="font-medium text-ink">{f.name}</span>
                      <span className="font-semibold text-ink-muted">{f.contribution}%</span>
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-panel-muted">
                      <div
                        className="h-full rounded-full bg-accent"
                        style={{ width: `${f.contribution}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex items-center justify-between gap-3 border-t border-line pt-4">
                <span className="text-[12px] text-ink-subtle">
                  Benchmark gaps · {FACTOR_LABEL.attendance.toLowerCase()} first
                </span>
                <Link
                  to="/roles"
                  className="text-[12.5px] font-semibold text-accent transition-colors hover:underline"
                >
                  See it in the app →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================ 2. STATS ============================ */}
      <section className="border-b border-line bg-panel">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px overflow-hidden sm:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="px-4 py-7 text-center sm:px-6">
              <p className="text-3xl font-extrabold tracking-tight text-ink">{s.value}</p>
              <p className="mt-1 text-[12.5px] text-ink-subtle">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============================ 3. PROBLEM ============================ */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-accent">
              The problem
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              Risk is usually spotted after the semester ends
            </h2>
            <p className="mt-4 text-[14.5px] leading-relaxed text-muted">
              Attendance creep, missed assignments and slipping quiz scores are visible weeks before
              results — but nobody has time to join the dots across every subject and every student.
              By the time it shows up in a mark sheet, the window for intervention has closed.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                icon: TrendingUp,
                title: 'Signals arrive scattered',
                body: 'Attendance in one sheet, marks in another, assignments in a third — no single view of a student.',
              },
              {
                icon: Bell,
                title: 'Alerts come too late',
                body: 'Most institutions react to failed subjects instead of the attendance dip that predicted them.',
              },
              {
                icon: Search,
                title: 'Predictions are opaque',
                body: 'A score nobody can explain gets ignored. Teachers need reasons, not a number.',
              },
              {
                icon: Target,
                title: 'Advice is generic',
                body: '“Study harder” is not a plan. Students need the two actions that move their score most.',
              },
            ].map((c) => (
              <CardLike key={c.title} icon={c.icon} title={c.title} body={c.body} />
            ))}
          </div>
        </div>
      </section>

      {/* ============================ 4. HOW IT WORKS ============================ */}
      <section id="how-it-works" className="scroll-mt-20 border-y border-line bg-panel">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-accent">
              How it works
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              Four steps from raw marks to a plan of action
            </h2>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => {
              const Icon = step.icon
              return (
                <div
                  key={step.title}
                  className="relative rounded-2xl border border-line bg-base p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-card"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-500/12 dark:text-brand-300">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">
                      {step.tag}
                    </span>
                  </div>
                  <h3 className="mt-4 text-[15px] font-semibold text-ink">{step.title}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted">{step.body}</p>
                  {i < STEPS.length - 1 && (
                    <span
                      aria-hidden
                      className="absolute -right-2.5 top-1/2 hidden h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-panel text-ink-faint lg:flex"
                    >
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  )}
                </div>
              )
            })}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed border-line bg-base px-5 py-4">
            <p className="max-w-2xl text-[13px] leading-relaxed text-ink-muted">
              In this prototype the scoring step runs in the browser through a deterministic mock
              service — the same request/response shape as the planned{' '}
              <code className="rounded bg-panel-muted px-1.5 py-0.5 text-[12px] text-accent">
                POST /api/predict
              </code>
              .
            </p>
            <Button variant="outline" size="sm" onClick={() => navigate('/login/student')}>
              Try the flow <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
          </div>
        </div>
      </section>

      {/* ============================ 5. EXPLAINABLE AI ============================ */}
      <section id="explainable" className="scroll-mt-20">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16">
          <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-center">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-accent">
                Explainable AI
              </p>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                “Why this prediction?” is a page, not a footnote
              </h2>
              <p className="mt-4 text-[14.5px] leading-relaxed text-muted">
                Each input is compared with a healthy benchmark, weighted by its importance, and
                ranked by how much it contributed to the score. The result reads like a feature
                importance chart — the same shape a SHAP response would return from a real backend.
              </p>

              <ul className="mt-6 space-y-3">
                {[
                  'Contribution percentages that sum to a clean 100%',
                  'Raw value vs benchmark for every factor',
                  'A plain-language summary students can act on',
                  'Recommendations generated from the same factors',
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2.5 text-[13.5px] text-ink-muted">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/12 dark:text-emerald-400">
                      <Check className="h-3 w-3" aria-hidden />
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-line bg-panel p-5 shadow-card sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
                    Factor contribution
                  </p>
                  <p className="mt-0.5 text-[14px] font-semibold text-ink">
                    {student.name} · {student.rollNo}
                  </p>
                </div>
                <Badge tone="brand">Demo output</Badge>
              </div>

              <div className="mt-5 space-y-4">
                {prediction.contributing_factors.map((f) => (
                  <div key={f.name} className="rounded-xl border border-line bg-base p-3.5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[13.5px] font-semibold text-ink">{f.name}</span>
                      <span className="text-[15px] font-bold text-accent">{f.contribution}%</span>
                    </div>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-panel-muted">
                      <div
                        className="h-full rounded-full bg-accent transition-all duration-700"
                        style={{ width: `${f.contribution}%` }}
                      />
                    </div>
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11.5px] text-ink-subtle">
                      <span>
                        {f.raw.value} vs benchmark {f.raw.benchmark}
                      </span>
                      <span className="font-medium text-ink-muted">{f.name}</span>
                    </div>
                  </div>
                ))}
              </div>

              <p className="mt-4 rounded-xl bg-panel-muted px-3.5 py-3 text-[12.5px] leading-relaxed text-ink-muted">
                {prediction.summary}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================ 6. FEATURES ============================ */}
      <section className="border-y border-line bg-panel">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-accent">
                Platform features
              </p>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                Everything a full early-warning workflow needs
              </h2>
            </div>
            <Link
              to="/roles"
              className="text-[13.5px] font-semibold text-accent transition-colors hover:underline"
            >
              See which role gets what →
            </Link>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => {
              const Icon = f.icon
              return (
                <div
                  key={f.title}
                  className="rounded-2xl border border-line bg-base p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-card"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-500/12 dark:text-brand-300">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="mt-4 text-[15px] font-semibold text-ink">{f.title}</h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{f.body}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ============================ 7. AUDIENCES ============================ */}
      <section id="audiences" className="scroll-mt-20">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-accent">
              For every stakeholder
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              One model, four workspaces
            </h2>
            <p className="mt-3 text-[14.5px] leading-relaxed text-muted">
              Students, teachers, institution administrators and platform operators each see the same
              prediction through the lens of their own responsibilities.
            </p>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {AUDIENCES.map((a) => {
              const Icon = a.icon
              return (
                <div
                  key={a.role}
                  className="flex flex-col rounded-2xl border border-line bg-panel p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-card-hover"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-panel-muted text-accent">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="mt-3.5 text-[15px] font-semibold text-ink">{a.role}</h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-muted">{a.body}</p>
                  <ul className="mt-3 flex-1 space-y-1.5">
                    {a.points.map((p) => (
                      <li key={p} className="flex items-center gap-2 text-[12.5px] text-ink-muted">
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                        {p}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to={a.path}
                    className="mt-4 inline-flex h-9 items-center justify-center rounded-lg border border-line bg-base text-[13px] font-semibold text-ink transition-colors hover:border-accent/50 hover:text-accent"
                  >
                    Sign in as {a.role.toLowerCase().replace(/s$/, '')}
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ============================ 8. ACTION PLAN ============================ */}
      <section className="border-y border-line bg-panel">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 sm:py-16 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-accent">
              From insight to habit
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              A recommendation only counts when it is completed
            </h2>
            <p className="mt-4 text-[14.5px] leading-relaxed text-muted">
              Each recommendation carries a priority, an effort estimate and the subject it belongs
              to. Students start it, complete it and watch the progress bar move — while teachers see
              the same actions in their intervention list.
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <Button onClick={() => navigate('/login/student')}>
                Open the action plan <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
              <Link
                to="/forgot-password"
                className="inline-flex h-10 items-center rounded-lg border border-line bg-base px-4 text-sm font-medium text-ink transition-colors hover:bg-panel-muted"
              >
                Recovery flow demo
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-line bg-base p-5 shadow-card">
            <div className="flex items-center justify-between">
              <p className="text-[13px] font-semibold text-ink">Personalised action plan</p>
              <Badge tone={planDone === planRows.length ? 'success' : 'brand'}>
                {planDone} of {storedRecommendations.length || planRows.length} done
              </Badge>
            </div>
            <div className="mt-4 space-y-3">
              {planRows.map((r) => (
                <div
                  key={r.t}
                  className="flex items-center gap-3 rounded-xl border border-line bg-panel px-3.5 py-3"
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                      r.done
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : 'border-line bg-panel-muted text-transparent'
                    }`}
                  >
                    <Check className="h-3 w-3" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`truncate text-[13.5px] font-medium ${
                        r.done ? 'text-ink-subtle line-through' : 'text-ink'
                      }`}
                    >
                      {r.t}
                    </p>
                    <p className="truncate text-[11.5px] text-ink-subtle">{r.s}</p>
                  </div>
                  <Badge tone={r.p === 'High' ? 'danger' : 'warning'}>{r.p}</Badge>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-xl bg-panel-muted px-3.5 py-3">
              <p className="text-[11.5px] font-semibold uppercase tracking-wider text-ink-faint">
                Learning plan this week
              </p>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-panel">
                <div
                  className="h-full rounded-full bg-accent transition-all duration-700"
                  style={{ width: `${taskPercent}%` }}
                />
              </div>
              <p className="mt-1.5 text-[11.5px] text-ink-subtle">
                {tasksDone} of {storedTasks.length} study blocks completed · persisted between
                sessions
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================ 9. PRODUCT PREVIEW ============================ */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-accent">
              Inside the product
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              Switch between workspaces
            </h2>
          </div>
          <div className="inline-flex rounded-xl border border-line bg-panel p-1">
            {Object.keys(PREVIEWS).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setPreview(key)}
                aria-pressed={preview === key}
                className={`rounded-lg px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
                  preview === key
                    ? 'bg-accent text-white shadow-sm'
                    : 'text-ink-muted hover:bg-panel-muted hover:text-ink'
                }`}
              >
                {key}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-3xl border border-line bg-panel shadow-card">
          <div className="flex items-center gap-2 border-b border-line bg-panel-muted px-4 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400" aria-hidden />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" aria-hidden />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" aria-hidden />
            <span className="ml-3 truncate font-mono text-[11.5px] text-ink-faint">
              edusense.ai / {preview.toLowerCase()} / dashboard
            </span>
          </div>

          <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-[17px] font-bold text-ink">{previewData.title}</h3>
                  <p className="text-[13px] text-muted">{previewData.caption}</p>
                </div>
                <MockBadge compact />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                {previewData.rows.map((r) => (
                  <div key={r.label} className="rounded-xl border border-line bg-base p-3.5">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">
                      {r.label}
                    </p>
                    <p
                      className={`mt-1 text-[18px] font-bold ${
                        r.tone === 'danger'
                          ? 'text-red-600 dark:text-red-400'
                          : r.tone === 'warning'
                            ? 'text-amber-600 dark:text-amber-400'
                            : r.tone === 'success'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-ink'
                      }`}
                    >
                      {r.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {[
                { icon: ClipboardCheck, t: 'Assessments & quizzes', d: 'Interactive quiz flow with per-question explanations.' },
                { icon: Activity, t: 'Attendance dashboard', d: 'Monthly trend, subject filters and 75% warnings.' },
                { icon: FileText, t: 'Report generator', d: 'Generate → print → download in one click.' },
                { icon: Bell, t: 'Notification center', d: 'Read, unread and delete with a live badge count.' },
              ].map((x) => {
                const Icon = x.icon
                return (
                  <div
                    key={x.t}
                    className="flex items-start gap-3 rounded-xl border border-line bg-base p-3.5"
                  >
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-panel-muted text-accent">
                      <Icon className="h-4 w-4" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[13.5px] font-semibold text-ink">{x.t}</p>
                      <p className="text-[12.5px] leading-relaxed text-muted">{x.d}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ============================ 10. RESPONSIBLE AI ============================ */}
      <section className="border-y border-line bg-panel">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-accent">
                Responsible by design
              </p>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                Built to support teachers, not replace them
              </h2>
              <p className="mt-4 text-[14.5px] leading-relaxed text-muted">
                Predictions here are demo values produced by a transparent, deterministic service.
                No accuracy claims, no automated decisions, no student labelling — the point of the
                prototype is to show how explainability should look when a real model is added.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {RESPONSIBLE.map((r) => {
                const Icon = r.icon
                return (
                  <div key={r.title} className="rounded-2xl border border-line bg-base p-4">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/12 dark:text-emerald-400">
                      <Icon className="h-4.5 w-4.5" aria-hidden />
                    </span>
                    <h3 className="mt-3 text-[14px] font-semibold text-ink">{r.title}</h3>
                    <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">{r.body}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ============================ 11. FAQ ============================ */}
      <section id="faq" className="scroll-mt-20">
        <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-16">
          <div className="text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-accent">FAQ</p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              Questions worth asking
            </h2>
          </div>

          <div className="mt-8 space-y-3">
            {FAQS.map((f, i) => {
              const open = openFaq === i
              return (
                <div key={f.q} className="overflow-hidden rounded-2xl border border-line bg-panel">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(open ? null : i)}
                    aria-expanded={open}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-panel-muted/60"
                  >
                    <span className="text-[14px] font-semibold text-ink">{f.q}</span>
                    <ChevronDown
                      className={`h-4.5 w-4.5 shrink-0 text-ink-faint transition-transform duration-200 ${
                        open ? 'rotate-180' : ''
                      }`}
                      aria-hidden
                    />
                  </button>
                  {open && (
                    <p className="animate-fade-in border-t border-line px-5 py-4 text-[13.5px] leading-relaxed text-muted">
                      {f.a}
                    </p>
                  )}
                </div>
              )
            })}
          </div>

          <div className="mt-6">
            <PrototypeNote />
          </div>
        </div>
      </section>

      {/* ============================ 12. CTA ============================ */}
      <section className="border-t border-line bg-panel">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16">
          <div className="rounded-3xl border border-line bg-base px-6 py-10 text-center sm:px-10">
            <h2 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              Ready to see your own risk explained?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-[14.5px] leading-relaxed text-muted">
              Sign in with the student demo account, open the risk analysis page and follow the plan
              through to a generated report — then repeat as teacher, institution and administrator.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
              <Button size="lg" onClick={() => navigate('/login/student')}>
                Student demo <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/roles')}>
                Choose a role
              </Button>
            </div>
            <p className="mt-4 text-[12px] text-ink-subtle">
              student@demo.com · teacher@demo.com · college@demo.com · admin@demo.com — all with
              password123
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

/** Small problem-statement card used in section 3. */
function CardLike({
  icon: Icon,
  title,
  body,
}: {
  icon: LucideIcon
  title: string
  body: string
}) {
  return (
    <div className="rounded-2xl border border-line bg-panel p-4 shadow-card">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-panel-muted text-accent">
        <Icon className="h-4.5 w-4.5" aria-hidden />
      </span>
      <h3 className="mt-3 text-[14.5px] font-semibold text-ink">{title}</h3>
      <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{body}</p>
    </div>
  )
}
