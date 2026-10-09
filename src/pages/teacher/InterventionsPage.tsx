import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  CheckCircle2,
  ClipboardList,
  Clock,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react'
import {
  Avatar,
  Badge,
  Button,
  ConfirmDialog,
  DataTable,
  IconButton,
  Input,
  Modal,
  NoResults,
  PageHeader,
  RiskBadge,
  Select,
  StatCard,
  Textarea,
  type Column,
} from '../../components/ui'
import { MockBadge } from '../../components/shared/MockBadge'
import { useAppStore } from '../../store/useAppStore'
import { STUDENTS, getStudent } from '../../data/seed'
import type { Intervention, InterventionStatus } from '../../types'
import { formatDate, relativeTime } from '../../utils/format'
import {
  INTERVENTION_STATUS_OPTIONS,
  RISK_FILTER_OPTIONS,
  dateInputValue,
  followUpLabel,
  interventionTone,
  isOverdue,
} from './teacherHelpers'

interface FormState {
  studentId: string
  title: string
  note: string
  status: InterventionStatus
  followUpDate: string
}

interface FormErrors {
  studentId?: string
  title?: string
  note?: string
  followUpDate?: string
}

const STUDENT_OPTIONS = STUDENTS.map((s) => ({
  value: s.id,
  label: `${s.name} · ${s.rollNo}`,
}))

const EMPTY_FORM: FormState = {
  studentId: '',
  title: '',
  note: '',
  status: 'Pending',
  followUpDate: '',
}

