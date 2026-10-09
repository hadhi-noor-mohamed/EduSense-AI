# EduSense AI

**Predict. Understand. Improve.**
An explainable-AI student performance prediction and early-risk detection platform — built as a
college mini-project prototype.

> **Prototype notice:** every prediction in this build comes from a transparent, deterministic
> mock service that runs in the browser. No trained model is loaded and no accuracy is claimed.
> The data contract is intentionally shaped like a future FastAPI + ML backend so the UI can be
> connected to a real model without being rewritten.

---

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check (tsc -b) + production bundle
npm run typecheck  # type-check only
npm run lint       # oxlint
```

> On Windows PowerShell, `npm.ps1` may be blocked by ExecutionPolicy — use `npm.cmd` instead.

### Demo credentials

| Role | Email | Password |
| --- | --- | --- |
| Student | `student@demo.com` | `password123` |
| Teacher | `teacher@demo.com` | `password123` |
| Institution | `college@demo.com` | `password123` |
| Organization / Admin | `admin@demo.com` | `password123` |

Authentication is mocked and the session is persisted in `localStorage`
(key `edusense-app-v1`) alongside theme, notifications, recommendations, learning progress,
quiz results, interventions and settings.

---

## What is inside

**Public**
`/` landing page (hero, stats, problem, how-it-works, explainable AI, features, audiences,
action plan, product preview, responsible AI, FAQ, CTA) · `/roles` role selection ·
`/login/{student,teacher,institution,organization}` · `/forgot-password`

**Student** — dashboard with 5 stat cards + AI risk card, performance (Weekly/Monthly/Semester),
"Why this prediction?" explainability page, personalised action plan with Start/Complete,
learning plan with persisted progress, assessments with a full interactive quiz flow,
attendance dashboard with 75% warnings, progress timeline, printable report, editable profile,
notification center, settings.

**Teacher** — cohort dashboard, searchable/filterable/sortable student risk table, student
detail with notes + interventions + follow-up, risk monitor with early warnings, analytics,
intervention CRUD, assessments, reports, notifications, settings.

**Institution** — dashboard with Department/Year/Semester/Course filters, analytics,
student list, department detail modals, reports, notifications, settings.

**Organization (admin)** — platform dashboard, institution CRUD, users, programs, analytics,
reports, notification center, settings.

---

## Architecture

```
src/
├─ components/
│  ├─ ui/          hand-rolled accessible component kit (Button, Card, DataTable, Modal,
│  │               Tabs, Input, Badge, StatCard, ChartCard, States, Toaster, ThemeToggle…)
│  ├─ charts/      Recharts wrappers — TrendChart, CategoryBar, DonutChart, RiskScatter,
│  │               RiskGauge, RiskFactorChart
│  ├─ shared/      MockBadge, SearchPalette (⌘K), NotificationBell, NotificationsView,
│  │               SettingsView, ReportView, FilterBar, Brand
│  └─ RequireAuth  route guard
├─ layouts/        AppLayout (sidebar → drawer → bottom nav), PublicLayout, AuthLayout, navConfig
├─ pages/          one folder per role + landing/auth pages
├─ services/
│  ├─ predictionService.ts        getStudentRiskPrediction() — the mock ML engine
│  ├─ recommendationService.ts    rule-based recommendation generator
│  └─ searchService.ts            global search index
├─ store/useAppStore.ts           single persisted Zustand store
├─ data/seed.ts                   demo dataset (24 students, 6 subjects, 14 assessments…)
├─ i18n/ + hooks/useT.ts          English / Tamil translation layer
└─ types/index.ts                 domain types
```

### The prediction contract

```ts
getStudentRiskPrediction({
  attendance, previous_marks, internal_marks,
  quiz_scores, assignment_completion, learning_activity,
})
// → { risk_level, risk_score, contributing_factors[], recommendations[], summary, isMock }
```

Inputs are compared against healthy benchmarks (85 / 75 / 75 / 75 / 90 / 8h per week), weighted
by importance, and converted to a 0–100 score with a saturation curve. The four strongest signals
are renormalised into a contribution breakdown — the same shape a SHAP feature-importance
response would return.

Risk bands: **High** ≥ 65 · **Medium** ≥ 40 · **Low** < 40.

### Swapping in a real backend

`src/services/predictionService.ts` documents the future endpoint:

```
POST /api/predict
body : { attendance, previous_marks, internal_marks, quiz_scores,
         assignment_completion, learning_activity }
resp : { risk_level, risk_score, contributing_factors, recommendations }
```

Replace the function body with a `fetch` and every screen keeps working unchanged.

---

## Design system

- **Tailwind CSS** with semantic tokens (`bg-panel`, `border-line`, `text-ink`, `text-muted`,
  `text-accent`, `bg-base`…) mapped to CSS variables — light and dark mode are automatic and
  persisted via a `dark` class on `<html>`.
- **Inter** typography, indigo/violet primary, minimal gradients, subtle `fade-in-up` motion.
- **Responsive**: desktop sidebar (collapsible) → tablet collapse → mobile drawer + bottom nav.
- **Accessible**: labelled controls, focus-visible rings, keyboard-operable modals/tables,
  `aria-*` on switches, tabs and dialogs.
- **Print CSS**: report pages hide the app chrome and print full-bleed (`src/index.css`).

---

## Notes for the evaluator

- Charts, risk scores and analytics are **demo values**. Nothing here should be used for real
  academic decisions.
- All data is seeded and deterministic — reloading the page keeps your progress (localStorage),
  and clearing site data resets the demo.
- Language settings (English / Tamil) are wired end-to-end; English is complete and Tamil
  covers the settings surface as a structure demonstration.
