import { useMemo, useState } from 'react'
import { Ban, Eye, Pencil, Play, Plus, RotateCcw, Search } from 'lucide-react'
import {
  Button,
  ConfirmDialog,
  DataTable,
  type Column,
  IconButton,
  Input,
  Modal,
  NoResults,
  PageHeader,
  Progress,
  Select,
  StatCard,
} from '../../components/ui'
import { CategoryBar } from '../../components/charts/ChartPrimitives'
import { MockBadge } from '../../components/shared/MockBadge'
import { useAppStore } from '../../store/useAppStore'
import type { Institution } from '../../types'
import { CHART_COLORS, formatDate } from '../../utils/format'
import { abbrName, formatNum, PlanBadge, StatGrid, StatusCell } from './components/AdminShared'

interface FormState {
  name: string
  code: string
  city: string
  students: string
  departments: string
  plan: Institution['plan']
  status: Institution['status']
  performance: string
}

type FormErrors = Partial<Record<keyof FormState, string>>

const EMPTY_FORM: FormState = {
  name: '',
  code: '',
  city: '',
  students: '',
  departments: '',
  plan: 'Starter',
  status: 'Active',
  performance: '',
}

const PLAN_OPTIONS = [
  { value: 'Starter', label: 'Starter' },
  { value: 'Growth', label: 'Growth' },
  { value: 'Enterprise', label: 'Enterprise' },
]

const STATUS_OPTIONS = [
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
]

function validateForm(form: FormState): FormErrors {
  const errs: FormErrors = {}

  if (form.name.trim().length < 3) {
    errs.name = 'Enter a name of at least 3 characters.'
  }

  const code = form.code.trim()
  if (!code) {
    errs.code = 'Code is required.'
  } else if (!/^[A-Za-z]{2,4}-\d{2,4}$/.test(code)) {
    errs.code = 'Use a short code such as SRM-001.'
  }

  if (!form.city.trim()) {
    errs.city = 'City is required.'
  }

  const students = Number(form.students)
  if (form.students.trim() === '' || Number.isNaN(students)) {
    errs.students = 'Enter a number.'
  } else if (students < 0) {
    errs.students = 'Cannot be negative.'
  }

  const departments = Number(form.departments)
  if (form.departments.trim() === '' || Number.isNaN(departments)) {
    errs.departments = 'Enter a number.'
  } else if (departments < 1) {
    errs.departments = 'At least one department.'
  }

  const performance = Number(form.performance)
  if (form.performance.trim() === '' || Number.isNaN(performance)) {
    errs.performance = 'Enter a number.'
  } else if (performance < 0 || performance > 100) {
    errs.performance = 'Must be between 0 and 100.'
  }

  return errs
}

