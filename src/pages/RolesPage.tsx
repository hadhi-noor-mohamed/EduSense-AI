import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Building2,
  Check,
  Copy,
  GraduationCap,
  LayoutDashboard,
  ShieldCheck,
  Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card, CardContent } from '../components/ui/Card'
import { Badge, RiskBadge } from '../components/ui/Badge'
import { MockBadge, PrototypeNote } from '../components/shared/MockBadge'
import { useAppStore } from '../store/useAppStore'
import { DEMO_ACCOUNTS } from '../data/seed'
import { ROLE_LABEL } from '../layouts/navConfig'
import type { Role } from '../types'

interface RoleCard {
  role: Role
  icon: LucideIcon
  headline: string
  description: string
  features: string[]
  preview: { label: string; value: string }[]
}

const ROLE_CARDS: RoleCard[] = [
  {
    role: 'student',
    icon: GraduationCap,
    headline: 'Understand your own risk',
    description:
      'See your predicted risk level, exactly which inputs drove it, and a prioritised action plan you can work through day by day.',
    features: [
      'Personal risk score with a full explainability breakdown',
      'Action plan with start / complete tracking',
      'Weekly, monthly and semester performance views',
      'Attendance warnings, quizzes and a printable report',
    ],
    preview: [
      { label: 'Risk score', value: '78 / 100' },
      { label: 'Top factor', value: 'Attendance' },
    ],
  },
  {
    role: 'teacher',
    icon: Users,
    headline: 'Spot students early',
    description:
      'Monitor your cohort, sort by risk, open a student to see the reasons behind the prediction, then log a note or an intervention.',
    features: [
      'Searchable, filterable and sortable student risk table',
      'Risk monitor with cohort charts and early warnings',
      'Student detail with notes, interventions and follow-ups',
      'Intervention tracker with statuses and due dates',
    ],
    preview: [
      { label: 'Cohort', value: '24 students' },
      { label: 'High risk', value: '8 flagged' },
    ],
  },
  {
    role: 'institution',
    icon: Building2,
    headline: 'See the whole institution',
    description:
      'Filter by department, year, semester and course to understand where performance is slipping before it shows up in results.',
    features: [
      'Department, year, semester and course filters',
      'Department performance and semester comparison charts',
      'At-risk summaries across the student population',
      'Institutional risk & performance report generator',
    ],
    preview: [
      { label: 'Departments', value: '6' },
      { label: 'Avg performance', value: '69%' },
    ],
  },
  {
    role: 'organization',
    icon: LayoutDashboard,
    headline: 'Operate the platform',
    description:
      'Manage tenants, programs and platform users, and follow adoption and retention signals across every institution.',
    features: [
      'Institution CRUD with plans, status and performance',
      'Program portfolio and platform user management',
      'Growth, adoption and retention analytics',
      'Platform-level notification center and reports',
    ],
    preview: [
      { label: 'Institutions', value: '8 tenants' },
      { label: 'Programs', value: '6 programs' },
    ],
  },
]

const COMPARE: { label: string; student: string; teacher: string; institution: string; org: string }[] = [
  { label: 'Risk prediction', student: 'Own score', teacher: 'Cohort', institution: 'Population', org: 'Platform-wide' },
  { label: 'Explainability', student: 'Full factors', teacher: 'Per student', institution: 'By department', org: 'Aggregated' },
  { label: 'Recommendations', student: 'Action plan', teacher: 'Interventions', institution: 'Policy actions', org: 'Tenant actions' },
  { label: 'Reports', student: 'Personal', teacher: 'Class', institution: 'Institution', org: 'Platform' },
  { label: 'Data scope', student: 'Self', teacher: '24 students', institution: '6 departments', org: '8 institutions' },
]

