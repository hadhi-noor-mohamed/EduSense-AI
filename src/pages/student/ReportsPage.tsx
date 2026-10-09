import { useNavigate } from 'react-router-dom'
import { ReportView, type ReportBlock } from '../../components/shared/ReportView'
import { MockBadge } from '../../components/shared/MockBadge'
import { Button } from '../../components/ui'
import { ASSESSMENTS, ATTENDANCE_RECORDS, SUBJECTS_WITH_RISK } from '../../data/seed'
import { useAppStore } from '../../store/useAppStore'
import { formatDate } from '../../utils/format'
import { DEMO_PREDICTION, DEMO_STUDENT, dueLabel, weakestSubject } from './studentData'

export function ReportsPage() {
  const navigate = useNavigate()
  const recommendations = useAppStore((s) => s.recommendations)
  const learningTasks = useAppStore((s) => s.learningTasks)

  const student = DEMO_STUDENT
  const pred = DEMO_PREDICTION
  const attendance = ATTENDANCE_RECORDS[ATTENDANCE_RECORDS.length - 1]?.overall ?? student.attendance
  const monthsBelow = ATTENDANCE_RECORDS.filter((r) => r.overall < 75).length
  const weakest = weakestSubject()

  const recDone = recommendations.filter((r) => r.status === 'Completed').length
  const tasksDone = learningTasks.filter((t) => t.done).length
  const openAssessments = ASSESSMENTS.filter((a) => a.status !== 'Completed').sort(
    (a, b) => a.dueDate.localeCompare(b.dueDate),
  )
  const overdue = openAssessments.filter((a) => a.status === 'Overdue')

  const meta = [
    { label: 'Student', value: student.name },
    { label: 'Roll number', value: student.rollNo },
    { label: 'Risk level (demo)', value: `${pred.risk_level} · ${pred.risk_score}/100` },
    { label: 'Attendance', value: `${attendance}%` },
    { label: 'Overall performance', value: `${student.overallPerformance}%` },
    { label: 'Generated', value: formatDate(new Date().toISOString()) },
  ]

  const blocks: ReportBlock[] = [
    {
      title: 'Risk snapshot (demo prediction)',
      content: (
        <div className="space-y-2">
          <p>
            The prototype risk model scores {student.name} at{' '}
            <strong>{pred.risk_score}/100 — {pred.risk_level} risk</strong>. The three strongest
            contributors to this score are:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            {pred.contributing_factors.slice(0, 3).map((f) => (
              <li key={f.name}>
                {f.name} — {f.contribution}% of the score ({f.raw.value} vs benchmark {f.raw.benchmark})
              </li>
            ))}
          </ul>
          <p>{pred.summary}</p>
          <p>
            <MockBadge compact /> — this score comes from a transparent, rule-based mock service
            running in the browser, not a trained model.
          </p>
        </div>
      ),
    },
    {
      title: 'Attendance & performance',
      content: (
        <div className="space-y-2">
          <p>
            Semester attendance stands at {attendance}% across {ATTENDANCE_RECORDS.length} tracked
            months, with {monthsBelow} month{monthsBelow === 1 ? '' : 's'} below the 75% required
            threshold. Overall weighted performance is {student.overallPerformance}%.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[540px] border-collapse text-left text-[13px]">
              <thead>
                <tr className="border-b border-line">
                  <th className="py-1.5 pr-3 font-semibold text-ink">Subject</th>
                  <th className="py-1.5 pr-3 font-semibold text-ink">Attendance</th>
                  <th className="py-1.5 pr-3 font-semibold text-ink">Marks</th>
                  <th className="py-1.5 pr-3 font-semibold text-ink">Quiz</th>
                  <th className="py-1.5 pr-3 font-semibold text-ink">Assignments</th>
                  <th className="py-1.5 font-semibold text-ink">Risk</th>
                </tr>
              </thead>
              <tbody>
                {SUBJECTS_WITH_RISK.map((s) => (
                  <tr key={s.id} className="border-b border-line last:border-0">
                    <td className="py-1.5 pr-3">{s.name}</td>
                    <td className="py-1.5 pr-3">{s.attendance}%</td>
                    <td className="py-1.5 pr-3">{s.marks}%</td>
                    <td className="py-1.5 pr-3">{s.quiz}%</td>
                    <td className="py-1.5 pr-3">{s.assignments}%</td>
                    <td className="py-1.5">{s.risk}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            Weakest subject: <strong>{weakest.name}</strong> ({weakest.attendance}% attendance,
            {weakest.marks}% marks).
          </p>
        </div>
      ),
    },
    {
      title: 'Action plan & weekly plan status',
      content: (
        <div className="space-y-2">
          <p>
            {recommendations.length > 0
              ? `${recDone} of ${recommendations.length} recommendations are complete; ${recommendations.length - recDone} remain open.`
              : 'No recommendations have been generated yet — run the risk analysis first.'}
          </p>
          <ul className="list-disc space-y-1 pl-5">
            {recommendations.map((r) => (
              <li key={r.id}>
                {r.title} — {r.priority} priority · {r.status} · {r.relatedSubject} · effort{' '}
                {r.estimatedEffort}
              </li>
            ))}
            {recommendations.length === 0 && <li>The action plan is currently empty.</li>}
          </ul>
          <p>
            Weekly learning plan: {tasksDone} of {learningTasks.length} tasks checked off.
          </p>
        </div>
      ),
    },
    {
      title: 'Outstanding assessments',
      content: (
        <div className="space-y-2">
          <p>
            {openAssessments.length} assessment{openAssessments.length === 1 ? '' : 's'} are still
            open{overdue.length > 0 ? `, including ${overdue.length} overdue item${overdue.length === 1 ? '' : 's'}` : ''}.
          </p>
          <ul className="list-disc space-y-1 pl-5">
            {openAssessments.map((a) => (
              <li key={a.id}>
                {a.title} ({a.subject}) — {a.type} · due {formatDate(a.dueDate)} · {dueLabel(a.dueDate)} ·{' '}
                {a.status}
              </li>
            ))}
            {openAssessments.length === 0 && <li>Everything on the assessment list is complete.</li>}
          </ul>
        </div>
      ),
    },
    {
      title: 'Recommended next steps',
      content: (
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            Bring {weakest.name} attendance above 75% — it is the single largest lever on the demo
            risk score.
          </li>
          <li>
            Clear the overdue submission ({overdue.length > 0 ? overdue[0]?.title : 'none outstanding'}) to
            restore assignment-completion credit.
          </li>
          <li>
            Complete the {openAssessments.length} open assessment
            {openAssessments.length === 1 ? '' : 's'} before their due dates and retake any quiz
            scored below 60%.
          </li>
          <li>
            Keep the weekly plan above 50% completion — steady study hours are a weighted input in
            the prediction.
          </li>
          <li>
            Re-run the risk analysis after two weeks of consistent attendance to see whether the
            demo score moves bands.
          </li>
        </ul>
      ),
    },
  ]

  return (
    <div className="space-y-5 sm:space-y-6">
      <ReportView
        title="Student Progress Report"
        subtitle="Attendance, performance, risk factors, action plan and outstanding work for the current semester."
        audience="Student"
        meta={meta}
        blocks={blocks}
      />
      <div className="no-print flex flex-wrap justify-center gap-2">
        <Button variant="outline" onClick={() => navigate('/student/progress')}>
          Back to progress
        </Button>
        <Button variant="ghost" onClick={() => navigate('/student/dashboard')}>
          Dashboard
        </Button>
      </div>
    </div>
  )
}