export function InstitutionsPage() {
  const institutions = useAppStore((s) => s.institutions)
  const addInstitution = useAppStore((s) => s.addInstitution)
  const updateInstitution = useAppStore((s) => s.updateInstitution)
  const setInstitutionStatus = useAppStore((s) => s.setInstitutionStatus)
  const pushToast = useAppStore((s) => s.pushToast)

  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [planFilter, setPlanFilter] = useState('')

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Institution | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [errors, setErrors] = useState<FormErrors>({})

  const [viewInst, setViewInst] = useState<Institution | null>(null)
  const [statusTarget, setStatusTarget] = useState<Institution | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return institutions.filter(
      (i) =>
        (!q ||
          i.name.toLowerCase().includes(q) ||
          i.city.toLowerCase().includes(q)) &&
        (!statusFilter || i.status === statusFilter) &&
        (!planFilter || i.plan === planFilter),
    )
  }, [institutions, query, statusFilter, planFilter])

  const totalStudents = useMemo(
    () => institutions.reduce((sum, i) => sum + i.students, 0),
    [institutions],
  )
  const activeCount = useMemo(
    () => institutions.filter((i) => i.status === 'Active').length,
    [institutions],
  )
  const inactiveCount = institutions.length - activeCount
  const platformAvg = useMemo(() => {
    if (institutions.length === 0) return 0
    return Math.round(
      institutions.reduce((sum, i) => sum + i.performance, 0) / institutions.length,
    )
  }, [institutions])

  const clearFilters = () => {
    setQuery('')
    setStatusFilter('')
    setPlanFilter('')
  }

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => {
      if (!e[key]) return e
      const next = { ...e }
      delete next[key]
      return next
    })
  }

  const openAdd = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setErrors({})
    setFormOpen(true)
  }

  const openEdit = (inst: Institution) => {
    setEditing(inst)
    setForm({
      name: inst.name,
      code: inst.code,
      city: inst.city,
      students: String(inst.students),
      departments: String(inst.departments),
      plan: inst.plan,
      status: inst.status,
      performance: String(inst.performance),
    })
    setErrors({})
    setFormOpen(true)
  }

  const submitForm = () => {
    const errs = validateForm(form)
    setErrors(errs)
    if (Object.keys(errs).length > 0) {
      pushToast({
        title: 'Check the highlighted fields',
        description: 'The institution form still has validation errors.',
        tone: 'error',
      })
      return
    }

    const payload = {
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
      city: form.city.trim(),
      students: Number(form.students),
      departments: Number(form.departments),
      plan: form.plan,
      status: form.status,
      performance: Math.round(Number(form.performance)),
    }

    if (editing) {
      updateInstitution(editing.id, payload)
      pushToast({
        title: 'Institution updated',
        description: `${payload.name} was saved successfully.`,
        tone: 'success',
      })
    } else {
      addInstitution({ ...payload, joined: new Date().toISOString() })
      pushToast({
        title: 'Institution added',
        description: `${payload.name} joined the platform.`,
        tone: 'success',
      })
    }
    setFormOpen(false)
  }

  const toggleStatus = () => {
    if (!statusTarget) return
    const next: Institution['status'] = statusTarget.status === 'Active' ? 'Inactive' : 'Active'
    setInstitutionStatus(statusTarget.id, next)
    pushToast({
      title: 'Status updated',
      description: `${statusTarget.name} is now ${next}.`,
      tone: next === 'Active' ? 'success' : 'warning',
    })
  }

  const columns: Column<Institution>[] = [
    {
      key: 'name',
      header: 'Institution',
      sortValue: (i) => i.name,
      render: (i) => (
        <div className="min-w-[180px]">
          <p className="text-[13.5px] font-semibold text-ink">{i.name}</p>
          <p className="text-[11.5px] text-ink-faint">{i.code}</p>
        </div>
      ),
    },
    { key: 'city', header: 'City', sortValue: (i) => i.city },
    {
      key: 'students',
      header: 'Students',
      align: 'right',
      sortValue: (i) => i.students,
      render: (i) => <span className="tabular-nums text-ink">{formatNum(i.students)}</span>,
    },
    {
      key: 'departments',
      header: 'Depts',
      align: 'right',
      sortValue: (i) => i.departments,
      render: (i) => <span className="tabular-nums">{i.departments}</span>,
    },
    {
      key: 'plan',
      header: 'Plan',
      sortValue: (i) => i.plan,
      render: (i) => <PlanBadge plan={i.plan} />,
    },
    {
      key: 'status',
      header: 'Status',
      sortValue: (i) => i.status,
      render: (i) => <StatusCell status={i.status} />,
    },
    {
      key: 'joined',
      header: 'Joined',
      sortValue: (i) => i.joined,
      render: (i) => <span className="text-[13px]">{formatDate(i.joined)}</span>,
    },
    {
      key: 'performance',
      header: 'Performance',
      sortValue: (i) => i.performance,
      render: (i) => (
        <div className="flex min-w-[120px] items-center gap-2">
          <Progress value={i.performance} className="flex-1" />
          <span className="w-9 text-right text-[12px] tabular-nums text-ink-muted">
            {i.performance}%
          </span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (i) => (
        <div className="flex items-center justify-end gap-1">
          <IconButton label={`View ${i.name}`} onClick={() => setViewInst(i)}>
            <Eye className="h-4 w-4" aria-hidden />
          </IconButton>
          <IconButton label={`Edit ${i.name}`} onClick={() => openEdit(i)}>
            <Pencil className="h-4 w-4" aria-hidden />
          </IconButton>
          <IconButton
            label={`${i.status === 'Active' ? 'Deactivate' : 'Activate'} ${i.name}`}
            className={
              i.status === 'Active'
                ? 'hover:text-red-500'
                : 'hover:text-emerald-600 dark:hover:text-emerald-400'
            }
            onClick={() => setStatusTarget(i)}
          >
            {i.status === 'Active' ? (
              <Ban className="h-4 w-4" aria-hidden />
            ) : (
              <Play className="h-4 w-4" aria-hidden />
            )}
          </IconButton>
        </div>
      ),
    },
  ]

  const emptyTerm = query.trim() || statusFilter || planFilter || undefined

  return (
    <div className="animate-fade-in-up space-y-5 sm:space-y-6">
      <PageHeader
        title="Institutions"
        subtitle="Onboard tenants, manage plans and keep every institution record current."
        actions={
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4" aria-hidden />
            Add institution
          </Button>
        }
      />

      <StatGrid>
        <StatCard label="Institutions" value={institutions.length} hint="total tenants on the platform" />
        <StatCard
          label="Active"
          value={activeCount}
          tone="success"
          hint="tenants currently onboarded"
        />
        <StatCard
          label="Inactive"
          value={inactiveCount}
          tone="danger"
          hint="tenants pending reactivation"
        />
        <StatCard
          label="Total students"
          value={formatNum(totalStudents)}
          tone="info"
          hint="enrolled across all tenants"
        />
      </StatGrid>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Input
          label="Search"
          placeholder="Institution name or city"
          leftIcon={<Search className="h-4 w-4" aria-hidden />}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Select
          label="Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={STATUS_OPTIONS}
          placeholder="All statuses"
        />
        <Select
          label="Plan"
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
          options={PLAN_OPTIONS}
          placeholder="All plans"
        />
        <div className="flex items-end">
          <Button variant="outline" className="h-10" onClick={clearFilters}>
            <RotateCcw className="h-4 w-4" aria-hidden />
            Clear filters
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <NoResults term={emptyTerm} onClear={clearFilters} />
      ) : (
        <DataTable<Institution>
          columns={columns}
          rows={filtered}
          getRowId={(i) => i.id}
          pageSize={8}
        />
      )}

      {/* ---------- add / edit form ---------- */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? 'Edit institution' : 'Add institution'}
        description={
          editing
            ? 'Update the tenant record — changes are saved to the demo store.'
            : 'Register a new tenant on the EduSense AI platform.'
        }
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitForm}>
              {editing ? 'Save changes' : 'Add institution'}
            </Button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Institution name"
            placeholder="e.g. SRM Institute of Technology"
            value={form.name}
            onChange={(e) => setField('name', e.target.value)}
            error={errors.name}
            hint="Minimum 3 characters."
          />
          <Input
            label="Code"
            placeholder="e.g. SRM-001"
            value={form.code}
            onChange={(e) => setField('code', e.target.value)}
            error={errors.code}
            hint="2–4 letters, a dash, then digits."
          />
          <Input
            label="City"
            placeholder="e.g. Chennai"
            value={form.city}
            onChange={(e) => setField('city', e.target.value)}
            error={errors.city}
          />
          <Input
            label="Students"
            type="number"
            min={0}
            placeholder="e.g. 2500"
            value={form.students}
            onChange={(e) => setField('students', e.target.value)}
            error={errors.students}
          />
          <Input
            label="Departments"
            type="number"
            min={1}
            placeholder="e.g. 8"
            value={form.departments}
            onChange={(e) => setField('departments', e.target.value)}
            error={errors.departments}
          />
          <Input
            label="Performance (0–100)"
            type="number"
            min={0}
            max={100}
            placeholder="e.g. 72"
            value={form.performance}
            onChange={(e) => setField('performance', e.target.value)}
            error={errors.performance}
          />
          <Select
            label="Plan"
            options={PLAN_OPTIONS}
            value={form.plan}
            onChange={(e) => setField('plan', e.target.value as Institution['plan'])}
          />
          <Select
            label="Status"
            options={STATUS_OPTIONS}
            value={form.status}
            onChange={(e) => setField('status', e.target.value as Institution['status'])}
          />
        </div>
      </Modal>

      {/* ---------- detail view ---------- */}
      <Modal
        open={viewInst !== null}
        onClose={() => setViewInst(null)}
        title={viewInst?.name ?? 'Institution'}
        description={viewInst ? `${viewInst.code} · ${viewInst.city}` : undefined}
        size="lg"
        footer={
          <Button variant="outline" onClick={() => setViewInst(null)}>
            Close
          </Button>
        }
      >
        {viewInst && (
          <div className="space-y-5">
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[
                { label: 'Code', value: viewInst.code },
                { label: 'City', value: viewInst.city },
                { label: 'Joined', value: formatDate(viewInst.joined) },
                { label: 'Plan', value: viewInst.plan },
                { label: 'Status', value: viewInst.status },
                { label: 'Students', value: formatNum(viewInst.students) },
                { label: 'Departments', value: String(viewInst.departments) },
              ].map((f) => (
                <div
                  key={f.label}
                  className="rounded-xl border border-line bg-panel-muted px-3.5 py-2.5"
                >
                  <dt className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-subtle">
                    {f.label}
                  </dt>
                  <dd className="mt-1 break-words text-[13.5px] font-medium text-ink">{f.value}</dd>
                </div>
              ))}
            </dl>

            <div>
              <div className="mb-2 flex items-center justify-between text-[13px]">
                <span className="text-muted">Composite performance</span>
                <span className="font-semibold text-ink">{viewInst.performance}%</span>
              </div>
              <Progress value={viewInst.performance} />
            </div>

            <div>
              <p className="mb-1 text-[13px] font-medium text-ink">Against platform average</p>
              <CategoryBar
                horizontal
                height={140}
                data={[
                  { name: abbrName(viewInst.name, 12), performance: viewInst.performance },
                  { name: 'Platform avg', performance: platformAvg },
                ]}
                xKey="name"
                bars={[{ key: 'performance', name: 'Performance', color: CHART_COLORS.primary }]}
              />
            </div>

            <MockBadge compact />
          </div>
        )}
      </Modal>

      {/* ---------- status confirmation ---------- */}
      <ConfirmDialog
        open={statusTarget !== null}
        onClose={() => setStatusTarget(null)}
        onConfirm={toggleStatus}
        title={statusTarget?.status === 'Active' ? 'Deactivate institution?' : 'Activate institution?'}
        message={
          statusTarget?.status === 'Active'
            ? `${statusTarget.name} will be marked Inactive. Existing records stay intact, but the tenant is flagged for review.`
            : `${statusTarget?.name ?? 'This institution'} will be marked Active and counted as an onboarded tenant again.`
        }
        confirmLabel={statusTarget?.status === 'Active' ? 'Deactivate' : 'Activate'}
        tone={statusTarget?.status === 'Active' ? 'danger' : 'primary'}
      />
    </div>
  )
}
