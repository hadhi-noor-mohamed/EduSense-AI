import { ReportView, type ReportBlock } from '../../components/shared/ReportView'
import { useAppStore } from '../../store/useAppStore'
import { ASSESSMENTS, STUDENTS, SUBJECT_RISK, TEACHERS } from '../../data/seed'
import { daysUntil, formatDate } from '../../utils/format'
import { avgOf, followUpLabel, riskCounts, shortDept } from './teacherHelpers'

const TEACHER = TEACHERS[0]

export function ReportsPage() {
  const interventions = useAppStore((s) => s.interventions)

  const total = STUDENTS.length
  const counts = riskCounts(STUDENTS)
  const avgAttendance = avgOf(STUDENTS.map((s) => s.attendance))
  const avgPerformance = avgOf(STUDENTS.map((s) => s.overallPerformance))

  const highRisk = [...STUDENTS].filter((s) => s.risk === 'High').sort((a, b) => b.riskScore - a.riskScore)
  const openInterventions = interventions.filter((i) => i.status !== 'Completed')
  const riskiestSubject = SUBJECT_RISK.reduce((a, b) => (b.high > a.high ? b : a))
  const overdueAssessments = ASSESSMENTS.filter((a) => a.status === 'Overdue')
  const highWithoutPlan = highRisk.filter(
    (s) => !interventions.some((i) => i.studentId === s.id && i.status !== 'Completed'),
  )
  const dueSoon = openInterventions.filter(
    (i) => daysUntil(i.followUpDate) >= 0 && daysUntil(i.followUpDate) <= 7,
  )

  const blocks: ReportBlock[] = [
    {
      title: 'Cohort overview',
      content: (
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>{TEACHER.name}</strong> monitors <strong>{total} students</strong> in{' '}
            {TEACHER.subjects.join(' and ')} for this demo term.
          </li>
          <li>
            Cohort averages: attendance <strong>{avgAttendance}%</strong>, performance{' '}
            <strong>{avgPerformance}%</strong>.
          </li>
          <li>
            Risk split from the demo prediction service:{' '}
            <strong>{counts.High} High</strong> · <strong>{counts.Medium} Medium</strong> ·{' '}
            <strong>{counts.Low} Low</strong>.
          </li>
          <li>
            <strong>{openInterventions.length} interventions</strong> are open out of{' '}
            {interventions.length} logged overall.
          </li>
        </ul>
      ),
    },
    {
      title: 'High-risk students',
      content: (
        <p className="whitespace-pre-line">
          {highRisk
            .map(
              (s) =>
                `${s.name} — attendance ${s.attendance}% — risk score ${s.riskScore} — top factor: ${s.topFactor}`,
            )
            .join('\n') || 'No High-risk students in this cohort.'}
        </p>
      ),
    },
    {
      title: 'Subject risk summary',
      content: (
        <p className="whitespace-pre-line">
          {SUBJECT_RISK.map(
            (s) =>
              `${s.subject} — high ${s.high} · medium ${s.medium} · low ${s.low} (${s.high + s.medium + s.low} ratings)`,
          ).join('\n')}
        </p>
      ),
    },
    {
      title: 'Active interventions',
      content: (
        <p className="whitespace-pre-line">
          {interventions.length
            ? interventions
                .map(
                  (i) =>
                    `${i.studentName} — ${i.intervention} — status ${i.status} — follow-up ${formatDate(i.followUpDate)} (${followUpLabel(i.followUpDate)})`,
                )
                .join('\n')
            : 'No interventions have been logged yet.'}
        </p>
      ),
    },
    {
      title: 'Recommended next steps',
      content: (
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Meet the top three students by risk score ({highRisk.slice(0, 3).map((s) => s.name).join(', ') || 'none'}) in
            the coming week and record a note against each profile.
          </li>
          <li>
            Prioritise <strong>{riskiestSubject.subject}</strong> — it holds the most High-risk
            ratings ({riskiestSubject.high}) of any subject.
          </li>
          <li>
            {highWithoutPlan.length > 0
              ? `${highWithoutPlan.length} High-risk student(s) still have no open intervention: ${highWithoutPlan.map((s) => s.name).join(', ')}.`
              : 'Every High-risk student already has an open intervention — keep the follow-up schedule intact.'}
          </li>
          <li>
            {dueSoon.length} follow-up{dueSoon.length === 1 ? '' : 's'} fall due within the next 7
            days; {overdueAssessments.length} assessment{overdueAssessments.length === 1 ? ' is' : 's are'} overdue and
            need a submission chase before the next internal.
          </li>
        </ul>
      ),
    },
  ]

  return (
    <ReportView
      title="Class Risk & Intervention Report"
      subtitle="Cohort risk, subject-level exposure, active interventions and the recommended next steps for the current academic term."
      audience="Teacher"
      meta={[
        {
          label: 'Class',
          value: `${STUDENTS[0].course} ${shortDept(STUDENTS[0].department)} · ${STUDENTS[0].semester}`,
        },
        { label: 'Students', value: String(total) },
        { label: 'High risk', value: `${counts.High} students` },
        { label: 'Open interventions', value: String(openInterventions.length) },
        { label: 'Generated', value: formatDate(new Date().toISOString()) },
      ]}
      blocks={blocks}
    />
  )
}
