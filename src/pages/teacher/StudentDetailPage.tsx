import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  Activity,
  ArrowLeft,
  CalendarCheck2,
  ClipboardCheck,
  ClipboardList,
  FileCheck2,
  Mail,
  Plus,
  SearchX,
  Target,
  Trash2,
  TrendingUp,
} from 'lucide-react'
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  ChartCard,
  ConfirmDialog,
  DataTable,
  EmptyState,
  IconButton,
  Input,
  Modal,
  PageHeader,
  Progress,
  ProgressWithLabel,
  RiskBadge,
  Select,
  StatCard,
  Textarea,
  type Column,
} from '../../components/ui'
import { RiskFactorChart } from '../../components/charts/RiskFactorChart'
import { RiskGauge } from '../../components/charts/RiskGauge'
import { MockBadge, PrototypeNote } from '../../components/shared/MockBadge'
import { useAppStore, type StudentNote } from '../../store/useAppStore'
import { getStudentRiskPrediction } from '../../services/predictionService'
import { getStudent, SUBJECTS_WITH_RISK } from '../../data/seed'
import type { Intervention, InterventionStatus, Subject } from '../../types'
import { formatDate, relativeTime } from '../../utils/format'
import {
  INTERVENTION_STATUS_OPTIONS,
  dateInputValue,
  followUpLabel,
  interventionTone,
  isOverdue,
} from './teacherHelpers'

function MetricCell({ value }: { value: number }) {
  return (
    <div className="min-w-[110px]">
      <span className="mb-1 block text-[12px] font-medium tabular-nums text-ink-muted">
        {value}%
      </span>
      <Progress value={value} height="h-1.5" />
    </div>
  )
}

