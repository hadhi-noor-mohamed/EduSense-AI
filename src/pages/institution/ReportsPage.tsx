import { ReportView, type ReportBlock } from '../../components/shared/ReportView'
import {
  DEPARTMENT_PERFORMANCE,
  DROPOUT_RISK_TREND,
  SEMESTER_COMPARISON,
  STUDENTS,
  SUBJECT_RISK,
} from '../../data/seed'
import { formatDate } from '../../utils/format'

const INSTITUTION_NAME = 'SRM Institute of Technology'

export function ReportsPage() {
  const total = STUDENTS.length
  const highRisk = STUDENTS.filter((s) => s.risk === 'High')
  const mediumRisk = STUDENTS.filter((s) => s.risk === 'Medium')
  const avgPerformance = Math.round(STUDENTS.reduce((a, s) => a + s.overallPerformance, 0) / total)
  const avgAttendance = Math.round(STUDENTS.reduce((a, s) => a + s.attendance, 0) / total)

  const last = DROPOUT_RISK_TREND[DROPOUT_RISK_TREND.length - 1]
  const coverage = Math.round((last.intervened / last.flagged) * 100)

  const lowest = DEPARTMENT_PERFORMANCE.reduce((a, b) =>
    b.performance < a.performance ? b : a,
  )
  const riskiestSubject = SUBJECT_RISK.reduce((a, b) => (b.high > a.high ? b : a))
  const dropFrom = SEMESTER_COMPARISON[0]
  const dropTo = SEMESTER_COMPARISON[SEMESTER_COMPARISON.length - 1]
  const largestDrop = dropFrom.performance - dropTo.performance

  const blocks: ReportBlock[] = [
    {
      title: 'Institution overview',
      content: (
        <ul className="list-disc space-y-1 pl-5">
          <li>
            {INSTITUTION_NAME} currently tracks <strong>{total} students</strong> across{' '}
            <strong>{DEPARTMENT_PERFORMANCE.length} departments</strong> in this demo cohort.
          </li>
          <li>
            Average performance is <strong>{avgPerformance}%</strong> with average attendance at{' '}
            <strong>{avgAttendance}%</strong>.
          </li>
          <li>
            <strong>{highRisk.length} students are flagged High risk</strong> and{' '}
            <strong>{mediumRisk.length} are at Medium risk</strong> by the demo prediction service.
          </li>
          <li>
            Intervention coverage reached <strong>{coverage}%</strong> of flagged students in{' '}
            {last.month} ({last.intervened} of {last.flagged}).
          </li>
        </ul>
      ),
    },
    {
      title: 'Department performance',
      content: (
        <ul className="list-disc space-y-1 pl-5">
          {DEPARTMENT_PERFORMANCE.map((d) => (
            <li key={d.department}>
              <strong>{d.department}</strong> — performance {d.performance}%, attendance{' '}
              {d.attendance}%, {d.students} students in scope.
            </li>
          ))}
        </ul>
      ),
    },
    {
      title: 'Semester comparison',
      content: (
        <ul className="list-disc space-y-1 pl-5">
          {SEMESTER_COMPARISON.map((s) => (
            <li key={s.semester}>
              <strong>{s.semester}</strong> — performance {s.performance}%, attendance{' '}
              {s.attendance}%, completion {s.completion}%.
            </li>
          ))}
          <li>
            Largest recorded slide: <strong>{dropFrom.semester} → {dropTo.semester}</strong> with a{' '}
            {largestDrop} percentage-point drop in performance ({dropFrom.performance}% →{' '}
            {dropTo.performance}%).
          </li>
        </ul>
      ),
    },
    {
      title: 'At-risk student summary',
      content: (
        <div className="space-y-3">
          <ul className="list-disc space-y-1 pl-5">
            {[...highRisk]
              .sort((a, b) => b.riskScore - a.riskScore)
              .map((s) => (
                <li key={s.id}>
                  <strong>{s.name}</strong> ({s.rollNo}, {s.department}) — risk score{' '}
                  {s.riskScore}, top factor: {s.topFactor}, attendance {s.attendance}%.
                </li>
              ))}
            {highRisk.length === 0 && <li>No High-risk students in the current cohort.</li>}
          </ul>
          <p className="text-[13px] text-ink-muted">
            {mediumRisk.length} additional students sit at Medium risk and are on the watch list
            for the {last.month} review cycle.
          </p>
        </div>
      ),
    },
    {
      title: 'Recommended institutional actions',
      content: (
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Launch an attendance recovery drive in <strong>{lowest.department}</strong> — the
            lowest-performing department at {lowest.performance}% performance and{' '}
            {lowest.attendance}% attendance.
          </li>
          <li>
            Extend intervention coverage: <strong>{last.flagged - last.intervened} flagged
            students</strong> in {last.month} are still without an assigned intervention.
          </li>
          <li>
            Schedule additional tutoring for <strong>{riskiestSubject.subject}</strong>, where{' '}
            {riskiestSubject.high} students are at High risk.
          </li>
          <li>
            Review the {dropFrom.semester} → {dropTo.semester} performance slide ({largestDrop}{' '}
            points) with department heads and subject teachers.
          </li>
          <li>
            Continue the monthly risk review cycle and verify each High-risk student has a named
            mentor before the next assessment window.
          </li>
        </ul>
      ),
    },
  ]

  return (
    <ReportView
      title="Institutional Risk & Performance Report"
      subtitle="Cohort risk, department performance and intervention coverage for the current academic term. All values are demo seed data."
      audience="Institution"
      meta={[
        { label: 'Institution', value: INSTITUTION_NAME },
        { label: 'Students', value: `${total} in scope` },
        { label: 'Departments', value: String(DEPARTMENT_PERFORMANCE.length) },
        { label: 'At-risk students', value: `${highRisk.length} High · ${mediumRisk.length} Medium` },
        { label: 'Generated', value: formatDate(new Date().toISOString()) },
      ]}
      blocks={blocks}
    />
  )
}