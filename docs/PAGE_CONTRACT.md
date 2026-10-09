# EduSense AI — Page Authoring Contract

Every page in this app follows the rules below. Read this file completely before writing code,
then read the source files listed under **READ FIRST** — their real prop signatures override
anything you assume.

---

## 1. Hard rules

1. **TypeScript is fully strict.** `strict`, `noUnusedLocals`, `noUnusedParameters`,
   `verbatimModuleSyntax`, `erasableSyntaxOnly` are all on.
   - Type-only imports MUST use `import type { … }`.
   - No `enum`, no `namespace`, no parameter properties (not erasable).
   - Every imported symbol must be used. One unused import = build failure.
2. **Only create/modify files inside your assigned folder.** Never touch shared components,
   the store, seed data, `App.tsx`, layouts or config files. If something shared is missing,
   build it locally inside your own folder.
3. **No dead interactive elements.** Every button, link, tab, filter and icon must do something
   real (navigate, filter, open a modal, call a store action, show a toast). No `TODO`, no
   `console.log`, no stub handlers.
4. **No false AI claims.** Outputs are "Demo Prediction / Prototype ML Output". Never state
   accuracy percentages, never say "real-time AI". Every page that shows a prediction must make
   it visible that it comes from a mock service (use `<MockBadge />` or `<PrototypeNote />`).
5. **Responsive**: desktop (sidebar layout already provided by `AppLayout`) → tablet → mobile.
   Use Tailwind responsive prefixes; grids must collapse to 1 column on small screens; tables
   must scroll horizontally in a wrapper (`overflow-x-auto`) on small screens.
6. **Dark mode** is class-based and automatic if you use only the semantic tokens
   (`bg-base`, `bg-panel`, `bg-panel-muted`, `border-line`, `text-ink`, `text-ink-muted`,
   `text-ink-subtle`, `text-ink-faint`, `text-muted`, `text-accent`, `bg-accent`, `shadow-card`).
   Avoid raw colors except for charts, status tints (`bg-red-50 text-red-600 dark:bg-red-500/12
   dark:text-red-400`) and `CHART_COLORS`.
7. **Accessibility**: label icon-only buttons (`IconButton` requires `label`), use `aria-hidden`
   on decorative icons, keep visible focus rings, associate inputs with labels (the `Input`,
   `Select`, `Textarea` components do this when you pass `label`).
8. **Interactions give feedback**: call `pushToast({ title, description?, tone })` from the store
   after any mutation, and show loading/empty states where appropriate.
9. Prefer composing the shared kit over hand-rolled markup. If you need a new repeated piece of
   UI, put it in your own folder (e.g. `src/pages/teacher/components/…`).

---

## 2. READ FIRST (in this order)

| File | Why |
| --- | --- |
| `src/components/ui/index.ts` | Barrel of the whole UI kit |
| `src/components/ui/Button.tsx` | `Button`, `IconButton` |
| `src/components/ui/Card.tsx` | `Card`, `CardHeader`, `CardContent`, `CardFooter`, `Overline` |
| `src/components/ui/PageHeader.tsx` | `PageHeader`, `PageSection` — start every page with `PageHeader` |
| `src/components/ui/StatCard.tsx` | `StatCard` |
| `src/components/ui/ChartCard.tsx` | `ChartCard` (chart container) |
| `src/components/ui/DataTable.tsx` | generic typed table (`DataTable<T>` with `Column<T>[]`) |
| `src/components/ui/Badge.tsx` | `Badge`, `RiskBadge`, `StatusDot` |
| `src/components/ui/Input.tsx` | `Input`, `Textarea`, `Select`, `Checkbox`, `Switch`, `FieldGroup` |
| `src/components/ui/Modal.tsx` | `Modal`, `ConfirmDialog` |
| `src/components/ui/Tabs.tsx` | `Tabs`, `SegmentedControl` |
| `src/components/ui/States.tsx` | `EmptyState`, `NoResults`, `ErrorState`, skeletons |
| `src/components/ui/Progress.tsx` | `Progress`, `ProgressWithLabel` |
| `src/components/ui/Avatar.tsx` | `Avatar`, `AvatarGroup`, `AVATAR_TONE_KEYS` |
| `src/components/charts/ChartPrimitives.tsx` | `TrendChart`, `CategoryBar`, `DonutChart`, `RiskScatter`, `SeriesDef`, `ScatterPoint` |
| `src/components/charts/RiskGauge.tsx` | `RiskGauge` |
| `src/components/charts/RiskFactorChart.tsx` | `RiskFactorChart`, `RiskFactorLegend` |
| `src/hooks/useChartTheme.tsx` | chart theming hook (`useChartTheme`, `ChartTooltipCard`) |
| `src/components/shared/*` | `MockBadge`, `PrototypeNote`, `FilterBar`, `toOptions`, `NotificationsView`, `SettingsView`, `ReportView`, `Brand` |
| `src/utils/format.ts` | `CHART_COLORS`, `RISK_COLORS`, `clamp`, `trendOf`, `initials`, `formatDate`, `relativeTime`, `daysUntil`, `hash` |
| `src/utils/cn.ts` | `cn(...)` class merger |
| `src/types/index.ts` | every domain interface |
| `src/store/useAppStore.ts` | store API + selectors |
| `src/data/seed.ts` | all demo data |
| `src/i18n/index.ts` + `src/hooks/useT.ts` | optional `const t = useT()` translation helper (English keys complete) |