export function StudentDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const user = useAppStore((s) => s.user)
  const notes = useAppStore((s) => s.notes)
  const addNote = useAppStore((s) => s.addNote)
  const deleteNote = useAppStore((s) => s.deleteNote)
  const interventions = useAppStore((s) => s.interventions)
  const addIntervention = useAppStore((s) => s.addIntervention)
  const setInterventionStatus = useAppStore((s) => s.setInterventionStatus)
  const deleteIntervention = useAppStore((s) => s.deleteIntervention)
  const pushToast = useAppStore((s) => s.pushToast)

  const student = getStudent(id ?? '')

  // ---------- note modal state ----------
  const [noteOpen, setNoteOpen] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [noteError, setNoteError] = useState('')
  const [noteToDelete, setNoteToDelete] = useState<StudentNote | null>(null)

  // ---------- intervention modal state ----------
  const [intOpen, setIntOpen] = useState(false)
  const [form, setForm] = useState({
    title: '',
    note: '',
    status: 'Pending' as InterventionStatus,
    followUpDate: dateInputValue(7),
  })
  const [errors, setErrors] = useState<{
    title?: string
    note?: string
    followUpDate?: string
  }>({})
  const [intToDelete, setIntToDelete] = useState<Intervention | null>(null)

  // ---------- subject modal state ----------
  const [subject, setSubject] = useState<Subject | null>(null)

  if (!student) {
    return (
      <div className="animate-fade-in-up space-y-5 sm:space-y-6">
        <PageHeader
          title="Student not found"
          subtitle="That student ID is not part of the demo cohort."
        />
        <EmptyState
          icon={<SearchX className="h-5 w-5" aria-hidden />}
          title="No student matches this link"
          description="The record may have been removed, or the URL is incomplete. Head back to the class list to pick a student."
          action={
            <Button onClick={() => navigate('/teacher/students')}>
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Back to students
            </Button>
          }
        />
      </div>
    )
  }

  const studentNotes = notes.filter((n) => n.studentId === student.id)
  const studentInterventions = interventions.filter((i) => i.studentId === student.id)

  const pred = getStudentRiskPrediction({
    attendance: student.attendance,
    previous_marks: student.previousMarks,
    internal_marks: student.internalMarks,
    quiz_scores: student.quizScore,
    assignment_completion: student.assignmentCompletion,
    learning_activity: student.learningActivity,
    studentName: student.name,
  })

  // ---------- handlers ----------
  const openNote = () => {
    setNoteText('')
    setNoteError('')
    setNoteOpen(true)
  }

  const submitNote = () => {
    const text = noteText.trim()
    if (text.length < 5) {
      setNoteError('A note needs at least 5 characters.')
      return
    }
    addNote(student.id, user?.name ?? 'Teacher', text)
    setNoteOpen(false)
    pushToast({
      title: 'Note added',
      description: `Saved to ${student.name}'s record.`,
      tone: 'success',
    })
  }

  const openIntervention = () => {
    setForm({
      title: '',
      note: '',
      status: 'Pending',
      followUpDate: dateInputValue(7),
    })
    setErrors({})
    setIntOpen(true)
  }

  const submitIntervention = () => {
    const next: { title?: string; note?: string; followUpDate?: string } = {}
    if (form.title.trim().length < 4) next.title = 'Title must be at least 4 characters.'
    if (form.note.trim().length < 1) next.note = 'Describe the plan in one line.'
    if (!form.followUpDate) next.followUpDate = 'Choose a follow-up date.'
    setErrors(next)
    if (next.title || next.note || next.followUpDate) return

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
    setIntOpen(false)
    pushToast({
      title: 'Intervention logged',
      description: `${payload.intervention} · follow-up ${formatDate(payload.followUpDate)}.`,
      tone: 'success',
    })
  }

  const subjectColumns: Column<Subject>[] = [
    {
      key: 'name',
      header: 'Subject',
      sortValue: (s) => s.name,
      render: (s) => (
        <div className="min-w-[170px]">
          <span className="block text-[13.5px] font-semibold text-ink">{s.name}</span>
          <span className="block text-[11.5px] text-ink-subtle">
            {s.code} · {s.teacher}
          </span>
        </div>
      ),
    },
    {
      key: 'attendance',
      header: 'Attendance',
      sortValue: (s) => s.attendance,
      className: 'w-[150px]',
      render: (s) => <MetricCell value={s.attendance} />,
    },
    {
      key: 'marks',
      header: 'Marks',
      sortValue: (s) => s.marks,
      className: 'w-[150px]',
      render: (s) => <MetricCell value={s.marks} />,
    },
    {
      key: 'quiz',
      header: 'Quiz',
      sortValue: (s) => s.quiz,
      className: 'w-[150px]',
      render: (s) => <MetricCell value={s.quiz} />,
    },
    {
      key: 'assignments',
      header: 'Assignments',
      sortValue: (s) => s.assignments,
      className: 'w-[150px]',
      render: (s) => <MetricCell value={s.assignments} />,
    },
    {
      key: 'risk',
      header: 'Risk',
      align: 'right',
      sortValue: (s) => (s.risk === 'High' ? 3 : s.risk === 'Medium' ? 2 : 1),
      render: (s) => <RiskBadge level={s.risk} size="sm" />,
    },
  ]

  return (
    <div className="animate-fade-in-up space-y-5 sm:space-y-6">
      <PageHeader
        title={student.name}
        subtitle={`${student.rollNo} · ${student.department} · ${student.year} · ${student.semester} · ${student.course}`}
        breadcrumb={
          <Link
            to="/teacher/students"
            className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-accent transition-colors hover:text-brand-700"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
            All students
          </Link>
        }
        actions={<MockBadge compact />}
      />

      {/* ---------- identity card ---------- */}
      <Card>
        <CardContent className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <Avatar name={student.name} tone={student.avatar} size="xl" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-[17px] font-bold text-ink">{student.name}</h2>
                <RiskBadge level={student.risk} score={student.riskScore} />
              </div>
              <p className="mt-1.5 text-[13px] text-muted">
                {student.rollNo} · {student.department}
              </p>
              <p className="text-[13px] text-muted">
                {student.year} · {student.semester} · {student.course}
              </p>
              <a
                href={`mailto:${student.email}`}
                className="mt-1.5 inline-flex items-center gap-1.5 text-[13px] text-accent transition-colors hover:text-brand-700"
              >
                <Mail className="h-3.5 w-3.5" aria-hidden />
                {student.email}
              </a>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2">
            <Button variant="outline" onClick={openNote}>
              <Plus className="h-4 w-4" aria-hidden />
              Add note
            </Button>
            <Button onClick={openIntervention}>
              <ClipboardList className="h-4 w-4" aria-hidden />
              Log intervention
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ---------- vitals ---------- */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label="Attendance"
          value={student.attendance}
          unit="%"
          icon={<CalendarCheck2 className="h-4 w-4" aria-hidden />}
          tone={student.attendance < 70 ? 'danger' : 'success'}
        />
        <StatCard
          label="Previous marks"
          value={student.previousMarks}
          unit="%"
          icon={<TrendingUp className="h-4 w-4" aria-hidden />}
          tone="brand"
        />
        <StatCard
          label="Internal marks"
          value={student.internalMarks}
          unit="%"
          icon={<ClipboardCheck className="h-4 w-4" aria-hidden />}
          tone="info"
        />
        <StatCard
          label="Quiz average"
          value={student.quizScore}
          unit="%"
          icon={<Target className="h-4 w-4" aria-hidden />}
          tone="warning"
        />
        <StatCard
          label="Assignments done"
          value={student.assignmentCompletion}
          unit="%"
          icon={<FileCheck2 className="h-4 w-4" aria-hidden />}
          tone="success"
        />
        <StatCard
          label="Learning activity"
          value={student.learningActivity}
          unit="h/wk"
          icon={<Activity className="h-4 w-4" aria-hidden />}
          tone="brand"
        />
      </div>

      {/* ---------- demo prediction ---------- */}
      <div className="grid gap-5 lg:grid-cols-2">
        <ChartCard
          title="Demo risk score"
          description="Computed by the browser-side mock prediction service."
          actions={<MockBadge compact />}
        >
          <div className="flex flex-col items-center gap-3 px-2 py-2">
            <RiskGauge
              score={pred.risk_score}
              level={pred.risk_level}
              sublabel={`Top factor · ${student.topFactor}`}
            />
            <p className="max-w-md text-center text-[13px] leading-relaxed text-muted">
              {pred.summary}
            </p>
          </div>
        </ChartCard>

        <ChartCard
          title="Contributing factors"
          description="Which inputs drove this demo prediction, in order of influence."
          actions={<MockBadge compact />}
        >
          <RiskFactorChart factors={pred.contributing_factors} level={pred.risk_level} />
        </ChartCard>
      </div>

      {/* ---------- subject performance ---------- */}
      <div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-[15px] font-semibold text-ink">Subject-level performance</h2>
            <p className="mt-0.5 text-[13px] text-muted">
              Open a row for the full breakdown — demo risk per subject is derived from the same
              mock service.
            </p>
          </div>
        </div>
        <DataTable
          columns={subjectColumns}
          rows={SUBJECTS_WITH_RISK}
          getRowId={(s) => s.id}
          onRowClick={(s) => setSubject(s)}
          pageSize={Math.max(1, SUBJECTS_WITH_RISK.length)}
          dense
        />
      </div>

      {/* ---------- notes ---------- */}
      <Card>
        <CardHeader
          title="Teacher notes"
          description="Private observations attached to this student's record."
          actions={
            <Button variant="outline" size="sm" onClick={openNote}>
              <Plus className="h-3.5 w-3.5" aria-hidden />
              Add note
            </Button>
          }
        />
        <div className="mt-3">
          {studentNotes.length === 0 ? (
            <div className="px-5 pb-5">
              <EmptyState
                title="No notes yet"
                description="Capture your first observation — attendance conversations, assessment concerns or strengths you noticed in class."
                action={
                  <Button variant="outline" size="sm" onClick={openNote}>
                    <Plus className="h-3.5 w-3.5" aria-hidden />
                    Add note
                  </Button>
                }
              />
            </div>
          ) : (
            <ul className="divide-y divide-line border-t border-line">
              {studentNotes.map((n) => (
                <li key={n.id} className="flex items-start gap-3 px-5 py-4">
                  <Avatar name={n.author} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[13px] font-semibold text-ink">{n.author}</span>
                      <span className="text-[11.5px] text-ink-faint">
                        {relativeTime(n.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1 text-[13px] leading-relaxed text-muted">{n.text}</p>
                  </div>
                  <IconButton
                    label={`Delete note from ${n.author}`}
                    onClick={() => setNoteToDelete(n)}
                    className="hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </IconButton>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>

      {/* ---------- interventions ---------- */}
      <Card>
        <CardHeader
          title="Interventions"
          description="Support plans, status and follow-up dates for this student."
          actions={
            <Button variant="outline" size="sm" onClick={openIntervention}>
              <Plus className="h-3.5 w-3.5" aria-hidden />
              Log intervention
            </Button>
          }
        />
        <div className="mt-3">
          {studentInterventions.length === 0 ? (
            <div className="px-5 pb-5">
              <EmptyState
                title="No interventions logged"
                description="Log a support plan so follow-ups and status changes are tracked against this student."
                action={
                  <Button size="sm" onClick={openIntervention}>
                    <ClipboardList className="h-3.5 w-3.5" aria-hidden />
                    Log intervention
                  </Button>
                }
              />
            </div>
          ) : (
            <ul className="space-y-2.5 border-t border-line px-5 py-4">
              {studentInterventions.map((i) => (
                <li
                  key={i.id}
                  className="rounded-xl border border-line bg-panel-muted/50 px-3.5 py-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[13.5px] font-semibold text-ink">{i.intervention}</p>
                      <p className="mt-0.5 text-[12.5px] leading-relaxed text-muted">{i.note}</p>
                    </div>
                    <Badge tone={interventionTone(i.status)}>{i.status}</Badge>
                  </div>
                  <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11.5px] text-ink-subtle">
                      Follow-up{' '}
                      <span className={isOverdue(i.followUpDate) ? 'font-semibold text-red-600 dark:text-red-400' : 'text-ink-muted'}>
                        {formatDate(i.followUpDate)} · {followUpLabel(i.followUpDate)}
                      </span>
                    </span>
                    <div className="flex items-center gap-2">
                      <Select
                        value={i.status}
                        options={INTERVENTION_STATUS_OPTIONS}
                        aria-label={`Status for ${i.intervention}`}
                        className="h-8 w-36 text-[12.5px]"
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
                      <IconButton
                        label={`Delete ${i.intervention}`}
                        onClick={() => setIntToDelete(i)}
                        className="hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden />
                      </IconButton>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>

      <PrototypeNote />

      {/* ---------- note modal ---------- */}
      <Modal
        open={noteOpen}
        onClose={() => setNoteOpen(false)}
        title="Add note"
        description={`Recorded as ${user?.name ?? 'Teacher'} · visible on ${student.name}'s profile.`}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setNoteOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitNote}>Save note</Button>
          </>
        }
      >
        <Textarea
          id="teacher-note"
          label="Note"
          placeholder="Attendance conversation held on 12 Oct — committed to daily revision…"
          value={noteText}
          onChange={(e) => {
            setNoteText(e.target.value)
            if (noteError) setNoteError('')
          }}
          className={noteError ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : undefined}
        />
        {noteError && <p className="mt-1.5 text-[12px] text-red-600 dark:text-red-400">{noteError}</p>}
      </Modal>

      {/* ---------- intervention modal ---------- */}
      <Modal
        open={intOpen}
        onClose={() => setIntOpen(false)}
        title="Log intervention"
        description={`Create a support plan for ${student.name}.`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setIntOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitIntervention}>Log intervention</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Intervention title"
            placeholder="e.g. Weekly mentor check-in"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            error={errors.title}
          />
          <Textarea
            id="intervention-note"
            label="Note"
            placeholder="What triggered this plan and what happens next?"
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
          />
          {errors.note && (
            <p className="text-[12px] text-red-600 dark:text-red-400">{errors.note}</p>
          )}
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

      {/* ---------- subject modal ---------- */}
      <Modal
        open={subject !== null}
        onClose={() => setSubject(null)}
        title={subject ? subject.name : 'Subject'}
        description={subject ? `${subject.code} · ${subject.teacher}` : undefined}
        footer={
          <Button variant="secondary" onClick={() => setSubject(null)}>
            Close
          </Button>
        }
      >
        {subject && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <ProgressWithLabel value={subject.attendance} label="Attendance" />
              <ProgressWithLabel value={subject.marks} label="Marks" />
              <ProgressWithLabel value={subject.quiz} label="Quiz average" />
              <ProgressWithLabel value={subject.assignments} label="Assignments" />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-line bg-panel-muted px-3.5 py-3">
              <span className="text-[13px] text-ink-muted">Demo risk level for this subject</span>
              <RiskBadge level={subject.risk} />
            </div>
            <MockBadge compact />
          </div>
        )}
      </Modal>

      {/* ---------- confirm dialogs ---------- */}
      <ConfirmDialog
        open={noteToDelete !== null}
        onClose={() => setNoteToDelete(null)}
        onConfirm={() => {
          if (!noteToDelete) return
          deleteNote(noteToDelete.id)
          pushToast({ title: 'Note deleted', tone: 'info' })
        }}
        title="Delete this note?"
        message={`The note by ${noteToDelete?.author ?? ''} will be permanently removed from ${student.name}'s record.`}
        confirmLabel="Delete note"
        tone="danger"
      />

      <ConfirmDialog
        open={intToDelete !== null}
        onClose={() => setIntToDelete(null)}
        onConfirm={() => {
          if (!intToDelete) return
          deleteIntervention(intToDelete.id)
          pushToast({ title: 'Intervention deleted', tone: 'info' })
        }}
        title="Delete this intervention?"
        message={`"${intToDelete?.intervention ?? ''}" and its follow-up schedule will be removed.`}
        confirmLabel="Delete intervention"
        tone="danger"
      />
    </div>
  )
}