export function InterventionsPage() {
  const interventions = useAppStore((s) => s.interventions)
  const addIntervention = useAppStore((s) => s.addIntervention)
  const updateIntervention = useAppStore((s) => s.updateIntervention)
  const setInterventionStatus = useAppStore((s) => s.setInterventionStatus)
  const deleteIntervention = useAppStore((s) => s.deleteIntervention)
  const pushToast = useAppStore((s) => s.pushToast)

  // ---------- filters ----------
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [riskFilter, setRiskFilter] = useState('')

  // ---------- form modal ----------
  const [formOpen, setFormOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>({ ...EMPTY_FORM, followUpDate: dateInputValue(7) })
  const [errors, setErrors] = useState<FormErrors>({})

  // ---------- delete ----------
  const [deleteTarget, setDeleteTarget] = useState<Intervention | null>(null)

  const counts = {
    total: interventions.length,
    pending: interventions.filter((i) => i.status === 'Pending').length,
    inProgress: interventions.filter((i) => i.status === 'In Progress').length,
    completed: interventions.filter((i) => i.status === 'Completed').length,
  }

  const filtered = interventions.filter((i) => {
    const q = query.trim().toLowerCase()
    if (q && !i.studentName.toLowerCase().includes(q)) return false
    if (statusFilter && i.status !== statusFilter) return false
    if (riskFilter && i.risk !== riskFilter) return false
    return true
  })

  const anyActive = Boolean(query || statusFilter || riskFilter)
  const clearAll = () => {
    setQuery('')
    setStatusFilter('')
    setRiskFilter('')
  }

  const openNew = () => {
    setEditId(null)
    setForm({ ...EMPTY_FORM, followUpDate: dateInputValue(7) })
    setErrors({})
    setFormOpen(true)
  }

  const openEdit = (i: Intervention) => {
    setEditId(i.id)
    setForm({
      studentId: i.studentId,
      title: i.intervention,
      note: i.note,
      status: i.status,
      followUpDate: i.followUpDate.slice(0, 10),
    })
    setErrors({})
    setFormOpen(true)
  }

  const submit = () => {
    const next: FormErrors = {}
    if (!form.studentId) next.studentId = 'Select a student.'
    if (form.title.trim().length < 4) next.title = 'Title must be at least 4 characters.'
    if (form.note.trim().length < 10) next.note = 'Note must be at least 10 characters.'
    if (!form.followUpDate) next.followUpDate = 'Choose a follow-up date.'
    setErrors(next)
    if (next.studentId || next.title || next.note || next.followUpDate) return

    const student = getStudent(form.studentId)
    if (!student) {
      setErrors({ studentId: 'That student is not in the demo cohort.' })
      return
    }

    if (editId) {
      updateIntervention(editId, {
        studentId: student.id,
        studentName: student.name,
        risk: student.risk,
        intervention: form.title.trim(),
        note: form.note.trim(),
        status: form.status,
        followUpDate: form.followUpDate,
      })
      pushToast({
        title: 'Intervention updated',
        description: `${form.title.trim()} · ${student.name}`,
        tone: 'success',
      })
    } else {
      const payload = {
        studentId: student.id,
        studentName: student.name,
        risk: student.risk,
        intervention: form.title.trim(),
        note: form.note.trim(),
        status: form.status,
        followUpDate: form.followUpDate,
        updatedAt: new Date().toISOString(),
      }
      addIntervention(payload)
      pushToast({
        title: 'Intervention created',
        description: `${payload.intervention} · follow-up ${formatDate(payload.followUpDate)}`,
        tone: 'success',
      })
    }
    setFormOpen(false)
  }

  const columns: Column<Intervention>[] = [
    {
      key: 'student',
      header: 'Student',
      sortValue: (i) => i.studentName,
      render: (i) => (
        <Link
          to={`/teacher/students/${i.studentId}`}
          className="flex w-max max-w-[200px] items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <Avatar name={i.studentName} size="sm" />
          <span className="min-w-0">
            <span className="block truncate text-[13.5px] font-semibold text-ink">
              {i.studentName}
            </span>
            <span className="block text-[11.5px] text-ink-subtle">
              {getStudent(i.studentId)?.rollNo ?? 'Demo cohort'}
            </span>
          </span>
        </Link>
      ),
    },
    {
      key: 'risk',
      header: 'Risk',
      sortValue: (i) => (i.risk === 'High' ? 3 : i.risk === 'Medium' ? 2 : 1),
      render: (i) => <RiskBadge level={i.risk} size="sm" />,
    },
    {
      key: 'intervention',
      header: 'Intervention',
      sortValue: (i) => i.intervention,
      render: (i) => (
        <div className="min-w-[200px]">
          <span className="block text-[13.5px] font-semibold text-ink">{i.intervention}</span>
          <p className="mt-0.5 max-w-[260px] truncate text-[12px] text-ink-subtle">{i.note}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortValue: (i) => i.status,
      render: (i) => <Badge tone={interventionTone(i.status)}>{i.status}</Badge>,
    },
    {
      key: 'followUpDate',
      header: 'Follow-up',
      sortValue: (i) => i.followUpDate,
      render: (i) => (
        <div className="min-w-[130px]">
          <span className="block text-[13px] text-ink-muted">{formatDate(i.followUpDate)}</span>
          <span
            className={
              isOverdue(i.followUpDate)
                ? 'block text-[11.5px] font-semibold text-red-600 dark:text-red-400'
                : 'block text-[11.5px] text-ink-faint'
            }
          >
            {followUpLabel(i.followUpDate)}
          </span>
        </div>
      ),
    },
    {
      key: 'updatedAt',
      header: 'Updated',
      sortValue: (i) => i.updatedAt,
      render: (i) => <span className="text-[12.5px] text-ink-subtle">{relativeTime(i.updatedAt)}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (i) => (
        <div className="flex items-center justify-end gap-2">
          <Select
            value={i.status}
            options={INTERVENTION_STATUS_OPTIONS}
            aria-label={`Change status for ${i.intervention}`}
            className="h-8 w-32 text-[12.5px]"
            onChange={(e) => {
              const next = e.target.value as InterventionStatus
              setInterventionStatus(i.id, next)
              pushToast({
                title: 'Status updated',
                description: `${i.intervention} is now ${next}.`,
                tone: 'success',
              })
            }}
          />
          <IconButton label={`Edit ${i.intervention}`} onClick={() => openEdit(i)}>
            <Pencil className="h-4 w-4" aria-hidden />
          </IconButton>
          <IconButton
            label={`Delete ${i.intervention}`}
            onClick={() => setDeleteTarget(i)}
            className="hover:text-red-500"
          >
            <Trash2 className="h-4 w-4" aria-hidden />
          </IconButton>
        </div>
      ),
    },
  ]

  return (
    <div className="animate-fade-in-up space-y-5 sm:space-y-6">
      <PageHeader
        title="Interventions"
        subtitle="Create, track and close support plans. Status changes, edits and deletions are saved to the app store instantly."
        actions={
          <>
            <MockBadge compact />
            <Button onClick={openNew}>
              <Plus className="h-4 w-4" aria-hidden />
              New intervention
            </Button>
          </>
        }
      />

      {/* ---------- stats ---------- */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total"
          value={counts.total}
          icon={<ClipboardList className="h-4 w-4" aria-hidden />}
          tone="brand"
          hint="logged support plans"
        />
        <StatCard
          label="Pending"
          value={counts.pending}
          icon={<Clock className="h-4 w-4" aria-hidden />}
          tone="warning"
          hint="not started yet"
        />
        <StatCard
          label="In progress"
          value={counts.inProgress}
          icon={<Activity className="h-4 w-4" aria-hidden />}
          tone="info"
          hint="currently running"
        />
        <StatCard
          label="Completed"
          value={counts.completed}
          icon={<CheckCircle2 className="h-4 w-4" aria-hidden />}
          tone="success"
          hint="closed out"
        />
      </div>

      {/* ---------- filters ---------- */}
      <div className="flex flex-col gap-3 rounded-2xl border border-line bg-panel p-4 shadow-card sm:flex-row sm:items-end">
        <div className="grid flex-1 gap-3 sm:grid-cols-3">
          <Input
            label="Search by student"
            placeholder="Student name"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            leftIcon={<Search className="h-4 w-4" aria-hidden />}
          />
          <Select
            label="Status"
            placeholder="All statuses"
            options={INTERVENTION_STATUS_OPTIONS}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
          <Select
            label="Risk"
            placeholder="All risk levels"
            options={RISK_FILTER_OPTIONS}
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 sm:pb-0.5">
          <span className="text-[12.5px] tabular-nums text-ink-subtle">
            {filtered.length} of {interventions.length}
          </span>
          <Button variant="outline" size="sm" onClick={clearAll} disabled={!anyActive}>
            Clear filters
          </Button>
        </div>
      </div>

      {/* ---------- table ---------- */}
      {filtered.length === 0 ? (
        <NoResults term={query.trim() || undefined} onClear={clearAll} />
      ) : (
        <DataTable
          columns={columns}
          rows={filtered}
          getRowId={(i) => i.id}
          pageSize={Math.max(1, filtered.length)}
          dense
        />
      )}

      {/* ---------- create / edit modal ---------- */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editId ? 'Edit intervention' : 'New intervention'}
        description={
          editId
            ? 'Update the plan, owner-facing note, status or follow-up date.'
            : 'Create a support plan for a student in the demo cohort.'
        }
        footer={
          <>
            <Button variant="ghost" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submit}>{editId ? 'Save changes' : 'Create intervention'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select
            label="Student"
            placeholder="Select a student"
            options={STUDENT_OPTIONS}
            value={form.studentId}
            onChange={(e) => {
              setForm({ ...form, studentId: e.target.value })
              if (errors.studentId) setErrors({ ...errors, studentId: undefined })
            }}
            {...(errors.studentId
              ? { className: 'border-red-400 focus:border-red-500 focus:ring-red-500/20' }
              : {})}
          />
          {errors.studentId && (
            <p className="-mt-2 text-[12px] text-red-600 dark:text-red-400">
              {errors.studentId}
            </p>
          )}

          <Input
            label="Title"
            placeholder="e.g. Weekly mentor check-in"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            error={errors.title}
          />

          <div>
            <Textarea
              id="intervention-note-field"
              label="Note"
              placeholder="What triggered the plan, who is involved and what happens next (min 10 characters)."
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
            />
            {errors.note && (
              <p className="mt-1.5 text-[12px] text-red-600 dark:text-red-400">{errors.note}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Status"
              options={INTERVENTION_STATUS_OPTIONS}
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value as InterventionStatus })
              }
            />
            <Input
              label="Follow-up date"
              type="date"
              value={form.followUpDate}
              onChange={(e) => setForm({ ...form, followUpDate: e.target.value })}
              error={errors.followUpDate}
            />
          </div>
        </div>
      </Modal>

      {/* ---------- delete confirm ---------- */}
      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (!deleteTarget) return
          deleteIntervention(deleteTarget.id)
          pushToast({
            title: 'Intervention deleted',
            description: deleteTarget.intervention,
            tone: 'info',
          })
        }}
        title="Delete this intervention?"
        message={`"${deleteTarget?.intervention ?? ''}" for ${deleteTarget?.studentName ?? ''} will be removed permanently.`}
        confirmLabel="Delete intervention"
        tone="danger"
      />
    </div>
  )
}