---

## 3. Page shape

```tsx
import { PageHeader, StatCard, Button /* … */ } from '../../components/ui'

export function SomePage() {
  // hooks from the store
  return (
    <div className="animate-fade-in-up space-y-5 sm:space-y-6">
      <PageHeader title="…" subtitle="…" actions={<Button …/>} />
      {/* content */}
    </div>
  )
}
```

- Export **named** components (never default exports).
- Root wrapper: `className="animate-fade-in-up space-y-5 sm:space-y-6"`.
- The router wraps everything in `AppLayout` (sidebar/header/bottom-nav already exist) — do **not**
  render your own nav or page-level `<main>`.

---

## 4. Store API (`src/store/useAppStore.ts`)

```ts
const user = useAppStore((s) => s.user)            // User | null  { id, name, email, role, password, avatar }
const login = useAppStore((s) => s.login)          // (email, password) => { ok, error? }
const logout = useAppStore((s) => s.logout)
const theme = useAppStore((s) => s.theme)          // 'light' | 'dark'
const setTheme / toggleTheme
const profile = useAppStore((s) => s.profile)      // { name, email, phone, department, year, bio, avatar }
const updateProfile(patch: Partial<Profile>)
const avatarTone / setAvatarTone(tone)

const recommendations = useAppStore((s) => s.recommendations)   // Recommendation[]
const ensureRecommendations(seed: Recommendation[])             // idempotent — call once on mount
const setRecommendationStatus(id, status)                       // 'Not Started' | 'In Progress' | 'Completed'

const learningTasks = useAppStore((s) => s.learningTasks)       // LearningTask[]
const toggleLearningTask(id)
const resetLearningTasks()

const assessments = useAppStore((s) => s.assessments)           // Assessment[]
const quizResults = useAppStore((s) => s.quizResults)           // Record<quizId, QuizResult>
const submitQuizResult(quizId, subject, correct, total) => QuizResult

const notifications = useAppStore((s) => s.notifications)
const pushNotification(n: Omit<NotificationItem, 'id' | 'createdAt' | 'read'>)
const markNotificationRead(id) / markAllRead(role) / deleteNotification(id)

const interventions = useAppStore((s) => s.interventions)       // Intervention[]
const addIntervention(i: Omit<Intervention, 'id' | 'updatedAt'>)
const updateIntervention(id, patch) / setInterventionStatus(id, status) / deleteIntervention(id)
const notes = useAppStore((s) => s.notes)                       // StudentNote[]
const addNote(studentId, author, text) / deleteNote(id)

const institutions = useAppStore((s) => s.institutions)
const addInstitution(i) / updateInstitution(id, patch) / setInstitutionStatus(id, 'Active' | 'Inactive')

const settings = useAppStore((s) => s.settings)                 // { language, theme?, notifications{…}, privacy{…} }
const updateSettings(patch)

const pushToast = useAppStore((s) => s.pushToast)               // ({ title, description?, tone: 'success'|'error'|'info'|'warning' })
```