export function RolesPage() {
  const navigate = useNavigate()
  const pushToast = useAppStore((s) => s.pushToast)

  const copyCredentials = async () => {
    const text = DEMO_ACCOUNTS.map((a) => `${a.email} · password123`).join('\n')
    try {
      await navigator.clipboard.writeText(text)
      pushToast({ title: 'Credentials copied', description: 'Four demo logins are on your clipboard.', tone: 'success' })
    } catch {
      pushToast({ title: 'Copy unavailable', description: 'Clipboard access was blocked by the browser.', tone: 'error' })
    }
  }

  return (
    <div className="animate-fade-in-up">
      {/* ---------------- header ---------------- */}
      <section className="border-b border-line bg-panel">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="flex flex-col items-start gap-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-panel-muted px-3 py-1.5 text-[12px] font-medium text-ink-muted">
              <ShieldCheck className="h-4 w-4 text-accent" aria-hidden />
              Role-based access · demo build
            </span>
            <h1 className="max-w-3xl text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl">
              Choose how you want to explore EduSense AI
            </h1>
            <p className="max-w-2xl text-[15px] leading-relaxed text-muted">
              Four workspaces, one explainable risk model. Pick a role to land in its dashboard —
              every role ships with its own seeded demo data and login.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <MockBadge />
              <Badge tone="neutral">Mock authentication</Badge>
              <Badge tone="neutral">localStorage persistence</Badge>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- role cards ---------------- */}
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="grid gap-5 lg:grid-cols-2">
          {ROLE_CARDS.map((card, i) => {
            const Icon = card.icon
            const account = DEMO_ACCOUNTS.find((a) => a.role === card.role)
            return (
              <Card
                key={card.role}
                className="group flex flex-col overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-card-hover"
                style={{ animationDelay: `${i * 70}ms` }}
              >
                <CardContent className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-500/12 dark:text-brand-300">
                        <Icon className="h-5.5 w-5.5" aria-hidden />
                      </span>
                      <div>
                        <p className="text-[15px] font-bold text-ink">{ROLE_LABEL[card.role]}</p>
                        <p className="text-[12.5px] text-ink-subtle">{card.headline}</p>
                      </div>
                    </div>
                    <Badge tone="brand">Role {i + 1}</Badge>
                  </div>

                  <p className="mt-4 text-[13.5px] leading-relaxed text-muted">{card.description}</p>

                  <ul className="mt-4 space-y-2">
                    {card.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-[13px] text-ink-muted">
                        <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/12 dark:text-emerald-400">
                          <Check className="h-2.5 w-2.5" aria-hidden />
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 grid grid-cols-2 gap-2.5">
                    {card.preview.map((p) => (
                      <div key={p.label} className="rounded-xl border border-line bg-panel-muted px-3 py-2">
                        <p className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-subtle">{p.label}</p>
                        <p className="mt-0.5 text-[14px] font-bold text-ink">{p.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
                    <div className="min-w-0">
                      <p className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-faint">Demo login</p>
                      <p className="truncate font-mono text-[12px] text-ink-muted">{account?.email}</p>
                    </div>
                    <Button onClick={() => navigate(`/login/${card.role}`)}>
                      Enter workspace
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* ---------------- credentials ---------------- */}
        <Card className="mt-6">
          <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[15px] font-semibold text-ink">Demo credentials</p>
              <p className="mt-1 text-[13px] text-muted">
                All four accounts use the same password. Sessions are mocked and saved in this browser.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <code className="rounded-lg border border-line bg-panel-muted px-3 py-2 text-[12px] text-ink-muted">
                password123
              </code>
              <Button variant="outline" onClick={copyCredentials}>
                <Copy className="h-4 w-4" aria-hidden />
                Copy all
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ---------------- comparison ---------------- */}
      <section className="border-y border-line bg-panel">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
          <h2 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">What each role sees</h2>
          <p className="mt-1.5 max-w-2xl text-[13.5px] text-muted">
            The same explainability layer, scoped to what that role is responsible for.
          </p>

          <div className="mt-5 overflow-x-auto rounded-2xl border border-line">
            <table className="w-full min-w-[640px] border-collapse text-left text-[13px]">
              <thead>
                <tr className="bg-panel-muted">
                  <th className="px-4 py-3 font-semibold text-ink">Capability</th>
                  <th className="px-4 py-3 font-semibold text-ink">Student</th>
                  <th className="px-4 py-3 font-semibold text-ink">Teacher</th>
                  <th className="px-4 py-3 font-semibold text-ink">Institution</th>
                  <th className="px-4 py-3 font-semibold text-ink">Organization</th>
                </tr>
              </thead>
              <tbody>
                {COMPARE.map((row) => (
                  <tr key={row.label} className="border-t border-line">
                    <td className="px-4 py-3 font-medium text-ink">{row.label}</td>
                    <td className="px-4 py-3 text-ink-muted">{row.student}</td>
                    <td className="px-4 py-3 text-ink-muted">{row.teacher}</td>
                    <td className="px-4 py-3 text-ink-muted">{row.institution}</td>
                    <td className="px-4 py-3 text-ink-muted">{row.org}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ---------------- risk legend + CTA ---------------- */}
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="grid gap-5 lg:grid-cols-3">
          <Card>
            <CardContent>
              <p className="text-[15px] font-semibold text-ink">Risk bands used everywhere</p>
              <div className="mt-4 space-y-3">
                {[
                  { level: 'High' as const, range: 'score ≥ 65', note: 'Needs attention this week' },
                  { level: 'Medium' as const, range: 'score 40 – 64', note: 'Watch and sustain' },
                  { level: 'Low' as const, range: 'score < 40', note: 'On track' },
                ].map((b) => (
                  <div key={b.level} className="flex items-center justify-between gap-3 rounded-xl border border-line bg-panel-muted px-3 py-2.5">
                    <RiskBadge level={b.level} />
                    <div className="text-right">
                      <p className="text-[12px] font-semibold text-ink">{b.range}</p>
                      <p className="text-[11.5px] text-ink-subtle">{b.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardContent className="flex h-full flex-col justify-between gap-5">
              <div>
                <p className="text-[15px] font-semibold text-ink">Ready to walk the full demo flow?</p>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">
                  Start on the landing page, sign in as the student, open “Why this prediction?”,
                  complete an action item, attempt a quiz, then switch to the teacher and institution
                  roles to see the same data from the other side.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="lg" onClick={() => navigate('/login/student')}>
                  Start as student
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate('/')}>
                  Back to home
                </Button>
              </div>
              <PrototypeNote />
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