Selectors exported from the same file: `selectUnread(notifications, role)`,
`selectRoleNotifications(notifications, role)`.
Persistence is automatic (localStorage key `edusense-app-v1`).

---

## 5. Services

```ts
import { getStudentRiskPrediction, FACTOR_LABEL, PREDICTION_API_CONTRACT, riskLevelFor }
  from '../../services/predictionService'

const pred = getStudentRiskPrediction({
  attendance, previous_marks, internal_marks, quiz_scores,
  assignment_completion, learning_activity,   // hours/week
  weakSubject?: string, studentName?: string,
})
// => { risk_level, risk_score (0-100), contributing_factors[4], recommendations[], summary, isMock: true }

import { generateRecommendations, buildRecommendation } from '../../services/recommendationService'
```

`DEMO_STUDENT_ID = 'STU-001'` (Ananya Iyer) is the logged-in demo student.
Use `getDemoStudent()` / `getStudent(id)` from `src/data/seed.ts`.

---

## 6. Seed data available (`src/data/seed.ts`)

`DEMO_ACCOUNTS`, `SUBJECTS`, `SUBJECTS_WITH_RISK`, `getSubject(id)`, `STUDENTS` (24),
`DEMO_STUDENT_ID`, `getDemoStudent()`, `getStudent(id)`, `DEPARTMENTS`, `YEARS`, `SEMESTERS`,
`COURSES`, `TEACHERS` (6), `INSTITUTIONS` (8), `ASSESSMENTS` (14), `QUIZZES` (3 × 5 questions),
`ATTENDANCE_RECORDS` (`{month, overall, bySubject}` × 8), `PERFORMANCE_SERIES`
(`Record<'Weekly'|'Monthly'|'Semester', PerformancePoint[]>`), `RISK_TREND`,
`ATTENDANCE_VS_PERFORMANCE`, `SUBJECT_RISK`, `DEPARTMENT_PERFORMANCE`, `SEMESTER_COMPARISON`,
`DROPOUT_RISK_TREND`, `PLATFORM_SIGNUP_TREND`, `PROGRAMS`, `PLATFORM_USERS`, `INTERVENTIONS`,
`INITIAL_NOTIFICATIONS`, `LEARNING_TASKS`, `LEARNING_RESOURCES`, `PROGRESS_TIMELINE`, `FAQS`.

Risk colour helper: `RISK_COLORS[level]` from `src/utils/format.ts` (and `RiskBadge` in the kit).

---

## 7. Routing (provided by `App.tsx` — do not edit it)

| Role | Prefix | Home |
| --- | --- | --- |
| student | `/student/…` | `/student/dashboard` |
| teacher | `/teacher/…` | `/teacher/dashboard` |
| institution | `/institution/…` | `/institution/dashboard` |
| organization | `/admin/…` | `/admin/dashboard` |

Navigation between pages uses `Link` / `NavLink` / `useNavigate` from `react-router-dom`.
The sidebar comes from `src/layouts/navConfig.ts` — every nav entry must resolve to a real page.

---

## 8. Definition of done

Run this from the repo root and fix every error that points at **your** files:

```
npm.cmd run typecheck
```

(or `npx.cmd tsc --noEmit -p tsconfig.app.json`)

Before you finish, confirm:

- [ ] Every file in your assignment exists, with the exact export name requested.
- [ ] Each page opens with `PageHeader`, has real content above the fold, and no blank areas.
- [ ] All filters/searches/tabs actually filter the data they claim to.
- [ ] All modals open/close, forms validate, submit actions mutate the store and toast.
- [ ] Empty states exist for every list that can become empty (search with no results, etc.).
- [ ] Charts use the shared chart primitives and are wrapped in `ChartCard`.
- [ ] No `any`, no unused imports, no `console.*`, no `TODO`.
- [ ] Typecheck reports zero errors in your folder.
